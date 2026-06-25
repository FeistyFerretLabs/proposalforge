import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0B0F14] text-zinc-200 font-sans">
      <div className="mx-auto max-w-2xl px-4 py-20">
        <p className="mb-3 font-mono text-sm text-emerald-400">&gt;_ ProposalForge</p>
        <h1 className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
          AI writes the proposal. You send it.
        </h1>
        <p className="mt-4 text-lg text-zinc-400">
          The open-source alternative to PandaDoc. PandaDoc charges sales teams up to
          20,000 dollars a year to send documents that are 80 percent boilerplate. Enter
          the deal details, Claude writes the whole proposal, and your client signs it
          online. Fork it and run your own.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/login"
            className="rounded-lg bg-gradient-to-r from-amber-400 to-rose-500 px-5 py-3 text-sm font-semibold text-[#0B0F14]"
          >
            Sign in to write a proposal
          </Link>
        </div>

        <section className="mt-16 grid gap-6 sm:grid-cols-2">
          <Feature
            title="AI proposal generation"
            body="Enter the client, the project, and the line items. Claude writes the executive summary, scope, timeline, and terms."
          />
          <Feature
            title="Interactive pricing"
            body="Line items, quantities, totals. The number the client sees, calculated for you."
          />
          <Feature
            title="Public proposal link"
            body="Send a clean, branded web link. No PDF wrangling. Track when it is opened."
          />
          <Feature
            title="Built-in e-signature"
            body="The client types their name to accept. Recorded with a timestamp. Done."
          />
        </section>

        <footer className="mt-16 border-t border-[#1B2530] pt-6 text-sm text-zinc-600">
          ProposalForge. Part of The Vibe Stack. One build. One teardown.
        </footer>
      </div>
    </main>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-[#1B2530] bg-[#11161D] p-5">
      <h3 className="font-semibold text-white">{title}</h3>
      <p className="mt-1 text-sm text-zinc-400">{body}</p>
    </div>
  );
}
