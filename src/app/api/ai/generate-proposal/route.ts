import { NextResponse } from "next/server";
import { askClaudeJSON } from "@/lib/ai";
import type { ProposalSection } from "@/lib/database.types";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

interface Body {
  clientName?: string;
  clientCompany?: string;
  projectName?: string;
  projectDescription?: string;
  lineItems?: { name: string; quantity: number; unitPrice: number }[];
  currency?: string;
}

const SYSTEM = `You are a senior proposal writer. You write professional, persuasive,
client-ready software and services proposals. You write in clear, confident, plain business
English. No fluff, no jargon, no emojis. You never invent specific facts (team sizes,
certifications, case studies) that were not provided. You ground the proposal in the deal
details given.

Return JSON: an object with a "sections" array. Each section is { "heading": string, "body": string }.
Produce these sections in order:
1. Executive summary
2. Understanding of your needs
3. Scope of work
4. Approach and timeline
5. Why us
6. Terms

Each body is 2 to 5 short paragraphs of plain text (no markdown headings inside body).
Keep it tight and specific to the project described.`;

export async function POST(request: Request) {
  let body: Body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.projectName?.trim() || !body.clientName?.trim()) {
    return NextResponse.json(
      { error: "clientName and projectName are required" },
      { status: 400 }
    );
  }

  const itemsText = (body.lineItems ?? [])
    .map((i) => `- ${i.name}: ${i.quantity} x ${i.unitPrice} ${body.currency ?? "USD"}`)
    .join("\n");

  const prompt = `Write the proposal.

Client: ${body.clientName}${body.clientCompany ? ` (${body.clientCompany})` : ""}
Project: ${body.projectName}
Description: ${body.projectDescription ?? "(none provided)"}
Pricing line items:
${itemsText || "(none provided)"}`;

  try {
    const result = await askClaudeJSON<{ sections: { heading: string; body: string }[] }>(
      prompt,
      { system: SYSTEM, maxTokens: 3000 }
    );
    const sections: ProposalSection[] = (result.sections ?? []).map((s, i) => ({
      id: `sec-${i}`,
      heading: s.heading,
      body: s.body,
    }));
    if (sections.length === 0) {
      return NextResponse.json({ error: "AI returned no sections" }, { status: 502 });
    }
    return NextResponse.json({ sections });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "AI generation failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
