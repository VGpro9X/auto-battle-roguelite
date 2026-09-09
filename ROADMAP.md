# Auto Battle Roguelite — Roadmap

GitHub `main` is canonical.

## Current baseline
- Released baseline: **V0.16 – Skill Expansion & Rare System V2**.
- Stable Survival/Endless release: **V0.16**.
- Active development roadmap: **V0.17 – Duel Arena / Đấu Trường 1v1**.
- Current V0.16 content: **80 Kỹ Năng + 28 Hợp Đạo Kỹ + 12 Siêu Cấp + 20 rare = 140 Codex entries**.
- Movement baseline: **V0.8 Strategic Movement AI**; do not rewrite for Duel. Duel receives a separate side-view AI controller.
- Player-facing language: Vietnamese.
- Mechanical-truth, no-hidden-cap and final-piece-only Hợp Đạo/Siêu Cấp hint rules remain locked for existing modes.

Read before future work:
1. `README.md`
2. `PROJECT_HANDOFF.md`
3. `V017_DUEL_ARENA_PLAN.md`
4. `BALANCE_BASELINE_V016.md`
5. `BALANCE_FIXED_BUILDS_V016.md`
6. `V016_RELEASE_VALIDATION.md`
7. `V016_SKILL_DESIGN.md`
8. `V016_RARE_SYSTEM_V2.md`

---

# V0.15 — COMPLETE
Responsive phone/tablet/desktop UI accepted on GitHub Pages.

# V0.16 — COMPLETE / RELEASED
Released content:
- Base Kỹ Năng: **64 → 80** ✅
- Hợp Đạo Kỹ: **20 → 28** ✅
- Siêu Cấp: **8 → 12** ✅
- Rare rules: **4 → 20** ✅
  - 10 Thần Kỹ
  - 10 Thần Bí Kỹ
- Codex: **140 entries** ✅

Major V0.16 systems completed:
- 16 new base Kỹ Năng
- 8 new Hợp Đạo Kỹ
- 4 new Siêu Cấp
- Rare System V2 with multiple different rares per run
- rare offer chance scaling from Lv8, capped at 12%
- one `XOAY LẠI` per choice screen
- Vô Hạn starts with one uniformly random rare from the full 20-rule pool
- cross-platform icon compatibility
- dedicated Codex/live feedback for all 20 rare rules
- layered rare-mechanic ordering CI
- exact Pages-artifact Chromium validation
- real-device user sign-off

V0.16 Survival/Endless remains the stable baseline while V0.17 is developed.

---

# Post-release V0.16 focused balance pass — COMPLETE / CLOSED

## B1.1 Environment/pressure baseline — COMPLETE
Files:
- `BALANCE_BASELINE_V016.md`
- `tests/balance-baseline-v016.js`

Released pressure anchors are frozen in CI. No gameplay value was changed.

Key structural facts:
- timed modes share the same normalized spawn-density curve; mode pressure changes HP/damage
- expected timed-run spawns: ~662 / 1325 / 1987 / 2649 for 5/10/15/20 minutes
- timed end pressure: ~361 nominal spawns/min, 20% elite chance, 0.27s spawn cooldown
- Endless reaches its 0.20s spawn cooldown and 72% extra-spawn caps around 20 minutes; HP/damage continue increasing afterward

## B1.2 Fixed-build scenarios — COMPLETE
File: `BALANCE_FIXED_BUILDS_V016.md`.

Exact final V0.16 Pages artifact was exercised with deterministic offense, defense, summon/control and rare-heavy endpoint builds at 5 and 10 minutes.

Main 10-minute observations:
- offense: ~120.3 kills/min, ~96.3% observed clear, 3/3 complete
- summon/control: ~114.0 kills/min, ~94.0% observed clear, high output but fragile late
- rare-heavy defensive hybrid: ~79.7 kills/min, ~64.1% observed clear, 3/3 complete with strong shield survival
- pure defense: ~11.8 kills/min and ~10.8% observed clear; analysis reaches the 901-living-enemy measurement safety threshold while the player remains alive

These deliberately extreme fixed-at-time-0 builds show clear archetype trade-offs but do **not** isolate one numeric value that justifies a safe nerf/buff.

## B2 Targeted tuning — CLOSED, NO CHANGE
No gameplay number was changed.

## B3 Post-tuning validation — NOT REQUIRED
No B2 gameplay change exists to compare before/after.

---

# V0.17 — DUEL ARENA / ĐẤU TRƯỜNG 1v1 — ACTIVE

Full implementation contract: `V017_DUEL_ARENA_PLAN.md`.

Locked core direction:
- 64-fighter single-elimination tournament
- `64 → 32 → 16 → 8 → 4 → 2 → Champion`
- side-view combat with a separate Duel engine and renderer
- player fighter remains fully automatic
- best-of-3 matchups
- no jump in the first version
- build-driven close/ranged/hybrid AI behavior
- two unrestricted starter skill selections
- one skill reward after each non-final matchup victory
- Duel skills use Rank I/II/III instead of Survival levels
- prototype begins with 16 existing base skill identities, then expands in audited batches
- one flat prototype arena, architecture ready for more arenas later
- prototype vector/silhouette graphics must be replaceable by future sprite/skeletal rendering without changing combat logic
- V0.16 Survival/Endless mechanics are not to be rewritten for this mode

## D0 Plan/design lock — COMPLETE
- `V017_DUEL_ARENA_PLAN.md` created ✅
- V0.17 marked active in roadmap ✅

## D1 Isolated Duel foundation — ACTIVE
- Duel mode entry
- separate side-view canvas/UI
- 64-fighter tournament state
- 2 starter selections + one reroll per selection
- opponent preview
- best-of-3 round state machine

## D2 Combat engine + replaceable renderer — NEXT
## D3 First 16 Duel skill adapters — NEXT
## D4 Complete tournament loop — NEXT
## D5 Prototype validation / CI — NEXT
## D6 Skill expansion toward all 140 entries — LATER
## D7 Presentation/arena expansion — LATER

# PROJECT STATUS
**V0.17 Duel Arena development is active from the clean V0.16 baseline.**
