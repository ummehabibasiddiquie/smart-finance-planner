export type LoanKind =
  | "Home Loan"
  | "Personal Loan"
  | "Car Loan"
  | "Education Loan"
  | "Business Loan"
  | "Mortgage Loan";

export interface LoanInput {
  kind: LoanKind;
  principal: number; // currency
  annualRate: number; // %
  tenureYears: number;
  startDateISO?: string; // defaults today
}

export type PrepaymentFrequency = "monthly" | "quarterly" | "half-yearly" | "yearly";

export interface PrepaymentPlan {
  frequency?: PrepaymentFrequency; // when to apply extra EMI payments
  extraEmisPerYear: number; // count of extra full-EMI payments per year
  annualLumpSum: number; // once per year amount
  bonuses: Array<{ monthIndex: number; amount: number }>; // 0-based month index
}

export interface EmiGrowthPlan {
  mode: "fixed" | "percent" | "custom";
  fixedIncreaseAmount?: number; // yearly absolute increase to EMI
  percentIncrease?: number; // yearly increase %
  customYearlyEmi?: Record<number, number>; // year -> EMI
}

export interface AmortizationRow {
  month: number;
  dateISO: string;
  emi: number;
  interest: number;
  principal: number;
  extraPayment: number;
  balance: number;
}

export interface LoanSummary {
  emi: number;
  totalInterest: number;
  totalPaid: number;
  closureDateISO: string;
  months: number;
}

export interface Scenario {
  id: string;
  name: string;
  createdAtISO: string;
  loan: LoanInput;
  prepayment?: PrepaymentPlan;
  emiGrowth?: EmiGrowthPlan;
}

export interface AffordabilityInput {
  monthlyIncome: number;
  existingEmis: number;
  monthlyExpenses: number;
  rentalIncome: number;
}

export interface GoalInput {
  name: string;
  goalAmount: number;
  targetDateISO: string;
  currentSavings: number;
}

export interface InvestmentInput {
  kind: "SIP" | "Mutual Funds" | "Fixed Deposit" | "PPF" | "NPS";
  monthlyInvestment: number;
  expectedAnnualReturn: number;
  durationYears: number;
}

