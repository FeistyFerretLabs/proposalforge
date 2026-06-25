import { NextRequest, NextResponse } from "next/server";
import { askClaude } from "@/lib/ai";

export async function POST(req: NextRequest) {
  const { prompt, system, maxTokens } = await req.json();

  if (!prompt || typeof prompt !== "string") {
    return NextResponse.json(
      { error: "prompt is required" },
      { status: 400 }
    );
  }

  const result = await askClaude(prompt, { system, maxTokens });
  return NextResponse.json({ result });
}
