import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function exportTableToPdf(params: {
  title: string;
  columns: string[];
  rows: Array<Array<string | number>>;
  fileName: string;
}) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  doc.setFontSize(14);
  doc.text(params.title, 40, 40);

  autoTable(doc, {
    head: [params.columns],
    body: params.rows,
    startY: 60,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [34, 34, 34] },
  });

  doc.save(params.fileName.endsWith(".pdf") ? params.fileName : `${params.fileName}.pdf`);
}

