"use client";

import { useMemo } from "react";
import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { SectionHeading } from "@/components/section-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocalStorageState } from "@/hooks/use-local-storage";
import { formatCurrencyINR, formatNumber } from "@/lib/utils";
import { NoSSR } from "@/components/no-ssr";

type ContributorKey = "Father" | "Mother" | "Spouse" | "Brother" | "Sister" | "Rental Income" | "Others";
type Contributor = { key: ContributorKey; monthly: number; annual: number };

const COLORS = ["#2563eb", "#16a34a", "#f97316", "#a855f7", "#ef4444", "#14b8a6", "#64748b"];
const DEFAULT: Contributor[] = [
  { key: "Father", monthly: 0, annual: 0 },
  { key: "Mother", monthly: 0, annual: 0 },
  { key: "Spouse", monthly: 0, annual: 0 },
  { key: "Brother", monthly: 0, annual: 0 },
  { key: "Sister", monthly: 0, annual: 0 },
  { key: "Rental Income", monthly: 0, annual: 0 },
  { key: "Others", monthly: 0, annual: 0 },
];

export default function FamilyContributionPlannerPage() {
  const [contributors, setContributors] = useLocalStorageState<Contributor[]>(
    "sfp_family_contributors",
    DEFAULT,
  );
  const [growthPct, setGrowthPct] = useLocalStorageState<number>("sfp_family_growth_pct", 0);

  const totals = useMemo(() => {
    const totalMonthly = contributors.reduce((a, c) => a + c.monthly, 0);
    const totalAnnual = contributors.reduce((a, c) => a + c.annual, 0) + totalMonthly * 12;
    return { totalMonthly, totalAnnual };
  }, [contributors]);

  const pieData = useMemo(() => {
    const total = Math.max(1, totals.totalAnnual);
    return contributors
      .map((c) => ({ name: c.key, value: c.annual + c.monthly * 12, share: ((c.annual + c.monthly * 12) / total) * 100 }))
      .filter((d) => d.value > 0);
  }, [contributors, totals.totalAnnual]);

  return (
    <div className="grid gap-6">
      <SectionHeading title="Family Contribution Planner" description="Track contributor share, ownership percentages, and total funding." />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Contributions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2 max-w-xs">
              <Label>Contribution Growth (%)</Label>
              <Input
                type="number"
                step="0.1"
                value={growthPct}
                onChange={(e) => setGrowthPct(Number(e.target.value))}
              />
              <div className="text-xs text-muted-foreground">
                Used for modelling increases (can be extended to auto-update loan payoff).
              </div>
            </div>

            <div className="overflow-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-3 py-2 text-left">Contributor</th>
                    <th className="px-3 py-2 text-left">Monthly</th>
                    <th className="px-3 py-2 text-left">Annual</th>
                    <th className="px-3 py-2 text-left">Share</th>
                  </tr>
                </thead>
                <tbody>
                  {contributors.map((c, idx) => {
                    const annualTotal = c.annual + c.monthly * 12;
                    const share = totals.totalAnnual > 0 ? (annualTotal / totals.totalAnnual) * 100 : 0;
                    return (
                      <tr key={c.key} className="border-t border-border">
                        <td className="px-3 py-2 font-medium">{c.key}</td>
                        <td className="px-3 py-2">
                          <Input
                            type="number"
                            step="100"
                            value={c.monthly}
                            onChange={(e) => {
                              const next = contributors.slice();
                              next[idx] = { ...next[idx], monthly: Number(e.target.value) };
                              setContributors(next);
                            }}
                          />
                        </td>
                        <td className="px-3 py-2">
                          <Input
                            type="number"
                            step="1000"
                            value={c.annual}
                            onChange={(e) => {
                              const next = contributors.slice();
                              next[idx] = { ...next[idx], annual: Number(e.target.value) };
                              setContributors(next);
                            }}
                          />
                        </td>
                        <td className="px-3 py-2">{formatNumber(share, 1)}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="grid gap-2 md:grid-cols-2">
              <div className="rounded-lg border border-border p-4">
                <div className="text-xs text-muted-foreground">Total Monthly</div>
                <div className="text-xl font-semibold">{formatCurrencyINR(totals.totalMonthly)}</div>
              </div>
              <div className="rounded-lg border border-border p-4">
                <div className="text-xs text-muted-foreground">Total Annual</div>
                <div className="text-xl font-semibold">{formatCurrencyINR(totals.totalAnnual)}</div>
              </div>
            </div>

            <Button variant="outline" onClick={() => setContributors(DEFAULT)}>
              Reset Contributors
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contribution Share</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <NoSSR>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={110}>
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => formatCurrencyINR(Number(v))} />
                  </PieChart>
                </ResponsiveContainer>
              </NoSSR>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
