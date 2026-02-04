/**
 * Project: EasyInvoice
 * File: useAutoResize.ts
 * Description: 自动调整发票尺寸 Hook，处理跨页移动时的尺寸适应逻辑
 * Author: Ja4tin (ja4tin@hotmail.com)
 * Date: 2026-02-04
 * License: MIT
 */

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
  
  // 追踪每个 Item 的上一页索引和尺寸
  const prevPageMapRef = useRef<Record<string, { page: number, w: number, h: number }>>({});
  
  // 计算布局 - 这在每次渲染时都会返回新的引用
  const { pages } = useGridLayout({ 
    items, 
    columns: 4, 
    rows: 6, 
    appMode, 
    invoiceLayout, 
    isVoucherVisible 
  });

  // 创建一个稳定的字符串表示来映射 item->page，用作 effect 依赖
  // 这避免了如果实际布局未更改但 'pages' 数组引用更新时的频繁触发
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
    
    // 检查是否有位置变动
    Object.keys(currentPageMap).forEach(itemId => {
      const currentPage = currentPageMap[itemId];
      const prevData = prevMap[itemId];
      const item = items.find(i => i.id === itemId);

      if (item && prevData && currentPage !== prevData.page) {
        // 情况 A: 移动到 第1页 (Index 0)
        // 仅在凭单可见时应用 "特殊尺寸"
        if (currentPage === 0 && prevData.page !== 0 && isVoucherVisible) {
           if (item.width === 4 && item.height === 3) {
             updateItem(itemId, { width: 4, height: 2 });
           }
           if (item.width === 2 && item.height === 3) {
             updateItem(itemId, { width: 2, height: 4 });
           }
        }
        
        // 情况 B: 从 第1页 (Index 0) 移出到其他页面
        // 仅当 item 已经在 Page 0 处于特殊尺寸时才应用。
        // 这防止了用户手动调整为 2x4 并导致溢出到 Page 1 时的自动降级。
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

    // 更新 ref 为当前状态和尺寸
    const newMap: Record<string, { page: number, w: number, h: number }> = {};
    Object.keys(currentPageMap).forEach(id => {
       const item = items.find(i => i.id === id);
       if (item) {
           newMap[id] = { page: currentPageMap[id], w: item.width || 2, h: item.height || 3 };
       }
    });

    prevPageMapRef.current = newMap;
    
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layoutSignature, updateItem]); // 仅当布局映射实际更改时运行
};
