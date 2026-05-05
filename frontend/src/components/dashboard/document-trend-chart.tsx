"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { TrendingUp } from "lucide-react";
import { useMemo } from "react";

// Deterministic mock series — replace with /analytics/uploads?range=14d
function buildSeries(scopeName: string) {
  const seed = scopeName.length;
  const today = new Date();
  return Array.from({ length: 14 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (13 - i));
    const wobble = Math.sin((i + seed) * 0.9) * 4;
    const wobble2 = Math.cos((i + seed) * 1.3) * 3;
    return {
      day: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      pdf: Math.max(2, Math.round(14 + wobble * 1.4 + (i % 3))),
      docx: Math.max(1, Math.round(8 + wobble2 + (i % 4))),
      doc: Math.max(0, Math.round(3 + Math.sin(i * 0.7) * 2)),
    };
  });
}

const SERIES = [
  { key: "pdf",  label: "PDF",  color: "#3b82f6" },
  { key: "docx", label: "DOCX", color: "#8b5cf6" },
  { key: "doc",  label: "DOC",  color: "#10b981" },
] as const;

export function DocumentTrendChart({ scopeName }: { scopeName: string }) {
  const shouldReduceMotion = useReducedMotion();
  const data = useMemo(() => buildSeries(scopeName), [scopeName]);

  const totals = SERIES.reduce<Record<string, number>>((acc, s) => {
    acc[s.key] = data.reduce((sum, d) => sum + (d[s.key] as number), 0);
    return acc;
  }, {});
  const grandTotal = Object.values(totals).reduce((a, b) => a + b, 0);

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15, duration: 0.35 }}
      className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-5"
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-3.5 w-3.5 text-white/40" />
            <p className="text-sm font-medium text-white/85">Document uploads</p>
          </div>
          <p className="mt-0.5 text-[11px] text-white/35">Last 14 days · {scopeName}</p>
        </div>
        <div className="text-right">
          <p className="font-mono-tabular text-2xl font-semibold tracking-tight text-white">
            {grandTotal.toLocaleString()}
          </p>
          <p className="text-[10px] text-white/35">total uploads</p>
        </div>
      </div>

      <div className="h-[220px] w-full">
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
            <defs>
              {SERIES.map((s) => (
                <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"  stopColor={s.color} stopOpacity={0.45} />
                  <stop offset="100%" stopColor={s.color} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 10, fill: "rgba(255,255,255,0.35)" }}
              axisLine={false}
              tickLine={false}
              interval={1}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "rgba(255,255,255,0.30)" }}
              axisLine={false}
              tickLine={false}
              width={32}
            />
            <Tooltip
              cursor={{ stroke: "rgba(255,255,255,0.08)", strokeWidth: 1 }}
              contentStyle={{
                background: "#11141b",
                border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: "6px",
                color: "#e6e8ef",
                fontSize: "11px",
                padding: "6px 10px",
              }}
            />
            {SERIES.map((s) => (
              <Area
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stackId="1"
                stroke={s.color}
                strokeWidth={1.5}
                fill={`url(#grad-${s.key})`}
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 flex items-center justify-end gap-4 border-t border-white/[0.04] pt-3">
        {SERIES.map((s) => (
          <div key={s.key} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm" style={{ background: s.color }} />
            <span className="text-[10px] text-white/55">{s.label}</span>
            <span className="font-mono-tabular text-[10px] text-white/35">
              {totals[s.key].toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
