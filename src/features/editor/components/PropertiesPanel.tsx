/**
 * Project: EasyInvoice
 * File: PropertiesPanel.tsx
 * Description: 右侧属性面板，提供凭单设置和选中项目的属性编辑
 * Author: Ja4tin (ja4tin@hotmail.com)
 * Date: 2026-02-04
 * License: MIT
 */

import { useInvoiceStore } from '@/store/useInvoiceStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, RotateCw, RotateCcw, Crop, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  
  const { appMode, invoiceLayout, showFileFields } = useSettingsStore(state => state.settings);
  const totalAmount = useInvoiceStore(state => state.getTotalAmount());
  
  // 图片编辑器模态框状态
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // 计算选中项是否在第一页
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
         <div className="p-4">加载中...</div>
      </aside>
    )
  }

  // 文件属性视图
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
            
            {/* 元信息 */}
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground uppercase tracking-wider font-bold">文件名</div>
              <div className="text-sm font-medium truncate w-[230px]" title={selectedItem.name}>{selectedItem.name}</div>
            </div>

            <Separator />

            {/* 尺寸控制 - 仅在 Payment 模式下显示 */}
            {appMode === 'payment' && (
              <>
                <div className="space-y-3">
                  <Label className="text-xs">尺寸 (宽 x 高)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant={isActiveSize(2, 2) ? "default" : "outline"} size="sm" className="text-xs" onClick={() => resizeItem(selectedItem.id, 2, 2)}>2 x 2 (标准)</Button>
                    
                    {/* 如果在首页且凭单可见，隐藏 3行高 选项 */}
                    {!(isFirstPage && isVoucherVisible) && (
                        <>
                            <Button variant={isActiveSize(2, 3) ? "default" : "outline"} size="sm" className="text-xs" onClick={() => resizeItem(selectedItem.id, 2, 3)}>2 x 3 (竖向标准)</Button>
                        </>
                    )}

                    {/* 2x4 选项: 仅在首页且凭单可见时显示 */}
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

            {/* 旋转与裁剪 */}
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

            {/* 数据录入 */}
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
                        className="pl-6 h-8 text-xs"
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

               <div className="grid gap-1.5">
                  <Label className="text-[10px] text-muted-foreground">备注</Label>
                  <Input 
                     value={selectedItem.remark || ''} 
                     onChange={(e) => updateItem(selectedItem.id, { remark: e.target.value })}
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

  // 默认凭单设置视图
  return (
    <aside className="hidden w-[280px] min-w-[280px] shrink-0 flex-col border-l bg-background md:flex overflow-hidden">
      {/* 头部 */}
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <h2 className="font-semibold">凭单设置</h2>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          
          {/* 基本信息 (始终显示) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">基本信息</h3>
              <div className="flex flex-col gap-2 items-end">
                <div className="flex items-center gap-2">
                   <Label htmlFor="show-voucher" className="text-xs text-muted-foreground">显示付款凭单</Label>
                   <Switch 
                     id="show-voucher"
                     checked={!!isVoucherVisible}
                     onCheckedChange={toggleVoucherVisibility}
                   />
                </div>
                <div className="flex items-center gap-2">
                   <Label htmlFor="show-file-fields" className="text-xs text-muted-foreground">文件下金额/用途/备注</Label>
                   <Switch 
                     id="show-file-fields"
                     checked={showFileFields?.[appMode] ?? (appMode === 'payment')}
                     onCheckedChange={(checked) => {
                        const { updateSettings, settings } = useSettingsStore.getState();
                        updateSettings({
                            showFileFields: {
                                ...(settings.showFileFields || { payment: true, invoice: false }),
                                [appMode]: checked
                            }
                        });
                     }}
                   />
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
               {/* 标题 */}
               <div className="grid gap-1.5">
                  <Label className="text-xs">标题</Label>
                  <Input 
                    value={voucherData.title || ''}
                    onChange={(e) => updateVoucherData({ title: e.target.value })}
                    className="h-8 text-sm"
                  />
               </div>

               {/* 日期 */}
               <div className="grid gap-1.5">
                  <Label className="text-xs">日期</Label>
                  <Input 
                    type="date"
                    value={voucherData.date || ''}
                    onChange={(e) => updateVoucherData({ date: e.target.value })}
                    className="h-8 text-sm"
                  />
               </div>
               
               {/* 报销人 & 部门 */}
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

               {/* 摘要 */}
               <div className="grid gap-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                       <Label className="text-xs">用途摘要</Label>
                       <TooltipProvider>
                          <Tooltip delayDuration={300}>
                             <TooltipTrigger asChild>
                                <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                             </TooltipTrigger>
                             <TooltipContent className="max-w-[220px]">
                                <p className="text-xs">手动修改凭单内的用途和金额后，文件下的金额和用途就不会显示在这里了，除非点击重置。</p>
                             </TooltipContent>
                          </Tooltip>
                       </TooltipProvider>
                    </div>
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

               {/* 总金额 */}
               <div className="grid gap-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                       <Label className="text-xs">总金额</Label>
                       <TooltipProvider>
                          <Tooltip delayDuration={300}>
                             <TooltipTrigger asChild>
                                <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                             </TooltipTrigger>
                             <TooltipContent className="max-w-[220px]">
                                <p className="text-xs">手动修改凭单内的用途和金额后，文件下的金额和用途就不会显示在这里了，除非点击重置。</p>
                             </TooltipContent>
                          </Tooltip>
                       </TooltipProvider>
                    </div>
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
                        className="h-8 pl-6 text-xs"
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
