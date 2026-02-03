import React from 'react';
import { useInvoiceStore } from '@/store/useInvoiceStore';
import { useSettingsStore } from '@/store/useSettingsStore';
// import { cn } from '@/lib/utils';
// import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

export const PropertiesPanel = () => {
  const { 
    voucherData, 
    updateVoucherData, 
    isVoucherVisible, 
    toggleVoucherVisibility,
    resetSummary
  } = useInvoiceStore();
  
  const totalAmount = useInvoiceStore(state => state.getTotalAmount());
  
  const { settings } = useSettingsStore();

  if (!voucherData) {
    return (
      <aside className="hidden w-[300px] flex-col border-l bg-background md:flex">
         <div className="p-4">Loading Invoice Data...</div>
      </aside>
    )
  }

  return (
    <aside className="hidden w-[300px] flex-col border-l bg-background md:flex">
      {/* Header */}
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <h2 className="font-semibold">属性面板</h2>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          
          {/* Section 1: Voucher Settings (Always visible) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">凭单设置</h3>
              <div className="flex items-center gap-2">
                 <Label htmlFor="show-voucher" className="text-xs text-muted-foreground">显示</Label>
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
                    onChange={(e) => updateVoucherData({ summary: e.target.value })}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="自动生成的摘要..."
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
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-foreground">¥</span>
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
                        className="h-8 pl-7 text-sm"
                     />
                  </div>
                </div>
            </div>
          </div>

          <Separator />
          
          {/* Section 2: Item Properties (Placeholder for now) */}
          <div className="space-y-4">
             <h3 className="text-sm font-medium">选中项</h3>
             <p className="text-xs text-muted-foreground">在画布上选择一项以编辑其属性。</p>
          </div>

        </div>
      </ScrollArea>
    </aside>
  );
};
