/**
 * Project: EasyInvoice
 * File: Layout.tsx
 * Description: 全局应用布局组件，包含头部导航、左侧边栏、主工作区和右侧属性面板
 * Author: Ja4tin (ja4tin@hotmail.com)
 * Date: 2026-02-04
 * License: MIT
 */

import React, { useState } from 'react';
import GradientText from '@/components/ui/GradientText';
import { useExportPdf } from '@/features/editor/hooks/useExportPdf';
import { PdfPreviewModal } from '@/features/export/components/PdfPreviewModal';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UploadZone } from '@/features/upload/components/UploadZone'
import { UploadedFileList } from '@/features/upload/components/UploadedFileList'
import { PropertiesPanel } from '@/features/editor/components/PropertiesPanel'
import { PrintContainer } from '@/features/editor/components/PrintContainer'
import { useSettingsStore } from '@/store/useSettingsStore'
import { useInvoiceStore } from '@/store/useInvoiceStore'
import { usePrint } from '@/features/editor/hooks/usePrint'
import { Trash2, Printer, PanelLeftClose, PanelLeftOpen, Github } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { PageNavigator } from '@/features/editor/components/PageNavigator'
import { useGridLayout } from '@/features/editor/hooks/useGridLayout'

interface LayoutProps {
  children?: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { appMode, invoiceLayout } = useSettingsStore(state => state.settings);
  const updateSettings = useSettingsStore(state => state.updateSettings);
  const { generatePdfUrl } = useExportPdf();
  const { print } = usePrint();
  const items = useInvoiceStore(state => state.items);

  // 计算用于导航的总页数
  const canvasItems = items.filter(item => item.workspaceId === appMode);
  const { totalPages } = useGridLayout({
    items: canvasItems,
    columns: 4,
    rows: 6,
    appMode,
    invoiceLayout
  });
  
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfFilename, setPdfFilename] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // 左侧边栏状态
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);

  const handleExportClick = async () => {
    setIsPreviewOpen(true);
    setIsGenerating(true);
    setPdfUrl(null);
    
    // 微小延迟以确保 Modal 打开
    setTimeout(async () => {
      const result = await generatePdfUrl();
      if (result) {
         setPdfUrl(result.url);
         setPdfFilename(result.filename);
      }
      setIsGenerating(false);
    }, 100);
  };

  const handleDownload = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = pdfFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden flex-col bg-background font-sans antialiased text-foreground">
      {/* 1. 全局头部 - 满宽 */}
      <header className="flex h-14 items-center border-b bg-background lg:h-[60px] shrink-0 z-10 w-full justify-between">
          {/* Logo 区域 - 固定宽度 (280px) */}
          <div className="flex items-center gap-2 font-semibold w-[280px] border-r border-border shrink-0 h-full px-6 justify-center">
             {/* 如果侧边栏收起，显示展开按钮 */}

             <a href="/" className="flex items-center gap-2 group">
                <img 
                  src="/logo.png" 
                  alt="Logo" 
                  className="w-8 h-8 rounded-full transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110" 
                />
                <GradientText 
                  colors={["#40ffaa", "#4079ff", "#40ffaa", "#4079ff", "#40ffaa"]} 
                  animationSpeed={3} 
                  className="text-xl font-bold tracking-tight"
                >
                  EasyInvoice
                </GradientText>
             </a>
          </div>

          {/* 中间区域 (工具栏) - Flex 1 */}
          <div className="flex flex-1 items-center px-4 overflow-hidden justify-between">
              {/* 上下文工具栏 (页面导航, 布局选择) */}
              <div className="flex items-center gap-4">
                  <div className="flex items-center bg-muted rounded-lg p-1 h-8">
                      <button 
                        onClick={() => updateSettings({ appMode: 'payment' })}
                        className={cn(
                          "px-3 text-sm font-medium rounded-md transition-all h-full flex items-center",
                          appMode === 'payment' ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        付款凭单
                      </button>
                      <button 
                         onClick={() => updateSettings({ appMode: 'invoice' })}
                         className={cn(
                            "px-3 text-sm font-medium rounded-md transition-all h-full flex items-center",
                            appMode === 'invoice' ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                         )}
                      >
                        报销发票
                      </button>
                  </div>
                  
                  {/* 页面导航器 */}
                  <PageNavigator totalPages={totalPages} />

                  {/* 发票布局选项 (仅在发票模式下显示) */}
                  {appMode === 'invoice' && (
                     <div className="flex items-center gap-2 border-l pl-4 ml-2">
                        <span className="text-sm text-muted-foreground">布局:</span>
                        <select 
                          className="h-8 text-sm bg-transparent border rounded px-2"
                          value={invoiceLayout}
                          onChange={(e) => updateSettings({ invoiceLayout: e.target.value as any })}
                        >
                            <option value="cross">田字格 (2x2)</option>
                            <option value="vertical">上下分栏 (1x2)</option>
                        </select>
                     </div>
                  )}
              </div>

              {/* 动作按钮 (移动到中间区域右侧) */}
              <div className="flex items-center gap-2">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                          <Trash2 className="w-4 h-4 mr-2" />
                          清空
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>确认清空所有内容？</AlertDialogTitle>
                        <AlertDialogDescription>
                          此操作将清空所有上传的文件和表单数据，但会保留下次使用的默认设置（如报销人）。此操作无法撤销。
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction onClick={() => useInvoiceStore.getState().clearAllItems()} className="bg-destructive hover:bg-destructive/90">
                          确认清空
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                 <div className="h-4 w-[1px] bg-border mx-1" />

                 <Button variant="outline" size="sm" onClick={print}>
                    <Printer className="w-4 h-4 mr-2" />
                    打印
                 </Button>

                 <Button variant="outline" size="sm" onClick={handleExportClick}>
                    <Download className="w-4 h-4 mr-2" />
                    导出 PDF
                 </Button>
              </div>
          </div>

          {/* 右侧区域 (GitHub Link) - 固定宽度 (280px) 与右侧边栏对齐 */}
          <div className="flex items-center gap-2 w-[280px] border-l border-border shrink-0 h-full px-6 justify-end">
             <Button variant="ghost" size="icon" asChild>
                <a href="https://github.com/ja4tin/EasyInvoice" target="_blank" rel="noopener noreferrer" title="View on GitHub" className="group">
                    <Github className="w-5 h-5 transition-transform duration-300 group-hover:scale-125 group-hover:rotate-12" />
                </a>
             </Button>
          </div>
      </header>

      {/* 2. 主体容器 */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* 左侧边栏 */}
        <aside 
            className={cn(
            "flex-col border-r bg-muted/30 transition-all duration-300 ease-in-out md:flex overflow-hidden",
            isLeftSidebarOpen ? "w-[280px]" : "w-[50px]"
            )}
        >
            {/* 内部头部包含折叠按钮 */}
            <div className={cn(
                "flex items-center border-b py-3 transition-all duration-300",
                isLeftSidebarOpen ? "justify-between px-4 min-w-[280px]" : "justify-center px-0 w-full"
            )}>
                <span className={cn("text-sm font-medium transition-opacity duration-200", !isLeftSidebarOpen && "opacity-0 hidden")}>数据源</span>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)}
                    title={isLeftSidebarOpen ? "收起侧边栏" : "展开侧边栏"}
                >
                    {isLeftSidebarOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
                </Button>
            </div>

            <div className={cn("flex-1 overflow-auto py-2 min-w-[280px] transition-opacity duration-200", !isLeftSidebarOpen && "opacity-0 invisible")}>
                <div className="px-4 py-2 space-y-4">
                    <UploadZone />
                    <UploadedFileList />
                </div>
            </div>
        </aside>

        {/* 主工作区 */}
        <main className="flex flex-1 flex-col relative overflow-hidden bg-muted/50 min-w-0">
             <div 
               className="flex-1 overflow-hidden relative w-full h-full flex flex-col items-center"
               onClick={(e) => {
                 // 检查点击目标是否为按钮、输入框或可排序项内部
                 // 我们只希望在点击“背景”时取消选择
                 const target = e.target as HTMLElement;
                 const isInteractive = target.closest('button') || target.closest('input') || target.closest('select') || target.closest('a') || target.closest('[data-no-deselect="true"]');
                 
                 if (!isInteractive) {
                   useInvoiceStore.getState().selectItem(null);
                 }
               }}
             >
                {children}
             </div>
        </main>
        
        {/* 右侧边栏 */}
        <PropertiesPanel />
        
      </div>

      {/* 隐藏的打印容器 (用于导出) */}
      <PrintContainer />

      <PdfPreviewModal 
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        pdfUrl={pdfUrl}
        onDownload={handleDownload}
        isGenerating={isGenerating}
      />
    </div>
  );
};
