"use client";

// Render an on-screen element to a single-page A4 PDF, scaled to fit.
// html2pdf.js was auto-paginating tall documents into 2-3 pages; going
// directly through html2canvas + jspdf lets us scale-to-fit instead.
export async function downloadElementAsPdf(elementId: string, filename: string): Promise<void> {
  const el = document.getElementById(elementId);
  if (!el) return;

  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import("html2canvas"),
    import("jspdf"),
  ]);

  const canvas = await html2canvas(el, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: "#ffffff",
  });

  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 10;
  const availW = pageW - margin * 2;
  const availH = pageH - margin * 2;

  const canvasRatio = canvas.width / canvas.height;
  let renderW: number;
  let renderH: number;
  if (availW / availH > canvasRatio) {
    renderH = availH;
    renderW = availH * canvasRatio;
  } else {
    renderW = availW;
    renderH = availW / canvasRatio;
  }
  const x = (pageW - renderW) / 2;
  const y = margin;

  pdf.addImage(canvas.toDataURL("image/jpeg", 0.98), "JPEG", x, y, renderW, renderH);
  pdf.save(filename);
}
