import { useEffect } from "react";
import { useInvoiceStore } from "@/store/useInvoiceStore";
import { digitUppercase } from "@/lib/currency";

export function Voucher() {
  const { 
    voucherData, 
    updateVoucherData, 
    getTotalAmount, 
    resetSummary 
  } = useInvoiceStore();
  
  // Auto-fix legacy voucher number (4-digit year -> 2-digit year)
  useEffect(() => {
    if (voucherData.voucherNo.length === 14 && voucherData.voucherNo.startsWith('20')) {
      updateVoucherData({ voucherNo: voucherData.voucherNo.slice(2) });
    }
  }, [voucherData.voucherNo, updateVoucherData]);

  return (
    <div className="w-full px-8 pt-6 pb-2 flex flex-col gap-2 h-full">
      {/* Header Row: Title & Company */}
      <div className="flex flex-col items-center justify-center relative mb-2">
        <input
          className="text-2xl font-bold text-center bg-transparent border-b border-transparent hover:border-slate-300 focus:border-primary focus:outline-none transition-colors placeholder:text-slate-300/50"
          value={voucherData.title}
          onChange={(e) => updateVoucherData({ title: e.target.value })}
          placeholder="付款凭单"
        />
        <input
           className="mt-1 text-base text-center bg-transparent border-b border-transparent hover:border-slate-300 focus:border-primary focus:outline-none w-2/3 transition-colors placeholder:text-slate-400"
           value={voucherData.companyName}
           onChange={(e) => updateVoucherData({ companyName: e.target.value })}
           placeholder="点击输入公司名称"
        />
      </div>

      {/* Meta Row: Date & No */}
      <div className="flex justify-between items-end border-b-2 border-slate-800 pb-1 mb-1">
         <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">日期:</span>
            <input 
              type="date"
              className="bg-transparent border-none text-sm focus:ring-0 cursor-pointer"
              value={voucherData.date}
              onChange={(e) => updateVoucherData({ date: e.target.value })}
            />
         </div>
         <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">编号:</span>
            <input 
              className="bg-transparent border-b border-transparent w-32 text-right text-sm focus:outline-none text-slate-600"
              value={voucherData.voucherNo}
              readOnly
              title="自动生成，不可修改"
            />
         </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
        <div className="flex items-center gap-2">
           <span className="w-16 font-semibold text-slate-600">报销人:</span>
           <input 
              className="flex-1 bg-transparent border-b border-slate-200 focus:border-primary focus:outline-none px-1"
              value={voucherData.payee}
              onChange={(e) => updateVoucherData({ payee: e.target.value })}
           />
        </div>
        <div className="flex items-center gap-2">
           <span className="w-16 font-semibold text-slate-600">部门/项目:</span>
           <input 
              className="flex-1 bg-transparent border-b border-slate-200 focus:border-primary focus:outline-none px-1"
              value={voucherData.dept}
              onChange={(e) => updateVoucherData({ dept: e.target.value })}
           />
        </div>
      </div>

      {/* Summary Row */}
      <div className="border border-slate-800 mt-1 flex-1 flex flex-col">
          {/* Header */}
          <div className="flex border-b border-slate-800 bg-slate-50 text-xs font-bold text-slate-600 shrink-0">
             <div className="p-1.5 flex-1 border-r border-slate-800 text-center flex items-center justify-center gap-2 relative">
               用途摘要
               {voucherData.isSummaryDirty && (
                 <button 
                   onClick={resetSummary}
                   className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-normal text-blue-500 hover:text-blue-700 hover:underline bg-white/80 px-1 rounded"
                   title="恢复自动汇总"
                 >
                   重置
                 </button>
               )}
             </div>
             <div className="p-1.5 w-32 text-center">金额</div>
          </div>
          {/* Content */}
          <div className="flex flex-1 min-h-[40px]">
             <div className="flex-1 border-r border-slate-800 relative">
                <textarea 
                  className="absolute inset-0 w-full h-full resize-none p-1.5 text-sm bg-transparent border-none focus:ring-0 focus:bg-yellow-50/20 leading-tight"
                  value={voucherData.summary}
                  onChange={(e) => updateVoucherData({ summary: e.target.value })}
                  placeholder="自动生成..."
                />
             </div>
             <div className="w-32 flex items-center justify-end font-mono font-bold text-lg p-1.5 bg-slate-50/30">
                {/* Dynamically calculate total */}
                ¥ {getTotalAmount().toFixed(2)}
             </div>
          </div>
          {/* Uppercase Total */}
          <div className="flex border-t border-slate-800 shrink-0">
              <div className="p-1.5 w-24 border-r border-slate-800 text-xs font-bold text-slate-600 flex items-center justify-center">
                 大写金额
              </div>
              <div className="p-1.5 flex-1 text-sm font-medium tracking-wide flex items-center text-slate-800">
                 {digitUppercase(getTotalAmount())}
              </div>
          </div>
      </div>

      {/* Footer Signatures */}
      <div className="grid grid-cols-5 gap-4 mt-2 mb-2 text-xs text-slate-500">
        {[
          { label: '财务主管', key: 'financialSupervisor' },
          { label: '记账', key: 'bookkeeper' },
          { label: '出纳', key: 'cashier' },
          { label: '部门主管', key: 'deptManager' },
          { label: '受款人', key: 'receiver' }
        ].map(({ label, key }) => (
            <div key={label} className="flex flex-col gap-1">
                <span className="font-semibold">{label}:</span>
                <input 
                    className="border-b border-slate-300 w-full focus:border-primary focus:outline-none bg-transparent"
                    value={voucherData[key as keyof typeof voucherData] as string}
                    onChange={(e) => updateVoucherData({ [key]: e.target.value })}
                />
            </div>
        ))}
      </div>

    </div>
  );
}
