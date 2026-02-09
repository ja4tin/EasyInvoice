/**
 * Project: EasyInvoice
 * File: image-processing.ts
 * Description: 图片处理工具库，处理 File 读取、尺寸压缩、Base64 转换及 PDF 解析
 * Author: Ja4tin (ja4tin@hotmail.com)
 * Date: 2026-02-04
 * License: MIT
 */

import * as pdfjsLib from "pdfjs-dist";
import PdfWorkerUrl from '../pdf.worker?worker&url';

// 显式设置 worker 路径，适配 Vite 构建环境
pdfjsLib.GlobalWorkerOptions.workerSrc = PdfWorkerUrl;

/**
 * 将 File 对象转换为 Base64 字符串
 */
export const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target?.result as string);
    };
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
};

/**
 * 加载图片以获取尺寸
 */
export const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

export interface ProcessedImage {
  base64: string;
  width: number;
  height: number;
  name: string;
}

const MAX_WIDTH = 2500;

/**
 * 处理图片文件：读取并压缩尺寸 (最大宽度 2500px)
 * 返回处理后的 Base64 数据及元信息
 */
export const processImage = async (file: File): Promise<ProcessedImage> => {
  const originalBase64 = await fileToDataUrl(file);
  const img = await loadImage(originalBase64);

  let { width, height } = img;

  // 如果宽度超过最大限制，进行等比缩放
  if (width > MAX_WIDTH) {
    const scale = MAX_WIDTH / width;
    width = MAX_WIDTH;
    height = Math.round(height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      ctx.drawImage(img, 0, 0, width, height);
      // 使用 0.9 质量压缩 JPEG
      const compressedBase64 = canvas.toDataURL(file.type || "image/jpeg", 0.9);
      return {
        base64: compressedBase64,
        width,
        height,
        name: file.name,
      };
    }
  }

  return {
    base64: originalBase64,
    width,
    height,
    name: file.name,
  };
};

/**
 * 处理 PDF 文件，将每一页转换为独立的图片
 */
export const processPdf = async (file: File): Promise<ProcessedImage[]> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pageCount = pdf.numPages;
  const processedImages: ProcessedImage[] = [];

  for (let i = 1; i <= pageCount; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 4.0 }); // 使用 4.0 倍率 (约 300DPI) 以匹配 A4 打印精度

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    if (!context) continue;

    await page.render({
      canvasContext: context,
      viewport: viewport,
    } as any).promise;

    // Use PNG for lossless quality on PDF imports
    const base64 = canvas.toDataURL('image/png');

    // 对生成的图片应用同样的尺寸限制逻辑
    const processed = await processImageFromBase64(base64, `${file.name}-page-${i}.png`);
    processedImages.push(processed);
  }

  return processedImages;
};

/**
 * 内部辅助函数：处理 Base64 图片 (如需缩放)
 */
const processImageFromBase64 = async (base64: string, name: string): Promise<ProcessedImage> => {
  const img = await loadImage(base64);
  let { width, height } = img;

  if (width > MAX_WIDTH) {
    const scale = MAX_WIDTH / width;
    width = MAX_WIDTH;
    height = Math.round(height * scale);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      ctx.drawImage(img, 0, 0, width, height);
      // If it's a PNG (from PDF), keep it as PNG if possible, or high-quality JPEG if we must compress.
      // For the "Hybrid Lossless" scheme, we prefer PNG for PDF sources if we can.
      // However, checking file type from base64 string or name is needed.
      const isPng = name.toLowerCase().endsWith('.png');
      const format = isPng ? 'image/png' : 'image/jpeg';
      const quality = isPng ? undefined : 0.9;

      return {
        base64: canvas.toDataURL(format, quality),
        width,
        height,
        name,
      };
    }
  }

  return {
    base64,
    width,
    height,
    name,
  };
};
