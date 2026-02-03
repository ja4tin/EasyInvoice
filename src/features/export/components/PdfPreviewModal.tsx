import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download } from 'lucide-react';

interface PdfPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string | null;
  onDownload: () => void;
  isGenerating: boolean;
}

export const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({
  isOpen,
  onClose,
  pdfUrl,
  onDownload,
  isGenerating
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle>导出预览</DialogTitle>
             {/* Close button is handled by DialogPrimitive usually, but we can add explicit actions if needed */}
          </div>
        </DialogHeader>

        <div className="flex-1 bg-slate-100 p-4 overflow-hidden relative flex items-center justify-center">
            {isGenerating ? (
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    <p className="text-muted-foreground">正在生成 PDF...</p>
                </div>
            ) : pdfUrl ? (
                <iframe 
                    src={`${pdfUrl}#toolbar=0&view=FitH`}
                    className="w-full h-full rounded-md shadow-sm bg-white"
                    title="PDF Preview"
                />
            ) : (
                <p className="text-muted-foreground">无法预览</p>
            )}
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-background flex-shrink-0 gap-2">
           <Button variant="outline" onClick={onClose}>
              取消
           </Button>
           <Button onClick={onDownload} disabled={!pdfUrl || isGenerating}>
              <Download className="w-4 h-4 mr-2" />
              下载 PDF
           </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
