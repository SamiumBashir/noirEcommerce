"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function RegisterRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect");

  useEffect(() => {
    const target = redirectTarget
      ? `/login?mode=signup&redirect=${encodeURIComponent(redirectTarget)}`
      : `/login?mode=signup`;
    router.replace(target);
  }, [router, redirectTarget]);

  return (
    <div className="min-h-screen bg-[#1b1b1b] flex items-center justify-center text-xs font-mono text-white/70 uppercase tracking-widest">
      Redirecting to Atelier Registration...
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#1b1b1b] flex items-center justify-center text-xs font-mono text-white/70 uppercase tracking-widest">
          Loading...
        </div>
      }
    >
      <RegisterRedirect />
    </Suspense>
  );
}
