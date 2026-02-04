/**
 * Project: EasyInvoice
 * File: ImageEditorModal.tsx
 * Description: 图片裁剪与旋转编辑器模态框
 * Author: Ja4tin (ja4tin@hotmail.com)
 * Date: 2026-02-04
 * License: MIT
 */

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
  
  // 旋转逻辑说明:
  // 当我们保存时，会将旋转“烘焙”到图片中。因此再次打开时，图片已经是旋转过的，初始旋转应为 0。
  // Store 中的 `rotation` 是 CSS 旋转。
  // 我们在模态框中提供手动旋转工具。
  
  const handleSave = () => {
    const cropper = cropperRef.current?.cropper;
    if (cropper) {
      // 获取裁剪后的 canvas
      const canvas = cropper.getCroppedCanvas({
        maxWidth: 2000,
        maxHeight: 2000,
        fillColor: '#fff', // 处理透明区域 (jpegs)
      });
      
      const newBase64 = canvas.toDataURL('image/jpeg', 0.85); // 轻微压缩
      
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
                // Cropper.js 选项
                initialAspectRatio={NaN} // 自由比例
                guides={true}
                viewMode={1} // 限制裁剪框在画布内
                dragMode="move" // 默认移动图片
                toggleDragModeOnDblclick={false}
                responsive={true}
                checkOrientation={false} // 阻止基于 exif 的自动旋转
                autoCropArea={0.9}
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
