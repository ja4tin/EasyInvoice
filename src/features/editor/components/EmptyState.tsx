/**
 * Project: EasyInvoice
 * File: EmptyState.tsx
 * Description: 空状态提示组件
 * Author: Ja4tin (ja4tin@hotmail.com)
 * Date: 2026-02-04
 * License: MIT
 */

import { UploadCloud, FileType, Image as ImageIcon, FileText } from 'lucide-react';
import { useSettingsStore } from '@/store/useSettingsStore';

export const EmptyState = () => {
  const appMode = useSettingsStore((state) => state.settings.appMode);
  
  const isPaymentMode = appMode === 'payment';

  return (
    <div className="absolute inset-0 flex items-center justify-center p-8 pointer-events-none">
      <div className="max-w-md w-full text-center space-y-6 animate-in fade-in zoom-in duration-500">
        {/* 图标组合 */}
        <div className="relative flex justify-center">
          <div className="p-6 rounded-full bg-primary/5 ring-1 ring-primary/10 relative">
            <UploadCloud 
              className="h-12 w-12 text-primary/60 animate-bounce" 
              style={{ animationDuration: '3s' }}
            />
          </div>
          
          <div className="absolute -top-1 -right-1 p-2 rounded-full bg-white shadow-sm ring-1 ring-black/5 animate-in slide-in-from-bottom-2 duration-700 delay-300">
            {isPaymentMode ? (
              <FileText className="h-5 w-5 text-blue-500" />
            ) : (
              <FileType className="h-5 w-5 text-indigo-500" />
            )}
          </div>

          <div className="absolute -bottom-1 -left-1 p-2 rounded-full bg-white shadow-sm ring-1 ring-black/5 animate-in slide-in-from-top-2 duration-700 delay-500">
            <ImageIcon className="h-5 w-5 text-emerald-500" />
          </div>
        </div>

        {/* 文本内容 */}
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-slate-900 tracking-tight">
            {isPaymentMode ? '准备好您的报销单了吗？' : '开始整理您的发票'}
          </h3>
          <p className="text-sm text-slate-500 leading-relaxed max-w-[280px] mx-auto">
            拖拽文件到此处，或通过左侧面板上传图片、PDF 文件。我们将为您自动排版。
          </p>
        </div>

        {/* 辅助视觉元素 */}
        <div className="flex items-center justify-center gap-4 text-[10px] font-medium uppercase tracking-widest text-slate-400">
          <div className="h-px w-8 bg-slate-200" />
          <span>支持多页 PDF 与高清图片</span>
          <div className="h-px w-8 bg-slate-200" />
        </div>
      </div>
      
      {/* 虚线边框引导 */}
      <div className="absolute inset-12 rounded-3xl border-2 border-dashed border-slate-200/60 pointer-events-none" />
    </div>
  );
};
