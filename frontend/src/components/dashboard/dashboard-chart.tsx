"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Pie, PieChart, Tooltip, Cell } from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";

const data = [
  { name: "Operations", value: 34 },
  { name: "Finance", value: 27 },
  { name: "Legal", value: 18 },
  { name: "HR", value: 21 },
];

const COLORS = ["#3b82f6", "#6366f1", "#8b5cf6", "#10b981"];

export function DashboardChart({ scopeName }: { scopeName: string }) {
  const shouldReduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.35 }}
      className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-5"
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <PieChartIcon className="h-3.5 w-3.5 text-white/40" />
          <p className="text-sm font-medium text-white/85">Documents by department</p>
        </div>
        <span className="rounded border border-white/[0.06] bg-white/[0.03] px-1.5 py-0.5 text-[10px] text-white/40">
          {scopeName}
        </span>
      </div>
      <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-center sm:justify-around">
        <PieChart width={180} height={180}>
          <Pie
            data={data}
            dataKey="value"
            cx="50%"
            cy="50%"
            outerRadius={82}
            innerRadius={48}
            paddingAngle={2}
            stroke="none"
          >
            {data.map((_entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            cursor={false}
            contentStyle={{
              background: "#11141b",
              border: "1px solid rgba(255,255,255,0.10)",
              borderRadius: "6px",
              color: "#e6e8ef",
              fontSize: "11px",
              padding: "6px 10px",
            }}
          />
        </PieChart>
        <div className="flex flex-col gap-2.5">
          {data.map((entry, i) => (
            <div key={entry.name} className="flex items-center gap-2.5 text-sm">
              <span
                className="h-2 w-2 rounded-sm"
                style={{ background: COLORS[i % COLORS.length] }}
              />
              <span className="text-white/65">{entry.name}</span>
              <span className="ml-auto pl-6 font-mono-tabular text-xs text-white/85">{entry.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
