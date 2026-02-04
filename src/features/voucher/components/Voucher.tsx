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
  
  // Auto-fix legacy voucher number or generate if missing
  useEffect(() => {
    if (!voucherData.voucherNo) {
      const now = new Date();
      const year = String(now.getFullYear()).slice(-2);
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hour = String(now.getHours()).padStart(2, '0');
      const minute = String(now.getMinutes()).padStart(2, '0');
      const second = String(now.getSeconds()).padStart(2, '0');
      updateVoucherData({ voucherNo: `${year}${month}${day}${hour}${minute}${second}` });
    } else if (voucherData.voucherNo.length === 14 && voucherData.voucherNo.startsWith('20')) {
      updateVoucherData({ voucherNo: voucherData.voucherNo.slice(2) });
    }
  }, [voucherData.voucherNo, updateVoucherData]);

  return (


    <div className="w-full px-8 pt-1 pb-1 flex flex-col gap-0.5 h-full border-2 border-slate-900">
      {/* Header Row: Title & Company */}
      <div className="flex flex-col items-center justify-center relative mb-0.5">
        <input
          className="text-2xl font-bold text-center bg-transparent border-b border-transparent hover:border-slate-300 focus:border-primary focus:outline-none transition-colors placeholder:text-slate-300/50"
          value={voucherData.title}
          onChange={(e) => updateVoucherData({ title: e.target.value })}
          placeholder="付款凭单"
        />
        <input
           className="mt-0 text-base text-center bg-transparent border-b border-transparent hover:border-slate-300 focus:border-primary focus:outline-none w-2/3 transition-colors placeholder:text-slate-400"
           value={voucherData.companyName}
           onChange={(e) => updateVoucherData({ companyName: e.target.value })}
           placeholder="点击输入公司名称"
        />
      </div>

      {/* Meta Row: Date & No */}
      <div className="flex justify-between items-end border-b-2 border-slate-800 pb-0.5 mb-0.5">
         <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-gray-900">日期:</span>
            <input 
              type="date"
              className="bg-transparent border-none text-sm focus:ring-0 cursor-pointer p-0"
              value={voucherData.date}
              onChange={(e) => updateVoucherData({ date: e.target.value })}
            />
         </div>
          {/* No. */}
          <div className="flex items-center gap-2 justify-end">
            <span className="font-semibold text-sm text-gray-900 whitespace-nowrap">编号:</span>
            <div className="border-b border-slate-900 px-2 min-w-[120px] pb-0.5">
               <input 
                  className="w-full text-center font-mono text-gray-900 bg-transparent border-none focus:ring-0 p-0 cursor-default leading-none translate-y-[-2px]"
                  value={voucherData.voucherNo}
                  readOnly
                  tabIndex={-1}
               />
            </div>
          </div>
      </div>

        {/* Row 2: Info Fields */}
        <div className="flex items-center justify-between text-sm mt-0.5">
           <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">报销人:</span>
              <input 
                value={voucherData.payee}
                onChange={(e) => updateVoucherData({ payee: e.target.value })}
                className="border-0 border-b border-gray-800 rounded-none px-1 h-6 w-[150px] focus-visible:ring-0 text-gray-900 bg-transparent"
              />
           </div>
           
           <div className="flex items-center gap-2 justify-center flex-1">
              <span className="font-medium text-gray-900">部门/项目:</span>
              <input 
                value={voucherData.dept}
                onChange={(e) => updateVoucherData({ dept: e.target.value })}
                className="border-0 border-b border-gray-800 rounded-none px-1 h-6 w-[150px] focus-visible:ring-0 text-gray-900 bg-transparent"
              />
           </div>

           <div className="flex items-center gap-2 justify-end">
              <span className="font-medium text-gray-900">制单人:</span>
              <input 
                value={voucherData.preparer}
                onChange={(e) => updateVoucherData({ preparer: e.target.value })}
                className="border-0 border-b border-gray-800 rounded-none px-1 h-6 w-[100px] focus-visible:ring-0 text-gray-900 bg-transparent"
              />
           </div>


      </div>

      {/* Summary Row */}
      <div className="border border-slate-800 mt-0.5 flex-1 flex flex-col min-h-0">
          {/* Header */}
          <div className="flex border-b border-slate-800 bg-slate-50 text-xs font-bold text-slate-600 shrink-0">
             <div className="h-8 flex-1 border-r border-slate-800 text-center flex items-center justify-center gap-2 relative">
               <span className="translate-y-[1px]">用途摘要</span>
               {voucherData.isSummaryDirty && (
                 <button 
                   onClick={resetSummary}
                   className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded border border-blue-200 transition-colors pdf-export-hidden"
                   title="恢复自动汇总"
                 >
                   重置
                 </button>
               )}
             </div>
             <div className="h-8 w-40 text-center flex items-center justify-center relative">
                <span className="translate-y-[1px]">金额</span>
                {voucherData.totalAmountOverride !== undefined && (
                  <button 
                    onClick={() => updateVoucherData({ totalAmountOverride: undefined })}
                    tabIndex={-1}
                    className="absolute right-1 top-1/2 -translate-y-1/2 text-[10px] font-medium text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded border border-blue-200 transition-colors pdf-export-hidden"
                    title="恢复自动计算"
                  >
                    重置
                  </button>
                )}
             </div>
          </div>
          {/* Content */}
          <div className="flex flex-1 min-h-[40px]">
             <div className="flex-1 border-r border-slate-800 relative group">
                <textarea 
                  className="absolute inset-0 w-full h-full resize-none p-2 text-sm bg-transparent border-none focus:ring-0 focus:bg-yellow-50/20 leading-tight"
                  value={voucherData.summary}
                  onChange={(e) => updateVoucherData({ summary: e.target.value.slice(0, 140) })}
                  placeholder="自动生成..."
                  maxLength={140}
                />
             </div>
             <div className="w-40 flex items-center justify-end font-mono font-bold text-base px-2 bg-slate-50/30 relative">
                <span className="mr-1">¥</span>
                <input
                  type="number"
                  step="0.01"
                  className="w-full bg-transparent text-right border-none focus:ring-0 p-0 font-mono font-bold text-base"
                  value={
                    voucherData.totalAmountOverride !== undefined
                      ? voucherData.totalAmountOverride
                      : getTotalAmount().toFixed(2)
                  }
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val)) {
                       updateVoucherData({ totalAmountOverride: val });
                    } else if (e.target.value === '') {
                       // Optional: allow empty to type? 
                       // If empty, maybe set to 0 or undefined? 
                       // Usually better to just let it be empty string in local state, 
                       // but binding directly to store number field is tricky.
                       // For now, let's stick to update if valid number, or 0.
                       updateVoucherData({ totalAmountOverride: 0 });
                    }
                  }}
                />
             </div>
          </div>
          {/* Uppercase Total */}
          <div className="flex border-t border-slate-900 border-b border-slate-900 shrink-0 bg-white">
              <div className="h-12 w-24 border-r border-slate-900 text-xs font-bold text-slate-600 flex items-center justify-center">
                 <span className="translate-y-[1px]">大写金额</span>
              </div>
              <div className="h-12 flex-1 text-sm font-medium tracking-wide flex items-center px-3 text-slate-800">
                 <span className="translate-y-[1px]">{digitUppercase(getTotalAmount())}</span>
              </div>
          </div>
      </div>

      {/* Footer Signatures */}
      <div className="grid grid-cols-5 gap-4 mt-0.5 mb-1 text-xs text-slate-500 shrink-0">
        {[
          { label: '财务主管', key: 'financialSupervisor' },
          { label: '记账', key: 'bookkeeper' },
          { label: '出纳', key: 'cashier' },
          { label: '部门主管', key: 'deptManager' },
          { label: '受款人', key: 'receiver' }
        ].map(({ label, key }) => (
            <div key={label} className="flex flex-col gap-1">
                <span className="font-semibold">{label}:</span>
                <div className="border-b border-slate-300 w-full">
                  <input 
                      tabIndex={0}
                      className="w-full focus:outline-none bg-transparent py-0.5 text-slate-900 placeholder:text-transparent"
                      value={voucherData[key as keyof typeof voucherData] as string}
                      onChange={(e) => updateVoucherData({ [key]: e.target.value })}
                      placeholder="Input" // Placeholder to keep height if empty? or just standard height
                  />
                </div>
            </div>
        ))}
      </div>

    </div>
  );
}
