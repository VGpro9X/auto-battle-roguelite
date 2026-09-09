# Auto Battle Roguelite — Roadmap

GitHub `main` is canonical.

## Current baseline
- Released baseline: **V0.16 – Skill Expansion & Rare System V2**.
- Public/runtime label: **V0.16**.
- Current content: **80 Kỹ Năng + 28 Hợp Đạo Kỹ + 12 Siêu Cấp + 20 rare = 140 Codex entries**.
- Movement baseline: **V0.8 Strategic Movement AI**; do not rewrite unless explicitly requested.
- Player-facing language: Vietnamese.
- Mechanical-truth, no-hidden-cap and final-piece-only Hợp Đạo/Siêu Cấp hint rules remain locked.

Read before future work:
1. `README.md`
2. `PROJECT_HANDOFF.md`
3. `BALANCE_BASELINE_V016.md`
4. `BALANCE_FIXED_BUILDS_V016.md`
5. `V016_RELEASE_VALIDATION.md`
6. `V016_SKILL_DESIGN.md`
7. `V016_RARE_SYSTEM_V2.md`

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

V0.16 runtime and Pages release are final and stable.

---

# Post-release focused balance pass — COMPLETE / CLOSED

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
No gameplay number was changed. Tuning an individual skill from these artificial endpoint scenarios would be weaker evidence than the accepted real-run release state.

## B3 Post-tuning validation — NOT REQUIRED
No B2 gameplay change exists to compare before/after. Existing V0.16 CI, Pages-artifact browser validation and hands-on sign-off remain valid.

---

# PROJECT STATUS — CLEAN / READY FOR NEW PLAN
There is currently **no active development checkpoint and no unfinished implementation task**.

V0.16 remains the canonical stable baseline. The focused balance pass is closed without changing released gameplay values.

A future roadmap may start from a clean slate. Possible directions, only as ideas rather than active commitments:
- bosses
- additional enemy archetypes
- advanced Hợp Đạo layers
- meta progression
- more base skills
- deeper Endless systems
- new game modes

Do not begin any of these until a new plan is explicitly chosen.
