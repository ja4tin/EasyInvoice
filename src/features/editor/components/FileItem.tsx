/**
 * Project: EasyInvoice
 * File: FileItem.tsx
 * Description: 发票/收据项目组件，支持拖拽、旋转、修改数据
 * Author: Ja4tin (ja4tin@hotmail.com)
 * Date: 2026-02-04
 * License: MIT
 */

import { type InvoiceItem } from "@/types";
import { cn } from "@/lib/utils";
import { useSettingsStore } from '@/store/useSettingsStore';
import { RotateCw, Trash2, ArrowRightLeft } from "lucide-react";

interface FileItemProps {
  data: InvoiceItem;
  isSelected?: boolean;
  className?: string;
  onSelect?: () => void;
  onDelete?: () => void;
  onUpdate?: (updates: Partial<InvoiceItem>) => void;
  onMove?: () => void; // 移动工作区
  moveActionLabel?: string; // 提示文本
  dragHandleProps?: Record<string, any>; // dnd-kit 属性
}

export function FileItem({ 
  data, 
  isSelected = false, 
  className,
  onSelect, 
  onDelete,
  onUpdate,
  onMove,
  moveActionLabel = "移动到其他工作区",
  dragHandleProps
}: FileItemProps) {
  const { fileData, amount } = data;
  const appMode = useSettingsStore(state => state.settings.appMode);
  const showFields = useSettingsStore(state => state.settings.showFileFields?.[appMode] ?? (appMode === 'payment'));

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
      {/* 视觉头部 / 拖拽手柄 (仅悬浮显示) */}
      <div 
        className="absolute top-0 inset-x-0 z-20 h-7 bg-white/95 backdrop-blur-sm border-b border-slate-100 flex items-center justify-between px-2 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        {...dragHandleProps}
      >
         <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider truncate max-w-[120px]" title={data.name}>{data.name || 'RECEIPT'}</span>
         {/* 悬浮操作 */}
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
              title="旋转 90°"
            >
              <RotateCw size={13} />
            </button>
            <button 
              tabIndex={-1}
              className="p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-500 transition-colors"
              onClick={(e) => { e.stopPropagation(); onDelete?.(); }}
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              title="删除"
            >
              <Trash2 size={13} />
            </button>
         </div>
      </div>

      {/* 图片预览区域 (最大化空间) */}
      <div className="flex-1 min-h-0 w-full bg-slate-100 pdf-export-bg-white overflow-hidden relative flex items-center justify-center rounded-t-lg">
        {fileData ? (
          <img 
            src={fileData} 
            alt="invoice" 
            style={{ 
              transform: (() => {
                const r = data.rotation || 0;
                // 检查是否旋转了 90 或 270 度
                if (Math.abs(r % 180) === 90) {
                  // 计算适应比例
                  // 如果 w=2, h=4: 需要将 '4' 放入 '2' (scale 0.5) 和 '2' 放入 '4' (fine).
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
             <span className="text-xs">无图片</span>
          </div>
        )}
      </div>

      {/* 输入区域 (紧凑 & 内联) - 根据全局设置显示/隐藏 */}
      {/* 输入区域 (紧凑 & 内联) - 根据全局设置显示/隐藏 */}
      {showFields && (
          <div 
            className="p-1 bg-white rounded-b-lg border-t border-slate-100 z-10 relative text-[10px] grid grid-cols-12 gap-1 export-input-container"
            onPointerDown={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            {/* 金额 */}
            <div className="col-span-4 flex items-center gap-1 min-w-0">
               <label className="font-semibold text-slate-500 whitespace-nowrap shrink-0 text-[10px] scale-90">金额</label>
               <input 
                  type="number"
                  placeholder="0.00"
                  className="flex-1 w-0 font-mono font-bold bg-slate-50 border border-slate-200 rounded px-1 py-0.5 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none select-text text-blue-600"
                  value={amount || ''}
                  onChange={(e) => onUpdate?.({ amount: parseFloat(e.target.value) || 0 })}
                  onFocus={(e) => e.target.select()}
               />
            </div>
            {/* 用途 */}
            <div className="col-span-4 flex items-center gap-1 min-w-0">
               <label className="font-semibold text-slate-500 whitespace-nowrap shrink-0 text-[10px] scale-90">用途</label>
               <input 
                  type="text"
                  placeholder="摘要"
                  className="flex-1 w-0 bg-slate-50 border border-slate-200 rounded px-1 py-0.5 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none select-text"
                  value={data.usage || ''}
                  onChange={(e) => onUpdate?.({ usage: e.target.value })}
               />
            </div>
            {/* 备注 */}
            <div className="col-span-4 flex items-center gap-1 min-w-0">
               <label className="font-semibold text-slate-500 whitespace-nowrap shrink-0 text-[10px] scale-90">备注</label>
               <input 
                  type="text"
                  placeholder="备注"
                  className="flex-1 w-0 bg-slate-50 border border-slate-200 rounded px-1 py-0.5 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none select-text"
                  value={data.remark || ''}
                  onChange={(e) => onUpdate?.({ remark: e.target.value })}
               />
            </div>
          </div>
      )}
    </div>
  );
}
