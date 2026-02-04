/**
 * Project: EasyInvoice
 * File: UploadedFileList.tsx
 * Description: 左侧文件列表组件，显示已上传但未处理的文件，支持批量操作
 * Author: Ja4tin (ja4tin@hotmail.com)
 * Date: 2026-02-04
 * License: MIT
 */

import { useState, useEffect } from 'react';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useInvoiceStore } from '@/store/useInvoiceStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { SortableItem } from '@/components/ui/SortableItem';

import { cn } from '@/lib/utils';
import { X, ArrowRight } from 'lucide-react';

export function UploadedFileList() {
  const items = useInvoiceStore((state) => state.items)
  const removeItem = useInvoiceStore((state) => state.removeItem)
  const setWorkspace = useInvoiceStore((state) => state.setWorkspace)
  const appMode = useSettingsStore((state) => state.settings.appMode)

  const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(new Set());

  // 当 items 变化时清理选中状态
  useEffect(() => {
    setSelectedFileIds(prev => {
      const next = new Set<string>();
      prev.forEach(id => {
        if (items.some(i => i.id === id)) next.add(id);
      });
      return next.size === prev.size ? prev : next;
    });
  }, [items]);

  const toggleSelection = (id: string) => {
    setSelectedFileIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  
  const handleBatchMove = (target: 'payment' | 'invoice') => {
    if (selectedFileIds.size === 0) return;
    selectedFileIds.forEach(id => {
      setWorkspace(id, target);
    });
    setSelectedFileIds(new Set()); // 操作后清除选中
  };

  return (
    <div className="space-y-2 mt-4 px-1 relative pb-12">
      <SortableContext 
        items={items.map(i => `sidebar-${i.id}`)}
        strategy={verticalListSortingStrategy}
      >
        {items.map((item) => {
          const isAssigned = item.workspaceId !== null;
          const isInCurrentWorkspace = item.workspaceId === appMode;
          const isSelected = selectedFileIds.has(item.id);
          
          return (
            <SortableItem key={item.id} id={`sidebar-${item.id}`} className="relative">
                  <div 
                    className={cn(
                      "group flex items-center gap-2 p-2 border rounded-md text-xs transition-colors cursor-move",
                      isInCurrentWorkspace ? "bg-background/50 hover:bg-background" : "bg-slate-100 opacity-75",
                      isSelected && "border-blue-400 bg-blue-50/50"
                    )}
                    onClick={() => toggleSelection(item.id)}
                  >
                    {/* 复选框 */}
                    <div className="flex items-center justify-center p-1" onPointerDown={(e) => e.stopPropagation()}>
                        <input 
                            type="checkbox" 
                            className="h-3.5 w-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            checked={isSelected}
                            onChange={() => toggleSelection(item.id)}
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>

                    <div className="h-12 w-12 flex-shrink-0 bg-white rounded border flex items-center justify-center overflow-hidden relative">
                        <img src={item.fileData} alt={item.name} className="max-h-full max-w-full object-contain pointer-events-none" />
                        
                        {/* 快捷添加到当前工作区按钮 (如果未分配且未选中) */}
                        {!isAssigned && !isSelected && (
                          <div className="absolute inset-0 bg-white/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                             <button 
                               onClick={(e) => {
                                 e.stopPropagation();
                                 setWorkspace(item.id, appMode);
                               }}
                               onPointerDown={(e) => e.stopPropagation()}
                               className="text-green-600 hover:scale-110 transition-transform"
                               title={`添加到 ${appMode === 'payment' ? '付款凭单' : '发票页'}`}
                             >
                                <div className="bg-white rounded-full p-0.5 shadow-sm border border-green-200">
                                  <ArrowRight size={14} className="stroke-[3px]" />
                                </div>
                             </button>
                          </div>
                        )}
                        
                        {/* 工作区角标 (付/票) */}
                        {isAssigned && (
                           <div className={cn(
                               "absolute top-0 right-0 text-[8px] px-1 rounded-bl font-bold",
                               item.workspaceId === 'payment' ? "bg-green-100 text-green-700" : "bg-purple-100 text-purple-700"
                           )}>
                             {item.workspaceId === 'payment' ? '付' : '票'}
                           </div>
                        )}
                    </div>
                    
                    <div className="flex-1 min-w-0 pointer-events-none select-none">
                        <p className="truncate font-medium text-foreground">{item.name}</p>
                        <div className="flex items-center gap-2">
                           <p className="text-muted-foreground text-[10px]">{item.width}x{item.height}</p>
                        </div>
                    </div>
                    
                    <button 
                        onClick={(e) => {
                            e.stopPropagation(); 
                            removeItem(item.id, true);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-opacity relative z-10"
                        title="永久删除"
                        onPointerDown={(e) => e.stopPropagation()} 
                    >
                        <X size={14} />
                    </button>
                  </div>
            </SortableItem>
          );
        })}
      </SortableContext>
      
      {items.length === 0 && (
         <p className="text-xs text-center text-muted-foreground py-4">暂无文件</p>
      )}

      {/* 底部浮动操作栏 */}
      {selectedFileIds.size > 0 && (
         <div className="sticky bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t p-2 flex gap-2 shadow-lg animate-in slide-in-from-bottom-2 z-20">
            <button
              onClick={() => handleBatchMove('payment')}
              disabled={selectedFileIds.size === 0}
              className="flex-1 py-1.5 px-2 bg-green-50 hover:bg-green-100 text-green-700 text-xs rounded border border-green-200 flex items-center justify-center gap-1 transition-colors"
            >
               <span>移至凭单</span>
               <span className="bg-green-200/50 px-1 rounded-full text-[9px]">{selectedFileIds.size}</span>
            </button>
            <button
               onClick={() => handleBatchMove('invoice')}
               disabled={selectedFileIds.size === 0}
               className="flex-1 py-1.5 px-2 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs rounded border border-purple-200 flex items-center justify-center gap-1 transition-colors"
            >
               <span>移至发票</span>
               <span className="bg-purple-200/50 px-1 rounded-full text-[9px]">{selectedFileIds.size}</span>
            </button>
         </div>
      )}
    </div>
  )
}
