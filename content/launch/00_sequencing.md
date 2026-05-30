# Launch sequencing & ops playbook

Two principles:
1. **One channel at a time.** Don't burn the whole launch in 24h. Each successful channel = compounding signal for the next.
2. **Watch the data.** scamira.com analyses count (`/api/stats`) tells you instantly whether traffic is converting.

## Recommended order

```
Day 0 (今日)
  └─ Final prep: review the 3 launch drafts, fix anything that feels off

Day 1〜2  (火 or 水)
  └─ 🥇 Show HN
     - Best slot: 火 or 水, JST 22:00〜24:00 (= US Pacific 08:00〜10:00)
     - Submit. Paste first comment. Reply to comments for ~3 hours.
     - Best case: front page (10k+ visits). Worst case: silent (still gets ~50 visits from /new)

Day 3〜7
  └─ 🥈 Reddit r/SideProject
     - Posted within 2 days of HN (HN buzz helps, but not too immediate to look like spam)
     - Image attached
     - Reply to every comment

Day 7〜14
  └─ 🥉 Product Hunt
     - Schedule launch for 火 or 水, 00:01 PT (= 16:01 JST same day)
     - Need 1-2 weeks prep: account warmup, schedule the launch, prepare media
     - Day-of: stay engaged 24h

Day 14+
  └─ Secondary subreddits, dev.to article, IndieHackers post, etc.
     - Only if Day 1-14 produced traction (otherwise iterate on product first)
```

## Per-channel "go / no-go" criteria

Don't burn the next channel if the previous one shows you the product needs fixing.

After **Show HN**:
- ✅ Got >10 comments OR >100 GitHub stars → product resonates. Go to Reddit.
- ⚠️ Front page but bounced (no comments, low stars) → analyze landing page. Maybe homepage doesn't make the value clear enough. Fix before Reddit.
- ❌ Total silence → low risk move on to Reddit unchanged; HN can be unpredictable.

After **Reddit**:
- ✅ >50 upvotes, useful comments → ready for PH.
- ⚠️ Negative comments about UX/clarity → fix those before PH (PH audience is less forgiving than HN).

## During-launch monitoring (one terminal command)

```bash
# Watch analyses count rising in real time
while true; do clear; echo "Analyses count: $(curl -s https://scamira.com/api/stats | python3 -c 'import sys,json;print(json.load(sys.stdin)[\"total\"])')"; sleep 30; done
```

## Backup plans if things break

| Symptom | Cause | Fix |
|---|---|---|
| 502 errors on analyze | Anthropic rate limit | They're tier-based; should not happen on $5+ credit. If it does, bump budget cap |
| Site slow | Probably fine — Cloudflare scales | Check Cloudflare dashboard for any errors |
| API budget alarm at $25 | Lots of usage = good problem | Bump cap to $50, you're not at risk of bankruptcy |
| Negative press / accusations of defamation | Lawyer up — but you've got a strong defense (open methodology, no individual targeting) | Have docs/methodology.md and the disclaimer banner ready to point to |

## What "success" looks like for each launch

| Channel | Soft success | Strong success |
|---|---|---|
| Show HN | 50+ visits, 10+ comments, 30+ stars | Front page, 5k+ visits, 200+ stars |
| Reddit r/SideProject | 30+ upvotes, 10+ comments | 200+ upvotes, hits r/SideProject top of week |
| Product Hunt | Top 20 of day | Top 5 of day |

Combined goal across all 3 launches: **>1,000 scamira.com analyses run by week 4**, up from current 4.
