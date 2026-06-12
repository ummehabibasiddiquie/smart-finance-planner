export interface HealthInputs {
  monthlyIncome: number;
  monthlyExpenses: number;
  totalEmis: number;
  emergencyFund: number; // currency
  monthlyInvestments: number; // currency
}

export function financialHealthScore(input: HealthInputs) {
  const income = Math.max(1, input.monthlyIncome);
  const savings = Math.max(0, income - input.monthlyExpenses - input.totalEmis);
  const savingsRate = (savings / income) * 100;
  const debtRatio = (input.totalEmis / income) * 100;
  const emergencyMonths = input.emergencyFund / Math.max(1, input.monthlyExpenses);
  const investRatio = (input.monthlyInvestments / income) * 100;

  const scoreSavings = Math.min(30, Math.max(0, (savingsRate / 30) * 30));
  const scoreDebt = Math.min(30, Math.max(0, 30 - (debtRatio / 40) * 30));
  const scoreEmergency = Math.min(20, Math.max(0, (Math.min(6, emergencyMonths) / 6) * 20));
  const scoreInvest = Math.min(20, Math.max(0, (investRatio / 20) * 20));

  const score = Math.round(scoreSavings + scoreDebt + scoreEmergency + scoreInvest);
  const category = score < 40 ? "Poor" : score < 60 ? "Average" : score < 80 ? "Good" : "Excellent";

  return {
    score,
    category,
    metrics: { savingsRate, debtRatio, emergencyMonths, investRatio },
  };
}

