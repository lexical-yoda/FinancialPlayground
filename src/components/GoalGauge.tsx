import { motion } from 'motion/react';
import { AnimatedNumber } from './AnimatedNumber';
import { formatCompactINR } from '../utils/format';

interface Props {
  netWorth: number;
  goalAmount: number;
  goalMonthIndex: number | null;
  selectedIndex: number;
}

const SIZE = 260;
const STROKE = 16;
const RADIUS = SIZE / 2 - STROKE - 8;
const CENTER_X = SIZE / 2;
const CENTER_Y = SIZE / 2 + 6;

// Primary sweep (0-180deg) maps 0-100% of goal. Overshoot sweep extends past it,
// saturating at 3x goal, so the needle keeps meaning even once the goal is cleared.
const PRIMARY_SWEEP = 180;
const OVERSHOOT_SWEEP = 32;
const OVERSHOOT_SATURATION_MULTIPLE = 3;

function pointOnCircle(angleDeg: number, radius: number) {
  const rad = ((angleDeg - 180) * Math.PI) / 180;
  return {
    x: CENTER_X + radius * Math.cos(rad),
    y: CENTER_Y + radius * Math.sin(rad),
  };
}

function arcPath(startAngle: number, endAngle: number, radius: number) {
  const start = pointOnCircle(startAngle, radius);
  const end = pointOnCircle(endAngle, radius);
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

function angleForRatio(ratio: number): number {
  if (ratio <= 1) return ratio * PRIMARY_SWEEP;
  const overshootProgress = Math.min(1, (ratio - 1) / (OVERSHOOT_SATURATION_MULTIPLE - 1));
  return PRIMARY_SWEEP + overshootProgress * OVERSHOOT_SWEEP;
}

const PRIMARY_TICKS = [0, 20, 40, 60, 80, 100];

const NEEDLE_START = pointOnCircle(0, RADIUS - 6);

export function GoalGauge({ netWorth, goalAmount, goalMonthIndex, selectedIndex }: Props) {
  const ratio = goalAmount > 0 ? Math.max(0, netWorth / goalAmount) : 0;
  const isOvershoot = ratio > 1;
  const needleAngle = angleForRatio(ratio);
  const needleTip = pointOnCircle(needleAngle, RADIUS - 6);

  let statusLabel: string;
  if (goalMonthIndex == null) {
    statusLabel = 'goal not reached in projection window';
  } else if (selectedIndex >= goalMonthIndex) {
    const monthsSince = selectedIndex - goalMonthIndex;
    statusLabel = monthsSince === 0 ? 'goal cleared this month' : `goal cleared ~${(monthsSince / 12).toFixed(1)} yrs ago`;
  } else {
    const monthsUntil = goalMonthIndex - selectedIndex;
    statusLabel = `~${(monthsUntil / 12).toFixed(1)} yrs to goal from here`;
  }

  return (
    <div className="goal-gauge">
      <svg viewBox={`0 0 ${SIZE} ${SIZE / 2 + STROKE + 10}`} className="gauge-svg" role="img" aria-label="Goal progress gauge">
        <path d={arcPath(0, PRIMARY_SWEEP, RADIUS)} className="gauge-track" strokeWidth={STROKE} fill="none" />
        {isOvershoot && (
          <path
            d={arcPath(PRIMARY_SWEEP, PRIMARY_SWEEP + OVERSHOOT_SWEEP, RADIUS)}
            className="gauge-track-overshoot"
            strokeWidth={STROKE}
            fill="none"
          />
        )}

        <motion.path
          d={arcPath(0, Math.min(needleAngle, PRIMARY_SWEEP), RADIUS)}
          className="gauge-fill"
          strokeWidth={STROKE}
          fill="none"
          strokeLinecap="round"
        />
        {isOvershoot && (
          <motion.path
            d={arcPath(PRIMARY_SWEEP, needleAngle, RADIUS)}
            className="gauge-fill-overshoot"
            strokeWidth={STROKE}
            fill="none"
            strokeLinecap="round"
          />
        )}

        {PRIMARY_TICKS.map((pct) => {
          const angle = angleForRatio(pct / 100);
          const inner = pointOnCircle(angle, RADIUS - STROKE / 2 - 4);
          const outer = pointOnCircle(angle, RADIUS + STROKE / 2 + 4);
          return <line key={pct} x1={inner.x} y1={inner.y} x2={outer.x} y2={outer.y} className="gauge-tick" />;
        })}

        <motion.line
          x1={CENTER_X}
          y1={CENTER_Y}
          initial={{ x2: NEEDLE_START.x, y2: NEEDLE_START.y }}
          animate={{ x2: needleTip.x, y2: needleTip.y }}
          transition={{ type: 'spring', stiffness: 90, damping: 14 }}
          className="gauge-needle"
        />
        <circle cx={CENTER_X} cy={CENTER_Y} r={5} className="gauge-hub" />
        <motion.circle
          initial={{ cx: NEEDLE_START.x, cy: NEEDLE_START.y }}
          animate={{ cx: needleTip.x, cy: needleTip.y }}
          transition={{ type: 'spring', stiffness: 90, damping: 14 }}
          r={3.5}
          className="gauge-needle-tip"
        />
      </svg>

      <div className="gauge-readout">
        <div className="gauge-lcd">
          {isOvershoot ? (
            <AnimatedNumber value={ratio} format={(n) => `${n.toFixed(2)}×`} />
          ) : (
            <AnimatedNumber value={ratio * 100} format={(n) => `${Math.round(n)}%`} />
          )}
        </div>
        <div className="gauge-sub">
          <AnimatedNumber value={netWorth} format={formatCompactINR} /> / {formatCompactINR(goalAmount)}
        </div>
        <div className="gauge-years">{statusLabel}</div>
      </div>
    </div>
  );
}
