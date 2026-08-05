import { motion } from 'motion/react';
import type { ExpenseStream } from '../types/plan';
import { usePlanStore } from '../store/planStore';

export function ExpenseRow({ expense }: { expense: ExpenseStream }) {
  const updateExpenseStream = usePlanStore((s) => s.updateExpenseStream);
  const removeExpenseStream = usePlanStore((s) => s.removeExpenseStream);

  return (
    <motion.tr
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
    >
      <td>
        <input value={expense.name} onChange={(e) => updateExpenseStream(expense.id, { name: e.target.value })} />
      </td>
      <td>
        <input
          type="number"
          value={expense.monthlyAmount}
          onChange={(e) => updateExpenseStream(expense.id, { monthlyAmount: Number(e.target.value) })}
        />
      </td>
      <td>
        <input
          type="number"
          value={expense.annualGrowthPct}
          onChange={(e) => updateExpenseStream(expense.id, { annualGrowthPct: Number(e.target.value) })}
        />
      </td>
      <td>
        <select
          value={expense.recurrence}
          onChange={(e) => updateExpenseStream(expense.id, { recurrence: e.target.value as ExpenseStream['recurrence'] })}
        >
          <option value="monthly">Monthly</option>
          <option value="annual_once">Once a year</option>
        </select>
      </td>
      <td>
        {expense.recurrence === 'annual_once' && (
          <input
            type="number"
            min={1}
            max={12}
            placeholder="Month"
            value={expense.month ?? ''}
            onChange={(e) => updateExpenseStream(expense.id, { month: Number(e.target.value) })}
          />
        )}
      </td>
      <td>
        <button className="row-remove" onClick={() => removeExpenseStream(expense.id)} aria-label="Remove expense stream">
          ✕
        </button>
      </td>
    </motion.tr>
  );
}
