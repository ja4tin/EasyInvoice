
import React from 'react';
import { cn } from '@/lib/utils';

interface GradientTextProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  colors?: string[];
  animationSpeed?: number;
  showBorder?: boolean;
  className?: string; // Allow overriding classes
}

export default function GradientText({
  children,
  className,
  colors = ["#3b82f6", "#8b5cf6", "#ec4899", "#3b82f6"], // Blue -> Purple -> Pink -> Blue
  animationSpeed = 10,
  showBorder = false,
  ...props
}: GradientTextProps) {
  const gradientStyle = {
    backgroundImage: `linear-gradient(to right, ${colors.join(", ")})`,
    animationDuration: `${animationSpeed}s`,
  };

  if (showBorder) {
    return (
      <div
        className={cn(
          "relative inline-flex rounded-md p-[1.5px] bg-[length:300%_auto] animate-gradient transition-shadow",
          className
        )}
        style={gradientStyle}
        {...props}
      >
        <div className="flex items-center justify-center w-full px-4 py-1.5 bg-background rounded-[calc(var(--radius)-2px)]">
           <span
              className="inline-block bg-[length:300%_auto] bg-clip-text text-transparent animate-gradient"
              style={gradientStyle}
            >
              {children}
            </span>
        </div>
      </div>
    );
  }

  return (
    <span
      className={cn(
        "inline-block bg-[length:300%_auto] bg-clip-text text-transparent animate-gradient cursor-pointer hover:opacity-80 transition-opacity",
        className
      )}
      style={gradientStyle}
      {...props}
    >
      {children}
    </span>
  );
}
