import type {
  AmortizationRow,
  EmiGrowthPlan,
  LoanInput,
  LoanSummary,
  PrepaymentPlan,
} from "@/lib/types";
import { addMonths } from "@/lib/utils";

function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export function monthlyRate(annualRatePct: number) {
  return annualRatePct / 12 / 100;
}

export function calculateEmi(principal: number, annualRatePct: number, tenureMonths: number) {
  const r = monthlyRate(annualRatePct);
  if (tenureMonths <= 0) return 0;
  if (r === 0) return principal / tenureMonths;
  const pow = Math.pow(1 + r, tenureMonths);
  return (principal * r * pow) / (pow - 1);
}

export function estimatePrincipalFromEmi(params: {
  emi: number;
  annualRatePct: number;
  tenureMonths: number;
}) {
  // Simple binary search (monotonic in principal)
  let low = 0;
  let high = 1;
  while (calculateEmi(high, params.annualRatePct, params.tenureMonths) < params.emi) high *= 2;
  for (let i = 0; i < 50; i++) {
    const mid = (low + high) / 2;
    const guess = calculateEmi(mid, params.annualRatePct, params.tenureMonths);
    if (guess > params.emi) high = mid;
    else low = mid;
  }
  return low;
}

export function getStartDate(input: LoanInput) {
  return input.startDateISO ? new Date(input.startDateISO) : new Date();
}

export function getYearlyEmiForMonth(
  baseEmi: number,
  monthIndex: number,
  plan?: EmiGrowthPlan,
) {
  if (!plan) return baseEmi;
  const year = Math.floor(monthIndex / 12) + 1; // 1-based
  if (plan.mode === "fixed") {
    const inc = plan.fixedIncreaseAmount ?? 0;
    return baseEmi + (year - 1) * inc;
  }
  if (plan.mode === "percent") {
    const pct = (plan.percentIncrease ?? 0) / 100;
    return baseEmi * Math.pow(1 + pct, year - 1);
  }
  if (plan.mode === "custom") {
    const custom = plan.customYearlyEmi?.[year];
    return custom ?? baseEmi;
  }
  return baseEmi;
}

export function generateAmortizationSchedule(input: {
  loan: LoanInput;
  prepayment?: PrepaymentPlan;
  emiGrowth?: EmiGrowthPlan;
}) {
  const { loan, prepayment, emiGrowth } = input;

  const startDate = getStartDate(loan);
  const tenureMonths = Math.round(loan.tenureYears * 12);
  const baseEmi = calculateEmi(loan.principal, loan.annualRate, tenureMonths);
  const r = monthlyRate(loan.annualRate);

  let balance = loan.principal;
  const rows: AmortizationRow[] = [];
  let month = 0;

  const extraEmisPerYear = prepayment?.extraEmisPerYear ?? 0;
  const annualLumpSum = prepayment?.annualLumpSum ?? 0;
  const bonuses = prepayment?.bonuses ?? [];

  // Safety cap: if user puts huge reductions and we reach 0 early, stop.
  while (balance > 0.01 && month < tenureMonths + 1200) {
    const date = addMonths(startDate, month);
    const dynamicEmi = getYearlyEmiForMonth(baseEmi, month, emiGrowth);

    const interest = round2(balance * r);
    let principalPaid = round2(dynamicEmi - interest);
    if (principalPaid < 0) principalPaid = 0;

    // Extra payments:
    let extraPayment = 0;

    // bonus payments by month index
    const bonus = bonuses.find((b) => b.monthIndex === month);
    if (bonus) extraPayment += bonus.amount;

    // once per year: at end of each year (month 11, 23, 35...) add annual lump sum
    if (annualLumpSum > 0 && (month + 1) % 12 === 0) extraPayment += annualLumpSum;

    // extra EMI payments per year: spread evenly across year (first N months of each year)
    if (extraEmisPerYear > 0) {
      const withinYear = month % 12; // 0..11
      if (withinYear < extraEmisPerYear) extraPayment += dynamicEmi;
    }

    // Clamp so we don't overpay
    const totalPrincipalThisMonth = principalPaid + extraPayment;
    if (totalPrincipalThisMonth > balance) {
      extraPayment = Math.max(0, balance - principalPaid);
      principalPaid = Math.min(principalPaid, balance);
    }

    balance = round2(balance - principalPaid - extraPayment);
    if (balance < 0) balance = 0;

    rows.push({
      month: month + 1,
      dateISO: date.toISOString(),
      emi: round2(dynamicEmi),
      interest,
      principal: principalPaid,
      extraPayment: round2(extraPayment),
      balance: round2(balance),
    });

    month += 1;
  }

  return { rows, baseEmi: round2(baseEmi) };
}

export function summarizeLoan(input: {
  loan: LoanInput;
  prepayment?: PrepaymentPlan;
  emiGrowth?: EmiGrowthPlan;
}): LoanSummary {
  const { rows } = generateAmortizationSchedule(input);
  const totalInterest = rows.reduce((a, r) => a + r.interest, 0);
  const totalPaid =
    rows.reduce((a, r) => a + r.emi + r.extraPayment, 0) - // EMI includes interest+principal
    // but EMI already includes principal; ok as total outflow
    0;

  const startDate = getStartDate(input.loan);
  const closureDate = addMonths(startDate, rows.length);

  return {
    emi: rows[0]?.emi ?? calculateEmi(input.loan.principal, input.loan.annualRate, input.loan.tenureYears * 12),
    totalInterest: round2(totalInterest),
    totalPaid: round2(totalPaid),
    closureDateISO: closureDate.toISOString(),
    months: rows.length,
  };
}

export function yearlySummary(rows: AmortizationRow[]) {
  const byYear = new Map<number, { year: number; principalPaid: number; interestPaid: number; balance: number }>();
  rows.forEach((r) => {
    const year = Math.floor((r.month - 1) / 12) + 1;
    const cur = byYear.get(year) ?? { year, principalPaid: 0, interestPaid: 0, balance: r.balance };
    cur.principalPaid += r.principal + r.extraPayment;
    cur.interestPaid += r.interest;
    cur.balance = r.balance;
    byYear.set(year, cur);
  });
  return Array.from(byYear.values()).map((y) => ({
    ...y,
    principalPaid: round2(y.principalPaid),
    interestPaid: round2(y.interestPaid),
    balance: round2(y.balance),
  }));
}
