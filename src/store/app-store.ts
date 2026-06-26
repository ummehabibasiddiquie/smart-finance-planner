"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { GoalInput, InvestmentInput, Scenario } from "@/lib/types";

function uid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export interface ProfileState {
  monthlyIncome: number;
  monthlyExpenses: number;
  existingEmis: number;
  rentalIncome: number;
  emergencyFund: number;
  monthlyInvestments: number;
}

export interface AppState {
  profile: ProfileState;
  scenarios: Scenario[];
  goals: GoalInput[];
  investments: InvestmentInput[];

  setProfile: (patch: Partial<ProfileState>) => void;
  addScenario: (scenario: Omit<Scenario, "id" | "createdAtISO">) => void;
  updateScenario: (id: string, patch: Partial<Scenario>) => void;
  removeScenario: (id: string) => void;

  addGoal: (goal: GoalInput) => void;
  removeGoal: (name: string) => void;

  addInvestment: (investment: InvestmentInput) => void;
  removeInvestment: (index: number) => void;
  resetAll: () => void;
}

const initialState: Pick<AppState, "profile" | "scenarios" | "goals" | "investments"> = {
  profile: {
    monthlyIncome: 120000,
    monthlyExpenses: 50000,
    existingEmis: 0,
    rentalIncome: 0,
    emergencyFund: 300000,
    monthlyInvestments: 15000,
  },
  scenarios: [
    {
      id: "default",
      name: "Scenario A",
      createdAtISO: new Date().toISOString(),
      loan: {
        kind: "Home Loan",
        principal: 3000000,
        annualRate: 8.5,
        tenureYears: 20,
      },
      prepayment: { frequency: "half-yearly", extraEmisPerYear: 0, annualLumpSum: 0, bonuses: [] },
      emiGrowth: { mode: "percent", percentIncrease: 0 },
    },
  ],
  goals: [],
  investments: [],
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setProfile: (patch) => set({ profile: { ...get().profile, ...patch } }),

      addScenario: (scenario) =>
        set({
          scenarios: [
            ...get().scenarios,
            { ...scenario, id: uid(), createdAtISO: new Date().toISOString() },
          ],
        }),

      updateScenario: (id, patch) =>
        set({
          scenarios: get().scenarios.map((s) => (s.id === id ? { ...s, ...patch } : s)),
        }),

      removeScenario: (id) => set({ scenarios: get().scenarios.filter((s) => s.id !== id) }),

      addGoal: (goal) => set({ goals: [...get().goals, goal] }),
      removeGoal: (name) => set({ goals: get().goals.filter((g) => g.name !== name) }),

      addInvestment: (investment) => set({ investments: [...get().investments, investment] }),
      removeInvestment: (index) =>
        set({ investments: get().investments.filter((_, i) => i !== index) }),

      resetAll: () => set({ ...initialState }),
    }),
    {
      name: "smart-finance-planner",
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);

