* | **项目名称** | *智能报销排版工具 (EasyInvoice)*                             |
  | ------------ | ------------------------------------------------------------ |
  | **版本**     | V1.0.0 (Final)                                               |
  | **状态**     | **已锁定 (Frozen)**                                          |
  | **定位**     | 纯前端、隐私安全、高精度的 A4 报销单据排版工具               |
  | **核心场景** | 解决财务报销中发票/支付截图大小不一、计算繁琐、排版困难的问题。 |

  ###  产品概述

  EasyInvoice 是一款基于 Web 的、隐私安全的本地化报销单据排版工具。它旨在解决财务报销过程中发票、支付截图大小不一、计算繁琐、排版困难的痛点。用户上传图片后，系统自动进行 A4 网格化排版，支持人工录入数据自动汇总，并最终生成符合财务打印规范的 PDF 文档。

  ### 目标用户

  - **小微企业员工**：需要定期提交报销，但缺乏专业财务软件支持。
  - **财务人员/出纳**：需要整理大量零散的电子发票和截图，进行打印归档。
  - **行政助理**：代替团队成员处理报销事宜。

  ## 核心需求

  1. **所见即所得 (WYSIWYG)**：网页端 A4 画布的排版效果与导出的 PDF 完全一致，像素级还原。
  2. **自动化排版**：基于 4x6 网格系统，提供智能吸附和流式布局，减少手动调整工作。
  3. **数据自动汇总**：基于用户录入的信息，自动生成包含大写金额的“付款凭单”。
  4. **隐私安全**：无后端数据库，无账号体系，所有数据存储于用户浏览器本地（IndexedDB）。

  ## 1. 核心业务流程 (Core Business Logic)

  1. **上传 (Upload)**：用户批量上传发票或支付凭证图片。
  2. **分流 (Route)**：根据用户选择的模式（发票模式 / 支付记录模式）进入不同视图。
  3. **排版 (Layout)**：系统基于 4x6 网格算法自动排列图片（默认 2x2）。
  4. **录入 (Input)**：用户在图片下方输入金额与用途（支持 Tab 切换）。
  5. **汇总 (Aggregate)**：首页“付款凭单”自动计算总额、大写转换、汇总用途。
  6. **微调 (Refine)**：用户通过右侧菜单调整图片尺寸、旋转、裁剪、排序。
  7. **导出 (Export)**：生成基于高分截图的 PDF，严格还原 A4 视觉效果。

  ------

  ## 2. 详细功能需求 (Functional Requirements)

  ### 2.1 全局布局与网格系统 (Layout Engine)

  **画布规格**：固定 **A4 标准尺寸** (210mm x 297mm)，背景白色。

  #### 2.1.1 支付记录模式 (Payment Records View)

  - **网格基础**：页面被划分为 **4列 x 6行** 的基础网格。
  - **页面结构**：
    - **第 1 页**：
      - **顶部 (Row 1-2)**：固定为 **付款凭单组件** (占用 4列 x 2行)。
      - **剩余 (Row 3-6)**：用于放置支付记录文件 (4列 x 4行)。
      - *注：用户可选择隐藏凭单，隐藏后全页可用。*
    - **后续页面**：全页用于放置支付记录 (4列 x 6行)。
  - **自动流式排版规则**：
    - **默认尺寸**：文件上传后默认占用 **2x2** 网格。
    - **最小限制**：严格限制最小尺寸为 **2x2**（保证底部输入框文字可读性）。
    - **吸附逻辑**：文件自动向左上角吸附。若当前行空间不足，自动换行；若当前页空间不足，自动创建新页。
    - **强垂直堆叠策略 (关键逻辑)**：
      - 场景：当左侧放置了一个 **2x4** (宽2高4) 的大文件时，右侧剩余空间为 2列宽。
      - 规则：右侧剩余区域强制采用**垂直堆叠**逻辑（即只能上下放置 2x2 或 2x4 的文件），禁止并排两个 1x1 文件，以维持“最小 2x2”的原则。

  #### 2.1.2 发票模式 (Invoice View)

  - **排版选项**：
    - **竖向排版**：A4 上下均分 (1列 x 2行)，每页放 2 张。
    - **横向排版**：A4 四格均分 (2列 x 2行)，每页放 4 张。
  - **输入框逻辑**：发票模式下，输入框（用途/金额/备注）可选择是否打印显示，但**数据必须提取**以供凭单汇总。

  ------

  ### 2.2 付款凭单组件 (Payment Voucher)

  - **组件定义**：位于支付记录首页顶部的动态汇总表单。
  - **字段与交互**：
    1. **大标题**：固定显示“付款凭单”。
    2. **基本信息**：
       - **报销人**：手动输入文本。
       - **日期**：日期选择控件，默认初始化为当日。
    3. **核心数据区 (自动计算)**：
       - **付款用途摘要**：
         - *初始状态*：自动遍历所有文件（发票+支付记录）的“用途”字段，以逗号分隔追加 (Append)。
         - *显示限制*：限制最大高度为 2 行，超出显示省略号 (...)。
         - *脏状态逻辑 (Dirty State)*：一旦用户手动修改了摘要框内的文字，系统**立即停止**自动同步功能。只有当用户点击“重置摘要”按钮时，才恢复自动同步。
       - **总金额**：实时累加所有文件的金额输入框（用户需自行负责去重）。
       - **人民币大写**：根据总金额自动转换（例：`1200.00` -> `壹仟贰佰元整`），只读字段。
    4. **签字审批区 (底部)**：
       - 显示固定标签：**财务、出纳、部门主管、受款人**。
       - 留出足够空白高度供打印后手写签字。

  ------

  ### 2.3 文件单元交互 (Item Interaction)

  每个文件单元（Grid Item）包含以下元素：

  1. **图片区域**：
     - **长图适配**：对于高宽比过大的图片（如长条小票），默认采用 `object-fit: contain` (适应) 模式，确保内容完整不被裁切，留白处理。
  2. **数据录入区 (位于图片下方)**：
     - **用途** (Text)：参与凭单汇总。
     - **金额** (Number)：参与凭单汇总，支持两位小数。
     - **备注** (Text)：仅展示，不汇总。
  3. **交互操作**：
     - **点击选中**：高亮边框，并在**右侧菜单**显示该文件的操作选项。
     - **拖拽排序**：支持在画布内直接拖拽交换位置，触发全局重排。

  ------

  ### 2.4 界面结构与菜单 (UI Structure)

  #### 2.4.1 左侧资源栏 (Left Sidebar)

  - **文件上传**：支持拖拽上传、点击上传。
  - **文件列表 (List View)**：
    - 显示缩略图和文件名。
    - 支持**拖拽排序**：此处排序与中间画布网格实现**双向实时同步**。
  - **全局控制**：
    - 模式切换 (发票 / 支付记录)。
    - 清空所有数据 (Reset)。

  #### 2.4.2 右侧操作栏 (Right Sidebar)

  - *默认状态*：显示全局提示或空白。
  - *选中文件状态*：
    - **尺寸调整**：按钮组 `[2x2]`, `[2x4]`,`[2x3]`, `[4x4]`。点击即生效。
    - **图片编辑**：按钮 `[编辑图片]`。点击触发**全屏模态框**，进行旋转 (90度步进) 和 裁剪 (Crop)。
  - **视图控制**：
    - 开关：`[显示/隐藏 付款凭单]`。
    - **导出按钮**：`[导出 PDF]`。

  ------

  ------

  ### 2.5 导出与打印系统 (Export & Print System)

  - **输出格式**：PDF (A4)。
  - **技术策略**：**High-DPI Snapshot (高清容器快照)**。
    - **原理**：锁定 DOM 节点 `#print-container`，通过 `html2canvas` (或类似库) 以 **3x-4x 缩放因子** (约 300 DPI) 进行渲染，生成图片后封装入 PDF。
    - **内容边界**：**严格仅包含** A4 画布内的视觉元素。自动剔除 UI 辅助线、滚动条、菜单、按钮、重置按钮。
    - **打印功能 (New)**：
      - **交互**：点击“打印”按钮，先生成高清 PDF Blob，然后在浏览器内部调用打印窗口打印该 Blob (或 Image)，确保打印结果与 PDF 导出结果**100% 一致**。

  ### 2.6 新增交互特性 (New Features)

  #### 2.6.1 一键清空 (Clear All)
  - **位置**：顶部工具栏左侧 (红色区域)。
  - **逻辑**：
    - **清除对象**：清空所有已上传的文件 (Image Items) 和金额汇总。
    - **保留对象**：**保留**付款凭单的头部信息（报销人、公司名称、日期、部门/项目），保留当前设置（如模式、网格偏好）。
    - **交互**：点击后弹出二次确认框 ("确定要清空所有单据吗？")。

  #### 2.6.2 页面定位器 (Page Navigator)
  - **表现**：工作区 (Workspace) 左上角的悬浮胶囊组件。
  - **显示条件**：仅当总页数 > 1 时显示。
  - **交互**：点击 "Page 2"，画布区域自动平滑滚动定位到第 2 页顶部。

  #### 2.6.3 右侧面板增强 (Properties Panel +)
  - **结构**：采用 **折叠面板 (Accordion)** 或 **上下分栏** 结构，确保“付款凭单设置”始终可见。
  - **部分 A: 凭单设置 (Voucher Settings)**：
    - **一直显示**：无论是否选中文件，此区域常驻。
    - **同步字段**：日期、报销人、部门/项目、用途摘要、总金额。此处修改与中间画布的凭单组件实现**双向绑定**。
    - **显示开关**：[复选框] "显示付款凭单"。
      - *取消勾选*：中间画布的凭单组件隐藏。
      - *自动排版*：凭单隐藏后，第一页顶部的空间被释放，文件项应自动**上移填补** (网格流式重排)，但保持 Payment Mode (竖向) 不变。
  - **部分 B: 选中项属性 (Selected Item)**：
    - 仅当选中文件时显示 (同原有逻辑)。

  ------

  ### 2.6 数据存储与安全 (Storage & Security)

  - **存储引擎**：**IndexedDB** (推荐使用 `idb-keyval` 库)。
  - **缓存策略**：**实时自动保存 (Auto-save)**。
    - 用户在操作过程中的每一次修改（图片上传、文字录入、排版调整）均实时写入本地数据库。
    - 意外关闭浏览器或刷新页面，再次打开时**状态完整恢复**。
  - **隐私承诺**：所有数据仅驻留于用户浏览器端，**绝不**上传至任何云端服务器。

  ------

  ## 3 功能优先级 (MVP 和后续版本)

  | **功能模块** | **功能点**                             | **优先级**  | **版本规划** |
  | ------------ | -------------------------------------- | ----------- | ------------ |
  | **排版核心** | 4x6 网格、垂直堆叠逻辑、自动分页       | **P0 (高)** | MVP          |
  | **凭单组件** | 自动汇总金额、大写转换、摘要拼接       | **P0 (高)** | MVP          |
  | **文件操作** | 上传、拖拽排序、尺寸调整 (2x2/2x4/4x4) | **P0 (高)** | MVP          |
  | **图片编辑** | 旋转、裁剪 (Modal实现)                 | **P1 (中)** | MVP          |
  | **数据录入** | 用途/金额/备注输入、脏状态管理         | **P0 (高)** | MVP          |
  | **存储**     | IndexedDB 自动保存与恢复               | **P0 (高)** | MVP          |
  | **导出**     | 高清图片化 PDF 导出 (无文字复制)       | **P0 (高)** | MVP          |
  | **高级功能** | OCR 自动识别金额                       | P2 (低)     | V1.1         |
  | **高级功能** | 多币种支持                             | P3 (低)     | V1.2         |
  | **高级功能** | 云端同步/团队协作                      | P3 (低)     | V2.0         |

  ## 4 界面设计要求 (UI Design)

  采用经典的 **IDE / 生产力工具布局**：

  1. **左侧栏 (Sidebar - 250px)**：
     - **资源管理**：上传按钮（大）、文件列表（支持拖拽排序的小缩略图）。
     - **全局设置**：模式切换 Tab、清空按钮。
  2. **中间区 (Workplace - 自适应)**：
     - **背景**：深灰色/浅灰色背景，突出 A4 纸张。
     - **画布**：白色 A4 容器，显示淡色网格辅助线（导出时隐藏）。
     - **交互**：文件单元悬停显示操作框线。
  3. **右侧栏 (Properties - 300px)**：
     - **上下文敏感**：未选中时显示空状态/帮助；选中图片时显示“尺寸”、“编辑”、“删除”。
     - **凭单开关**：Toggle 开关。
     - **主操作**：醒目的“导出 PDF”按钮。

  

  ## 5 核心组件 (Core Components)

  1. **`GridEngine` (网格引擎)**：
     - 负责计算坐标 `(x, y)`、处理吸附逻辑、计算分页、执行“垂直堆叠”校验。
  2. **`VoucherManager` (凭单管理器)**：
     - 负责监听文件列表数据，计算总金额，处理大写转换，管理用途摘要的 Dirty 标记。
  3. **`StorageAdapter` (存储适配器)**：
     - 封装 `idb-keyval`，负责将包含 Base64 图片的大对象写入/读取浏览器数据库。
  4. **`ExportService` (导出服务)**：
     - 封装 `html2canvas` 和 `jspdf`，负责锁定 DOM、缩放渲染、生成 PDF 文件流。

  

  ## 6 非功能性需求 (Non-functional Requirements)

  1. **性能 (Performance)**：
     - 支持单次项目包含 50+ 张图片不卡顿。
     - 图片上传时需在前端进行压缩（限制最大宽度 1500px），防止 IndexedDB 读写过慢。
  2. **兼容性 (Compatibility)**：
     - **Chrome 80+** (主要目标平台)。
     - **Safari 14+** (重点测试导出 PDF 的边框渲染兼容性)。
     - 不支持 IE。
  3. **安全 (Security)**：
     - **CORS**：无跨域请求（纯本地）。
     - **XSS**：输入框内容需进行转义处理（Vue默认支持）。
  4. **可用性 (Usability)**：
     - 意外关闭浏览器后，数据恢复时间 < 1秒。

  

  ## 7 应用/用户流程 (User Flow)

  1. **开始**：用户打开网页（如有历史草稿，自动加载）。
  2. **上传**：拖拽一组发票/支付截图到左侧区域。
  3. **初筛**：在左侧列表调整顺序（如按时间排序）。
  4. **编辑布局**：
     - 在中间画布点击某张图 -> 右侧选择 `2x4` 放大。
     - 点击“编辑” -> 弹出模态框裁剪图片多余边缘。
  5. **录入信息**：
     - 按 Tab 键在不同文件的输入框间快速切换，输入金额和用途。
     - 观察顶部“付款凭单”自动汇总金额。
  6. **微调凭单**：手动修改凭单上的“用途摘要”（触发脏状态，停止同步）。
  7. **导出**：点击右侧“导出 PDF” -> 等待生成 -> 下载文件。

  ## 8 技术栈建议 (Technical Stack)

  | **领域**     | **推荐选型**                                                 | **理由**                                                     |
  | ------------ | ------------------------------------------------------------ | ------------------------------------------------------------ |
  | **框架**     | **React 18+** + **Vite**                                     | 生态最丰富，组件化模型适合构建复杂的交互界面。               |
  | **UI 库**    | **Tailwind CSS** + **shadcn/ui** (可选)                      | 原子化 CSS，快速构建布局，便于控制打印样式。                 |
  | **状态管理** | **Zustand**                                                  | 管理全局的文件序列、金额计算、UI 状态。                      |
  | **本地存储** | **idb-keyval**                                               | 解决 LocalStorage 5MB 限制问题，轻松存储数十张图片。         |
  | **拖拽库**   | dnd-kit                                                      | React 生态中目前最现代化的拖拽库，支持无障碍访问，且非常适合处理 Grid（网格）和 List（列表）之间的复杂同步场景。 |
  | **PDF 核心** | **html2canvas** + **jspdf**                                  | 成熟的“DOM 转 PDF”解决方案。                                 |
  | 工具库       | `decimal.js` (金额), `dayjs` (日期), `react-cropper` (图片裁剪) |                                                              |

  ## 9 风险控制与边界情况 (Edge Cases)

  1. **超大数据量**：若用户上传超过 50 张高清图片，IndexedDB 读写可能变慢。
     - *对策*：在上传阶段在前端进行图片压缩（限制 max-width 为 1500px 左右），降低存储压力。
  2. **文本溢出**：用途栏文字过多导致布局错乱。
     - *对策*：CSS 强制设置 `line-clamp: 2`，导出时同样生效。
  3. **浏览器兼容性**：截图库在不同浏览器下可能有细微渲染差异。
     - *对策*：开发阶段重点测试 Chrome (Blink) 和 Safari (Webkit) 的导出效果。
  4. **数据清理**：用户手动清理浏览器缓存。
     - *对策*：在 UI 底部增加弱提示：“数据保存在本机，清理浏览器缓存将丢失数据”。



## 10 实施计划 (Implementation Plan)

- ### 第一阶段：核心架构

  - [ ] 初始化 React + Vite + Tailwind + Zustand 项目。
  - [ ] 搭建 `GridEngine` Hook：实现 4x6 网格算法、自动分页逻辑。
  - [ ] 验证 `dnd-kit` 在网格布局中的拖拽效果（特别是“垂直堆叠”约束）。
  - [ ] 封装 `usePersistStore`：集成 `idb-keyval` 实现自动持久化。

  ### 第二阶段：UI 与交互

  - [ ] 开发 Sidebar 文件上传组件与列表排序 (`SortableContext`)。
  - [ ] 实现 List 与 Grid 的双向同步状态逻辑。
  - [ ] 开发右侧属性面板，集成 `react-cropper` 实现图片编辑 Modal。
  - [ ] 开发“付款凭单”组件：实现金额汇总 `useMemo` 计算和大写转换。

  ## 4. Workspace & Data Model

### 4.1. Dual Workspace Architecture (Parallel Existence)
The application maintains two distinct, persistent workspaces. Switching between modes switches the **active data view**, not just the layout.

*   **Payment Voucher Workspace (付款凭单)**
    *   **Orientation**: Portrait A4 (Vertical).
    *   **Components**: Top Voucher Header + Grid Items.
    *   **Layout**: 2x2 Grid (Cross) or custom defined.
*   **Reimbursement Invoice Workspace (报销发票)**
    *   **Orientation**: Landscape A4 (Horizontal).
    *   **Components**: Grid Items only (No Voucher Header).
    *   **Layout**: 2x2 Grid (Cross) adapted for Landscape aspect ratio.

### 4.2. File Ownership & Mutuality
*   **Relationship**: A file can belong to `Payment`, `Invoice`, or `None` (Unassigned).
*   **Exclusivity**: A file **cannot** be in both workspaces simultaneously.
*   **State Tracking**: Each file item records its assignment (`workspaceId`: `'payment' | 'invoice' | null`). A marker in the sidebar indicates current ownership.

### 4.5 Global Data Aggregation (CRITICAL)

The "Payment Voucher" component (displayed at the top of the Payment Workspace) acts as the **Global Summary**.

- **Total Amount**: MUST sum the `amount` of **ALL** files stored in the application, regardless of whether their `workspaceId` is `'payment'` or `'invoice'`.
- **Usage Summary**: MUST concatenate distinct `usage` text from **ALL** files.
- **Rationale**: Reimbursement aims to claim money for ALL invoices. Even if an invoice is displayed on the "Invoice" sheet (for printing), its cost must be included in the main Payment Voucher. The voucher represents the total claim.

### 4.3. Interaction Design
*   **Sidebar Multi-Select**:
    *   Files have checkboxes for selection.
    *   Action Buttons (Fixed at bottom): "Add to Payment" / "Add to Invoice".
*   **Contextual Move**:
    *   Items on the Canvas have a "Move" icon/button.
    *   Action: Instantly transfers the item to the *other* workspace and removes it from the current view.

### 4.4. Printing & Export
*   **Dynamic Orientation**: PDF generation (`jspdf`) must respect the active workspace's orientation (Portrait for Payment, Landscape for Invoice).
  ### 第三阶段：导出与优化

  - [ ] 封装 `ExportButton` 组件：调用 `html2canvas` 抓取 `#print-area`。
  - [ ] 调试 300 DPI 导出效果，修复 Safari 下的 CSS 兼容性问题。
  - [ ] 引入 `decimal.js` 替换所有原生加减法。
  - [ ] 添加 Empty State (空状态) 和 Loading 骨架屏。

  ### 第四阶段：测试与交付

  - [ ] 性能测试（React Profiler 检测 50+ 组件渲染性能）。
  - [ ] 边界测试（超长文本截断、断电恢复）。
  - [ ] 最终验收。
