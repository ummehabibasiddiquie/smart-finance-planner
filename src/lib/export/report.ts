import type { AmortizationRow, LoanSummary, Scenario } from "@/lib/types";
import { exportJsonToExcel } from "@/lib/export/excel";
import { exportTableToPdf } from "@/lib/export/pdf";
import { formatCurrencyINR, formatMonthYear } from "@/lib/utils";

export function exportLoanSummaryExcel(params: { scenario: Scenario; summary: LoanSummary }) {
  exportJsonToExcel({
    fileName: `SmartFinancePlanner_${params.scenario.name}_LoanSummary.xlsx`,
    sheetName: "Loan Summary",
    rows: [
      {
        Scenario: params.scenario.name,
        "Loan Type": params.scenario.loan.kind,
        Principal: params.scenario.loan.principal,
        "Annual Rate %": params.scenario.loan.annualRate,
        "Tenure (Years)": params.scenario.loan.tenureYears,
        EMI: params.summary.emi,
        "Total Interest": params.summary.totalInterest,
        "Total Paid": params.summary.totalPaid,
        "Closure Date": params.summary.closureDateISO,
      },
    ],
  });
}

export function exportAmortizationExcel(rows: AmortizationRow[], scenarioName: string) {
  exportJsonToExcel({
    fileName: `SmartFinancePlanner_${scenarioName}_Amortization.xlsx`,
    sheetName: "Amortization",
    rows: rows.map((r) => ({
      Month: r.month,
      Date: r.dateISO,
      EMI: r.emi,
      Interest: r.interest,
      Principal: r.principal,
      "Extra Payment": r.extraPayment,
      Balance: r.balance,
    })),
  });
}

export function exportAmortizationPdf(rows: AmortizationRow[], scenarioName: string) {
  exportTableToPdf({
    title: `Amortization Schedule - ${scenarioName}`,
    fileName: `SmartFinancePlanner_${scenarioName}_Amortization.pdf`,
    columns: ["Month", "Date", "EMI", "Interest", "Principal", "Extra", "Balance"],
    rows: rows.slice(0, 360).map((r) => [
      r.month,
      formatMonthYear(new Date(r.dateISO)),
      formatCurrencyINR(r.emi),
      formatCurrencyINR(r.interest),
      formatCurrencyINR(r.principal),
      formatCurrencyINR(r.extraPayment),
      formatCurrencyINR(r.balance),
    ]),
  });
}

