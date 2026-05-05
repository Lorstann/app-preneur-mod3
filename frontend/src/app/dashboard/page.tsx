"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  FileText,
  Upload as UploadIcon,
  CheckSquare,
  Users as UsersIcon,
  ArrowUpRight,
  Activity,
  Clock,
  Sparkles,
} from "lucide-react";

import { PermissionGuard } from "@/components/shared/permission-guard";
import { DashboardChart } from "@/components/dashboard/dashboard-chart";
import { ScopeKpiCard } from "@/components/dashboard/scope-kpi-card";
import { DocumentTrendChart } from "@/components/dashboard/document-trend-chart";
import { TaskStatusChart } from "@/components/dashboard/task-status-chart";
import { StorageBreakdown } from "@/components/dashboard/storage-breakdown";
import { TopContributors } from "@/components/dashboard/top-contributors";
import { PendingApprovals } from "@/components/dashboard/pending-approvals";
import { useCurrentUserContext } from "@/components/shared/user-context-provider";

const quickLinks = [
  { href: "/documents", label: "Documents", desc: "Browse scoped files and versions.", Icon: FileText },
  { href: "/upload", label: "Upload", desc: "Upload .pdf, .docx, and .doc files.", Icon: UploadIcon },
  { href: "/tasks", label: "Tasks", desc: "Manage workflows across your scope.", Icon: CheckSquare },
  { href: "/users", label: "Users", desc: "Invite and manage subordinates.", Icon: UsersIcon },
];

const recentActivity = [
  { time: "2m ago", action: "Sarah Johnson uploaded", target: "Q3-Finance-Report.pdf" },
  { time: "18m ago", action: "Alex Weber updated", target: "Reconciliation-SOP.docx" },
  { time: "1h ago", action: "Maria Costa completed", target: "Vendor audit task" },
  { time: "2h ago", action: "Daniel Park reviewed", target: "Compliance-Policy-v3" },
  { time: "3h ago", action: "System rotated keys for", target: "scope_de_finance" },
  { time: "5h ago", action: "Lina Patel created", target: "Onboarding-Checklist.docx" },
];

export default function DashboardPage() {
  const userContext = useCurrentUserContext();
  const shouldReduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Middleware (proxy.ts) protects this route — null context means session is
  // still propagating after sign-in. Show a spinner instead of redirecting.
  if (!mounted || !userContext) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/10 border-t-white/60" />
          <p className="text-xs text-white/35">Loading workspace…</p>
        </div>
      </div>
    );
  }

  const scopeName = userContext.scope.name;
  const role = userContext.role;
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric",
  });

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-wrap items-end justify-between gap-4"
      >
        <div>
          <p className="text-[11px] font-medium uppercase tracking-widest text-white/30">{today}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">Overview</h1>
          <p className="mt-1 text-sm text-white/45">
            Showing data scoped to <span className="text-white/70">{scopeName}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-[11px] text-white/55">
            {role}
          </span>
          <span className="flex items-center gap-1.5 rounded-md border border-emerald-400/20 bg-emerald-400/5 px-2 py-1 text-[11px] text-emerald-300/90">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Live
          </span>
        </div>
      </motion.div>

      {/* ── KPI strip (4 cards) ────────────────────────────────────── */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <ScopeKpiCard title="Active tasks"      value="184"     trend="+6% this week"      scopeName={scopeName} index={0} />
        <ScopeKpiCard title="Documents"         value="12942"   trend="+2.4% this month"   scopeName={scopeName} index={1} />
        <ScopeKpiCard title="Storage used"      value="1.9 TB"  trend="+110 GB this month" scopeName={scopeName} index={2} />
        <ScopeKpiCard title="AI agent queries"  value="847"     trend="+18% this week"     scopeName={scopeName} index={3} />
      </section>

      {/* ── Row 1: Document trends (2/3) + Task pipeline (1/3) ─────── */}
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <DocumentTrendChart scopeName={scopeName} />
        </div>
        <TaskStatusChart scopeName={scopeName} />
      </section>

      {/* ── Row 2: Documents pie + Storage breakdown ───────────────── */}
      <section className="grid gap-4 lg:grid-cols-2">
        <DashboardChart scopeName={scopeName} />
        <StorageBreakdown scopeName={scopeName} />
      </section>

      {/* ── Row 3: Top contributors + Pending approvals ────────────── */}
      <section className="grid gap-4 lg:grid-cols-2">
        <TopContributors scopeName={scopeName} />
        <PendingApprovals scopeName={scopeName} />
      </section>

      {/* ── Row 4: Quick actions + Recent activity ─────────────────── */}
      <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Quick Access */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium text-white/80">Quick actions</p>
            <PermissionGuard user={userContext} permission="users:create">
              <motion.button
                whileHover={shouldReduceMotion ? undefined : { y: -1 }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
                className="rounded-md border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-white/70 transition-colors hover:border-white/25 hover:text-white"
              >
                Invite team member
              </motion.button>
            </PermissionGuard>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {quickLinks.map((item, i) => (
              <motion.div
                key={item.href}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + i * 0.04, duration: 0.3 }}
              >
                <Link
                  href={item.href}
                  className="group flex items-start gap-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-4 transition-all hover:border-white/15 hover:bg-white/[0.04]"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-white/[0.08] bg-white/[0.03] transition-colors group-hover:border-white/15">
                    <item.Icon className="h-3.5 w-3.5 text-white/60 transition-colors group-hover:text-white/90" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-white/85">{item.label}</p>
                      <ArrowUpRight className="h-3.5 w-3.5 text-white/20 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-white/60" />
                    </div>
                    <p className="mt-0.5 text-xs text-white/40">{item.desc}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Agent shortcut hint */}
          <motion.div
            initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.35 }}
            className="mt-3 flex items-center gap-3 rounded-lg border border-white/[0.06] bg-gradient-to-r from-blue-500/[0.04] to-violet-500/[0.04] p-4"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/[0.04]">
              <Sparkles className="h-3.5 w-3.5 text-blue-300/85" />
            </span>
            <div className="flex-1">
              <p className="text-sm font-medium text-white/85">Ask the agent</p>
              <p className="mt-0.5 text-xs text-white/45">
                Get answers strictly from documents in <span className="text-white/65">{scopeName}</span>.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Recent activity */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.35 }}
          className="rounded-lg border border-white/[0.06] bg-white/[0.02]"
        >
          <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-3">
            <Activity className="h-3.5 w-3.5 text-white/40" />
            <p className="text-sm font-medium text-white/80">Recent activity</p>
          </div>
          <div className="divide-y divide-white/[0.04]">
            {recentActivity.map((entry) => (
              <div key={entry.target + entry.time} className="px-4 py-3">
                <div className="flex items-center gap-1.5 text-[10px] text-white/30">
                  <Clock className="h-2.5 w-2.5" />
                  {entry.time}
                </div>
                <p className="mt-1 text-xs leading-relaxed text-white/65">
                  {entry.action} <span className="text-white/85">{entry.target}</span>
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  );
}
