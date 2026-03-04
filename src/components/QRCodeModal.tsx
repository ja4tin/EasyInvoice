import React, { useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { usePeerStore } from '@/store/usePeerStore';
import { peerClient } from '@/lib/peerClient';
import { Smartphone, Wifi, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { useInvoiceStore } from '@/store/useInvoiceStore';
import { useSettingsStore } from '@/store/useSettingsStore';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QRCodeModal = ({ isOpen, onClose }: QRCodeModalProps) => {
  const { peerId, connectionState, error } = usePeerStore();
  const addItems = useInvoiceStore(state => state.addItems);
  const { settings } = useSettingsStore();

  useEffect(() => {
    if (isOpen) {
      peerClient.initializeHost();
    } else {
      // We don't want to destroy the connection when modal closes if we are connected!
      // But we just wait for connection, if disconnected, we destroy.
      // Wait, if it connects and modal closes, the host needs to stay connected to receive files.
      // So only destroy if it's NOT connected.
    }
  }, [isOpen]);

  useEffect(() => {
     if (!isOpen && connectionState !== 'connected') {
         peerClient.destroy();
     }
  }, [isOpen, connectionState]);

  // 当连接成功时自动关闭弹窗
  useEffect(() => {
    if (connectionState === 'connected' && isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 1500); // 留出展现绿色的时间
      return () => clearTimeout(timer);
    }
  }, [connectionState, isOpen, onClose]);

  // 监听并接收数据插入画板
  useEffect(() => {
    peerClient.setOnDataCallback((data: any) => {
      // 收到的格式为 { type: 'IMAGE', payload: ProcessedImage }
      if (data && data.type === 'IMAGE' && data.payload) {
         addItems([{
            name: data.payload.name || `mobile-${Date.now()}.jpg`,
            fileData: data.payload.base64,
            width: data.payload.width,
            height: data.payload.height,
            amount: 0,
            category: '',
            invoiceDate: new Date().toISOString().split('T')[0],
            workspaceId: settings.appMode, // 分配到当前打开的视图
         }]);
      }
    });

    return () => {
      peerClient.setOnDataCallback(() => {});
    };
  }, [addItems, settings.appMode]);

  const uploadUrl = peerId 
    ? `${window.location.origin}/mobile-upload?hostId=${peerId}`
    : '';

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md flex flex-col items-center p-8 outline-none">
        <DialogHeader className="text-center w-full mb-4 outline-none">
          <DialogTitle className="text-xl font-semibold flex items-center justify-center gap-2">
            <Smartphone className="w-5 h-5" /> 手机扫码直传
          </DialogTitle>
          <DialogDescription className="text-center">
            无缝跨端，局域网极速安全传输
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center justify-center p-6 bg-white rounded-xl border-2 border-dashed border-primary/20 shadow-sm relative w-64 h-64">
          {connectionState === 'connecting' && !peerId && (
            <div className="flex flex-col items-center text-muted-foreground gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
              <p className="text-sm">正在建立 P2P 节点...</p>
            </div>
          )}

          {error && (
             <div className="flex flex-col items-center text-destructive gap-3 text-center">
               <AlertCircle className="w-8 h-8" />
               <p className="text-sm text-balance">{error}</p>
             </div>
          )}

          {peerId && connectionState === 'disconnected' && !error && (
            <div className="animate-in fade-in zoom-in duration-300">
               <QRCodeSVG 
                 value={uploadUrl} 
                 size={180}
                 level="H"
                 includeMargin={true}
                 className="rounded-lg shadow-sm"
               />
            </div>
          )}

          {connectionState === 'connected' && (
             <div className="flex flex-col items-center text-emerald-500 gap-3 animate-in zoom-in spin-in-12 duration-500">
               <CheckCircle2 className="w-16 h-16" />
               <p className="font-semibold text-lg">设备已连接</p>
             </div>
          )}
        </div>

        <div className="mt-6 flex flex-col items-center gap-2 text-sm text-muted-foreground text-center">
          <p className="flex items-center gap-1">
             <Wifi className="w-4 h-4" /> 建议连接同一网络 (亦支持公网)
          </p>
          <p className="text-xs opacity-70">
             使用微信或系统相机扫描二维码直接开始传图
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
