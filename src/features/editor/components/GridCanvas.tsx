/**
 * Project: EasyInvoice
 * File: GridCanvas.tsx
 * Description: 网格画布组件，负责渲染页面、处理拖拽排序和自动分页
 * Author: Ja4tin (ja4tin@hotmail.com)
 * Date: 2026-02-04
 * License: MIT
 */

import { useGridLayout } from "@/features/editor/hooks/useGridLayout";
import { FileItem } from "@/features/editor/components/FileItem";
import { type InvoiceItem } from '@/types';

import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useInvoiceStore } from '@/store/useInvoiceStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useAutoResize } from '@/features/editor/hooks/useAutoResize';

import { GridPageRenderer } from "./GridPageRenderer";
import { EmptyState } from "./EmptyState";

import { type LayoutPosition } from '../utils/grid-layout';

// 内部包装器，用于处理 FileItem 的拖拽监听器
function SortableGridItem({ 
  id, 
  item, 
  className,
  appMode,
  isSelected,
  onSelect
}: { 
  id: string, 
  item: InvoiceItem, 
  className?: string, 
  appMode: 'payment' | 'invoice',
  isSelected?: boolean,
  onSelect?: () => void
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
    zIndex: isDragging ? 50 : 'auto', // 拖拽时提高层级
  };
  
  const handleMove = () => {
     const target = appMode === 'payment' ? 'invoice' : 'payment';
     setWorkspace(item.id, target);
  };

  const moveLabel = appMode === 'payment' ? '移动到发票' : '移动到付款凭单';

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
         isSelected={isSelected}
         onSelect={onSelect}
      />
    </div>
  );
}

export const GridCanvas = () => {
  const { items, selectItem, selectedId, isVoucherVisible } = useInvoiceStore();
  const { settings } = useSettingsStore();
  
  // 过滤当前工作区的项目
  const canvasItems = items.filter(item => item.workspaceId === settings.appMode);
  
  // 网格布局计算
  const { pages } = useGridLayout({
    items: canvasItems,
    columns: 4,
    rows: 6,
    appMode: settings.appMode,
    invoiceLayout: settings.invoiceLayout,
    isVoucherVisible
  });

  // 启用页面切换时的智能自动调整大小
  useAutoResize({
    items: items, 
    appMode: settings.appMode,
    invoiceLayout: settings.invoiceLayout,
    isVoucherVisible,
  });
  
  const showVoucher = settings.appMode === 'payment' && isVoucherVisible;
  
  // 即使为空也确保至少显示一页，以便显示 EmptyState
  const pagesToShow = pages.length === 0 ? [[] as LayoutPosition[]] : pages;

  return (
    <div 
      className="flex flex-col items-center gap-8 py-8 min-h-full w-full relative cursor-default"
    >
      <SortableContext items={canvasItems.map(i => `canvas-${i.id}`)}>
        {pagesToShow.map((pageItems, pageIndex) => (
          <div 
             key={pageIndex}
             id={`invoice-page-${pageIndex}`}
             className="relative"
             // 添加 onClick 处理包装器，因为 GridPageRenderer 不接受 onClick
             onClick={(e) => {
               e.stopPropagation();
               selectItem(null); 
             }}
          >
              <GridPageRenderer 
                  pageIndex={pageIndex}
                  items={pageItems}
                  appMode={settings.appMode}
                  invoiceLayout={settings.invoiceLayout}
                  showVoucher={showVoucher}
                  renderItem={(item) => (
                      <SortableGridItem 
                        id={`canvas-${item.id}`} 
                        item={item}
                        className="w-full h-full"
                        appMode={settings.appMode}
                        isSelected={selectedId === item.id}
                        onSelect={() => selectItem(item.id)}
                     />
                  )}
              />
              
              {/* 仅在第一页且无任何项目时显示 EmptyState */}
              {pageIndex === 0 && canvasItems.length === 0 && (
                <EmptyState />
              )}
          </div>
        ))}
      </SortableContext>
    </div>
  );
};
