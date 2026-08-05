import { useMemo } from 'react';
import { usePlanStore } from '../store/planStore';
import { simulate } from '../engine/simulate';
import { StackedAreaChart } from '../components/StackedAreaChart';
import { GoalGauge } from '../components/GoalGauge';
import { YearlyTable } from '../components/YearlyTable';
import { TimeSlider } from '../components/TimeSlider';
import { categoryColors } from '../theme/categoryColors';

export function DashboardPage() {
  const config = usePlanStore((s) => s.config);
  const result = useMemo(() => simulate(config), [config]);

  const latestSnapshot = result.monthlySnapshots[result.monthlySnapshots.length - 1];
  const currentNetWorth = latestSnapshot ? latestSnapshot.netWorth : 0;

  return (
    <div className="dashboard-page">
      <div className="dashboard-top">
        <GoalGauge currentNetWorth={currentNetWorth} goalAmount={config.goalAmount} goalMonthIndex={result.goalMonthIndex} />
        <div className="legend">
          {config.assets.map((a) => (
            <div key={a.id} className="legend-item">
              <span className="legend-swatch" style={{ background: categoryColors[a.category] }} />
              {a.name}
            </div>
          ))}
          {config.liabilities.map((l) => (
            <div key={l.id} className="legend-item">
              <span className="legend-swatch legend-swatch--liability" />
              {l.name} (liability)
            </div>
          ))}
        </div>
      </div>

      <StackedAreaChart
        snapshots={result.monthlySnapshots}
        assets={config.assets}
        liabilities={config.liabilities}
        goalAmount={config.goalAmount}
      />

      <TimeSlider
        snapshots={result.monthlySnapshots}
        assets={config.assets}
        liabilities={config.liabilities}
        goalAmount={config.goalAmount}
        goalMonthIndex={result.goalMonthIndex}
      />

      <YearlyTable rollups={result.yearlyRollups} assets={config.assets} liabilities={config.liabilities} />
    </div>
  );
}
