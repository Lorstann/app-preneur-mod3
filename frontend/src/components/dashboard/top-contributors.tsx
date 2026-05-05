"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Trophy } from "lucide-react";

type Contributor = {
  name: string;
  role: string;
  uploads: number;
  tasksDone: number;
  initials: string;
  accent: string;
};

const CONTRIBUTORS: Contributor[] = [
  { name: "Sarah Johnson", role: "Finance Lead",       uploads: 47, tasksDone: 23, initials: "SJ", accent: "from-blue-400/20 to-violet-400/15" },
  { name: "Alex Weber",    role: "Operations Manager", uploads: 38, tasksDone: 19, initials: "AW", accent: "from-violet-400/20 to-fuchsia-400/15" },
  { name: "Maria Costa",   role: "Compliance Officer", uploads: 32, tasksDone: 28, initials: "MC", accent: "from-emerald-400/20 to-teal-400/15" },
  { name: "Daniel Park",   role: "Legal Counsel",      uploads: 24, tasksDone: 14, initials: "DP", accent: "from-amber-400/20 to-orange-400/15" },
  { name: "Lina Patel",    role: "HR Specialist",      uploads: 19, tasksDone: 11, initials: "LP", accent: "from-cyan-400/20 to-blue-400/15" },
];

export function TopContributors({ scopeName }: { scopeName: string }) {
  const shouldReduceMotion = useReducedMotion();
  const max = Math.max(...CONTRIBUTORS.map((c) => c.uploads));

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25, duration: 0.35 }}
      className="rounded-lg border border-white/[0.06] bg-white/[0.02]"
    >
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
        <div className="flex items-center gap-2">
          <Trophy className="h-3.5 w-3.5 text-white/40" />
          <p className="text-sm font-medium text-white/85">Top contributors</p>
        </div>
        <span className="rounded border border-white/[0.06] bg-white/[0.03] px-1.5 py-0.5 text-[10px] text-white/40">
          {scopeName}
        </span>
      </div>

      <div className="divide-y divide-white/[0.04]">
        {CONTRIBUTORS.map((c, i) => {
          const pct = (c.uploads / max) * 100;
          return (
            <motion.div
              key={c.name}
              initial={shouldReduceMotion ? false : { opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.04, duration: 0.3 }}
              className="flex items-center gap-3 px-4 py-3"
            >
              {/* Rank */}
              <span className="font-mono-tabular w-4 text-center text-[10px] text-white/30">
                {i + 1}
              </span>

              {/* Avatar */}
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br ${c.accent} text-[11px] font-medium text-white/85`}
              >
                {c.initials}
              </div>

              <div className="flex-1 min-w-0">
                <p className="truncate text-sm text-white/85">{c.name}</p>
                <p className="truncate text-[10px] text-white/35">{c.role}</p>
              </div>

              <div className="flex flex-col items-end gap-1">
                <div className="flex items-baseline gap-2 text-[11px]">
                  <span className="font-mono-tabular text-white/85">{c.uploads}</span>
                  <span className="text-white/30">uploads</span>
                </div>
                <div className="h-0.5 w-20 overflow-hidden rounded-full bg-white/[0.04]">
                  <motion.div
                    initial={shouldReduceMotion ? { width: `${pct}%` } : { width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ delay: 0.4 + i * 0.05, duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                    className="h-full rounded-full bg-white/40"
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
