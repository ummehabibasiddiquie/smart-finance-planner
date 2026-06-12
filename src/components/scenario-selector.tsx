"use client";

import { useMemo } from "react";
import { useAppStore } from "@/store/app-store";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function ScenarioSelector({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  const scenarios = useAppStore((s) => s.scenarios);

  const items = useMemo(() => scenarios.map((s) => ({ id: s.id, name: s.name })), [scenarios]);

  return (
    <div className={cn("grid gap-2", className)}>
      <Label>Scenario</Label>
      <select
        className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {items.map((it) => (
          <option key={it.id} value={it.id}>
            {it.name}
          </option>
        ))}
      </select>
    </div>
  );
}

