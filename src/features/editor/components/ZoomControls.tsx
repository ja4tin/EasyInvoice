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
  // Convert 0.1-2.0 to 10-200 for slider
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
        title={isAutoFit ? "Auto Fit Active" : "Reset to Auto Fit"}
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
