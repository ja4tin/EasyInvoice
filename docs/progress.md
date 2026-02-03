# 项目进度

## 状态

- [x] 阶段 0：需求分析与设计
- [x] 阶段 1：基础设施与项目设置
- [x] 阶段 2：静态 UI 布局
- [x] 阶段 3：核心逻辑（网格引擎与状态）
- [ ] 阶段 3.5：多工作区架构重构 (进行中)
- [ ] 阶段 4：高级功能（编辑器、导出）
- [ ] 阶段 5：打磨与发布

## 阶段 1：基础设施与项目设置 (已完成)

- **状态**: 已完成
- **完成日期**: 2026-02-02
- **主要成就**:
  - [x] **Task-100: 项目初始化** (2026-02-02)
    - 完成 Vite + React + TS 脚手架
    - 集成 Tailwind CSS (v3.4.17)
    - 配置项目目录架构与路径别名 `@/*`
    - 集成核心库: Zustand, clsx, lucide-react, idb-keyval

  - [x] **Task-101: UI 组件库集成** (2026-02-02)
    - 配置 `Interstellar Blue` 主题色与 CSS 变量
    - 手动封装 shadcn/ui 核心组件: `Button`, `Input`, `Label`, `Card`, `Dialog`, `ScrollArea`
    - 集成 `tailwindcss-animate` 与 Radix UI Primitives
    - 创建 `src/features/debug/TestComponents.tsx` 进行可视化验收

  - [x] **Task-102: 状态管理与存储层配置** (2026-02-02)
    - 定义 `InvoiceItem` 和 `AppSettings` 核心类型接口
    - 封装 `idbStorage` 适配器 (连接 `idb-keyval`)
    - 实现 `useInvoiceStore` (发票项) 和 `useSettingsStore` (全局设置)
    - 验证：刷新页面后，新增的 Mock Item 和设置修改均能自动恢复 配置了严格的 TypeScript 路径别名 (`@/*`)。
    - 建立了核心目录结构并安装了基础库 (`zustand`, `idb-keyval`)。
    - 验证了构建流程和基本的 Tailwind 渲染。

## 阶段 2：核心组件与布局引擎 (已完成)

- **状态**: 已完成
- **完成日期**: 2026-02-02
- **主要成就**:
  - [x] **Task-200: 全局应用布局** (2026-02-02)
    - 实现了 IDE 风格的三栏布局：Sidebar (280px), Workspace (Flex), Properties (300px)。
    - 使用 Tailwind CSS 完成基础样式和响应式容器。
  - [x] **Task-201: A4 Canvas UI & Auto-Fit** (2026-02-02)
    - 创建了标准的 210mm x 297mm A4 画布组件。
    - 实现了 4x6 辅助网格。
  - [x] **Task-202: 核心组件 UI - 付款凭单** (2026-02-02)
    - 实现了 `Voucher` 组件，包含标题、信息录入、金额汇总（静态）、签字区。
    - 实现了数据与 Zustand Store 的双向绑定，支持 IndexedDB 自动持久化。
    - 验证了数据录入后的页面刷新保留功能。
  - [x] **Task-203: 核心组件 UI - 文件单元 (File Item)** (2026-02-02)
    - 创建了 `FileItem` 组件，支持图片预览（object-contain）。
    - 集成了输入字段：金额 (Number)、类别 (Text)、日期 (Date)。
    - 实现了选中状态（蓝色光环）与悬停操作（删除/旋转）。
    - 验证了在 A4 画布中的渲染与交互。

## 阶段 3：核心功能与逻辑 (已完成)

- **状态**: 已完成
- **完成日期**: 2026-02-02
- **主要成就**:
  - [x] **Task-300: 文件上传与数据模型** (2026-02-02)
    - 实现了 `react-dropzone` 文件拖拽上传区域。
    - 实现了图片前端压缩逻辑 (Max 1500px, Client-side Canvas)。
    - 更新了 Zustand Store 支持批量添加文件 (`addItems`)。
    - 创建了左侧 Sidebar 的文件列表组件 `UploadedFileList`。
  - [x] **Task-304: PDF 格式支持** (2026-02-02)
    - 集成 `pdfjs-dist` 实现 PDF 多页转图片功能。
    - 更新 `UploadZone` 支持上传 PDF，自动提取所有页面为独立图片。
    - 验证了 PDF 与 图片混合上传的场景。
  - [x] **Task-301: 网格计算引擎 (Grid Engine)** (2026-02-02)
    - 实现了 `calculateLayout` 核心算法 (Dense Packing, 4x6 Grid)。
    - 实现了 `useGridLayout` Hook 连接 Store。
    - 重构了 `GridCanvas` 支持多页渲染 (Pagination)。
    - 实现了 Page 1 顶部区域的 Voucher 避让逻辑。
  - [x] **Task-301.1: 凭单渲染优化** (2026-02-03)
    - [x] Fixed PDF export rendering issues (Voucher border overlap).
    - [x] Refined Voucher layout spacing (padding, font size, line height).
    - [x] Implemented "Clean Export" ensuring Grid lines and Page numbers are hidden in PDF.
    - [x] Implemented conditional visibility for "Amount/Usage" fields (hidden in export if empty).
    - [x] Implemented Image Rotation functionality (90° steps).
    - [x] Verified Layout Engine & PDF Preview.
    - [x] Refined Voucher Layout (Center headers, larger reset btn, fixed export borders).
  - [x] **Task-302: 双向拖拽实现 (Drag & Drop)** (2026-02-02)
    - 集成 `dnd-kit` 实现全应用拖拽上下文。
    - 实现了 Sidebar `UploadedFileList` 的列表排序。
    - 实现了 `GridCanvas` 的网格项拖拽（基于列表顺序重排）。
    - 验证了修改 Item 顺序触发自动布局重新计算的流程。
  - [x] **Task-537: 体验优化与逻辑修复** (2026-02-02)
    - 修复工作区移除文件逻辑：移除时保留 Sidebar 条目但清空数据（金额、用途）。
    - 优化自动摘要：修复了用途修改后凭单摘要不更新的问题。
    - UI 细节：缩小凭单号间距，缩短报销人下划线，默认缩放调整为 85%。
    - 侧边栏：区分“移出工作区”与“永久删除”操作。
  - [x] **Task-205: 应用模式切换 (Invoice Mode)** (2026-02-02)
    - 实现了 `AppMode` 状态管理 (Payment / Invoice) 及持久化。
    - 实现了 Invoice Mode 下特殊的布局策略：田字格 (Cross 2x2) 和 上下分栏 (Vertical 1x2)。
    - 实现了 Header 区域的模式切换与布局选择 UI。
    - 验证了 Voucher 组件在 Invoice Mode 下的自动隐藏逻辑。
    - 验证了布局切换时的即时重排效果。

## 阶段 3.5：多工作区架构重构 (进行中)

- **状态**: 进行中
- **开始日期**: 2026-02-02
- **主要成就**:
  - [x] **Task-600: 数据模型与迁移** (2026-02-02)
    - 即将 `InvoiceItem.isOnCanvas` 替换为 `workspaceId: 'payment' | 'invoice' | null`。
    - 实现了 `useInvoiceStore` 中的数据迁移逻辑 (v0 -> v1)。
    - 更新了 `setWorkspace` Action，支持文件在不同工作区之间的流转。
    - **Global Aggregation**: 实现了 Payment Voucher 的全局数据汇总，无论文件在哪个工作区，只要被分配，其金额和用途都会被汇总。
    - 创建了 `getPaymentItems`, `getInvoiceItems`, `getAllAssignedItems` 选择器。

  - [x] **Task-601: 侧边栏多选与分流** (2026-02-02)
    - 实现了侧边栏文件的多选 (Multi-select) 机制。
    - 重构了文件列表项，增加了 Checkbox 和 P/I 归属角标。
  - [x] **Task-602: 画布项移动交互** (2026-02-02)
    - 在 Canvas 的 `FileItem` 工具栏中新增了 "Move" 按钮，根据当前模式智能显示“移至发票”或“移至凭单”。
    - 实现了在画布上直接通过点击按钮，快速将文件切换到另一个工作区的交互逻辑。
    - 验证了操作的即时反馈：点击移动后，文件立即从当前画布消失，切换 Mode 后可见。
  
  - [x] **Task-603: 导出与打印优化** (2026-02-03)
    - 实现了 PDF 导出功能，支持多页生成。
    - 修复了发票布局方向问题：田字格自动横向 (Landscape)，上下分栏保持纵向 (Portrait)。
    - 解决了画布内容裁剪问题，优化了滚动容器。
    - 实现了导出预览窗口 (PDF Preview Modal)，支持预览后下载。
    - 验证了所有布局模式下的导出尺寸正确性。

- **2026-02-03**: 完成了右侧属性面板重构 (Task-702)。
    - **Component Extraction**: 将属性面板逻辑抽取为独立组件 `PropertiesPanel`，改善了 `Layout` 的代码结构。
    - **Voucher Settings**: 实现了完整的凭单设置表单，支持直接在侧边栏编辑标题、日期、报销人、部门及摘要，并显示实时的总金额。
    - **Visibility Toggle**: 添加了 "Show Voucher" 开关，允许用户隐藏凭单头部。
    - **Dynamic Layout**: 更新了网格计算引擎，当凭单隐藏时，第一页自动移除顶部偏移，充分利用空间。
    - **UI Components**: 手动实现了 `Switch` 和 `Separator` 组件以支持新的面板 UI。
    - **Stability Fix**: 修复了属性面板在 Store 数据初始化时的崩溃问题，增加了空值保护和语法修正。
    - **Hotfix (Invoice Mode)**: 修复了切换到发票模式时的白屏崩溃问题 (React Hook Rule Violation)，确保了模式切换的稳定性。
    - **Visibility Logic**: 调整了 "Voucher Settings" 菜单的可见性逻辑，使其在发票模式下也默认显示，便于全剧数据的统一管理。
    - **Editable Total**: 实现了 "Total Amount" 的可编辑功能。用户手动修改金额后，会自动覆盖计算值，并提供 "Reset" 按钮恢复自动计算。
    - **UI Polish**: 统一了属性面板中 "Summary" 和 "Total Amount" 的重置按钮样式，使用蓝色 "重置" 按钮替代了原有的文本链接，与画布上的样式保持一致。
    - **Canvas Interaction**: 实现了凭单画布上 "金额" 栏的直接编辑功能，并添加了与 "用途摘要" 一致的 "重置" 按钮，提升了操作的便捷性和统一性。
    - **Visual Fix**: 增加了凭单金额列的宽度 (from w-32 to w-40)，解决了数字较长时最后一位显示不全的问题。
    - **Input Polish**: 微调了 "报销人" 和 "部门/项目" 输入框的下划线长度 (宽度增加)，并将 "部门/项目" 栏整体向右移动 (Align Right)，满足特定视觉需求。
    - **Panel Layout**: 将属性面板 (Voucher Settings) 中的 "Reimbursant" 和 "Dept/Project" 输入框改为垂直排列 (Vertical Stack)，优化了侧边栏的空间利用和视觉层级。
    - **Localization**: 将 "Workspace" 页眉及属性面板 (Properties Panel) 中的所有英文标签翻译为中文，实现了界面的全中文显示。
    - **PDF Modal**: 将导出预览 (Export Preview) 弹窗中的 "Cancel" 和 "Download PDF" 按钮翻译为 "取消" 和 "下载 PDF"，保持语言一致性。
    - **Clear Function**: Replaced native `confirm` dialog with `shadcn/ui` `AlertDialog` for the "Clear" action. Improved UX and reliability.
    - **Canvas Display**: Changed the hardcoded "RECEIPT" label on canvas items to display the actual filename (e.g., "Invoice_001.pdf"), with truncation for long names.
    - **Canvas Display**: Changed the hardcoded "RECEIPT" label on canvas items to display the actual filename (e.g., "Invoice_001.pdf"), with truncation for long names.
    - **Upload Logic**: Implemented duplicate file detection in `UploadZone`. Attempting to upload a file that already exists now triggers an `AlertDialog` warning and skips the duplicate file. Fixed a bug where the check failed due to stale closure state.
    - **UTF-8 Support**: Updated duplicate file detection validation to use `normalize('NFC')`. This ensures that filenames with special characters (e.g., Chinese) are correctly identified as duplicates even if the string encoding references differ slightly.
    - **Voucher Logic**: Updated `clearAllItems` in `useInvoiceStore` to regenerate the `voucherNo` (timestamp-based) when clearing the workspace. This ensures the voucher ID is refreshed for the next usage.

## 最近更新

- **2026-02-03 (Late)**: 完成了打印与清空功能 (Task-700)。
    - **Print**: 实现了 `usePrint` Hook，利用隐藏 iframe 调用浏览器打印，复用高清 PDF 导出逻辑。
    - **Clear**: 实现了全局清空功能，保留凭单头部信息（报销人、日期），需二次确认。
    - **Clear**: 实现了全局清空功能，保留凭单头部信息（报销人、日期），需二次确认。
    - **Layout Fix**: 微调了凭单编号 (Voucher No) 的 CSS padding，解决了与下划线重叠的视觉问题。
- **2026-02-03 (Robustness)**: 完成了去重与逻辑增强 (Task-703)。
    - **Upload**: 实现了基于 UTF-8 归一化的文件名去重，支持 PDF 页面检测，并添加了友好的 Alert 提示。
    - **State**: 修复了清空操作后凭单号不更新的问题 (`generateVoucherNo`)。
    - **UI**: Canvas 卡片现在显示真实文件名。
- **2026-02-03 (Early)**: 完成了导出与打印优化 (Task-603)，修复了布局方向与裁剪问题，新增了 PDF 预览。
    - **紧急修复**: 解决了 PDF 导出时的渲染问题 (Task-Fix-Rendering)，通过 "Clone & Replace" 策略修复了凭单和文件项 (Amount/Usage) 输入框内容的显示异常，确保导出结果清晰准确。
    - **UI 优化**: 重构了 `FileItem` 组件 (Task-UI-Refine)，实现了标签与输入框同行显示，移除了备注栏，并将 Header 改为悬停显示，最大化图片展示空间。
    - **Voucher 布局精修**: 
        - 隐藏了导出时的“重置”按钮。
        - 优化了表格垂直间距和头部对齐。
        - 确保了签字线下划线在导出时可见。
- **2026-02-03 (Fixes)**:
    - **Page Navigator**: Implemented ID-based scroll tracking (`intersectionObserver`) to fix page indicator update issues.
    - **Build**: Fixed all TypeScript build errors and Layout syntax issues.
    - **Refinement**: Moved Page Navigator to Header for better accessibility.
- **2026-02-02**: 完成了 Task-600，实现了多工作区的数据模型基础与全局汇总逻辑。正在进行侧边栏 UI 重构。
- **2026-02-02**: 完成了 Invoice Mode 的核心开发与验证，支持了纯报销单模式下的多种布局策略。
- **2026-01-30**：确认了网格布局的自动填坑 (Dense Packing) 策略。初始化了文档。
