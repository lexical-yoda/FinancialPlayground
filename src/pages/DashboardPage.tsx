import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { usePlanStore } from '../store/planStore';
import { simulate } from '../engine/simulate';
import { StackedAreaChart } from '../components/StackedAreaChart';
import { GoalGauge } from '../components/GoalGauge';
import { YearlyTable } from '../components/YearlyTable';
import { TimeSlider } from '../components/TimeSlider';
import { HudFrame } from '../components/HudFrame';
import { categoryColors } from '../theme/categoryColors';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as const } },
};

export function DashboardPage() {
  const config = usePlanStore((s) => s.config);
  const result = useMemo(() => simulate(config), [config]);
  const lastIndex = Math.max(0, result.monthlySnapshots.length - 1);

  const [index, setIndex] = useState(lastIndex);
  const clampedIndex = Math.min(index, lastIndex);
  const selectedSnapshot = result.monthlySnapshots[clampedIndex];

  return (
    <motion.div className="dashboard-page" initial="hidden" animate="show" variants={container}>
      <motion.div variants={item}>
        <HudFrame className="dashboard-top">
          <GoalGauge
            netWorth={selectedSnapshot ? selectedSnapshot.netWorth : 0}
            goalAmount={config.goalAmount}
            goalMonthIndex={result.goalMonthIndex}
            selectedIndex={clampedIndex}
          />
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
        </HudFrame>
      </motion.div>

      <motion.div variants={item}>
        <StackedAreaChart
          snapshots={result.monthlySnapshots}
          assets={config.assets}
          liabilities={config.liabilities}
          goalAmount={config.goalAmount}
        />
      </motion.div>

      <motion.div variants={item}>
        <TimeSlider
          snapshots={result.monthlySnapshots}
          assets={config.assets}
          liabilities={config.liabilities}
          goalAmount={config.goalAmount}
          goalMonthIndex={result.goalMonthIndex}
          index={clampedIndex}
          onIndexChange={setIndex}
        />
      </motion.div>

      <motion.div variants={item}>
        <YearlyTable rollups={result.yearlyRollups} assets={config.assets} liabilities={config.liabilities} />
      </motion.div>
    </motion.div>
  );
}
