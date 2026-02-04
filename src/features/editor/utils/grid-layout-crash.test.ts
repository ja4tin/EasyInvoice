import { describe, it, expect } from 'vitest';
import { calculateLayout } from './grid-layout';
import type { InvoiceItem } from '@/types';

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

describe('calculateLayout Crash Repro', () => {
  it('should not crash if item is larger than grid', () => {
    // Grid is 4x6. Pass item 5x7.
    // This should NOT hang.
    const items = [createMockItem('1', 5, 7)];
    
    // We expect this to either be clamped, or skipped, or handled without infinite loop.
    // If it hangs, the test will timeout.
    const { pages } = calculateLayout(items, { appMode: 'payment', showVoucher: false });
    
    expect(pages).toBeDefined();
  });
  
  it('should not crash with default settings on upload', () => {
      // Logic simulation for upload
      const items = [createMockItem('new-item')];
      const { pages } = calculateLayout(items, { appMode: 'payment', showVoucher: true });
      expect(pages).toBeDefined();
      expect(pages.length).toBeGreaterThan(0);
  });
});
