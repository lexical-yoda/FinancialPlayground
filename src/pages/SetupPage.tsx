import { AnimatePresence } from 'motion/react';
import { usePlanStore } from '../store/planStore';
import { AssetRow } from '../components/AssetRow';
import { LiabilityRow } from '../components/LiabilityRow';
import { IncomeRow } from '../components/IncomeRow';
import { ExpenseRow } from '../components/ExpenseRow';
import { OneOffRow } from '../components/OneOffRow';

export function SetupPage() {
  const config = usePlanStore((s) => s.config);
  const setStartDate = usePlanStore((s) => s.setStartDate);
  const setGoalAmount = usePlanStore((s) => s.setGoalAmount);
  const setProjectionYears = usePlanStore((s) => s.setProjectionYears);
  const addAsset = usePlanStore((s) => s.addAsset);
  const addLiability = usePlanStore((s) => s.addLiability);
  const addIncomeStream = usePlanStore((s) => s.addIncomeStream);
  const addExpenseStream = usePlanStore((s) => s.addExpenseStream);
  const addOneOffEvent = usePlanStore((s) => s.addOneOffEvent);

  const surplusSharePool =
    config.assets.filter((a) => a.contributionRule.mode === 'surplus_share').reduce((sum, a) => sum + (a.contributionRule.surplusSharePct ?? 0), 0) +
    config.liabilities
      .filter((l) => l.prepaymentRule.mode === 'surplus_share')
      .reduce((sum, l) => sum + (l.prepaymentRule.surplusSharePct ?? 0), 0);
  const hasSurplusTargets =
    config.assets.some((a) => a.contributionRule.mode === 'surplus_share') ||
    config.liabilities.some((l) => l.prepaymentRule.mode === 'surplus_share');
  const surplusMismatch = hasSurplusTargets && Math.round(surplusSharePool) !== 100;

  return (
    <div className="setup-page">
      <section className="setup-section">
        <h2>Plan basics</h2>
        <div className="basics-row">
          <label>
            Start year
            <input type="number" value={config.startYear} onChange={(e) => setStartDate(Number(e.target.value), config.startMonth)} />
          </label>
          <label>
            Start month
            <input
              type="number"
              min={1}
              max={12}
              value={config.startMonth}
              onChange={(e) => setStartDate(config.startYear, Number(e.target.value))}
            />
          </label>
          <label>
            Goal amount (₹)
            <input type="number" value={config.goalAmount} onChange={(e) => setGoalAmount(Number(e.target.value))} />
          </label>
          <label>
            Projection years
            <input type="number" value={config.projectionYears} onChange={(e) => setProjectionYears(Number(e.target.value))} />
          </label>
        </div>
      </section>

      <section className="setup-section">
        <h2>Income streams</h2>
        <table className="stream-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Monthly amount</th>
              <th>Annual hike %</th>
              <th>Hike month</th>
              <th />
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {config.incomeStreams.map((income) => (
                <IncomeRow key={income.id} income={income} />
              ))}
            </AnimatePresence>
          </tbody>
        </table>
        <button className="row-add" onClick={addIncomeStream}>
          + Add income stream
        </button>
      </section>

      <section className="setup-section">
        <h2>Expense streams</h2>
        <table className="stream-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Monthly amount</th>
              <th>Annual growth %</th>
              <th>Recurrence</th>
              <th>Month (if once/yr)</th>
              <th />
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {config.expenseStreams.map((expense) => (
                <ExpenseRow key={expense.id} expense={expense} />
              ))}
            </AnimatePresence>
          </tbody>
        </table>
        <button className="row-add" onClick={addExpenseStream}>
          + Add expense stream
        </button>
      </section>

      <section className="setup-section">
        <h2>One-off events</h2>
        <table className="stream-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Amount / month</th>
              <th>Starts at month #</th>
              <th>Duration (months)</th>
              <th />
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {config.oneOffEvents.map((event) => (
                <OneOffRow key={event.id} event={event} />
              ))}
            </AnimatePresence>
          </tbody>
        </table>
        <button className="row-add" onClick={addOneOffEvent}>
          + Add one-off event
        </button>
      </section>

      <section className="setup-section">
        <h2>Assets</h2>
        {surplusMismatch && (
          <div className="warning-banner">
            Surplus shares (assets + liability prepayments) sum to {Math.round(surplusSharePool)}%, not 100%.
          </div>
        )}
        <div className="entity-list">
          <AnimatePresence initial={false}>
            {config.assets.map((asset) => (
              <AssetRow key={asset.id} asset={asset} />
            ))}
          </AnimatePresence>
        </div>
        <button className="row-add" onClick={addAsset}>
          + Add asset
        </button>
      </section>

      <section className="setup-section">
        <h2>Liabilities</h2>
        <div className="entity-list">
          <AnimatePresence initial={false}>
            {config.liabilities.map((liability) => (
              <LiabilityRow key={liability.id} liability={liability} />
            ))}
          </AnimatePresence>
        </div>
        <button className="row-add" onClick={addLiability}>
          + Add liability
        </button>
      </section>
    </div>
  );
}
