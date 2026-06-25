import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

export const dynamic = "force-dynamic";

// Server-only client. Uses the service role key when available so the public
// sign action can write the signature fields (RLS owner-write would otherwise
// block an unauthenticated prospect). Falls back to anon, which fails closed.
function signingClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}

export async function POST(request: Request) {
  let body: { token?: string; signerName?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const token = body.token?.trim();
  const signerName = body.signerName?.trim();
  if (!token || !signerName) {
    return NextResponse.json({ error: "token and signerName are required" }, { status: 400 });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    null;

  const sb = signingClient();

  // Only sign a proposal that has actually been sent and is not already signed.
  const { data: proposal } = await sb
    .from("pf_proposals")
    .select("id, status")
    .eq("view_token", token)
    .maybeSingle();

  if (!proposal) {
    return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
  }
  if (proposal.status === "draft") {
    return NextResponse.json({ error: "This proposal is not available to sign" }, { status: 400 });
  }
  if (proposal.status === "signed") {
    return NextResponse.json({ error: "Already signed" }, { status: 409 });
  }

  const { error } = await sb
    .from("pf_proposals")
    .update({
      status: "signed",
      signed_at: new Date().toISOString(),
      signer_name: signerName,
      signer_ip: ip,
    })
    .eq("id", proposal.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await sb.from("pf_view_events").insert({
    proposal_id: proposal.id,
    event_type: "sign",
    viewer_ip: ip,
  });

  return NextResponse.json({ ok: true });
}
