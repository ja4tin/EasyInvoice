import React from 'react';
import { cn } from "@/lib/utils";
import { useGridLayout } from "@/features/editor/hooks/useGridLayout";
import { FileItem } from "@/features/editor/components/FileItem";
import { Voucher } from "@/features/voucher/components/Voucher";
import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useInvoiceStore } from '@/store/useInvoiceStore';
import type { InvoiceItem } from "@/types";

interface GridCanvasProps {
  className?: string;
  children?: React.ReactNode; 
}

// Internal wrapper to handle drag listeners specifically for FileItem
function SortableGridItem({ 
  id, 
  item, 
  className,
  appMode
}: { 
  id: string, 
  item: InvoiceItem, 
  className?: string, 
  appMode: 'payment' | 'invoice' 
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  
  const updateItem = useInvoiceStore(state => state.updateItem);
  const setWorkspace = useInvoiceStore(state => state.setWorkspace);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 'auto',
  };
  
  const handleMove = () => {
     const target = appMode === 'payment' ? 'invoice' : 'payment';
     setWorkspace(item.id, target);
  };

  const moveLabel = appMode === 'payment' ? 'Move to Invoice' : 'Move to Payment';

  return (
    <div ref={setNodeRef} style={style} className={className}>
      <FileItem 
         data={item} 
         className="w-full h-full"
         dragHandleProps={{ ...attributes, ...listeners }}
         onUpdate={(updates) => updateItem(item.id, updates)}
         onDelete={() => setWorkspace(item.id, null)}
         onMove={handleMove}
         moveActionLabel={moveLabel}
      />
    </div>
  );
}

import { useSettingsStore } from '@/store/useSettingsStore';

// ... (previous imports)

export const GridCanvas: React.FC<GridCanvasProps> = ({ className }) => {
  const items = useInvoiceStore(state => state.items);
  const { appMode, invoiceLayout } = useSettingsStore(state => state.settings);

  // Filter items that should be on canvas
  // appMode matches 'payment' | 'invoice', so we can compare directly
  const canvasItems = items.filter(item => item.workspaceId === appMode);
  
  // Grid layout calculation
  const { totalPages, pages } = useGridLayout({
    items: canvasItems,
    columns: 4,
    rows: 6,
    appMode,
    invoiceLayout
  });
  
  const showVoucher = appMode === 'payment'; 

  return (
    <div className="flex flex-col items-center gap-8 py-8 min-w-max">
      <SortableContext items={canvasItems.map(i => `canvas-${i.id}`)}>
        {pages.map((pageItems, pageIndex) => (
          <div 
            key={pageIndex}
            className={cn(
               "relative bg-white shadow-lg print:shadow-none print:m-0 transition-all duration-300",
               appMode === 'invoice' && invoiceLayout === 'cross'
                 ? "w-[297mm] h-[210mm] min-w-[297mm] min-h-[210mm]"
                 : "w-[210mm] h-[297mm] min-w-[210mm] min-h-[297mm]",
               className
             )}
          >
             {/* Grid Overlay */}
             <div className="absolute inset-0 grid grid-cols-4 grid-rows-6 pointer-events-none z-10 pdf-export-hidden">
                {Array.from({ length: 24 }).map((_, i) => (
                  <div key={i} className="border border-slate-200/50" />
                ))}
             </div>

             {/* Content Layer */}
             <div className="relative z-20 w-full h-full p-0">
               {/* Voucher - Only on Page 0 */}
               {pageIndex === 0 && showVoucher && (
                 <div className="absolute top-0 left-0 w-full h-[33.33%] pointer-events-auto p-[5mm]">
                   <Voucher />
                 </div>
               )}

               {/* Items */}
               {pageItems.map((pos) => {
                 const style = {
                   left: `${(pos.x / 4) * 100}%`,
                   top: `${(pos.y / 6) * 100}%`,
                   width: `${(pos.w / 4) * 100}%`,
                   height: `${(pos.h / 6) * 100}%`,
                 };

                 return (
                   <div 
                     key={pos.item.id} 
                     className="absolute p-2"
                     style={style}
                   >
                     <SortableGridItem 
                        id={`canvas-${pos.item.id}`} 
                        item={pos.item}
                        className="w-full h-full"
                        appMode={appMode}
                     />
                   </div>
                 );
               })}
             </div>

             {/* Page Number */}
             <div className="absolute bottom-2 right-4 text-xs text-muted-foreground print:hidden pdf-export-hidden">
               Page {pageIndex + 1}
             </div>
          </div>
        ))}
      </SortableContext>
    </div>
  );
};
