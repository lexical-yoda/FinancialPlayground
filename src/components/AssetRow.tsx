import { motion } from 'motion/react';
import type { Asset, AssetCategory, ContributionRule } from '../types/plan';
import { usePlanStore } from '../store/planStore';

const categories: AssetCategory[] = ['equity', 'gold', 'fd', 'cash', 'bond', 'crypto', 'real_estate', 'other'];

export function AssetRow({ asset }: { asset: Asset }) {
  const updateAsset = usePlanStore((s) => s.updateAsset);
  const removeAsset = usePlanStore((s) => s.removeAsset);

  const patchRule = (patch: Partial<ContributionRule>) =>
    updateAsset(asset.id, { contributionRule: { ...asset.contributionRule, ...patch } });

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
        <input value={asset.name} onChange={(e) => updateAsset(asset.id, { name: e.target.value })} className="row-name" />
        <select value={asset.category} onChange={(e) => updateAsset(asset.id, { category: e.target.value as AssetCategory })}>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c.replace('_', ' ')}
            </option>
          ))}
        </select>
        <label>
          Starting balance
          <input
            type="number"
            value={asset.startingBalance}
            onChange={(e) => updateAsset(asset.id, { startingBalance: Number(e.target.value) })}
          />
        </label>
        <label>
          Annual return %
          <input
            type="number"
            step="0.1"
            value={asset.annualReturnPct}
            onChange={(e) => updateAsset(asset.id, { annualReturnPct: Number(e.target.value) })}
          />
        </label>
        <label>
          Compounding
          <select
            value={asset.compounding}
            onChange={(e) => updateAsset(asset.id, { compounding: e.target.value as Asset['compounding'] })}
          >
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="annually">Annually</option>
          </select>
        </label>
        <label>
          Liquidity
          <select value={asset.liquidity} onChange={(e) => updateAsset(asset.id, { liquidity: e.target.value as Asset['liquidity'] })}>
            <option value="liquid">Liquid</option>
            <option value="locked">Locked</option>
          </select>
        </label>
        <button className="row-remove" onClick={() => removeAsset(asset.id)} aria-label="Remove asset">
          ✕
        </button>
      </div>

      <div className="entity-row-contribution">
        <label>
          Contribution
          <select value={asset.contributionRule.mode} onChange={(e) => patchRule({ mode: e.target.value as ContributionRule['mode'] })}>
            <option value="none">No further contributions</option>
            <option value="surplus_share">Gets a share of monthly surplus</option>
            <option value="fixed_recurring">Fixed recurring contribution</option>
          </select>
        </label>

        {asset.contributionRule.mode === 'surplus_share' && (
          <label>
            Surplus share %
            <input
              type="number"
              value={asset.contributionRule.surplusSharePct ?? 0}
              onChange={(e) => patchRule({ surplusSharePct: Number(e.target.value) })}
            />
          </label>
        )}

        {asset.contributionRule.mode === 'fixed_recurring' && (
          <>
            <label>
              Amount
              <input
                type="number"
                value={asset.contributionRule.fixedAmount ?? 0}
                onChange={(e) => patchRule({ fixedAmount: Number(e.target.value) })}
              />
            </label>
            <label>
              Frequency
              <select
                value={asset.contributionRule.frequency ?? 'monthly'}
                onChange={(e) => patchRule({ frequency: e.target.value as ContributionRule['frequency'] })}
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annually">Annually</option>
              </select>
            </label>
            <label>
              Cap (optional)
              <input
                type="number"
                placeholder="no cap"
                value={asset.contributionRule.capAmount ?? ''}
                onChange={(e) => patchRule({ capAmount: e.target.value === '' ? undefined : Number(e.target.value) })}
              />
            </label>
          </>
        )}
      </div>
    </motion.div>
  );
}
