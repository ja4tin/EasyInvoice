/**
 * Project: EasyInvoice
 * File: PageNavigator.tsx
 * Description: 页面导航器组件，显示当前页码并提供跳转功能
 * Author: Ja4tin (ja4tin@hotmail.com)
 * Date: 2026-02-04
 * License: MIT
 */

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface PageNavigatorProps {
  totalPages: number;
}

export const PageNavigator: React.FC<PageNavigatorProps> = ({ totalPages }) => {
  const [activePage, setActivePage] = useState(0);

  useEffect(() => {
    const scrollContainer = document.getElementById('invoice-scroll-container');
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const pageIndex = parseInt(entry.target.id.replace('invoice-page-', ''), 10);
            if (!isNaN(pageIndex)) {
              setActivePage(pageIndex);
            }
          }
        });
      },
      {
        root: scrollContainer,
        rootMargin: '-45% 0px -45% 0px', // 当页面越过垂直中心 10% 范围时激活
        threshold: 0
      }
    );

    // 观察所有页面
    for (let i = 0; i < totalPages; i++) {
        const el = document.getElementById(`invoice-page-${i}`);
        if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [totalPages]);

  const scrollToPage = (index: number) => {
    const el = document.getElementById(`invoice-page-${index}`);
    // const container = document.getElementById('invoice-scroll-container');
    
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center gap-2 print:hidden border-l pl-4 ml-4 h-9">
       <span className="text-sm font-medium text-muted-foreground whitespace-nowrap hidden xl:inline-block">
          第 {activePage + 1} 页 / 共 {totalPages} 页
       </span>

       <div className="flex items-center bg-muted/50 rounded-md p-1">
           <Button
             variant="ghost"
             size="icon"
             className="w-8 h-8 rounded-sm hover:bg-background"
             onClick={() => scrollToPage(activePage - 1)}
             disabled={activePage === 0}
             title="上一页"
           >
             <ChevronUp className="w-4 h-4 rotate-[-90deg]" />
           </Button>

           <Button
             variant="ghost"
             size="icon"
             className="w-8 h-8 rounded-sm hover:bg-background"
             onClick={() => scrollToPage(activePage + 1)}
             disabled={activePage === totalPages - 1}
             title="下一页"
           >
             <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
           </Button>
       </div>
    </div>
  );
};
