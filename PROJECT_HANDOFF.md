# Auto Battle Roguelite — Project Handoff

Use this file as the starting context when continuing development in a new chat.

## Master source
- Repository: `VGpro9X/auto-battle-roguelite`
- Default branch: `main`
- GitHub `main` is canonical.
- Public URL: `https://vgpro9x.github.io/auto-battle-roguelite/`
- Pages workflow: `.github/workflows/pages.yml`
- V0.19 tactical validation: `.github/workflows/v019-ai-validation.yml`
- V0.19 A14 browser validation: `.github/workflows/v019-a14-browser-validation.yml`
- V0.19 A15 release validation: `.github/workflows/v019-a15-release-validation.yml`
- V0.17 historical validation: `.github/workflows/v017-validation.yml`
- V0.18 G5E/G6D/G6E/G7 workflows remain historical regressions.
- Fetch current GitHub content + blob SHA before editing existing files.
- Commit every meaningful checkpoint.

## Current project state
- Current released/public baseline: **V0.19 – Tactical AI & Movement Intelligence**.
- Runtime/public label: **V0.19**.
- V0.19 status: **A0–A15 COMPLETE / RELEASED**.
- V0.18 remains frozen as the graphics/presentation baseline.
- V0.17 remains frozen as the historical Duel mechanics/content baseline.
- V0.16 Survival/Endless remains supported.
- Authoritative V0.19 evidence: `V019_RELEASE_VALIDATION.md`.

## Read first
1. `README.md`
2. `PROJECT_HANDOFF.md`
3. `ROADMAP.md`
4. `V019_TACTICAL_AI_PLAN.md`
5. `V019_RELEASE_VALIDATION.md`
6. `V018_GRAPHICS_PLAN.md`
7. `V018_RELEASE_VALIDATION.md`
8. `V017_RELEASE_VALIDATION.md`
9. `V017_DUEL_ARENA_PLAN.md`

Before editing, fetch latest relevant files and SHAs from GitHub `main`.

## Frozen gameplay/content contract
V0.19 changes tactical AI/movement decision truth only. Do not silently use it as permission for unrelated balance/content changes.

Locked truth:
- 80 base Kỹ Năng
- 28 Hợp Đạo Kỹ
- 12 Siêu Cấp
- 20 Rare rules
- 64-fighter Duel tournament
- Best-of-3 automatic combat
- two unrestricted starter choices
- one reroll per choice screen
- HUYẾT CHIẾN at 45s
- TỬ CHIẾN at 60s+
- fatal/revive ordering unchanged
- damage/cooldown/skill mechanics unchanged by V0.19

## V0.19 tactical AI stack
### Survival / Endless
- 32-sector encirclement analysis
- predictive escape corridors
- stable escape commitment / hysteresis
- anti-spin heading stability
- stuck/displacement recovery and emergency breakout
- utility-based `escape`, `kite`, `harvest`, `patrol`
- bounded nearby-enemy perception

### Duel 1v1
- tactical perception: range, walls, center, HP, offense readiness
- spatial target scoring
- tactics: ENGAGE / PRESSURE / SPACE / DISENGAGE / CENTER_RESET / CORNER_ESCAPE / FINISH
- post-burst footsies and re-engagement
- corner escape + pressure release
- melee/ranged/mobility/sustain/control weighting
- bounded decision cadence + commitment
- same AI rules/information for both sides

## V0.19 validation closure
Pre-promotion A14 head: `5f5568031c11009ec1bea68d8d49de89de67b6d0`.

On that head:
- A0–A12 deterministic gates ✅
- A13 Survival simulation matrix ✅
- A13 Duel simulation matrix ✅
- A14 bounded AI performance smoke ✅
- A14 desktop/mobile browser AI validation ✅
- V0.17 historical regression ✅
- V0.18 mobile UI/G5E/G6D/G6E/G7 regressions ✅
- Pages deploy ✅

A15 promotes the public/runtime label only after that matrix is green and then revalidates the promoted state.

## V0.18 graphics stack — frozen regression baseline
- asset/manifest-driven Renderer V2 normal path
- V0.17 vector renderer verified fallback
- 13 / 13 fighter states
- eight required per-frame anchors
- six-layer `Ashen Sanctum`
- presentation-only camera/parallax/shake/zoom
- semantic VFX families
- Duel UI/HUD/tournament presentation
- full/constrained/reduced-motion paths

## Ownership/truth rules
Simulation owns positions/facing, action state, HP/shield, hit/damage/dodge result, projectile truth, control/KO state, combat events, AI decision truth and tournament outcome.

Graphics/UI never decide hit success, damage, cooldown, fatal/revive ordering, skill offer truth or tournament progression.

## Locked terminology / project rules
- Kỹ Năng / Hợp Đạo Kỹ / Siêu Cấp / Thần Kỹ / Thần Bí Kỹ / TỐI ĐA.
- Player-facing UI remains Vietnamese.
- No hidden gameplay caps/cooldowns/stack maxima/target limits/retry rules/weighting.
- Preserve V0.12 hidden-shield-cap removal.
- Preserve Survival `Săn Ấn`: marked target gives +25% base XP only.
- Choice-card relation hints only appear when that exact choice immediately completes the unlock.
- Tests stay under `tests/` and are not shipped publicly.

## Status for next conversation
**V0.19 is COMPLETE / RELEASED and is the current frozen public baseline. V0.18 remains the graphics/presentation regression baseline; V0.17 remains the historical mechanics/content regression baseline. Start future feature work from a new explicitly approved roadmap rather than silently reopening V0.19 combat/content truth.**
