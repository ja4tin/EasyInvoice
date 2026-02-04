import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useInvoiceStore } from './useInvoiceStore';

// Mock idb-keyval
vi.mock('idb-keyval', () => ({
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
}));

// Access store directly.
// Since it's a singleton hook, state persists between tests unless cleared.
const { getState, setState } = useInvoiceStore;

describe('useInvoiceStore', () => {
    beforeEach(() => {
        setState({
            items: [],
            selectedId: null,
            voucherData: {
                title: 'Test',
                companyName: '',
                voucherNo: '',
                date: '',
                payee: '',
                dept: '',
                financialSupervisor: '',
                bookkeeper: '',
                cashier: '',
                deptManager: '',
                receiver: '',
                summary: '',
                isSummaryDirty: false,
            },
            isVoucherVisible: true
        });
    });

    it('should select an item', () => {
        getState().selectItem('123');
        expect(getState().selectedId).toBe('123');
        
        getState().selectItem(null);
        expect(getState().selectedId).toBe(null);
    });

    it('should resize an item and update timestamp', () => {
        vi.useFakeTimers();
        
        // Add an item manually
        const initialState = getState();
        initialState.addItem({
            name: 'Test Item',
            fileData: '',
            width: 2,
            height: 2,
            workspaceId: 'payment',
        });
        
        const item = getState().items[0];
        const initialTime = item.updatedAt;
        
        // Advance time
        vi.advanceTimersByTime(100);
        
        // Resize
        getState().resizeItem(item.id, 4, 3);
        
        const updatedItem = getState().items[0];
        expect(updatedItem.width).toBe(4);
        expect(updatedItem.height).toBe(3);
        
        // Should update timestamp
        expect(updatedItem.updatedAt).toBeGreaterThan(initialTime);
        
        vi.useRealTimers();
    });
});
