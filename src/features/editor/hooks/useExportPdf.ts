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
    
    let orientation: 'p' | 'l' = 'p';
    
    if (appMode === 'invoice') {
        if (invoiceLayout === 'cross') {
            orientation = 'l';
        } else {
            orientation = 'p';
        }
    }

    const filename = appMode === 'payment' ? 'payment_voucher.pdf' : 'reimbursement_invoice.pdf';
    
    // Find all pages
    const pages = document.querySelectorAll('.bg-white.shadow-lg');
    if (!pages || pages.length === 0) {
      console.warn("No pages found to export");
      return null;
    }

    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    for (let i = 0; i < pages.length; i++) {
        const originalPage = pages[i] as HTMLElement;
        
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
        clonedPage.style.zIndex = '-1000';
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
             // Check if value is truly "empty" (0 is considered empty for amount if user desires, but usually 0.00 is a value. 
             // Request says "empty", usually implying no data entry.
             // If type is number, '0' might be default. Let's check if it's '0' or empty.
             // Actually, the user said "Amount and Usage are empty". 
             // In FileItem, empty amount might be rendered as 0 or empty string.
             // Let's assume '0', '0.00' or '' is empty.
             if (val && val !== '0' && val !== '0.00') {
               isEmpty = false;
             }
           });
           
           if (isEmpty) {
             (container as HTMLElement).style.display = 'none';
           }
        });
        
        // 3. Process Inputs: Replace <input> with <div> text
        // We need to query both the original and the clone to map values correctly
        const originalInputs = originalPage.querySelectorAll('input, textarea');
        const clonedInputs = clonedPage.querySelectorAll('input, textarea');
        
        for (let j = 0; j < originalInputs.length; j++) {
            const originalInput = originalInputs[j] as HTMLInputElement | HTMLTextAreaElement;
            const clonedInput = clonedInputs[j] as HTMLInputElement | HTMLTextAreaElement;
            
            // Create a replacement div that looks like the input
            const replacement = document.createElement('div');
            
            // Copy computed styles to ensure it looks identical
            const computedStyle = window.getComputedStyle(originalInput);
            replacement.style.fontFamily = computedStyle.fontFamily;
            replacement.style.fontSize = computedStyle.fontSize;
            replacement.style.fontWeight = computedStyle.fontWeight;
            replacement.style.textAlign = computedStyle.textAlign;
            replacement.style.color = computedStyle.color;
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
            // Handle empty values or 0 properly
            const val = originalInput.value;
            replacement.textContent = val;

            // Add a specific class for debugging if needed
            replacement.className = clonedInput.className; 
            
            // Replace in clone
            if (clonedInput.parentNode) {
                clonedInput.parentNode.replaceChild(replacement, clonedInput);
            }
        }

        // 4. Append clone to body
        document.body.appendChild(clonedPage);
        
        try {
          // 5. Capture
          const canvas = await html2canvas(clonedPage, {
            scale: 2, 
            useCORS: true,
            logging: false,
            // We can leave everything enabled as we've sanitized the inputs
            backgroundColor: '#ffffff' 
          });
          
          const imgData = canvas.toDataURL('image/jpeg', 1.0); // Max quality
          
          const pdfWidth = orientation === 'p' ? 210 : 297;
          const pdfHeight = orientation === 'p' ? 297 : 210;
          
          if (i > 0) {
            pdf.addPage();
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
