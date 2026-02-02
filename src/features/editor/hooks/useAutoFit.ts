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

      // 取较小值以确保完全放入，且最大不超过 1 (如果不希望放大的话，但为了适配大屏，通常也不限制放大，或者限制在1.5?)
      // 用户要求“看见一整个A4页面”，通常意味着Fit。如果屏幕很大，放大也是合理的。
      // 这里暂不限制最大值，或者限制为 1.2 以免过大。
      // 考虑到用户体验，通常 fit-to-screen 意味着自适应。
      const newScale = Math.min(scaleX, scaleY);
      
      // 保持一定的最小值，避免太小不可见（极端情况）
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
