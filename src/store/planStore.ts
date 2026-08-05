import { create } from 'zustand';
import type { Asset, ExpenseStream, IncomeStream, Liability, OneOffEvent, PlanConfig } from '../types/plan';
import { seedConfig } from './seedConfig';

function makeId(): string {
  return crypto.randomUUID();
}

export function defaultAsset(): Asset {
  return {
    id: makeId(),
    name: 'New asset',
    category: 'other',
    startingBalance: 0,
    annualReturnPct: 0,
    compounding: 'monthly',
    liquidity: 'liquid',
    contributionRule: { mode: 'none' },
  };
}

export function defaultLiability(): Liability {
  return {
    id: makeId(),
    name: 'New liability',
    principal: 0,
    annualInterestPct: 0,
    tenureMonths: 12,
    monthsAlreadyPaid: 0,
    startsInMonthIndex: 0,
    prepaymentRule: { mode: 'none' },
  };
}

export function defaultIncomeStream(): IncomeStream {
  return { id: makeId(), name: 'New income', monthlyAmount: 0, annualHikePct: 0, hikeMonth: 1 };
}

export function defaultExpenseStream(): ExpenseStream {
  return { id: makeId(), name: 'New expense', monthlyAmount: 0, annualGrowthPct: 0, recurrence: 'monthly' };
}

export function defaultOneOffEvent(): OneOffEvent {
  return { id: makeId(), name: 'New one-off event', amountPerMonth: 0, startsInMonthIndex: null, durationMonths: null };
}

interface PlanStore {
  config: PlanConfig;

  setStartDate: (year: number, month: number) => void;
  setGoalAmount: (amount: number) => void;
  setProjectionYears: (years: number) => void;

  addAsset: () => void;
  updateAsset: (id: string, patch: Partial<Asset>) => void;
  removeAsset: (id: string) => void;

  addLiability: () => void;
  updateLiability: (id: string, patch: Partial<Liability>) => void;
  removeLiability: (id: string) => void;

  addIncomeStream: () => void;
  updateIncomeStream: (id: string, patch: Partial<IncomeStream>) => void;
  removeIncomeStream: (id: string) => void;

  addExpenseStream: () => void;
  updateExpenseStream: (id: string, patch: Partial<ExpenseStream>) => void;
  removeExpenseStream: (id: string) => void;

  addOneOffEvent: () => void;
  updateOneOffEvent: (id: string, patch: Partial<OneOffEvent>) => void;
  removeOneOffEvent: (id: string) => void;

  replaceConfig: (config: PlanConfig) => void;
  resetToSeed: () => void;
}

export const usePlanStore = create<PlanStore>((set) => ({
  config: seedConfig,

  setStartDate: (year, month) =>
    set((state) => ({ config: { ...state.config, startYear: year, startMonth: month } })),
  setGoalAmount: (amount) => set((state) => ({ config: { ...state.config, goalAmount: amount } })),
  setProjectionYears: (years) => set((state) => ({ config: { ...state.config, projectionYears: years } })),

  addAsset: () => set((state) => ({ config: { ...state.config, assets: [...state.config.assets, defaultAsset()] } })),
  updateAsset: (id, patch) =>
    set((state) => ({
      config: {
        ...state.config,
        assets: state.config.assets.map((a) => (a.id === id ? { ...a, ...patch } : a)),
      },
    })),
  removeAsset: (id) =>
    set((state) => ({ config: { ...state.config, assets: state.config.assets.filter((a) => a.id !== id) } })),

  addLiability: () =>
    set((state) => ({ config: { ...state.config, liabilities: [...state.config.liabilities, defaultLiability()] } })),
  updateLiability: (id, patch) =>
    set((state) => ({
      config: {
        ...state.config,
        liabilities: state.config.liabilities.map((l) => (l.id === id ? { ...l, ...patch } : l)),
      },
    })),
  removeLiability: (id) =>
    set((state) => ({
      config: { ...state.config, liabilities: state.config.liabilities.filter((l) => l.id !== id) },
    })),

  addIncomeStream: () =>
    set((state) => ({
      config: { ...state.config, incomeStreams: [...state.config.incomeStreams, defaultIncomeStream()] },
    })),
  updateIncomeStream: (id, patch) =>
    set((state) => ({
      config: {
        ...state.config,
        incomeStreams: state.config.incomeStreams.map((i) => (i.id === id ? { ...i, ...patch } : i)),
      },
    })),
  removeIncomeStream: (id) =>
    set((state) => ({
      config: { ...state.config, incomeStreams: state.config.incomeStreams.filter((i) => i.id !== id) },
    })),

  addExpenseStream: () =>
    set((state) => ({
      config: { ...state.config, expenseStreams: [...state.config.expenseStreams, defaultExpenseStream()] },
    })),
  updateExpenseStream: (id, patch) =>
    set((state) => ({
      config: {
        ...state.config,
        expenseStreams: state.config.expenseStreams.map((e) => (e.id === id ? { ...e, ...patch } : e)),
      },
    })),
  removeExpenseStream: (id) =>
    set((state) => ({
      config: { ...state.config, expenseStreams: state.config.expenseStreams.filter((e) => e.id !== id) },
    })),

  addOneOffEvent: () =>
    set((state) => ({
      config: { ...state.config, oneOffEvents: [...state.config.oneOffEvents, defaultOneOffEvent()] },
    })),
  updateOneOffEvent: (id, patch) =>
    set((state) => ({
      config: {
        ...state.config,
        oneOffEvents: state.config.oneOffEvents.map((o) => (o.id === id ? { ...o, ...patch } : o)),
      },
    })),
  removeOneOffEvent: (id) =>
    set((state) => ({
      config: { ...state.config, oneOffEvents: state.config.oneOffEvents.filter((o) => o.id !== id) },
    })),

  replaceConfig: (config) => set({ config }),
  resetToSeed: () => set({ config: seedConfig }),
}));
