# V0.17 Release Validation — Duel Arena

Status: **COMPLETE / RELEASED**

Canonical source: GitHub `main` in `VGpro9X/auto-battle-roguelite`.

Public build: `https://vgpro9x.github.io/auto-battle-roguelite/`

## Released scope
V0.17 delivers the complete Đấu Trường 1v1 plan while preserving V0.16 Survival/Endless.

Content integrated into Duel:
- 80 / 80 base Kỹ Năng
- 28 / 28 Hợp Đạo Kỹ
- 12 / 12 Siêu Cấp
- 20 / 20 Rare rules = 10 Thần Kỹ + 10 Thần Bí Kỹ

Tournament/runtime:
- 64-fighter single-elimination bracket
- `64 → 32 → 16 → 8 → 4 → 2 → Champion`
- fully automatic fighters
- Best-of-3 matchups
- two unrestricted starter selections
- one build reward after each non-final victory
- one reroll per choice screen
- build-aware range/spacing AI
- pre-match opponent scouting
- HUYẾT CHIẾN at 45s and TỬ CHIẾN at 60s+

## C4 — Rare validation
`tests/v017-duel-c4-all20-rare-smoke.js` validates:
- exact 20-rule catalog and 20 implemented adapters
- explicit Duel descriptions
- stage curve: 0 / 0 / 3 / 6 / 10 / 15% by reward index
- no starter/first-win Rare
- at most one Rare card per reward roll
- unique ownership/no duplicate Rare
- already-owned Rare excluded from later rolls
- AI uses the same stage-based roll
- Divine Gift free-rank behavior
- timed/rule mechanics
- deterministic defensive ordering, including Thiên Ấn → Thế Mệnh → Bất Tử Nhất Tức across successive lethal hits

Result: **PASS**.

## C5 — Full integration / focused balance
`tests/v017-duel-c5-integration-balance.js` validates the full ecosystem together.

Deterministic release measurements:
- melee vs ranged: winner player; 328 ticks; max round time ~5.412s
- defense vs elemental: winner opponent; 352 ticks; max round time ~5.808s
- elemental vs melee: winner player; 282 ticks; max round time ~4.653s
- defense vs defense: winner opponent; 3886 ticks; enters TỬ CHIẾN; max round time ~65.505s
- mirrored hybrid across 24 seeds: player side wins 15/24; no catastrophic fixed-side bias identified

Rare Monte Carlo, 30,000 trials per stage:
- target 3% → observed ~2.93%
- target 6% → observed ~5.80%
- target 10% → observed ~10.07%
- target 15% → observed ~15.30%

Additional gates:
- all 28 Hợp Đạo are attainable within the tournament build budget
- all 12 Siêu Cấp have a legal path within at most seven selections
- fighter HP/x/state remains finite during simulations
- defensive mirror terminates after TỬ CHIẾN instead of stalling
- 64-player bracket halves exactly to one champion
- Duel ranks remain within I–III
- no duplicate Rare ownership in bracket progression

Conclusion: **PASS**. No release-blocking stalled matchup or cleanly isolated numeric value justified an arbitrary buff/nerf, so V0.17 release keeps the validated gameplay values.

## C6 — Rendered browser validation
A dependency-free same-origin browser driver in `tests/v017-browser-driver.html` executes the real public UI flow in headless Chrome/Chromium.

Validated viewports:
- desktop: 1440×900
- mobile: 390×844

The browser flow checks:
1. Đấu Trường mode entry exists
2. lobby exposes 64-fighter + Best-of-3 contract
3. tournament starts
4. starter selection #1 shows exactly three cards
5. starter cards fit the viewport
6. starter selection #2 works
7. opponent preview renders name/build
8. player build preview renders
9. match starts
10. live Duel round state exists
11. both fighter states remain finite
12. Duel canvas has non-zero backing size
13. combat viewport has non-zero size
14. round HUD renders
15. both combat builds render

Result: **PASS on desktop and mobile**.

This is rendered browser interaction validation. It is not represented as a separate human physical-device session.

## CI and Pages
Two release workflows are used:
- `.github/workflows/pages.yml`: full V0.16 regression chain + all V0.17 content gates before Pages artifact/deploy
- `.github/workflows/v017-validation.yml`: C4/C5 and rendered desktop/mobile C6 validation

Pages publishes only:
- `index.html`
- `css/`
- `js/`

`tests/` is never shipped in the public artifact.

## Release labels
- `js/core.js`: `GAME_VERSION = "V0.17"`
- static document title/version badge: `V0.17`
- Duel lobby is labeled `V0.17 · ĐẤU TRƯỜNG 1V1`

## Explicit post-V0.17 work
The following are intentionally not V0.17 release blockers:
- high-end final fighter art
- sprite/skeletal renderer replacement
- richer VFX/camera polish
- multiple arenas/hazards
- jump/aerial combat
- new tournament variants
- online/global systems
- new skill content beyond the V0.16 ecosystem

## Closure
V0.17 plan is complete. The V0.17 baseline is frozen except for future bug fixes. New feature work should begin under a new roadmap/version rather than reopening closed C1–C6 checkpoints.
