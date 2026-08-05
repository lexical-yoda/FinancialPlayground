import { formatCompactINR } from '../utils/format';

interface Props {
  currentNetWorth: number;
  goalAmount: number;
  goalMonthIndex: number | null;
}

const SIZE = 260;
const STROKE = 22;
const RADIUS = SIZE / 2 - STROKE;
const CENTER = SIZE / 2;

function polarToCartesian(angleDeg: number) {
  const angleRad = ((angleDeg - 180) * Math.PI) / 180;
  return {
    x: CENTER + RADIUS * Math.cos(angleRad),
    y: CENTER + RADIUS * Math.sin(angleRad),
  };
}

function arcPath(startAngle: number, endAngle: number) {
  const start = polarToCartesian(startAngle);
  const end = polarToCartesian(endAngle);
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
  return `M ${start.x} ${start.y} A ${RADIUS} ${RADIUS} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

export function GoalGauge({ currentNetWorth, goalAmount, goalMonthIndex }: Props) {
  const progress = goalAmount > 0 ? Math.min(1, Math.max(0, currentNetWorth / goalAmount)) : 0;
  const percent = Math.round(progress * 100);

  const years = goalMonthIndex != null ? (goalMonthIndex / 12).toFixed(1) : null;

  return (
    <div className="goal-gauge">
      <svg viewBox={`0 0 ${SIZE} ${SIZE / 2 + STROKE}`} className="gauge-svg" role="img" aria-label="Goal progress gauge">
        <path d={arcPath(0, 180)} className="gauge-track" strokeWidth={STROKE} fill="none" />
        <path d={arcPath(0, progress * 180)} className="gauge-fill" strokeWidth={STROKE} fill="none" strokeLinecap="round" />
      </svg>
      <div className="gauge-readout">
        <div className="gauge-percent">{percent}%</div>
        <div className="gauge-sub">
          {formatCompactINR(currentNetWorth)} / {formatCompactINR(goalAmount)}
        </div>
        <div className="gauge-years">{years ? `Goal reached in ~${years} yrs` : 'Goal not reached in projection window'}</div>
      </div>
    </div>
  );
}
