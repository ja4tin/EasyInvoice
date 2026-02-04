import { describe, it, expect } from 'vitest';
import { calculateLayout } from './grid-layout';
import type { InvoiceItem } from '@/types';

describe('calculateLayout Business Logic', () => {
    it('should force 4x3 item to Row 3 on Page 1 when Voucher is visible', () => {
        const items: InvoiceItem[] = [
            { id: '1', width: 4, height: 3, workspaceId: 'payment', name: 'item1', fileData: '', createdAt: 0, updatedAt: 0 }
        ];

        const layout = calculateLayout(items, {
            showVoucher: true,
            appMode: 'payment',
            invoiceLayout: 'cross'
        });

        // Page 0 should have item at row 3
        const page0 = layout.pages[0];
        expect(page0).toBeDefined();
        const itemLayout = page0.find(p => p.item.id === '1');
        
        expect(itemLayout).toBeDefined();
        // Voucher takes rows 0,1. 
        // 4x3 needs 3 rows.
        // It fits at row 2 (lines 2,3,4) IF voucher is 2 rows?
        // Wait, Voucher height is 33% = 2/6 rows?
        // Let's verify grid-layout.ts comments.
        // "Voucher occupies Rows 0, 1." (2 rows). 
        // Remaining rows: 2,3,4,5.
        // 4x3 needs 3 rows.
        // It COULD fit at Row 2 (occupying 2,3,4).
        // BUT requirement is "Align to bottom of grid".
        // Bottom is Row 3 (occupying 3,4,5).
        
        expect(itemLayout?.y).toBe(3); 
    });

    it('should allow 4x3 item at Row 0 on Page 1 when Voucher is NOT visible', () => {
        const items: InvoiceItem[] = [
            { id: '1', width: 4, height: 3, workspaceId: 'invoice' } as any
        ];

        const layout = calculateLayout(items, {
            showVoucher: false, // Hidden
            appMode: 'invoice',
            invoiceLayout: 'cross'
        });

        const page0 = layout.pages[0];
        const itemLayout = page0.find(p => p.item.id === '1');
        
        expect(itemLayout?.y).toBe(0); // Should be at top
    });
});
