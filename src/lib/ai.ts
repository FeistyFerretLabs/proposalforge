import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

interface AiOptions {
  system?: string;
  maxTokens?: number;
  model?: string;
}

export async function askClaude(
  prompt: string,
  options: AiOptions = {}
): Promise<string> {
  const {
    system = "You are a helpful assistant.",
    maxTokens = 4096,
    model = "claude-sonnet-4-20250514",
  } = options;

  const message = await anthropic.messages.create({
    model,
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content: prompt }],
  });

  const block = message.content[0];
  if (block.type === "text") {
    return block.text;
  }
  throw new Error("Unexpected response type from Claude");
}

export async function askClaudeJSON<T>(
  prompt: string,
  options: AiOptions = {}
): Promise<T> {
  const result = await askClaude(
    `${prompt}\n\nRespond ONLY with valid JSON, no markdown or explanation.`,
    options
  );

  const cleaned = result.replace(/```json\n?|\n?```/g, "").trim();
  return JSON.parse(cleaned) as T;
}
