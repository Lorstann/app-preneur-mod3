"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Plus } from "lucide-react";

const FAQS = [
  {
    q: "How is data isolated between regions?",
    a: "Every row in our scoped tables carries a scope_id resolved against a recursive CTE. PostgreSQL Row-Level Security policies enforce that the connection's session variable (set by middleware from the JWT) is an ancestor of that scope. A bug in application code cannot defeat this — the database refuses the row.",
  },
  {
    q: "Can the AI agent leak documents from other scopes?",
    a: "No. Embeddings inherit the scope_id of their source document. Every retrieval query joins through the same scope hierarchy used for direct access, so out-of-scope passages are excluded before reaching the LLM.",
  },
  {
    q: "What document formats are accepted?",
    a: "PDF, DOCX, and DOC only. File magic-byte checks run server-side after upload and before indexing. Text extraction is sandboxed.",
  },
  {
    q: "How are permissions revoked?",
    a: "Scope changes propagate through Clerk webhooks into our user metadata table. Active sessions are invalidated within seconds. RLS evaluates on every query, so no stale cache exists.",
  },
  {
    q: "Where is data stored?",
    a: "Object data lives in AWS S3 with SSE-S3 encryption. Metadata, embeddings, and audit logs live in PostgreSQL with pgvector. Region-pinning is configurable per scope.",
  },
  {
    q: "How are internal API calls authenticated?",
    a: "All internal sync paths require an HMAC-SHA256 signature with timestamp and nonce. Replay windows are short and nonces are persisted. Every accepted and rejected attempt is audited.",
  },
];

export function FaqSection() {
  const shouldReduceMotion = useReducedMotion();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="relative z-10 border-t border-white/[0.06] bg-white/[0.01]">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
          <div>
            <p className="mb-2 text-[11px] font-medium uppercase tracking-widest text-white/35">
              FAQ
            </p>
            <h2 className="text-2xl font-semibold text-white sm:text-3xl">
              Operations & security.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/55">
              Questions we hear from security, compliance, and platform teams during evaluation.
            </p>
          </div>

          <div className="divide-y divide-white/[0.06] rounded-xl border border-white/[0.06]">
            {FAQS.map((f, i) => {
              const isOpen = open === i;
              return (
                <div key={f.q}>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-white/[0.015]"
                  >
                    <span className="text-sm font-medium text-white/85">{f.q}</span>
                    <motion.span
                      animate={{ rotate: isOpen ? 45 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border border-white/[0.08] bg-white/[0.02] text-white/55"
                    >
                      <Plus className="h-3 w-3" />
                    </motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                        animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, height: "auto" }}
                        exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
                        transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="px-5 pb-5 text-[13px] leading-relaxed text-white/55">
                          {f.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
