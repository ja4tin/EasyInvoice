import React from 'react';
import { cn } from "@/lib/utils";
import { FileItem } from "@/features/editor/components/FileItem";
import { Voucher } from "@/features/voucher/components/Voucher";
import type { InvoiceItem } from '@/types';

// Simple wrapper for print view (no drag/drop)
function StaticGridItem({ 
  item, 
  className,
}: { 
  item: InvoiceItem, 
  className?: string, 
}) {
  return (
    <div className={className}>
      <FileItem 
         data={item} 
         className="w-full h-full"
         // No interactions for print
         dragHandleProps={{}}
         onUpdate={() => {}}
         onDelete={() => {}}
         onMove={() => {}}
         moveActionLabel=""
         isSelected={false}
         // Maybe add readOnly prop to FileItem if needed (it renders actions only on hover/select)
         // Since isSelected is false, actions won't show.
      />
    </div>
  );
}

interface GridPageRendererProps {
    pageIndex: number;
    items: { item: InvoiceItem, x: number, y: number, w: number, h: number }[];
    appMode: 'payment' | 'invoice';
    invoiceLayout?: 'cross' | 'vertical';
    showVoucher?: boolean;
    scale?: number; // Optional scaling
    children?: React.ReactNode; // For SortableGridItem injection (if used in main canvas)
    renderItem?: (item: InvoiceItem) => React.ReactNode; // Custom item renderer
}

export const GridPageRenderer = ({
    pageIndex,
    items,
    appMode,
    invoiceLayout = 'cross',
    showVoucher = false,
    renderItem
}: GridPageRendererProps) => {

    const isLandscape = appMode === 'invoice' && invoiceLayout === 'cross';

    return (
        <div 
            id={`page-${appMode}-${pageIndex}`}
            className={cn(
               "relative bg-white shadow-lg print:shadow-none print:m-0 transition-all duration-300 origin-top-left",
               isLandscape
                 ? "w-[297mm] h-[210mm] min-w-[297mm] min-h-[210mm]"
                 : "w-[210mm] h-[297mm] min-w-[210mm] min-h-[297mm]",
               appMode === 'payment' ? "p-[5mm]" : "p-0"
             )}
            // data-orientation used by PDF export
            data-orientation={isLandscape ? 'l' : 'p'}
        >
             {/* Inner Container for Padding/Grid alignment */}
             <div className="relative w-full h-full">
                {/* Grid Overlay for Visual Guide (Hidden in Print) */}
                <div className="absolute inset-0 grid grid-cols-4 grid-rows-6 pointer-events-none z-10 pdf-export-hidden">
                {Array.from({ length: 24 }).map((_, i) => {
                  // If voucher is visible on page 0, hide the grid lines for the first 2 rows (indexes 0-7)
                  const isHiddenByVoucher = pageIndex === 0 && showVoucher && i < 8;
                  return (
                    <div 
                      key={i} 
                      className={cn(
                        "border border-slate-200/50",
                        isHiddenByVoucher && "border-none"
                      )} 
                    />
                  );
                })}
             </div>

             {/* Content Layer */}
             <div className="relative z-20 w-full h-full p-0">
               {/* Voucher - Only on Page 0 */}
               {pageIndex === 0 && showVoucher && (
                 <div 
                   className="absolute top-0 left-0 w-full h-[33.33%] pointer-events-auto p-[5mm]"
                 >
                   <Voucher />
                 </div>
               )}

               {/* Items */}
               {items.map((pos) => {
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
                     {renderItem ? renderItem(pos.item) : (
                         <StaticGridItem 
                            item={pos.item}
                            className="w-full h-full"
                         />
                     )}
                   </div>
                 );
               })}
             </div>

             {/* Page Number */}
             <div className="absolute bottom-2 right-4 text-xs text-muted-foreground print:hidden pdf-export-hidden">
               Page {pageIndex + 1}
             </div>
           </div>
        </div>
    );
};
