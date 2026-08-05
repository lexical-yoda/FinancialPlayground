import { motion } from 'motion/react';
import type { OneOffEvent } from '../types/plan';
import { usePlanStore } from '../store/planStore';

export function OneOffRow({ event }: { event: OneOffEvent }) {
  const updateOneOffEvent = usePlanStore((s) => s.updateOneOffEvent);
  const removeOneOffEvent = usePlanStore((s) => s.removeOneOffEvent);

  return (
    <motion.tr
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
    >
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
    </motion.tr>
  );
}
