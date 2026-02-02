import { useState, useEffect, type RefObject, useCallback } from 'react';

// A4 Dimensions (96 DPI)
const A4_WIDTH_PX = 794;  // 210mm
const A4_HEIGHT_PX = 1123; // 297mm
const PADDING_PX = 40;    // Margin

export function useZoom(containerRef: RefObject<HTMLElement | null>) {
  const [scale, setScale] = useState(1);
  const [isAutoFit, setIsAutoFit] = useState(true);

  // Calculate AutoFit Scale
  const calculateAutoFit = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const { clientWidth, clientHeight } = container;
    if (clientWidth === 0 || clientHeight === 0) return;

    const availableWidth = clientWidth - PADDING_PX;
    const availableHeight = clientHeight - PADDING_PX;

    const scaleX = availableWidth / A4_WIDTH_PX;
    const scaleY = availableHeight / A4_HEIGHT_PX;

    // Use smaller scale to fit entirely. minimum 0.1
    const newScale = Math.max(0.1, Math.min(scaleX, scaleY));
    setScale(newScale);
  }, [containerRef]);

  // Effect: Auto-calculate when container resizes IF isAutoFit is true
  useEffect(() => {
    if (!isAutoFit) return;

    calculateAutoFit();
    
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(calculateAutoFit);
    observer.observe(container);

    return () => observer.disconnect();
  }, [isAutoFit, calculateAutoFit, containerRef]);

  // Manual Control API
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
    // Immediate recalculate
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
