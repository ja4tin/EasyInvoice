import { useInvoiceStore } from '@/store/useInvoiceStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useGridLayout } from "@/features/editor/hooks/useGridLayout";
import { GridPageRenderer } from "./GridPageRenderer";

export const PrintContainer = () => {
    const { items, isVoucherVisible } = useInvoiceStore();
    const { settings } = useSettingsStore();

    // 1. Prepare Payment Pages (Always rendered unless specified otherwise, but requirement says Voucher is primary)
    // Requirement says: "Print Voucher first". "If workspace empty, don't print."
    // What is "Payment Workspace Empty"?
    // User answer: "If text exists (always true), print voucher."
    // So Payment is ALWAYS printed basically.
    const paymentItems = items.filter(item => item.workspaceId === 'payment');
    const { pages: paymentPages } = useGridLayout({
        items: paymentItems,
        columns: 4,
        rows: 6,
        appMode: 'payment',
        invoiceLayout: 'cross', // Doesn't matter for payment, uses defaults
        isVoucherVisible: isVoucherVisible
    });

    // 2. Prepare Invoice Pages
    // Requirement: "If invoice workspace has uploaded files, print. If empty, don't print."
    const invoiceItems = items.filter(item => item.workspaceId === 'invoice');
    const showInvoice = invoiceItems.length > 0;
    
    // We need to calculate layout for invoice items using the CURRENT invoice settings (layout type)
    // But store settings might be in 'payment' mode. 
    // We should use `settings.invoiceLayout` which is global/persistent.
    const { pages: invoicePages } = useGridLayout({
        items: invoiceItems,
        columns: 4,
        rows: 6,
        appMode: 'invoice',
        invoiceLayout: settings.invoiceLayout,
        isVoucherVisible: false // Never show voucher on invoice pages
    });

    return (
        <div id="print-container" className="fixed top-0 left-0 opacity-0 pointer-events-none z-[-1000] overflow-hidden w-0 h-0">
            {/* Payment Section */}
            {paymentPages.map((pageItems, pageIndex) => (
                <div key={`payment-${pageIndex}`} className="print-page-wrapper">
                     <GridPageRenderer 
                        pageIndex={pageIndex}
                        items={pageItems}
                        appMode="payment"
                        showVoucher={isVoucherVisible} // Respect user setting
                     />
                </div>
            ))}

            {/* Invoice Section */}
            {showInvoice && invoicePages.map((pageItems, pageIndex) => (
                <div key={`invoice-${pageIndex}`} className="print-page-wrapper">
                     {/* 
                         Reset page index for visual display? 
                         Or continue numbering? 
                         Requirement says "Pagination logic: Force new page. Order OK."
                         But doesn't specify if page numbers restart. 
                         Usually they restart or continue. GridPageRenderer just shows "Page X".
                         Let's just pass index 0, 1, 2... for now.
                         Wait, if I pass pageIndex, it will show "Page 1".
                         If user wants continuous numbering, I should offset it.
                         "Page 1" of Invoice might be confusing if it's the 2nd page of PDF.
                         But usually attachments are separate documents.
                         Let's keep them as 0-indexed relative to their section for now.
                     */}
                     <GridPageRenderer 
                        pageIndex={pageIndex}
                        items={pageItems}
                        appMode="invoice"
                        invoiceLayout={settings.invoiceLayout}
                        showVoucher={false}
                     />
                </div>
            ))}
        </div>
    );
};
