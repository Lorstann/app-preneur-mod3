"use client";

import { useMemo } from "react";

import type { UserContext } from "@/types/scope";

type PermissionKey =
  | "users:create"
  | "users:update"
  | "documents:upload"
  | "documents:delete"
  | "tasks:assign"
  | "admin:settings";

const rolePermissions: Record<UserContext["role"], PermissionKey[]> = {
  Admin: ["users:create", "users:update", "documents:upload", "documents:delete", "tasks:assign", "admin:settings"],
  Director: ["users:create", "users:update", "documents:upload", "documents:delete", "tasks:assign"],
  Lead: ["documents:upload", "documents:delete", "tasks:assign"],
  Member: ["documents:upload"],
};

export function usePermissions(user: UserContext | null) {
  const permissions = useMemo(() => (user ? rolePermissions[user.role] : []), [user]);
  const hasPermission = (permission: PermissionKey) => permissions.includes(permission);
  return { hasPermission, permissions };
}

export type { PermissionKey };
