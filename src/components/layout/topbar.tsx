"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { sidebarNav } from "@/config/nav";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

export function Topbar() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" className="md:hidden" onClick={() => setOpen(!open)}>
          <Menu className="h-4 w-4" />
        </Button>
        <div className="font-semibold">Smart Finance Planner</div>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
      </div>

      {open ? (
        <div className="fixed inset-0 z-[100] md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 overflow-auto bg-card border-r border-border p-4 shadow-xl">
            <div className="mb-4 font-semibold">Modules</div>
            <nav className="grid gap-1">
              {sidebarNav.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn("flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-muted")}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      ) : null}
    </header>
  );
}
