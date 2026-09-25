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
- Current released/public baseline: **V0.23 – Core Survival Skill Impact FX**.
- Previous release: **V0.22 – Galaxy Battlefield Foundation**.
- Runtime/public label: **V0.23**.
- V0.21 status: **Build Intelligence & Choice Clarity COMPLETE / RELEASED**.
- V0.20 status: **B0–B14 COMPLETE / RELEASED** and retained as the visual/presentation baseline.
- V0.19 status: **A0–A15 COMPLETE / RELEASED** and retained as the tactical AI regression baseline.
- V0.18 remains frozen as the graphics/presentation baseline.
- V0.17 remains frozen as the historical Duel mechanics/content baseline.
- V0.16 Survival/Endless remains supported.
- V0.23 release evidence: `V023_RELEASE_VALIDATION.md`.
- V0.22 historical release evidence: `V022_RELEASE_VALIDATION.md`.
- Authoritative V0.21 historical evidence: `V021_RELEASE_VALIDATION.md`.
- Historical V0.20 release evidence: `V020_RELEASE_VALIDATION.md`.
- Historical V0.19 evidence: `V019_RELEASE_VALIDATION.md`.

## Read first
1. `README.md`
2. `PROJECT_HANDOFF.md`
3. `ROADMAP.md`
4. `V021_BUILD_INTELLIGENCE_PLAN.md`
5. `V021_RELEASE_VALIDATION.md`
6. `V022_V026_SURVIVAL_VISUAL_ROADMAP.md`
7. `V022_RELEASE_VALIDATION.md`
6. `V020_COMPLETE_VISUAL_REBUILD_PLAN.md`
5. `V020_B14_RELEASE_SPEC.md`
6. `V019_TACTICAL_AI_PLAN.md`
7. `V019_RELEASE_VALIDATION.md`
8. `V018_GRAPHICS_PLAN.md`
9. `V018_RELEASE_VALIDATION.md`
10. `V017_RELEASE_VALIDATION.md`
11. `V017_DUEL_ARENA_PLAN.md`

Before editing, fetch latest relevant files and SHAs from GitHub `main`.

## V0.23 Survival FX integration
- `js/v023-survival-skill-fx.js` attaches to established combat events; `js/game.js` passes projectile vx/vy to presentation only.
- Canvas shows attack, melee, projectile, spell, control, healing, shield, revive and crit FX on the live Survival/Endless match, on top of the V0.22 Galaxy backdrop. Subtle visual camera shake, low/balanced/full budgets, reduced-motion and clean new-run reset.
- Debug status: `window.getV023SurvivalFxStatus()`. Tests: `tests/v023-survival-skill-fx-smoke.js` (Pages), `tests/v023-survival-fx-browser-driver.html` (real browser), `.github/workflows/v023-survival-fx-browser.yml`.
- Do not alter damage, cooldown, movement AI, rare probabilities, Duel or locked content. Stop at V0.23 for owner test before V0.24.

## V0.22–V0.26 Survival visual roadmap
- Authoritative plan: `V022_V026_SURVIVAL_VISUAL_ROADMAP.md`.
- V0.22 procedural Galaxy backdrop is Survival/Endless only; cached scene lives in `js/v022-galaxy-battlefield.js` and `js/game.js` draws it behind true combat entities.
- V0.23 core hit/skill animation; V0.24 per-skill visual signatures; V0.25 high-tier spectacles; V0.26 polish, mobile optimization and readability.
- Do not change damage, cooldowns, AI, rarity or skill acquisition during visual work. Do not begin V0.23 before owner tests public V0.22.

## V0.21 decision-readability layer
- build tracker summarizes owned Kỹ Năng, Hợp Đạo, Siêu Cấp and Rare counts
- dominant tags describe the current build without changing offer weighting
- nearest unlock routes expose missing Hợp Đạo/Siêu Cấp requirements
- level-up cards distinguish new skills, upgrades, near-max and exact immediate unlocks
- existing one reroll per choice screen remains unchanged
- mobile layout is compact and scroll-safe
- V0.21 owns presentation only; it never writes combat, acquisition, probability or AI truth

## Frozen gameplay/content contract
V0.20 is presentation-first and preserves V0.19 tactical AI/movement decision truth. Do not silently use the visual rebuild as permission for unrelated balance/content changes.

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
**V0.23 Core Survival Skill Impact FX is COMPLETE / RELEASED with live desktop/mobile browser validation. Stop at checkpoint for owner gameplay test before V0.24.**
