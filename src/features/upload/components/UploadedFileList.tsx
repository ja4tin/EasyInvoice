import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useInvoiceStore } from '@/store/useInvoiceStore';
import { SortableItem } from '@/components/ui/SortableItem';

export function UploadedFileList() {
  const items = useInvoiceStore((state) => state.items)
  const removeItem = useInvoiceStore((state) => state.removeItem)

  return (
    <div className="space-y-2 mt-4 px-1">
      <SortableContext 
        items={items.map(i => `sidebar-${i.id}`)}
        strategy={verticalListSortingStrategy}
      >
        {items.map((item) => (
          <SortableItem key={item.id} id={`sidebar-${item.id}`} className="relative">
                <div className="group flex items-center gap-2 p-2 border rounded-md text-xs bg-background/50 hover:bg-background transition-colors cursor-move">
                  <div className="h-12 w-12 flex-shrink-0 bg-white rounded border flex items-center justify-center overflow-hidden">
                      <img src={item.fileData} alt={item.name} className="max-h-full max-w-full object-contain pointer-events-none" />
                  </div>
                  <div className="flex-1 min-w-0 pointer-events-none select-none">
                      <p className="truncate font-medium text-foreground">{item.name}</p>
                      <p className="text-muted-foreground text-[10px]">{item.width}x{item.height}px</p>
                  </div>
                  <button 
                      onClick={(e) => {
                          e.stopPropagation(); 
                          removeItem(item.id)
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-destructive transition-opacity relative z-10"
                      title="Remove"
                        onPointerDown={(e) => e.stopPropagation()} 
                  >
                      ×
                  </button>
                  </div>
          </SortableItem>
        ))}
      </SortableContext>
      
      {items.length === 0 && (
         <p className="text-xs text-center text-muted-foreground py-4">暂无文件</p>
      )}
    </div>
  )
}
