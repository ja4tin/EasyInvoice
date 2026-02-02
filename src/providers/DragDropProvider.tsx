import { 
  DndContext, 
  type DragEndEvent, 
  type DragStartEvent,
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  closestCenter
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useInvoiceStore } from '@/store/useInvoiceStore';
import { useState } from 'react';

export function DragDropProvider({ children }: { children: React.ReactNode }) {
  const items = useInvoiceStore((state) => state.items);
  const reorderItems = useInvoiceStore((state) => state.reorderItems);
  const [, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
        activationConstraint: {
            distance: 8, // Prevent accidental drags
        },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;
    if (active.id === over.id) return;

    // strip prefixes "sidebar-" or "canvas-"
    const activeId = String(active.id).replace(/^(sidebar-|canvas-)/, '');
    const overId = String(over.id).replace(/^(sidebar-|canvas-)/, '');

    const oldIndex = items.findIndex((item) => item.id === activeId);
    const newIndex = items.findIndex((item) => item.id === overId);

    if (oldIndex !== -1 && newIndex !== -1) {
      reorderItems(oldIndex, newIndex);
    }
  }
  
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {children}
    </DndContext>
  );
}
