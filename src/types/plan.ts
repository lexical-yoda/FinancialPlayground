export type AssetCategory =
  | 'equity'
  | 'gold'
  | 'fd'
  | 'cash'
  | 'bond'
  | 'crypto'
  | 'real_estate'
  | 'other';

export interface ContributionRule {
  mode: 'surplus_share' | 'fixed_recurring' | 'none';
  surplusSharePct?: number;
  fixedAmount?: number;
  frequency?: 'monthly' | 'quarterly' | 'annually';
  startMonth?: number;
  capAmount?: number;
}

export interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  startingBalance: number;
  annualReturnPct: number;
  compounding: 'monthly' | 'quarterly' | 'annually';
  liquidity: 'liquid' | 'locked';
  lockInMonths?: number;
  contributionRule: ContributionRule;
}

export interface IncomeStream {
  id: string;
  name: string;
  monthlyAmount: number;
  annualHikePct: number;
  hikeMonth: number;
}

export interface ExpenseStream {
  id: string;
  name: string;
  monthlyAmount: number;
  annualGrowthPct: number;
  recurrence: 'monthly' | 'annual_once';
  month?: number;
}

export interface OneOffEvent {
  id: string;
  name: string;
  amountPerMonth: number;
  startsInMonthIndex: number | null;
  durationMonths?: number | null;
}

export interface PrepaymentRule {
  mode: 'none' | 'fixed_extra' | 'surplus_share';
  amount?: number;
  surplusSharePct?: number;
}

export interface Liability {
  id: string;
  name: string;
  principal: number;
  annualInterestPct: number;
  tenureMonths: number;
  monthsAlreadyPaid: number;
  startsInMonthIndex: number;
  prepaymentRule: PrepaymentRule;
}

export interface PlanConfig {
  startYear: number;
  startMonth: number;
  incomeStreams: IncomeStream[];
  expenseStreams: ExpenseStream[];
  oneOffEvents: OneOffEvent[];
  assets: Asset[];
  liabilities: Liability[];
  goalAmount: number;
  projectionYears: number;
}
