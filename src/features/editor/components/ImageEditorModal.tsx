import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useRef } from 'react';
import Cropper, { type ReactCropperElement } from 'react-cropper';
import 'cropperjs/dist/cropper.css';
import { RotateCcw, RotateCw, Check, X, RotateCcw as ResetIcon } from 'lucide-react';
import { useInvoiceStore } from '@/store/useInvoiceStore';

interface ImageEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileId: string;
}

export function ImageEditorModal({ isOpen, onClose, fileId }: ImageEditorModalProps) {
  const fileItem = useInvoiceStore((state) => state.items.find((item) => item.id === fileId));
  const updateItemImage = useInvoiceStore((state) => state.updateItemImage);
  const cropperRef = useRef<ReactCropperElement>(null);
  
  // Local state for rotation relative to the NEWLY LOADED image in cropper
  // NOTE: When we save, we burn the rotation into the image. So when we reopen, 
  // the image is already rotated, and initial rotation should be 0.
  // The store's `rotation` is for CSS rotation on the canvas. 
  // We want to apply the canvas rotation to the cropper initially if possible, 
  // OR just let the user re-adjust. 
  // Given the requirement "Reset rotation to 0 after save", implies that we consume the rotation.
  
  // However, cropperjs `rotateTo` is absolute. 
  // Let's just provide manual rotation tools in the modal.
  
  const handleSave = () => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      // Get cropped canvas
      // We can specify min/max layout to avoid huge images
      const canvas = cropper.getCroppedCanvas({
        maxWidth: 2000,
        maxHeight: 2000,
        fillColor: '#fff', // Handle transparent areas if any (jpegs)
      });
      
      const newBase64 = canvas.toDataURL('image/jpeg', 0.85); // Compress slightly
      
      updateItemImage(fileId, newBase64);
      onClose();
    }
  };

  const rotateLeft = () => {
    cropperRef.current?.cropper.rotate(-90);
  };

  const rotateRight = () => {
    cropperRef.current?.cropper.rotate(90);
  };
  
  const resetCropper = () => {
      cropperRef.current?.cropper.reset();
  }

  if (!fileItem) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[90vw] h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle>编辑图片</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden relative bg-black/5 p-4 flex items-center justify-center">
             <Cropper
                ref={cropperRef}
                src={fileItem.fileData}
                style={{ height: '100%', width: '100%' }}
                // Cropper.js options
                initialAspectRatio={NaN} // Free aspect ratio
                guides={true}
                viewMode={1} // Restrict crop box to canvas
                dragMode="move" // Move image, not crop box by default (optional)
                toggleDragModeOnDblclick={false}
                responsive={true}
                checkOrientation={false} // Prevent auto-rotation based on exif
                autoCropArea={0.9}
                // Initialize with current CSS rotation? 
                // Using `rotateTo` in `ready` event is better if needed.
                // For now, start fresh. Canvas rotation is separate for now 
                // but will be reset to 0 upon save.
              />
        </div>

        <DialogFooter className="p-4 border-t gap-2 sm:gap-0 flex-col sm:flex-row items-center justify-between">
            <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start">
                 <Button variant="outline" size="icon" onClick={rotateLeft} title="向左旋转">
                    <RotateCcw className="h-4 w-4" />
                 </Button>
                 <Button variant="outline" size="icon" onClick={rotateRight} title="向右旋转">
                    <RotateCw className="h-4 w-4" />
                 </Button>
                 <Button variant="ghost" size="sm" onClick={resetCropper}>
                    <ResetIcon className="h-4 w-4 mr-1" /> 重置
                 </Button>
            </div>
            
             <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-end mt-2 sm:mt-0">
                <Button variant="secondary" onClick={onClose}>
                    <X className="h-4 w-4 mr-1" /> 取消
                </Button>
                <Button onClick={handleSave}>
                    <Check className="h-4 w-4 mr-1" /> 保存并应用
                </Button>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
