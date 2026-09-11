# Auto Battle Roguelite — Roadmap

GitHub `main` is canonical.

## Current baseline
- Released baseline: **V0.17 – Duel Arena / Đấu Trường 1v1**.
- Survival/Endless V0.16 systems remain supported inside V0.17.
- Movement baseline: **V0.8 Strategic Movement AI**; do not rewrite unless explicitly requested.
- Player-facing language: Vietnamese.

---

# V0.15 — COMPLETE
Responsive phone/tablet/desktop UI accepted on GitHub Pages.

# V0.16 — COMPLETE / RELEASED
- 80 base Kỹ Năng ✅
- 28 Hợp Đạo Kỹ ✅
- 12 Siêu Cấp ✅
- 20 Rare rules ✅
- 140 Codex entries ✅
- post-release focused balance pass CLOSED with no gameplay-number change required ✅

# V0.17 — DUEL ARENA / ĐẤU TRƯỜNG 1v1 — COMPLETE / RELEASED ✅

Design contract: `V017_DUEL_ARENA_PLAN.md`.
Completion contract: `V017_COMPLETION_PLAN.md`.
Release evidence: `V017_RELEASE_VALIDATION.md`.

## Released scope
- 64-fighter tournament ✅
- exact `64 → 32 → 16 → 8 → 4 → 2 → Champion` advancement ✅
- Best-of-3 automatic Duel combat ✅
- side-view build-aware AI ✅
- separate Duel movement/combat; Survival Movement V0.8 untouched ✅
- two unrestricted starter choices ✅
- one reroll on every choice screen ✅
- one reward after each non-final match victory ✅
- opponent preview/scouting ✅
- Duel Rank I/II/III, Rank III = TỐI ĐA ✅
- **80 / 80 Kỹ Năng Duel** ✅
- **28 / 28 Hợp Đạo Kỹ Duel** ✅
- **12 / 12 Siêu Cấp Duel** ✅
- **20 / 20 Rare Duel rules** ✅
- full integration/focused balance gate ✅
- full V0.16 + V0.17 CI ✅
- rendered desktop/mobile browser validation ✅
- public GitHub Pages deployment ✅
- runtime/public label promoted from `V0.17 DEV` to **V0.17** ✅

## D0 — Plan/design lock — COMPLETE ✅
- original V0.17 design contract
- release Definition of Done

## D1 — Isolated Duel foundation — COMPLETE ✅
- Duel entry and separate UI/canvas
- 64-fighter tournament state
- two unrestricted starter choices
- opponent preview
- Best-of-3 state machine

## D2 — Combat engine + replaceable renderer — COMPLETE ✅
- isolated Duel combat loop
- flat prototype arena
- build-aware approach/hold/retreat/dash behavior
- HP/shield/KO/round reset
- 45s HUYẾT CHIẾN + 60s TỬ CHIẾN
- semantic combat events / replaceable vector renderer

## D3/D4 — Tournament gameplay loop — COMPLETE ✅
- build-derived fighting distance/style
- non-player bracket simulation
- elimination/Champion flows
- reward progression and reroll
- scouting

## D5 — Prototype automated/Pages validation — COMPLETE ✅
- deterministic tournament/combat tests
- V0.16 regression suite remains green
- Pages deployment

## D6 — Full skill ecosystem integration — COMPLETE ✅

### Base Kỹ Năng — 80 / 80 COMPLETE ✅
Frozen expansion checkpoints: 40 / 50 / 60 / 70 / 80.

### C1/C2 — Hợp Đạo — 28 / 28 COMPLETE ✅
- dedicated Duel registry/evaluator
- automatic unlock; no reward slot consumed
- player/AI parity
- C2A `0→8` ✅
- C2B `8→16` ✅
- C2C `16→22` ✅
- C2D `22→28` ✅
- all-28 mechanics gate ✅

### C3 — Siêu Cấp — 12 / 12 COMPLETE ✅
- base skill must be Duel Rank III / TỐI ĐA
- support/tag requirements
- automatic unlock; no reward slot consumed
- exact-final-piece hint truth
- C3A `0→6` ✅
- C3B `6→12` ✅
- all-12 CI gate ✅

### C4 — Rare — 20 / 20 COMPLETE ✅
Tournament chance after wins 1/2/3/4/5:
`0% / 3% / 6% / 10% / 15%`.

Locked rules:
- no starter Rare
- at most one Rare in a reward roll
- unique/level-less; no duplicate ownership
- reroll rerolls the Rare roll
- AI and player use the same stage chance/ownership rules
- deterministic defensive ordering is tested
- all-20 mechanics/acquisition gate ✅

### C5 — Full integration + focused balance — COMPLETE ✅
Validated together:
`80 base + 28 Hợp Đạo + 12 Siêu Cấp + 20 Rare`.

Release evidence includes:
- melee/ranged/elemental/defense matchup termination
- defense-v-defense reaches TỬ CHIẾN and still terminates
- 24-seed mirrored hybrid side sanity
- all 12 Siêu Cấp attainable within the short tournament selection budget
- Rare Monte Carlo close to locked 3/6/10/15% curve
- complete 64-player bracket simulation

No release-blocking stalled match or cleanly isolated numeric outlier was found; no arbitrary gameplay-number patch was selected.

### C6 — Final release validation and closure — COMPLETE ✅
- full V0.16 CI green
- full V0.17 skill-system CI green
- rendered Chrome tournament flow on desktop `1440×900` ✅
- rendered Chrome tournament flow on mobile `390×844` ✅
- skill choices, preview, combat canvas/HUD/build state verified in browser ✅
- exact Pages artifact contains all Duel modules ✅
- public deploy succeeds ✅
- README / ROADMAP / PROJECT_HANDOFF updated ✅
- runtime/static label = **V0.17** ✅

---

# After V0.17 — NOT RELEASE BLOCKERS
Potential future roadmap:
- higher-quality fighter art and animation
- sprite/skeletal renderer replacement
- richer VFX/camera impact
- more arenas/hazards
- jump/aerial combat
- new tournament variants
- online/global systems
- new content beyond the V0.16 ecosystem

These are future-version goals, not unfinished V0.17 work.

---

# PROJECT STATUS

**V0.17 COMPLETE / RELEASED. No unfinished V0.17 checkpoint remains. Wait for the user's next roadmap before starting new feature work or balance tuning.**
