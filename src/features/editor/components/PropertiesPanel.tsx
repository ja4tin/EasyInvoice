import { useInvoiceStore } from '@/store/useInvoiceStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, RotateCw, RotateCcw, Crop } from 'lucide-react';
import { useGridLayout } from '@/features/editor/hooks/useGridLayout';
import { useState } from 'react';
import { ImageEditorModal } from './ImageEditorModal';

export const PropertiesPanel = () => {
  const { 
    voucherData, 
    updateVoucherData, 
    isVoucherVisible, 
    toggleVoucherVisibility,
    resetSummary,
    selectedId,
    selectItem,
    items,
    resizeItem,
    updateItem
  } = useInvoiceStore();
  
  const { appMode, invoiceLayout } = useSettingsStore(state => state.settings);
  const totalAmount = useInvoiceStore(state => state.getTotalAmount());
  
  // Local state for image editor modal
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // Calculate First Page Status for selected item
  // We need to replicate the layout logic to know which page the item is on
  const canvasItems = items.filter(item => item.workspaceId === appMode);
  const { pages } = useGridLayout({
    items: canvasItems,
    columns: 4,
    rows: 6,
    appMode,
    invoiceLayout,
    isVoucherVisible
  });

  const selectedItem = selectedId ? items.find(i => i.id === selectedId) : null;
  
  // Check if selected item is on the first page (index 0)
  let isFirstPage = false;
  if (selectedItem && pages.length > 0) {
      const page0Items = pages[0];
      if (page0Items && page0Items.some(p => p.item.id === selectedId)) {
          isFirstPage = true;
      }
  }

  if (!voucherData) {
    return (
      <aside className="hidden w-[280px] shrink-0 flex-col border-l bg-background md:flex">
         <div className="p-4">Loading Invoice Data...</div>
      </aside>
    )
  }

  // File Context View
  if (selectedItem) {
    const currentW = selectedItem.width || 2;
    const currentH = selectedItem.height || 3;
    const isActiveSize = (w: number, h: number) => currentW === w && currentH === h;

    return (
      <aside className="hidden w-[280px] min-w-[280px] shrink-0 flex-col border-l bg-background md:flex overflow-hidden">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6 gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 -ml-2" onClick={() => selectItem(null)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="font-semibold">文件设置</h2>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            
            {/* Meta Info */}
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground uppercase tracking-wider font-bold">文件名</div>
              <div className="text-sm font-medium truncate w-[230px]" title={selectedItem.name}>{selectedItem.name}</div>
            </div>

            <Separator />

            {/* Size Controls - Only for Payment Voucher Mode */}
            {appMode === 'payment' && (
              <>
                <div className="space-y-3">
                  <Label className="text-xs">尺寸 (宽 x 高)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant={isActiveSize(2, 2) ? "default" : "outline"} size="sm" className="text-xs" onClick={() => resizeItem(selectedItem.id, 2, 2)}>2 x 2 (标准)</Button>
                    
                    {/* Hide x3 height options on First Page if Voucher is visible */}
                    {!(isFirstPage && isVoucherVisible) && (
                        <>
                            <Button variant={isActiveSize(2, 3) ? "default" : "outline"} size="sm" className="text-xs" onClick={() => resizeItem(selectedItem.id, 2, 3)}>2 x 3 (竖向标准)</Button>
                        </>
                    )}

                    {/* 2x4 Option: ONLY visible on First Page with Voucher */}
                    {(isFirstPage && isVoucherVisible) && (
                        <Button variant={isActiveSize(2, 4) ? "default" : "outline"} size="sm" className="text-xs" onClick={() => resizeItem(selectedItem.id, 2, 4)}>2 x 4 (纵向半页)</Button>
                    )}

                    <Button variant={isActiveSize(4, 2) ? "default" : "outline"} size="sm" className="text-xs" onClick={() => resizeItem(selectedItem.id, 4, 2)}>4 x 2 (宽横幅)</Button>
                    
                    <Button variant={isActiveSize(4, 3) ? "default" : "outline"} size="sm" className="text-xs" onClick={() => resizeItem(selectedItem.id, 4, 3)}>4 x 3 (横向半页)</Button>
                  </div>
                  {(isFirstPage && isVoucherVisible) && (
                      <p className="text-[10px] text-muted-foreground mt-1 text-center">
                          * 首页已显示凭单表头，限制部分高度选项以优化排版
                      </p>
                  )}
                </div>
                <Separator />
              </>
            )}

            {/* Rotation & Crop */}
            <div className="space-y-3">
              <Label className="text-xs">图片编辑</Label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => updateItem(selectedItem.id, { rotation: (selectedItem.rotation || 0) - 90 })}>
                  <RotateCcw className="mr-2 h-3.5 w-3.5" /> -90°
                </Button>
                <Button variant="outline" size="sm" className="flex-1" onClick={() => updateItem(selectedItem.id, { rotation: (selectedItem.rotation || 0) + 90 })}>
                  <RotateCw className="mr-2 h-3.5 w-3.5" /> +90°
                </Button>
              </div>
              <Button variant="secondary" size="sm" className="w-full" onClick={() => setIsEditorOpen(true)}>
                  <Crop className="mr-2 h-3.5 w-3.5" /> 裁剪 / 编辑
              </Button>
            </div>

            <Separator />

            {/* Item Data */}
            <div className="space-y-3">
               <Label className="text-xs">数据录入</Label>
               
               <div className="grid gap-1.5">
                  <Label className="text-[10px] text-muted-foreground">金额</Label>
                  <div className="relative">
                     <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">¥</span>
                     <Input 
                        type="number" 
                        value={selectedItem.amount || ''} 
                        onChange={(e) => updateItem(selectedItem.id, { amount: parseFloat(e.target.value) || 0 })}
                        className="pl-6 h-8 text-xs" // Reduced padding and font size for cleaner look
                     />
                  </div>
               </div>

               <div className="grid gap-1.5">
                  <Label className="text-[10px] text-muted-foreground">用途</Label>
                  <Input 
                     value={selectedItem.usage || ''} 
                     onChange={(e) => updateItem(selectedItem.id, { usage: e.target.value })}
                     className="h-8"
                  />
               </div>


            </div>

          </div>
        </ScrollArea>
        
        {/* Render Modal */}
        {isEditorOpen && (
            <ImageEditorModal 
                isOpen={isEditorOpen} 
                onClose={() => setIsEditorOpen(false)} 
                fileId={selectedItem.id} 
            />
        )}

        <div className="p-4 border-t text-xs text-muted-foreground text-center space-y-0.5">
          <div>© {new Date().getFullYear()} EasyInvoice.</div>
          <div>Made by <a href="https://ja4tin.com/" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-foreground transition-colors">Ja4tin</a>. All rights reserved.</div>
        </div>
      </aside>
    );
  }

  // Default Voucher View
  return (
    <aside className="hidden w-[280px] min-w-[280px] shrink-0 flex-col border-l bg-background md:flex overflow-hidden">
      {/* Header */}
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <h2 className="font-semibold">凭单设置</h2>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          
          {/* Section 1: Voucher Settings (Always visible) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">基本信息</h3>
              <div className="flex items-center gap-2">
                 <Label htmlFor="show-voucher" className="text-xs text-muted-foreground">显示表头</Label>
                 <Switch 
                   id="show-voucher"
                   checked={!!isVoucherVisible}
                   onCheckedChange={toggleVoucherVisibility}
                 />
              </div>
            </div>
            
            <div className="space-y-3">
               {/* Title */}
               <div className="grid gap-1.5">
                  <Label className="text-xs">标题</Label>
                  <Input 
                    value={voucherData.title || ''}
                    onChange={(e) => updateVoucherData({ title: e.target.value })}
                    className="h-8 text-sm"
                  />
               </div>

               {/* Date */}
               <div className="grid gap-1.5">
                  <Label className="text-xs">日期</Label>
                  <Input 
                    type="date"
                    value={voucherData.date || ''}
                    onChange={(e) => updateVoucherData({ date: e.target.value })}
                    className="h-8 text-sm"
                  />
               </div>
               
               {/* Reimbursant & Dept */}
               <div className="grid grid-cols-1 gap-2">
                  <div className="grid gap-1.5">
                      <Label className="text-xs">报销人</Label>
                      <Input 
                        value={voucherData.payee || ''}
                        onChange={(e) => updateVoucherData({ payee: e.target.value })}
                        className="h-8 text-sm"
                        placeholder="姓名"
                      />
                  </div>
                  <div className="grid gap-1.5">
                      <Label className="text-xs">部门/项目</Label>
                      <Input 
                        value={voucherData.dept || ''}
                        onChange={(e) => updateVoucherData({ dept: e.target.value })}
                        className="h-8 text-sm"
                        placeholder="部门/项目"
                      />
                  </div>
               </div>

               {/* Summary */}
               <div className="grid gap-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">用途摘要</Label>
                    {voucherData.isSummaryDirty && (
                      <button
                        onClick={resetSummary}
                        className="text-[10px] font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded border border-blue-200 transition-colors"
                        title="恢复自动汇总"
                      >
                        重置
                      </button>
                    )}
                  </div>
                  <textarea 
                    value={voucherData.summary || ''}
                    onChange={(e) => updateVoucherData({ summary: e.target.value.slice(0, 72) })}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="自动生成的摘要..."
                    maxLength={72}
                  />
               </div>

               {/* Total Amount */}
               <div className="grid gap-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">总金额</Label>
                    {voucherData.totalAmountOverride !== undefined && (
                      <button
                        onClick={() => updateVoucherData({ totalAmountOverride: undefined })}
                        className="text-[10px] font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded border border-blue-200 transition-colors"
                        title="恢复自动计算"
                      >
                       重置
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-foreground">¥</span>
                     <Input
                        type="number"
                        step="0.01"
                        value={
                          voucherData.totalAmountOverride !== undefined
                            ? voucherData.totalAmountOverride
                            : totalAmount
                        }
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          updateVoucherData({ totalAmountOverride: isNaN(val) ? 0 : val });
                        }}
                        className="h-8 pl-6 text-xs" // Reduced padding and font size
                     />
                  </div>
                </div>
            </div>
          </div>
        </div>
      </ScrollArea>

      <div className="p-4 border-t text-xs text-muted-foreground text-center space-y-0.5">
        <div>© {new Date().getFullYear()} EasyInvoice.</div>
        <div>Made by <a href="https://ja4tin.com/" target="_blank" rel="noopener noreferrer" className="hover:underline hover:text-foreground transition-colors">Ja4tin</a>. All rights reserved.</div>
      </div>
    </aside>
  );
};
