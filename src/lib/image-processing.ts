/**
 * Reads a File object and returns it as a Base64 string.
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
 * Loads an image from a data URL to get its dimensions.
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

const MAX_WIDTH = 1500;

/**
 * Processes an image file: reads it, resizes if necessary (max width 1500px),
 * and returns the processed data.
 */
export const processImage = async (file: File): Promise<ProcessedImage> => {
  const originalBase64 = await fileToDataUrl(file);
  const img = await loadImage(originalBase64);

  let { width, height } = img;

  // Resize if width exceeds MAX_WIDTH
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
      // specific type for quality
      const compressedBase64 = canvas.toDataURL(file.type || 'image/jpeg', 0.8);
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

import * as pdfjsLib from 'pdfjs-dist';

// Explicitly setting the worker source to the version installed in node_modules
// This requires the build system (Vite) to correctly handle the worker file
// For simplicity in a standard Vite setup, we can use the CDN or a local copy if the import fails
// Using a robust dynamic import approach for the worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

/**
 * Processes a PDF file, converting each page into an image.
 */
export const processPdf = async (file: File): Promise<ProcessedImage[]> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pageCount = pdf.numPages;
  const processedImages: ProcessedImage[] = [];

  for (let i = 1; i <= pageCount; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2.0 }); // Scale 2.0 for better quality

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    if (!context) continue;

    await page.render({
      canvasContext: context,
      viewport: viewport,
    } as any).promise;

    const base64 = canvas.toDataURL('image/jpeg', 0.8);

    // Apply the same max width logic as images
    const processed = await processImageFromBase64(base64, `${file.name}-page-${i}.jpg`);
    processedImages.push(processed);
  }

  return processedImages;
};

/**
 * Internal helper to process a base64 string as an image (resizing if needed).
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
        return {
          base64: canvas.toDataURL('image/jpeg', 0.8),
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
