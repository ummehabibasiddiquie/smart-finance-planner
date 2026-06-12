"use client";

import { toast } from "sonner";
import { SectionHeading } from "@/components/section-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppStore } from "@/store/app-store";
import { ThemeToggle } from "@/components/theme-toggle";

export default function SettingsPage() {
  const resetAll = useAppStore((s) => s.resetAll);

  return (
    <div className="grid gap-6">
      <SectionHeading title="Settings" description="Manage theme and reset local data." />

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Toggle light/dark mode.</div>
          <ThemeToggle />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data</CardTitle>
        </CardHeader>
        <CardContent className="flex items-start justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            Data is stored locally in your browser (Local Storage). Reset clears scenarios, goals, and investments.
          </div>
          <Button
            variant="destructive"
            onClick={() => {
              resetAll();
              toast.success("Local data reset");
            }}
          >
            Reset All Data
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

