"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Plus } from "lucide-react";
import { useCurrentUserContext } from "@/components/shared/user-context-provider";

type Task = { title: string; assignee?: string; due?: string; priority?: "low" | "med" | "high" };

const columns: Record<string, { tasks: Task[]; dot: string }> = {
  "Backlog": {
    tasks: [
      { title: "Prepare Q2 report", assignee: "SJ", due: "Apr 10" },
      { title: "Review legal update", assignee: "MC", priority: "low" },
    ],
    dot: "bg-white/30",
  },
  "In progress": {
    tasks: [
      { title: "Validate supplier contract", assignee: "AW", due: "Apr 7", priority: "high" },
    ],
    dot: "bg-blue-400",
  },
  "Review": {
    tasks: [
      { title: "Audit HR onboarding checklist", assignee: "SJ", priority: "med" },
    ],
    dot: "bg-amber-400",
  },
  "Done": {
    tasks: [
      { title: "Publish travel policy", assignee: "MC" },
    ],
    dot: "bg-emerald-400",
  },
};

const PRIORITY_COLOR: Record<string, string> = {
  high: "text-red-400/85 border-red-400/20 bg-red-400/8",
  med: "text-amber-400/85 border-amber-400/20 bg-amber-400/8",
  low: "text-white/45 border-white/10 bg-white/[0.02]",
};

export default function TasksPage() {
  const userContext = useCurrentUserContext();
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-widest text-white/30">Tasks</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white">Task board</h1>
        <p className="mt-1 text-sm text-white/45">
          Visible to <span className="text-white/70">{userContext?.scope.name ?? "—"}</span>
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {Object.entries(columns).map(([status, { tasks, dot }], colIdx) => (
          <motion.div
            key={status}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: colIdx * 0.06, duration: 0.3 }}
            className="rounded-lg border border-white/[0.06] bg-white/[0.015] p-3"
          >
            <div className="mb-3 flex items-center gap-2 px-1">
              <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
              <h3 className="text-[11px] font-medium uppercase tracking-wider text-white/55">{status}</h3>
              <span className="ml-auto rounded border border-white/[0.06] bg-white/[0.03] px-1.5 py-0.5 font-mono-tabular text-[10px] text-white/40">
                {tasks.length}
              </span>
            </div>
            <div className="space-y-2">
              {tasks.map((task) => (
                <motion.div
                  key={task.title}
                  whileHover={shouldReduceMotion ? undefined : { y: -1 }}
                  className="cursor-grab rounded-md border border-white/[0.06] bg-[#0e1117] p-3 transition-colors hover:border-white/20 active:cursor-grabbing"
                >
                  <p className="text-sm leading-snug text-white/90">{task.title}</p>
                  <div className="mt-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {task.priority && (
                        <span className={`rounded border px-1.5 py-0.5 text-[10px] font-medium uppercase ${PRIORITY_COLOR[task.priority]}`}>
                          {task.priority}
                        </span>
                      )}
                      {task.due && (
                        <span className="font-mono-tabular text-[10px] text-white/40">{task.due}</span>
                      )}
                    </div>
                    {task.assignee && (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[9px] font-semibold text-white/75">
                        {task.assignee}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
              <button className="flex w-full items-center justify-center gap-1 rounded-md border border-dashed border-white/[0.08] py-2 text-[11px] text-white/30 transition-colors hover:border-white/20 hover:text-white/55">
                <Plus className="h-3 w-3" />
                Add task
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
