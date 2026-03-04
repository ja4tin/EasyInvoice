import React, { useEffect, useState, useRef } from 'react';
import { usePeerStore } from '@/store/usePeerStore';
import { peerClient } from '@/lib/peerClient';
import { processImage, processPdf } from '@/lib/image-processing';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, AlertCircle, Camera, Smartphone } from 'lucide-react';

export const MobileUpload = () => {
  const { connectionState, error } = usePeerStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadCount, setUploadCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // 提取 URL 中的 hostId
    const searchParams = new URLSearchParams(window.location.search);
    const hostId = searchParams.get('hostId');

    if (hostId) {
      peerClient.connectToHost(hostId);
    } else {
      usePeerStore.getState().setError('未检测到设备 ID，请重新扫码');
    }

    return () => {
      peerClient.destroy();
    };
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    let successCount = 0;

    try {
      // 串行或并行处理所有选择的图片与PDF
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
          const processedPages = await processPdf(file);
          for (const page of processedPages) {
            const dataPayload = {
              type: 'IMAGE',
              payload: page
            };
            const success = peerClient.sendData(dataPayload);
            if (success) {
               successCount++;
            }
          }
        } else {
          // 我们在移动端复用 processImage，确保图片大小可控，极大地缓解 P2P 传输时的压力
          const processed = await processImage(file);
          
          const dataPayload = {
            type: 'IMAGE',
            payload: processed
          };

          const success = peerClient.sendData(dataPayload);
          if (success) {
             successCount++;
          }
        }
      }
    } catch (err) {
      console.error('Failed to process and send images:', err);
    } finally {
      setIsProcessing(false);
      setUploadCount(prev => prev + successCount);
      if (fileInputRef.current) {
         fileInputRef.current.value = ''; // 重置 input
      }
    }
  };

  return (
    <div className="flex flex-col min-h-[100dvh] bg-slate-50 relative font-sans">
      <header className="px-6 py-4 bg-white border-b sticky top-0 z-10 flex items-center gap-3 shadow-sm">
         <Smartphone className="w-6 h-6 text-primary" />
         <h1 className="text-xl font-bold tracking-tight">手机传图助手</h1>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 gap-8">
        {/* 状态展示区 */}
        <div className="flex flex-col items-center justify-center bg-white rounded-2xl p-8 shadow-sm border border-primary/10 w-full max-w-sm aspect-[4/3] text-center transition-all duration-300">
          {connectionState === 'connecting' && (
            <div className="flex flex-col items-center gap-4 text-muted-foreground animate-in zoom-in duration-300">
              <Loader2 className="w-12 h-12 animate-spin text-primary/60" />
              <p className="text-lg font-medium text-foreground">正在连接到电脑...</p>
              <p className="text-sm opacity-70">请保持网络畅通</p>
            </div>
          )}

          {connectionState === 'error' && (
            <div className="flex flex-col items-center gap-4 text-destructive animate-in zoom-in duration-300">
              <AlertCircle className="w-12 h-12" />
              <p className="text-lg font-medium">连接失败</p>
              <p className="text-sm opacity-80 text-balance break-all">{error}</p>
              <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="mt-2">
                 重试
              </Button>
            </div>
          )}

          {connectionState === 'disconnected' && !error && (
            <div className="flex flex-col items-center gap-4 text-muted-foreground animate-in zoom-in duration-300">
              <AlertCircle className="w-12 h-12 opacity-50" />
              <p className="text-lg font-medium">未连接</p>
              <p className="text-sm opacity-70">请重新扫描电脑上的二维码</p>
            </div>
          )}

          {connectionState === 'connected' && (
             <div className="flex flex-col items-center gap-4 text-emerald-500 animate-in zoom-in spin-in-6 duration-500">
               <CheckCircle2 className="w-16 h-16" />
               <p className="text-xl font-bold text-emerald-600">已连接到电脑</p>
               <p className="text-sm text-muted-foreground">您可以随时拍照或选择相册上传</p>
               {uploadCount > 0 && (
                  <p className="mt-2 text-sm font-medium px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100">
                    本局已成功发送 {uploadCount} 张图片
                  </p>
               )}
             </div>
          )}
        </div>

        {/* 操作区 */}
        <div className="w-full max-w-sm flex flex-col gap-4">
           {/* 隐藏的 input */}
           <input 
             type="file" 
             accept="image/*,application/pdf" 
             multiple 
             className="hidden" 
             ref={fileInputRef}
             onChange={handleFileChange}
           />
           
           <Button 
             size="lg" 
             className="w-full h-16 text-lg font-semibold rounded-2xl shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
             disabled={connectionState !== 'connected' || isProcessing}
             onClick={() => fileInputRef.current?.click()}
           >
              {isProcessing ? (
                <>
                  <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                  处理及发送中...
                </>
              ) : (
                <>
                  <Camera className="w-6 h-6 mr-2" />
                  选取 照片 / PDF
                </>
              )}
           </Button>
           
           <p className="text-center text-xs text-muted-foreground mt-2">
             提示: 大体积图片在首次发送时可能会稍作延迟
           </p>
        </div>
      </main>
    </div>
  );
};
