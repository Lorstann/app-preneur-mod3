import type { PermissionKey } from "@/hooks/use-permissions";

export type AppRoute = {
  href: string;
  label: string;
  title: string;
  breadcrumb: string;
  permission?: PermissionKey;
};

export const appRoutes: AppRoute[] = [
  { href: "/dashboard", label: "Dashboard", title: "Dashboard", breadcrumb: "Home > Dashboard" },
  { href: "/documents", label: "Documents", title: "Documents", breadcrumb: "Home > Documents" },
  { href: "/upload", label: "Upload", title: "Secure Upload", breadcrumb: "Home > Upload", permission: "documents:upload" },
  { href: "/tasks", label: "Tasks", title: "Task Board", breadcrumb: "Home > Tasks" },
  { href: "/users", label: "Users", title: "User Management", breadcrumb: "Home > Users", permission: "users:create" },
];

export function getRouteMeta(pathname: string): AppRoute {
  const route = appRoutes.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));
  return route ?? { href: pathname, label: "Unknown", title: "Workspace", breadcrumb: "Home > Workspace" };
}
