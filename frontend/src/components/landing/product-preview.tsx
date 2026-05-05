"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  Upload as UploadIcon,
  CheckSquare,
  Users as UsersIcon,
  Search,
  Filter,
  CloudUpload,
  CheckCircle2,
  Loader2,
} from "lucide-react";

type TabId = "dashboard" | "documents" | "upload" | "tasks" | "users";

const TABS: Array<{ id: TabId; label: string; Icon: typeof FileText; path: string }> = [
  { id: "dashboard", label: "Dashboard", Icon: LayoutDashboard, path: "/dashboard" },
  { id: "documents", label: "Documents", Icon: FileText,        path: "/documents" },
  { id: "upload",    label: "Upload",    Icon: UploadIcon,      path: "/upload"    },
  { id: "tasks",     label: "Tasks",     Icon: CheckSquare,     path: "/tasks"     },
  { id: "users",     label: "Users",     Icon: UsersIcon,       path: "/users"     },
];

export function ProductPreview() {
  const shouldReduceMotion = useReducedMotion();
  const [active, setActive] = useState<TabId>("dashboard");
  const activeTab = TABS.find((t) => t.id === active)!;

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="relative overflow-hidden rounded-xl border border-white/10 bg-[#0e1117]"
    >
      {/* Window chrome */}
      <div className="flex items-center gap-1.5 border-b border-white/[0.06] px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        <div className="ml-3 flex items-center gap-1.5 rounded-md bg-white/[0.04] px-2.5 py-1 text-[11px] text-white/40">
          <span className="h-1 w-1 rounded-full bg-emerald-400" />
          <span className="font-mono-tabular">app.nexus.internal{activeTab.path}</span>
        </div>
        <span className="ml-auto hidden text-[10px] text-white/25 sm:inline">
          Click any module on the left ↓
        </span>
      </div>

      {/* App body */}
      <div className="grid grid-cols-[180px_1fr]">
        {/* Sidebar (clickable) */}
        <div className="border-r border-white/[0.06] bg-white/[0.015] px-3 py-4">
          <div className="mb-3 px-2 text-[10px] font-medium uppercase tracking-wider text-white/25">
            Workspace
          </div>
          <div className="space-y-0.5">
            {TABS.map((t) => {
              const isActive = t.id === active;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActive(t.id)}
                  className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[11px] transition-colors ${
                    isActive
                      ? "bg-white/[0.06] text-white/90"
                      : "text-white/45 hover:bg-white/[0.03] hover:text-white/70"
                  }`}
                >
                  <t.Icon className={`h-3 w-3 ${isActive ? "text-white/80" : "text-white/30"}`} />
                  {t.label}
                  {isActive && (
                    <motion.span
                      layoutId="preview-active-dot"
                      className="ml-auto h-1 w-1 rounded-full bg-emerald-400"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Scope chip */}
          <div className="mt-6 rounded-md border border-white/[0.06] bg-white/[0.02] p-2.5">
            <div className="text-[9px] font-medium uppercase tracking-wider text-white/30">
              Active scope
            </div>
            <div className="mt-1 text-[11px] text-white/75">EMEA · Germany</div>
            <div className="text-[10px] text-white/40">Finance · AP Team</div>
          </div>
        </div>

        {/* Right pane (animated) */}
        <div className="relative min-h-[320px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: -8 }}
              transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
              className="p-5"
            >
              {active === "dashboard" && <PaneDashboard />}
              {active === "documents" && <PaneDocuments />}
              {active === "upload"    && <PaneUpload />}
              {active === "tasks"     && <PaneTasks />}
              {active === "users"     && <PaneUsers />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Soft top fade */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
    </motion.div>
  );
}

// ── Reusable header ────────────────────────────────────────────────────────

function PaneHeader({
  crumbs, title, badge,
}: {
  crumbs: string;
  title: string;
  badge?: string;
}) {
  return (
    <div className="mb-4 flex items-center justify-between">
      <div>
        <div className="text-[11px] uppercase tracking-wider text-white/25">{crumbs}</div>
        <div className="mt-1 text-sm font-medium text-white/85">{title}</div>
      </div>
      {badge && (
        <div className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] text-white/40">
          {badge}
        </div>
      )}
    </div>
  );
}

// ── Dashboard pane ─────────────────────────────────────────────────────────

function PaneDashboard() {
  const KPIS = [
    { label: "Active tasks", val: "184",    trend: "+6%" },
    { label: "Documents",    val: "12,942", trend: "+2.4%" },
    { label: "Storage",      val: "1.9 TB", trend: "+110 GB" },
  ];
  const FILES = [
    { t: "Q3-Finance-Report.pdf",     scope: "DE › Finance",   v: "v4" },
    { t: "Reconciliation-SOP.docx",   scope: "DE › AP Team",   v: "v2" },
    { t: "Vendor-Audit-Notes.pdf",    scope: "DE › Finance",   v: "v1" },
  ];

  return (
    <>
      <PaneHeader crumbs="EMEA · Germany · Finance" title="Active scope summary" badge="Director" />

      <div className="grid grid-cols-3 gap-2.5">
        {KPIS.map((k) => (
          <div key={k.label} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
            <div className="text-[10px] text-white/35">{k.label}</div>
            <div className="mt-0.5 font-mono-tabular text-base font-semibold text-white">{k.val}</div>
            <div className="mt-0.5 text-[10px] text-emerald-400/80">{k.trend}</div>
          </div>
        ))}
      </div>

      <div className="mt-3 space-y-1.5">
        {FILES.map((d) => (
          <div key={d.t} className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-white/[0.03]">
            <div className="flex items-center gap-2">
              <FileText className="h-3 w-3 text-white/30" />
              <span className="text-[11px] text-white/70">{d.t}</span>
            </div>
            <div className="flex items-center gap-2.5 text-[10px] text-white/30">
              <span>{d.scope}</span>
              <span className="rounded bg-white/[0.04] px-1.5 py-0.5">{d.v}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ── Documents pane ─────────────────────────────────────────────────────────

function PaneDocuments() {
  const ROWS = [
    { name: "Q3-Finance-Report.pdf",   owner: "S. Johnson", scope: "DE › Finance",   v: "v4", date: "2h ago" },
    { name: "Reconciliation-SOP.docx", owner: "A. Weber",   scope: "DE › AP Team",   v: "v2", date: "1d ago" },
    { name: "Vendor-Audit-Notes.pdf",  owner: "M. Costa",   scope: "DE › Finance",   v: "v1", date: "3d ago" },
    { name: "Tax-Filing-FY26.docx",    owner: "S. Johnson", scope: "DE › Finance",   v: "v3", date: "1w ago" },
    { name: "Onboarding-Checklist.pdf",owner: "L. Patel",   scope: "DE › HR",        v: "v2", date: "2w ago" },
  ];

  return (
    <>
      <PaneHeader crumbs="EMEA · Germany · Finance" title="Documents in scope" badge="247 files" />

      {/* search + filter */}
      <div className="mb-3 flex items-center gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-md border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5">
          <Search className="h-3 w-3 text-white/30" />
          <span className="text-[11px] text-white/30">Search documents in your scope…</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-md border border-white/[0.06] bg-white/[0.02] px-2.5 py-1.5 text-[11px] text-white/45">
          <Filter className="h-3 w-3" /> Type · Scope · Date
        </div>
      </div>

      {/* table head */}
      <div className="grid grid-cols-[1fr_90px_90px_60px] gap-3 border-b border-white/[0.05] pb-1.5 text-[10px] uppercase tracking-wider text-white/25">
        <span>Name</span>
        <span>Owner</span>
        <span>Scope</span>
        <span className="text-right">Ver</span>
      </div>

      {/* rows */}
      <div className="divide-y divide-white/[0.04]">
        {ROWS.map((r) => (
          <div
            key={r.name}
            className="grid grid-cols-[1fr_90px_90px_60px] items-center gap-3 py-1.5 hover:bg-white/[0.02]"
          >
            <div className="flex min-w-0 items-center gap-2">
              <FileText className="h-3 w-3 shrink-0 text-white/30" />
              <span className="truncate text-[11px] text-white/75">{r.name}</span>
              <span className="ml-auto text-[10px] text-white/25">{r.date}</span>
            </div>
            <span className="truncate text-[11px] text-white/45">{r.owner}</span>
            <span className="truncate text-[10px] text-white/35">{r.scope}</span>
            <span className="text-right">
              <span className="rounded bg-white/[0.04] px-1.5 py-0.5 text-[10px] text-white/55">{r.v}</span>
            </span>
          </div>
        ))}
      </div>
    </>
  );
}

// ── Upload pane ────────────────────────────────────────────────────────────

function PaneUpload() {
  return (
    <>
      <PaneHeader crumbs="EMEA · Germany · Finance" title="Upload to scope" badge=".pdf · .docx · .doc" />

      {/* drop zone */}
      <div className="mb-3 flex flex-col items-center justify-center rounded-lg border border-dashed border-white/15 bg-white/[0.015] py-8">
        <CloudUpload className="h-6 w-6 text-white/40" />
        <p className="mt-2 text-[12px] text-white/70">Drop files here</p>
        <p className="text-[10px] text-white/35">or click to browse · max 50 MB · scope-tagged on upload</p>
        <div className="mt-3 flex gap-1.5">
          {["PDF", "DOCX", "DOC"].map((t) => (
            <span
              key={t}
              className="rounded border border-white/10 bg-white/[0.03] px-1.5 py-0.5 text-[10px] text-white/45"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* in-flight */}
      <div className="space-y-1.5">
        <div className="rounded-md border border-white/[0.06] bg-white/[0.02] px-3 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Loader2 className="h-3 w-3 animate-spin text-blue-400/80" />
              <span className="text-[11px] text-white/75">Q4-Forecast-Draft.pdf</span>
            </div>
            <span className="text-[10px] text-white/35">3.2 / 4.1 MB</span>
          </div>
          <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/[0.05]">
            <div className="h-full w-[78%] rounded-full bg-blue-400/80" />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-md border border-white/[0.06] bg-white/[0.015] px-3 py-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-3 w-3 text-emerald-400/85" />
            <span className="text-[11px] text-white/75">Audit-Schedule-Q3.docx</span>
            <span className="rounded bg-white/[0.04] px-1.5 py-0.5 text-[10px] text-white/45">Tagged DE › Finance</span>
          </div>
          <span className="text-[10px] text-white/30">Just now</span>
        </div>
      </div>
    </>
  );
}

// ── Tasks pane ─────────────────────────────────────────────────────────────

function PaneTasks() {
  const COLS = [
    {
      title: "To do",
      color: "text-white/55",
      cards: [
        { t: "Review Q3 vendor audit",    a: "MC", tag: "Compliance" },
        { t: "Reconcile EU bank feeds",   a: "AW", tag: "Finance"    },
      ],
    },
    {
      title: "In progress",
      color: "text-blue-300/85",
      cards: [
        { t: "Update retention policy",   a: "DP", tag: "Legal"      },
        { t: "Onboard APAC payroll",      a: "LP", tag: "HR"         },
        { t: "Migrate Q3 invoices to S3", a: "SJ", tag: "Finance"    },
      ],
    },
    {
      title: "Done",
      color: "text-emerald-300/85",
      cards: [
        { t: "Close FY25 books",          a: "SJ", tag: "Finance"    },
        { t: "Quarterly access review",   a: "MC", tag: "Compliance" },
      ],
    },
  ];

  return (
    <>
      <PaneHeader crumbs="EMEA · Germany · Finance" title="Active tasks" badge="184 open" />

      <div className="grid grid-cols-3 gap-2">
        {COLS.map((col) => (
          <div key={col.title} className="rounded-md border border-white/[0.06] bg-white/[0.015] p-2">
            <div className={`mb-1.5 flex items-center justify-between text-[10px] font-medium uppercase tracking-wider ${col.color}`}>
              <span>{col.title}</span>
              <span className="text-white/25">{col.cards.length}</span>
            </div>
            <div className="space-y-1.5">
              {col.cards.map((c) => (
                <div key={c.t} className="rounded border border-white/[0.05] bg-white/[0.025] p-1.5">
                  <p className="text-[10px] leading-tight text-white/80">{c.t}</p>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="rounded bg-white/[0.04] px-1 py-0.5 text-[9px] text-white/40">
                      {c.tag}
                    </span>
                    <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-gradient-to-br from-blue-400/30 to-violet-400/25 text-[8px] font-medium text-white/85">
                      {c.a}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ── Users pane ─────────────────────────────────────────────────────────────

function PaneUsers() {
  const ROWS = [
    { n: "Sarah Johnson",  i: "SJ", r: "Director",   s: "DE › Finance",        accent: "from-blue-400/25 to-violet-400/20" },
    { n: "Alex Weber",     i: "AW", r: "Lead",       s: "DE › Finance › AP",   accent: "from-violet-400/25 to-fuchsia-400/20" },
    { n: "Maria Costa",    i: "MC", r: "Lead",       s: "DE › Compliance",     accent: "from-emerald-400/25 to-teal-400/20" },
    { n: "Daniel Park",    i: "DP", r: "Member",     s: "DE › Legal",          accent: "from-amber-400/25 to-orange-400/20" },
    { n: "Lina Patel",     i: "LP", r: "Member",     s: "DE › HR › Payroll",   accent: "from-cyan-400/25 to-blue-400/20" },
  ];

  const ROLE_TINT: Record<string, string> = {
    Director: "border-violet-400/25 bg-violet-400/8 text-violet-300/85",
    Lead:     "border-blue-400/25   bg-blue-400/8   text-blue-300/85",
    Member:   "border-white/10      bg-white/[0.03] text-white/55",
  };

  return (
    <>
      <PaneHeader crumbs="EMEA · Germany · Finance" title="Team roster" badge="14 members" />

      <div className="grid grid-cols-[1fr_80px_140px] gap-3 border-b border-white/[0.05] pb-1.5 text-[10px] uppercase tracking-wider text-white/25">
        <span>Member</span>
        <span>Role</span>
        <span>Scope</span>
      </div>

      <div className="divide-y divide-white/[0.04]">
        {ROWS.map((u) => (
          <div key={u.n} className="grid grid-cols-[1fr_80px_140px] items-center gap-3 py-1.5">
            <div className="flex min-w-0 items-center gap-2">
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br ${u.accent} text-[9px] font-medium text-white/85`}
              >
                {u.i}
              </span>
              <span className="truncate text-[11px] text-white/75">{u.n}</span>
            </div>
            <span className={`w-fit rounded border px-1.5 py-0.5 text-[9px] font-medium ${ROLE_TINT[u.r]}`}>
              {u.r}
            </span>
            <span className="truncate text-[10px] text-white/40">{u.s}</span>
          </div>
        ))}
      </div>
    </>
  );
}
