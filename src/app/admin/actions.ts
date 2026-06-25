"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getUserId, listPricingItems, computeTotals } from "@/lib/admin";
import type { ProposalSection } from "@/lib/database.types";

interface LineItemInput {
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  isOptional?: boolean;
}

// Create a proposal from the new-proposal form. Accepts the deal details, the
// AI-generated sections (JSON string), and the line items (JSON string).
export async function createProposal(formData: FormData) {
  const userId = await getUserId();
  if (!userId) redirect("/login");

  const title = String(formData.get("title") ?? "").trim();
  const clientName = String(formData.get("clientName") ?? "").trim();
  const clientCompany = String(formData.get("clientCompany") ?? "").trim();
  const clientEmail = String(formData.get("clientEmail") ?? "").trim();
  const projectName = String(formData.get("projectName") ?? "").trim();
  const projectDescription = String(formData.get("projectDescription") ?? "").trim();
  if (!title || !clientName || !projectName) return;

  let sections: ProposalSection[] = [];
  let lineItems: LineItemInput[] = [];
  try {
    sections = JSON.parse(String(formData.get("sections") ?? "[]"));
    lineItems = JSON.parse(String(formData.get("lineItems") ?? "[]"));
  } catch {
    // fall through with empty arrays
  }

  const sb = await createSupabaseServerClient();
  const { data: proposal, error } = await sb
    .from("pf_proposals")
    .insert({
      user_id: userId,
      title,
      client_name: clientName,
      client_company: clientCompany || null,
      client_email: clientEmail || null,
      project_name: projectName,
      project_description: projectDescription || null,
      sections,
      status: "draft",
    })
    .select("id")
    .single();

  if (error || !proposal) return;

  if (lineItems.length > 0) {
    await sb.from("pf_pricing_items").insert(
      lineItems.map((li, i) => ({
        proposal_id: proposal.id,
        name: li.name,
        description: li.description ?? null,
        quantity: li.quantity,
        unit_price: li.unitPrice,
        is_optional: li.isOptional ?? false,
        sort_order: i,
      }))
    );
    const items = await listPricingItems(proposal.id);
    const { subtotal, total } = computeTotals(items);
    await sb.from("pf_proposals").update({ subtotal, total }).eq("id", proposal.id);
  }

  revalidatePath("/admin");
  redirect(`/admin/${proposal.id}`);
}

export async function sendProposal(formData: FormData) {
  const userId = await getUserId();
  if (!userId) redirect("/login");
  const id = String(formData.get("proposalId"));

  const sb = await createSupabaseServerClient();
  await sb
    .from("pf_proposals")
    .update({ status: "sent", sent_at: new Date().toISOString() })
    .eq("id", id)
    .eq("user_id", userId);

  revalidatePath(`/admin/${id}`);
}
