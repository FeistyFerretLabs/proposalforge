"use client";

import { useState } from "react";
import { createProposal } from "../actions";
import type { ProposalSection } from "@/lib/database.types";

interface LineItem {
  name: string;
  quantity: number;
  unitPrice: number;
  isOptional: boolean;
}

export function ProposalForm() {
  const [clientName, setClientName] = useState("");
  const [clientCompany, setClientCompany] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [items, setItems] = useState<LineItem[]>([
    { name: "", quantity: 1, unitPrice: 0, isOptional: false },
  ]);
  const [sections, setSections] = useState<ProposalSection[]>([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateItem(i: number, patch: Partial<LineItem>) {
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  }
  function addItem() {
    setItems((prev) => [...prev, { name: "", quantity: 1, unitPrice: 0, isOptional: false }]);
  }

  async function generate() {
    if (!clientName.trim() || !projectName.trim()) {
      setError("Add a client name and project name first.");
      return;
    }
    setError(null);
    setGenerating(true);
    try {
      const res = await fetch("/api/ai/generate-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName,
          clientCompany,
          projectName,
          projectDescription,
          lineItems: items.filter((i) => i.name.trim()),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "AI generation failed. Is ANTHROPIC_API_KEY set?");
        return;
      }
      setSections(data.sections);
    } catch {
      setError("AI generation failed. Check your connection.");
    } finally {
      setGenerating(false);
    }
  }

  const total = items
    .filter((i) => i.name.trim())
    .reduce((s, i) => s + i.quantity * i.unitPrice, 0);

  const input =
    "w-full rounded-lg border border-[#1B2530] bg-[#0B0F14] px-4 py-2.5 text-sm text-white outline-none focus:border-amber-400";

  return (
    <form action={createProposal} className="space-y-8">
      <input type="hidden" name="title" value={projectName || "Untitled proposal"} />
      <input type="hidden" name="clientName" value={clientName} />
      <input type="hidden" name="clientCompany" value={clientCompany} />
      <input type="hidden" name="clientEmail" value={clientEmail} />
      <input type="hidden" name="projectName" value={projectName} />
      <input type="hidden" name="projectDescription" value={projectDescription} />
      <input type="hidden" name="sections" value={JSON.stringify(sections)} />
      <input
        type="hidden"
        name="lineItems"
        value={JSON.stringify(items.filter((i) => i.name.trim()))}
      />

      {/* Deal details */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Deal details
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <input className={input} placeholder="Client name" value={clientName} onChange={(e) => setClientName(e.target.value)} />
          <input className={input} placeholder="Client company" value={clientCompany} onChange={(e) => setClientCompany(e.target.value)} />
          <input className={input} placeholder="Client email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} />
          <input className={input} placeholder="Project name" value={projectName} onChange={(e) => setProjectName(e.target.value)} />
        </div>
        <textarea className={input} rows={2} placeholder="Project description (1 to 2 sentences)" value={projectDescription} onChange={(e) => setProjectDescription(e.target.value)} />
      </section>

      {/* Pricing */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Pricing</h2>
        {items.map((it, i) => (
          <div key={i} className="grid grid-cols-12 gap-2">
            <input className={`${input} col-span-6`} placeholder="Line item" value={it.name} onChange={(e) => updateItem(i, { name: e.target.value })} />
            <input className={`${input} col-span-2`} type="number" min={0} placeholder="Qty" value={it.quantity} onChange={(e) => updateItem(i, { quantity: Number(e.target.value) })} />
            <input className={`${input} col-span-4`} type="number" min={0} placeholder="Unit price" value={it.unitPrice} onChange={(e) => updateItem(i, { unitPrice: Number(e.target.value) })} />
          </div>
        ))}
        <div className="flex items-center justify-between">
          <button type="button" onClick={addItem} className="text-sm text-emerald-400">
            + add line item
          </button>
          <span className="font-mono text-sm text-amber-400">
            Total: {total.toLocaleString(undefined, { style: "currency", currency: "USD" })}
          </span>
        </div>
      </section>

      {/* AI generate */}
      <section className="space-y-3">
        <button
          type="button"
          onClick={generate}
          disabled={generating}
          className="rounded-lg border border-emerald-500 px-5 py-2.5 text-sm font-semibold text-emerald-400 disabled:opacity-50"
        >
          {generating ? "Writing the proposal..." : ">_ Generate with AI"}
        </button>
        {error && <p className="text-sm text-rose-400">{error}</p>}

        {sections.length > 0 && (
          <div className="space-y-4 rounded-lg border border-[#1B2530] bg-[#11161D] p-5">
            {sections.map((s) => (
              <div key={s.id}>
                <h3 className="font-semibold text-white">{s.heading}</h3>
                <p className="mt-1 whitespace-pre-line text-sm text-zinc-400">{s.body}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      <button
        type="submit"
        className="rounded-lg bg-gradient-to-r from-amber-400 to-rose-500 px-6 py-3 text-sm font-semibold text-[#0B0F14]"
      >
        Save proposal
      </button>
    </form>
  );
}
