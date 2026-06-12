import type { AffordabilityInput } from "@/lib/types";

export function debtToIncomeRatio(input: AffordabilityInput, proposedEmi: number) {
  const totalEmis = input.existingEmis + proposedEmi;
  const income = input.monthlyIncome + input.rentalIncome;
  if (income <= 0) return 100;
  return (totalEmis / income) * 100;
}

export function affordability(input: AffordabilityInput) {
  const income = input.monthlyIncome + input.rentalIncome;
  const freeCash = Math.max(0, income - input.monthlyExpenses - input.existingEmis);

  // Conservative banking heuristics
  const recommendedEmi = Math.max(0, Math.min(income * 0.35 - input.existingEmis, freeCash * 0.9));
  const dti = debtToIncomeRatio(input, recommendedEmi);

  // Risk score: 0 (safe) -> 100 (risky)
  const riskScore = Math.min(100, Math.max(0, (dti - 20) * 2.5));
  const riskLevel = riskScore < 35 ? "Safe" : riskScore < 65 ? "Moderate" : "Risky";

  return {
    recommendedEmi,
    debtToIncomeRatio: dti,
    riskScore,
    riskLevel,
  };
}

