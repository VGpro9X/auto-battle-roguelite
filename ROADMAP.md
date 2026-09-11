# Auto Battle Roguelite — Roadmap

GitHub `main` is canonical.

## Current baseline
- Released baseline: **V0.16 – Skill Expansion & Rare System V2**.
- Stable Survival/Endless release: **V0.16**.
- Active development roadmap: **V0.17 – Duel Arena / Đấu Trường 1v1**.
- V0.16 content: **80 Kỹ Năng + 28 Hợp Đạo Kỹ + 12 Siêu Cấp + 20 rare = 140 Codex entries**.
- Movement baseline: **V0.8 Strategic Movement AI**; do not rewrite for Duel.
- Player-facing language: Vietnamese.

Read before future V0.17 work:
1. `README.md`
2. `PROJECT_HANDOFF.md`
3. `V017_DUEL_ARENA_PLAN.md`
4. `V017_COMPLETION_PLAN.md` ← authoritative V0.17 Definition of Done
5. `BALANCE_BASELINE_V016.md`
6. `BALANCE_FIXED_BUILDS_V016.md`
7. `V016_RELEASE_VALIDATION.md`
8. `V016_SKILL_DESIGN.md`
9. `V016_RARE_SYSTEM_V2.md`

---

# V0.15 — COMPLETE
Responsive phone/tablet/desktop UI accepted on GitHub Pages.

# V0.16 — COMPLETE / RELEASED

Released content:
- Base Kỹ Năng: **80** ✅
- Hợp Đạo Kỹ: **28** ✅
- Siêu Cấp: **12** ✅
- Rare rules: **20** ✅
  - 10 Thần Kỹ
  - 10 Thần Bí Kỹ
- Codex: **140 entries** ✅

V0.16 Survival/Endless remains the stable baseline while V0.17 is developed.

Post-release V0.16 focused balance pass is **COMPLETE / CLOSED** with no gameplay-number change required.

---

# V0.17 — DUEL ARENA / ĐẤU TRƯỜNG 1v1 — ACTIVE

Design contract: `V017_DUEL_ARENA_PLAN.md`.

Completion contract: `V017_COMPLETION_PLAN.md`.

## V0.17 scope lock

**V0.17 = complete Đấu Trường mode + complete integration of the existing V0.16 skill ecosystem.**

V0.17 may be marked `COMPLETE / RELEASED` only when all of the following are complete:

- 64-fighter tournament ✅/required
- best-of-3 automatic Duel combat ✅/required
- build-aware side-view AI ✅/required
- starter/reward/reroll progression ✅/required
- **80 / 80 Kỹ Năng Duel**
- **28 / 28 Hợp Đạo Kỹ Duel**
- **12 / 12 Siêu Cấp Duel**
- **20 / 20 rare Duel rules**
- full-content integration/balance pass
- full V0.16 + V0.17 CI
- public Pages validation
- desktop/mobile hands-on release validation
- final runtime/docs changed from `V0.17 DEV` to **V0.17**

High-end art, extra arenas and jump/air combat are explicitly **post-V0.17** and do not block this release.

---

## Completed V0.17 foundation

### D0 — Plan/design lock — COMPLETE
- original V0.17 design contract ✅
- completion Definition of Done locked ✅

### D1 — Isolated Duel foundation — COMPLETE
- Duel mode entry ✅
- separate side-view canvas/UI ✅
- 64-fighter tournament state ✅
- 2 unrestricted starter selections + one reroll per selection ✅
- opponent preview ✅
- best-of-3 state machine ✅

### D2 — Combat engine + replaceable renderer — COMPLETE
- isolated Duel combat loop; Survival untouched ✅
- flat prototype arena ✅
- melee basic attack + move/retreat/hold/dash AI ✅
- HP/shield/KO/round reset ✅
- 45s HUYẾT CHIẾN + 60s TỬ CHIẾN ✅
- semantic fighter action/anchor API ✅
- replaceable vector renderer ✅

### D3/D4 — Tournament gameplay loop — COMPLETE
- build-derived fighting distance/style ✅
- non-player match simulation ✅
- exact `64 → 32 → 16 → 8 → 4 → 2 → Champion` advancement ✅
- one build reward after each non-final victory ✅
- player elimination and Champion flows ✅
- pre-match scouting ✅

### D5 — Prototype automated/Pages validation — COMPLETE
- deterministic tournament/combat tests ✅
- all V0.16 CI remains green ✅
- GitHub Pages Duel artifact deploys ✅

Hands-on final release sign-off remains part of C6 because content integration is not finished yet.

---

# D6 — Full skill ecosystem integration — ACTIVE

Current status:

- Base Kỹ Năng Duel: **80 / 80 COMPLETE** ✅
- Hợp Đạo Kỹ Duel: **0 / 28**
- Siêu Cấp Duel: **0 / 12**
- Rare Duel: **0 / 20**

Base-skill expansion is CLOSED except for bugs/regressions. Frozen CI checkpoints exist at 40/50/60/70/80.

## C1 — Hợp Đạo foundation — NEXT
- dedicated Duel synergy registry
- Duel requirement evaluator
- automatic unlock after build changes
- player/AI parity
- round state receives unlocked synergies
- first real end-to-end tested Hợp Đạo

**Exit:** synergy framework stable.

## C2 — 28 / 28 Hợp Đạo Kỹ
Recommended audited batches:
- C2A: `0 → 8`
- C2B: `8 → 16`
- C2C: `16 → 22`
- C2D: `22 → 28`

Every Duel reinterpretation must be explicit in its description. Hợp Đạo never consumes a reward selection.

**Exit:** all 28 mechanics + all-28 CI gate.

## C3 — 12 / 12 Siêu Cấp
- evolution requirement foundation
- base skill must be Duel Rank III / TỐI ĐA
- support/tag requirement must be satisfied
- automatic unlock; no reward slot consumed
- exact-final-piece hint truth
- batches to `6 / 12` then `12 / 12`

**Exit:** all 12 mechanics + unlock/hint CI.

## C4 — 20 / 20 Rare rules
Tournament rare curve:
- after first win: `0%`
- after second win: `3%`
- after third win: `6%`
- after fourth win: `10%`
- after fifth win / before final: `15%`

Rules:
- no starter rare
- at most one rare card in a reward roll
- unique/level-less; no duplicates
- reroll rerolls the rare roll
- AI uses same stage-based chance/ownership rules

Recommended checkpoints:
- rare framework
- `10 / 20`
- `20 / 20`
- final rare ordering/conflict gate

**Exit:** all 20 mechanics + deterministic ordering/acquisition CI.

## C5 — Full integration + focused balance
Validate the complete system together:

`80 base + 28 Hợp Đạo + 12 Siêu Cấp + 20 rare`

Required coverage:
- melee/ranged/hybrid
- defense/control/summon
- elemental/DOT/projectile/area/chain
- late-build AI spacing
- Hợp Đạo/Siêu Cấp attainability in the short tournament
- rare frequency by stage
- revive/fatal/shield/heal ordering
- defense-vs-defense TỬ CHIẾN termination
- offscreen bracket simulation sanity

Goal is release stability and removal of broken/dead/dominant outliers, not perfect esport-level balance.

**Exit:** no release blocker, no stalled match, no known broken dominant interaction.

## C6 — Final release validation and closure

Automated:
- all V0.16 CI green
- all V0.17 skill-system CI green
- deterministic 64-player tournaments complete
- elimination + Champion paths work
- exact Pages artifact contains all Duel modules
- public deploy succeeds

Hands-on:
- desktop tournament flow
- mobile/responsive tournament flow
- readable/tappable skill choices
- readable preview/build/HUD/result UI
- no major visual-mechanical desync
- no blocking navigation bug

Closure:
- fix release blockers
- update `README.md`, `ROADMAP.md`, `PROJECT_HANDOFF.md`
- change `V0.17 DEV` → **V0.17**
- mark **V0.17 COMPLETE / RELEASED**
- freeze V0.17 baseline

---

# After V0.17 — NOT RELEASE BLOCKERS

Future roadmap may include:
- higher-quality fighter art and animation
- sprite/skeletal renderer replacement
- richer VFX/camera impact
- more arenas / hazards
- jump and aerial combat
- new tournament variants
- online/global systems
- new content beyond the V0.16 skill ecosystem

These are new-version goals, not unfinished V0.17 tasks.

---

# PROJECT STATUS

**V0.17 Duel Arena foundation is complete and deployed. All 80/80 base Kỹ Năng are integrated. The remaining locked release path is C1 Hợp Đạo foundation → C2 28 Hợp Đạo → C3 12 Siêu Cấp → C4 20 rare → C5 integration/balance → C6 final validation → V0.17 COMPLETE / RELEASED.**
