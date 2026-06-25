import { notFound } from "next/navigation";
import { createPublicClient } from "@/lib/supabase-public";
import type { ProposalSection, PricingItem } from "@/lib/database.types";
import { SignBlock } from "./sign-block";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ token: string }>;
}

export default async function PublicProposalView({ params }: Props) {
  const { token } = await params;
  const sb = createPublicClient();

  const { data: proposal } = await sb
    .from("pf_proposals")
    .select("*")
    .eq("view_token", token)
    .in("status", ["sent", "viewed", "signed", "expired"])
    .maybeSingle();

  if (!proposal) notFound();

  const { data: items } = await sb
    .from("pf_pricing_items")
    .select("*")
    .eq("proposal_id", proposal.id)
    .order("sort_order");

  // Log a view event (best effort; ignore failures).
  await sb.from("pf_view_events").insert({
    proposal_id: proposal.id,
    event_type: "view",
  });
  if (proposal.status === "sent") {
    await sb.from("pf_proposals").update({ status: "viewed" }).eq("id", proposal.id);
  }

  const sections = (proposal.sections as unknown as ProposalSection[]) ?? [];
  const pricing: PricingItem[] = items ?? [];

  return (
    <main className="min-h-screen bg-[#0B0F14] text-zinc-200 font-sans">
      <div className="mx-auto max-w-2xl px-4 py-12">
        <header className="mb-8 border-b border-[#1B2530] pb-6">
          <p className="font-mono text-xs text-emerald-400">Proposal</p>
          <h1 className="text-2xl font-bold text-white">{proposal.title}</h1>
          <p className="text-sm text-zinc-500">
            Prepared for {proposal.client_name}
            {proposal.client_company ? ` at ${proposal.client_company}` : ""}
          </p>
        </header>

        <article className="space-y-6">
          {sections.map((s) => (
            <section key={s.id}>
              <h2 className="font-semibold text-white">{s.heading}</h2>
              <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-zinc-300">
                {s.body}
              </p>
            </section>
          ))}
        </article>

        {pricing.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-2 font-semibold text-white">Pricing</h2>
            <div className="overflow-hidden rounded-lg border border-[#1B2530]">
              {pricing.map((it, i) => (
                <div
                  key={it.id}
                  className={`flex items-center justify-between bg-[#11161D] px-4 py-3 ${
                    i === 0 ? "" : "border-t border-[#1B2530]"
                  }`}
                >
                  <span className="text-sm text-white">
                    {it.name} <span className="text-zinc-500">x{Number(it.quantity)}</span>
                  </span>
                  <span className="font-mono text-sm text-zinc-300">
                    {(Number(it.quantity) * Number(it.unit_price)).toLocaleString(undefined, {
                      style: "currency",
                      currency: proposal.currency || "USD",
                    })}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between border-t border-[#1B2530] bg-[#0B0F14] px-4 py-3">
                <span className="text-sm font-semibold text-white">Total</span>
                <span className="font-mono text-base font-bold text-amber-400">
                  {Number(proposal.total).toLocaleString(undefined, {
                    style: "currency",
                    currency: proposal.currency || "USD",
                  })}
                </span>
              </div>
            </div>
          </section>
        )}

        <section className="mt-10 border-t border-[#1B2530] pt-8">
          {proposal.status === "signed" ? (
            <p className="rounded-lg bg-emerald-400/10 px-5 py-4 text-sm text-emerald-300">
              Accepted and signed by {proposal.signer_name} on{" "}
              {proposal.signed_at ? new Date(proposal.signed_at).toLocaleDateString() : ""}.
            </p>
          ) : (
            <SignBlock token={token} />
          )}
        </section>

        <footer className="mt-12 text-center text-xs text-zinc-600">
          Powered by ProposalForge
        </footer>
      </div>
    </main>
  );
}
