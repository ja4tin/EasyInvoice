import { useEffect, useRef } from 'react';
import { useInvoiceStore } from '@/store/useInvoiceStore';
import { useGridLayout } from './useGridLayout';
import type { InvoiceItem } from '@/types';
import type { AppMode, InvoiceLayout } from '@/types';

interface UseAutoResizeProps {
  items: InvoiceItem[];
  appMode: AppMode;
  invoiceLayout: InvoiceLayout;
  isVoucherVisible: boolean;
}

export const useAutoResize = ({ items, appMode, invoiceLayout, isVoucherVisible }: UseAutoResizeProps) => {
  const updateItem = useInvoiceStore((state) => state.updateItem);
  
  // Track previous page index and dimensions for each item
  const prevPageMapRef = useRef<Record<string, { page: number, w: number, h: number }>>({});
  
  // Calculate layout - this returns new references every render
  const { pages } = useGridLayout({ 
    items, 
    columns: 4, 
    rows: 6, 
    appMode, 
    invoiceLayout, 
    isVoucherVisible 
  });

  // Create a stable string representation of item->page mapping to use as effect dependency
  // This avoids reacting to new 'pages' array references if the actual layout hasn't changed
  const currentPageMap: Record<string, number> = {};
  pages.forEach((pageItems, pageIndex) => {
    pageItems.forEach(layoutPos => {
      if (layoutPos.item && layoutPos.item.id) {
        currentPageMap[layoutPos.item.id] = pageIndex;
      }
    });
  });
  
  const layoutSignature = JSON.stringify(currentPageMap);

  useEffect(() => {
    const prevMap = prevPageMapRef.current;
    
    // Check for transitions
    Object.keys(currentPageMap).forEach(itemId => {
      const currentPage = currentPageMap[itemId];
      const prevData = prevMap[itemId];
      const item = items.find(i => i.id === itemId);

      if (item && prevData && currentPage !== prevData.page) {
        // Case A: Moved TO Page 1 (Index 0)
        // Only apply "Special Sizes" if Voucher is visible
        if (currentPage === 0 && prevData.page !== 0 && isVoucherVisible) {
           if (item.width === 4 && item.height === 3) {
             updateItem(itemId, { width: 4, height: 2 });
           }
           if (item.width === 2 && item.height === 3) {
             updateItem(itemId, { width: 2, height: 4 });
           }
        }
        
        // Case B: Moved FROM Page 1 (Index 0) to another page
        // Only apply if the item WAS ALREADY the special size on Page 0.
        // This prevents auto-downgrading if the user JUST resized it to 2x4 and it overflowed to Page 1.
        if (prevData.page === 0 && currentPage !== 0) {
           if (item.width === 4 && item.height === 2 && prevData.w === 4 && prevData.h === 2) {
             updateItem(itemId, { width: 4, height: 3 });
           }
           if (item.width === 2 && item.height === 4 && prevData.w === 2 && prevData.h === 4) {
             updateItem(itemId, { width: 2, height: 3 });
           }
        }
      }
    });

    // Update ref with current state AND dimensions
    const newMap: Record<string, { page: number, w: number, h: number }> = {};
    Object.keys(currentPageMap).forEach(id => {
       const item = items.find(i => i.id === id);
       if (item) {
           newMap[id] = { page: currentPageMap[id], w: item.width || 2, h: item.height || 3 };
       }
    });

    prevPageMapRef.current = newMap;
    
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layoutSignature, updateItem]); // Only run when layout mapping actually changes
};
