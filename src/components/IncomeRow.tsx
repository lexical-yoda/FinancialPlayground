import type { IncomeStream } from '../types/plan';
import { usePlanStore } from '../store/planStore';

export function IncomeRow({ income }: { income: IncomeStream }) {
  const updateIncomeStream = usePlanStore((s) => s.updateIncomeStream);
  const removeIncomeStream = usePlanStore((s) => s.removeIncomeStream);

  return (
    <tr>
      <td>
        <input value={income.name} onChange={(e) => updateIncomeStream(income.id, { name: e.target.value })} />
      </td>
      <td>
        <input
          type="number"
          value={income.monthlyAmount}
          onChange={(e) => updateIncomeStream(income.id, { monthlyAmount: Number(e.target.value) })}
        />
      </td>
      <td>
        <input
          type="number"
          value={income.annualHikePct}
          onChange={(e) => updateIncomeStream(income.id, { annualHikePct: Number(e.target.value) })}
        />
      </td>
      <td>
        <input
          type="number"
          min={1}
          max={12}
          value={income.hikeMonth}
          onChange={(e) => updateIncomeStream(income.id, { hikeMonth: Number(e.target.value) })}
        />
      </td>
      <td>
        <button className="row-remove" onClick={() => removeIncomeStream(income.id)} aria-label="Remove income stream">
          ✕
        </button>
      </td>
    </tr>
  );
}
