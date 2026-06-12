import type { Scenario } from "@/lib/types";
import { summarizeLoan } from "@/lib/finance/loan";
import { formatCurrencyINR, formatNumber } from "@/lib/utils";

export function generateInsights(base: Scenario, alternative?: Scenario) {
  const insights: string[] = [];

  const baseSummary = summarizeLoan({ loan: base.loan, prepayment: base.prepayment, emiGrowth: base.emiGrowth });
  insights.push(
    `Your current EMI is ${formatCurrencyINR(baseSummary.emi)} and total interest payable is ~${formatCurrencyINR(
      baseSummary.totalInterest,
    )}.`,
  );

  if ((base.prepayment?.extraEmisPerYear ?? 0) > 0) {
    insights.push(
      `Adding ${base.prepayment!.extraEmisPerYear} extra EMI(s) per year can shorten your loan duration to ~${formatNumber(
        baseSummary.months / 12,
        1,
      )} years.`,
    );
  }

  if (base.emiGrowth?.mode === "percent" && (base.emiGrowth.percentIncrease ?? 0) > 0) {
    insights.push(
      `Increasing EMI by ${formatNumber(base.emiGrowth.percentIncrease ?? 0, 1)}% annually accelerates principal reduction and reduces interest.`,
    );
  }

  if (alternative) {
    const altSummary = summarizeLoan({
      loan: alternative.loan,
      prepayment: alternative.prepayment,
      emiGrowth: alternative.emiGrowth,
    });
    const interestDelta = baseSummary.totalInterest - altSummary.totalInterest;
    if (interestDelta > 0) {
      insights.push(
        `Compared to "${alternative.name}", your base scenario pays ~${formatCurrencyINR(
          interestDelta,
        )} more interest.`,
      );
    } else if (interestDelta < 0) {
      insights.push(
        `Compared to "${alternative.name}", your base scenario saves ~${formatCurrencyINR(
          Math.abs(interestDelta),
        )} in interest.`,
      );
    }
  }

  if (insights.length === 0) insights.push("No insights available yet. Add a scenario to get recommendations.");
  return insights;
}

