import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ExportPdfOptions {
  elementId: string;
  filename: string;
  format?: 'id_card' | 'a4';
  onStart?: () => void;
  onFinish?: () => void;
  onError?: (err: unknown) => void;
}

/**
 * Pre-converts any embedded images inside an element to base64 Data URLs
 * to eliminate cross-origin and iframe canvas rendering failures.
 */
async function preConvertImagesToBase64(container: HTMLElement): Promise<void> {
  const images = Array.from(container.querySelectorAll('img'));
  await Promise.all(
    images.map(async (img) => {
      const src = img.src;
      // Already a data URI or inline base64
      if (!src || src.startsWith('data:')) return;

      try {
        const response = await fetch(src, { mode: 'cors' });
        const blob = await response.blob();
        await new Promise<void>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (reader.result && typeof reader.result === 'string') {
              img.src = reader.result;
            }
            resolve();
          };
          reader.onerror = () => resolve();
          reader.readAsDataURL(blob);
        });
      } catch (err) {
        // Fallback: allow html2canvas to try or continue gracefully
        console.warn('Could not pre-fetch image as blob:', src, err);
      }
    })
  );
}

/**
 * Completely purges and converts any modern unsupported color functions
 * (oklch, oklab, lch, lab, color-mix) in stylesheets, SVG defs, and element attributes/styles
 * inside the html2canvas cloned DOM before parsing.
 */
function sanitizeClonedDOMForCanvas(clonedDoc: Document): void {
  try {
    // 1. Sanitize all <style> blocks in the cloned document
    const styleTags = Array.from(clonedDoc.querySelectorAll('style'));
    styleTags.forEach((styleTag) => {
      if (styleTag.textContent && /oklch|oklab|color-mix/i.test(styleTag.textContent)) {
        styleTag.textContent = styleTag.textContent
          .replace(/oklch\([^)]+\)/gi, '#991b1b')
          .replace(/oklab\([^)]+\)/gi, '#991b1b')
          .replace(/color-mix\([^)]+\)/gi, '#991b1b');
      }
    });

    // 2. Disable external style links that might be injecting Tailwind v4 CSS variables
    const linkTags = Array.from(clonedDoc.querySelectorAll('link[rel="stylesheet"]'));
    linkTags.forEach((link) => {
      try {
        link.remove();
      } catch {
        // ignore
      }
    });

    // 3. Walk all elements in the cloned DOM and replace any oklch in inline styles & computed styles
    const allClonedElements = Array.from(clonedDoc.querySelectorAll('*')) as HTMLElement[];
    const colorProps = [
      'color',
      'backgroundColor',
      'borderColor',
      'borderTopColor',
      'borderBottomColor',
      'borderLeftColor',
      'borderRightColor',
      'outlineColor',
      'fill',
      'stroke',
      'textDecorationColor',
    ] as const;

    allClonedElements.forEach((el) => {
      const styleAttr = el.getAttribute('style');
      if (styleAttr && /oklch|oklab|color-mix/i.test(styleAttr)) {
        el.setAttribute(
          'style',
          styleAttr
            .replace(/oklch\([^)]+\)/gi, '#991b1b')
            .replace(/oklab\([^)]+\)/gi, '#991b1b')
            .replace(/color-mix\([^)]+\)/gi, '#991b1b')
        );
      }

      // Check standard color properties on el.style
      const styleObj = el.style;
      if (styleObj) {
        if (/oklch|oklab/i.test(styleObj.color)) styleObj.color = '#111827';
        if (/oklch|oklab/i.test(styleObj.backgroundColor)) styleObj.backgroundColor = '#ffffff';
        if (/oklch|oklab/i.test(styleObj.borderColor)) styleObj.borderColor = '#e5e7eb';
      }

      // Also sanitize computed styles for SVG and modern text elements
      try {
        const computed = (clonedDoc.defaultView || window).getComputedStyle(el);
        colorProps.forEach((prop) => {
          const val = computed[prop as keyof CSSStyleDeclaration] as string;
          if (typeof val === 'string' && /oklch|oklab/i.test(val)) {
            if (prop === 'backgroundColor') {
              el.style.backgroundColor = '#ffffff';
            } else if (prop === 'color' || prop === 'fill') {
              (el.style as any)[prop] = '#111827';
            } else {
              (el.style as any)[prop] = '#e5e7eb';
            }
          }
        });
      } catch {
        // ignore
      }
    });
  } catch (err) {
    console.warn('Error sanitizing cloned DOM for html2canvas:', err);
  }
}

/**
 * Robust, High-Definition PDF generation using html2canvas & jsPDF.
 * Optimized for ID cards (CR80/custom ratio) and documents (A4).
 */
export async function exportElementToPdf({
  elementId,
  filename,
  format = 'id_card',
  onStart,
  onFinish,
  onError,
}: ExportPdfOptions): Promise<void> {
  try {
    if (onStart) onStart();

    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with id "${elementId}" not found for PDF export.`);
    }

    // Ensure all internal images are converted to base64 data URLs to prevent canvas tainting
    await preConvertImagesToBase64(element);

    // Wait 100ms for layout stabilization
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Capture at high resolution (scale: 2.5 is fast, ultra-crisp, and well within mobile/desktop canvas limits)
    const canvas = await html2canvas(element, {
      scale: 2.5,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      imageTimeout: 15000,
      scrollX: 0,
      scrollY: 0,
      windowWidth: element.scrollWidth,
      onclone: (clonedDoc: Document) => {
        sanitizeClonedDOMForCanvas(clonedDoc);
      },
    });

    const imgData = canvas.toDataURL('image/png', 1.0);

    if (format === 'id_card') {
      // Standard ID card proportions (85.6mm x 53.98mm or vertical orientation)
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const aspectRatio = imgHeight / imgWidth;

      // Generous high-res 95mm width for vertical ID badge
      const pdfWidth = 95;
      const pdfHeight = pdfWidth * aspectRatio;

      const pdf = new jsPDF({
        orientation: pdfHeight > pdfWidth ? 'p' : 'l',
        unit: 'mm',
        format: [pdfWidth + 8, pdfHeight + 8], // 4mm margin
      });

      pdf.addImage(imgData, 'PNG', 4, 4, pdfWidth, pdfHeight, undefined, 'FAST');
      pdf.save(`${filename}.pdf`);
    } else {
      // Standard A4 document format (210mm x 297mm)
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const margin = 8;
      const printWidth = pageWidth - margin * 2;
      const printHeight = (canvas.height * printWidth) / canvas.width;

      pdf.addImage(
        imgData,
        'PNG',
        margin,
        margin,
        printWidth,
        Math.min(printHeight, pageHeight - margin * 2),
        undefined,
        'FAST'
      );
      pdf.save(`${filename}.pdf`);
    }

    if (onFinish) onFinish();
  } catch (error) {
    console.error('Error generating PDF:', error);
    if (onError) onError(error);
    if (onFinish) onFinish();
    throw error;
  }
}
