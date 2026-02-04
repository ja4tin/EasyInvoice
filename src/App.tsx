import { useRef } from "react";
import { Layout } from "@/components/Layout";
import { GridCanvas } from "@/features/editor/components/GridCanvas";
import { DragDropProvider } from "@/providers/DragDropProvider";
import { useZoom } from "@/features/editor/hooks/useZoom";
import { ZoomControls } from "@/features/editor/components/ZoomControls";
import { useSettingsStore } from "@/store/useSettingsStore";

function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scale, isAutoFit, zoomIn, zoomOut, setManualScale, resetToAuto } = useZoom(containerRef);
  const { appMode, invoiceLayout } = useSettingsStore(state => state.settings);

  // Determine base dimensions in pixels (approx 3.78 px/mm)
  // A4: 210mm x 297mm
  // We use CSS mm units for display, but for layout wrapper we can use exact CSS strings
  const isLandscape = appMode === 'invoice' && invoiceLayout === 'cross';
  
  // We must match the dimensions defined in GridCanvas.tsx
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
            {/* Centering Wrapper: Applies margin: auto to center content when smaller than viewport */}
            <div className="m-auto py-10 origin-top p-[100px]">
               {/* Scalable Container: reserves the physical space for the scaled content */}
               <div 
                 style={{ 
                   width: `calc(${baseWidth} * ${scale})`,
                   height: `calc(${baseHeight} * ${scale - 0.05})`, // Slight adjustment to prevent unnecessary vertical overflow if perfectly fit
                   position: 'relative'
                 }}
               >
                  {/* Visual Transform Layer */}
                  <div 
                    style={{ 
                      transform: `scale(${scale})`,
                      transformOrigin: 'top left',
                      transition: 'transform 0.1s ease-out',
                      width: baseWidth,
                      height: baseHeight // Enforce base height to overlapping content flow
                    }}
                  >
                    <GridCanvas />
                  </div>
               </div>
            </div>
          </div>

          {/* Zoom Controls Overlay - Absolute to Wrapper */}
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
      </Layout>
    </DragDropProvider>
  );
}

export default App;
