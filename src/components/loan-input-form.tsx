"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { LoanInput, LoanKind } from "@/lib/types";
import { useAppStore } from "@/store/app-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  kind: z.string(),
  principal: z.coerce.number().positive(),
  annualRate: z.coerce.number().min(0).max(50),
  tenureYears: z.coerce.number().positive().max(40),
});

const loanKinds: LoanKind[] = [
  "Home Loan",
  "Personal Loan",
  "Car Loan",
  "Education Loan",
  "Business Loan",
  "Mortgage Loan",
];

export function LoanInputForm({
  scenarioId,
  defaultValues,
  onSaved,
}: {
  scenarioId: string;
  defaultValues: LoanInput;
  onSaved?: () => void;
}) {
  const updateScenario = useAppStore((s) => s.updateScenario);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const onSubmit = (values: z.infer<typeof schema>) => {
    updateScenario(scenarioId, {
      loan: {
        kind: values.kind as LoanKind,
        principal: values.principal,
        annualRate: values.annualRate,
        tenureYears: values.tenureYears,
      },
    });
    toast.success("Loan inputs saved");
    onSaved?.();
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
      <div className="grid gap-2">
        <Label>Loan Type</Label>
        <select
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          {...form.register("kind")}
        >
          {loanKinds.map((k) => (
            <option key={k} value={k}>
              {k}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="grid gap-2">
          <Label>Loan Amount</Label>
          <Input type="number" step="1000" {...form.register("principal")} />
        </div>
        <div className="grid gap-2">
          <Label>Interest Rate (%)</Label>
          <Input type="number" step="0.01" {...form.register("annualRate")} />
        </div>
        <div className="grid gap-2">
          <Label>Tenure (Years)</Label>
          <Input type="number" step="1" {...form.register("tenureYears")} />
        </div>
      </div>

      <Button type="submit">Save</Button>
    </form>
  );
}
