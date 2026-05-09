import { ANALYSIS_PROMPT } from "./prompts";

interface RateLimit {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

interface Env {
  ANTHROPIC_API_KEY: string;
  ASSETS: Fetcher;
  ANALYZE_LIMITER?: RateLimit;
}

interface AnalyzeRequest {
  text: string;
}

interface Signal {
  category: "strong" | "medium" | "weak";
  pattern: string;
  evidence: string;
}

interface AnalyzeResult {
  score: number;
  signals: Signal[];
  summary: string;
  disclaimer: string;
}

const DISCLAIMER =
  "本ツールはパターン検出のみを行うものであり、特定の個人や事業者に対する評価や法的判断を行うものではありません。最終的な判断は利用者自身が行ってください。";

const MAX_INPUT_LENGTH = 10_000;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/health") {
      return Response.json({ ok: true, version: "0.1.0" });
    }

    if (url.pathname === "/api/analyze") {
      if (request.method !== "POST") {
        return Response.json({ error: "method not allowed" }, { status: 405 });
      }
      return handleAnalyze(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};

async function handleAnalyze(request: Request, env: Env): Promise<Response> {
  if (!env.ANTHROPIC_API_KEY) {
    return Response.json(
      { error: "server is not configured (missing ANTHROPIC_API_KEY)" },
      { status: 500 },
    );
  }

  // Rate limit: 10 requests per minute per IP (best-effort, eventually consistent)
  if (env.ANALYZE_LIMITER) {
    const ip = request.headers.get("cf-connecting-ip") || "unknown";
    const result = await env.ANALYZE_LIMITER.limit({ key: ip });
    if (!result.success) {
      return Response.json(
        {
          error:
            "リクエストが多すぎます。1分間に10回までです。少し待ってから再試行してください。",
        },
        { status: 429, headers: { "retry-after": "60" } },
      );
    }
  }

  let body: AnalyzeRequest;
  try {
    body = (await request.json()) as AnalyzeRequest;
  } catch {
    return Response.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const text = (body?.text ?? "").trim();
  if (!text) {
    return Response.json({ error: "text is required" }, { status: 400 });
  }
  if (text.length > MAX_INPUT_LENGTH) {
    return Response.json(
      { error: `text too long (max ${MAX_INPUT_LENGTH} chars)` },
      { status: 400 },
    );
  }

  try {
    const result = await analyze(text, env.ANTHROPIC_API_KEY);
    return Response.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    return Response.json({ error: message }, { status: 502 });
  }
}

async function analyze(text: string, apiKey: string): Promise<AnalyzeResult> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      system: ANALYSIS_PROMPT,
      messages: [{ role: "user", content: text }],
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Anthropic API ${response.status}: ${errBody.slice(0, 200)}`);
  }

  const data = (await response.json()) as {
    content: Array<{ type: string; text: string }>;
  };
  const raw = data.content?.[0]?.text ?? "";
  const parsed = parseAnalysisJSON(raw);

  return {
    score: clamp(Math.round(Number(parsed.score) || 0), 0, 100),
    signals: Array.isArray(parsed.signals) ? parsed.signals.slice(0, 20) : [],
    summary: typeof parsed.summary === "string" ? parsed.summary : "",
    disclaimer: DISCLAIMER,
  };
}

function parseAnalysisJSON(raw: string): {
  score?: unknown;
  signals?: Signal[];
  summary?: unknown;
} {
  const trimmed = raw.trim();
  const direct = tryParse(trimmed);
  if (direct) return direct;

  const match = trimmed.match(/\{[\s\S]*\}/);
  if (match) {
    const fromMatch = tryParse(match[0]);
    if (fromMatch) return fromMatch;
  }

  throw new Error("could not parse analysis JSON from model response");
}

function tryParse(s: string): Record<string, unknown> | null {
  try {
    const v = JSON.parse(s);
    return typeof v === "object" && v !== null ? v : null;
  } catch {
    return null;
  }
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}
