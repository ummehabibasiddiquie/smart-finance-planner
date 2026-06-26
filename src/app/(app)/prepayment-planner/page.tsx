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
import { BalanceTrend } from "@/components/charts/loan-charts";
import { NoSSR } from "@/components/no-ssr";

const schema = z.object({
  frequency: z.enum(["monthly", "quarterly", "half-yearly", "yearly"]).optional(),
  extraEmisPerYear: z.coerce.number().min(0).max(12),
  annualLumpSum: z.coerce.number().min(0),
  bonusMonthIndex: z.coerce.number().min(0).max(600).optional(),
  bonusAmount: z.coerce.number().min(0).optional(),
});

export default function PrepaymentPlannerPage() {
  const scenarios = useAppStore((s) => s.scenarios);
  const updateScenario = useAppStore((s) => s.updateScenario);
  const [scenarioId, setScenarioId] = useState(scenarios[0]?.id ?? "default");
  const scenario = useMemo(() => scenarios.find((s) => s.id === scenarioId) ?? scenarios[0], [scenarios, scenarioId]);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      frequency: scenario.prepayment?.frequency ?? "half-yearly",
      extraEmisPerYear: scenario.prepayment?.extraEmisPerYear ?? 1,
      annualLumpSum: scenario.prepayment?.annualLumpSum ?? 50000,
      bonusMonthIndex: scenario.prepayment?.bonuses?.[0]?.monthIndex ?? 11,
      bonusAmount: scenario.prepayment?.bonuses?.[0]?.amount ?? 0,
    },
  });

  const base = summarizeLoan({ loan: scenario.loan });
  const planned = summarizeLoan({ loan: scenario.loan, prepayment: scenario.prepayment, emiGrowth: scenario.emiGrowth });
  const interestSaved = Math.max(0, base.totalInterest - planned.totalInterest);
  const yearsReduced = Math.max(0, base.months / 12 - planned.months / 12);

  const onSubmit = (values: z.infer<typeof schema>) => {
    const bonuses =
      (values.bonusAmount ?? 0) > 0
        ? [{ monthIndex: values.bonusMonthIndex ?? 11, amount: values.bonusAmount ?? 0 }]
        : [];
    updateScenario(scenario.id, {
      prepayment: {
        frequency: values.frequency,
        extraEmisPerYear: values.extraEmisPerYear,
        annualLumpSum: values.annualLumpSum,
        bonuses,
      },
    });
    toast.success("Prepayment strategy saved");
  };

  const originalSchedule = generateAmortizationSchedule({ loan: scenario.loan }).rows;
  const plannedSchedule = generateAmortizationSchedule({ loan: scenario.loan, prepayment: scenario.prepayment, emiGrowth: scenario.emiGrowth }).rows;

  return (
    <div className="grid gap-6">
      <SectionHeading title="Prepayment Planner" description="Model extra EMI payments, annual lump sums, and bonuses to reduce tenure & interest." />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Inputs</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <ScenarioSelector value={scenarioId} onChange={setScenarioId} />

            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <div className="grid gap-2">
                <Label>Prepayment Frequency</Label>
                <select {...form.register("frequency")} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                  <option value="half-yearly">Half-Yearly (Every 6 months)</option>
                  <option value="yearly">Yearly (Once per year)</option>
                  <option value="quarterly">Quarterly (Every 3 months)</option>
                  <option value="monthly">Monthly (Every month)</option>
                </select>
              </div>
              <div className="grid gap-2">
                <Label>Extra EMI Payments Per Year</Label>
                <Input type="number" step="1" {...form.register("extraEmisPerYear")} />
              </div>
              <div className="grid gap-2">
                <Label>Lump Sum Amount (₹)</Label>
                <Input type="number" step="1000" {...form.register("annualLumpSum")} />
                <div className="text-xs text-muted-foreground">Applied at selected frequency (e.g., ₹50,000 every 6 months)</div>
              </div>

              <div className="grid gap-2">
                <Label>Bonus Payment (optional)</Label>
                <div className="grid grid-cols-2 gap-2">
                  <Input type="number" step="1" placeholder="Month index (0=first)" {...form.register("bonusMonthIndex")} />
                  <Input type="number" step="1000" placeholder="Amount" {...form.register("bonusAmount")} />
                </div>
                <div className="text-xs text-muted-foreground">Example: month 11 = end of year 1.</div>
              </div>

              <Button type="submit">Save Strategy</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Outputs</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <Metric title="New Closure Date" value={formatMonthYear(new Date(planned.closureDateISO))} />
            <Metric title="Interest Saved" value={formatCurrencyINR(interestSaved)} />
            <Metric title="Years Reduced" value={formatNumber(yearsReduced, 1)} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Original Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <NoSSR>
              <BalanceTrend rows={originalSchedule} />
            </NoSSR>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>With Prepayment Strategy</CardTitle>
          </CardHeader>
          <CardContent>
            <NoSSR>
              <BalanceTrend rows={plannedSchedule} />
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
