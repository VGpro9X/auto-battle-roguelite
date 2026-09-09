# Auto Battle Roguelite

Current release: **V0.16 – Skill Expansion & Rare System V2**

Public build: `https://vgpro9x.github.io/auto-battle-roguelite/`

GitHub `main` is canonical.

## Release content
- **80 base Kỹ Năng**
- **28 Hợp Đạo Kỹ**
- **12 Siêu Cấp**
- **20 rare rules** = 10 Thần Kỹ + 10 Thần Bí Kỹ
- **140 Codex entries**

## V0.16 run systems
### Rare System V2
Different Thần Kỹ/Thần Bí Kỹ can coexist; duplicates cannot.

Normal level-up rare chance:
- Lv1–7: 0%
- Lv8: 1%
- +0.35 percentage point each later level
- cap 12%

At most one rare appears in a 3-card roll. Eligible unowned rares are selected uniformly; there is no hidden weighting.

### One reroll per choice screen
Every starter/level-up choice screen has exactly one **XOAY LẠI**. It rerolls all three choices, performs a fresh rare roll, cannot be used twice on the same screen, and does not carry over.

### Vô Hạn guaranteed starting rare
Every Vô Hạn run:
1. grants one uniformly random rare from the full 20-rule pool
2. shows a dedicated reveal
3. continues to one normal starter Kỹ Năng choice
4. excludes only the already-owned rare from later offers
5. still allows other rares through the normal level-scaled curve

## Locked development rules
- Movement baseline: **V0.8 Strategic Movement AI**; do not rewrite unless explicitly requested.
- Player-facing language remains Vietnamese.
- No hidden caps/cooldowns/stack maxima/target limits/retry rules/weighting.
- Partial Hợp Đạo/Siêu Cấp progress stays only in **BỘ KỸ NĂNG & LIÊN KẾT**.
- Choice-card relation hints only appear when that exact choice immediately completes a Hợp Đạo Kỹ or Siêu Cấp.
- Preserve V0.12 hidden-shield-cap removal.
- Preserve Săn Ấn truth: marked target gives +25% base XP only.
- Executable test harnesses stay under `tests/`; Pages deploys only `index.html`, `css/`, `js/`.

## V0.16 validation — COMPLETE
Release validation includes:
- exact registry counts: 80 / 28 / 12 / 20
- 140 Codex entries
- all 20 rare previews with distinct visual identities
- difficult layered rare ordering in CI
- rare-rate deterministic simulation
- 20-rare VFX stress
- exact Pages-artifact Chromium validation
- desktop/mobile responsive checks
- user hands-on sign-off with no blocking issue

Runtime/public label is final **V0.16**.

## Post-release focused balance pass — COMPLETE / CLOSED
### B1.1 pressure baseline
`BALANCE_BASELINE_V016.md` and `tests/balance-baseline-v016.js` freeze the released enemy-pressure curve in CI.

### B1.2 fixed-build measurements
`BALANCE_FIXED_BUILDS_V016.md` records deterministic exact-Pages-artifact scenarios for offense, defense, summon/control and rare-heavy endpoint builds at 5 and 10 minutes.

10-minute summary:
- offense: ~120.3 kills/min, ~96.3% observed clear
- summon/control: ~114.0 kills/min, ~94.0% observed clear, fragile late
- rare-heavy defensive hybrid: ~79.7 kills/min, ~64.1% observed clear, strong shield survival
- pure defense: ~11.8 kills/min, ~10.8% observed clear and large crowd accumulation while remaining alive

These deliberately extreme fixed-at-time-0 builds show expected archetype trade-offs but do not isolate a single gameplay value strongly enough to justify a safe buff/nerf.

Therefore:
- targeted tuning B2: **closed with no gameplay changes**
- post-tuning B3: **not required**
- released V0.16 gameplay numbers remain unchanged

## Current project status
**Clean baseline. No active checkpoint. No unfinished implementation task.**

The project is ready for a new roadmap chosen by the user.

## Project continuity
Read before future work:
- `PROJECT_HANDOFF.md`
- `ROADMAP.md`
- `BALANCE_BASELINE_V016.md`
- `BALANCE_FIXED_BUILDS_V016.md`
- `V016_RELEASE_VALIDATION.md`
- `V016_SKILL_DESIGN.md`
- `V016_RARE_SYSTEM_V2.md`

Before editing an existing file, fetch its latest GitHub content/SHA and commit after each meaningful checkpoint.
