import { useMemo } from 'react';
import { useInvoiceStore } from '@/store/useInvoiceStore';
import { calculateLayout, type LayoutPosition } from '../utils/grid-layout';

import { type InvoiceItem, type AppMode, type InvoiceLayout } from '@/types';

export interface UseGridLayoutResult {
  pages: LayoutPosition[][];
  totalPages: number;
}

export interface UseGridLayoutProps {
  items: InvoiceItem[];
  columns?: number;
  rows?: number;
  appMode?: AppMode;
  invoiceLayout?: InvoiceLayout;
}

export function useGridLayout({ 
  items, 
  appMode = 'payment', 
  invoiceLayout = 'cross' 
}: UseGridLayoutProps): UseGridLayoutResult {
  const showVoucher = true; // Still conditionally used inside calculateLayout based on appMode

  const layout = useMemo(() => {
    return calculateLayout(items, { 
      showVoucher, 
      appMode, 
      invoiceLayout 
    });
  }, [items, showVoucher, appMode, invoiceLayout]);

  return layout;
}
