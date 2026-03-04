import { useCallback } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { useInvoiceStore } from "@/store/useInvoiceStore";
import { useExportPdf } from "./useExportPdf";
import type { InvoiceItem } from "@/types";

export function useExportZip() {
  const { items, setIsExporting } = useInvoiceStore();
  const { generatePdfUrl } = useExportPdf();

  const exportZip = useCallback(async () => {
    if (items.length === 0) {
      console.warn("No items to export");
      return;
    }

    setIsExporting(true);
    try {
      const zip = new JSZip();

      // 1. 生成 PDF
      const pdfResult = await generatePdfUrl();
      if (pdfResult) {
        // fetch the blob from the object URL
        const pdfBlob = await fetch(pdfResult.url).then((res) => res.blob());
        zip.file(pdfResult.filename, pdfBlob);
      }

      // 2. 收集原始图片并重命名
      const imagesFolder = zip.folder("images");
      if (imagesFolder) {
        items.forEach((item: InvoiceItem, index: number) => {
          // 格式化序号: 01, 02, 03
          const sequence = (index + 1).toString().padStart(2, "0");
          
          // 处理用途，去除可能导致文件名的非法字符
          const safeUsage = item.usage ? item.usage.replace(/[/\\?%*:|"<>]/g, '-') : "未命名用途";
          
          // 根据工作区判断前缀
          const prefix = item.workspaceId === 'payment' ? 'payment' : 'invoice';

          // 金额处理，确保只有数字和小数点
          const safeAmount = item.amount ? item.amount.toString().replace(/[^0-9.]/g, '') : "0.00";

          // 判断扩展名，简单假设 dataURL 类型
          let ext = "jpg";
          if (item.fileData.startsWith("data:image/png")) ext = "png";
          else if (item.fileData.startsWith("data:image/jpeg")) ext = "jpg";
          else if (item.fileData.startsWith("data:image/webp")) ext = "webp";

          const filename = `${prefix}_${sequence}_${safeUsage}_${safeAmount}.${ext}`;

          // 将 base64 转换为 blob 添加到 zip
          // 移除 "data:image/jpeg;base64," 前缀
          const base64Data = item.fileData.split(',')[1];
          if (base64Data) {
              imagesFolder.file(filename, base64Data, { base64: true });
          }
        });
      }

      // 3. 生成 ZIP 并下载
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, "EasyInvoice_Archive.zip");

    } catch (error) {
      console.error("Error creating ZIP archive:", error);
    } finally {
      setIsExporting(false);
    }
  }, [items, generatePdfUrl, setIsExporting]);

  return { exportZip };
}
