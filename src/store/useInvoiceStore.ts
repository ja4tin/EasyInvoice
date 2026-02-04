/**
 * Project: EasyInvoice
 * File: useInvoiceStore.ts
 * Description: 全局状态管理 Store，管理发票、凭单数据及应用状态
 * Author: Ja4tin (ja4tin@hotmail.com)
 * Date: 2026-02-04
 * License: MIT
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import { type InvoiceState, type InvoiceItem, type BaseEntity } from '@/types'
import { idbStorage } from './storage'
import Decimal from 'decimal.js'

// 创建实体辅助函数
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
        preparer: '',
        financialSupervisor: '',
        bookkeeper: '',
        cashier: '',
        deptManager: '',
        receiver: '',
        summary: '',
        isSummaryDirty: false,
      },
      isVoucherVisible: true,
      isExporting: false,
      
      toggleVoucherVisibility: (visible) => {
        set((state) => ({
          isVoucherVisible: visible !== undefined ? visible : !state.isVoucherVisible
        }));
      },
      
      addItems: (itemsData) => {
        set((state) => {
          // 默认不分配工作区，由用户拖拽分配
          const newItems = [...state.items, ...itemsData.map(d => createEntity(d))];
          return { items: newItems };
        });
        
        // 自动更新摘要
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
            // 永久删除
             return { items: state.items.filter((item) => item.id !== id) };
          } else {
            // 仅从工作区移除 (重置为 null)
            return {
              items: state.items.map(item => 
                item.id === id ? { ...item, workspaceId: null, updatedAt: Date.now() } : item
              )
            };
          }
        });
        // 自动更新摘要
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
        
        // 自动更新摘要
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
            
            // 如果移出工作区，清除相关数据
            if (workspaceId === null && item.workspaceId !== null) {
               return { 
                ...item, 
                workspaceId,
                // 重置数据字段
                amount: undefined,
                amountStr: '',
                usage: '',
                remark: '',
                category: '',
                invoiceDate: '',
                updatedAt: Date.now()
              };
            }
            
            return { ...item, workspaceId, updatedAt: Date.now() };
          }),
        }));

        // 自动更新摘要
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

      clearAllItems: () => {
        set((state) => ({
          items: [],
          voucherData: {
            ...state.voucherData,
            summary: '',
            voucherNo: generateVoucherNo(),
            isSummaryDirty: false
          }
        }));
      },

      getTotalAmount: () => {
        // 优先检查手动覆盖值
        const { voucherData } = get();
        if (voucherData.totalAmountOverride !== undefined && voucherData.totalAmountOverride !== null) {
          return voucherData.totalAmountOverride;
        }

        // 全局汇总：计算所有已分配项目 (Payment + Invoice)
        return get().items.reduce((sum, item) => {
          if (item.workspaceId === 'payment' || item.workspaceId === 'invoice') {
             const val = new Decimal(item.amount || 0);
             return sum.add(val);
          }
          return sum;
        }, new Decimal(0)).toNumber();
      },

      getAutoSummary: () => {
        // 全局汇总：提取所有已分配项目的用途
        const usages = get().items
          .filter(item => item.workspaceId === 'payment' || item.workspaceId === 'invoice')
          .map(item => item.usage?.trim())
          .filter(Boolean);
        const unique = Array.from(new Set(usages));
        if (unique.length === 0) return '';
        const combined = unique.join('、');
        return combined.length > 72 ? combined.slice(0, 72) : combined;
      },

      getPaymentItems: () => {
        return get().items.filter(item => item.workspaceId === 'payment');
      },

      getInvoiceItems: () => {
        return get().items.filter(item => item.workspaceId === 'invoice');
      },

      getAllAssignedItems: () => {
        return get().items.filter(item => item.workspaceId !== null);
      },

      selectedId: null,
      setIsExporting: (status) => set({ isExporting: status }),
      
      selectItem: (id) => set({ selectedId: id }),
      resizeItem: (id, width, height) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, width, height, updatedAt: Date.now() } : item
          ),
        }));
      },
      updateItemImage: (id, newSrc) => {
         set((state) => ({
           items: state.items.map((item) => 
             item.id === id ? { ...item, fileData: newSrc, rotation: 0, updatedAt: Date.now() } : item
           )
         }));
      },
    }),
    {
      name: 'easyinvoice-storage',
      storage: createJSONStorage(() => idbStorage),
      version: 3,
      migrate: (persistedState: any, version) => {
        let state = persistedState;
        
        if (version === 0) {
          // 迁移 v0 -> v1
          state = {
            ...state,
            items: state.items.map((item: any) => ({
              ...item,
              workspaceId: (item.isOnCanvas === false) ? null : 'payment',
              isOnCanvas: undefined,
            })),
          };
        }

        if (version < 2) {
          // 迁移 v1 -> v2: 添加 voucherData 和 isVoucherVisible
          state = {
            ...state,
            voucherData: state.voucherData || {
              title: '付款凭单',
              companyName: '',
              voucherNo: '', 
              date: new Date().toISOString().split('T')[0],
              payee: '',
              dept: '',
              preparer: '',
              financialSupervisor: '',
              bookkeeper: '',
              cashier: '',
              deptManager: '',
              receiver: '',
              summary: '',
              isSummaryDirty: false,
            },
            isVoucherVisible: state.isVoucherVisible ?? true,
          };
        }
        
        if(version < 3) {
           // 迁移 v2 -> v3: 确保 preparer 字段存在
           state = {
             ...state,
             voucherData: {
               ...state.voucherData,
               preparer: state.voucherData.preparer || '',
             }
           }
        }

        return state as InvoiceState;
      },
    }
  )
)
