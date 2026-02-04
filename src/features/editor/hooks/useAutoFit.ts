/**
 * Project: EasyInvoice
 * File: useAutoFit.ts
 * Description: 自动计算缩放比例，使 A4 内容适应容器
 * Author: Ja4tin (ja4tin@hotmail.com)
 * Date: 2026-02-04
 * License: MIT
 */

import { useState, useEffect, type RefObject } from 'react';

// A4 尺寸 (96 DPI)
const A4_WIDTH_PX = 794;  // 210mm
const A4_HEIGHT_PX = 1123; // 297mm
const PADDING_PX = 40;    // 留白

export function useAutoFit(containerRef: RefObject<HTMLElement | null>) {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const calculateScale = () => {
      const { clientWidth, clientHeight } = container;
      if (clientWidth === 0 || clientHeight === 0) return;

      const availableWidth = clientWidth - PADDING_PX;
      const availableHeight = clientHeight - PADDING_PX;

      const scaleX = availableWidth / A4_WIDTH_PX;
      const scaleY = availableHeight / A4_HEIGHT_PX;

      // 取较小值以确保完全放入
      const newScale = Math.min(scaleX, scaleY);
      
      // 保持一定的最小值，避免太小不可见
      setScale(Math.max(0.1, newScale)); 
    };

    // 初始计算
    calculateScale();

    // 监听 Resize
    const observer = new ResizeObserver(calculateScale);
    observer.observe(container);

    return () => observer.disconnect();
  }, [containerRef]);

  return scale;
}
