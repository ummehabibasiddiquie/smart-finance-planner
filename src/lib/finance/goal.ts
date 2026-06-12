import type { GoalInput } from "@/lib/types";

export function goalPlan(input: GoalInput) {
  const target = new Date(input.targetDateISO);
  const now = new Date();
  const months =
    (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth());
  const remaining = Math.max(0, input.goalAmount - input.currentSavings);
  const monthlyRequired = months > 0 ? remaining / months : remaining;

  // Simple probability proxy: if user can save <= 20% of goal per year, probability lower.
  const years = Math.max(0.1, months / 12);
  const annualRequired = remaining / years;
  const probability = Math.max(0, Math.min(100, 100 - Math.max(0, (annualRequired / input.goalAmount) * 80)));

  return {
    months,
    remaining,
    monthlyRequired,
    probability,
  };
}

