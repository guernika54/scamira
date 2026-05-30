# dev.to article draft

## How to post
1. Go to https://dev.to → log in **with GitHub** (your guernika54 account — fastest)
2. Click **"Create Post"** (top right)
3. Click the **"..."** / settings to paste raw markdown, OR just paste the body below into the editor
4. Set the cover image, tags, and title using the front-matter values below
5. Preview → **Publish**

## Front matter / metadata fields

| Field | Value |
|---|---|
| **Title** | How I built an open-source detector for predatory "info-marketing" posts |
| **Tags** | `opensource`, `typescript`, `ai`, `cloudflare` |
| **Cover image** | `https://scamira.com/og.png` |
| **Canonical URL** | (leave blank, or `https://scamira.com`) |

---

## ARTICLE BODY (paste below the title)

---

If you've spent any time on Instagram, TikTok, or X lately, you've seen these posts:

> "Comment **MONEY** below and I'll DM you my secret system 💰 Make $10k/month from home while you sleep. No skills needed. Limited spots!"

In Japan — where I live — this genre has metastasized. An entire economy of "info-marketing" (情弱ビジネス, roughly "business that preys on the information-poor") runs on a depressingly consistent funnel. After watching enough of it, I realized the structure was so repetitive that it was basically *detectable*. So I built a tool that detects it.

It's called **[Scamira](https://scamira.com)**, it's open source, and this post is about how it works.

## The pattern is the product

Here's the funnel, almost every time:

1. **Comment-to-DM automation** — "comment X and I'll DM you" (usually Manychat)
2. **Exaggerated income claims** — specific, unverifiable numbers
3. **Manufactured scarcity** — "limited spots", "brand-new method", "before everyone finds out"
4. **Mechanism opacity** — "my secret system" (never says what the actual work is)
5. **List-building** — funnel into a LINE/email sequence
6. **The sell** — a $100+ "course," often whose content is *how to sell the same course*

The insight that made the tool possible: **none of these signals is damning alone, but their co-occurrence is the signature.** A normal small business says "comment below!" too. The difference is the *combination* and *density*. That's exactly the kind of fuzzy, structural pattern an LLM is good at scoring.

## The stack (deliberately tiny)

- **Frontend:** one static HTML file + Tailwind (CDN). No build step.
- **Backend:** a single Cloudflare Worker (TypeScript).
- **LLM:** Claude Haiku 4.5.
- **Storage:** Cloudflare KV (for shareable result URLs).
- **Cost:** ~$5/month in API credits. Runs entirely at the edge.

The whole thing is small enough to read in one sitting, which is intentional — more on that below.

## The core: a transparent scoring prompt

The heart of Scamira is a system prompt that classifies signals into **strong / medium / weak** tiers and emits structured JSON. A trimmed version:

```typescript
// src/prompts.ts
export const ANALYSIS_PROMPT = `You detect "info-marketing" funnel
patterns in social-media posts. Classify detected signals:

### Strong signals (weight 3)
- Comment-to-DM automation: "comment X", "I'll DM you"
- Exaggerated income claims: "$10k/month", "while you sleep"
- Manufactured scarcity: "limited spots", "brand-new", "before everyone..."
- Mechanism opacity: "secret system", "the method", "just do X"
...

### Output format (JSON only)
{
  "score": 0-100,
  "signals": [
    { "category": "strong|medium|weak",
      "pattern": "<name>",
      "evidence": "<verbatim quote from the input>" }
  ],
  "summary": "<150-300 chars, factual, structural>"
}
`;
```

Two things I care about here:

**1. Evidence must be verbatim.** Every detected signal has to quote the actual phrase from the input. No hallucinated evidence. This is what makes the output checkable rather than vibes.

**2. It never says "scam."** The wording is deliberately neutral — "this post matches these patterns at this strength," not "this is fraud." Partly that's intellectual honesty (I'm detecting *structure*, not adjudicating intent), and partly it's legal safety (no defamation of any specific person).

## The Worker

The backend is almost boring, which is the goal. The whole analyze path:

```typescript
async function analyze(text: string, apiKey: string, lang: "ja" | "en") {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
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
  // ...parse JSON, clamp score 0-100, return
}
```

A couple of production niceties worth mentioning:

**Rate limiting** via Cloudflare's binding, so a single IP can't drain my API credits:

```jsonc
// wrangler.jsonc
"ratelimits": [
  { "name": "ANALYZE_LIMITER", "namespace_id": "1001",
    "simple": { "limit": 10, "period": 60 } }
]
```

```typescript
const ip = request.headers.get("cf-connecting-ip") || "unknown";
const { success } = await env.ANALYZE_LIMITER.limit({ key: ip });
if (!success) return Response.json({ error: "..." }, { status: 429 });
```

**Defensive JSON parsing**, because LLMs occasionally wrap JSON in prose even when told not to:

```typescript
function parseAnalysisJSON(raw: string) {
  const direct = tryParse(raw.trim());
  if (direct) return direct;
  const match = raw.match(/\{[\s\S]*\}/); // fallback: grab the JSON block
  if (match) { const m = tryParse(match[0]); if (m) return m; }
  throw new Error("could not parse analysis JSON");
}
```

## Going bilingual

The taxonomy was tuned on Japanese posts, but funnel structure is universal. So the prompt has an English-output override that translates pattern names and switches the summary language — while keeping the `evidence` field a verbatim quote in the original language. The detection criteria don't change; only the presentation does. A US dropshipping "blueprint" post and a Japanese 副業 post light up the same signals.

## Why it's fully open source

This is the part I feel strongest about. A closed-source "trust me, this is a scam" tool would be self-defeating — it would just be *another* authority asking you to take its word. The entire point is to **reduce information asymmetry**, so the methodology itself has to be inspectable. The detection prompt, the scoring tiers, the whole Worker — all public ([MIT](https://github.com/guernika54/scamira)). If you disagree with a score, you can read exactly why it happened and open a PR.

## What I'd love feedback on

- **Western funnel patterns I'm missing.** My taxonomy is Japan-first. Paste English examples you think *should* score high.
- **False positives.** For a tool like this, wrongly flagging a legitimate post is worse than missing a bad one. If you find one, I want it.
- **The score vs. signal-list tradeoff.** Is a single 0–100 number useful, or would you rather just see the signals?

Try it on whatever post you like: **[scamira.com](https://scamira.com)**
Code & methodology: **[github.com/guernika54/scamira](https://github.com/guernika54/scamira)**

Next on the roadmap: auto-fetching from X/Instagram URLs, and a browser extension that flags posts in-feed. If this resonates, a GitHub star genuinely helps me prioritize. Thanks for reading.
