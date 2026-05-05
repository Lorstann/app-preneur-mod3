"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  LayoutDashboard,
  FileText,
  Upload,
  CheckSquare,
  Users,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { useClerk } from "@clerk/nextjs";

import { useCurrentUserContext } from "@/components/shared/user-context-provider";
import { usePermissions } from "@/hooks/use-permissions";
import { appRoutes, getRouteMeta } from "@/lib/route-config";
import { AgentChatWidget } from "@/components/shared/agent-chat-widget";

const ICONS: Record<string, LucideIcon> = {
  "/dashboard": LayoutDashboard,
  "/documents": FileText,
  "/upload": Upload,
  "/tasks": CheckSquare,
  "/users": Users,
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();
  const userContext = useCurrentUserContext();
  const routeMeta = getRouteMeta(pathname);
  const { hasPermission } = usePermissions(userContext);
  const { signOut } = useClerk();

  const isPublicShellBypass =
    pathname === "/" || pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up");

  if (isPublicShellBypass) return <>{children}</>;

  return (
    <div className="min-h-screen text-white">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[220px_1fr]">

        {/* Sidebar */}
        <aside className="sticky top-0 z-20 flex h-screen flex-col border-r border-white/[0.06] bg-[#0c0e14]">
          {/* Brand */}
          <div className="border-b border-white/[0.06] px-5 py-4">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-[11px] font-bold text-black">
                N
              </div>
              <div className="flex flex-col leading-tight">
                <span className="text-sm font-medium text-white">Nexus</span>
                <span className="text-[10px] text-white/35">Internal workspace</span>
              </div>
            </div>
          </div>

          {/* Workspace context */}
          <div className="border-b border-white/[0.06] px-3 py-3">
            <button className="w-full rounded-md border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-left transition-colors hover:border-white/15 hover:bg-white/[0.04]">
              <p className="text-[10px] uppercase tracking-wider text-white/30">Active scope</p>
              <p className="mt-0.5 truncate text-sm font-medium text-white/85">
                {userContext?.scope.name ?? "—"}
              </p>
              <p className="text-[10px] text-white/35">{userContext?.scope.type ?? "—"}</p>
            </button>
          </div>

          {/* Nav items */}
          <nav className="flex-1 overflow-y-auto p-2" aria-label="Main navigation">
            <p className="mb-1.5 px-3 pt-2 text-[10px] font-medium uppercase tracking-wider text-white/30">
              Workspace
            </p>
            <ul className="space-y-0.5">
              {appRoutes.map((item) => {
                if (item.permission && !hasPermission(item.permission)) return null;
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = ICONS[item.href] ?? LayoutDashboard;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="relative flex items-center gap-2.5 rounded-md px-3 py-1.5 text-sm transition-colors group"
                    >
                      {active && (
                        <motion.span
                          layoutId="nav-active-pill"
                          className="absolute inset-0 rounded-md bg-white/[0.06]"
                          transition={{ type: "spring", stiffness: 400, damping: 32 }}
                        />
                      )}
                      <Icon
                        className={`relative z-10 h-3.5 w-3.5 transition-colors ${
                          active ? "text-white/90" : "text-white/35 group-hover:text-white/65"
                        }`}
                      />
                      <span
                        className={`relative z-10 transition-colors ${
                          active ? "text-white/95 font-medium" : "text-white/55 group-hover:text-white/85"
                        }`}
                      >
                        {item.label}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User block */}
          {userContext && (
            <div className="border-t border-white/[0.06] p-3 space-y-1">
              <div className="flex items-center gap-2.5 rounded-md px-2 py-1.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[10px] font-semibold text-white/80">
                  {userContext.role.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-white/85">{userContext.role}</p>
                  <p className="truncate text-[10px] text-white/35">scope-locked</p>
                </div>
              </div>
              <button
                onClick={() => signOut({ redirectUrl: "/" })}
                className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-xs text-white/40 transition-colors hover:bg-white/[0.04] hover:text-white/80"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </button>
            </div>
          )}
        </aside>

        {/* Main area */}
        <div className="flex min-h-screen flex-col">
          {/* Topbar */}
          <header className="sticky top-0 z-10 border-b border-white/[0.06] bg-[#0b0d12]/80 backdrop-blur-md">
            <div className="flex items-center justify-between gap-4 px-6 py-3">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-white/30">{routeMeta.breadcrumb}</p>
                <h2 className="text-sm font-medium text-white/85">{routeMeta.title}</h2>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="hidden items-center gap-1 rounded-md border border-white/10 bg-white/[0.03] px-1.5 py-0.5 text-[10px] text-white/45 sm:inline-flex">
                  <span>⌘</span>K
                </kbd>
                <div className="flex items-center gap-1.5 rounded-md border border-emerald-400/20 bg-emerald-400/5 px-2 py-1 text-[10px] text-emerald-300/90">
                  <span className="h-1 w-1 rounded-full bg-emerald-400" />
                  Live
                </div>
              </div>
            </div>
          </header>

          {/* Floating agent chat widget */}
          <AgentChatWidget />

          {/* Page content with route transition */}
          <main className="flex-1 p-6 lg:p-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}
