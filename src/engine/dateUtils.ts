export interface CalendarPoint {
  year: number;
  month: number; // 1-12
}

/** monthIndex is 0-based months elapsed since simulation start. */
export function calendarAt(startYear: number, startMonth: number, monthIndex: number): CalendarPoint {
  const totalMonths = (startMonth - 1) + monthIndex;
  const year = startYear + Math.floor(totalMonths / 12);
  const month = (totalMonths % 12) + 1;
  return { year, month };
}

export function monthlyRateFromAnnual(annualPct: number, compounding: 'monthly' | 'quarterly' | 'annually'): number {
  const annualRate = annualPct / 100;
  switch (compounding) {
    case 'monthly':
      return annualRate / 12;
    case 'quarterly': {
      const quarterlyRate = Math.pow(1 + annualRate, 1 / 4) - 1;
      return Math.pow(1 + quarterlyRate, 1 / 3) - 1;
    }
    case 'annually':
      return Math.pow(1 + annualRate, 1 / 12) - 1;
  }
}

export function frequencyMatchesMonth(
  frequency: 'monthly' | 'quarterly' | 'annually' | undefined,
  startMonth: number | undefined,
  calendarMonth: number,
  monthIndex: number,
): boolean {
  if (!frequency) return false;
  const anchor = startMonth ?? 1;
  if (frequency === 'monthly') return true;
  if (frequency === 'quarterly') return (monthIndex - (anchor - 1)) % 3 === 0 && monthIndex >= anchor - 1;
  if (frequency === 'annually') return calendarMonth === anchor;
  return false;
}
