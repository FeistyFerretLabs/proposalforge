import Link from "next/link";
import { redirect } from "next/navigation";
import { getUserId } from "@/lib/admin";
import { ProposalForm } from "./proposal-form";

export const dynamic = "force-dynamic";

export default async function NewProposalPage() {
  const userId = await getUserId();
  if (!userId) redirect("/login");

  return (
    <main className="min-h-screen bg-[#0B0F14] text-zinc-200 font-sans">
      <div className="mx-auto max-w-2xl px-4 py-12">
        <Link href="/admin" className="font-mono text-xs text-zinc-500 hover:text-zinc-300">
          &lt; all proposals
        </Link>
        <h1 className="mb-8 mt-1 text-2xl font-bold text-white">New proposal</h1>
        <ProposalForm />
      </div>
    </main>
  );
}
