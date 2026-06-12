"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { SectionHeading } from "@/components/section-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { affordability, estimatePrincipalFromEmi } from "@/lib/finance";
import { formatCurrencyINR, formatNumber } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";

const schema = z.object({
  monthlyIncome: z.coerce.number().min(0),
  rentalIncome: z.coerce.number().min(0),
  monthlyExpenses: z.coerce.number().min(0),
  existingEmis: z.coerce.number().min(0),
});

export default function AffordabilityCalculatorPage() {
  const profile = useAppStore((s) => s.profile);
  const setProfile = useAppStore((s) => s.setProfile);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: profile,
  });

  const values = form.watch();
  const result = affordability(values);

  // Recommended loan amount assumes 20-year tenure @ 8.5% (can be extended later)
  const recommendedLoanAmount = estimatePrincipalFromEmi({
    emi: result.recommendedEmi,
    annualRatePct: 8.5,
    tenureMonths: 20 * 12,
  });

  return (
    <div className="grid gap-6">
      <SectionHeading title="Affordability Calculator" description="Understand safe EMI levels, loan capacity, and financial risk." />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Inputs</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={form.handleSubmit((v) => {
                setProfile(v);
                toast.success("Profile saved");
              })}
              className="grid gap-4"
            >
              <Field label="Monthly Income" name="monthlyIncome" form={form} />
              <Field label="Rental Income" name="rentalIncome" form={form} />
              <Field label="Monthly Expenses" name="monthlyExpenses" form={form} />
              <Field label="Existing EMIs" name="existingEmis" form={form} />
              <Button type="submit">Save</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Outputs</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <Metric title="Recommended EMI" value={formatCurrencyINR(result.recommendedEmi)} subtitle="Target max (safe) EMI" />
            <Metric title="Recommended Loan Amount" value={formatCurrencyINR(recommendedLoanAmount)} subtitle="Assumes 20y @ 8.5%" />
            <Metric title="Debt To Income Ratio" value={`${formatNumber(result.debtToIncomeRatio, 1)}%`} subtitle="Lower is better" />
            <Metric title="Financial Risk Score" value={`${Math.round(result.riskScore)} / 100`} subtitle={result.riskLevel} />
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

function Metric({ title, value, subtitle }: { title: string; value: string; subtitle?: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="text-xs text-muted-foreground">{title}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
      {subtitle ? <div className="text-xs text-muted-foreground">{subtitle}</div> : null}
    </div>
  );
}
