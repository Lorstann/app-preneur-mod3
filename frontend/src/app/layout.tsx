import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import { AppShell } from "@/components/shared/app-shell";
import { UserContextProvider } from "@/components/shared/user-context-provider";
import { getServerUserContext } from "@/lib/user-context";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Corporate Nexus",
  description: "Hierarchical RBAC document and task management system",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const userContext = await getServerUserContext();

  return (
    <ClerkProvider>
      <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
        <body className="min-h-full flex flex-col">
          <UserContextProvider userContext={userContext}>
            <AppShell>{children}</AppShell>
          </UserContextProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
