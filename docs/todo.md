# 实施计划：智能报销排版工具 (EasyInvoice)

**文档版本**: V1.0.0
**策略**: UI 优先，逐步集成逻辑
**技术栈**: React + Vite + Tailwind CSS + Zustand + IndexedDB

---

## 第一阶段：项目初始化与基础设施 (Phase 1: Infrastructure)

本阶段目标是建立稳固的代码库基础，配置所有必要的工具链，并确保开发环境就绪。

- [x] **Task-100: 项目脚手架搭建**
    - **依赖**: 无
    - **上下文**: 使用 Vite 初始化 React + TypeScript 项目，配置 Tailwind CSS 和路径别名，确保项目结构符合 Feature-based 架构。
    - **子任务**:
        - [x] 100.1: 使用 `npm create vite@latest` 初始化项目（React + TypeScript）。
        - [x] 100.2: 安装并初始化 Tailwind CSS 和 PostCSS。
        - [x] 100.3: 配置 `tsconfig.json` 中的路径别名（例如 `@/components`, `@/features`）。
        - [x] 100.4: 创建 `src/features`, `src/components`, `src/store`, `src/lib` 等目录结构。
        - [x] 100.5: 安装基础依赖：`zustand`, `clsx`, `tailwind-merge`。
        - [x] 100.6: **验证**: 运行 `npm run dev`，确认应用能启动，且 Tailwind 样式（如 `bg-red-500`）生效。

- [x] Task-101: UI 组件库集成 <!-- id: 101 -->
    - [x] 101.1: 初始化 shadcn/ui CLI (使用手动集成模式) <!-- id: 101.1 -->
    - [x] 101.2: 添加基础组件：`Button` (按钮)。 <!-- id: 101.2 -->
    - [x] 101.3: 添加基础组件：`Input` (输入框)。 <!-- id: 101.3 -->
    - [x] 101.4: 添加基础组件：`Dialog` / `Modal` (模态框)。 <!-- id: 101.4 -->
    - [x] 101.5: 添加基础组件：`Card` (卡片，用于文件展示)。 <!-- id: 101.5 -->
    - [x] 101.6: 添加基础组件：`ScrollArea` (滚动区域)。 <!-- id: 101.6 -->
    - [x] 101.7: **验证**: 创建一个临时的 `TestComponents.tsx` 页面，展示所有上述组件，确保样式和交互正常。 <!-- id: 101.7 -->

- [x] Task-102: 状态管理与存储层配置 <!-- id: 102 -->
    - [x] 102.1: 安装 `idb-keyval`。 <!-- id: 102.1 -->
    - [x] 102.2: 创建 `src/lib/db.ts`，封装简单的 `get`, `set`, `del` 方法。 <!-- id: 102.2 -->
    - [x] 102.3: 创建空的 Zustand store `useAppStore`，并在其中集成 `persist` 中间件（连接 idb-keyval）。 <!-- id: 102.3 -->
    - [x] 102.4: **验证**: 在控制台调用 store 的写入方法，刷新页面后确认数据能从 IndexedDB 恢复。 <!-- id: 102.4 -->

---

## 第二阶段：静态 UI 布局 (Phase 2: Static UI Layout)

本阶段目标是完成所有页面的视觉结构，暂不包含复杂的业务逻辑（如拖拽、计算）。重点是布局的响应式和 A4 纸张的精确渲染。

- [x] **Task-200: 全局应用布局 (App Layout)**
    - **依赖**: Task-101
    - **上下文**: 实现 IDE 风格的三栏布局：左侧资源栏、中间工作区、右侧属性栏。
    - **子任务**:
        - [x] 200.1: 创建 `Layout` 组件，使用 Flexbox 实现左(250px)-中(自适应)-右(300px)结构。
        - [x] 200.2: 实现左侧 Sidebar 容器样式（背景色、边框）。
        - [x] 200.3: 实现中间 Workspace 容器样式（深灰色背景、居中对齐）。
        - [x] 200.4: 实现右侧 Properties 面板容器样式。
        - [x] 200.5: **验证**: 在不同屏幕尺寸下，中间区域能自适应缩放，左右侧边栏宽度固定。

- [x] **Task-201: 中间 A4 画布 UI**
    - **依赖**: Task-200
    - **上下文**: 在工作区绘制物理尺寸精确的 A4 纸张，并绘制可视化的辅助网格线。
    - **子任务**:
        - [x] 201.1: 创建 `GridCanvas` 组件。
        - [x] 201.2: 使用 CSS 设置固定尺寸 `210mm x 297mm`，并添加白色背景和阴影。
        - [x] 201.3: 使用 CSS Grid 或 SVG 绘制 4列 x 6行 的辅助虚线网格。
        - [x] 201.4: 确保 A4 画布在父容器中居中显示。
        - [x] 201.5: **Auto-Fit**: 实现画布自动缩放逻辑，确保在任意窗口大小下完整显示整页 A4 (无滚动条)。
        - [x] 201.6: **验证**: 使用浏览器开发者工具测量 DOM 元素的像素尺寸，确保比例约为 1:1.414。

- [x] **Task-202: 核心组件 UI - 付款凭单 (Payment Voucher)**
    - **依赖**: Task-201
    - **上下文**: 实现固定在 A4 顶部的付款凭单静态样式。
    - **子任务**:
        - [x] 202.1: 创建 `Voucher` 组件。
        - [x] 202.2: 实现顶部标题“付款凭单”和基本信息（报销人、日期）的输入框布局。
        - [x] 202.3: 实现中间金额汇总区（用途摘要、总金额、大写金额）的静态展示样式。
        - [x] 202.4: 实现底部签字区（财务、审批等标签）的布局。
        - [x] 202.5: **验证**: 将组件放入 A4 画布顶部，确认其占用空间符合设计（约占顶部 1/3）。

- [x] **Task-204: 工作区缩放控制 (Workspace Zoom)**
    - **依赖**: Task-201
    - **上下文**: 在工作区右下角添加缩放滑块，支持手动缩放查看细节，不影响导出。
    - **子任务**:
        - [x] 204.1: 重构 `useAutoFit` 为 `useZoom`，支持 Auto/Manual 模式切换。
        - [x] 204.2: 创建 `ZoomControls` 组件 (Slider + Reset 按钮)。
        - [x] 204.3: 集成到 `App.tsx` 或 `Layout` 中，悬浮于右下角。
        - [x] 204.4: **验证**: 拖动滑块能缩放画布，点击“重置”或“适应”能恢复自适应。

- [x] **Task-203: 核心组件 UI - 文件单元 (File Item)**
    - **依赖**: Task-201
    - **上下文**: 实现单个发票/截图在网格中的卡片样式，包含图片区和输入区。
    - **子任务**:
        - [x] 203.1: 创建 `FileItem` 组件。
        - [x] 203.2: 布局图片区域，设置默认占位图，样式为 `object-contain`。
        - [x] 203.3: 布局下方输入区域：用途(Input)、金额(Input)、备注(Input)。
        - [x] 203.4: 实现“选中”状态的样式（高亮边框）。
        - [x] 203.5: **验证**: 在 A4 画布中硬编码放置几个不同尺寸（2x2, 2x4）的 FileItem，检查排列是否整齐。

---

## 第三阶段：核心业务逻辑 (Phase 3: Core Logic & Interactivity)

本阶段将静态 UI 转化为动态应用，实现文件上传、网格算法、拖拽排序等核心功能。

- [x] **Task-300: 文件上传与数据模型**
    - **依赖**: Task-102, Task-200
    - **上下文**: 实现左侧 Sidebar 的上传功能，处理文件读取、压缩，并存入 Zustand Store。
    - **子任务**:
        - [x] 300.1: 定义 `ReimburseItem` TypeScript 接口 (Using `InvoiceItem`).
        - [x] 300.2: 在左侧栏实现文件拖拽上传区域 (Dropzone).
        - [x] 300.3: 实现图片读取逻辑：File -> Base64.
        - [x] 400.7: **验证**: 选中项目，更改尺寸，验证布局更新。
        - [x] 安装 Vitest。
        - [x] 为 Store 和布局逻辑创建单元测试。
        - [x] 运行测试并修复问题 (修复了无限循环崩溃)。
        - [x] **Task-401: 尺寸优化**
    - [x] 401.1: 从 PropertiesPanel 中移除 1x1 和 4x4 选项。
    - [x] 401.2: 在 PropertiesPanel 中添加 2x3 选项。
    - [x] 401.3: 在布局引擎/Store 中将默认文件尺寸更新为 2x3。
    - [x] 401.4: 更新单元测试以反映新的默认设置。(修复了无限循环崩溃)。
        - [x] 300.4: **关键**: 实现图片压缩逻辑（Canvas 绘制，限制 max-width 1500px）.
        - [x] 300.5: 更新 Store，实现 `addFiles` action (Using `addItems`).
        - [x] 300.6: **验证**: 上传 5 张大图，检查 Store 中是否生成了压缩后的数据对象，且左侧列表能显示缩略图.
    - [x] **Task-304: PDF 格式支持 (New Request)**
        - **上下文**: 用户需要上传 PDF 文件（例如电子发票）。需将 PDF 每一页转换为图片处理。
            - [x] 304.1: 安装 `pdfjs-dist`.
            - [x] 304.2: 实现 `processPdf` 工具函数（PDF Page -> Canvas -> Base64）.
            - [x] 304.3: 更新 `UploadZone` 支持 `.pdf` 并调用新的处理逻辑.
            - [x] 304.4: **验证**: 上传多页 PDF，列表应展示多个对应的图片 Item.

- [x] **Task-305: 发票模式与分流逻辑 (Invoice Mode & Routing)**
    - **Status**: *Replaced by Phase 3.5 Detailed Tasks*

---

## 第3.5阶段：多工作区架构重构 (Phase 3.5: Multi-Workspace Refactoring)

本阶段核心目标：重构数据模型以支持“付款凭单”与“报销发票”双工作区并行，实现文件所有权的互斥管理、横向排版适配及批量操作。

- [x] **Task-600: 数据模型与迁移 (Data Model & Migration)**
  - **依赖**: Task-300
  - **上下文**: 将单一的 `isOnCanvas` 状态升级为互斥的 `workspaceId`，确保文件归属明确。
  - **子任务**:
    - [x] 600.1: 更新 `InvoiceItem` 接口：废弃 `isOnCanvas`，新增 `workspaceId: 'payment' | 'invoice' | null`。
    - [x] 600.2: 在 `useInvoiceStore` 中创建数据迁移逻辑 (`migrateData`)：初始化时将旧数据映射为 defaults ('payment')。
    - [x] 600.3: 更新 Store Actions (`addItems`, `toggleItem`)：改为 `setWorkspace(id, targetMode)`，支持从一个工作区移动到另一个。
    - [x] 600.4: 创建 Selectors: `getPaymentItems` 和 `getInvoiceItems` 用于分别获取不同视图的数据，以及 `getAllAssignedItems` 用于凭单汇总。
    - [x] 600.5: **验证**:
      - 修改本地存储数据模拟旧版本 (仅含 `isOnCanvas`)，刷新页面，确认旧数据自动进入“付款凭单”工作区。
      - **关键验证**: 将一部分文件移入“发票”工作区，确认顶部“付款凭单”的总金额依然等于所有文件的总和（Payment + Invoice）。

- [x] **Task-601: 侧边栏多选与分流 (Sidebar Enhancements)**
  - **依赖**: Task-600
  - **上下文**: 侧边栏需支持批量操作，将文件分配到不同工作区，并直观显示文件归属。
  - **子任务**:
    - [x] 601.1: 在 `UploadedFileList` 组件中增加 `selectedFileIds` (Multi-select State)。
    - [x] 601.2: 重构 `SidebarItem`：增加 Checkbox 复选框；增加状态角标 (Badge) 显示当前归属 (P/I)。
    - [x] 601.3: 实现 Sidebar 底部固定操作栏 (`SidebarFooter`): 含 "移入凭单", "移入发票" 按钮。
    - [x] 601.4: 绑定按钮事件：批量调用 `setWorkspace` 更新所选文件的归属。
    - [x] 601.5: **验证**: 勾选 3 个文件，点击“移入发票”，侧边栏对应角标变为 "I"，且从 Payment 画布消失（如果当前在 Payment）。

- [x] **Task-602: 画布项移动交互 (Canvas Interactions)**
    - **依赖**: Task-600
    - **上下文**: 在画布中快速将文件“踢”到另一个工作区。
    - **子任务**:
        - [x] 602.1: 更新 `FileItem` 工具栏：新增 "Move" 图标按钮 (根据当前 Mode 显示“移至发票”或“移至凭单”)。
        - [x] 602.2: 实现点击处理：调用 Store 的切换工作区 Action。
        - [x] 602.3: **验证**: 在 Payment 模式下点击某图的 Move 按钮，该图立即消失；切换到 Invoice 模式，该图出现在网格中。

- [x] **Task-603: 横向排版与导出适配 (Landscape Layout)**
    - **依赖**: Task-600, Task-201
    - **上下文**: 实现 Invoice 模式的横向 A4 布局及 PDF 导出。
    - **子任务**:
        - [x] 603.1: 更新 `grid-layout.ts`：新增 `calculateInvoiceLayout` 逻辑，适配 `Landscape A4` (297mm width) 的 2x2 网格计算(AspectRatio 调整)。
        - [x] 603.2: 更新 `GridCanvas`：根据 `appMode` 动态切换容器尺寸 (Portrait vs Landscape)。
        - [x] 603.3: 适配 `useExportPdf`：根据当前 `appMode` 设置 jsPDF 的 `orientation` ('p' vs 'l')。
        - [x] 603.4: **验证**: 切换到 Invoice 模式，确认画布变为横向；导出 PDF，确认 PDF 页面为横向且内容排版正确。

### 2026-02-02
- **Task-602 完成**: 实现了画布交互功能，包括在工作区之间切换项目的“移动”按钮。
- **Task-603 完成**: 为“报销发票”工作区适配了横向布局，并实现了 PDF 导出功能。
  - 添加了用于生成 PDF 的 `useExportPdf` Hook。
  - 根据工作区模式配置动态画布尺寸。
  - 在主工具栏添加了“导出 PDF”按钮。
  - **Task-Fix-Rendering**: 通过在捕获期间将输入替换为样式化文本元素（克隆与替换策略），修复了 PDF 导出渲染问题，确保凭单和文件项的输出清晰。

---

## 阶段 3.6：功能增强与交互优化 (Phase 3.6: Enhanced Features)

本阶段实现用户反馈的高频交互功能，包括打印、清空、导航及属性面板增强。

- [x] **Task-700: 打印与清空功能 (Print & Clear)**
    - **依赖**: Task-603
    - **上下文**: 实现顶部工具栏的快捷操作。
    - **子任务**:
        - [x] 700.1: 封装 `usePrint`：复用 `useExportPdf` 生成的 Blob，在隐藏 iframe 中调用 `window.print()`。
        - [x] 700.2: 在 Header 实现 "打印" 按钮 (与导出一致的图标风格)。
        - [x] 700.3: 实现 Store Action `clearAllItems`：清空文件列表和金额，但**保留**凭单头部信息（公司/人名/日期）。
        - [x] 700.4: 在 Header 左侧实现 "一键清空" 按钮，并集成 `AlertDialog` 二次确认。
        - [x] 700.5: **验证**: 点击清空，文件消失但报销人还在；点击打印，弹出系统打印对话框且内容清晰。

- [x] **Task-701: 页面定位器 (Page Navigator)**
    - **依赖**: Task-301
    - **上下文**: 方便用户在多页文档中快速跳转。
    - **子任务**:
        - [x] 701.1: 创建 `PageNavigator` 悬浮胶囊组件。
        - [x] 701.2: 监听 Store 或 Layout 计算总页数 (Total Pages)。
        - [x] 701.3: 实现点击 `Page N` -> 滚动容器 `scrollTo` 到对应高度的逻辑。
        - [x] 701.4: **验证**: 上传 20 张图生成 4 页，点击 Page 4，视图平滑滚动到底部。

- [x] **Task-702: 右侧属性面板重构 (Properties Panel v2)**
    - **依赖**: Task-400
    - **上下文**: 增强右侧面板的实用性，支持凭单编辑与显隐控制。
    - **子任务**:
        - [x] 702.1: 重构 `PropertiesPanel` 布局：使用 ScrollArea 与 Separator 分区。
        - [x] 702.2: 实现 "凭单设置" 表单：绑定 Store 中的 `voucherData` (日期/摘要/金额/报销人等)。
        - [x] 702.3: 实现 "显示付款凭单" Checkbox 开关 & Store 状态 `isVoucherVisible`。
        - [x] 702.5: **验证**: 取消勾选凭单，Voucher 消失，第一张图片顶上去；右侧修改金额，中间画布实时变化。

- [x] **Task-703: 鲁棒性与体验优化 (Robustness & UX)**
    - **依赖**: Task-300, Task-700
    - **上下文**: 解决测试中发现的边缘情况与体验痛点。
    - **子任务**:
        - [x] 703.1: **上传去重 (Deduplication)**:
            - 实现文件名 UTF-8 归一化 (NFC) 以支持中文文件名比对。
            - 增加 PDF 页面命名规则检测，防止同名 PDF 重复解析。
            - 集成 `AlertDialog` 提示重复文件跳过。
        - [x] 703.2: **凭单逻辑 (Voucher Logic)**:
            - 更新 `clearAllItems`，在清空时基于当前时间戳重新生成 `voucherNo`，防止ID重复。
        - [x] 703.3: **Canvas 显示**: 将 Canvas Item 的静态 "RECEIPT" 标签改为显示真实文件名 (截断显示)。

---

## 第四阶段：高级功能与完善 (Phase 4: Advanced Features)

本阶段完善用户体验，添加图片编辑、右侧属性面板控制及导出功能。

- [x] **Task-400: 右侧属性面板交互**
    - **依赖**: Task-200, Task-300
    - **上下文**: 当选中某个文件时，右侧面板显示对应的操作选项。
    - **子任务**:
        - [x] 400.1: 在 Store 中增加 `selectedId` 状态。
        - [x] 400.2: 点击画布中的 FileItem 更新 `selectedId`。
        - [x] 400.3: 在右侧面板实现“尺寸切换”按钮组 (2x2, 2x4, 4x4)。
        - [x] 400.4: 绑定按钮点击事件到 Store 的 `resizeFile` action。
        - [x] 400.5: **验证**: 选中一个文件，点击“2x4”，画布上的该文件应变大，且后续文件自动重排。

- [x] **Task-401: 图片编辑 (裁剪与旋转)**
    - **依赖**: Task-400
    - **上下文**: 实现模态框内的图片裁剪功能。
    - **子任务**:
        - [x] **Task-401** (Task-Editor): 图片编辑器集成
        - [x] 集成 `react-cropper`
        - [x] 开发 `ImageEditorModal` 组件
        - [x] 实现在模态框内旋转与裁剪
        - [x] 保存修改后的 Base64 数据回 Store
        - [x] **验证**: 上传一张图，进行裁剪并保存，画布上应显示裁剪后的版本。

- [x] **Task-402: 导出 PDF**
    - **依赖**: Task-201, Task-301
    - **上下文**: 实现核心的导出功能，确保所见即所得。
    - **子任务**:
        - [x] 402.1: 创建 `useExportPdf` hook。
        - [x] 402.2: 实现 DOM 锁定逻辑：通过 ID 获取 A4 容器元素。
        - [x] 402.3: 配置 `html2canvas`：设置 `scale: 3` (300 DPI)，处理 `useCORS` 等选项。
        - [x] 402.4: 集成 `jspdf`：将生成的 Canvas 图片按 A4 尺寸添加到 PDF 页面中。
        - [x] 402.5: 处理多页导出：如果有多个 A4 页面，需循环处理。
        - [x] 402.6: **验证**: 点击导出，下载 PDF，打印或缩放查看，确保文字清晰且无 UI 杂质。

## 第五阶段：清理与发布 (Phase 5: Polish & Ship)

- [x] **Task-404: 属性面板与付款凭单逻辑**
    - **依赖**: Task-400
    - **上下文**: 用户要求在凭单可见时，对第一页应用特定的尺寸限制。
    - **子任务**:
        - [x] 404.1: 在 `PropertiesPanel` 中识别选中项目的“第一页”状态。
        - [x] 404.2: 在第一页上有条件地过滤尺寸选项（隐藏 x3 高度）。
        - [x] 404.3: 验证点击工作区背景是否返回凭单设置。

- [x] **Task-405: 智能默认尺寸与首页逻辑**
    - **依赖**: Task-404
    - **上下文**: 用户要求根据宽高比设置默认尺寸，并对带有凭单的第一页实施更严格的限制。
    - **子任务**:
        - [x] 405.1: 实现上传时的宽高比检测（横向 -> 4x3，纵向 -> 2x3）。
        - [x] 405.2: 实现“第一页”覆盖逻辑（如果位于带有可见凭单的第一页，则覆盖默认值）。
            - 第一页横向 -> 4x2。
            - 第一页纵向 -> 2x4。
        - [x] 405.3: 更新 `PropertiesPanel`，将 `2x4` 选项限制为仅在带有凭单的第一页可见。

- [x] **Task-500: UI 细节打磨**
    - **依赖**: 所有前置任务
    - **上下文**: 统一 UI 风格，处理空状态和加载状态。
    - **子任务**:
        - [x] 500.1: 添加 Empty State：当没有文件时，中间画布显示引导提示。
        - [x] 500.2: 添加 Loading State：导出 PDF 时显示全屏遮罩/进度条。
        - [x] 500.3: 检查所有 Input 的 Tab 键顺序，确保录入流畅。

- [x] **Task-501: 构建与部署**
    - **依赖**: 所有前置任务
    - **上下文**: 优化构建配置，准备发布。
    - **子任务**:
        - [x] 501.1: 运行 `npm run build`，检查是否有 TypeScript 错误。
        - [x] 501.2: 检查构建产物 (`dist/`) 大小。
        - [x] 501.3: 部署到 Vercel/Netlify 进行最终环境测试。