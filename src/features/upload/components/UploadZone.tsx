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

export function UploadZone() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [showDuplicateAlert, setShowDuplicateAlert] = useState(false)
  const [duplicateCount, setDuplicateCount] = useState(0)
  
  const addItems = useInvoiceStore((state) => state.addItems)
  const appMode = useSettingsStore((state) => state.settings.appMode)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return

    // 1. Filter duplicates (Use getState() to avoid stale closure)
    const currentItems = useInvoiceStore.getState().items;
    
    const isDuplicate = (file: File) => {
      const normFileName = file.name.normalize('NFC');
      return currentItems.some(item => {
        const normItemName = item.name.normalize('NFC');
        // Check for exact match or PDF page match pattern (filename-page-N.jpg)
        return normItemName === normFileName || 
               normItemName.startsWith(normFileName + '-page-');
      });
    };

    const duplicates = acceptedFiles.filter(file => isDuplicate(file));
    
    if (duplicates.length > 0) {
      setDuplicateCount(duplicates.length);
      setShowDuplicateAlert(true);
    }

    // 2. Process unique files only
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
      
      addItems(processed.map(img => ({
        name: img.name,
        fileData: img.base64,
        width: img.width,
        height: img.height,
        // Default values
        amount: 0,
        category: '',
        invoiceDate: new Date().toISOString().split('T')[0],
        workspaceId: appMode
      })))
      
    } catch (error) {
      console.error('Failed to process images', error)
    } finally {
      setIsProcessing(false)
    }
  }, [addItems])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp'],
      'application/pdf': ['.pdf']
    },
    disabled: isProcessing,
    noClick: false, // Allow clicking
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
