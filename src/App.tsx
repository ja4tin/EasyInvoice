import { useRef } from "react";
import { Layout } from "@/components/Layout";
import { GridCanvas } from "@/features/editor/components/GridCanvas";
import { DragDropProvider } from "@/providers/DragDropProvider";
import { useZoom } from "@/features/editor/hooks/useZoom";
import { ZoomControls } from "@/features/editor/components/ZoomControls";

function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scale, isAutoFit, zoomIn, zoomOut, setManualScale, resetToAuto } = useZoom(containerRef);

  return (
    <DragDropProvider>
      <Layout>
        <div 
          ref={containerRef} 
          className="w-full h-full overflow-y-auto bg-muted/50 scroll-smooth relative"
        >
          <div className="min-h-full w-full flex flex-col items-center py-10 origin-top">
            <div 
              style={{ 
                transform: `scale(${scale})`,
                transformOrigin: 'top center',
                transition: 'transform 0.1s ease-out'
              }}
            >
            <GridCanvas />
            </div>
          </div>

          {/* Zoom Controls Overlay */}
          <div className="fixed bottom-6 right-80 z-50">
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
