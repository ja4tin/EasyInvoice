import React, { useState, useEffect } from 'react';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useInvoiceStore } from '@/store/useInvoiceStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { SortableItem } from '@/components/ui/SortableItem';

import { cn } from '@/lib/utils';

export function UploadedFileList() {
  const items = useInvoiceStore((state) => state.items)
  const removeItem = useInvoiceStore((state) => state.removeItem)
  const setWorkspace = useInvoiceStore((state) => state.setWorkspace)
  const appMode = useSettingsStore((state) => state.settings.appMode)

  const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(new Set());

  // Prune selections when items change (optional, but good for cleanup)
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
    setSelectedFileIds(new Set()); // Clear after action
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
                    onClick={() => toggleSelection(item.id)} // Allow selecting by clicking row? or just checkbox? Let's assume Checkbox only + maybe row
                  >
                    {/* Checkbox */}
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
                        
                        {/* Show ADD button if unassigned (and not selected?) */}
                        {!isAssigned && !isSelected && (
                          <div className="absolute inset-0 bg-white/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                             <button 
                               onClick={(e) => {
                                 e.stopPropagation();
                                 setWorkspace(item.id, appMode);
                               }}
                               onPointerDown={(e) => e.stopPropagation()}
                               className="text-green-600 hover:scale-110 transition-transform"
                               title={`Add to ${appMode === 'payment' ? 'Payment' : 'Invoice'}`}
                             >
                                <div className="bg-white rounded-full p-0.5 shadow-sm border border-green-200">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>
                                </div>
                             </button>
                          </div>
                        )}
                        
                        {/* Workspace Badge (P/I) */}
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
                           {/* Status Text removed if we have badge? Keep for clarity if needed. Specs said badge. */}
                        </div>
                    </div>
                    
                    <button 
                        onClick={(e) => {
                            e.stopPropagation(); 
                            removeItem(item.id, true);
                            // Cleanup is handled by useEffect
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive transition-opacity relative z-10"
                        title="Permanently Delete"
                        onPointerDown={(e) => e.stopPropagation()} 
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                    </button>
                  </div>
            </SortableItem>
          );
        })}
      </SortableContext>
      
      {items.length === 0 && (
         <p className="text-xs text-center text-muted-foreground py-4">暂无文件</p>
      )}

      {/* Sticky Footer Action Bar */}
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
