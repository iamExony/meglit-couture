"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useCustomerAuth } from "@/context/CustomerAuthContext";

function SignInInner() {
  const { customer, gisReady, renderButton } = useCustomerAuth();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/account";
  const buttonRef = useRef(null);
  const [missingClient, setMissingClient] = useState(false);

  // Once authenticated, leave the sign-in page.
  useEffect(() => {
    if (customer) router.replace(next);
  }, [customer, next, router]);

  // Render the official Google button.
  useEffect(() => {
    if (!gisReady || !buttonRef.current) return;
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setMissingClient(true);
      return;
    }
    renderButton(buttonRef.current, { width: 320, text: "signin_with" });
  }, [gisReady, renderButton]);

  return (
    <div className="min-h-[70vh] bg-brand-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white border border-brand-100 rounded-xl shadow-sm p-8 sm:p-10">
        <div className="text-center mb-8">
          <div className="font-heading text-2xl font-bold text-brand-950 tracking-[0.08em]">MEGLIT</div>
          <div className="text-[10px] tracking-[0.35em] text-accent-600 uppercase font-medium mt-1">Couture</div>
        </div>

        <h1 className="text-xl font-semibold text-brand-950 text-center mb-2">Welcome</h1>
        <p className="text-sm text-ink-500 text-center mb-8">
          Sign in to continue. We'll keep your cart, favorites, and orders in one place.
        </p>

        <div className="flex justify-center">
          {missingClient ? (
            <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg p-3 text-center">
              Google sign-in is not configured. Add <code>NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> to your .env.local and restart.
            </div>
          ) : (
            <div ref={buttonRef} aria-label="Sign in with Google" />
          )}
        </div>

        {!gisReady && !missingClient && (
          <div className="text-xs text-ink-400 text-center mt-4">Loading Google sign-in…</div>
        )}

        <div className="text-[11px] text-ink-400 text-center mt-8">
          By continuing you agree to our{" "}
          <Link href="/terms" className="underline hover:text-brand-700">Terms</Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline hover:text-brand-700">Privacy Policy</Link>.
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh]" />}>
      <SignInInner />
    </Suspense>
  );
}
