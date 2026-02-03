import React, { useEffect, useState } from 'react';
// import { cn } from '@/lib/utils';
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
        rootMargin: '-45% 0px -45% 0px', // Active when page crosses the vertical center 10%
        threshold: 0
      }
    );

    // Observe all pages
    for (let i = 0; i < totalPages; i++) {
        const el = document.getElementById(`invoice-page-${i}`);
        if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [totalPages]);

  const scrollToPage = (index: number) => {
    const el = document.getElementById(`invoice-page-${index}`);
    const container = document.getElementById('invoice-scroll-container');
    
    if (el && container) {
      // Calculate position to center the page in the container
      
      // Calculate position to center the page in the container
      // Center logic: contentTop - (containerH - elH) / 2
      // But simple block: 'start' with some padding is easier usually, 
      // but 'start' puts it at very top.
      // Let's stick to scrollIntoView for simplicity but maybe center it?
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center gap-2 print:hidden border-l pl-4 ml-4 h-9">
       <span className="text-sm font-medium text-muted-foreground whitespace-nowrap hidden xl:inline-block">
          Page {activePage + 1} / {totalPages}
       </span>

       <div className="flex items-center bg-muted/50 rounded-md p-1">
           <Button
             variant="ghost"
             size="icon"
             className="w-8 h-8 rounded-sm hover:bg-background"
             onClick={() => scrollToPage(activePage - 1)}
             disabled={activePage === 0}
             title="Previous Page"
           >
             <ChevronUp className="w-4 h-4 rotate-[-90deg]" />
           </Button>

           <Button
             variant="ghost"
             size="icon"
             className="w-8 h-8 rounded-sm hover:bg-background"
             onClick={() => scrollToPage(activePage + 1)}
             disabled={activePage === totalPages - 1}
             title="Next Page"
           >
             <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
           </Button>
       </div>
    </div>
  );
};
