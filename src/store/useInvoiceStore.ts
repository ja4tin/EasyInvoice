import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import { type InvoiceState, type InvoiceItem, type BaseEntity } from '@/types'
import { idbStorage } from './storage'
import Decimal from 'decimal.js'

// Helper to create entity
const createEntity = (data: Omit<InvoiceItem, keyof BaseEntity>): InvoiceItem => ({
  id: uuidv4(),
  createdAt: Date.now(),
  updatedAt: Date.now(),
  ...data,
})

const generateVoucherNo = () => {
  const now = new Date();
  const year = String(now.getFullYear()).slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  const second = String(now.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}${hour}${minute}${second}`;
};

export const useInvoiceStore = create<InvoiceState>()(
  persist(
    (set, get) => ({
      items: [],
      voucherData: {
        title: '付款凭单',
        companyName: '',
        voucherNo: generateVoucherNo(),
        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
        payee: '',
        dept: '',
        financialSupervisor: '',
        bookkeeper: '',
        cashier: '',
        deptManager: '',
        receiver: '',
        summary: '',
        isSummaryDirty: false,
      },
      addItems: (itemsData) => {
        set((state) => {
          // If we want to auto-assign to current view, we need to know the view.
          // But store doesn't know view state (kept in Settings).
          // For now, default to Unassigned (null) as per plan, or maybe 'payment' for backward compat?
          // Plan said: "default to null workspaceId".
          const newItems = [...state.items, ...itemsData.map(d => createEntity(d))];
          return { items: newItems };
        });
        
        // Auto-update summary
        const state = get();
        if (!state.voucherData.isSummaryDirty) {
          set((state) => ({
            voucherData: { ...state.voucherData, summary: get().getAutoSummary() }
          }));
        }
      },
      addItem: (itemData) => 
        set((state) => ({
          items: [...state.items, createEntity(itemData)],
        })),
      removeItem: (id, hardDelete = false) => {
        set((state) => {
          if (hardDelete) {
            // Permanently delete
             return { items: state.items.filter((item) => item.id !== id) };
          } else {
            // Just remove from workspace (set to null)
            return {
              items: state.items.map(item => 
                item.id === id ? { ...item, workspaceId: null, updatedAt: Date.now() } : item
              )
            };
          }
        });
        // Auto-update summary
        const state = get();
        if (!state.voucherData.isSummaryDirty) {
           set((state) => ({
             voucherData: { ...state.voucherData, summary: get().getAutoSummary() }
           }));
        }
      },
      updateItem: (id, updates) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, ...updates, updatedAt: Date.now() } : item
          ),
        }));
        
        // Auto-update summary
        const state = get();
        if (!state.voucherData.isSummaryDirty) {
           set((state) => ({
             voucherData: { ...state.voucherData, summary: get().getAutoSummary() }
           }));
        }
      },
      reorderItems: (oldIndex, newIndex) =>
        set((state) => {
          const newItems = [...state.items];
          const [removed] = newItems.splice(oldIndex, 1);
          newItems.splice(newIndex, 0, removed);
          return { items: newItems };
        }),
      setItems: (items) => set({ items }),
      updateVoucherData: (updates) => {
        set((state) => {
          const isSummaryUpdate = 'summary' in updates;
          const isDirtyUpdate = isSummaryUpdate ? { isSummaryDirty: true } : {};
          
          if ('isSummaryDirty' in updates) {
             return { voucherData: { ...state.voucherData, ...updates } };
          }

          return {
            voucherData: { ...state.voucherData, ...updates, ...isDirtyUpdate },
          };
        });
      },
      setWorkspace: (id, workspaceId) => {
        set((state) => ({
          items: state.items.map((item) => {
            if (item.id !== id) return item;
            
            // If moving to 'unassigned', clear data?
            // "Task-537: 修复工作区移除文件逻辑：移除时保留 Sidebar 条目但清空数据"
            if (workspaceId === null && item.workspaceId !== null) {
               return { 
                ...item, 
                workspaceId,
                // Reset data fields
                amount: undefined,
                amountStr: '',
                usage: '',
                remark: '',
                category: '',
                invoiceDate: '',
                updatedAt: Date.now()
              };
            }
            
            // If switching from payment to invoice or vice versa, keep data?
            // "Task-600.3: 支持从一个工作区移动到另一个"
            // Usually we keep data when moving between valid workspaces.
            return { ...item, workspaceId, updatedAt: Date.now() };
          }),
        }));

        // Auto-update summary
        const state = get();
        if (!state.voucherData.isSummaryDirty) {
           set((state) => ({
             voucherData: { ...state.voucherData, summary: get().getAutoSummary() }
           }));
        }
      },
      
      resetSummary: () => {
        const auto = get().getAutoSummary();
        set((state) => ({
          voucherData: { ...state.voucherData, summary: auto, isSummaryDirty: false }
        }));
      },

      getTotalAmount: () => {
        // GLOBAL AGGREGATION: Sum ALL assigned items (Payment + Invoice)
        // workspaceId can be 'payment' or 'invoice'
        return get().items.reduce((sum, item) => {
          if (item.workspaceId === 'payment' || item.workspaceId === 'invoice') {
             const val = new Decimal(item.amount || 0);
             return sum.add(val);
          }
          return sum;
        }, new Decimal(0)).toNumber();
      },

      getAutoSummary: () => {
        // GLOBAL AGGREGATION: Summarize usage from ALL assigned items
        const usages = get().items
          .filter(item => item.workspaceId === 'payment' || item.workspaceId === 'invoice')
          .map(item => item.usage?.trim())
          .filter(Boolean);
        const unique = Array.from(new Set(usages));
        if (unique.length === 0) return '';
        return unique.join('、');
      },

      getPaymentItems: () => {
        return get().items.filter(item => item.workspaceId === 'payment');
      },

      getInvoiceItems: () => {
        return get().items.filter(item => item.workspaceId === 'invoice');
      },

      getAllAssignedItems: () => {
        return get().items.filter(item => item.workspaceId !== null);
      }
    }),
    {
      name: 'easyinvoice-storage',
      storage: createJSONStorage(() => idbStorage),
      version: 1, // Increment version
      migrate: (persistedState: any, version) => {
        if (version === 0) {
          // Migration from v0 (isOnCanvas) to v1 (workspaceId)
          // Default old items to 'payment' workspace if isOnCanvas was true or undefined
          // If isOnCanvas was explicitly false, set to null
          return {
            ...persistedState,
            items: persistedState.items.map((item: any) => ({
              ...item,
              workspaceId: (item.isOnCanvas === false) ? null : 'payment',
              isOnCanvas: undefined, // Cleanup
            })),
          };
        }
        return persistedState as InvoiceState;
      },
    }
  )
)
