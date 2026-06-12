import type { InvestmentInput } from "@/lib/types";

export function futureValueSIP(monthlyInvestment: number, annualReturnPct: number, months: number) {
  const r = annualReturnPct / 12 / 100;
  if (months <= 0) return 0;
  if (r === 0) return monthlyInvestment * months;
  // FV of annuity due approximation (invest at beginning of month)
  return monthlyInvestment * ((Math.pow(1 + r, months) - 1) / r) * (1 + r);
}

export function investmentPlanSummary(input: InvestmentInput) {
  const months = Math.round(input.durationYears * 12);
  const totalInvestment = input.monthlyInvestment * months;
  const futureValue = futureValueSIP(input.monthlyInvestment, input.expectedAnnualReturn, months);
  return {
    months,
    totalInvestment,
    futureValue,
    wealthCreated: Math.max(0, futureValue - totalInvestment),
  };
}

export function investmentGrowthSeries(input: InvestmentInput) {
  const months = Math.round(input.durationYears * 12);
  const r = input.expectedAnnualReturn / 12 / 100;
  let balance = 0;
  const series: Array<{ month: number; value: number }> = [];
  for (let m = 1; m <= months; m++) {
    balance = (balance + input.monthlyInvestment) * (1 + r);
    if (m === 1 || m % 6 === 0 || m === months) series.push({ month: m, value: balance });
  }
  return series;
}

