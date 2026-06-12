"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { sidebarNav } from "@/config/nav";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-72 md:flex-col md:border-r md:border-border md:bg-card">
      <div className="flex items-center gap-2 px-6 py-6">
        <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground grid place-items-center font-semibold">
          SF
        </div>
        <div className="leading-tight">
          <div className="font-semibold">Smart Finance Planner</div>
          <div className="text-xs text-muted-foreground">Plan Loans. Optimize EMIs. Build Wealth.</div>
        </div>
      </div>

      <nav className="flex-1 overflow-auto px-3 pb-6">
        <div className="grid gap-1">
          {sidebarNav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted",
                  active && "bg-muted font-medium",
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}

