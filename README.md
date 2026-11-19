# gta6-trophy-guide-01-v1

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/AndryXSad/gta6-trophy-guide-01-v1/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/AndryXSad/gta6-trophy-guide-01-v1/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

**Leonida Ledger** — a GTA VI trophy guide and tracker for the official 55 PS5 trophies (1 Platinum · 2 Gold · 6 Silver · 46 Bronze), with a roadmap to the Platinum, missable flags, and a progress tracker that saves in your browser.

## What it does

- **Checklist of all 55 official trophies** — names, descriptions and grades exactly as reported from the official list, each with a guide written in our own words, a "can it be missed?" note, and named sources (Exophase, PSNProfiles, PowerPyx).
- **Progress tracker** — tick trophies off; progress is stored in localStorage, with export (JSON download), import and reset. A progress bar and per-grade counts show how close you are to the Platinum.
- **Filters** — by kind (story, missable, collectibles, activities, crime, side), by grade, by earned status, plus text search. Result counts are always shown.
- **Spoiler setting** — "Hide story spoilers" is on by default: story trophy names and descriptions stay blurred until you earn them.
- **Detail panel per trophy** — click any trophy for its full guide, missable note, sources, and a mark-as-earned button.
- **Roadmap to the Platinum** — five stages in order (story → side content → activities → collectibles → cleanup), with a missable warning up front.
- **Deep links** — `?filter=missable`, `?filter=silver`, `?trophy=17`, `?spoiler=off`, `?demo=1` (sample progress for screenshots).
- **Fully offline** — no network requests at all; all files live under `app/`.

## Honest notes

- The game launched 19 November 2026 and the 55-name list was reported 18 November 2026. Guides are written from the official trophy descriptions; where a step or location is not in the official description, the guide says so — verify it in-game.
- There are **no online trophies** in the official list: the Platinum is entirely single-player, about 200 hours per PowerPyx's roadmap estimate.
- **One potentially missable trophy:** Positive Mental Attitude — meditate at the Chapter 1 spot before the chapter ends, and keep a manual save at the start of every chapter. Reported guides note GTA VI has no mission replay.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

Build the submission bundle (copies `app/` and `screenshots/`, writes `dossier.json`):

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Files

- `app/index.html`, `app/style.css` — page and the hand-rolled neon Vice City theme
- `app/app.js` — bootstrap, rendering, detail modal, deep links
- `app/tracker.js` — saved progress (localStorage), export/import
- `app/filters.js` — kind/grade/status/search filtering
- `app/roadmap.js` — Platinum roadmap and missable warning
- `app/data/trophies.json` — the 55 official trophies with guides, kinds, missable flags and sources
- `screenshots/` — 4 screenshots of the app (1280×800)

---

Built for the [gta6-trophy-guide-01 bounty on make.fun](https://make.fun/bounty/gta6-trophy-guide-01). If you use this guide, you can support the author with referral code `926c6vcc` — https://make.fun/r/926c6vcc
