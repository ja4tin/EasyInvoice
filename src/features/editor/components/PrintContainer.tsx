/**
 * Project: EasyInvoice
 * File: PrintContainer.tsx
 * Description: 打印容器组件，渲染所有需要打印或导出的页面，平时不可见
 * Author: Ja4tin (ja4tin@hotmail.com)
 * Date: 2026-02-04
 * License: MIT
 */

import { useInvoiceStore } from '@/store/useInvoiceStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useGridLayout } from "@/features/editor/hooks/useGridLayout";
import { GridPageRenderer } from "./GridPageRenderer";

export const PrintContainer = () => {
    const { items, isVoucherVisible } = useInvoiceStore();
    const { settings } = useSettingsStore();

    // 1. 准备付款凭单页面
    // 需求: "优先打印凭单"。"如果工作区有内容则打印"。
    // 只要有文本，Payment 就总被视为有内容。
    const paymentItems = items.filter(item => item.workspaceId === 'payment');
    const { pages: paymentPages } = useGridLayout({
        items: paymentItems,
        columns: 4,
        rows: 6,
        appMode: 'payment',
        invoiceLayout: 'cross', // Payment 模式下不起作用，使用默认
        isVoucherVisible: isVoucherVisible
    });

    // 2. 准备发票页面
    // 需求: "如果发票工作区有上传文件，则打印。如果为空，不打印。"
    const invoiceItems = items.filter(item => item.workspaceId === 'invoice');
    const showInvoice = invoiceItems.length > 0;
    
    // 使用全局的 invoiceLayout 设置来计算发票布局
    const { pages: invoicePages } = useGridLayout({
        items: invoiceItems,
        columns: 4,
        rows: 6,
        appMode: 'invoice',
        invoiceLayout: settings.invoiceLayout,
        isVoucherVisible: false // 发票页面永不显示凭单
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
                        showVoucher={isVoucherVisible} // 遵循用户设置
                     />
                </div>
            ))}

            {/* Invoice Section */}
            {showInvoice && invoicePages.map((pageItems, pageIndex) => (
                <div key={`invoice-${pageIndex}`} className="print-page-wrapper">
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
