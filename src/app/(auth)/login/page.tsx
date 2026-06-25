"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/callback` },
    });

    setSent(true);
    setLoading(false);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0B0F14] font-sans">
      <div className="w-full max-w-sm rounded-lg border border-[#1B2530] bg-[#11161D] p-8">
        <p className="mb-2 font-mono text-sm text-emerald-400">&gt;_ ProposalForge</p>
        <h1 className="mb-2 text-2xl font-bold text-white">Sign in</h1>
        <p className="mb-6 text-sm text-zinc-400">
          Enter your email to receive a magic link.
        </p>

        {sent ? (
          <div className="rounded-lg bg-emerald-400/10 p-4 text-center text-sm text-emerald-300">
            Check your email for the login link.
          </div>
        ) : (
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              className="w-full rounded-lg border border-[#1B2530] bg-[#0B0F14] px-4 py-2.5 text-sm text-white outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-gradient-to-r from-amber-400 to-rose-500 px-4 py-2.5 text-sm font-semibold text-[#0B0F14] disabled:opacity-50"
            >
              {loading ? "Sending..." : "Send magic link"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
