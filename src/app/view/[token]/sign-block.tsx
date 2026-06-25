"use client";

import { useState } from "react";

export function SignBlock({ token }: { token: string }) {
  const [name, setName] = useState("");
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sign() {
    if (!name.trim()) {
      setError("Type your full name to sign.");
      return;
    }
    setError(null);
    setSigning(true);
    try {
      const res = await fetch("/api/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, signerName: name }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not record signature.");
        return;
      }
      setSigned(true);
    } catch {
      setError("Could not record signature. Check your connection.");
    } finally {
      setSigning(false);
    }
  }

  if (signed) {
    return (
      <p className="rounded-lg bg-emerald-400/10 px-5 py-4 text-sm text-emerald-300">
        Thank you, {name}. Your acceptance has been recorded.
      </p>
    );
  }

  return (
    <div className="rounded-lg border border-[#1B2530] bg-[#11161D] p-5">
      <h2 className="font-semibold text-white">Accept and sign</h2>
      <p className="mb-3 text-sm text-zinc-400">
        Type your full name to accept this proposal. Your signature is recorded with a timestamp.
      </p>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your full name"
        className="mb-3 w-full rounded-lg border border-[#1B2530] bg-[#0B0F14] px-4 py-2.5 text-sm text-white outline-none focus:border-amber-400"
      />
      {error && <p className="mb-3 text-sm text-rose-400">{error}</p>}
      <button
        onClick={sign}
        disabled={signing}
        className="rounded-lg bg-gradient-to-r from-amber-400 to-rose-500 px-6 py-2.5 text-sm font-semibold text-[#0B0F14] disabled:opacity-50"
      >
        {signing ? "Recording..." : "Accept and sign"}
      </button>
    </div>
  );
}
