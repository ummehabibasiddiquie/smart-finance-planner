"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SectionHeading } from "@/components/section-heading";
import { ScenarioSelector } from "@/components/scenario-selector";
import { LoanInputForm } from "@/components/loan-input-form";
import { useAppStore } from "@/store/app-store";
import { generateAmortizationSchedule, summarizeLoan } from "@/lib/finance";
import { formatCurrencyINR, formatMonthYear } from "@/lib/utils";
import { BalanceTrend, InterestPrincipalPie } from "@/components/charts/loan-charts";
import { NoSSR } from "@/components/no-ssr";

export default function LoanCalculatorPage() {
  const scenarios = useAppStore((s) => s.scenarios);
  const [scenarioId, setScenarioId] = useState(scenarios[0]?.id ?? "default");

  const scenario = useMemo(() => scenarios.find((s) => s.id === scenarioId) ?? scenarios[0], [scenarios, scenarioId]);
  const { rows } = generateAmortizationSchedule({ loan: scenario.loan, prepayment: scenario.prepayment, emiGrowth: scenario.emiGrowth });
  const summary = summarizeLoan({ loan: scenario.loan, prepayment: scenario.prepayment, emiGrowth: scenario.emiGrowth });

  return (
    <div className="grid gap-6">
      <SectionHeading title="Universal Loan Calculator" description="Home, personal, car, education, business and mortgage loan calculations." />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Inputs</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <ScenarioSelector value={scenarioId} onChange={setScenarioId} />
            <LoanInputForm scenarioId={scenario.id} defaultValues={scenario.loan} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Outputs</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-4">
            <Metric title="EMI" value={formatCurrencyINR(summary.emi)} />
            <Metric title="Total Interest" value={formatCurrencyINR(summary.totalInterest)} />
            <Metric title="Total Paid" value={formatCurrencyINR(summary.totalPaid)} />
            <Metric title="Closure Date" value={formatMonthYear(new Date(summary.closureDateISO))} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
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
            <CardTitle>Balance Curve</CardTitle>
          </CardHeader>
          <CardContent>
            <NoSSR>
              <BalanceTrend rows={rows} />
            </NoSSR>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="text-xs text-muted-foreground">{title}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  );
}
