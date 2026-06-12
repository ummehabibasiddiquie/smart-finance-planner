"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { SectionHeading } from "@/components/section-heading";
import { EmptyState } from "@/components/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppStore } from "@/store/app-store";
import { goalPlan } from "@/lib/finance";
import { formatCurrencyINR, formatNumber } from "@/lib/utils";

const schema = z.object({
  name: z.string().min(1),
  goalAmount: z.coerce.number().positive(),
  targetDateISO: z.string().min(1),
  currentSavings: z.coerce.number().min(0),
});

const GOALS = [
  "House Purchase",
  "Car Purchase",
  "Child Education",
  "Marriage",
  "Retirement",
  "Emergency Fund",
];

export default function GoalPlannerPage() {
  const goals = useAppStore((s) => s.goals);
  const addGoal = useAppStore((s) => s.addGoal);
  const removeGoal = useAppStore((s) => s.removeGoal);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "House Purchase",
      goalAmount: 2000000,
      targetDateISO: new Date(new Date().getFullYear() + 5, 0, 1).toISOString().slice(0, 10),
      currentSavings: 200000,
    },
  });

  return (
    <div className="grid gap-6">
      <SectionHeading title="Financial Goal Planner" description="Plan monthly savings to hit goals by a target date." />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Add Goal</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={form.handleSubmit((v) => {
                addGoal(v);
                toast.success("Goal added");
              })}
              className="grid gap-4"
            >
              <div className="grid gap-2">
                <Label>Goal</Label>
                <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" {...form.register("name")}>
                  {GOALS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
              <Field label="Goal Amount" name="goalAmount" form={form} />
              <div className="grid gap-2">
                <Label>Target Date</Label>
                <Input type="date" {...form.register("targetDateISO")} />
              </div>
              <Field label="Current Savings" name="currentSavings" form={form} />
              <Button type="submit">Add</Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Goals</CardTitle>
          </CardHeader>
          <CardContent>
            {goals.length === 0 ? (
              <EmptyState title="No goals yet" description="Add a goal to start tracking required savings and probability." />
            ) : (
              <div className="grid gap-3">
                {goals.map((g) => {
                  const plan = goalPlan(g);
                  return (
                    <div key={g.name} className="rounded-lg border border-border p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="font-semibold">{g.name}</div>
                          <div className="text-xs text-muted-foreground">
                            Target: {formatCurrencyINR(g.goalAmount)} • Current: {formatCurrencyINR(g.currentSavings)}
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => removeGoal(g.name)}>
                          Remove
                        </Button>
                      </div>

                      <div className="mt-4 grid gap-2 md:grid-cols-3">
                        <Metric title="Monthly Required" value={formatCurrencyINR(plan.monthlyRequired)} />
                        <Metric title="Remaining" value={formatCurrencyINR(plan.remaining)} />
                        <Metric title="Probability" value={`${formatNumber(plan.probability, 0)}%`} />
                      </div>
                    </div>
                  );
                })}
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
  name: "goalAmount" | "currentSavings";
  form: ReturnType<typeof useForm<z.infer<typeof schema>>>;
}) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <Input type="number" step="1000" {...form.register(name)} />
    </div>
  );
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="text-xs text-muted-foreground">{title}</div>
      <div className="mt-1 font-semibold">{value}</div>
    </div>
  );
}
