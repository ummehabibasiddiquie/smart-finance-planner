"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SectionHeading } from "@/components/section-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { rentVsBuy } from "@/lib/finance";
import { formatCurrencyINR } from "@/lib/utils";

const schema = z.object({
  propertyPrice: z.coerce.number().min(0),
  downPayment: z.coerce.number().min(0),
  monthlyRent: z.coerce.number().min(0),
  appreciationRate: z.coerce.number().min(0).max(30),
  inflation: z.coerce.number().min(0).max(30),
});

export default function RentVsBuyPage() {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      propertyPrice: 8000000,
      downPayment: 1600000,
      monthlyRent: 30000,
      appreciationRate: 6,
      inflation: 5,
    },
  });

  const v = form.watch();
  const r5 = rentVsBuy(v, 5);
  const r10 = rentVsBuy(v, 10);
  const r20 = rentVsBuy(v, 20);
  const recommendation = [r5, r10, r20].filter(Boolean).slice(-1)[0]?.recommendation ?? "Buy";

  return (
    <div className="grid gap-6">
      <SectionHeading title="Rent vs Buy" description="Compare long-term wealth impact of renting vs buying (simplified model)." />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Inputs</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4" onSubmit={(e) => e.preventDefault()}>
              <Field label="Property Price" name="propertyPrice" form={form} />
              <Field label="Down Payment" name="downPayment" form={form} />
              <Field label="Monthly Rent" name="monthlyRent" form={form} />
              <Field label="Appreciation Rate (%)" name="appreciationRate" form={form} />
              <Field label="Inflation (%)" name="inflation" form={form} />
              <Button type="button" variant="outline">
                Recommendation: {recommendation}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Outputs</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <ResultTable results={[r5, r10, r20]} />
            <div className="text-xs text-muted-foreground">
              Note: This module intentionally keeps the model simple for clarity. You can extend it later to include loan EMI, taxes, maintenance, and opportunity costs.
            </div>
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
  name: keyof z.infer<typeof schema>;
  form: ReturnType<typeof useForm<z.infer<typeof schema>>>;
}) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <Input type="number" step="100" {...form.register(name)} />
    </div>
  );
}

function ResultTable({ results }: { results: ReturnType<typeof rentVsBuy>[] }) {
  return (
    <div className="overflow-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-3 py-2 text-left">Horizon</th>
            <th className="px-3 py-2 text-left">Cost of Renting</th>
            <th className="px-3 py-2 text-left">Wealth (Renting)</th>
            <th className="px-3 py-2 text-left">Wealth (Buying)</th>
            <th className="px-3 py-2 text-left">Recommendation</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r) => (
            <tr key={r.years} className="border-t border-border">
              <td className="px-3 py-2 font-medium">{r.years} Years</td>
              <td className="px-3 py-2">{formatCurrencyINR(r.costOfRenting)}</td>
              <td className="px-3 py-2">{formatCurrencyINR(r.wealthRenting)}</td>
              <td className="px-3 py-2">{formatCurrencyINR(r.wealthBuying)}</td>
              <td className="px-3 py-2">{r.recommendation}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
