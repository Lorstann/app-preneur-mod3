"use client";

import { motion, useReducedMotion } from "framer-motion";

const STACK = [
  { name: "Next.js 14",     role: "App Router · RSC",         glyph: "▲" },
  { name: "FastAPI",        role: "Python 3.12 · async",      glyph: "⚡" },
  { name: "PostgreSQL 16",  role: "RLS · pgvector",           glyph: "◇" },
  { name: "AWS S3",         role: "SSE · pre-signed URLs",    glyph: "◎" },
  { name: "Clerk",          role: "Identity · JWT",           glyph: "◈" },
  { name: "LangChain",      role: "RAG · permission filters", glyph: "✦" },
  { name: "Tailwind CSS",   role: "Design tokens",            glyph: "❍" },
  { name: "Framer Motion",  role: "Reduced-motion aware",     glyph: "⌬" },
];

export function TechStack() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section className="relative z-10 border-t border-white/[0.06]">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="mb-2 text-[11px] font-medium uppercase tracking-widest text-white/35">
              Stack
            </p>
            <h2 className="text-2xl font-semibold text-white sm:text-3xl">
              Boring technology, deliberately.
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/55">
              Every component is mature, observable, and replaceable. No magic,
              no proprietary runtime — just well-trodden building blocks chosen
              for auditability.
            </p>
          </div>
        </div>

        <div className="grid gap-px overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.04] sm:grid-cols-2 lg:grid-cols-4">
          {STACK.map((s, i) => (
            <motion.div
              key={s.name}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: i * 0.04, duration: 0.3 }}
              className="bg-[#0b0d12] p-4"
            >
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-white/[0.03] text-[13px] text-white/70">
                  {s.glyph}
                </span>
                <div>
                  <p className="text-sm font-medium text-white/85">{s.name}</p>
                  <p className="text-[11px] text-white/40">{s.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
