import { type InvoiceItem } from "@/types";
import { cn } from "@/lib/utils";
import { RotateCw, Trash2, ArrowRightLeft } from "lucide-react";

interface FileItemProps {
  data: InvoiceItem;
  isSelected?: boolean;
  className?: string;
  onSelect?: () => void;
  onDelete?: () => void;
  onUpdate?: (updates: Partial<InvoiceItem>) => void;
  onMove?: () => void; // New prop for moving workspaces
  moveActionLabel?: string; // Tooltip text
  dragHandleProps?: Record<string, any>; // For dnd-kit listeners/attributes
}

export function FileItem({ 
  data, 
  isSelected = false, 
  className,
  onSelect, 
  onDelete,
  onUpdate,
  onMove,
  moveActionLabel = "Move to other workspace",
  dragHandleProps
}: FileItemProps) {
  const { fileData, amount } = data;

  return (
    <div 
      className={cn(
        "group relative flex flex-col bg-white rounded-lg shadow-sm border transition-all duration-200 hover:shadow-md select-none pdf-export-border-none",
        isSelected ? "ring-2 ring-primary border-primary z-10" : "border-slate-200 hover:border-slate-300",
        className
      )}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.();
      }}
    >
      {/* Visual Header / Drag Handle (Hover Only) */}
      <div 
        className="absolute top-0 inset-x-0 z-20 h-7 bg-white/95 backdrop-blur-sm border-b border-slate-100 flex items-center justify-between px-2 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        {...dragHandleProps}
      >
         <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider truncate max-w-[120px]" title={data.name}>{data.name || 'RECEIPT'}</span>
         {/* Hover Actions */}
         <div className="flex gap-1">
             {onMove && (
              <button 
                tabIndex={-1}
                className="p-1 hover:bg-blue-50 rounded text-slate-500 hover:text-blue-600 transition-colors"
                onClick={(e) => { e.stopPropagation(); onMove(); }}
                onPointerDown={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                title={moveActionLabel}
              >
                <ArrowRightLeft size={13} />
              </button>
            )}
            <button 
              tabIndex={-1}
              className="p-1 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-700 transition-colors"
              onClick={(e) => { 
                e.stopPropagation(); 
                const newRotation = (data.rotation || 0) + 90;
                onUpdate?.({ rotation: newRotation });
              }}
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              title="Rotate 90°"
            >
              <RotateCw size={13} />
            </button>
            <button 
              tabIndex={-1}
              className="p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-500 transition-colors"
              onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <Trash2 size={13} />
            </button>
         </div>
      </div>

      {/* Image Preview Area (Maximize Space) */}
      <div className="flex-1 min-h-0 w-full bg-slate-100 pdf-export-bg-white overflow-hidden relative flex items-center justify-center rounded-t-lg">
        {fileData ? (
          <img 
            src={fileData} 
            alt="invoice" 
            style={{ 
              transform: (() => {
                const r = data.rotation || 0;
                // Check if rotated 90 or 270 degrees
                if (Math.abs(r % 180) === 90) {
                  // Calculate scale to fit. 
                   // If w=2, h=4: we need to fit '4' into '2' (scale 0.5) and '2' into '4' (fine).
                  const w = data.width || 2;
                  const h = data.height || 2;
                  const scale = Math.min(w/h, h/w);
                  return `rotate(${r}deg) scale(${scale})`;
                }
                return `rotate(${r}deg)`;
              })()
            }}
            className="max-w-full max-h-full w-auto h-auto object-contain pointer-events-none select-none transition-transform duration-200" 
          />
        ) : (
          <div className="text-slate-300 flex flex-col items-center">
             <span className="text-xs">No Image</span>
          </div>
        )}
      </div>

      {/* Input Area (Compact & Inline) */}
      <div 
        className="p-1 bg-white rounded-b-lg border-t border-slate-100 z-10 relative text-[10px] grid grid-cols-12 gap-1 export-input-container"
        onPointerDown={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        {/* Amount */}
        <div className="col-span-4 flex items-center gap-1 min-w-0">
           <label className="font-semibold text-slate-400 whitespace-nowrap shrink-0 scale-90">金额</label>
           <input 
              type="number"
              placeholder="0.00"
              className="flex-1 w-0 font-mono font-bold bg-slate-50 border border-slate-200 rounded px-1 py-0.5 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none select-text text-blue-600"
              value={amount || ''}
              onChange={(e) => onUpdate?.({ amount: parseFloat(e.target.value) || 0 })}
              onFocus={(e) => e.target.select()}
           />
        </div>
        {/* Usage */}
        <div className="col-span-4 flex items-center gap-1 min-w-0">
           <label className="font-semibold text-slate-400 whitespace-nowrap shrink-0 scale-90">用途</label>
           <input 
              type="text"
              placeholder="摘要"
              className="flex-1 w-0 bg-slate-50 border border-slate-200 rounded px-1 py-0.5 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none select-text"
              value={data.usage || ''}
              onChange={(e) => onUpdate?.({ usage: e.target.value })}
           />
        </div>
        {/* Remark */}
        <div className="col-span-4 flex items-center gap-1 min-w-0">
           <label className="font-semibold text-slate-400 whitespace-nowrap shrink-0 scale-90">备注</label>
           <input 
              type="text"
              placeholder="备注"
              className="flex-1 w-0 bg-slate-50 border border-slate-200 rounded px-1 py-0.5 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none select-text"
              value={data.remark || ''}
              onChange={(e) => onUpdate?.({ remark: e.target.value })}
           />
        </div>
      </div>
    </div>
  );
}
