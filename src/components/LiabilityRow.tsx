import { motion } from 'motion/react';
import type { PrepaymentRule } from '../types/plan';
import type { Liability } from '../types/plan';
import { usePlanStore } from '../store/planStore';

export function LiabilityRow({ liability }: { liability: Liability }) {
  const updateLiability = usePlanStore((s) => s.updateLiability);
  const removeLiability = usePlanStore((s) => s.removeLiability);

  const patchRule = (patch: Partial<PrepaymentRule>) =>
    updateLiability(liability.id, { prepaymentRule: { ...liability.prepaymentRule, ...patch } });

  return (
    <motion.div
      layout
      className="entity-row"
      initial={{ opacity: 0, y: -12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.98 }}
      transition={{ duration: 0.22 }}
    >
      <div className="entity-row-main">
        <input value={liability.name} onChange={(e) => updateLiability(liability.id, { name: e.target.value })} className="row-name" />
        <label>
          Principal / remaining
          <input
            type="number"
            value={liability.principal}
            onChange={(e) => updateLiability(liability.id, { principal: Number(e.target.value) })}
          />
        </label>
        <label>
          Annual interest %
          <input
            type="number"
            step="0.1"
            value={liability.annualInterestPct}
            onChange={(e) => updateLiability(liability.id, { annualInterestPct: Number(e.target.value) })}
          />
        </label>
        <label>
          Tenure (months)
          <input
            type="number"
            value={liability.tenureMonths}
            onChange={(e) => updateLiability(liability.id, { tenureMonths: Number(e.target.value) })}
          />
        </label>
        <label>
          Months already paid
          <input
            type="number"
            value={liability.monthsAlreadyPaid}
            onChange={(e) => updateLiability(liability.id, { monthsAlreadyPaid: Number(e.target.value) })}
          />
        </label>
        <label>
          Starts in month #
          <input
            type="number"
            min={0}
            value={liability.startsInMonthIndex}
            onChange={(e) => updateLiability(liability.id, { startsInMonthIndex: Number(e.target.value) })}
          />
        </label>
        <button className="row-remove" onClick={() => removeLiability(liability.id)} aria-label="Remove liability">
          ✕
        </button>
      </div>

      <div className="entity-row-contribution">
        <label>
          Prepayment
          <select value={liability.prepaymentRule.mode} onChange={(e) => patchRule({ mode: e.target.value as PrepaymentRule['mode'] })}>
            <option value="none">No prepayment</option>
            <option value="fixed_extra">Fixed extra amount every month</option>
            <option value="surplus_share">Gets a share of monthly surplus</option>
          </select>
        </label>

        {liability.prepaymentRule.mode === 'fixed_extra' && (
          <label>
            Extra amount / month
            <input
              type="number"
              value={liability.prepaymentRule.amount ?? 0}
              onChange={(e) => patchRule({ amount: Number(e.target.value) })}
            />
          </label>
        )}

        {liability.prepaymentRule.mode === 'surplus_share' && (
          <label>
            Surplus share %
            <input
              type="number"
              value={liability.prepaymentRule.surplusSharePct ?? 0}
              onChange={(e) => patchRule({ surplusSharePct: Number(e.target.value) })}
            />
          </label>
        )}
      </div>
    </motion.div>
  );
}
