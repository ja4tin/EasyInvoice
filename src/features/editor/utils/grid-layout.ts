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
export const calculateLayout = (items: InvoiceItem[], showVoucher: boolean = true): LayoutResult => {
  const pages: boolean[][][] = []; // [pageIndex][rowIndex][colIndex] true=occupied
  const results: LayoutPosition[][] = [];

  const getPage = (pageIndex: number) => {
    // Extend pages array if needed
    while (pages.length <= pageIndex) {
      const newPage = Array(GRID_ROWS).fill(false).map(() => Array(GRID_COLS).fill(false));
      
      // If Page 0 and voucher is shown, mark top rows as occupied
      if (pages.length === 0 && showVoucher) {
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
    // Determine item grid size. 
    // Default 2x2.
    // If we support resizing later, we'd read item.width/height or a specific gridW/gridH prop.
    // For now assuming all are 2x2 based on specs (Task-203 MVP default says 2x2).
    // Let's assume item has gridW/gridH or we default to 2.
    // Spec says: "默认占用 2x2 网格".
    const w = 2;
    const h = 2;

    let placed = false;
    let pageIndex = 0;

    while (!placed) {
      const pageGrid = getPage(pageIndex);
      
      // Find first slot
      // Basic approach: Iterate row by row, col by col
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
        // Try next page
        pageIndex++;
      }
    }
  });

  return {
    pages: results,
    totalPages: pages.length || 1, // Ensure at least 1 page exists
  };
};
