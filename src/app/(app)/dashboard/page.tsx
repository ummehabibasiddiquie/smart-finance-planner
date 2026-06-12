"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionHeading } from "@/components/section-heading";
import { useAppStore } from "@/store/app-store";
import { generateAmortizationSchedule, summarizeLoan, financialHealthScore } from "@/lib/finance";
import { formatCurrencyINR, formatMonthYear, formatNumber } from "@/lib/utils";
import { BalanceTrend, InterestPrincipalPie, InterestVsPrincipalLines } from "@/components/charts/loan-charts";
import { NoSSR } from "@/components/no-ssr";

export default function DashboardPage() {
  const scenario = useAppStore((s) => s.scenarios[0]);
  const profile = useAppStore((s) => s.profile);
  const goals = useAppStore((s) => s.goals);

  const { rows } = generateAmortizationSchedule({
    loan: scenario.loan,
    prepayment: scenario.prepayment,
    emiGrowth: scenario.emiGrowth,
  });
  const summary = summarizeLoan({ loan: scenario.loan, prepayment: scenario.prepayment, emiGrowth: scenario.emiGrowth });
  const originalSummary = summarizeLoan({ loan: scenario.loan });
  const interestSaved = Math.max(0, originalSummary.totalInterest - summary.totalInterest);

  const health = financialHealthScore({
    monthlyIncome: profile.monthlyIncome + profile.rentalIncome,
    monthlyExpenses: profile.monthlyExpenses,
    totalEmis: profile.existingEmis + summary.emi,
    emergencyFund: profile.emergencyFund,
    monthlyInvestments: profile.monthlyInvestments,
  });

  const goalProgress =
    goals.length === 0
      ? 0
      : Math.round(
          (goals.reduce((a, g) => a + g.currentSavings, 0) / Math.max(1, goals.reduce((a, g) => a + g.goalAmount, 0))) *
            100,
        );

  return (
    <div className="grid gap-6">
      <SectionHeading
        title="Dashboard"
        description="Quick snapshot across loans, affordability, and wealth planning."
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Metric title="Total Loan Amount" value={formatCurrencyINR(scenario.loan.principal)} />
        <Metric title="Monthly EMI" value={formatCurrencyINR(summary.emi)} />
        <Metric title="Interest Payable" value={formatCurrencyINR(summary.totalInterest)} />
        <Metric title="Total Cost" value={formatCurrencyINR(summary.totalPaid)} />
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Metric title="Loan Closure" value={formatMonthYear(new Date(summary.closureDateISO))} />
        <Metric title="Interest Saved" value={formatCurrencyINR(interestSaved)} />
        <Metric title="Health Score" value={`${health.score} / 100`} subtitle={health.category} />
        <Metric title="Goal Progress" value={`${goalProgress}%`} subtitle={goals.length ? `${goals.length} goal(s)` : "No goals yet"} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Interest vs Principal</CardTitle>
          </CardHeader>
          <CardContent>
            <NoSSR>
              <InterestPrincipalPie principal={scenario.loan.principal} interest={summary.totalInterest} />
            </NoSSR>
          </CardContent>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Loan Balance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <NoSSR>
              <BalanceTrend rows={rows} />
            </NoSSR>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Financial Health Overview</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-border p-4">
            <div className="text-sm text-muted-foreground">Key Metrics</div>
            <div className="mt-3 grid gap-2 text-sm">
              <Row label="Savings Rate" value={`${formatNumber(health.metrics.savingsRate, 1)}%`} />
              <Row label="Debt Ratio" value={`${formatNumber(health.metrics.debtRatio, 1)}%`} />
              <Row label="Emergency Fund" value={`${formatNumber(health.metrics.emergencyMonths, 1)} months`} />
              <Row label="Investment Ratio" value={`${formatNumber(health.metrics.investRatio, 1)}%`} />
            </div>
          </div>
          <div className="rounded-lg border border-border p-4">
            <div className="text-sm text-muted-foreground">EMI Composition Trend</div>
            <NoSSR>
              <InterestVsPrincipalLines rows={rows} />
            </NoSSR>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ title, value, subtitle }: { title: string; value: string; subtitle?: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{value}</div>
        {subtitle ? <div className="text-xs text-muted-foreground">{subtitle}</div> : null}
      </CardContent>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
