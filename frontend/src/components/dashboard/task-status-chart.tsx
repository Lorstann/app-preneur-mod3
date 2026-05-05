"use client";

import { motion, useReducedMotion } from "framer-motion";
import { CheckSquare } from "lucide-react";

const STATUSES = [
  { label: "To do",       value: 42, color: "#6b7280", description: "Backlog" },
  { label: "In progress", value: 68, color: "#3b82f6", description: "Active" },
  { label: "In review",   value: 24, color: "#f59e0b", description: "Awaiting approval" },
  { label: "Blocked",     value:  9, color: "#ef4444", description: "Needs attention" },
  { label: "Done",        value: 121, color: "#10b981", description: "This sprint" },
];

export function TaskStatusChart({ scopeName }: { scopeName: string }) {
  const shouldReduceMotion = useReducedMotion();
  const total = STATUSES.reduce((s, t) => s + t.value, 0);
  const max = Math.max(...STATUSES.map((s) => s.value));

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.18, duration: 0.35 }}
      className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-5"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <CheckSquare className="h-3.5 w-3.5 text-white/40" />
            <p className="text-sm font-medium text-white/85">Task pipeline</p>
          </div>
          <p className="mt-0.5 text-[11px] text-white/35">Open by status · {scopeName}</p>
        </div>
        <div className="text-right">
          <p className="font-mono-tabular text-2xl font-semibold tracking-tight text-white">
            {total}
          </p>
          <p className="text-[10px] text-white/35">tasks</p>
        </div>
      </div>

      <div className="space-y-3">
        {STATUSES.map((s, i) => {
          const pct = (s.value / max) * 100;
          return (
            <div key={s.label}>
              <div className="mb-1 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-sm" style={{ background: s.color }} />
                  <span className="text-white/75">{s.label}</span>
                  <span className="text-white/30">· {s.description}</span>
                </div>
                <span className="font-mono-tabular text-white/85">{s.value}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.04]">
                <motion.div
                  initial={shouldReduceMotion ? { width: `${pct}%` } : { width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ delay: 0.25 + i * 0.06, duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
                  className="h-full rounded-full"
                  style={{ background: s.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
