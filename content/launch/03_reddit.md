# Reddit launch drafts

Reddit is more allergic to self-promo than HN or PH. The right approach: post once in `/r/SideProject` (which exists for this) with a genuinely useful + honest framing.

## Primary submission: r/SideProject

### Subreddit
```
r/SideProject
```

### Title (Reddit convention: descriptive, no clickbait)
```
I built an open-source tool that detects predatory info-marketing patterns in social media posts (bilingual EN/JA)
```

Alternative if you want a lighter framing:
```
Built a side project this month: an open-source "scam funnel detector" for social media posts
```

### Body
```
Hey r/SideProject!

I'm a solo dev based in Japan. I built this over a few weeks because I'd been frustrated for ages with how much of social media (especially Instagram/X) has been taken over by predatory info-marketing posts. You know the type:

- "Comment SECRET below and I'll DM you the system"
- "$10k/month from home while you sleep"
- "Brand new opportunity, limited spots"

The patterns are extremely consistent. So I built Scamira — paste a social media caption in, and it scores 0-100 for "info-marketing density" and breaks down each detected signal with the exact phrase as evidence.

**Live demo**: https://scamira.com (works on EN and JA posts)
**GitHub**: https://github.com/guernika54/scamira

A few things that make it unusual for a side project of this kind:

- **Detection logic is fully open source.** Black-box "trust me" tools are exactly the kind of thing it's pushing back against, so the methodology has to be public.
- **It deliberately doesn't say "scam."** Just "this post matches X patterns at Y strength." User makes the call.
- **Bilingual.** UI and analysis output both in EN/JA. Switch with a button.
- **Built on Cloudflare Workers + Claude Haiku 4.5.** Costs me ~$5/month in API credits. Runs at the edge.

What I'd love from this sub:
- Test it on the most absurd post you can find. I want to see what scores high and what falsely scores high.
- Western funnel patterns I'm missing — my detection started Japan-centric (where the problem is bad) but the structure is universal.

v0.3 plan: auto-fetch from X/IG URLs, and a Chrome extension that flags posts in-feed.

Happy to answer questions about the stack, the prompt design, anything.
```

### Image attachment
Attach `content/2026-05-11/post2_result.png` (the actual result mock) — Reddit posts with images get 2-3× engagement.

## Secondary subreddits (only after r/SideProject lands well)
These have stricter self-promo rules; don't drop in until you've engaged with the community first.

- **r/InternetIsBeautiful** — submit just the URL with a descriptive title, no body. Self-promo strict, succeed/fail in 6h.
- **r/programming** — only if framing is "here's how I built it" (the prompt engineering is genuinely interesting). Be ready for tough technical Qs.
- **r/japanlife** — Japanese-focused angle works here. Phrase as "I built this because Japanese SNS info-marketing is out of control."
- **r/japan** — similar to above but slightly more casual audience.

## DO NOT post to
- r/Entrepreneur / r/sidehustle / r/passive_income — wrong audience (the people who buy these scams)
- r/MachineLearning — too LLM-application-y, will get downvoted

## Reddit hygiene
- Read each sub's rules before posting; many require karma threshold or no self-promo
- Reply to every comment, even harsh ones (especially harsh ones — Redditors reward founders who engage)
- Don't post the same body verbatim to multiple subs — Reddit and mods both flag this
