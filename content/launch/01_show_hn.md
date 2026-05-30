# Show HN draft

## Submission URL field
```
https://scamira.com
```

## Title (max ~80 chars; aim for under 80)
```
Show HN: Scamira – open-source detector for predatory info-marketing posts
```

Alternative titles if the first doesn't land:
- `Show HN: Scamira – analyze social-media posts for funnel patterns (EN/JA)`
- `Show HN: An open-source tool that scores social-media posts on predatory marketing`

## Body
Leave **blank** on the Show HN form. HN convention: the link is the submission, the first comment is the explanation. Paste the body below as the **first comment** after submitting.

## First comment (paste right after submitting)

```
Hi HN. Solo dev in Japan here.

I built Scamira because so much of social media has been overrun by predatory info-marketing — the genre of posts that say "comment SECRET below and I'll DM you the system," then funnel you through a sales sequence to a $100+ "course." The structure is incredibly consistent: Manychat-style comment automation, exaggerated income claims, manufactured scarcity, mechanism opacity ("my secret system"), funneling into a LINE/email list that then sells the actual paid product.

Scamira takes a post's caption and scores it 0–100 for "info-marketing density," breaking down which structural signals were detected with the exact phrases as evidence. Works for both Japanese and English posts.

A few design decisions I'd love feedback on:

- The entire detection prompt is open source (src/prompts.ts). I didn't want a black-box "trust me" tool — the whole point is reducing information asymmetry, so the methodology itself has to be public.
- It is explicitly NOT a "scam verdict" tool. It detects funnel structure; the user makes the final call. Wording is deliberately neutral to avoid defamation.
- Stack: Cloudflare Workers + Claude Haiku 4.5 + a single static HTML page. The whole thing costs me ~$5/month in API credits and runs at the edge.
- Bilingual UI and bilingual analysis output. I added the English output mode today, specifically so HN could try it on Western crypto/dropshipping/coaching examples — my taxonomy started Japan-centric but the underlying funnel shape is universal.

Try it: https://scamira.com (paste any caption you'd like)
GitHub / methodology: https://github.com/guernika54/scamira

Things I'd genuinely like feedback on:
1. Western funnel patterns I'm missing — please paste examples you think SHOULD score high.
2. Legitimate posts that get falsely flagged (false positives matter more than false negatives for this kind of tool).
3. Whether the scoring approach feels right, vs. just emitting a list of signals with no overall number.

v0.3 plan: auto-fetch from X/IG URLs and a Chrome extension that flags posts in-feed.
```

## Sequencing notes

- **Best time to submit**: Weekday 08:00–10:00 US Pacific = 00:00–02:00 JST next day. Avoid weekends and US holidays.
- **Don't** auto-promote within HN. No vote rings, no asking friends to upvote. Just submit and engage thoughtfully with replies.
- Reply to every comment within ~30 min for first 2 hours. HN ranking is engagement-sensitive.
- If it dies in /new without front-page traction, **do not resubmit** for at least 2 weeks. HN throttles repeat submissions.
- If you make front page: be ready for a usage spike. Anthropic budget cap is $30 — at Claude Haiku 4.5 (~$0.001/call) that's 30K analyses headroom. Should be fine but monitor.
