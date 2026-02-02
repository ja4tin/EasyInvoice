# Tech Stack Recommendation: EasyInvoice

**文档版本**: V1.0.0
**架构核心原则**: Offline-First (离线优先), Client-Side Only (纯客户端), Privacy-Centric (隐私安全)

---

## 1. 技术栈选择 (Tech Stack Selection)

我们采用 **“Modern React SPA”** 架构。这套组合在 2026 年是标准、高性能且维护成本最低的选择。

### 1.1 前端核心 (Frontend Core)

| 模块 | 选型 | 理由 |
| :--- | :--- | :--- |
| **构建工具** | **Vite** | 毫秒级热更新，配置极其简单，完美支持 SPA 静态打包。 |
| **核心框架** | **React 18** | 生态最强，利用 Hooks 处理复杂的 UI 逻辑。 |
| **语言** | **TypeScript** | **必选**。在处理金额计算、文件数据结构时，类型安全是健壮性的基石。 |

### 1.2 状态与交互 (State & Interaction)
| 模块 | 选型 | 理由 |
| :--- | :--- | :--- |
| **状态管理** | **Zustand** | 比 Redux 轻量，比 Context API 性能好。非常适合管理文件列表 (`files[]`) 和全局设置。无样板代码。 |
| **拖拽交互** | **dnd-kit** | 现代化的 React 拖拽库。相比 `react-dnd` 更易用，且完美支持我们在 PRD 中定义的 **Grid (网格) 与 List (列表) 双向同步**。 |
| **UI 框架** | **Tailwind CSS** | 原子化 CSS，能精确控制 A4 纸张的毫米级布局和打印样式 (`@media print`)。 |
| **组件库** | **shadcn/ui** | 基于 Radix UI 的 headless 组件。提供现成的、可访问性极佳的 Modal、Popover、Input，直接拷贝代码到项目，**零运行时体积负担**。 |

### 1.3 业务逻辑与工具 (Logic & Utils)
| 模块 | 选型 | 理由 |
| :--- | :--- | :--- |
| **本地存储** | **idb-keyval** | 极简的 Promise 封装库 (IndexedDB)。突破 LocalStorage 5MB 限制，轻松存储几十张 Base64 图片。 |
| **PDF 生成** | **html2canvas** + **jspdf** | **关键选型**。采用“高清快照”策略，确保所见即所得，避免中文字体文件过大问题。 |
| **数学计算** | **decimal.js** | **财务红线**。彻底解决 JS 浮点数运算误差 (0.1+0.2!=0.3)，保证金额分毫不差。 |
| **图片裁剪** | **react-cropper** | 成熟的 Cropper.js 封装，用于模态框内的图片编辑。 |
| **日期处理** | **dayjs** | 轻量级 (2KB) 的 Moment.js 替代品。 |

### 1.4 后端与数据库 (Backend & Database)
* **后端**: **无 (None)**。本项目为纯静态应用，不需要服务器端逻辑。
* **数据库**: **IndexedDB (Browser Native)**。数据完全驻留在用户浏览器的沙盒中。

---

## 2. 项目结构 (Project Structure)

推荐采用 **“Feature-based (按功能组织)”** 的目录结构，比传统的按类型组织（所有组件放一起）更清晰，便于维护。

```text
src/
├── assets/             # 静态资源
├── components/         # 全局通用组件 (基于 shadcn/ui)
│   ├── ui/             # Button, Input, Dialog 等原子组件
│   └── Layout.tsx      # 全局布局框架
├── features/           # 核心业务功能模块 (按领域划分)
│   ├── editor/         # 画布与编辑核心
│   │   ├── components/
│   │   │   ├── GridCanvas.tsx    # A4 网格画布
│   │   │   ├── DraggableItem.tsx # 可拖拽文件单元
│   │   │   └── Sidebar.tsx       # 左侧文件列表
│   │   ├── hooks/
│   │   │   ├── useGridLayout.ts  # 4x6 网格计算核心逻辑
│   │   │   └── useExportPdf.ts   # 导出 PDF 逻辑
│   │   └── utils/
│   │       └── layout-algorithms.ts # 垂直堆叠与分页算法
│   └── voucher/        # 付款凭单模块
│       ├── components/
│       │   └── PaymentVoucher.tsx
│       └── utils/
│           └── currency-format.ts # 人民币大写转换
├── store/              # 全局状态 (Zustand)
│   ├── useFileStore.ts # 核心：管理 files[], addFile, moveFile
│   └── useAppStore.ts  # UI 状态 (loading, modal open)
├── lib/                # 第三方库配置
│   ├── db.ts           # IndexedDB 封装单例
│   └── utils.ts        # Tailwind merge 等工具
├── types/              # TypeScript 类型定义
└── App.tsx
```

------

## 3. 数据模型 (Data Model)

这是项目的核心数据结构，定义在 `types/index.ts` 中。

```typescript
// 文件尺寸枚举
export type GridSize = '2x2' | '2x4' | '4x4';

// 核心文件对象
export interface ReimburseItem {
  id: string;           // UUID
  fileData: string;     // Base64 图片数据 (或 Blob URL)
  type: 'invoice' | 'payment'; 
  
  // 布局属性
  size: GridSize;       // 当前占用的网格大小
  rotation: number;     // 0, 90, 180, 270
  cropData?: CropInfo;  // 裁剪坐标

  // 业务数据 (用户输入)
  amount: string;       // 存储为字符串，计算时转 Decimal
  usage: string;        // 用途
  note?: string;        // 备注
  
  createdAt: number;    // 排序用
}

// 全局项目状态 (存储于 IndexedDB)
export interface ProjectState {
  items: ReimburseItem[]; // 所有文件的有序列表
  voucher: {
    enabled: boolean;     // 是否显示凭单
    user: string;         // 报销人
    date: string;         // 日期
    manualSummary?: string; // 用户手动修改后的摘要 (Dirty State)
  };
  settings: {
    mode: 'payment_record' | 'invoice';
    layout: 'vertical' | 'horizontal'; // 发票模式专用
  };
}
```

------

## 4. 关键技术点与难点 (Key Technical Challenges)

### 4.1 高清 PDF 导出 (High-DPI Export)

- **挑战**：直接截图通常会导致文字模糊，无法打印。
- **方案**：
  1. 创建一个临时的 DOM 容器。
  2. 利用 `html2canvas` 的 `scale` 参数，设置为 **3** 或 **4** (对应 300 DPI)。
  3. `window.devicePixelRatio` 可能会干扰截图，需在截图时临时覆盖。
  4. 生成的 Canvas 尺寸巨大，需按比例缩放回 A4 PDF 尺寸 (`210mm x 297mm`)。

### 4.2 垂直堆叠算法 (Vertical Stacking Logic)

- **挑战**：PRD 要求“当左侧有 2x4 大图时，右侧剩余空间禁止并排 1x1，强制堆叠”。
- **方案**：
  - 不要使用纯 CSS Grid (`grid-auto-flow`)，因为它无法处理这种复杂的约束。
  - 编写一个 JS 算法 (`useGridLayout.ts`)：
    1. 遍历 `items` 数组。
    2. 维护一个二维数组 `grid[6][4]` (6行4列) 标记占用状态。
    3. 当放入一个 item 时，寻找第一个能放下的空位。
    4. **关键检查**：如果放入位置是右侧剩余的 2列，且左侧已被占用，则强制检查当前 item 宽度是否符合要求（如强制拉伸为 2宽，或拒绝 1宽）。

### 4.3 列表与网格的双向同步

- **挑战**：左侧是 List，中间是 Grid，拖拽需同步。
- **方案**：
  - **单一数据源**：只维护一个 `items[]` 数组。
  - 左侧列表只是 `items` 的映射。
  - 使用 `dnd-kit` 的 `<SortableContext>`。无论是列表拖拽还是网格拖拽，最终都只触发 `arrayMove(items, oldIndex, newIndex)`。

### 4.4 图片性能与存储

- **挑战**：IndexedDB 虽然大，但读取几十张高清大图依然会慢。
- **方案**：
  - **上传时压缩**：在文件上传瞬间，利用 Canvas 将图片 `max-width` 限制为 1500px，转为 JPEG (quality 0.8)。
  - 这可以将 10MB 的照片压缩到 300KB 左右，极大提升加载速度和 PDF 生成速度。

------

## 5. 如何部署 (Deployment)

由于是纯静态 SPA，部署成本为 **0**。

### 5.1 推荐平台

- **Vercel** (首选): 完美支持 Vite，Git 推送自动构建，全球 CDN 极速访问。
- **GitHub Pages**: 免费，适合开源项目。
- **Netlify**: 备选，功能与 Vercel 类似。

### 5.2 部署流程 (CI/CD)

1. 代码推送到 GitHub。
2. 触发 Vercel Action。
3. 执行 `npm run build` (Vite 打包)。
4. 产物 (`dist/`) 被分发到 CDN。

### 5.3 Nginx 配置 (如果是自建服务器)

只需一个简单的 try_files 指令支持 SPA 路由：

```nginx
server {
    listen 80;
    server_name example.com;
    root /var/www/smart-reimburse/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```
