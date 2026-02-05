/**
 * Project: EasyInvoice
 * File: grid-layout.ts
 * Description: 核心排版算法，负责计算发票在 A4 页面的位置及分页逻辑
 * Author: Ja4tin (ja4tin@hotmail.com)
 * Date: 2026-02-04
 * License: MIT
 */

import type { InvoiceItem } from '@/types';
import type { AppMode, InvoiceLayout } from '@/types';

export const GRID_COLS = 4;
export const GRID_ROWS = 6;
// 第1页为凭单预留顶部2行 (如果显示)
export const VOUCHER_ROWS = 2; 

export interface LayoutPosition {
  x: number;
  y: number;
  w: number;
  h: number;
  page: number;
  item: InvoiceItem;
}

export interface LayoutResult {
  pages: LayoutPosition[][]; // 页面数组，包含该页所有项目
  totalPages: number;
}

export interface LayoutOptions {
  showVoucher?: boolean;
  appMode?: AppMode;
  invoiceLayout?: InvoiceLayout;
}

/**
 * 计算发票列表在 A4 页面上的布局
 * @param items 发票项目列表
 * @param options 布局选项
 */
export const calculateLayout = (items: InvoiceItem[], options: LayoutOptions = {}): LayoutResult => {
  const { 
    showVoucher = true, 
    appMode = 'payment', 
    invoiceLayout = 'cross' 
  } = options;

  const pages: boolean[][][] = []; // [pageIndex][rowIndex][colIndex] true=occupied
  const results: LayoutPosition[][] = [];

  const getPage = (pageIndex: number) => {
    // 按需扩展页面数组
    while (pages.length <= pageIndex) {
      const newPage = Array(GRID_ROWS).fill(false).map(() => Array(GRID_COLS).fill(false));
      
      // 付款凭单模式：在 Page 0 预留凭单位置
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
    // 根据模式确定默认尺寸
    let w = 2;
    let h = 3; // 默认 2x3 (Vertical Standard)

    if (appMode === 'invoice') {
       if (invoiceLayout === 'vertical') {
         // 垂直分栏布局: 上下分栏
         w = 4;
         h = 3; 
       } else {
         // 田字格布局: 2x2
         w = 2;
         h = 3;
       }
       // 发票模式下忽略自定义尺寸以强制统一
    } else {
      // 付款凭单模式：使用默认或自定义尺寸
      if (item.width && item.width > 0) w = item.width;
      if (item.height && item.height > 0) h = item.height;
    }

    // 安全检查：限制尺寸不超过网格大小
    w = Math.min(w, GRID_COLS);
    h = Math.min(h, GRID_ROWS);

    let placed = false;
    let pageIndex = 0;

    // 安全检查：防止无限循环
    while (!placed && pageIndex < 100) {
      const pageGrid = getPage(pageIndex);
      
      // 特殊逻辑: 4x3 Item 在 Page 1 且有凭单时
      // 当 4x3 时，对齐到底部网格。凭单占据 Row 0, 1.
      // 4x3 需要 3 行。正常可能放入 Row 2 (如果空)，但我们希望强制到底部 (Rows 3, 4, 5)。
      // 实际 Row 2 + 3 行 = Row 2, 3, 4 (5行)。
      let startRow = 0;
      if (appMode === 'payment' && showVoucher && pageIndex === 0 && w === 4 && h === 3) {
        startRow = 3; // 强制从 Row 3 开始 (0-indexed)
      }

      // 寻找第一个可用位置
      for (let r = startRow; r <= GRID_ROWS - h; r++) {
        for (let c = 0; c <= GRID_COLS - w; c++) {
          
          // 检查是否能放入
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
            // 放置项目
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

  // Fix: 如果显示凭单且没有生成页面（例如没有上传文件），强制生成第一页以显示凭单
  if (pages.length === 0 && appMode === 'payment' && showVoucher) {
      getPage(0);
  }

  return {
    pages: results,
    totalPages: pages.length || 1,
  };
};
