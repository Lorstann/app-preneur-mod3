"use client";

import { motion, useReducedMotion } from "framer-motion";
import { HardDrive } from "lucide-react";

const QUOTA_TB = 5; // Per-scope storage quota

const DEPARTMENTS = [
  { name: "Operations",  gb: 612, color: "#3b82f6" },
  { name: "Finance",     gb: 478, color: "#6366f1" },
  { name: "Legal",       gb: 354, color: "#8b5cf6" },
  { name: "HR",          gb: 287, color: "#10b981" },
  { name: "Engineering", gb: 196, color: "#f59e0b" },
];

export function StorageBreakdown({ scopeName }: { scopeName: string }) {
  const shouldReduceMotion = useReducedMotion();
  const totalGB = DEPARTMENTS.reduce((s, d) => s + d.gb, 0);
  const quotaGB = QUOTA_TB * 1024;
  const usedPct = (totalGB / quotaGB) * 100;

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.22, duration: 0.35 }}
      className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-5"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <HardDrive className="h-3.5 w-3.5 text-white/40" />
            <p className="text-sm font-medium text-white/85">Storage by department</p>
          </div>
          <p className="mt-0.5 text-[11px] text-white/35">
            {(totalGB / 1024).toFixed(2)} TB of {QUOTA_TB} TB · {scopeName}
          </p>
        </div>
        <div className="text-right">
          <p className="font-mono-tabular text-2xl font-semibold tracking-tight text-white">
            {usedPct.toFixed(0)}<span className="text-base text-white/40">%</span>
          </p>
          <p className="text-[10px] text-white/35">quota used</p>
        </div>
      </div>

      {/* Stacked usage bar */}
      <div className="mb-4 flex h-2 overflow-hidden rounded-full bg-white/[0.04]">
        {DEPARTMENTS.map((d, i) => {
          const widthPct = (d.gb / quotaGB) * 100;
          return (
            <motion.div
              key={d.name}
              initial={shouldReduceMotion ? { width: `${widthPct}%` } : { width: 0 }}
              animate={{ width: `${widthPct}%` }}
              transition={{ delay: 0.3 + i * 0.05, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
              style={{ background: d.color }}
              className="h-full"
            />
          );
        })}
      </div>

      {/* Per-dept rows */}
      <div className="space-y-2">
        {DEPARTMENTS.map((d) => {
          const sharePct = (d.gb / totalGB) * 100;
          return (
            <div key={d.name} className="flex items-center gap-3 text-[11px]">
              <span className="h-2 w-2 shrink-0 rounded-sm" style={{ background: d.color }} />
              <span className="flex-1 text-white/70">{d.name}</span>
              <span className="font-mono-tabular text-white/30">{sharePct.toFixed(1)}%</span>
              <span className="font-mono-tabular w-20 text-right text-white/85">
                {d.gb >= 1024 ? `${(d.gb / 1024).toFixed(2)} TB` : `${d.gb} GB`}
              </span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
