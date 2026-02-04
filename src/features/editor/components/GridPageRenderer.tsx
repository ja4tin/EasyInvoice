/**
 * Project: EasyInvoice
 * File: GridPageRenderer.tsx
 * Description: 单个 A4 页面渲染器，处理网格线、凭单和项目定位
 * Author: Ja4tin (ja4tin@hotmail.com)
 * Date: 2026-02-04
 * License: MIT
 */

import React from 'react';
import { cn } from "@/lib/utils";
import { FileItem } from "@/features/editor/components/FileItem";
import { Voucher } from "@/features/voucher/components/Voucher";
import type { InvoiceItem } from '@/types';

// 简单的打印视图包装器 (无拖拽)
function StaticGridItem({ 
  item, 
  className,
}: { 
  item: InvoiceItem, 
  className?: string, 
}) {
  return (
    <div className={className}>
      <FileItem 
         data={item} 
         className="w-full h-full"
         // 打印时无交互
         dragHandleProps={{}}
         onUpdate={() => {}}
         onDelete={() => {}}
         onMove={() => {}}
         moveActionLabel=""
         isSelected={false}
      />
    </div>
  );
}

interface GridPageRendererProps {
    pageIndex: number;
    items: { item: InvoiceItem, x: number, y: number, w: number, h: number }[];
    appMode: 'payment' | 'invoice';
    invoiceLayout?: 'cross' | 'vertical';
    showVoucher?: boolean;
    scale?: number; // 可选缩放
    children?: React.ReactNode; 
    renderItem?: (item: InvoiceItem) => React.ReactNode; // 自定义项目渲染器
}

export const GridPageRenderer = ({
    pageIndex,
    items,
    appMode,
    invoiceLayout = 'cross',
    showVoucher = false,
    renderItem
}: GridPageRendererProps) => {

    const isLandscape = appMode === 'invoice' && invoiceLayout === 'cross';

    return (
        <div 
            id={`page-${appMode}-${pageIndex}`}
            className={cn(
               "relative bg-white shadow-lg print:shadow-none print:m-0 transition-all duration-300 origin-top-left",
               isLandscape
                 ? "w-[297mm] h-[210mm] min-w-[297mm] min-h-[210mm]"
                 : "w-[210mm] h-[297mm] min-w-[210mm] min-h-[297mm]",
               appMode === 'payment' ? "p-[5mm]" : "p-0"
             )}
            // data-orientation used by PDF export
            data-orientation={isLandscape ? 'l' : 'p'}
        >
             {/* 内部容器用于 Padding/网格对齐 */}
             <div className="relative w-full h-full">
                {/* 视觉引导网格线 (打印时隐藏) */}
                <div className="absolute inset-0 grid grid-cols-4 grid-rows-6 pointer-events-none z-10 pdf-export-hidden">
                {Array.from({ length: 24 }).map((_, i) => {
                  // 如果 Page 0 显示凭单，隐藏前2行的网格线(索引 0-7)
                  const isHiddenByVoucher = pageIndex === 0 && showVoucher && i < 8;
                  return (
                    <div 
                      key={i} 
                      className={cn(
                        "border border-slate-200/50",
                        isHiddenByVoucher && "border-none"
                      )} 
                    />
                  );
                })}
             </div>

             {/* 内容层 */}
             <div className="relative z-20 w-full h-full p-0">
               {/* 凭单 - 仅在 Page 0 */}
               {pageIndex === 0 && showVoucher && (
                 <div 
                   className="absolute top-0 left-0 w-full h-[33.33%] pointer-events-auto p-[5mm]"
                 >
                   <Voucher />
                 </div>
               )}

               {/* Items */}
               {items.map((pos) => {
                 const style = {
                   left: `${(pos.x / 4) * 100}%`,
                   top: `${(pos.y / 6) * 100}%`,
                   width: `${(pos.w / 4) * 100}%`,
                   height: `${(pos.h / 6) * 100}%`,
                 };

                 return (
                   <div 
                     key={pos.item.id} 
                     className="absolute p-2"
                     style={style}
                   >
                     {renderItem ? renderItem(pos.item) : (
                         <StaticGridItem 
                            item={pos.item}
                            className="w-full h-full"
                         />
                     )}
                   </div>
                 );
               })}
             </div>

             {/* 页码 */}
             <div className="absolute bottom-2 right-4 text-xs text-muted-foreground print:hidden pdf-export-hidden">
               第 {pageIndex + 1} 页
             </div>
           </div>
        </div>
    );
};
