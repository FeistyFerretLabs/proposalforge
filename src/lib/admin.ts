import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { Proposal, PricingItem } from "@/lib/database.types";

export async function getUserId(): Promise<string | null> {
  const sb = await createSupabaseServerClient();
  const {
    data: { user },
  } = await sb.auth.getUser();
  return user?.id ?? null;
}

export async function listProposals(userId: string): Promise<Proposal[]> {
  const sb = await createSupabaseServerClient();
  const { data } = await sb
    .from("pf_proposals")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function getProposal(userId: string, id: string): Promise<Proposal | null> {
  const sb = await createSupabaseServerClient();
  const { data } = await sb
    .from("pf_proposals")
    .select("*")
    .eq("user_id", userId)
    .eq("id", id)
    .maybeSingle();
  return data;
}

export async function listPricingItems(proposalId: string): Promise<PricingItem[]> {
  const sb = await createSupabaseServerClient();
  const { data } = await sb
    .from("pf_pricing_items")
    .select("*")
    .eq("proposal_id", proposalId)
    .order("sort_order");
  return data ?? [];
}

export function computeTotals(
  items: Pick<PricingItem, "quantity" | "unit_price" | "is_selected">[],
  taxRate = 0
): { subtotal: number; total: number } {
  const subtotal = items
    .filter((i) => i.is_selected)
    .reduce((sum, i) => sum + Number(i.quantity) * Number(i.unit_price), 0);
  const total = subtotal * (1 + taxRate / 100);
  return { subtotal: round2(subtotal), total: round2(total) };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
