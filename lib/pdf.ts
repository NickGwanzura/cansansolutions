'use client';

type PdfMode = 'fit' | 'paginate';

// Render an on-screen element to an A4 PDF.
//   mode "fit"      - scales whole element to one page (for invoices/quotes/etc).
//   mode "paginate" - renders full width and splits vertically across pages (for reports).
export async function downloadElementAsPdf(
  elementId: string,
  filename: string,
  watermarkText: string = 'CANSAN SOLUTIONS',
  mode: PdfMode = 'fit',
): Promise<void> {
  // Wait for the target to mount - callers often trigger us immediately after
  // setState, before React has committed the preview modal to the DOM.
  let el = document.getElementById(elementId);
  if (!el) {
    await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
    el = document.getElementById(elementId);
  }
  if (!el) {
    console.warn(`[PDF] Element #${elementId} not found - cannot generate PDF`);
    return;
  }

  // Let React paint and all images finish loading before capture.
  await new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
  await Promise.all(
    Array.from(el.querySelectorAll('img')).map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise<void>((res) => {
            img.addEventListener('load', () => res(), { once: true });
            img.addEventListener('error', () => res(), { once: true });
          }),
    ),
  );

  // html-to-image renders through SVG <foreignObject>, which lets the browser
  // paint natively - so modern CSS color functions (oklch/lab from Tailwind v4)
  // don't trip a CSS-parser like html2canvas does.
  const [{ toCanvas }, { jsPDF }] = await Promise.all([import('html-to-image'), import('jspdf')]);

  const canvas = await toCanvas(el, {
    pixelRatio: 2,
    backgroundColor: '#ffffff',
    cacheBust: true,
  });

  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const margin = 10;
  const availW = pageW - margin * 2;
  const availH = pageH - margin * 2;

  const drawWatermark = () => {
    if (!watermarkText) return;
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
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(80);
    pdf.setTextColor(180, 0, 0);
    pdf.text(watermarkText, pageW / 2, pageH / 2, {
      angle: 30,
      align: 'center',
      baseline: 'middle',
    });
    try {
      if (anyPdf.GState && anyPdf.setGState) {
        anyPdf.setGState(new anyPdf.GState({ opacity: 1 }));
      }
    } catch {
      // restore best-effort
    }
  };

  if (mode === 'paginate') {
    const pxPerMm = canvas.width / availW;
    const pageSlicePx = Math.floor(availH * pxPerMm);
    let offsetPx = 0;
    let first = true;
    const slice = document.createElement('canvas');
    const sliceCtx = slice.getContext('2d');
    while (offsetPx < canvas.height && sliceCtx) {
      const sliceH = Math.min(pageSlicePx, canvas.height - offsetPx);
      slice.width = canvas.width;
      slice.height = sliceH;
      sliceCtx.fillStyle = '#ffffff';
      sliceCtx.fillRect(0, 0, canvas.width, sliceH);
      sliceCtx.drawImage(canvas, 0, offsetPx, canvas.width, sliceH, 0, 0, canvas.width, sliceH);
      if (!first) pdf.addPage();
      const sliceHmm = sliceH / pxPerMm;
      pdf.addImage(slice.toDataURL('image/jpeg', 0.95), 'JPEG', margin, margin, availW, sliceHmm);
      drawWatermark();
      offsetPx += pageSlicePx;
      first = false;
    }
  } else {
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
    pdf.addImage(canvas.toDataURL('image/jpeg', 0.98), 'JPEG', x, y, renderW, renderH);
    drawWatermark();
  }

  pdf.save(filename);
}
