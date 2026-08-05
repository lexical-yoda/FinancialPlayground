import type { Asset, Liability } from '../types/plan';
import type { YearlyRollup } from '../engine/simulate';
import { formatCompactINR } from '../utils/format';

interface Props {
  rollups: YearlyRollup[];
  assets: Asset[];
  liabilities: Liability[];
}

export function YearlyTable({ rollups, assets, liabilities }: Props) {
  return (
    <div className="yearly-table-wrap">
      <table className="yearly-table">
        <thead>
          <tr>
            <th>Year</th>
            {assets.map((a) => (
              <th key={a.id}>{a.name}</th>
            ))}
            {liabilities.map((l) => (
              <th key={l.id} className="liability-col">
                {l.name}
              </th>
            ))}
            <th className="net-worth-col">Net worth</th>
          </tr>
        </thead>
        <tbody>
          {rollups.map((row) => (
            <tr key={row.year}>
              <td>{row.year}</td>
              {assets.map((a) => (
                <td key={a.id}>{formatCompactINR(row.perAssetBalances[a.id] ?? 0)}</td>
              ))}
              {liabilities.map((l) => (
                <td key={l.id} className="liability-col">
                  {formatCompactINR(row.perLiabilityBalances[l.id] ?? 0)}
                </td>
              ))}
              <td className="net-worth-col">{formatCompactINR(row.netWorth)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
