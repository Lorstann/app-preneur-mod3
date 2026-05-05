"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Sparkles, FileText, ShieldCheck, Lock } from "lucide-react";

export function AgentShowcase() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section id="agent" className="relative z-10 border-t border-white/[0.06] bg-white/[0.01]">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-20 lg:grid-cols-2 lg:items-center">
        {/* Copy */}
        <div>
          <p className="mb-2 text-[11px] font-medium uppercase tracking-widest text-white/35">
            AI agent
          </p>
          <h2 className="text-2xl font-semibold text-white sm:text-3xl">
            Answers from documents you can already see.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/55">
            The retrieval layer is permission-aware. Every embedding query is filtered through the
            same hierarchy that gates direct access — so the agent cannot surface a passage from
            a document the user is not entitled to read.
          </p>

          <div className="mt-6 space-y-3">
            <div className="flex items-start gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.03]">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-300/85" />
              </span>
              <div>
                <p className="text-sm font-medium text-white/85">Scope-filtered retrieval</p>
                <p className="mt-0.5 text-[12px] text-white/45">
                  Vector search is constrained to chunks tagged with scopes resolvable by the user.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.03]">
                <Lock className="h-3.5 w-3.5 text-blue-300/85" />
              </span>
              <div>
                <p className="text-sm font-medium text-white/85">Cited, not generated</p>
                <p className="mt-0.5 text-[12px] text-white/45">
                  Every claim references a source document with version pin and scope path.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mock conversation */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.45 }}
          className="rounded-xl border border-white/10 bg-[#0e1117] p-4 shadow-2xl"
        >
          <div className="mb-3 flex items-center gap-2 border-b border-white/[0.06] pb-3">
            <span className="flex h-6 w-6 items-center justify-center rounded-md border border-white/10 bg-white/[0.04]">
              <Sparkles className="h-3 w-3 text-blue-300/85" />
            </span>
            <p className="text-[12px] font-medium text-white/85">Nexus Agent</p>
            <span className="ml-auto rounded-md border border-emerald-400/20 bg-emerald-400/5 px-1.5 py-0.5 text-[9px] text-emerald-300/85">
              Scoped: DE › Finance
            </span>
          </div>

          {/* user bubble */}
          <div className="mb-3 flex justify-end">
            <div className="max-w-[80%] rounded-lg rounded-tr-sm border border-white/10 bg-white/[0.04] px-3 py-2 text-[12px] text-white/85">
              Summarize the Q3 vendor audit findings and link the source.
            </div>
          </div>

          {/* agent bubble */}
          <div className="flex">
            <div className="max-w-[88%] rounded-lg rounded-tl-sm border border-white/[0.08] bg-white/[0.02] px-3 py-2.5">
              <p className="text-[12px] leading-relaxed text-white/80">
                Three findings were flagged in Q3:
              </p>
              <ul className="mt-1.5 space-y-1 text-[12px] leading-relaxed text-white/65">
                <li>· Two vendors operating without renewed DPAs <span className="text-white/35">[1]</span></li>
                <li>· One overdue invoice past 90 days <span className="text-white/35">[1]</span></li>
                <li>· Procurement SoD breach in EMEA contracts <span className="text-white/35">[2]</span></li>
              </ul>

              {/* citations */}
              <div className="mt-3 space-y-1.5 border-t border-white/[0.06] pt-2.5">
                <Citation
                  index={1}
                  title="Q3-Vendor-Audit-Report.pdf"
                  scope="DE › Finance"
                  version="v4"
                />
                <Citation
                  index={2}
                  title="Procurement-Compliance-Notes.docx"
                  scope="DE › Compliance"
                  version="v2"
                />
              </div>
            </div>
          </div>

          {/* input */}
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2">
            <span className="flex-1 text-[11px] text-white/30">Ask about anything in your scope…</span>
            <span className="rounded border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-mono-tabular text-[10px] text-white/40">
              ⌘ K
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Citation({
  index, title, scope, version,
}: { index: number; title: string; scope: string; version: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded border border-white/10 bg-white/[0.04] font-mono-tabular text-[9px] text-white/55">
        {index}
      </span>
      <FileText className="h-2.5 w-2.5 shrink-0 text-white/30" />
      <span className="truncate text-[11px] text-white/75">{title}</span>
      <span className="ml-auto rounded bg-white/[0.04] px-1.5 py-0.5 text-[9px] text-white/40">
        {version}
      </span>
      <span className="text-[9px] text-white/30">{scope}</span>
    </div>
  );
}
