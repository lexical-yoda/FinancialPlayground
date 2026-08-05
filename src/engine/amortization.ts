export function calculateEMI(principal: number, annualInterestPct: number, tenureMonths: number): number {
  if (annualInterestPct === 0) return principal / tenureMonths;
  const r = annualInterestPct / 100 / 12;
  const factor = Math.pow(1 + r, tenureMonths);
  return (principal * r * factor) / (factor - 1);
}

export function monthlyInterestRate(annualInterestPct: number): number {
  return annualInterestPct / 100 / 12;
}
