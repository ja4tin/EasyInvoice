# 项目进度

## 状态
- [x] 阶段 0：需求分析与设计
- [x] 阶段 1：基础设施与项目设置
- [ ] 阶段 2：静态 UI 布局
- [ ] 阶段 3：核心逻辑（网格引擎与状态）
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

## 阶段 2：核心组件与布局引擎 (进行中)
- **状态**: 进行中
- **开始日期**: 2026-02-02
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
  - [x] **Task-302: 双向拖拽实现 (Drag & Drop)** (2026-02-02)
    - 集成 `dnd-kit` 实现全应用拖拽上下文。
    - 实现了 Sidebar `UploadedFileList` 的列表排序。
    - 实现了 `GridCanvas` 的网格项拖拽（基于列表顺序重排）。
    - 验证了修改 Item 顺序触发自动布局重新计算的流程。

## 最近更新
- **2026-01-30**：确认了网格布局的自动填坑 (Dense Packing) 策略。初始化了文档。
