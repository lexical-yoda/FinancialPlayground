import type { OneOffEvent } from '../types/plan';
import { usePlanStore } from '../store/planStore';

export function OneOffRow({ event }: { event: OneOffEvent }) {
  const updateOneOffEvent = usePlanStore((s) => s.updateOneOffEvent);
  const removeOneOffEvent = usePlanStore((s) => s.removeOneOffEvent);

  return (
    <tr>
      <td>
        <input value={event.name} onChange={(e) => updateOneOffEvent(event.id, { name: e.target.value })} />
      </td>
      <td>
        <input
          type="number"
          value={event.amountPerMonth}
          onChange={(e) => updateOneOffEvent(event.id, { amountPerMonth: Number(e.target.value) })}
        />
      </td>
      <td>
        <input
          type="number"
          min={0}
          placeholder="off"
          value={event.startsInMonthIndex ?? ''}
          onChange={(e) =>
            updateOneOffEvent(event.id, {
              startsInMonthIndex: e.target.value === '' ? null : Number(e.target.value),
            })
          }
        />
      </td>
      <td>
        <input
          type="number"
          min={1}
          placeholder="forever"
          value={event.durationMonths ?? ''}
          onChange={(e) =>
            updateOneOffEvent(event.id, {
              durationMonths: e.target.value === '' ? null : Number(e.target.value),
            })
          }
        />
      </td>
      <td>
        <button className="row-remove" onClick={() => removeOneOffEvent(event.id)} aria-label="Remove one-off event">
          ✕
        </button>
      </td>
    </tr>
  );
}
