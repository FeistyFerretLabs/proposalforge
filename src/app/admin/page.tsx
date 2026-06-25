import Link from "next/link";
import { redirect } from "next/navigation";
import { getUserId, listProposals } from "@/lib/admin";

export const dynamic = "force-dynamic";

const STATUS_STYLE: Record<string, string> = {
  draft: "bg-zinc-700/40 text-zinc-400",
  sent: "bg-amber-400/10 text-amber-300",
  viewed: "bg-sky-400/10 text-sky-300",
  signed: "bg-emerald-400/10 text-emerald-300",
  expired: "bg-rose-400/10 text-rose-300",
};

export default async function AdminHome() {
  const userId = await getUserId();
  if (!userId) redirect("/login");

  const proposals = await listProposals(userId);

  return (
    <main className="min-h-screen bg-[#0B0F14] text-zinc-200 font-sans">
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="font-mono text-sm text-emerald-400">&gt;_ ProposalForge</p>
            <h1 className="text-2xl font-bold text-white">Your proposals</h1>
          </div>
          <Link
            href="/admin/new"
            className="rounded-lg bg-gradient-to-r from-amber-400 to-rose-500 px-4 py-2.5 text-sm font-semibold text-[#0B0F14]"
          >
            New proposal
          </Link>
        </div>

        {proposals.length === 0 ? (
          <p className="rounded-lg border border-[#1B2530] bg-[#11161D] p-6 text-sm text-zinc-400">
            No proposals yet. Create your first one and let AI write it.
          </p>
        ) : (
          <ul className="space-y-3">
            {proposals.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/admin/${p.id}`}
                  className="flex items-center justify-between rounded-lg border border-[#1B2530] bg-[#11161D] px-5 py-4 hover:border-amber-400/40"
                >
                  <div>
                    <span className="font-semibold text-white">{p.title}</span>
                    <span className="ml-2 text-sm text-zinc-500">{p.client_name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm text-amber-400">
                      {Number(p.total).toLocaleString(undefined, {
                        style: "currency",
                        currency: p.currency || "USD",
                      })}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[p.status] ?? ""}`}>
                      {p.status}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
