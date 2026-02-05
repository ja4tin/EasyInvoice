/**
 * Project: EasyInvoice
 * File: useExportPdf.ts
 * Description: PDF 导出 Hook，使用 Clone Node + html2canvas 方案实现高清导出
 * Author: Ja4tin (ja4tin@hotmail.com)
 * Date: 2026-02-04
 * License: MIT
 */

import { useCallback } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useInvoiceStore } from '@/store/useInvoiceStore';
import { type SettingsState } from '@/types';

export function useExportPdf() {
  const { appMode, invoiceLayout } = useSettingsStore((state: SettingsState) => state.settings);
  const setIsExporting = useInvoiceStore(state => state.setIsExporting);

  const generatePdf = useCallback(async () => {
    // 根据 appMode 和 invoiceLayout 确定方向
    // Payment -> 纵向 (p)
    // Invoice -> 
    //   - Cross (2x2) -> 横向 (l)
    //   - Vertical (1x2) -> 纵向 (p)
    
    const filename = 'combined_export.pdf';
    
    // 查找所有打印容器内的页面
    const printContainer = document.getElementById('print-container');
    if (!printContainer) {
        console.error("Print container not found");
        return null;
    }

    // 选择 .print-page-wrapper 下的子 div
    const pages = printContainer.querySelectorAll('.print-page-wrapper > div');

    if (!pages || pages.length === 0) {
      console.warn("No pages found to export");
      return null;
    }

    // 初始化 PDF (方向将按页设置)
    const firstPage = pages[0] as HTMLElement;
    const firstOrientation = firstPage.getAttribute('data-orientation') || 'p';
    
    // jsPDF 实例
    const pdf = new jsPDF({
      orientation: firstOrientation as 'p' | 'l',
      unit: 'mm',
      format: 'a4',
      compress: true
    });

    for (let i = 0; i < pages.length; i++) {
        const originalPage = pages[i] as HTMLElement;
        const orientation = originalPage.getAttribute('data-orientation') || 'p';

        // 1. 克隆页面
        const clonedPage = originalPage.cloneNode(true) as HTMLElement;
        
        // 2. 准备克隆节点进行截图
        // - 移除阴影
        clonedPage.style.boxShadow = 'none';
        clonedPage.style.margin = '0';
        // - 定位到屏幕外但可见
        clonedPage.style.position = 'fixed';
        clonedPage.style.top = '-9999px';
        clonedPage.style.left = '-9999px';
        clonedPage.style.zIndex = '5000'; 
        
        // 确保可见性和不透明度
        clonedPage.style.opacity = '1'; 
        clonedPage.style.visibility = 'visible';

        // - 确保尺寸锁定 (A4)
        const isLandscape = orientation === 'l';
        clonedPage.style.width = isLandscape ? '297mm' : '210mm';
        clonedPage.style.height = isLandscape ? '210mm' : '297mm';
        
        // 隐藏不需要导出的元素 (如网格线、页码)
        const hiddenElements = clonedPage.querySelectorAll('.pdf-export-hidden');
        hiddenElements.forEach(el => {
           (el as HTMLElement).style.display = 'none';
        });

        // 强制特定容器为白底 (Fix: 502)
        const whiteBgElements = clonedPage.querySelectorAll('.pdf-export-bg-white');
        whiteBgElements.forEach(el => {
           (el as HTMLElement).style.backgroundColor = '#ffffff';
        });

        // 强制移除边框 (Fix: 503)
        const borderNoneElements = clonedPage.querySelectorAll('.pdf-export-border-none');
        borderNoneElements.forEach(el => {
           (el as HTMLElement).style.border = 'none';
           (el as HTMLElement).style.boxShadow = 'none';
        });

        // 隐藏空的输入框容器 (金额 & 用途)
        const inputContainers = clonedPage.querySelectorAll('.export-input-container');
        inputContainers.forEach(container => {
           const inputs = container.querySelectorAll('input');
           let isEmpty = true;
           inputs.forEach(input => {
             const val = input.value.trim();
             if (val && val !== '0' && val !== '0.00') {
               isEmpty = false;
             }
           });
           
           if (isEmpty) {
             (container as HTMLElement).style.display = 'none';
           }
        });
        
        // 3. 处理输入框: 用 div 文本替换 <input> 以保证渲染一致性
        const originalInputs = originalPage.querySelectorAll('input, textarea');
        const clonedInputs = clonedPage.querySelectorAll('input, textarea');
        
        for (let j = 0; j < originalInputs.length; j++) {
            const originalInput = originalInputs[j] as HTMLInputElement | HTMLTextAreaElement;
            const clonedInput = clonedInputs[j] as HTMLInputElement | HTMLTextAreaElement;
            
            // 创建替代 div
            const replacement = document.createElement('div');
            
            const computedStyle = window.getComputedStyle(originalInput);

            replacement.style.fontFamily = computedStyle.fontFamily;
            replacement.style.fontSize = computedStyle.fontSize;
            replacement.style.fontWeight = computedStyle.fontWeight;
            replacement.style.textAlign = computedStyle.textAlign;
            replacement.style.color = computedStyle.color;
            replacement.style.boxSizing = computedStyle.boxSizing;
            
            // 关键: 复制精确尺寸和盒模型
            replacement.style.width = computedStyle.width;
            replacement.style.height = computedStyle.height;
            replacement.style.padding = computedStyle.padding;
            replacement.style.margin = computedStyle.margin;
            replacement.style.lineHeight = computedStyle.lineHeight;

            replacement.style.backgroundColor = 'transparent'; 
            replacement.style.border = 'none'; 
            
            // 使用 Flex 确保垂直对齐一致
            replacement.style.display = 'flex';
            replacement.style.alignItems = 'center'; 
            
            // 处理水平对齐
            if (computedStyle.textAlign === 'center') replacement.style.justifyContent = 'center';
            else if (computedStyle.textAlign === 'right') replacement.style.justifyContent = 'flex-end';
            else replacement.style.justifyContent = 'flex-start';

            // 设置文本值
            const val = originalInput.value;
            replacement.textContent = val;

            replacement.className = clonedInput.className; 
            
            if (clonedInput.parentNode) {
                clonedInput.parentNode.replaceChild(replacement, clonedInput);
            }
        }

        // 4. 追加克隆节点到 body (隐藏容器之外)
        document.body.appendChild(clonedPage);
        
        try {
          // 5. 执行截图
          const canvas = await html2canvas(clonedPage, {
            scale: 3, 
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            onclone: () => {
                // 确保样式应用
            }
          });
          
          const imgData = canvas.toDataURL('image/jpeg', 1.0); // 最高质量
          
          const pdfWidth = isLandscape ? 297 : 210;
          const pdfHeight = isLandscape ? 210 : 297;
          
          if (i > 0) {
            pdf.addPage('a4', isLandscape ? 'l' : 'p');
          }
          
          pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
          
        } catch (err) {
          console.error("Error generating PDF page", i, err);
        } finally {
          // 6. 清理
          document.body.removeChild(clonedPage);
        }
    }

    return { pdf, filename };

  }, [appMode, invoiceLayout]);

  const generatePdfUrl = useCallback(async () => {
    setIsExporting(true);
    try {
      const result = await generatePdf();
      if (!result) return null;
      
      const blob = result.pdf.output('blob');
      return { 
          url: URL.createObjectURL(blob), 
          filename: result.filename 
      };
    } finally {
      setIsExporting(false);
    }
  }, [generatePdf, setIsExporting]);

  return { generatePdfUrl };
}
