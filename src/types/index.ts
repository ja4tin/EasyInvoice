/**
 * Project: EasyInvoice
 * File: index.ts
 * Description: 全局类型定义文件
 * Author: Ja4tin (ja4tin@hotmail.com)
 * Date: 2026-02-04
 * License: MIT
 */

export interface BaseEntity {
  id: string;
  createdAt: number;
  updatedAt: number;
}

export interface InvoiceItem extends BaseEntity {
  name: string;
  fileData: string; // Base64 或 Blob URL
  width: number;
  height: number;
  x?: number; // Grid X 坐标
  y?: number; // Grid Y 坐标
  rotation?: number;
  workspaceId: 'payment' | 'invoice' | null; // 多工作区支持
  
  // 数据绑定字段
  amount?: number; // 金额 (用于计算)
  amountStr?: string; // 原始输入字符串
  usage?: string; // 用途
  remark?: string; // 备注
  invoiceDate?: string; // 开票日期
  category?: string; // 类别
}

export type AppMode = 'payment' | 'invoice';
export type InvoiceLayout = 'cross' | 'vertical';

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  showGrid: boolean;
  paperSize: 'a4';
  margin: number; // 全局边距 (mm)
  
  // 工作模式设置
  appMode: AppMode;
  invoiceLayout: InvoiceLayout;
}

export interface VoucherData {
  title: string;
  companyName: string;
  voucherNo: string;
  date: string;
  payee: string; // 报销人
  dept: string;  // 部门/项目
  preparer: string; // 制单人
  financialSupervisor: string; // 财务主管
  bookkeeper: string; // 记账
  cashier: string;    // 出纳
  deptManager: string; // 部门主管
  receiver: string;    // 受款人
  summary: string;     // 用途摘要
  isSummaryDirty: boolean; // 是否手动修改过摘要
  totalAmountOverride?: number; // 手动修改的总金额
}

export type InvoiceState = {
  items: InvoiceItem[];
  voucherData: VoucherData;
  isVoucherVisible: boolean;
  toggleVoucherVisibility: (visible?: boolean) => void;
  addItems: (items: Omit<InvoiceItem, keyof BaseEntity>[]) => void;
  addItem: (item: Omit<InvoiceItem, keyof BaseEntity>) => void;
  removeItem: (id: string, hardDelete?: boolean) => void;
  updateItem: (id: string, updates: Partial<InvoiceItem>) => void;
  reorderItems: (oldIndex: number, newIndex: number) => void;
  setItems: (items: InvoiceItem[]) => void;
  updateVoucherData: (updates: Partial<VoucherData>) => void;
  setWorkspace: (id: string, workspaceId: 'payment' | 'invoice' | null) => void;
  
  // 汇总与清理 Actions
  resetSummary: () => void;
  clearAllItems: () => void;
  getTotalAmount: () => number;
  getAutoSummary: () => string;
  
  // 工作区 Selectors
  getPaymentItems: () => InvoiceItem[];
  getInvoiceItems: () => InvoiceItem[];
  getAllAssignedItems: () => InvoiceItem[];

  // 选中与缩放 Actions
  selectedId: string | null;
  selectItem: (id: string | null) => void;
  resizeItem: (id: string, width: number, height: number) => void;
  updateItemImage: (id: string, newSrc: string) => void;

  // UI 状态
  isExporting: boolean;
  setIsExporting: (status: boolean) => void;
}

export type SettingsState = {
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
}
