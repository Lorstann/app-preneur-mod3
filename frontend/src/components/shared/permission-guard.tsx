"use client";

import type { ReactNode } from "react";

import { usePermissions, type PermissionKey } from "@/hooks/use-permissions";
import type { UserContext } from "@/types/scope";

type PermissionGuardProps = {
  user: UserContext | null;
  permission: PermissionKey;
  children: ReactNode;
};

export function PermissionGuard({ user, permission, children }: PermissionGuardProps) {
  const { hasPermission } = usePermissions(user);
  if (!hasPermission(permission)) {
    return null;
  }
  return <>{children}</>;
}
