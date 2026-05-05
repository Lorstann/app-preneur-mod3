"use client";

import { FileText, Download, Search, Filter } from "lucide-react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import { useCurrentUserContext } from "@/components/shared/user-context-provider";

const docs = [
  { id: "DOC-001", title: "HR Policy Handbook", scope: "EMEA › Germany › HR", type: "pdf", version: 4, date: "2025-03-15", size: "2.4 MB" },
  { id: "DOC-002", title: "Payroll SOP", scope: "EMEA › Germany › Finance", type: "docx", version: 2, date: "2025-02-28", size: "318 KB" },
  { id: "DOC-003", title: "Q1 Risk Assessment", scope: "EMEA › Germany › Legal", type: "pdf", version: 1, date: "2025-01-10", size: "1.7 MB" },
  { id: "DOC-004", title: "Vendor Reconciliation Notes", scope: "EMEA › Germany › Finance", type: "docx", version: 3, date: "2025-04-02", size: "642 KB" },
];

const TYPE_STYLE: Record<string, string> = {
  pdf: "text-red-400/90 bg-red-400/8 border-red-400/15",
  docx: "text-blue-400/90 bg-blue-400/8 border-blue-400/15",
  doc: "text-violet-400/90 bg-violet-400/8 border-violet-400/15",
};

export default function DocumentsPage() {
  const userContext = useCurrentUserContext();
  const shouldReduceMotion = useReducedMotion();
  const [query, setQuery] = useState("");

  const filtered = docs.filter((d) => d.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-widest text-white/30">Documents</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">Scoped file browser</h1>
          <p className="mt-1 text-sm text-white/45">
            Showing files visible to <span className="text-white/70">{userContext?.scope.name ?? "—"}</span>
          </p>
        </div>
        <Link
          href="/upload"
          className="rounded-md bg-white px-3.5 py-1.5 text-sm font-medium text-black transition-colors hover:bg-white/90"
        >
          Upload document
        </Link>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-md border border-white/[0.06] bg-white/[0.02] px-3 py-2 focus-within:border-white/20">
          <Search className="h-3.5 w-3.5 text-white/30" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documents..."
            className="flex-1 bg-transparent text-sm text-white outline-none placeholder-white/30"
          />
        </div>
        <button className="flex items-center gap-1.5 rounded-md border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-sm text-white/65 transition-colors hover:border-white/15 hover:text-white">
          <Filter className="h-3.5 w-3.5" />
          Filter
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-white/[0.06]">
        <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 border-b border-white/[0.06] bg-white/[0.02] px-4 py-2 text-[10px] font-medium uppercase tracking-wider text-white/30">
          <div>Name</div>
          <div className="hidden sm:block">Scope</div>
          <div className="hidden md:block">Modified</div>
          <div>Version</div>
          <div></div>
        </div>
        <div className="divide-y divide-white/[0.04]">
          {filtered.map((doc, i) => (
            <motion.div
              key={doc.id}
              initial={shouldReduceMotion ? false : { opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, duration: 0.25 }}
              className="grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 px-4 py-3 transition-colors hover:bg-white/[0.025]"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md border ${TYPE_STYLE[doc.type] ?? "border-white/10"}`}>
                  <FileText className="h-3.5 w-3.5" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-white/90">{doc.title}</p>
                  <p className="text-[11px] text-white/35">
                    <span className="uppercase">{doc.type}</span> · {doc.size}
                  </p>
                </div>
              </div>
              <div className="hidden text-xs text-white/50 sm:block">{doc.scope}</div>
              <div className="hidden font-mono-tabular text-xs text-white/40 md:block">{doc.date}</div>
              <div className="rounded border border-white/[0.06] bg-white/[0.03] px-1.5 py-0.5 font-mono-tabular text-[11px] text-white/60">
                v{doc.version}
              </div>
              <button className="rounded-md p-1.5 text-white/30 transition-colors hover:bg-white/[0.06] hover:text-white/80">
                <Download className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ))}
          {filtered.length === 0 && (
            <div className="px-4 py-12 text-center text-sm text-white/35">No documents match your search.</div>
          )}
        </div>
      </div>
    </div>
  );
}
