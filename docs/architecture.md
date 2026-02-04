# 架构文档

## 概览
EasyInvoice 是一个纯客户端、离线优先的 React 应用程序，旨在将报销发票格式化为 A4 页面。

## 核心原则
1.  **隐私优先**：无服务器，无云存储。所有数据驻留在 IndexedDB 中。
2.  **所见即所得 (WYSIWYG)**：屏幕上渲染的 DOM 与通过高 DPI 捕获打印到 PDF 的内容完全一致。
3.  **响应式**：繁重的图像处理在客户端进行；布局计算是即时的。

## 系统架构

### 1. 表现层 (React + Tailwind)
- **GridCanvas**：A4 纸张的视觉表示。根据坐标渲染 `FileItem` 组件。
- **FileItem**：单个发票/收据的卡片组件，包含图片预览和元数据输入（金额、类别、日期）。
- **Voucher**：顶部的付款凭单组件，汇总信息。
- **Sidebar (列表)**：数据的线性表示。
- **PropertiesPanel**：选中项目的上下文感知操作。

### 2. 状态管理 (Zustand)

- **Store**: `useInvoiceStore`
  - 唯一数据源：`items: InvoiceItem[]` (有序列表)。
  - **核心逻辑**：
    - **Multi-Workspace**: 通过 `workspaceId` ('payment' | 'invoice' | null) 管理文件归属。文件互斥地属于某一个工作区。
    - **Global Aggregation**: 凭单 (Voucher) 的总金额和摘要是这一全局性的汇总，统计**所有**已分配文件的数据，无论其位于哪个工作区。
    - `setWorkspace`: 核心 Action，用于在 workspace 之间移动文件。
    - **Lifecycle**: `clearAllItems` 不仅重置列表，还会基于当前时间戳重新生成 `voucherNo` (Reset with Re-init)。
  - Actions：`addItems`, `setWorkspace`, `removeItem`, `updateVoucherData`, `clearAllItems`。
  - 持久化：`idb-keyval` 中间件，包含 v0 -> v1 迁移逻辑。

### 3. 布局引擎 ("大脑")

- **自动填坑算法 (Dense Packing)**：
  - 解耦存储顺序与视觉顺序。
  - 扫描网格（4 列 x N 行）寻找第一个合适的空位。
  - **AppMode 适配**：根据当前模式 ('Payment' Portrait vs 'Invoice' Landscape) 动态调整网格参数。
  - **Stability Logic**: 
    - 布局引擎采用 "Stickiness" 策略防止不必要的自动调整。
    - 在用户显式调整尺寸导致的页面溢出场景中（如 2x4 撑到下一页），系统不再自动 downgrade 尺寸，而是保留用户设定的尺寸，避免 UI 闪烁。
  - **Stability Logic**: 
    - 布局引擎采用 "Stickiness" 策略防止不必要的自动调整。
    - 在用户显式调整尺寸导致的页面溢出场景中（如 2x4 撑到下一页），系统不再自动 downgrade 尺寸，而是保留用户设定的尺寸，避免 UI 闪烁。

### 4. 数据层 & I/O

- **输入**:
  - 拖放 -> FileReader -> Canvas 压缩 -> Base64。
  - **Validation**:
    - **Deduplication**: 上传前进行文件名比对 (UTF-8 NFC Normalization)。
    - **PDF Check**: 识别并跳过已存在的 PDF 页面 (Pattern: `filename-page-N.jpg`)。
- **存储**: IndexedDB (`items`, `settings`)。
- **输出**: `html2canvas` (3x 缩放) -> `jspdf` -> PDF 下载。
  - **Export Strategy**: 使用 "Clone & Replace" 策略。在通过 `html2canvas` 捕获之前，克隆 DOM 节点并将所有原生 `<input>` 替换为样式化的 `<div>` 文本节点，以确保最佳的字体渲染和字间距，同时解决浏览器表单元素在 Canvas 中的渲染缺陷。
  - **Printing Strategy**: 复用 PDF 导出的 Blob URL。创建一个不可见的 `iframe`，加载该 Blob URL，并调用 `iframe.contentWindow.print()`。这确保了“打印”按钮输出的内容与“导出 PDF”完全一致 (WYSIWYG)。

## 目录结构
基于功能的架构：
- `src/features/editor`: 核心网格和拖放逻辑，包含 `ImageEditorModal`。
- `src/features/voucher`: 凭单特定逻辑。
- `src/lib`: 基础设施（DB，工具）。
- `src/components/Layout.tsx`: 全局三栏布局组件。
- `src/components/ui`: 共享通用 UI 组件。
