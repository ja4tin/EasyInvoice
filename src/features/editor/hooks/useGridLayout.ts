import { useMemo } from 'react';
import { useInvoiceStore } from '@/store/useInvoiceStore';
import { calculateLayout, type LayoutPosition } from '../utils/grid-layout';

export interface UseGridLayoutResult {
  pages: LayoutPosition[][];
  totalPages: number;
}

export function useGridLayout(): UseGridLayoutResult {
  const items = useInvoiceStore((state) => state.items);
  // In future we might have a setting to toggle voucher, for now hardcoded true or from store if we add it
  const showVoucher = true; 

  const layout = useMemo(() => {
    return calculateLayout(items, showVoucher);
  }, [items, showVoucher]);

  return layout;
}
