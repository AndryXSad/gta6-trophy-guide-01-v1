# gta6-trophy-guide-01-v1

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/AndryXSad/gta6-trophy-guide-01-v1/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/AndryXSad/gta6-trophy-guide-01-v1/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

**Leonida Ledger** is a guide and tracker for the official 55 GTA VI trophies on PS5 — 1 Platinum, 2 Gold, 6 Silver and 46 Bronze — with a road to the Platinum, a warning for the one trophy that can be missed, and a checklist that remembers your progress in the browser.

## What you get

- **The whole official list** — every trophy's name, description and grade as reported from the official list, each with a guide written fresh for this page, a short step list, a "can it be missed?" note and named sources (Exophase, PSNProfiles, PowerPyx).
- **A tracker that remembers** — tick trophies off and your progress stays in localStorage, with a progress bar, per-grade counts, export as a JSON download, import and reset.
- **Ways to find things** — filter by kind (story, missable, collectibles, activities, crime, side), by grade, by earned status, plus a text search. The page always shows how many trophies match.
- **A spoiler switch** — "Hide story spoilers" is on by default, so story trophy names and descriptions stay blurred until you earn them.
- **One card per trophy** — click any trophy for its full guide, its steps, its missable note, its sources and a mark-as-earned button.
- **A road to the Platinum** — five phases in order (story, then side work, then activities, then collectibles, then cleanup), with the missable warning up front.
- **Deep links** — `?filter=missable`, `?filter=silver`, `?trophy=17`, `?spoiler=off`, `?demo=1` (sample progress for screenshots).
- **Offline throughout** — no network requests at all; everything lives under `app/`.

## Straight talk

- The game launched 19 November 2026 and the 55-name list was reported 18 November 2026. Guides are written from the official trophy descriptions; where a step or a place is not in the official description, the guide says so — check it in the game.
- There are **no online trophies** in the official list, so the Platinum is entirely single-player, around 200 hours by PowerPyx's roadmap estimate.
- **One trophy may be missable:** Positive Mental Attitude — meditate at the Chapter 1 spot before that chapter ends, and keep a manual save at the start of every chapter. Reported guides say GTA VI has no mission replay.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

Build the hand-in bundle (copies `app/` and `screenshots/`, writes `dossier.json`):

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Files

- `app/index.html`, `app/style.css` — the page and its hand-rolled neon Vice City look
- `app/app.js` — page setup, the checklist, the detail card, deep links
- `app/tracker.js` — saved progress in localStorage, export and import
- `app/filters.js` — kind, grade, status and text filtering
- `app/roadmap.js` — the Platinum roadmap and the missable warning
- `app/data/trophies.json` — the 55 official trophies with guides, steps, kinds, missable flags and sources
- `screenshots/` — 4 screenshots of the app (1280×800)

---

Built for the [gta6-trophy-guide-01 bounty on make.fun](https://make.fun/bounty/gta6-trophy-guide-01). If you use this guide, you can support the author with referral code `926c6vcc` — https://make.fun/r/926c6vcc
