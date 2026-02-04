/**
 * Project: EasyInvoice
 * File: useZoom.ts
 * Description: 处理画布缩放逻辑，支持自动适应 (AutoFit) 和手动缩放
 * Author: Ja4tin (ja4tin@hotmail.com)
 * Date: 2026-02-04
 * License: MIT
 */

import { useState, useEffect, type RefObject, useCallback } from 'react';

// A4 尺寸 (96 DPI)
const A4_WIDTH_PX = 794;  // 210mm
const A4_HEIGHT_PX = 1123; // 297mm
const PADDING_PX = 40;    // Margin

export function useZoom(containerRef: RefObject<HTMLElement | null>) {
  const [scale, setScale] = useState(0.85);
  const [isAutoFit, setIsAutoFit] = useState(false);

  // 计算自适应比例
  const calculateAutoFit = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const { clientWidth, clientHeight } = container;
    if (clientWidth === 0 || clientHeight === 0) return;

    const availableWidth = clientWidth - PADDING_PX;
    const availableHeight = clientHeight - PADDING_PX;

    const scaleX = availableWidth / A4_WIDTH_PX;
    const scaleY = availableHeight / A4_HEIGHT_PX;

    // 取较小值以确保完全放入，最小值 0.1
    const newScale = Math.max(0.1, Math.min(scaleX, scaleY));
    setScale(newScale);
  }, [containerRef]);

  // Effect: 如果开启自适应，随容器大小自动计算
  useEffect(() => {
    if (!isAutoFit) return;

    calculateAutoFit();
    
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(calculateAutoFit);
    observer.observe(container);

    return () => observer.disconnect();
  }, [isAutoFit, calculateAutoFit, containerRef]);

  // 手动控制 API
  const zoomIn = () => {
    setIsAutoFit(false);
    setScale(s => Math.min(2.0, s + 0.1));
  };

  const zoomOut = () => {
    setIsAutoFit(false);
    setScale(s => Math.max(0.1, s - 0.1));
  };

  const setManualScale = (value: number) => {
    setIsAutoFit(false);
    setScale(Math.max(0.1, Math.min(2.0, value)));
  };

  const resetToAuto = () => {
    setIsAutoFit(true);
    // 立即重新计算
    setTimeout(calculateAutoFit, 0); 
  };

  return {
    scale,
    isAutoFit,
    zoomIn,
    zoomOut,
    setManualScale,
    resetToAuto
  };
}
