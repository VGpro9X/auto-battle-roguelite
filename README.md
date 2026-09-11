# Auto Battle Roguelite

Current release: **V0.17 – Duel Arena / Đấu Trường 1v1**

Active development: **V0.18 – Graphics & Presentation Overhaul**

Public build: `https://vgpro9x.github.io/auto-battle-roguelite/`

GitHub `main` is canonical.

## Current status
- V0.17 is **COMPLETE / RELEASED**.
- V0.18 graphics roadmap is **ACTIVE**.
- V0.18 G0 planning/architecture lock is complete.
- V0.18 G1 asset loader + Renderer V2 foundation is complete.
- Next checkpoint: **G2 — Fighter Visual V2**.
- Runtime/public build remains labeled **V0.17** until V0.18 passes its final release gates.

See `V018_GRAPHICS_PLAN.md` for the authoritative V0.18 plan.

## V0.18 direction
V0.18 upgrades graphics and presentation while preserving V0.17 gameplay truth.

Primary goals:
- original higher-quality 2D fighter art/animation
- asset-driven Renderer V2
- sprite-sheet/image-sequence first, with a skeletal-ready abstraction for later
- manifest-driven public asset pipeline
- one production-quality multi-layer Duel arena
- camera/parallax/impact presentation
- full Duel VFX readability coverage
- stronger Hợp Đạo / Siêu Cấp / Rare visual identities
- Duel HUD/menu polish
- desktop/mobile rendering quality and performance validation

Core rule: **renderer changes must not change combat outcome, AI, hitboxes, damage timing, tournament progression or balance.**

The V0.17 vector renderer remains a verified fallback during V0.18 development.

G1 has now proven the manifest loader/cache, semantic animation metadata, per-frame anchors, Renderer V2 switch, vector fallback and exact Pages `assets/` pipeline with one proof asset. G2 should expand fighter state coverage incrementally and validate each state in-engine before mass-producing final art.

## V0.17 release
V0.17 adds a complete automatic side-view tournament mode while preserving the existing Survival/Endless game.

### Đấu Trường 1v1
- **64 fighters** in a single-elimination bracket: `64 → 32 → 16 → 8 → 4 → 2 → Champion`
- Every matchup is **Best-of-3**; first to 2 round wins advances.
- Fighters are fully AI-controlled.
- Two unrestricted starter skill selections; no forced offensive starter.
- One reward choice after every non-final match victory.
- Duel skills use **Rank I / II / III**, with Rank III = **TỐI ĐA**.
- One `XOAY LẠI` on each choice screen.
- Pre-match scouting shows opponent build/style before combat.
- Renderer is isolated from combat logic so V0.18 can replace the prototype presentation without rewriting the Duel engine.

### Complete V0.16 ecosystem in Duel
- **80 / 80 Kỹ Năng**
- **28 / 28 Hợp Đạo Kỹ**
- **12 / 12 Siêu Cấp**
- **20 / 20 rare rules** = 10 Thần Kỹ + 10 Thần Bí Kỹ

Hợp Đạo and Siêu Cấp unlock automatically from build requirements and do not consume reward selections.

### Tournament Rare rules
Rare chance after tournament wins:
- after win 1: **0%**
- after win 2: **3%**
- after win 3: **6%**
- after win 4: **10%**
- after win 5 / before final: **15%**

Rules:
- no starter Rare
- at most one Rare card in a 3-card reward roll
- Rare rules are unique/level-less; no duplicate ownership
- reroll performs a new Rare roll
- player and AI use the same stage chance and ownership rules

## Duel combat rules
- Base normal attack is close-range; ranged behavior comes from the current build.
- AI evaluates build-derived preferred distance instead of using rigid classes.
- Round pressure is explicit:
  - `0–45s`: normal
  - `45–60s`: **HUYẾT CHIẾN**
  - `60s+`: **TỬ CHIẾN** until K.O.
- Round state resets between rounds; tournament build persists.

## V0.17 validation
Release gates cover:
- every V0.16 regression test
- 80 base Duel skill mechanics
- all 28 Hợp Đạo mechanics
- all 12 Siêu Cấp mechanics/unlock truth
- all 20 Rare mechanics, acquisition curve, uniqueness and defensive ordering
- full-system deterministic matchup simulation
- defensive mirror termination through TỬ CHIẾN
- 64-player bracket progression
- rendered browser interaction at desktop `1440×900` and mobile `390×844`
- exact GitHub Pages artifact/deployment

See `V017_RELEASE_VALIDATION.md` for the frozen V0.17 release evidence.

## Existing Survival/Endless content
V0.16 Survival/Endless remains intact with:
- 80 base Kỹ Năng
- 28 Hợp Đạo Kỹ
- 12 Siêu Cấp
- 20 Rare rules
- 140 Codex entries
- Rare System V2 and one-reroll choice screens

## Locked development rules
- Movement baseline: **V0.8 Strategic Movement AI**; do not rewrite unless explicitly requested.
- Player-facing UI remains Vietnamese.
- No hidden gameplay caps/cooldowns/stack maxima/target limits/retry rules/weighting.
- Preserve V0.12 hidden-shield-cap removal.
- Preserve Survival `Săn Ấn`: marked target gives +25% base XP only.
- Choice-card relation hints only appear when that exact choice immediately completes the corresponding unlock.
- Executable tests stay under `tests/`.
- Before editing an existing file, fetch the latest GitHub content/blob SHA and commit each meaningful checkpoint.

## Read before V0.18 work
1. `README.md`
2. `PROJECT_HANDOFF.md`
3. `ROADMAP.md`
4. `V018_GRAPHICS_PLAN.md`
5. `V017_RELEASE_VALIDATION.md`
6. `V017_DUEL_ARENA_PLAN.md`

## Project status
**V0.17 is the clean released baseline. V0.18 is active at G0 + G1 complete / G2 next.**
