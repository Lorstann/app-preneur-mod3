import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function SignInPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-6">
      <div className="absolute left-6 top-6">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-white/40 transition-colors hover:text-white/85">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </Link>
      </div>

      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-md bg-white text-sm font-bold text-black">
          N
        </div>
        <p className="text-[11px] font-medium uppercase tracking-widest text-white/30">Nexus</p>
        <h1 className="mt-1 text-lg font-semibold text-white">Sign in to your workspace</h1>
      </div>

      <SignIn forceRedirectUrl="/dashboard" />
    </div>
  );
}
