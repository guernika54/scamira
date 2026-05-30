import { buildPrompt } from "./prompts";

interface RateLimit {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

interface KVNamespace {
  get(key: string): Promise<string | null>;
  put(
    key: string,
    value: string,
    options?: { expirationTtl?: number },
  ): Promise<void>;
}

interface AnalyticsEngineDataset {
  writeDataPoint(point: {
    blobs?: string[];
    doubles?: number[];
    indexes?: string[];
  }): void;
}

interface Env {
  ANTHROPIC_API_KEY: string;
  ASSETS: Fetcher;
  ANALYZE_LIMITER?: RateLimit;
  RESULTS?: KVNamespace;
  STATS?: AnalyticsEngineDataset;
}

interface AnalyzeRequest {
  text: string;
  lang?: "ja" | "en";
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
  shareId?: string;
  shareUrl?: string;
}

const DISCLAIMER_JA =
  "本ツールはパターン検出のみを行うものであり、特定の個人や事業者に対する評価や法的判断を行うものではありません。最終的な判断は利用者自身が行ってください。";
const DISCLAIMER_EN =
  "This tool performs pattern detection only. It does not constitute an evaluation, legal judgment, or accusation against any specific individual or business. Final interpretation is the user's responsibility.";

const MAX_INPUT_LENGTH = 10_000;
const ID_LENGTH = 10;
const RESULT_TTL_SECONDS = 60 * 60 * 24 * 90; // 90 days

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/api/health") {
      return Response.json({ ok: true, version: "0.2.0" });
    }

    if (url.pathname === "/api/analyze") {
      if (request.method !== "POST") {
        return Response.json({ error: "method not allowed" }, { status: 405 });
      }
      return handleAnalyze(request, env);
    }

    if (url.pathname.startsWith("/api/result/")) {
      return handleGetResult(url.pathname.slice("/api/result/".length), env);
    }

    if (url.pathname === "/api/stats") {
      return handleGetStats(env);
    }

    return env.ASSETS.fetch(request);
  },
};

const STATS_TOTAL_KEY = "stats:total";

async function handleGetStats(env: Env): Promise<Response> {
  if (!env.RESULTS) {
    return Response.json({ total: 0 });
  }
  try {
    const stored = await env.RESULTS.get(STATS_TOTAL_KEY);
    const total = stored ? parseInt(stored, 10) : 0;
    return Response.json(
      { total: isNaN(total) ? 0 : total },
      {
        headers: {
          "cache-control": "public, max-age=60",
        },
      },
    );
  } catch {
    return Response.json({ total: 0 });
  }
}

async function incrementStats(env: Env): Promise<void> {
  if (!env.RESULTS) return;
  try {
    const stored = await env.RESULTS.get(STATS_TOTAL_KEY);
    const current = stored ? parseInt(stored, 10) : 0;
    const next = (isNaN(current) ? 0 : current) + 1;
    await env.RESULTS.put(STATS_TOTAL_KEY, String(next));
  } catch {
    // best-effort, ignore
  }
}

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
  const lang = body?.lang === "en" ? "en" : "ja";

  try {
    const result = await analyze(text, env.ANTHROPIC_API_KEY, lang);

    // Stats: record the analysis (anonymous, no text content stored)
    if (env.STATS) {
      try {
        env.STATS.writeDataPoint({
          blobs: ["analyze"],
          doubles: [result.score],
          indexes: ["analyze"],
        });
      } catch {
        // ignore
      }
    }

    // Save result to KV for shareable URL (best-effort, fail silently)
    if (env.RESULTS) {
      try {
        const id = generateId();
        const stored = JSON.stringify({
          text,
          result,
          createdAt: Date.now(),
        });
        await env.RESULTS.put(id, stored, {
          expirationTtl: RESULT_TTL_SECONDS,
        });
        result.shareId = id;
        result.shareUrl = `https://scamira.com/a/${id}`;
      } catch {
        // KV failure should not break the analysis response
      }
    }

    // Increment stats counter (best-effort)
    await incrementStats(env);

    return Response.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    return Response.json({ error: message }, { status: 502 });
  }
}

async function handleGetResult(id: string, env: Env): Promise<Response> {
  if (!isValidId(id)) {
    return Response.json({ error: "invalid id" }, { status: 400 });
  }
  if (!env.RESULTS) {
    return Response.json({ error: "storage unavailable" }, { status: 503 });
  }
  const stored = await env.RESULTS.get(id);
  if (!stored) {
    return Response.json({ error: "not found" }, { status: 404 });
  }
  try {
    const data = JSON.parse(stored) as {
      text: string;
      result: AnalyzeResult;
      createdAt: number;
    };
    return Response.json({
      text: data.text,
      result: data.result,
      createdAt: data.createdAt,
    });
  } catch {
    return Response.json({ error: "corrupted data" }, { status: 500 });
  }
}

async function analyze(
  text: string,
  apiKey: string,
  lang: "ja" | "en" = "ja",
): Promise<AnalyzeResult> {
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
      system: buildPrompt(lang),
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
    disclaimer: lang === "en" ? DISCLAIMER_EN : DISCLAIMER_JA,
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

function generateId(length = ID_LENGTH): string {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}

function isValidId(id: string): boolean {
  return /^[a-zA-Z0-9]{6,20}$/.test(id);
}
