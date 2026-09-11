# Auto Battle Roguelite — Project Handoff

Use this file as the starting context when continuing development in a new chat.

## Master source
- Repository: `VGpro9X/auto-battle-roguelite`
- Default branch: `main`
- GitHub `main` is canonical.
- Public URL: `https://vgpro9x.github.io/auto-battle-roguelite/`
- Pages workflow: `.github/workflows/pages.yml`
- V0.17 validation workflow: `.github/workflows/v017-validation.yml`
- V0.18 G5E rendered UI workflow: `.github/workflows/v018-g5e-ui-validation.yml`
- Fetch current GitHub content + blob SHA before editing existing files.
- Commit every meaningful checkpoint.

## Current project state
- Current released/public baseline: **V0.17 – Duel Arena / Đấu Trường 1v1**.
- Runtime/public label remains **V0.17** until V0.18 G7 release closure.
- V0.17 has no unfinished checkpoint.
- Active roadmap: **V0.18 – Graphics & Presentation Overhaul**.
- Authoritative plan: `V018_GRAPHICS_PLAN.md`.
- V0.18 status: **G0 + G1 + G2 + G3 + G4 + G5 complete, G6 next**.

## Read first
1. `README.md`
2. `PROJECT_HANDOFF.md`
3. `ROADMAP.md`
4. `V018_GRAPHICS_PLAN.md`
5. `V017_RELEASE_VALIDATION.md`
6. `V017_DUEL_ARENA_PLAN.md`

Then fetch latest before editing:
- `js/duel-visual-assets.js`
- `js/duel-animation.js`
- `js/duel-camera.js`
- `js/duel-vfx-v2.js`
- `js/duel-vfx-tier.js`
- `js/duel-renderer.js`
- `js/duel-renderer-v2.js`
- `js/duel-engine.js`
- `js/duel-ui.js`
- `js/duel-ui-polish.js`
- `css/v018-graphics.css`
- `css/v018-ui.css`
- `css/v017-duel.css`
- `.github/workflows/pages.yml`
- `.github/workflows/v018-g5e-ui-validation.yml`

## Frozen gameplay contract
Do not alter V0.17 gameplay merely to implement V0.18 visuals.

Simulation owns:
- positions/facing
- action state
- HP/shield
- hit/damage/dodge result
- projectile truth
- control/KO state
- combat events
- tournament result

Graphics/UI never decide:
- hit success
- damage
- cooldown
- knockback distance
- fatal/revive ordering
- AI decisions
- skill offer truth
- tournament progression

Survival Movement V0.8 remains untouched.

## G0 — COMPLETE ✅
- V0.18 scope/art direction locked
- asset/manifest architecture locked
- sprite-first/skeletal-ready direction locked
- vector fallback locked

## G1 — COMPLETE ✅
- manifest/image loader + cache
- animation resolver
- per-frame anchors
- Renderer V2 + vector fallback
- public Pages `assets/` pipeline
- exact asset-integrity gate

## G2 — COMPLETE ✅
- exact-state clean replacement
- original base fighter sheets
- **13 / 13 states:** idle, walk, run, dash, melee, ranged, cast, hit, block, knockback, knockdown, recover, ko
- per-frame anchors: head/chest/leftHand/rightHand/feet/front/back/target
- facing flip + mirrored anchor math
- side differentiation
- floor/contact shadow
- shield/frost/orbit parity
- G2A–G2F smoke gates green

## G3 — COMPLETE ✅
- original `Ashen Sanctum` arena
- six manifest-driven layers
- exact logical Duel geometry preserved
- `js/duel-camera.js` presentation-only camera
- fighter-pair framing + hard bounds
- desktop/mobile-safe zoom
- semantic impact shake/zoom
- shared world→screen transform
- HUYẾT CHIẾN / TỬ CHIẾN presentation
- G3 Pages + rendered validation green

## G4 — COMPLETE ✅: Full Duel VFX Readability Pass
Delivered through G4A–G4E:
- `js/duel-vfx-v2.js` semantic event router
- `js/duel-vfx-tier.js` tier/Rare visual classifier
- 15 cumulative VFX families: physical, projectile, fire, frost, lightning, poison, blood, defense, heal, control, summon, area, chain, time, soul
- event/world-coordinate + fighter-anchor placement
- stronger Hợp Đạo / Siêu Cấp overlays
- 20 / 20 Rare visual signatures
- combat-active Rare semantic trigger audit
- `divineGift` intentionally reward-only; no fabricated combat VFX
- visible `heavenSeal` consumption presentation event
- transient VFX expiry / no permanent screen wall
- G4A–G4E CI gates green
- full V0.16/V0.17/G1–G4 Pages chain green

G4 rules remain locked:
- no VFX changes hitboxes, damage, cooldowns, targeting, fatal ordering or projectile truth
- VFX only visualizes semantic events

## G5 — COMPLETE ✅: Duel UI / HUD / Tournament Presentation Polish
Delivered through G5A–G5E:
1. **G5A — Combat HUD shell**
   - improved HP/shield/timer/score/round/phase hierarchy
   - existing Duel HUD DOM IDs preserved
   - desktop/phone safe-area layout
   - combat HUD remains pointer-transparent except intentional controls
2. **G5B — Lobby + scouting**
   - polished Duel mode entry, lobby and VS/scouting screen
   - clearer player/opponent identity
3. **G5C — Reward/build cards**
   - clearer Rank/TỐI ĐA/Hợp Đạo/Siêu Cấp/Rare hierarchy
   - exact-choice evolution hints preserved
   - one-reroll behavior preserved
4. **G5D — Match outcome presentation**
   - `ROUND`, `K.O.`, round winner and draw/replay presentation uses existing engine events
   - Champion/Bị loại styling mirrors already-resolved result truth via `js/duel-ui-polish.js`
   - no UI/result helper computes tournament outcomes
5. **G5E — rendered UI closure audit**
   - dedicated `.github/workflows/v018-g5e-ui-validation.yml`
   - desktop + mobile headless-browser flow
   - checks scroll reachability, click blocking, horizontal overflow, HUD pointer behavior and combat-center occlusion
   - exposed a real mobile bug where the lobby start button could be unreachable
   - fixed by making long Duel overlays scrollable on mobile with safe-area padding
   - public graphics cache key advanced to `v018-g5e`

G5 closure evidence:
- G5D smoke gate green
- G5E desktop/mobile rendered UI closure green
- V0.17 desktop/mobile rendered validation green
- full V0.16/V0.17/G1–G5 Pages chain green
- Pages deploy green

## G6 — NEXT: Performance / Quality / Fallback Hardening
Recommended implementation order:
1. **G6A — quality policy + observability foundation**
   - add presentation-only quality policy module (planned `js/duel-visual-quality.js`)
   - distinguish full vs constrained/mobile/reduced-motion presentation without changing simulation
   - expose readable status/limits for tests and renderer consumers
2. **G6B — cache/preload/memory sanity**
   - audit manifest/image cache lifecycle
   - avoid duplicate loads and unbounded decoded-image retention
3. **G6C — transient presentation budgets**
   - cap/dedupe presentation-only particles/effects under stress
   - never drop or alter simulation events before non-visual consumers
4. **G6D — vector fallback hardening**
   - validate Renderer V2 partial/missing-asset and forced fallback paths
5. **G6E — performance/fallback closure**
   - desktop/mobile rendered checks
   - stress + fallback evidence
   - full regression/Pages green

G6 rules:
- performance caps are visual-only; never hidden gameplay caps
- no quality mode changes combat, AI, skill offers, cooldowns, damage or outcomes
- reduced-motion reduces presentation motion, not semantic information
- vector fallback must remain able to finish a Duel
- runtime/public label stays V0.17 until G7

## Later checkpoint
- G7: final V0.18 integration/release validation

## Locked terminology / truth rules
- Kỹ Năng / Hợp Đạo Kỹ / Siêu Cấp / Thần Kỹ / Thần Bí Kỹ / TỐI ĐA.
- Player-facing UI remains Vietnamese.
- No hidden gameplay caps/cooldowns/stack maxima/target limits/retry rules/weighting.
- Preserve V0.12 hidden-shield-cap removal.
- Preserve Survival `Săn Ấn`: marked target gives +25% base XP only.
- Choice-card relation hints only appear when that exact choice immediately completes the unlock.
- Tests stay under `tests/` and are not shipped publicly.

## Status for next conversation
**G0, G1, G2, G3, G4 and G5 are complete. Continue V0.18 from G6 Performance / Quality / Fallback Hardening. Do not reopen V0.17 content/balance and do not change combat/AI/tournament truth.**
