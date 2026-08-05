import type { Asset, Liability, PlanConfig } from '../types/plan';
import { calculateEMI, monthlyInterestRate } from './amortization';
import { calendarAt, frequencyMatchesMonth, monthlyRateFromAnnual } from './dateUtils';

export interface MonthlySnapshot {
  monthIndex: number; // 0-based
  year: number;
  month: number; // 1-12
  perAssetBalances: Record<string, number>;
  perLiabilityBalances: Record<string, number>;
  liquid: number;
  netWorth: number;
}

export interface YearlyRollup {
  year: number;
  perAssetBalances: Record<string, number>;
  perLiabilityBalances: Record<string, number>;
  netWorth: number;
}

export interface SimulationResult {
  monthlySnapshots: MonthlySnapshot[];
  yearlyRollups: YearlyRollup[];
  goalMonthIndex: number | null;
}

interface WorkingAsset extends Asset {
  balance: number;
}

interface WorkingLiability extends Liability {
  remainingBalance: number;
}

interface WorkingIncome {
  id: string;
  currentMonthlyAmount: number;
  annualHikePct: number;
  hikeMonth: number;
}

interface WorkingExpense {
  id: string;
  currentMonthlyAmount: number;
  annualGrowthPct: number;
  recurrence: 'monthly' | 'annual_once';
  month?: number;
}

export function simulate(config: PlanConfig): SimulationResult {
  const totalMonths = config.projectionYears * 12;

  const assets: WorkingAsset[] = config.assets.map((a) => ({ ...a, balance: a.startingBalance }));
  const liabilities: WorkingLiability[] = config.liabilities.map((l) => ({
    ...l,
    remainingBalance: l.principal,
  }));
  const incomeStreams: WorkingIncome[] = config.incomeStreams.map((i) => ({
    id: i.id,
    currentMonthlyAmount: i.monthlyAmount,
    annualHikePct: i.annualHikePct,
    hikeMonth: i.hikeMonth,
  }));
  const expenseStreams: WorkingExpense[] = config.expenseStreams.map((e) => ({
    id: e.id,
    currentMonthlyAmount: e.monthlyAmount,
    annualGrowthPct: e.annualGrowthPct,
    recurrence: e.recurrence,
    month: e.month,
  }));

  const monthlySnapshots: MonthlySnapshot[] = [];
  const yearlyRollups: YearlyRollup[] = [];
  let goalMonthIndex: number | null = null;

  for (let monthIndex = 0; monthIndex < totalMonths; monthIndex++) {
    const { year, month: calendarMonth } = calendarAt(config.startYear, config.startMonth, monthIndex);
    const isAnniversary = calendarMonth === config.startMonth && monthIndex > 0;

    // 1. grow every asset balance
    for (const asset of assets) {
      const rate = monthlyRateFromAnnual(asset.annualReturnPct, asset.compounding);
      asset.balance *= 1 + rate;
    }

    // 2. income hikes (fire on the stream's own hikeMonth each year, not simulation anniversary)
    for (const income of incomeStreams) {
      if (calendarMonth === income.hikeMonth && monthIndex > 0) {
        income.currentMonthlyAmount *= 1 + income.annualHikePct / 100;
      }
    }

    // 3. expense growth (applied on simulation-start anniversary)
    if (isAnniversary) {
      for (const expense of expenseStreams) {
        expense.currentMonthlyAmount *= 1 + expense.annualGrowthPct / 100;
      }
    }

    let liquid = 0;

    // income
    for (const income of incomeStreams) {
      liquid += income.currentMonthlyAmount;
    }

    // expenses
    for (const expense of expenseStreams) {
      if (expense.recurrence === 'monthly') {
        liquid -= expense.currentMonthlyAmount;
      } else if (expense.recurrence === 'annual_once' && expense.month === calendarMonth) {
        liquid -= expense.currentMonthlyAmount;
      }
    }

    // one-off events
    for (const event of config.oneOffEvents) {
      if (event.startsInMonthIndex == null) continue;
      const active =
        monthIndex >= event.startsInMonthIndex &&
        (event.durationMonths == null || monthIndex < event.startsInMonthIndex + event.durationMonths);
      if (active) liquid -= event.amountPerMonth;
    }

    // liabilities: EMI + amortization + fixed_extra prepayment
    for (const liability of liabilities) {
      if (monthIndex < liability.startsInMonthIndex) continue;
      if (liability.remainingBalance <= 0) continue;

      const emi = calculateEMI(liability.principal, liability.annualInterestPct, liability.tenureMonths);
      const interestPortion = liability.remainingBalance * monthlyInterestRate(liability.annualInterestPct);
      const principalPortion = emi - interestPortion;
      liability.remainingBalance = Math.max(0, liability.remainingBalance - principalPortion);
      liquid -= emi;

      if (liability.prepaymentRule.mode === 'fixed_extra' && liability.prepaymentRule.amount) {
        const extra = Math.min(liability.prepaymentRule.amount, liability.remainingBalance);
        liquid -= extra;
        liability.remainingBalance -= extra;
      }
    }

    // fixed recurring asset contributions
    for (const asset of assets) {
      const rule = asset.contributionRule;
      if (rule.mode !== 'fixed_recurring') continue;
      if (!frequencyMatchesMonth(rule.frequency, rule.startMonth, calendarMonth, monthIndex)) continue;
      const remainingCapacity = rule.capAmount != null ? Math.max(0, rule.capAmount - asset.balance) : Infinity;
      if (remainingCapacity <= 0) continue;
      const contribution = Math.min(rule.fixedAmount ?? 0, remainingCapacity);
      asset.balance += contribution;
      liquid -= contribution;
    }

    // sweep remaining surplus across surplus_share assets + surplus_share liability prepayments
    if (liquid > 0) {
      const assetTargets = assets.filter((a) => a.contributionRule.mode === 'surplus_share');
      const liabilityTargets = liabilities.filter(
        (l) => l.prepaymentRule.mode === 'surplus_share' && l.remainingBalance > 0 && monthIndex >= l.startsInMonthIndex,
      );
      const totalShare =
        assetTargets.reduce((sum, a) => sum + (a.contributionRule.surplusSharePct ?? 0), 0) +
        liabilityTargets.reduce((sum, l) => sum + (l.prepaymentRule.surplusSharePct ?? 0), 0);

      if (totalShare > 0) {
        for (const asset of assetTargets) {
          const share = (asset.contributionRule.surplusSharePct ?? 0) / totalShare;
          asset.balance += liquid * share;
        }
        for (const liability of liabilityTargets) {
          const share = (liability.prepaymentRule.surplusSharePct ?? 0) / totalShare;
          const amount = Math.min(liquid * share, liability.remainingBalance);
          liability.remainingBalance -= amount;
        }
        liquid = 0;
      }
    }

    const perAssetBalances: Record<string, number> = {};
    for (const asset of assets) perAssetBalances[asset.id] = asset.balance;

    const perLiabilityBalances: Record<string, number> = {};
    for (const liability of liabilities) perLiabilityBalances[liability.id] = liability.remainingBalance;

    const netWorth =
      assets.reduce((sum, a) => sum + a.balance, 0) +
      liquid -
      liabilities.reduce((sum, l) => sum + l.remainingBalance, 0);

    monthlySnapshots.push({
      monthIndex,
      year,
      month: calendarMonth,
      perAssetBalances,
      perLiabilityBalances,
      liquid,
      netWorth,
    });

    if (goalMonthIndex === null && netWorth >= config.goalAmount) {
      goalMonthIndex = monthIndex;
    }

    // yearly rollup at each December snapshot (or final month of simulation)
    const isYearEnd = calendarMonth === 12 || monthIndex === totalMonths - 1;
    if (isYearEnd) {
      yearlyRollups.push({ year, perAssetBalances: { ...perAssetBalances }, perLiabilityBalances: { ...perLiabilityBalances }, netWorth });
    }
  }

  return { monthlySnapshots, yearlyRollups, goalMonthIndex };
}
