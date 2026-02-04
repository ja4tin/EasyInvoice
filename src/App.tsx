/**
 * Project: EasyInvoice
 * File: App.tsx
 * Description: 应用根组件，包含拖拽上下文和缩放逻辑
 * Author: Ja4tin (ja4tin@hotmail.com)
 * Date: 2026-02-04
 * License: MIT
 */

import { useRef } from "react";
import { Layout } from "@/components/Layout";
import { GridCanvas } from "@/features/editor/components/GridCanvas";
import { DragDropProvider } from "@/providers/DragDropProvider";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { useZoom } from "@/features/editor/hooks/useZoom";
import { ZoomControls } from "@/features/editor/components/ZoomControls";
import { useSettingsStore } from "@/store/useSettingsStore";

function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scale, isAutoFit, zoomIn, zoomOut, setManualScale, resetToAuto } = useZoom(containerRef);
  const { appMode, invoiceLayout } = useSettingsStore(state => state.settings);

  // 确定基础尺寸 (像素近似值 3.78 px/mm)
  // A4: 210mm x 297mm
  // 我们使用 CSS mm 单位进行显示，但对于布局包裹器，我们可以使用精确的 CSS 字符串
  const isLandscape = appMode === 'invoice' && invoiceLayout === 'cross';
  
  // 必须匹配 GridCanvas.tsx 中定义的尺寸
  const baseWidth = isLandscape ? '297mm' : '210mm';
  const baseHeight = isLandscape ? '210mm' : '297mm';

  return (
    <DragDropProvider>
      <Layout>
        <div className="relative w-full h-full overflow-hidden">
          <div 
            id="invoice-scroll-container"
            ref={containerRef} 
            className="w-full h-full overflow-auto bg-muted/50 scroll-smooth relative flex"
          >
            {/* 居中包裹器: 当内容小于视口时，应用 margin: auto 进行居中 */}
            <div className="m-auto py-10 origin-top p-[100px]">
               {/* 缩放容器: 为缩放后的内容预留物理空间 */}
               <div 
                 style={{ 
                   width: `calc(${baseWidth} * ${scale})`,
                   height: `calc(${baseHeight} * ${scale - 0.05})`, // 微调以防止完美契合时不必要的垂直溢出
                   position: 'relative'
                 }}
               >
                  {/*以此为中心进行视觉变换 */}
                  <div 
                    style={{ 
                      transform: `scale(${scale})`,
                      transformOrigin: 'top left',
                      transition: 'transform 0.1s ease-out',
                      width: baseWidth,
                      height: baseHeight // 强制基础高度以重叠内容流
                    }}
                  >
                    <GridCanvas />
                  </div>
               </div>
            </div>
          </div>

          {/* 缩放控制悬浮窗 - 绝对定位 */}
          <div className="absolute bottom-6 right-6 z-50">
             <ZoomControls 
               scale={scale}
               isAutoFit={isAutoFit}
               onZoomIn={zoomIn}
               onZoomOut={zoomOut}
               onScaleChange={setManualScale}
               onReset={resetToAuto}
             />
          </div>
        </div>
        <LoadingOverlay />
      </Layout>
    </DragDropProvider>
  );
}

export default App;
