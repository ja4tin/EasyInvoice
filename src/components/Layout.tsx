import React from 'react';
import { UploadZone } from '@/features/upload/components/UploadZone'
import { UploadedFileList } from '@/features/upload/components/UploadedFileList'


interface LayoutProps {
  children?: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background font-sans antialiased text-foreground">
      {/* Left Sidebar - Data Source */}
      <aside className="hidden w-[280px] flex-col border-r bg-muted/30 md:flex">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <a href="/" className="flex items-center gap-2 font-semibold">
            <span className="">EasyInvoice</span>
          </a>
        </div>
        <div className="flex-1 overflow-auto py-2">
            <div className="px-4 py-2 space-y-4">
                <UploadZone />
                <UploadedFileList />
            </div>
        </div>
      </aside>

      {/* Main Workspace - Canvas */}
      <main className="flex flex-1 flex-col relative overflow-hidden bg-muted/50">
        <header className="flex h-14 items-center gap-4 border-b bg-background px-4 lg:h-[60px] lg:px-6">
           {/* Top Toolbar Placeholder */}
           <div className="flex w-full items-center justify-between">
              <h1 className="font-semibold text-lg">Workspace</h1>
              <div className="flex items-center gap-2">
                 {/* Toolbar actions */}
              </div>
           </div>
        </header>

        {/* Canvas Area */}
        <div className="flex-1 overflow-auto p-8 flex items-center justify-center">
            {children}
        </div>
      </main>

      {/* Right Sidebar - Properties */}
      <aside className="hidden w-[300px] flex-col border-l bg-background md:flex">
         <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <h2 className="font-semibold">Properties</h2>
         </div>
         <div className="flex-1 overflow-auto p-4">
            <div className="space-y-4">
                <p className="text-sm text-muted-foreground">Select an item to view properties.</p>
            </div>
         </div>
      </aside>
    </div>
  );
};
