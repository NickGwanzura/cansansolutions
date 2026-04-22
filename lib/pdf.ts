"use client";

// Render an on-screen element to a single-page A4 PDF, scaled to fit.
// html2pdf.js was auto-paginating tall documents into 2-3 pages; going
// directly through html2canvas + jspdf lets us scale-to-fit instead.
export async function downloadElementAsPdf(
  elementId: string,
  filename: string,
  watermarkText: string = "CANSAN SOLUTIONS",
): Promise<void> {
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

  if (watermarkText) {
    // Diagonal, semi-transparent watermark across the page for document security.
    // Uses jsPDF's GState for opacity; falls back silently if not supported.
    const anyPdf = pdf as unknown as {
      GState?: new (o: { opacity: number }) => unknown;
      setGState?: (g: unknown) => void;
    };
    try {
      if (anyPdf.GState && anyPdf.setGState) {
        anyPdf.setGState(new anyPdf.GState({ opacity: 0.12 }));
      }
    } catch {
      // opacity best-effort
    }
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(80);
    pdf.setTextColor(180, 0, 0);
    pdf.text(watermarkText, pageW / 2, pageH / 2, {
      angle: 30,
      align: "center",
      baseline: "middle",
    });
    try {
      if (anyPdf.GState && anyPdf.setGState) {
        anyPdf.setGState(new anyPdf.GState({ opacity: 1 }));
      }
    } catch {
      // restore best-effort
    }
  }

  pdf.save(filename);
}
