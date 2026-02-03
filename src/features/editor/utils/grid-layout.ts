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

  items.forEach((item, index) => {
    let w = 2; // Default 2x2 (Payment Mode)
    let h = 2;

    // Invoice Mode Layout Logic
    if (appMode === 'invoice') {
       if (invoiceLayout === 'vertical') {
         // 1x2 Grid: Full Width, Half Height
         w = 4;
         h = 3; 
       } else {
         // Cross (2x2) Grid: Half Width, Half Height
         w = 2;
         h = 3;
       }
    }

    let placed = false;
    let pageIndex = 0;

    while (!placed) {
      const pageGrid = getPage(pageIndex);
      
      // Optimization for standard layouts to skip occupied rows faster
      // Not strictly necessary but good for performance if many items
      
      // Find first slot
      for (let r = 0; r <= GRID_ROWS - h; r++) {
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
