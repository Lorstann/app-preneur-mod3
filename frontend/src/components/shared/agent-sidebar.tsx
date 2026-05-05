"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Bot, Sparkles } from "lucide-react";

const sources = [
  { name: "Q3-Finance-Report.pdf", scope: "scope_de_finance" },
  { name: "Reconciliation-SOP.docx", scope: "scope_de_ap_team" },
];

export function AgentSidebar() {
  const shouldReduceMotion = useReducedMotion();
  return (
    <motion.aside
      initial={shouldReduceMotion ? false : { x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.15, duration: 0.35 }}
      className="glass absolute right-0 top-0 flex h-full min-h-[680px] w-[340px] flex-col rounded-2xl p-5"
    >
      <div className="mb-4 flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/20 ring-1 ring-blue-400/30">
          <Bot className="h-4 w-4 text-blue-300" />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Nexus Agent</p>
          <p className="text-[10px] text-white/40">Permission-aware retrieval</p>
        </div>
        <Sparkles className="ml-auto h-3.5 w-3.5 animate-pulse text-blue-400/60" />
      </div>

      <div className="mb-3 rounded-xl bg-amber-400/10 px-3 py-2 ring-1 ring-amber-400/20">
        <p className="text-xs text-amber-300">Context: Finance Department — Aggregated view</p>
      </div>

      <div className="mb-4 rounded-xl bg-white/5 p-3 text-sm text-white/70 ring-1 ring-white/8">
        The main Q3 risk is delayed vendor reconciliation in two teams.
      </div>

      <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-white/30">Source Documents</p>
      <div className="space-y-2">
        {sources.map((s) => (
          <div key={s.name} className="rounded-lg bg-white/4 px-3 py-2 ring-1 ring-white/8">
            <p className="text-xs font-medium text-white/80">{s.name}</p>
            <p className="mt-0.5 text-[10px] text-white/35">{s.scope}</p>
          </div>
        ))}
      </div>
    </motion.aside>
  );
}
