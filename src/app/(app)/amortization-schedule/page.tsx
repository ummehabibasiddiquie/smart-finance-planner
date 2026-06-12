"use client";

import { useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { SectionHeading } from "@/components/section-heading";
import { ScenarioSelector } from "@/components/scenario-selector";
import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppStore } from "@/store/app-store";
import { generateAmortizationSchedule, yearlySummary } from "@/lib/finance";
import type { AmortizationRow } from "@/lib/types";
import { formatCurrencyINR, formatMonthYear } from "@/lib/utils";
import { exportAmortizationExcel, exportAmortizationPdf } from "@/lib/export/report";

export default function AmortizationSchedulePage() {
  const scenarios = useAppStore((s) => s.scenarios);
  const [scenarioId, setScenarioId] = useState(scenarios[0]?.id ?? "default");
  const scenario = useMemo(() => scenarios.find((s) => s.id === scenarioId) ?? scenarios[0], [scenarios, scenarioId]);

  const schedule = useMemo(
    () => generateAmortizationSchedule({ loan: scenario.loan, prepayment: scenario.prepayment, emiGrowth: scenario.emiGrowth }).rows,
    [scenario],
  );
  const yearly = useMemo(() => yearlySummary(schedule), [schedule]);

  const columns = useMemo<ColumnDef<AmortizationRow>[]>(
    () => [
      { accessorKey: "month", header: "Month" },
      {
        id: "date",
        header: "Date",
        cell: ({ row }) => formatMonthYear(new Date(row.original.dateISO)),
      },
      { id: "emi", header: "EMI", cell: ({ row }) => formatCurrencyINR(row.original.emi) },
      { id: "interest", header: "Interest", cell: ({ row }) => formatCurrencyINR(row.original.interest) },
      { id: "principal", header: "Principal", cell: ({ row }) => formatCurrencyINR(row.original.principal) },
      { id: "extra", header: "Extra", cell: ({ row }) => formatCurrencyINR(row.original.extraPayment) },
      { id: "balance", header: "Balance", cell: ({ row }) => formatCurrencyINR(row.original.balance) },
    ],
    [],
  );

  return (
    <div className="grid gap-6">
      <SectionHeading
        title="Amortization Schedule"
        description="Month-wise breakdown with search, sorting, and exports."
        actions={
          <>
            <Button variant="outline" onClick={() => exportAmortizationExcel(schedule, scenario.name)}>
              Export Excel
            </Button>
            <Button variant="outline" onClick={() => exportAmortizationPdf(schedule, scenario.name)}>
              Export PDF
            </Button>
          </>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Schedule</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <ScenarioSelector value={scenarioId} onChange={setScenarioId} className="max-w-sm" />
          <DataTable columns={columns} data={schedule} searchPlaceholder="Search month / amount..." />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Yearly Loan Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left">Year</th>
                  <th className="px-3 py-2 text-left">Principal Paid</th>
                  <th className="px-3 py-2 text-left">Interest Paid</th>
                  <th className="px-3 py-2 text-left">Balance</th>
                </tr>
              </thead>
              <tbody>
                {yearly.map((y) => (
                  <tr key={y.year} className="border-t border-border">
                    <td className="px-3 py-2 font-medium">Year {y.year}</td>
                    <td className="px-3 py-2">{formatCurrencyINR(y.principalPaid)}</td>
                    <td className="px-3 py-2">{formatCurrencyINR(y.interestPaid)}</td>
                    <td className="px-3 py-2">{formatCurrencyINR(y.balance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

