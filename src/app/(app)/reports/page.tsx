"use client";

import { useMemo, useState } from "react";
import { SectionHeading } from "@/components/section-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScenarioSelector } from "@/components/scenario-selector";
import { useAppStore } from "@/store/app-store";
import { generateAmortizationSchedule, summarizeLoan } from "@/lib/finance";
import { exportAmortizationExcel, exportAmortizationPdf, exportLoanSummaryExcel } from "@/lib/export/report";
import { exportTableToPdf } from "@/lib/export/pdf";
import { formatCurrencyINR, formatMonthYear } from "@/lib/utils";

export default function ReportsPage() {
  const scenarios = useAppStore((s) => s.scenarios);
  const [scenarioId, setScenarioId] = useState(scenarios[0]?.id ?? "default");
  const scenario = useMemo(() => scenarios.find((s) => s.id === scenarioId) ?? scenarios[0], [scenarios, scenarioId]);

  const summary = useMemo(() => summarizeLoan({ loan: scenario.loan, prepayment: scenario.prepayment, emiGrowth: scenario.emiGrowth }), [scenario]);
  const schedule = useMemo(() => generateAmortizationSchedule({ loan: scenario.loan, prepayment: scenario.prepayment, emiGrowth: scenario.emiGrowth }).rows, [scenario]);

  const exportSummaryPdf = () => {
    exportTableToPdf({
      title: `Loan Summary - ${scenario.name}`,
      fileName: `SmartFinancePlanner_${scenario.name}_LoanSummary.pdf`,
      columns: ["Field", "Value"],
      rows: [
        ["Loan Type", scenario.loan.kind],
        ["Principal", formatCurrencyINR(scenario.loan.principal)],
        ["Annual Rate", `${scenario.loan.annualRate}%`],
        ["Tenure", `${scenario.loan.tenureYears} years`],
        ["EMI", formatCurrencyINR(summary.emi)],
        ["Total Interest", formatCurrencyINR(summary.totalInterest)],
        ["Total Paid", formatCurrencyINR(summary.totalPaid)],
        ["Closure Date", formatMonthYear(new Date(summary.closureDateISO))],
      ],
    });
  };

  return (
    <div className="grid gap-6">
      <SectionHeading title="Reports" description="Generate downloadable PDF and Excel reports for loan analysis, charts, and schedules." />

      <Card>
        <CardHeader>
          <CardTitle>Report Generator</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <ScenarioSelector value={scenarioId} onChange={setScenarioId} className="max-w-sm" />

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-border p-4">
              <div className="font-medium">Loan Summary</div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => exportLoanSummaryExcel({ scenario, summary })}>
                  Export Excel
                </Button>
                <Button variant="outline" onClick={exportSummaryPdf}>
                  Export PDF
                </Button>
              </div>
            </div>

            <div className="rounded-lg border border-border p-4">
              <div className="font-medium">Amortization Schedule</div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => exportAmortizationExcel(schedule, scenario.name)}>
                  Export Excel
                </Button>
                <Button variant="outline" onClick={() => exportAmortizationPdf(schedule, scenario.name)}>
                  Export PDF
                </Button>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">PDF export includes first 360 rows for performance.</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

