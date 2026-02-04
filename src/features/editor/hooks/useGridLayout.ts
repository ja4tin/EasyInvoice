/**
 * Project: EasyInvoice
 * File: useGridLayout.ts
 * Description: 计算发票网格布局 Hook
 * Author: Ja4tin (ja4tin@hotmail.com)
 * Date: 2026-02-04
 * License: MIT
 */

import { useMemo } from 'react';
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
  isVoucherVisible?: boolean;
}

export function useGridLayout({ 
  items, 
  appMode = 'payment', 
  invoiceLayout = 'cross',
  isVoucherVisible = true
}: UseGridLayoutProps): UseGridLayoutResult {
  
  const layout = useMemo(() => {
    return calculateLayout(items, { 
      showVoucher: isVoucherVisible, 
      appMode, 
      invoiceLayout 
    });
  }, [items, isVoucherVisible, appMode, invoiceLayout]);

  return layout;
}
