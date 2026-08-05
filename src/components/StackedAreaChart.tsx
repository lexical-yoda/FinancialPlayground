import { useMemo, useState } from 'react';
import type { Asset, Liability } from '../types/plan';
import type { MonthlySnapshot } from '../engine/simulate';
import { categoryColors, liabilityColor, netWorthLineColor } from '../theme/categoryColors';
import { formatCompactINR, monthLabel } from '../utils/format';

interface Props {
  snapshots: MonthlySnapshot[];
  assets: Asset[];
  liabilities: Liability[];
  goalAmount: number;
}

const WIDTH = 900;
const HEIGHT = 420;
const PAD_LEFT = 70;
const PAD_RIGHT = 20;
const PAD_TOP = 20;
const PAD_BOTTOM = 36;

export function StackedAreaChart({ snapshots, assets, liabilities, goalAmount }: Props) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const { assetTop, liabilityBottom, netWorthPoints, yMax, yMin, xForIndex, yForValue, chartWidth } = useMemo(() => {
    const n = snapshots.length;
    const assetCum: number[][] = snapshots.map((s) => {
      let running = 0;
      return assets.map((a) => (running += s.perAssetBalances[a.id] ?? 0));
    });
    const liabilityCum: number[][] = snapshots.map((s) => {
      let running = 0;
      return liabilities.map((l) => (running += s.perLiabilityBalances[l.id] ?? 0));
    });

    const maxAssetTotal = Math.max(
      goalAmount,
      ...assetCum.map((row) => row[row.length - 1] ?? 0),
      ...snapshots.map((s) => s.netWorth),
      1,
    );
    const maxLiabilityTotal = Math.max(0, ...liabilityCum.map((row) => row[row.length - 1] ?? 0));

    const chartWidth = WIDTH - PAD_LEFT - PAD_RIGHT;
    const chartHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;

    const yMax = maxAssetTotal * 1.08;
    const yMin = -maxLiabilityTotal * 1.15;
    const yRange = yMax - yMin || 1;

    const xForIndex = (i: number) => PAD_LEFT + (n <= 1 ? 0 : (i / (n - 1)) * chartWidth);
    const yForValue = (v: number) => PAD_TOP + (1 - (v - yMin) / yRange) * chartHeight;

    return {
      assetTop: assetCum,
      liabilityBottom: liabilityCum,
      netWorthPoints: snapshots.map((s) => s.netWorth),
      yMax,
      yMin,
      xForIndex,
      yForValue,
      chartWidth,
    };
  }, [snapshots, assets, liabilities, goalAmount]);

  if (snapshots.length === 0) {
    return <div className="chart-empty">No data to chart yet — add an asset on the Setup page.</div>;
  }

  const n = snapshots.length;

  const handleMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const frac = (e.clientX - rect.left) / rect.width;
    const svgX = frac * WIDTH;
    const raw = ((svgX - PAD_LEFT) / chartWidth) * (n - 1);
    const idx = Math.min(n - 1, Math.max(0, Math.round(raw)));
    setHoverIndex(idx);
  };

  const assetBands = assets.map((asset, assetIdx) => {
    const topPath = snapshots.map((_, i) => `${i === 0 ? 'M' : 'L'} ${xForIndex(i)} ${yForValue(assetTop[i][assetIdx])}`).join(' ');
    const bottomPath = snapshots
      .map((_, i) => i)
      .reverse()
      .map((i) => `L ${xForIndex(i)} ${yForValue(assetIdx === 0 ? 0 : assetTop[i][assetIdx - 1])}`)
      .join(' ');
    return { id: asset.id, name: asset.name, color: categoryColors[asset.category], d: `${topPath} ${bottomPath} Z` };
  });

  const liabilityBands = liabilities.map((liability, liabIdx) => {
    const topPath = snapshots
      .map((_, i) => `${i === 0 ? 'M' : 'L'} ${xForIndex(i)} ${yForValue(-(liabIdx === 0 ? 0 : liabilityBottom[i][liabIdx - 1]))}`)
      .join(' ');
    const bottomPath = snapshots
      .map((_, i) => i)
      .reverse()
      .map((i) => `L ${xForIndex(i)} ${yForValue(-liabilityBottom[i][liabIdx])}`)
      .join(' ');
    return { id: liability.id, name: liability.name, d: `${topPath} ${bottomPath} Z` };
  });

  const netWorthPath = netWorthPoints.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xForIndex(i)} ${yForValue(v)}`).join(' ');
  const zeroY = yForValue(0);
  const goalY = yForValue(goalAmount);

  const yTicks = 5;
  const tickValues = Array.from({ length: yTicks + 1 }, (_, i) => yMin + ((yMax - yMin) * i) / yTicks);

  const yearIndices: number[] = [];
  snapshots.forEach((s, i) => {
    if (s.month === snapshots[0].month || i === 0) yearIndices.push(i);
  });

  const hover = hoverIndex != null ? snapshots[hoverIndex] : null;
  const hoverX = hoverIndex != null ? xForIndex(hoverIndex) : 0;
  const tooltipLeftPct = (hoverX / WIDTH) * 100;
  const tooltipAlign = tooltipLeftPct > 70 ? 'right' : tooltipLeftPct < 15 ? 'left' : 'center';

  return (
    <div className="chart-wrap">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="stacked-chart"
        role="img"
        aria-label="Net worth projection chart"
        onMouseMove={handleMove}
        onMouseLeave={() => setHoverIndex(null)}
      >
        {tickValues.map((v, i) => (
          <g key={i}>
            <line x1={PAD_LEFT} x2={WIDTH - PAD_RIGHT} y1={yForValue(v)} y2={yForValue(v)} className="grid-line" />
            <text x={PAD_LEFT - 8} y={yForValue(v) + 4} textAnchor="end" className="axis-label">
              {formatCompactINR(v)}
            </text>
          </g>
        ))}

        {liabilityBands.map((band) => (
          <path key={band.id} d={band.d} fill={liabilityColor} fillOpacity={0.55} stroke="none" />
        ))}

        {assetBands.map((band) => (
          <path key={band.id} d={band.d} fill={band.color} fillOpacity={0.7} stroke={band.color} strokeWidth={0.5} />
        ))}

        <line x1={PAD_LEFT} x2={WIDTH - PAD_RIGHT} y1={zeroY} y2={zeroY} className="zero-line" />

        {goalAmount > 0 && goalY >= PAD_TOP && (
          <g>
            <line x1={PAD_LEFT} x2={WIDTH - PAD_RIGHT} y1={goalY} y2={goalY} className="goal-line" />
            <text x={WIDTH - PAD_RIGHT} y={goalY - 6} textAnchor="end" className="goal-label">
              Goal
            </text>
          </g>
        )}

        <path d={netWorthPath} fill="none" stroke={netWorthLineColor} strokeWidth={2} />

        {yearIndices.map((i) => (
          <text key={i} x={xForIndex(i)} y={HEIGHT - PAD_BOTTOM + 18} textAnchor="middle" className="axis-label">
            {monthLabel(snapshots[i].year, snapshots[i].month)}
          </text>
        ))}

        {hover && (
          <g className="hover-guide" pointerEvents="none">
            <line x1={hoverX} x2={hoverX} y1={PAD_TOP} y2={HEIGHT - PAD_BOTTOM} className="hover-line" />
            <circle cx={hoverX} cy={yForValue(hover.netWorth)} r={4} className="hover-dot" />
            {assets.map((a, idx) => (
              <circle key={a.id} cx={hoverX} cy={yForValue(assetTop[hoverIndex!][idx])} r={2.5} fill={categoryColors[a.category]} />
            ))}
          </g>
        )}
      </svg>

      {hover && (
        <div className={`chart-tooltip chart-tooltip--${tooltipAlign}`} style={{ left: `${tooltipLeftPct}%` }}>
          <div className="chart-tooltip-date">{monthLabel(hover.year, hover.month)}</div>
          {assets.map((a) => (
            <div key={a.id} className="chart-tooltip-row">
              <span className="chart-tooltip-swatch" style={{ background: categoryColors[a.category] }} />
              <span className="chart-tooltip-name">{a.name}</span>
              <span className="chart-tooltip-value">{formatCompactINR(hover.perAssetBalances[a.id] ?? 0)}</span>
            </div>
          ))}
          {liabilities.map((l) => (
            <div key={l.id} className="chart-tooltip-row">
              <span className="chart-tooltip-swatch" style={{ background: liabilityColor }} />
              <span className="chart-tooltip-name">{l.name}</span>
              <span className="chart-tooltip-value chart-tooltip-value--liability">
                -{formatCompactINR(hover.perLiabilityBalances[l.id] ?? 0)}
              </span>
            </div>
          ))}
          <div className="chart-tooltip-row chart-tooltip-row--total">
            <span className="chart-tooltip-name">Net worth</span>
            <span className="chart-tooltip-value">{formatCompactINR(hover.netWorth)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
