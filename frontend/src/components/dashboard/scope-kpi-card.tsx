"use client";

import { motion, useReducedMotion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

type ScopeKpiCardProps = {
  title: string;
  value: string;
  trend: string;
  scopeName: string;
  index?: number;
};

function AnimatedNumber({ value }: { value: string }) {
  const shouldReduceMotion = useReducedMotion();
  const numericMatch = value.match(/^(\d+(?:\.\d+)?)(.*)$/);
  const num = numericMatch ? parseFloat(numericMatch[1]) : 0;
  const suffix = numericMatch ? numericMatch[2] : "";

  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) =>
    Math.round(v).toLocaleString() + suffix
  );
  const ref = useRef(false);

  useEffect(() => {
    if (!numericMatch || shouldReduceMotion || ref.current) return;
    ref.current = true;
    const controls = animate(count, num, { duration: 1.0, ease: [0.4, 0, 0.2, 1] });
    return () => controls.stop();
  }, [count, num, numericMatch, shouldReduceMotion]);

  if (!numericMatch || shouldReduceMotion) return <span>{value}</span>;
  return <motion.span>{rounded}</motion.span>;
}

export function ScopeKpiCard({ title, value, trend, scopeName, index = 0 }: ScopeKpiCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const isPositive = trend.startsWith("+");
  const Trend = isPositive ? TrendingUp : TrendingDown;

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-5 transition-colors hover:border-white/[0.12] hover:bg-white/[0.03]"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-[11px] font-medium uppercase tracking-wider text-white/35">{title}</p>
        <span className="truncate rounded border border-white/[0.06] bg-white/[0.03] px-1.5 py-0.5 text-[10px] text-white/40">
          {scopeName}
        </span>
      </div>
      <div className="font-mono-tabular text-3xl font-semibold tracking-tight text-white">
        <AnimatedNumber value={value} />
      </div>
      <div className="mt-2 flex items-center gap-1.5">
        <Trend className={`h-3 w-3 ${isPositive ? "text-emerald-400" : "text-red-400"}`} />
        <p className={`text-xs ${isPositive ? "text-emerald-400/85" : "text-red-400/85"}`}>{trend}</p>
      </div>
    </motion.div>
  );
}
