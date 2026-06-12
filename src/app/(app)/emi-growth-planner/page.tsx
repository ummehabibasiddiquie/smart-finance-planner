"use client";

import { useMemo, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { SectionHeading } from "@/components/section-heading";
import { ScenarioSelector } from "@/components/scenario-selector";
import { useAppStore } from "@/store/app-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generateAmortizationSchedule, summarizeLoan } from "@/lib/finance";
import { formatCurrencyINR, formatMonthYear, formatNumber } from "@/lib/utils";

const schema = z.object({
  mode: z.enum(["fixed", "percent", "custom"]),
  fixedIncreaseAmount: z.coerce.number().optional(),
  percentIncrease: z.coerce.number().optional(),
  customJson: z.string().optional(),
});

export default function EmiGrowthPlannerPage() {
  const scenarios = useAppStore((s) => s.scenarios);
  const updateScenario = useAppStore((s) => s.updateScenario);
  const [scenarioId, setScenarioId] = useState(scenarios[0]?.id ?? "default");
  const scenario = useMemo(() => scenarios.find((s) => s.id === scenarioId) ?? scenarios[0], [scenarios, scenarioId]);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      mode: scenario.emiGrowth?.mode ?? "percent",
      fixedIncreaseAmount: scenario.emiGrowth?.fixedIncreaseAmount ?? 2000,
      percentIncrease: scenario.emiGrowth?.percentIncrease ?? 5,
      customJson: JSON.stringify({ 1: scenario.emiGrowth ? undefined : undefined }, null, 2),
    },
  });

  const base = summarizeLoan({ loan: scenario.loan });
  const planned = summarizeLoan({ loan: scenario.loan, prepayment: scenario.prepayment, emiGrowth: scenario.emiGrowth });
  const baseYears = base.months / 12;
  const plannedYears = planned.months / 12;

  const onSubmit = (values: z.infer<typeof schema>) => {
    let customYearlyEmi: Record<number, number> | undefined;
    if (values.mode === "custom") {
      try {
        customYearlyEmi = values.customJson ? (JSON.parse(values.customJson) as Record<number, number>) : {};
      } catch {
        toast.error("Invalid custom JSON (use: {\"1\": 25000, \"2\": 30000})");
        return;
      }
    }

    updateScenario(scenario.id, {
      emiGrowth: {
        mode: values.mode,
        fixedIncreaseAmount: values.fixedIncreaseAmount ?? 0,
        percentIncrease: values.percentIncrease ?? 0,
        customYearlyEmi,
      },
    });
    toast.success("EMI growth strategy saved");
  };

  const previewSchedule = generateAmortizationSchedule({
    loan: scenario.loan,
    prepayment: scenario.prepayment,
    emiGrowth: scenario.emiGrowth,
  });

  const previewSummary = summarizeLoan({
    loan: scenario.loan,
    prepayment: scenario.prepayment,
    emiGrowth: scenario.emiGrowth,
  });

  const interestSaved = Math.max(0, base.totalInterest - previewSummary.totalInterest);
  const yearsReduced = Math.max(0, baseYears - plannedYears);

  const mode = form.watch("mode");

  return (
    <div className="grid gap-6">
      <SectionHeading title="EMI Growth Planner" description="Simulate increasing EMI over time to close the loan faster and save interest." />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Strategy</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <ScenarioSelector value={scenarioId} onChange={setScenarioId} />

            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <div className="grid gap-2">
                <Label>Method</Label>
                <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" {...form.register("mode")}>
                  <option value="fixed">Fixed Increase</option>
                  <option value="percent">Percentage Increase</option>
                  <option value="custom">Custom Schedule</option>
                </select>
              </div>

              {mode === "fixed" ? (
                <div className="grid gap-2">
                  <Label>Yearly Increase (₹)</Label>
                  <Input type="number" step="100" {...form.register("fixedIncreaseAmount")} />
                </div>
              ) : null}

              {mode === "percent" ? (
                <div className="grid gap-2">
                  <Label>Yearly Increase (%)</Label>
                  <Input type="number" step="0.1" {...form.register("percentIncrease")} />
                </div>
              ) : null}

              {mode === "custom" ? (
                <div className="grid gap-2">
                  <Label>Custom Yearly EMI (JSON)</Label>
                  <textarea
                    className="min-h-32 rounded-md border border-input bg-background px-3 py-2 text-xs"
                    placeholder='{"1": 25000, "2": 30000, "3": 35000}'
                    {...form.register("customJson")}
                  />
                </div>
              ) : null}

              <Button type="submit">Save Strategy</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Impact</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <Metric title="New Closure Date" value={formatMonthYear(new Date(previewSummary.closureDateISO))} />
            <Metric title="Interest Saved" value={formatCurrencyINR(interestSaved)} />
            <Metric title="Years Reduced" value={formatNumber(yearsReduced, 1)} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Preview</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Generated amortization schedule length: {previewSchedule.rows.length} months (~{formatNumber(previewSchedule.rows.length / 12, 1)} years)
        </CardContent>
      </Card>
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
