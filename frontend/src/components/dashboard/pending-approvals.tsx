"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Inbox, FileText, ShieldCheck, ClipboardCheck } from "lucide-react";

type ApprovalKind = "document" | "policy" | "task";

type Approval = {
  id: string;
  kind: ApprovalKind;
  title: string;
  requester: string;
  scope: string;
  age: string;
  priority: "low" | "med" | "high";
};

const APPROVALS: Approval[] = [
  {
    id: "1",
    kind: "document",
    title: "Q3-Vendor-Audit-Report.pdf",
    requester: "Maria Costa",
    scope: "Compliance Team",
    age: "12m",
    priority: "high",
  },
  {
    id: "2",
    kind: "policy",
    title: "Updated data-retention policy v3",
    requester: "Daniel Park",
    scope: "Legal Department",
    age: "2h",
    priority: "med",
  },
  {
    id: "3",
    kind: "task",
    title: "Onboard new APAC payroll vendor",
    requester: "Lina Patel",
    scope: "HR / Payroll",
    age: "5h",
    priority: "med",
  },
  {
    id: "4",
    kind: "document",
    title: "FY26-Budget-Forecast.docx",
    requester: "Sarah Johnson",
    scope: "Finance / FP&A",
    age: "1d",
    priority: "low",
  },
];

const KIND_META: Record<ApprovalKind, { Icon: typeof FileText; label: string; tint: string }> = {
  document: { Icon: FileText,        label: "Document", tint: "text-blue-300/80    bg-blue-400/8    border-blue-400/15" },
  policy:   { Icon: ShieldCheck,     label: "Policy",   tint: "text-violet-300/80  bg-violet-400/8  border-violet-400/15" },
  task:     { Icon: ClipboardCheck,  label: "Task",     tint: "text-emerald-300/80 bg-emerald-400/8 border-emerald-400/15" },
};

const PRIORITY_DOT: Record<Approval["priority"], string> = {
  high: "bg-red-400",
  med:  "bg-amber-400",
  low:  "bg-white/30",
};

export function PendingApprovals({ scopeName }: { scopeName: string }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.28, duration: 0.35 }}
      className="rounded-lg border border-white/[0.06] bg-white/[0.02]"
    >
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
        <div className="flex items-center gap-2">
          <Inbox className="h-3.5 w-3.5 text-white/40" />
          <p className="text-sm font-medium text-white/85">Pending approvals</p>
          <span className="rounded-full border border-amber-400/25 bg-amber-400/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-300/90">
            {APPROVALS.length}
          </span>
        </div>
        <span className="rounded border border-white/[0.06] bg-white/[0.03] px-1.5 py-0.5 text-[10px] text-white/40">
          {scopeName}
        </span>
      </div>

      <div className="divide-y divide-white/[0.04]">
        {APPROVALS.map((a, i) => {
          const meta = KIND_META[a.kind];
          return (
            <motion.div
              key={a.id}
              initial={shouldReduceMotion ? false : { opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.33 + i * 0.04, duration: 0.3 }}
              className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white/[0.02]"
            >
              <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md border ${meta.tint}`}>
                <meta.Icon className="h-3 w-3" />
              </span>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`h-1.5 w-1.5 rounded-full ${PRIORITY_DOT[a.priority]}`} />
                  <p className="truncate text-sm text-white/85">{a.title}</p>
                </div>
                <p className="mt-0.5 truncate text-[11px] text-white/40">
                  {a.requester} <span className="text-white/20">·</span> {a.scope}
                </p>
              </div>

              <div className="flex flex-col items-end gap-1.5">
                <span className="font-mono-tabular text-[10px] text-white/30">{a.age} ago</span>
                <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    className="rounded border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] text-white/65 transition-colors hover:border-white/25 hover:text-white"
                  >
                    Review
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="border-t border-white/[0.04] px-4 py-2.5 text-center">
        <button
          type="button"
          className="text-[11px] text-white/45 transition-colors hover:text-white/80"
        >
          View all in queue →
        </button>
      </div>
    </motion.div>
  );
}
