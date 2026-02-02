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
          const newItems = [...state.items, ...itemsData.map(createEntity)];
          // Recalculate layout is handled by useGridLayout hook, store just keeps list
          return { items: newItems };
        });
        
        // Auto-update summary if needed
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
      removeItem: (id) => {
        set((state) => {
          const nextItems = state.items.filter((item) => item.id !== id);
          return { items: nextItems };
        });
        // Auto-update summary if needed
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
        
        // Auto-update summary if needed
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
      
      resetSummary: () => {
        const auto = get().getAutoSummary();
        set((state) => ({
          voucherData: { ...state.voucherData, summary: auto, isSummaryDirty: false }
        }));
      },

      getTotalAmount: () => {
        return get().items.reduce((sum, item) => {
          const val = new Decimal(item.amount || 0);
          return sum.add(val);
        }, new Decimal(0)).toNumber();
      },

      getAutoSummary: () => {
        const usages = get().items
          .map(item => item.usage?.trim())
          .filter(Boolean);
        const unique = Array.from(new Set(usages));
        if (unique.length === 0) return '';
        return unique.join('、');
      }
    }),
    {
      name: 'easyinvoice-storage',
      storage: createJSONStorage(() => idbStorage),
    }
  )
)
