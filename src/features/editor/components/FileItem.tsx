import { type InvoiceItem } from "@/types";
import { cn } from "@/lib/utils";
import { RotateCw, Trash2 } from "lucide-react";

interface FileItemProps {
  data: InvoiceItem;
  isSelected?: boolean;
  className?: string;
  onSelect?: () => void;
  onDelete?: () => void;
  onUpdate?: (updates: Partial<InvoiceItem>) => void;
  dragHandleProps?: Record<string, any>; // For dnd-kit listeners/attributes
}

export function FileItem({ 
  data, 
  isSelected = false, 
  className,
  onSelect, 
  onDelete,
  onUpdate,
  dragHandleProps
}: FileItemProps) {
  const { fileData, amount } = data;

  return (
    <div 
      className={cn(
        "group relative flex flex-col bg-white rounded-lg shadow-sm border transition-all duration-200 hover:shadow-md select-none",
        isSelected ? "ring-2 ring-primary border-primary" : "border-slate-200 hover:border-slate-300",
        className
      )}
      onClick={onSelect}
    >
      {/* Visual Header / Drag Handle */}
      <div 
        className="h-6 bg-slate-50 border-b border-slate-100 rounded-t-lg flex items-center justify-between px-2 cursor-grab active:cursor-grabbing outline-none"
        {...dragHandleProps}
      >
         <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Receipt</span>
         {/* Hover Actions */}
         <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              className="p-0.5 hover:bg-slate-200 rounded text-slate-500 hover:text-slate-700"
              onClick={(e) => { e.stopPropagation(); /* Rotate Logic */ }}
            >
              <RotateCw size={12} />
            </button>
            <button 
              className="p-0.5 hover:bg-red-50 rounded text-slate-400 hover:text-red-500"
              onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
            >
              <Trash2 size={12} />
            </button>
         </div>
      </div>

      {/* Image Preview Area */}
      <div className="aspect-[4/3] w-full bg-slate-100 overflow-hidden relative flex items-center justify-center">
        {fileData ? (
          <img 
            src={fileData} 
            alt="invoice" 
            className="w-full h-full object-contain pointer-events-none" 
          />
        ) : (
          <div className="text-slate-300 flex flex-col items-center">
             <span className="text-xs">No Image</span>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div 
        className="p-2 flex flex-col gap-1.5 text-[10px]"
        onPointerDown={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        {/* Row 1: Amount & Usage */}
        <div className="flex gap-2">
            <div className="flex-[2]">
               <label className="font-semibold text-slate-500 block mb-0.5">金额 (¥)</label>
               <input 
                  type="number"
                  placeholder="0.00"
                  className="w-full font-mono font-medium bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none select-text"
                  value={amount || ''}
                  onChange={(e) => onUpdate?.({ amount: parseFloat(e.target.value) || 0 })}
                  onFocus={(e) => e.target.select()}
               />
            </div>
            <div className="flex-[3]">
               <label className="font-semibold text-slate-500 block mb-0.5">用途</label>
               <input 
                  type="text"
                  placeholder="摘要"
                  className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none select-text"
                  value={data.usage || ''}
                  onChange={(e) => onUpdate?.({ usage: e.target.value })}
               />
            </div>
        </div>
        
        {/* Row 2: Remark (Optional) */}
        <div>
           <input 
              type="text"
              placeholder="备注 (不打印)"
              className="w-full text-slate-400 bg-transparent border-b border-dashed border-slate-200 focus:border-primary focus:outline-none py-0.5 select-text"
              value={data.remark || ''}
              onChange={(e) => onUpdate?.({ remark: e.target.value })}
           />
        </div>
      </div>
    </div>
  );
}
