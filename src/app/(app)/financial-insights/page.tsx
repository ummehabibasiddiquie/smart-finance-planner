"use client";

import { useMemo, useState } from "react";
import { SectionHeading } from "@/components/section-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppStore } from "@/store/app-store";
import { generateInsights } from "@/lib/finance";
import { Label } from "@/components/ui/label";

export default function FinancialInsightsPage() {
  const scenarios = useAppStore((s) => s.scenarios);
  const [baseId, setBaseId] = useState(scenarios[0]?.id ?? "default");
  const [altId, setAltId] = useState(scenarios[1]?.id ?? "");

  const base = useMemo(() => scenarios.find((s) => s.id === baseId) ?? scenarios[0], [scenarios, baseId]);
  const alt = useMemo(() => scenarios.find((s) => s.id === altId), [scenarios, altId]);
  const insights = useMemo(() => generateInsights(base, alt), [base, alt]);

  return (
    <div className="grid gap-6">
      <SectionHeading title="AI Financial Insights" description="Dynamic recommendations based on your loans and repayment strategies." />

      <Card>
        <CardHeader>
          <CardTitle>Scenario Selection</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label>Base Scenario</Label>
            <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={baseId} onChange={(e) => setBaseId(e.target.value)}>
              {scenarios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <Label>Compare With (optional)</Label>
            <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={altId} onChange={(e) => setAltId(e.target.value)}>
              <option value="">None</option>
              {scenarios.filter((s) => s.id !== baseId).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2 text-sm">
            {insights.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

