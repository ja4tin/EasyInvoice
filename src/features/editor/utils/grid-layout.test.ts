import { describe, it, expect } from 'vitest';
import { calculateLayout } from './grid-layout';
import type { InvoiceItem } from '@/types';

// Helper to create mock items
const createMockItem = (id: string, width = 0, height = 0): InvoiceItem => ({
  id,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  name: `Item ${id}`,
  fileData: '',
  width,
  height,
  workspaceId: 'payment',
});

describe('calculateLayout', () => {
  it('should use default dimensions (2x3) when width/height are 0', () => {
    const items = [createMockItem('1')];
    const { pages } = calculateLayout(items, { appMode: 'payment', showVoucher: false });
    
    expect(pages[0][0]).toMatchObject({
      w: 2,
      h: 3,
      item: { id: '1' }
    });
  });

  it('should respect custom dimensions', () => {
    const items = [createMockItem('1', 4, 3)]; // Full width, half height
    const { pages } = calculateLayout(items, { appMode: 'payment', showVoucher: false });
    
    expect(pages[0][0]).toMatchObject({
      w: 4,
      h: 3,
      item: { id: '1' }
    });
  });

  it('should fallback to mode defaults if dimensions are invalid (0)', () => {
    const items = [createMockItem('1', 0, 0)];
    const { pages } = calculateLayout(items, { appMode: 'invoice', invoiceLayout: 'vertical' });
    
    // Vertical mode default is 4x3
    expect(pages[0][0]).toMatchObject({
      w: 4,
      h: 3,
      item: { id: '1' }
    });
  });

  it('should pack items tightly', () => {
    // 2 items of 2x2 should fit in one row (4 cols total)
    const items = [
        createMockItem('1', 2, 2),
        createMockItem('2', 2, 2)
    ];
    const { pages } = calculateLayout(items, { appMode: 'payment', showVoucher: false });
    
    expect(pages[0].length).toBe(2);
    // Item 1 at 0,0
    expect(pages[0][0]).toMatchObject({ x: 0, y: 0, w: 2, h: 2 });
    // Item 2 at 2,0
    expect(pages[0][1]).toMatchObject({ x: 2, y: 0, w: 2, h: 2 });
  });

  it('should wrap to next row if not fits', () => {
    // 2 items of 3x2. 
    // Row 0: Item 1 (3 cols) -> 1 col left. Item 2 (3 cols) won't fit.
    const items = [
        createMockItem('1', 3, 2),
        createMockItem('2', 3, 2)
    ];
    const { pages } = calculateLayout(items, { appMode: 'payment', showVoucher: false });
    
    // Item 1 at 0,0
    expect(pages[0][0]).toMatchObject({ x: 0, y: 0, w: 3, h: 2 });
    // Item 2 at 0,2 (Next row, if density packing works? No, dense packing looks for first hole)
    // Row 0 has 1 slot left (x=3). Item 2 needs 3 slots.
    // Row 1 occupied by Item 1 (h=2).
    // So Item 2 should go to Row 2 (y=2). Wait, Row index ?
    // Let's trace:
    // Item 1: x=0, y=0, w=3, h=2. Occupies (0,0)-(2,1).
    // Item 2: Needs 3x2.
    // (0,0) blocked.
    // ...
    // (0,2) -> x=2. w=3 -> x+w=5 > 4. No fit.
    // (0,3) -> x=3. w=3 -> 6 > 4. No fit.
    // (0,1) was tested implicitly (r=0, c=...). r loops 0..rows-h.
    // Item 2 should end up at y=2, x=0.
    
    expect(pages[0][1]).toMatchObject({ x: 0, y: 2, w: 3, h: 2 });
  });
});
