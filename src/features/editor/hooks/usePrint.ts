import { useCallback } from 'react';
import { useExportPdf } from './useExportPdf';

export function usePrint() {
  const { generatePdfUrl } = useExportPdf();

  const print = useCallback(async () => {
    try {
      const result = await generatePdfUrl();
      if (!result) return;

      const { url } = result;

      // Create a hidden iframe
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.top = '-9999px';
      iframe.style.left = '-9999px';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.src = url;

      document.body.appendChild(iframe);

      // Wait for content to load then print
      iframe.onload = () => {
        // Short delay to ensure PDF rendering
        setTimeout(() => {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          
          // Cleanup after print dialog usage (approximate, hard to know exactly when closed)
          // Ideally we remove it after some time or usage. 
          // Since it's a blob url, we should also revoke it.
          // For simplicity, remove iframe after a delay.
          setTimeout(() => {
             document.body.removeChild(iframe);
             URL.revokeObjectURL(url);
          }, 60000); // 1 min delay to allow print
        }, 500);
      };

    } catch (error) {
      console.error("Print failed:", error);
    }
  }, [generatePdfUrl]);

  return { print };
}
