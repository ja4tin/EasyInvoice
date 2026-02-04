import type { InvoiceItem } from '@/types';

export const GRID_COLS = 4;
export const GRID_ROWS = 6;
// Reserve top 2 rows on page 1 for Voucher (if shown)
export const VOUCHER_ROWS = 2; // 1/3 of page roughly

export interface LayoutPosition {
  x: number;
  y: number;
  w: number;
  h: number;
  page: number;
  item: InvoiceItem;
}

export interface LayoutResult {
  pages: LayoutPosition[][]; // Array of pages, each containing items
  totalPages: number;
}

/**
 * Calculates the layout for a list of items on A4 pages.
 * @param items List of invoice items
 * @param showVoucher Whether to reserve space for the voucher on Page 1
 */
import type { AppMode, InvoiceLayout } from '@/types';

// ... existing constants ...

export interface LayoutOptions {
  showVoucher?: boolean;
  appMode?: AppMode;
  invoiceLayout?: InvoiceLayout;
}

export const calculateLayout = (items: InvoiceItem[], options: LayoutOptions = {}): LayoutResult => {
  const { 
    showVoucher = true, 
    appMode = 'payment', 
    invoiceLayout = 'cross' 
  } = options;

  const pages: boolean[][][] = []; // [pageIndex][rowIndex][colIndex] true=occupied
  const results: LayoutPosition[][] = [];

  const getPage = (pageIndex: number) => {
    // Extend pages array if needed
    while (pages.length <= pageIndex) {
      const newPage = Array(GRID_ROWS).fill(false).map(() => Array(GRID_COLS).fill(false));
      
      // Payment Mode: Reserve space for voucher on Page 0
      if (appMode === 'payment' && pages.length === 0 && showVoucher) {
        for (let r = 0; r < VOUCHER_ROWS; r++) {
          for (let c = 0; c < GRID_COLS; c++) {
            newPage[r][c] = true;
          }
        }
      }
      
      pages.push(newPage);
      results.push([]);
    }
    return pages[pageIndex];
  };

  items.forEach((item) => {
    // Default dimensions based on mode
    let w = 2;
    let h = 3; // Default 2x3 (Vertical Standard)

    if (appMode === 'invoice') {
       if (invoiceLayout === 'vertical') {
         // Vertical layout: Top/Bottom split
         w = 4;
         h = 3; 
       } else {
         // Grid layout (default): 2x2 grid
         w = 2;
         h = 3;
       }
       // In invoice mode, we ignore custom item dimensions to enforce uniformity
    } else {
      // Payment Voucher mode: Use defaults or custom dimensions
      if (item.width && item.width > 0) w = item.width;
      if (item.height && item.height > 0) h = item.height;
    }

    // Safety: Clamp dimensions to grid size
    w = Math.min(w, GRID_COLS);
    h = Math.min(h, GRID_ROWS);

    let placed = false;
    let pageIndex = 0;

    // Safety: Prevent infinite loops
    while (!placed && pageIndex < 100) {
      const pageGrid = getPage(pageIndex);
      
      // SPECIAL LOGIC: 4x3 Item on Page 1 with Voucher
      // User Request: "When 4x3, align to bottom grid. Leave empty grid below voucher."
      // Voucher occupies Rows 0, 1.
      // 4x3 needs 3 rows.
      // Normal fit might put it at Row 2 (if available).
      // We want to force it to Row 3 (Rows 3, 4, 5).
      let startRow = 0;
      if (appMode === 'payment' && showVoucher && pageIndex === 0 && w === 4 && h === 3) {
        startRow = 3; // Force start at Row 3 (0-indexed)
      }

      // Find first slot
      for (let r = startRow; r <= GRID_ROWS - h; r++) {
        for (let c = 0; c <= GRID_COLS - w; c++) {
          
          // Check if fits
          let fits = true;
          for (let rowOffset = 0; rowOffset < h; rowOffset++) {
            for (let colOffset = 0; colOffset < w; colOffset++) {
              if (pageGrid[r + rowOffset][c + colOffset]) {
                fits = false;
                break;
              }
            }
            if (!fits) break;
          }

          if (fits) {
            // Place it
            for (let rowOffset = 0; rowOffset < h; rowOffset++) {
              for (let colOffset = 0; colOffset < w; colOffset++) {
                pageGrid[r + rowOffset][c + colOffset] = true;
              }
            }
            results[pageIndex].push({
              x: c,
              y: r,
              w,
              h,
              page: pageIndex,
              item,
            });
            placed = true;
            break; // Break col loop
          }
        }
        if (placed) break; // Break row loop
      }

      if (!placed) {
        pageIndex++;
      }
    }
  });

  return {
    pages: results,
    totalPages: pages.length || 1,
  };
};
