/**
 * Project: EasyInvoice
 * File: UploadZone.tsx
 * Description: 文件上传区域，支持拖拽、排重和自动预分配布局
 * Author: Ja4tin (ja4tin@hotmail.com)
 * Date: 2026-02-04
 * License: MIT
 */

import { useCallback, useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useDropzone } from 'react-dropzone'
import { Upload, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useInvoiceStore } from '@/store/useInvoiceStore'
import { useSettingsStore } from '@/store/useSettingsStore'
import { processImage, processPdf } from '@/lib/image-processing'

export const UploadZone = () => {
  const [isProcessing, setIsProcessing] = useState(false)
  const [showDuplicateAlert, setShowDuplicateAlert] = useState(false)
  const [duplicateCount, setDuplicateCount] = useState(0)
  
  const addItems = useInvoiceStore((state) => state.addItems)
  const { settings } = useSettingsStore();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    // 1. 过滤重复文件 (使用 getState() 避免闭包陷阱)
    const currentItems = useInvoiceStore.getState().items;
    
    const isDuplicate = (file: File) => {
      const normFileName = file.name.normalize('NFC');
      return currentItems.some(item => {
        const normItemName = item.name.normalize('NFC');
        // 检查完全匹配或 PDF 分页匹配模式 (filename-page-N.jpg)
        return normItemName === normFileName || 
               normItemName.startsWith(normFileName + '-page-');
      });
    };

    const duplicates = acceptedFiles.filter(file => isDuplicate(file));
    
    if (duplicates.length > 0) {
      setDuplicateCount(duplicates.length);
      setShowDuplicateAlert(true);
    }

    // 2. 仅处理唯一文件
    const uniqueFiles = acceptedFiles.filter(file => !isDuplicate(file));

    if (uniqueFiles.length === 0) return;

    setIsProcessing(true)
    try {
      const tasks = uniqueFiles.map(async (file) => {
         if (file.type === 'application/pdf') {
             return processPdf(file);
         } else {
             return [await processImage(file)];
         }
      });

      const results = await Promise.all(tasks);
      const processed = results.flat();
      
      const state = useInvoiceStore.getState();
      const currentItemsInStore = state.items;
      const isVoucherVisible = state.isVoucherVisible;

      addItems(processed.map((img, index) => {
        const isLandscape = img.width > img.height;
        // 默认逻辑:
        // 横向图片 -> 4x3 (宽横幅)
        // 纵向图片 -> 2x3 (半列)
        // 注意：原代码逻辑中 4x3 是宽为 4，高为 3
        
        let defaultW = isLandscape ? 4 : 2;
        let defaultH = 3;

        // 首页凭单智能逻辑:
        // 如果凭单可见，且这是第一张图片（或工作区为空时的第一张）
        // 仅对本次上传批次的第一张应用此逻辑，前提是工作区之前也是空的
        const isFirstItemInWorkspace = currentItemsInStore.length === 0 && index === 0;

        if (isVoucherVisible && isFirstItemInWorkspace) {
             if (isLandscape) {
                 // 首页横向 -> 4x2 (为了放入凭单下方的剩余空间)
                 defaultH = 2;
             } else {
                 // 首页纵向 -> 2x4 (占据一整列)
                 defaultH = 4;
                 // 宽度保持 2
             }
        }

        return {
          name: img.name,
          fileData: img.base64,
          width: defaultW,
          height: defaultH,
          // 默认值
          amount: 0,
          category: '',
          invoiceDate: new Date().toISOString().split('T')[0],
          workspaceId: settings.appMode, // 直接分配到当前工作区
        };
      }))
      
    } catch (error) {
      console.error('Failed to process images', error)
    } finally {
      setIsProcessing(false)
    }
  }, [addItems, settings.appMode])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
      'application/pdf': ['.pdf']
    },
    disabled: isProcessing,
    noClick: false, // 允许点击
    noKeyboard: false
  })

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-lg p-6 transition-colors duration-200 cursor-pointer flex flex-col items-center justify-center gap-2 text-center bg-muted/20",
        isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
        isProcessing && "opacity-50 cursor-not-allowed"
      )}
    >
      <input {...getInputProps()} />
      {isProcessing ? (
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      ) : (
        <Upload className="h-8 w-8 text-muted-foreground" />
      )}
      
      <div className="text-sm text-muted-foreground">
        {isDragActive ? (
          <p>松开以添加文件...</p>
        ) : (
          <p>
            <span className="font-semibold text-primary">点击上传</span> 或拖拽发票/PDF到此处
          </p>
        )}
      </div>
      <p className="text-xs text-muted-foreground/70">
        支持 JPG, PNG, WEBP, PDF
      </p>

      <AlertDialog open={showDuplicateAlert} onOpenChange={setShowDuplicateAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>发现重复文件</AlertDialogTitle>
            <AlertDialogDescription>
              有 {duplicateCount} 个文件已存在于列表中。这些重复文件已被跳过，未添加的文件已成功上传。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowDuplicateAlert(false)}>知道了</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
