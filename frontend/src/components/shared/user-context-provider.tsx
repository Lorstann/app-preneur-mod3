"use client";

import { createContext, useContext } from "react";

import type { UserContext } from "@/types/scope";

const UserContextState = createContext<UserContext | null>(null);

export function UserContextProvider({
  userContext,
  children,
}: {
  userContext: UserContext | null;
  children: React.ReactNode;
}) {
  return <UserContextState.Provider value={userContext}>{children}</UserContextState.Provider>;
}

export function useCurrentUserContext() {
  return useContext(UserContextState);
}
