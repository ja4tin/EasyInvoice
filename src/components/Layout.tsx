import React, { useState } from 'react';
import { useExportPdf } from '@/features/editor/hooks/useExportPdf';
import { PdfPreviewModal } from '@/features/export/components/PdfPreviewModal';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UploadZone } from '@/features/upload/components/UploadZone'
import { UploadedFileList } from '@/features/upload/components/UploadedFileList'
import { useSettingsStore } from '@/store/useSettingsStore'
import { useInvoiceStore } from '@/store/useInvoiceStore'
import { usePrint } from '@/features/editor/hooks/usePrint'
import { Trash2, Printer } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { PageNavigator } from '@/features/editor/components/PageNavigator'
import { useGridLayout } from '@/features/editor/hooks/useGridLayout'
import { PropertiesPanel } from '@/features/editor/components/PropertiesPanel'

interface LayoutProps {
  children?: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { appMode, invoiceLayout } = useSettingsStore(state => state.settings);
  const updateSettings = useSettingsStore(state => state.updateSettings);
  const { generatePdfUrl } = useExportPdf();
  const { print } = usePrint();
  const items = useInvoiceStore(state => state.items);

  // Calculate total pages for Navigator
  const canvasItems = items.filter(item => item.workspaceId === appMode);
  const { totalPages } = useGridLayout({
    items: canvasItems,
    columns: 4,
    rows: 6,
    appMode,
    invoiceLayout
  });
  
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfFilename, setPdfFilename] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleExportClick = async () => {
    setIsPreviewOpen(true);
    setIsGenerating(true);
    setPdfUrl(null);
    
    // Small delay to allow modal to open
    setTimeout(async () => {
      const result = await generatePdfUrl();
      if (result) {
         setPdfUrl(result.url);
         setPdfFilename(result.filename);
      }
      setIsGenerating(false);
    }, 100);
  };

  const handleDownload = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = pdfFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background font-sans antialiased text-foreground">
      {/* Left Sidebar - Data Source */}
      <aside className="hidden w-[280px] flex-col border-r bg-muted/30 md:flex">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <a href="/" className="flex items-center gap-2 font-semibold">
            <span className="">EasyInvoice</span>
          </a>
        </div>
        <div className="flex-1 overflow-auto py-2">
            <div className="px-4 py-2 space-y-4">
                <UploadZone />
                <UploadedFileList />
            </div>
        </div>
      </aside>

      {/* Main Workspace - Canvas */}
      <main className="flex flex-1 flex-col relative overflow-hidden bg-muted/50">
        <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6">
           {/* Top Toolbar Placeholder */}
           <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-4">
                  <h1 className="font-semibold text-lg">工作区</h1>
                  <div className="flex items-center bg-muted rounded-lg p-1 h-8">
                      <button 
                        onClick={() => updateSettings({ appMode: 'payment' })}
                        className={cn(
                          "px-3 text-sm font-medium rounded-md transition-all h-full flex items-center",
                          appMode === 'payment' ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        付款凭单
                      </button>
                      <button 
                         onClick={() => updateSettings({ appMode: 'invoice' })}
                         className={cn(
                            "px-3 text-sm font-medium rounded-md transition-all h-full flex items-center",
                            appMode === 'invoice' ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                         )}
                      >
                        报销发票
                      </button>
                  </div>
                  
                  {/* Page Navigator */}
                  <PageNavigator totalPages={totalPages} />

                  {/* Invoice Layout Options (Only show in Invoice mode) */}
                  {appMode === 'invoice' && (
                     <div className="flex items-center gap-2 border-l pl-4 ml-2">
                        <span className="text-sm text-muted-foreground">布局:</span>
                        <select 
                          className="h-8 text-sm bg-transparent border rounded px-2"
                          value={invoiceLayout}
                          onChange={(e) => updateSettings({ invoiceLayout: e.target.value as any })}
                        >
                            <option value="cross">田字格 (2x2)</option>
                            <option value="vertical">上下分栏 (1x2)</option>
                        </select>
                     </div>
                  )}
               </div>
              

              

              <div className="flex items-center gap-2">
                 {/* Right Toolbar actions */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                          <Trash2 className="w-4 h-4 mr-2" />
                          清空
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>确认清空所有内容？</AlertDialogTitle>
                        <AlertDialogDescription>
                          此操作将清空所有上传的文件和表单数据，但会保留下次使用的默认设置（如报销人）。此操作无法撤销。
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction onClick={() => useInvoiceStore.getState().clearAllItems()} className="bg-destructive hover:bg-destructive/90">
                          确认清空
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                 <div className="h-4 w-[1px] bg-border mx-1" />

                 <Button variant="outline" size="sm" onClick={print}>
                    <Printer className="w-4 h-4 mr-2" />
                    打印
                 </Button>

                 <Button variant="outline" size="sm" onClick={handleExportClick}>
                    <Download className="w-4 h-4 mr-2" />
                    导出 PDF
                 </Button>
              </div>
           </div>
        </header>

        {/* Canvas Area */}
        <div id="invoice-scroll-container" className="flex-1 overflow-auto p-8 relative w-full h-full flex flex-col items-center">
            {children}
        </div>
      </main>

      {/* Right Sidebar - Properties */}
      {/* Right Sidebar - Properties */}
      <PropertiesPanel />

      <PdfPreviewModal 
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        pdfUrl={pdfUrl}
        onDownload={handleDownload}
        isGenerating={isGenerating}
      />
    </div>
  );
};
