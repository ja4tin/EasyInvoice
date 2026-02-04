/**
 * Project: EasyInvoice
 * File: ZoomControls.tsx
 * Description: 缩放控制组件 (悬浮球)
 * Author: Ja4tin (ja4tin@hotmail.com)
 * Date: 2026-02-04
 * License: MIT
 */

import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

interface ZoomControlsProps {
  scale: number;
  isAutoFit: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onScaleChange: (value: number) => void;
  onReset: () => void;
}

export function ZoomControls({
  scale,
  isAutoFit,
  onScaleChange,
  onReset
}: ZoomControlsProps) {
  // 转换 0.1-2.0 到 10-200 用于滑块
  const sliderValue = [Math.round(scale * 100)];

  const handleSliderChange = (vals: number[]) => {
    onScaleChange(vals[0] / 100);
  };

  return (
    <div className="flex items-center gap-2 bg-background/90 backdrop-blur border border-slate-200 p-2 rounded-lg shadow-lg">
      <Button 
        variant="ghost" 
        size="icon" 
        className={cn("h-6 w-6 text-slate-500 hover:text-primary", isAutoFit && "text-primary bg-primary/10")}
        onClick={onReset}
        title={isAutoFit ? "自适应已激活" : "重置为自适应"}
      >
        <Monitor className="h-4 w-4" />
      </Button>

      <div className="h-4 w-[1px] bg-slate-200 mx-1" />

      <span className="text-xs font-mono w-10 text-right text-slate-600">
        {Math.round(scale * 100)}%
      </span>

      <Slider
        min={30}
        max={150}
        step={5}
        value={sliderValue}
        onValueChange={handleSliderChange}
        className="w-24 cursor-pointer"
      />
    </div>
  );
}
