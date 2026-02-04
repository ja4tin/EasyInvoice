import { renderHook } from '@testing-library/react';
import { useAutoResize } from './useAutoResize';
import { useInvoiceStore } from '@/store/useInvoiceStore';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';

// Mock store
vi.mock('@/store/useInvoiceStore', () => ({
  useInvoiceStore: vi.fn()
}));

// Mock useGridLayout to return controlled pages
vi.mock('./useGridLayout', () => ({
  useGridLayout: vi.fn()
}));

import { useGridLayout } from './useGridLayout';

describe('useAutoResize', () => {
  const mockUpdateItem = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useInvoiceStore as unknown as Mock).mockImplementation((selector) => {
        const state = { updateItem: mockUpdateItem };
        return selector ? selector(state) : state;
    });

    // Mock useGridLayout default return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (useGridLayout as unknown as Mock).mockReturnValue({
      pages: [[], [ { item: { id: '1' } } ]] // Page 0 empty, Page 1 has item
    });
  });

  it('should resize 4x3 to 4x2 when moving to Page 1 (Index 0)', () => {
    const items = [{ id: '1', width: 4, height: 3 }];
    
    // First render: Item on Page 1 (Index 1)
    (useGridLayout as unknown as Mock).mockReturnValue({
      pages: [[], [ { item: { id: '1' } } ]] // Page 0 empty, Page 1 has item
    });

    const { rerender } = renderHook((props) => useAutoResize(props as any), {
      initialProps: { items: items as any, appMode: 'payment', invoiceLayout: 'cross', isVoucherVisible: true }
    });

    // Move item to Page 0
    (useGridLayout as unknown as Mock).mockReturnValue({
      pages: [[ { item: { id: '1' } } ], []] // Page 0 has item
    });

    rerender({ items: items as any, appMode: 'payment', invoiceLayout: 'cross', isVoucherVisible: true });

    expect(mockUpdateItem).toHaveBeenCalledWith('1', { width: 4, height: 2 });
  });

  it('should resize 4x2 to 4x3 when moving FROM Page 1 (Index 0)', () => {
    const items = [{ id: '1', width: 4, height: 2 }];
    
    // First render: Item on Page 0 (Index 0)
    (useGridLayout as unknown as Mock).mockReturnValue({
      pages: [[ { item: { id: '1' } } ], []] 
    });

    const { rerender } = renderHook((props) => useAutoResize(props as any), {
      initialProps: { items: items as any, appMode: 'payment', invoiceLayout: 'cross', isVoucherVisible: true }
    });

    // Move item to Page 1
    (useGridLayout as unknown as Mock).mockReturnValue({
      pages: [[], [ { item: { id: '1' } } ]] 
    });

    rerender({ items: items as any, appMode: 'payment', invoiceLayout: 'cross', isVoucherVisible: true });

    expect(mockUpdateItem).toHaveBeenCalledWith('1', { width: 4, height: 3 });
  });

  // NEW TEST CASE
  it('should NOT resize 2x3 to 2x4 when moving to Page 1 (Index 0) if Voucher is NOT visible', () => {
    const items = [{ id: '1', width: 2, height: 3 }];
    
    // First: Page 1
    (useGridLayout as unknown as Mock).mockReturnValue({
      pages: [[], [ { item: { id: '1' } } ]] 
    });

    const { rerender } = renderHook((props) => useAutoResize(props as any), {
      initialProps: { items: items as any, appMode: 'payment', invoiceLayout: 'cross', isVoucherVisible: false }
    });

    // Move to Page 0
    (useGridLayout as unknown as Mock).mockReturnValue({
      pages: [[ { item: { id: '1' } } ], []] 
    });

    rerender({ items: items as any, appMode: 'payment', invoiceLayout: 'cross', isVoucherVisible: false });

    expect(mockUpdateItem).not.toHaveBeenCalled();
  });
});

