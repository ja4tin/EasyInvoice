import { Loader2 } from 'lucide-react';
import { useInvoiceStore } from '@/store/useInvoiceStore';

export const LoadingOverlay = () => {
  const isExporting = useInvoiceStore((state) => state.isExporting);

  if (!isExporting) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/60 backdrop-blur-[2px] animate-in fade-in duration-300">
      <div className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 animate-in zoom-in duration-300">
        <div className="relative">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <div className="absolute inset-0 blur-lg bg-primary/20 rounded-full animate-pulse" />
        </div>
        <div className="text-center space-y-1">
          <p className="font-semibold text-slate-900">正在准备 PDF</p>
          <p className="text-xs text-slate-500">这可能需要几秒钟，请稍候...</p>
        </div>
      </div>
    </div>
  );
};
