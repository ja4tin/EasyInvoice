export interface BaseEntity {
  id: string;
  createdAt: number;
  updatedAt: number;
}

export interface InvoiceItem extends BaseEntity {
  name: string;
  fileData: string; // Base64 or Blob URL usually, keeping generic string for now
  width: number;
  height: number;
  x?: number; // Grid position X
  y?: number; // Grid position Y
  rotation?: number;
  workspaceId: 'payment' | 'invoice' | null; // Multi-workspace support
  // isOnCanvas?: boolean; // DEPRECATED: Replaced by workspaceId
  
  // Data binding properties
  amount?: number; // 废弃，使用 string 以避免精度问题? No, use number but handle with decimal.js in store
  amountStr?: string; // Optional: raw input string
  usage?: string; // 用途
  remark?: string; // 备注
  invoiceDate?: string;
  category?: string;
}

export type AppMode = 'payment' | 'invoice';
export type InvoiceLayout = 'cross' | 'vertical';

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  showGrid: boolean;
  paperSize: 'a4';
  margin: number; // Global margin in mm
  
  // New settings for Task-305
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
  
  // New actions & selectors
  resetSummary: () => void;
  clearAllItems: () => void;
  getTotalAmount: () => number;
  getAutoSummary: () => string;
  
  // Workspace selectors
  getPaymentItems: () => InvoiceItem[];
  getInvoiceItems: () => InvoiceItem[];
  getAllAssignedItems: () => InvoiceItem[];

  // Task-400: Selection & Resizing
  selectedId: string | null;
  selectItem: (id: string | null) => void;
  resizeItem: (id: string, width: number, height: number) => void;
  updateItemImage: (id: string, newSrc: string) => void;

  // Task-500: UI Polishing
  isExporting: boolean;
  setIsExporting: (status: boolean) => void;
}

export type SettingsState = {
  settings: AppSettings;
  updateSettings: (updates: Partial<AppSettings>) => void;
}
