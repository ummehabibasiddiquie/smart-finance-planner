"use client";

import { useMemo } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { SectionHeading } from "@/components/section-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/store/app-store";
import { affordability, summarizeLoan } from "@/lib/finance";
import { formatCurrencyINR, formatNumber } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(1),
  principal: z.coerce.number().positive(),
});

export default function ScenarioComparisonPage() {
  const scenarios = useAppStore((s) => s.scenarios);
  const addScenario = useAppStore((s) => s.addScenario);
  const removeScenario = useAppStore((s) => s.removeScenario);
  const profile = useAppStore((s) => s.profile);

  const baseLoan = scenarios[0]?.loan;

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { name: `Scenario ${String.fromCharCode(65 + scenarios.length)}`, principal: baseLoan?.principal ?? 3000000 },
  });

  const compareRows = useMemo(() => {
    return scenarios.map((s) => {
      const sum = summarizeLoan({ loan: s.loan, prepayment: s.prepayment, emiGrowth: s.emiGrowth });
      const aff = affordability({
        monthlyIncome: profile.monthlyIncome,
        rentalIncome: profile.rentalIncome,
        monthlyExpenses: profile.monthlyExpenses,
        existingEmis: profile.existingEmis,
      });
      const dti = (profile.existingEmis + sum.emi) / Math.max(1, profile.monthlyIncome + profile.rentalIncome);

      return {
        id: s.id,
        name: s.name,
        principal: s.loan.principal,
        emi: sum.emi,
        interest: sum.totalInterest,
        years: sum.months / 12,
        affordabilityScore: Math.max(0, 100 - aff.riskScore - dti * 100 * 0.5),
      };
    });
  }, [scenarios, profile]);

  return (
    <div className="grid gap-6">
      <SectionHeading title="Scenario Comparison" description="Save unlimited scenarios and compare EMI, interest, tenure, and affordability impact." />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Create Scenario</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={form.handleSubmit((v) => {
                if (!baseLoan) return;
                addScenario({
                  name: v.name,
                  loan: { ...baseLoan, principal: v.principal },
                  prepayment: { frequency: "half-yearly", extraEmisPerYear: 0, annualLumpSum: 0, bonuses: [] },
                  emiGrowth: { mode: "percent", percentIncrease: 0 },
                });
                toast.success("Scenario created");
              })}
              className="grid gap-4"
            >
              <div className="grid gap-2">
                <Label>Scenario Name</Label>
                <Input {...form.register("name")} />
              </div>
              <div className="grid gap-2">
                <Label>Loan Amount</Label>
                <Input type="number" step="1000" {...form.register("principal")} />
              </div>
              <Button type="submit">Add Scenario</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Compare</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="px-3 py-2 text-left">Scenario</th>
                    <th className="px-3 py-2 text-left">Loan</th>
                    <th className="px-3 py-2 text-left">EMI</th>
                    <th className="px-3 py-2 text-left">Interest</th>
                    <th className="px-3 py-2 text-left">Duration</th>
                    <th className="px-3 py-2 text-left">Affordability</th>
                    <th className="px-3 py-2 text-left"></th>
                  </tr>
                </thead>
                <tbody>
                  {compareRows.map((r) => (
                    <tr key={r.id} className="border-t border-border">
                      <td className="px-3 py-2 font-medium">{r.name}</td>
                      <td className="px-3 py-2">{formatCurrencyINR(r.principal)}</td>
                      <td className="px-3 py-2">{formatCurrencyINR(r.emi)}</td>
                      <td className="px-3 py-2">{formatCurrencyINR(r.interest)}</td>
                      <td className="px-3 py-2">{formatNumber(r.years, 1)}y</td>
                      <td className="px-3 py-2">{formatNumber(r.affordabilityScore, 0)} / 100</td>
                      <td className="px-3 py-2">
                        {r.id !== "default" ? (
                          <Button variant="outline" size="sm" onClick={() => removeScenario(r.id)}>
                            Remove
                          </Button>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
