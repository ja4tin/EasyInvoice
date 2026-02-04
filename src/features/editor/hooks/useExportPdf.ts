import { useCallback } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { useSettingsStore } from '@/store/useSettingsStore';

export function useExportPdf() {
  const { appMode, invoiceLayout } = useSettingsStore(state => state.settings);

  const generatePdf = useCallback(async () => {
    // Determine orientation based on appMode and invoiceLayout
    // Payment -> Portrait (p)
    // Invoice -> 
    //   - Cross (2x2) -> Landscape (l)
    //   - Vertical (1x2) -> Portrait (p)
    
    const filename = 'combined_export.pdf';
    
    // Find all pages inside the print container
    const printContainer = document.getElementById('print-container');
    if (!printContainer) {
        console.error("Print container not found");
        return null;
    }

    // We select the children divs of .print-page-wrapper > .bg-white
    const pages = printContainer.querySelectorAll('.print-page-wrapper > div');

    if (!pages || pages.length === 0) {
      console.warn("No pages found to export");
      return null;
    }

    // Initialize PDF (Orientation will be set per page)
    const firstPage = pages[0] as HTMLElement;
    const firstOrientation = firstPage.getAttribute('data-orientation') || 'p';
    
    // jsPDF instantiation
    const pdf = new jsPDF({
      orientation: firstOrientation as 'p' | 'l',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    for (let i = 0; i < pages.length; i++) {
        const originalPage = pages[i] as HTMLElement;
        const orientation = originalPage.getAttribute('data-orientation') || 'p';

        // 1. Clone the page
        const clonedPage = originalPage.cloneNode(true) as HTMLElement;
        
        // 2. Prepare the clone for capture
        // - Remove shadow
        clonedPage.style.boxShadow = 'none';
        clonedPage.style.margin = '0';
        // - Position off-screen but visible
        clonedPage.style.position = 'fixed';
        clonedPage.style.top = '-9999px';
        clonedPage.style.left = '-9999px';
        clonedPage.style.zIndex = '5000'; // Make sure it's above hidden container? invalid z-index, but needs to be rendered.
        // Actually, if it's in a hidden container (opacity 0), html2canvas might record it as transparent?
        // Safe bet: append to document.body, make it visible there.
        clonedPage.style.opacity = '1'; 
        clonedPage.style.visibility = 'visible';

        // - Ensure dimensions are locked (A4)
        const isLandscape = orientation === 'l';
        clonedPage.style.width = isLandscape ? '297mm' : '210mm';
        clonedPage.style.height = isLandscape ? '210mm' : '297mm';
        
        // Hide elements marked for hiding (Grid lines, Page numbers)
        const hiddenElements = clonedPage.querySelectorAll('.pdf-export-hidden');
        hiddenElements.forEach(el => {
           (el as HTMLElement).style.display = 'none';
        });

        // Hide empty input containers (Amount & Usage)
        const inputContainers = clonedPage.querySelectorAll('.export-input-container');
        inputContainers.forEach(container => {
           const inputs = container.querySelectorAll('input');
           let isEmpty = true;
           inputs.forEach(input => {
             const val = input.value.trim();
             if (val && val !== '0' && val !== '0.00') {
               isEmpty = false;
             }
           });
           
           if (isEmpty) {
             (container as HTMLElement).style.display = 'none';
           }
        });
        
        // 3. Process Inputs: Replace <input> with <div> text
        // Query original from PrintContainer to get values? 
        // Inputs in PrintContainer are fully rendered? Yes.
        // But are they bound to values? Yes, they are React components in PrintContainer.
        const originalInputs = originalPage.querySelectorAll('input, textarea');
        const clonedInputs = clonedPage.querySelectorAll('input, textarea');
        
        for (let j = 0; j < originalInputs.length; j++) {
            const originalInput = originalInputs[j] as HTMLInputElement | HTMLTextAreaElement;
            const clonedInput = clonedInputs[j] as HTMLInputElement | HTMLTextAreaElement;
            
            // Create a replacement div that looks like the input
            const replacement = document.createElement('div');
            
            // Copy computed styles to ensure it looks identical
            // NOTE: originalInput is inside a hidden/opacity-0 container. COMPUTED STYLES MIGHT BE WEIRD?
            // "visibility: hidden" elements have styles. "display: none" elements don't.
            // PrintContainer is "opacity-0 pointer-events-none". It is visible in layout.
            const computedStyle = window.getComputedStyle(originalInput);

            replacement.style.fontFamily = computedStyle.fontFamily;
            replacement.style.fontSize = computedStyle.fontSize;
            replacement.style.fontWeight = computedStyle.fontWeight;
            replacement.style.textAlign = computedStyle.textAlign;
            replacement.style.color = computedStyle.color; // Might be transparent if opacity inherited? No, opacity is on parent.
            replacement.style.boxSizing = computedStyle.boxSizing;
            
            // Critical: Copy exact dimensions and box model
            replacement.style.width = computedStyle.width;
            replacement.style.height = computedStyle.height;
            replacement.style.padding = computedStyle.padding;
            replacement.style.margin = computedStyle.margin;
            replacement.style.lineHeight = computedStyle.lineHeight;

            replacement.style.backgroundColor = 'transparent'; 
            replacement.style.border = 'none'; 
            
            // Use flex to ensure vertical alignment matches input behavior
            replacement.style.display = 'flex';
            replacement.style.alignItems = 'center'; 
            
            // Handle alignment based on text-align
            if (computedStyle.textAlign === 'center') replacement.style.justifyContent = 'center';
            else if (computedStyle.textAlign === 'right') replacement.style.justifyContent = 'flex-end';
            else replacement.style.justifyContent = 'flex-start';

            // Set text value
            const val = originalInput.value;
            replacement.textContent = val;

            replacement.className = clonedInput.className; 
            
            if (clonedInput.parentNode) {
                clonedInput.parentNode.replaceChild(replacement, clonedInput);
            }
        }

        // 4. Append clone to body (outside hidden container)
        document.body.appendChild(clonedPage);
        
        try {
          // 5. Capture
          const canvas = await html2canvas(clonedPage, {
            scale: 2, 
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            // Increase timeout for loading?
            onclone: () => {
                // Ensure opacity is reset if it leaked
                // (Done via style above)
            }
          });
          
          const imgData = canvas.toDataURL('image/jpeg', 1.0); // Max quality
          
          const pdfWidth = isLandscape ? 297 : 210;
          const pdfHeight = isLandscape ? 210 : 297;
          
          if (i > 0) {
            pdf.addPage('a4', isLandscape ? 'l' : 'p');
          }
          
          pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
          
        } catch (err) {
          console.error("Error generating PDF page", i, err);
        } finally {
          // 6. Cleanup
          document.body.removeChild(clonedPage);
        }
    }

    return { pdf, filename };

  }, [appMode, invoiceLayout]);

  const generatePdfUrl = useCallback(async () => {
    const result = await generatePdf();
    if (!result) return null;
    
    const blob = result.pdf.output('blob');
    return { 
        url: URL.createObjectURL(blob), 
        filename: result.filename 
    };
  }, [generatePdf]);

  return { generatePdfUrl };
}
