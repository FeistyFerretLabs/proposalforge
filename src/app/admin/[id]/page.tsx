import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getUserId, getProposal, listPricingItems } from "@/lib/admin";
import { sendProposal } from "../actions";
import type { ProposalSection } from "@/lib/database.types";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ProposalEditor({ params }: Props) {
  const { id } = await params;
  const userId = await getUserId();
  if (!userId) redirect("/login");

  const proposal = await getProposal(userId, id);
  if (!proposal) notFound();

  const items = await listPricingItems(id);
  const sections = (proposal.sections as unknown as ProposalSection[]) ?? [];
  const isSent = proposal.status !== "draft";

  return (
    <main className="min-h-screen bg-[#0B0F14] text-zinc-200 font-sans">
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <Link href="/admin" className="font-mono text-xs text-zinc-500 hover:text-zinc-300">
              &lt; all proposals
            </Link>
            <h1 className="mt-1 text-2xl font-bold text-white">{proposal.title}</h1>
            <p className="text-sm text-zinc-500">
              {proposal.client_name}
              {proposal.client_company ? ` at ${proposal.client_company}` : ""}
            </p>
          </div>
          {isSent ? (
            <Link
              href={`/view/${proposal.view_token}`}
              className="rounded-lg border border-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-400"
            >
              View public link
            </Link>
          ) : (
            <form action={sendProposal}>
              <input type="hidden" name="proposalId" value={proposal.id} />
              <button
                type="submit"
                className="rounded-lg bg-gradient-to-r from-amber-400 to-rose-500 px-4 py-2 text-sm font-semibold text-[#0B0F14]"
              >
                Send proposal
              </button>
            </form>
          )}
        </div>

        {isSent && (
          <p className="mb-6 rounded-lg border border-[#1B2530] bg-[#11161D] px-4 py-3 font-mono text-xs text-zinc-400">
            Public link: /view/{proposal.view_token}
            {proposal.status === "signed" && (
              <span className="ml-2 text-emerald-400">Signed by {proposal.signer_name}</span>
            )}
          </p>
        )}

        {/* Generated proposal */}
        <section className="space-y-5">
          {sections.length === 0 ? (
            <p className="rounded-lg border border-[#1B2530] bg-[#11161D] p-5 text-sm text-zinc-400">
              No proposal body yet. (It is generated when you create the proposal with AI.)
            </p>
          ) : (
            sections.map((s) => (
              <div key={s.id} className="rounded-lg border border-[#1B2530] bg-[#11161D] p-5">
                <h2 className="font-semibold text-white">{s.heading}</h2>
                <p className="mt-1 whitespace-pre-line text-sm text-zinc-400">{s.body}</p>
              </div>
            ))
          )}
        </section>

        {/* Pricing */}
        {items.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Pricing
            </h2>
            <div className="overflow-hidden rounded-lg border border-[#1B2530]">
              {items.map((it, i) => (
                <div
                  key={it.id}
                  className={`flex items-center justify-between bg-[#11161D] px-4 py-3 ${
                    i === 0 ? "" : "border-t border-[#1B2530]"
                  }`}
                >
                  <span className="text-sm text-white">
                    {it.name}{" "}
                    <span className="text-zinc-500">x{Number(it.quantity)}</span>
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
                <span className="font-mono text-sm font-bold text-amber-400">
                  {Number(proposal.total).toLocaleString(undefined, {
                    style: "currency",
                    currency: proposal.currency || "USD",
                  })}
                </span>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
