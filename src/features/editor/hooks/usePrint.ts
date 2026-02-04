/**
 * Project: EasyInvoice
 * File: usePrint.ts
 * Description: 打印功能 Hook，复用 PDF 生成逻辑进行打印
 * Author: Ja4tin (ja4tin@hotmail.com)
 * Date: 2026-02-04
 * License: MIT
 */

import { useCallback } from 'react';
import { useExportPdf } from './useExportPdf';

export function usePrint() {
  const { generatePdfUrl } = useExportPdf();

  const print = useCallback(async () => {
    try {
      const result = await generatePdfUrl();
      if (!result) return;

      const { url } = result;

      // 创建隐藏的 iframe
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.top = '-9999px';
      iframe.style.left = '-9999px';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.src = url;

      document.body.appendChild(iframe);

      // 等待内容加载后打印
      iframe.onload = () => {
        // 短暂延迟确保 PDF 渲染
        setTimeout(() => {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          
          // 打印对话框关闭后清理 (近似处理)
          // 由于无法精确知道打印窗口何时关闭，延迟移除 iframe
          setTimeout(() => {
             document.body.removeChild(iframe);
             URL.revokeObjectURL(url);
          }, 60000); // 1分钟后清理
        }, 500);
      };

    } catch (error) {
      console.error("Print failed:", error);
    }
  }, [generatePdfUrl]);

  return { print };
}
