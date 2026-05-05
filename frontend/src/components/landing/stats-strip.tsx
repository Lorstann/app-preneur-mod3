"use client";

import { motion, useReducedMotion } from "framer-motion";

const STATS = [
  { value: "50+",       label: "Regions",        sub: "across 4 continents" },
  { value: "5,200",     label: "Active scopes",  sub: "team-level isolation" },
  { value: "12.4 M",    label: "Documents",      sub: "versioned and audited" },
  { value: "99.99 %",   label: "Uptime SLO",     sub: "rolling 90-day window" },
];

export function StatsStrip() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative z-10 border-t border-white/[0.06] bg-white/[0.01]">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-px overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.03] sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <motion.div
              key={s.label}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
              className="bg-[#0b0d12] p-6"
            >
              <p className="text-[10px] font-medium uppercase tracking-widest text-white/35">
                {s.label}
              </p>
              <p className="mt-2 font-mono-tabular text-3xl font-semibold tracking-tight text-white">
                {s.value}
              </p>
              <p className="mt-1 text-[11px] text-white/40">{s.sub}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
