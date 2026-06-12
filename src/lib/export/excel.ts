import * as XLSX from "xlsx";

export function exportJsonToExcel<T extends object>(params: {
  rows: T[];
  fileName: string;
  sheetName?: string;
}) {
  const { rows, fileName, sheetName = "Sheet1" } = params;
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, fileName.endsWith(".xlsx") ? fileName : `${fileName}.xlsx`);
}

