import {
  BarChart3,
  Calculator,
  CandlestickChart,
  ClipboardList,
  FileText,
  GitCompare,
  HandCoins,
  Home,
  LineChart,
  PieChart,
  Settings,
  Users,
  Wallet,
} from "lucide-react";

export const sidebarNav = [
  { title: "Dashboard", href: "/dashboard", icon: Home },
  { title: "Loan Calculator", href: "/loan-calculator", icon: Calculator },
  { title: "Loan Comparison", href: "/loan-comparison", icon: GitCompare },
  { title: "EMI Growth Planner", href: "/emi-growth-planner", icon: LineChart },
  { title: "Prepayment Planner", href: "/prepayment-planner", icon: HandCoins },
  { title: "Amortization Schedule", href: "/amortization-schedule", icon: ClipboardList },
  { title: "Affordability Calculator", href: "/affordability-calculator", icon: Wallet },
  { title: "Rent vs Buy", href: "/rent-vs-buy", icon: Home },
  { title: "Family Contribution", href: "/family-contribution-planner", icon: Users },
  { title: "Goal Planner", href: "/goal-planner", icon: BarChart3 },
  { title: "Investment Planner", href: "/investment-planner", icon: CandlestickChart },
  { title: "Scenario Comparison", href: "/scenario-comparison", icon: PieChart },
  { title: "Financial Insights", href: "/financial-insights", icon: FileText },
  { title: "Reports", href: "/reports", icon: FileText },
  { title: "Settings", href: "/settings", icon: Settings },
] as const;

