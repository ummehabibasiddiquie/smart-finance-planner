"use client";

import { useMemo, useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";
import { SectionHeading } from "@/components/section-heading";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/store/app-store";
import { investmentGrowthSeries, investmentPlanSummary } from "@/lib/finance";
import { formatCurrencyINR } from "@/lib/utils";
import { NoSSR } from "@/components/no-ssr";

const schema = z.object({
  kind: z.enum(["SIP", "Mutual Funds", "Fixed Deposit", "PPF", "NPS"]),
  monthlyInvestment: z.coerce.number().min(0),
  expectedAnnualReturn: z.coerce.number().min(0).max(30),
  durationYears: z.coerce.number().min(1).max(50),
});

export default function InvestmentPlannerPage() {
  const investments = useAppStore((s) => s.investments);
  const addInvestment = useAppStore((s) => s.addInvestment);
  const removeInvestment = useAppStore((s) => s.removeInvestment);
  const [activeIndex, setActiveIndex] = useState(0);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { kind: "SIP", monthlyInvestment: 15000, expectedAnnualReturn: 12, durationYears: 15 },
  });

  const active = investments[activeIndex] ?? null;
  const series = useMemo(() => (active ? investmentGrowthSeries(active) : []), [active]);
  const summary = active ? investmentPlanSummary(active) : null;

  return (
    <div className="grid gap-6">
      <SectionHeading title="Investment Planner" description="Plan SIPs, mutual funds, FD, PPF and NPS to build long-term wealth." />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Add Investment</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={form.handleSubmit((v) => {
                addInvestment(v);
                toast.success("Investment added");
              })}
              className="grid gap-4"
            >
              <div className="grid gap-2">
                <Label>Type</Label>
                <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" {...form.register("kind")}>
                  {schema.shape.kind.options.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>
              <Field label="Monthly Investment" name="monthlyInvestment" form={form} />
              <Field label="Expected Return (%)" name="expectedAnnualReturn" form={form} />
              <Field label="Duration (Years)" name="durationYears" form={form} />
              <Button type="submit">Add</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Portfolio</CardTitle>
          </CardHeader>
          <CardContent>
            {investments.length === 0 ? (
              <EmptyState title="No investments yet" description="Add an investment to see growth projections." />
            ) : (
              <div className="grid gap-4">
                <div className="grid gap-2">
                  {investments.map((inv, idx) => (
                    <button
                      key={`${inv.kind}-${idx}`}
                      className={`w-full rounded-lg border border-border p-3 text-left ${
                        idx === activeIndex ? "bg-muted" : "hover:bg-muted/50"
                      }`}
                      onClick={() => setActiveIndex(idx)}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <div className="font-medium">{inv.kind}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatCurrencyINR(inv.monthlyInvestment)} / month • {inv.expectedAnnualReturn}% • {inv.durationYears}y
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            removeInvestment(idx);
                            setActiveIndex(0);
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    </button>
                  ))}
                </div>

                {summary ? (
                  <div className="grid gap-4 lg:grid-cols-3">
                    <Metric title="Future Value" value={formatCurrencyINR(summary.futureValue)} />
                    <Metric title="Total Investment" value={formatCurrencyINR(summary.totalInvestment)} />
                    <Metric title="Wealth Created" value={formatCurrencyINR(summary.wealthCreated)} />
                  </div>
                ) : null}

                <Card>
                  <CardHeader>
                    <CardTitle>Growth Projection</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-72 w-full">
                      <NoSSR>
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={series}>
                            <XAxis dataKey="month" tickLine={false} axisLine={false} />
                            <YAxis
                              tickFormatter={(v) => `${Math.round(Number(v) / 100000)}L`}
                              tickLine={false}
                              axisLine={false}
                            />
                            <Tooltip formatter={(v) => formatCurrencyINR(Number(v))} />
                            <Area type="monotone" dataKey="value" stroke="#2563eb" fill="#2563eb" fillOpacity={0.2} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </NoSSR>
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      Projection uses monthly compounding and assumes stable returns (illustrative only).
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  form,
}: {
  label: string;
  name: "monthlyInvestment" | "expectedAnnualReturn" | "durationYears";
  form: ReturnType<typeof useForm<z.infer<typeof schema>>>;
}) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <Input type="number" step="0.1" {...form.register(name)} />
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
