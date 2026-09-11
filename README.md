# Auto Battle Roguelite

Current release: **V0.17 – Duel Arena / Đấu Trường 1v1**

Public build: `https://vgpro9x.github.io/auto-battle-roguelite/`

GitHub `main` is canonical.

## V0.17 release
V0.17 adds a complete automatic side-view tournament mode while preserving the existing Survival/Endless game.

### Đấu Trường 1v1
- **64 fighters** in a single-elimination bracket: `64 → 32 → 16 → 8 → 4 → 2 → Champion`
- Every matchup is **Best-of-3**; first to 2 round wins advances.
- Fighters are fully AI-controlled. The player builds the fighter and watches the AI adapt its spacing/action choices to the build.
- Two unrestricted starter skill selections; no forced offensive starter.
- One reward choice after every non-final match victory.
- Duel skills use **Rank I / II / III**, with Rank III = **TỐI ĐA**.
- One `XOAY LẠI` on each choice screen.
- Pre-match scouting shows opponent build/style before combat.
- Flat side-view prototype arena with a renderer isolated from combat logic, so fighter art/animation can be replaced later without rewriting the Duel engine.
- No jump/air combat in V0.17; that is a post-V0.17 feature.

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
  - `45–60s`: **HUYẾT CHIẾN**, damage rises and new healing/shield generation falls
  - `60s+`: **TỬ CHIẾN**, damage ×2, healing/new shield generation = 0 until K.O.
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
- Rare Monte Carlo against the locked 3/6/10/15% curve
- rendered browser interaction at desktop `1440×900` and mobile `390×844`
- exact GitHub Pages artifact/deployment

Focused V0.17 balance validation found no release-blocking stalled match or cleanly isolated value requiring a safe buff/nerf, so the release does not include arbitrary balance-number changes.

See `V017_RELEASE_VALIDATION.md` for the frozen release evidence.

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
- No hidden caps/cooldowns/stack maxima/target limits/retry rules/weighting.
- Preserve V0.12 hidden-shield-cap removal.
- Preserve Survival `Săn Ấn`: marked target gives +25% base XP only.
- Choice-card relation hints only appear when that exact choice immediately completes the corresponding unlock.
- Executable tests stay under `tests/`; Pages deploys only `index.html`, `css/`, `js/`.
- Before editing an existing file, fetch the latest GitHub content/blob SHA and commit each meaningful checkpoint.

## Project status
**V0.17 is COMPLETE / RELEASED. There is no unfinished V0.17 implementation checkpoint.**

High-end fighter art, extra arenas, jump/air combat, additional tournament variants and online/global systems are future-version work, not missing V0.17 scope.

Read before future work:
1. `README.md`
2. `PROJECT_HANDOFF.md`
3. `ROADMAP.md`
4. `V017_RELEASE_VALIDATION.md`
5. `V017_DUEL_ARENA_PLAN.md`
6. `V017_COMPLETION_PLAN.md`
