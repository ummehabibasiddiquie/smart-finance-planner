"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import type { AmortizationRow } from "@/lib/types";
import { formatCurrencyINR } from "@/lib/utils";

const COLORS = ["#2563eb", "#16a34a", "#f97316", "#ef4444"];

export function InterestPrincipalPie({ principal, interest }: { principal: number; interest: number }) {
  const data = [
    { name: "Principal", value: principal },
    { name: "Interest", value: interest },
  ];

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90}>
            {data.map((_, idx) => (
              <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(v) => formatCurrencyINR(Number(v))} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function BalanceTrend({ rows }: { rows: AmortizationRow[] }) {
  const data = rows
    .filter((r) => r.month === 1 || r.month % 6 === 0 || r.month === rows.length)
    .map((r) => ({ month: r.month, balance: r.balance }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} />
          <YAxis tickFormatter={(v) => `${Math.round(v / 100000)}L`} tickLine={false} axisLine={false} />
          <Tooltip formatter={(v) => formatCurrencyINR(Number(v))} />
          <Line type="monotone" dataKey="balance" stroke={COLORS[0]} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function InterestVsPrincipalLines({ rows }: { rows: AmortizationRow[] }) {
  const data = rows
    .filter((r) => r.month === 1 || r.month % 6 === 0 || r.month === rows.length)
    .map((r) => ({ month: r.month, interest: r.interest, principal: r.principal + r.extraPayment }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} />
          <Tooltip formatter={(v) => formatCurrencyINR(Number(v))} />
          <Legend />
          <Line type="monotone" dataKey="interest" stroke={COLORS[3]} strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="principal" stroke={COLORS[1]} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

