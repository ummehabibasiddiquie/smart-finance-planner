"use client";

import { useMemo, useState } from "react";
import { SectionHeading } from "@/components/section-heading";
import { ScenarioSelector } from "@/components/scenario-selector";
import { useAppStore } from "@/store/app-store";
import { calculateEmi } from "@/lib/finance";
import { formatCurrencyINR } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const TENURES = [10, 15, 20, 25, 30] as const;

export default function LoanComparisonPage() {
  const scenarios = useAppStore((s) => s.scenarios);
  const [scenarioId, setScenarioId] = useState(scenarios[0]?.id ?? "default");
  const scenario = useMemo(() => scenarios.find((s) => s.id === scenarioId) ?? scenarios[0], [scenarios, scenarioId]);

  const rows = useMemo(() => {
    return TENURES.map((tenureYears) => {
      const months = tenureYears * 12;
      const emi = calculateEmi(scenario.loan.principal, scenario.loan.annualRate, months);
      const totalPaid = emi * months;
      const interest = totalPaid - scenario.loan.principal;
      return { tenureYears, emi, interest, totalPaid };
    });
  }, [scenario]);

  const lowestEmi = Math.min(...rows.map((r) => r.emi));
  const lowestInterest = Math.min(...rows.map((r) => r.interest));
  const recommended = rows.slice().sort((a, b) => a.totalPaid - b.totalPaid)[0]?.tenureYears;

  return (
    <div className="grid gap-6">
      <SectionHeading title="Loan Comparison" description="Compare EMI and interest across common tenures." />

      <Card>
        <CardHeader>
          <CardTitle>Compare Tenures</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <ScenarioSelector value={scenarioId} onChange={setScenarioId} className="max-w-sm" />

          <div className="overflow-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-3 py-2 text-left">Tenure</th>
                  <th className="px-3 py-2 text-left">EMI</th>
                  <th className="px-3 py-2 text-left">Interest</th>
                  <th className="px-3 py-2 text-left">Total Cost</th>
                  <th className="px-3 py-2 text-left">Highlights</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const tags: string[] = [];
                  if (r.emi === lowestEmi) tags.push("Lowest EMI");
                  if (r.interest === lowestInterest) tags.push("Lowest Interest");
                  if (r.tenureYears === recommended) tags.push("Recommended");

                  return (
                    <tr key={r.tenureYears} className="border-t border-border">
                      <td className="px-3 py-2 font-medium">{r.tenureYears} Years</td>
                      <td className="px-3 py-2">{formatCurrencyINR(r.emi)}</td>
                      <td className="px-3 py-2">{formatCurrencyINR(r.interest)}</td>
                      <td className="px-3 py-2">{formatCurrencyINR(r.totalPaid)}</td>
                      <td className="px-3 py-2">
                        <div className="flex flex-wrap gap-2">
                          {tags.map((t) => (
                            <Badge key={t} variant={t === "Recommended" ? "default" : "secondary"}>
                              {t}
                            </Badge>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

