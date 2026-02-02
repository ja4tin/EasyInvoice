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
- **Store**: `useFileStore`
  - 唯一数据源：`items: ReimburseItem[]` (有序列表)。
  - Actions：`addFile`, `removeFile`, `resizeFile`, `updateFileMeta`。
  - 持久化：`idb-keyval` 中间件。

### 3. 布局引擎 ("大脑")
- **自动填坑算法 (Dense Packing)**：
  - 解耦存储顺序与视觉顺序。
  - 扫描网格（4 列 x N 行）寻找第一个合适的空位。
  - 处理“垂直堆叠”约束以确保符合 A4 布局要求。

### 4. 数据层 & I/O
- **输入**: 拖放 -> FileReader -> Canvas 压缩 -> Base64。
- **存储**: IndexedDB (`items`, `settings`)。
- **输出**: `html2canvas` (3x 缩放) -> `jspdf` -> PDF 下载。

## 目录结构
基于功能的架构：
- `src/features/editor`: 核心网格和拖放逻辑。
- `src/features/voucher`: 凭单特定逻辑。
- `src/lib`: 基础设施（DB，工具）。
- `src/components/Layout.tsx`: 全局三栏布局组件。
- `src/components/ui`: 共享通用 UI 组件。
