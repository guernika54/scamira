# Scamira

**English** · [日本語](README.ja.md)

> An open-source tool that detects predatory info-marketing patterns in social-media posts.

## 🚀 Live demo

**https://scamira.com**

![Scamira screenshot](public/og.png)

Paste any social-media caption (Instagram reel, X post, etc.) and Scamira scores it 0–100 for "info-marketing density," breaking down each detected funnel signal with the exact phrase as evidence. Works on **both English and Japanese** posts.

## Why I built this

Social media has been overrun by predatory info-marketing — the genre of posts that say *"comment SECRET below and I'll DM you the system,"* then funnel you through a sales sequence to a $100+ "course." In Japan (where I'm based) this is especially rampant, but the funnel structure is universal:

- **Comment-to-DM automation** (Manychat-style)
- **Exaggerated income claims** ("$10k/month while you sleep")
- **Manufactured scarcity** ("limited spots", "brand-new opportunity")
- **Mechanism opacity** ("my secret system")
- **List-building** into an email/LINE sequence that sells the real paid product

Scamira makes this structure **visible** with **transparent, open detection logic**, so anyone can understand *why* a post looks suspicious — in their own words.

It is **not** an anti-fraud crusade. The goal is simply to hand the buyer the information that should have been theirs all along.

## What it does (v0.2)

- Paste a post → AI scores "info-marketing density" 0–100
- Detected patterns shown as **strong / medium / weak** signals, each with a quoted phrase as evidence
- **Detection logic & prompts are 100% public**
- **Shareable analysis URLs** (`scamira.com/a/:id`, stored 90 days)
- **Bilingual UI & output** (EN / JA language switcher)
- **Cumulative analysis counter**

## Design principles

- **Detection logic is fully open** — see [`src/prompts.ts`](src/prompts.ts) and [`docs/methodology.md`](docs/methodology.md). A black-box "trust me" tool would contradict the whole point.
- **No individual targeting** — it analyzes the *structure* of a post, never the personality or legality of the poster.
- **Not a "scam verdict"** — it surfaces patterns; the user makes the final call. Wording is deliberately neutral.
- **Disputes welcome** — false positives matter. File an [Issue](https://github.com/guernika54/scamira/issues) or PR.

## Tech stack

- **Frontend**: TailwindCSS (CDN), Vanilla JS
- **Backend**: Cloudflare Workers (TypeScript)
- **LLM**: Anthropic Claude Haiku 4.5
- **Hosting**: Cloudflare Workers + Static Assets

Costs ~$5/month in API credits and runs entirely at the edge.

## Local development

```bash
git clone https://github.com/guernika54/scamira.git
cd scamira

npm install

# Set your Anthropic API key
cp .dev.vars.example .dev.vars
# edit .dev.vars and add ANTHROPIC_API_KEY

npm run dev
# → http://localhost:8787
```

## Roadmap

- [x] Detection prompt (expanded patterns in v0.2)
- [x] Cloudflare Workers backend
- [x] Frontend (paste-text)
- [x] Public deploy (v0.1 — open beta)
- [x] Custom domain (scamira.com)
- [x] Rate limiting (10 req/min/IP)
- [x] Shareable analysis URLs (v0.2)
- [x] Bilingual UI & analysis output (v0.2)
- [x] Cumulative analysis counter (v0.2)
- [ ] Auto-fetch from Instagram / X / TikTok / YouTube URLs
- [ ] Chrome extension (in-feed detection)
- [ ] Dynamic OG images per shared result

## Support

Scamira is **free and open-source**. Infrastructure, LLM API, and domain costs are currently covered personally.

If you'd like to support development:

- ☕ **[Buy Me a Coffee](https://buymeacoffee.com/k54kbusineu)** — one-off support
- ⭐ **GitHub Star** — star this repo
- 🐛 **Issue / PR** — bug reports, feature ideas, new detection patterns
- 📣 **Share** — tell people about Scamira

All support goes directly toward improving detection accuracy, building new features, and keeping the tool free.

## License

[MIT](LICENSE)

## Contributing

Issues / PRs very welcome. If you find a predatory marketing pattern Scamira misses, share it so we can improve the detection logic in [`src/prompts.ts`](src/prompts.ts).
