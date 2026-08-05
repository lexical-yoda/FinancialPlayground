import { motion } from 'motion/react';
import type { Asset, Liability } from '../types/plan';
import type { MonthlySnapshot } from '../engine/simulate';
import { categoryColors, liabilityColor } from '../theme/categoryColors';
import { AnimatedNumber } from './AnimatedNumber';
import { HudFrame } from './HudFrame';
import { formatCompactINR, monthLabel } from '../utils/format';

interface Props {
  snapshots: MonthlySnapshot[];
  assets: Asset[];
  liabilities: Liability[];
  goalAmount: number;
  goalMonthIndex: number | null;
  index: number;
  onIndexChange: (index: number) => void;
}

export function TimeSlider({ snapshots, assets, liabilities, goalAmount, goalMonthIndex, index, onIndexChange }: Props) {
  if (snapshots.length === 0) return null;

  const clampedIndex = Math.min(index, snapshots.length - 1);
  const snapshot = snapshots[clampedIndex];
  const yearsElapsed = (clampedIndex / 12).toFixed(1);
  const goalPct = goalAmount > 0 ? Math.round(Math.min(1, Math.max(0, snapshot.netWorth / goalAmount)) * 100) : 0;

  const totalAssetValue = assets.reduce((sum, a) => sum + (snapshot.perAssetBalances[a.id] ?? 0), 0);
  const allocations = assets.map((a) => {
    const balance = snapshot.perAssetBalances[a.id] ?? 0;
    const pct = totalAssetValue > 0 ? (balance / totalAssetValue) * 100 : 0;
    return { asset: a, balance, pct };
  });

  const surplusTargets = [
    ...assets
      .filter((a) => a.contributionRule.mode === 'surplus_share')
      .map((a) => ({ name: a.name, color: categoryColors[a.category], pct: a.contributionRule.surplusSharePct ?? 0 })),
    ...liabilities
      .filter((l) => l.prepaymentRule.mode === 'surplus_share')
      .map((l) => ({ name: `${l.name} (prepay)`, color: liabilityColor, pct: l.prepaymentRule.surplusSharePct ?? 0 })),
  ];
  const surplusPoolTotal = surplusTargets.reduce((sum, t) => sum + t.pct, 0);

  const fixedTargets = assets.filter((a) => a.contributionRule.mode === 'fixed_recurring');

  let remainingLabel: string;
  if (goalMonthIndex == null) {
    remainingLabel = 'goal not reached in projection window';
  } else if (clampedIndex >= goalMonthIndex) {
    remainingLabel = 'goal already reached at this point';
  } else {
    const remainingMonths = goalMonthIndex - clampedIndex;
    const remainingYears = (remainingMonths / 12).toFixed(1);
    remainingLabel = `~${remainingYears} yrs to goal from here`;
  }

  return (
    <HudFrame className="time-slider">
      <div className="time-slider-header">
        <h2>Scrub through time</h2>
        <div className="time-slider-readout">
          {monthLabel(snapshot.year, snapshot.month)} · {yearsElapsed} yrs in
        </div>
      </div>

      <input
        type="range"
        min={0}
        max={snapshots.length - 1}
        value={clampedIndex}
        onChange={(e) => onIndexChange(Number(e.target.value))}
        className="time-slider-input"
      />

      <div className="time-slider-stats">
        <div className="time-slider-stat">
          <span className="time-slider-stat-label">Progress to goal</span>
          <span className="time-slider-stat-value">
            <AnimatedNumber value={goalPct} format={(n) => `${Math.round(n)}%`} />
          </span>
        </div>
        <div className="time-slider-progress-track">
          <motion.div
            className="time-slider-progress-fill"
            animate={{ width: `${Math.min(100, goalPct)}%` }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
          />
        </div>
        <div className="time-slider-stat">
          <span className="time-slider-stat-label">Time remaining</span>
          <span className="time-slider-stat-value time-slider-stat-value--muted">{remainingLabel}</span>
        </div>
      </div>

      <div className="time-slider-values">
        {assets.map((a) => {
          const alloc = allocations.find((x) => x.asset.id === a.id)!;
          return (
            <div key={a.id} className="time-slider-value">
              <span className="chart-tooltip-swatch" style={{ background: categoryColors[a.category] }} />
              <span className="time-slider-value-name">{a.name}</span>
              <span className="time-slider-value-pct">
                <AnimatedNumber value={alloc.pct} format={(n) => `${n.toFixed(0)}%`} />
              </span>
              <span className="time-slider-value-amount">
                <AnimatedNumber value={alloc.balance} format={formatCompactINR} />
              </span>
            </div>
          );
        })}
        {liabilities.map((l) => (
          <div key={l.id} className="time-slider-value">
            <span className="chart-tooltip-swatch" style={{ background: liabilityColor }} />
            <span className="time-slider-value-name">{l.name}</span>
            <span className="time-slider-value-pct" />
            <span className="time-slider-value-amount chart-tooltip-value--liability">
              <AnimatedNumber value={snapshot.perLiabilityBalances[l.id] ?? 0} format={(n) => `-${formatCompactINR(n)}`} />
            </span>
          </div>
        ))}
        <div className="time-slider-value time-slider-value--total">
          <span className="time-slider-value-name">Net worth</span>
          <span className="time-slider-value-amount">
            <AnimatedNumber value={snapshot.netWorth} format={formatCompactINR} />
          </span>
        </div>
      </div>

      {totalAssetValue > 0 && (
        <div className="allocation-bar" title="Current split of invested money across buckets">
          {allocations
            .filter((a) => a.pct > 0)
            .map((a) => (
              <motion.div
                key={a.asset.id}
                className="allocation-segment"
                animate={{ width: `${a.pct}%` }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as const }}
                style={{ background: categoryColors[a.asset.category] }}
              />
            ))}
        </div>
      )}

      {(surplusTargets.length > 0 || fixedTargets.length > 0) && (
        <div className="surplus-splits">
          <div className="surplus-splits-title">Where new money goes</div>
          {surplusTargets.length > 0 && (
            <div className="surplus-splits-row">
              <span className="surplus-splits-label">Surplus cash split{surplusPoolTotal !== 100 ? ' (normalized)' : ''}:</span>
              {surplusTargets.map((t) => (
                <span key={t.name} className="surplus-split-chip">
                  <span className="chart-tooltip-swatch" style={{ background: t.color }} />
                  {t.name} {surplusPoolTotal > 0 ? Math.round((t.pct / surplusPoolTotal) * 100) : 0}%
                </span>
              ))}
            </div>
          )}
          {fixedTargets.map((a) => (
            <div key={a.id} className="surplus-splits-row">
              <span className="surplus-splits-label">Fixed top-up:</span>
              <span className="surplus-split-chip">
                <span className="chart-tooltip-swatch" style={{ background: categoryColors[a.category] }} />
                {a.name} — {formatCompactINR(a.contributionRule.fixedAmount ?? 0)} / {a.contributionRule.frequency}
              </span>
            </div>
          ))}
        </div>
      )}
    </HudFrame>
  );
}
