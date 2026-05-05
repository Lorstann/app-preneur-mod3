"use client";

import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function GlassSurface({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/20 bg-white/10 backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.08)]",
        className,
      )}
      {...props}
    />
  );
}

