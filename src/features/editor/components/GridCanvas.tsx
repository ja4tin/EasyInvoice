import { useGridLayout } from "@/features/editor/hooks/useGridLayout";
import { FileItem } from "@/features/editor/components/FileItem";
import { type InvoiceItem } from '@/types';

import { SortableContext, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useInvoiceStore } from '@/store/useInvoiceStore';
// Internal wrapper to handle drag listeners specifically for FileItem
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
    zIndex: isDragging ? 50 : 'auto', // Higher z-index while dragging
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
         isSelected={isSelected}
         onSelect={onSelect}
      />
    </div>
  );
}

import { useSettingsStore } from '@/store/useSettingsStore';
import { useAutoResize } from '@/features/editor/hooks/useAutoResize';

import { GridPageRenderer } from "./GridPageRenderer";

export const GridCanvas = () => {
  const { items, selectItem, selectedId, isVoucherVisible } = useInvoiceStore();
  const { settings } = useSettingsStore();
  
  // Filter items that should be on canvas
  const canvasItems = items.filter(item => item.workspaceId === settings.appMode);
  
  // Grid layout calculation
  const { pages } = useGridLayout({
    items: canvasItems,
    columns: 4,
    rows: 6,
    appMode: settings.appMode,
    invoiceLayout: settings.invoiceLayout,
    isVoucherVisible
  });

  // Enable smart auto-resize on page transitions
  useAutoResize({
    items: items, 
    appMode: settings.appMode,
    invoiceLayout: settings.invoiceLayout,
    isVoucherVisible,
  });
  
  const showVoucher = settings.appMode === 'payment' && isVoucherVisible;

  return (
    <div 
      className="flex flex-col items-center gap-8 py-8 min-h-full w-full relative cursor-default"
    >
      <SortableContext items={canvasItems.map(i => `canvas-${i.id}`)}>
        {pages.map((pageItems, pageIndex) => (
          <div 
             key={pageIndex}
             id={`invoice-page-${pageIndex}`}
             // Add onclick handler wrapper because GridPageRenderer doesn't accept onClick
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
          </div>
        ))}
      </SortableContext>
    </div>
  );
};
