# Auto Battle Roguelite — Project Handoff

Use this file as the starting context when continuing development in a new chat.

## Master source
- Repository: `VGpro9X/auto-battle-roguelite`
- Default branch: `main`
- GitHub `main` is canonical.
- Public URL: `https://vgpro9x.github.io/auto-battle-roguelite/`
- Pages workflow: `.github/workflows/pages.yml`
- V0.17 validation workflow: `.github/workflows/v017-validation.yml`
- Fetch current GitHub content + blob SHA before editing existing files.
- Commit every meaningful checkpoint.

## Current project state
- Current released/public baseline: **V0.17 – Duel Arena / Đấu Trường 1v1**.
- Runtime/public label remains **V0.17** until V0.18 release closure.
- V0.17 has no unfinished checkpoint.
- Active roadmap: **V0.18 – Graphics & Presentation Overhaul**.
- Authoritative plan: `V018_GRAPHICS_PLAN.md`.
- V0.18 status: **G0 + G1 + G2 + G3 complete, G4 next**.

## Read first
1. `README.md`
2. `PROJECT_HANDOFF.md`
3. `ROADMAP.md`
4. `V018_GRAPHICS_PLAN.md`
5. `V017_RELEASE_VALIDATION.md`
6. `V017_DUEL_ARENA_PLAN.md`

Then fetch latest before editing:
- `js/duel-renderer.js`
- `js/duel-renderer-v2.js`
- `js/duel-visual-assets.js`
- `js/duel-animation.js`
- `js/duel-camera.js`
- `js/duel-engine.js`
- `js/duel-ui.js`
- `assets/duel/fighters/base/manifest.json`
- `assets/duel/arenas/ashen-sanctum/manifest.json`
- `.github/workflows/pages.yml`

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

Graphics never decide:
- hit success
- damage
- cooldown
- knockback distance
- fatal/revive ordering
- AI decisions
- tournament progression

Survival Movement V0.8 remains untouched.

## G0 — COMPLETE ✅
- V0.18 scope/art direction locked
- asset/manifest architecture locked
- sprite-first/skeletal-ready direction locked
- vector fallback locked

## G1 — COMPLETE ✅
Delivered:
- manifest/image loader + cache
- animation resolver
- per-frame anchors
- Renderer V2 + internal vector/V2 switch
- missing asset fallback
- public Pages `assets/` pipeline
- exact asset-integrity gate

## G2 — COMPLETE ✅
Incremental checkpoints G2A–G2F delivered:
- exact-state clean replacement; no asset-over-vector double drawing
- original base fighter sheets for all required semantic states
- **13 / 13 states:** idle, walk, run, dash, melee, ranged, cast, hit, block, knockback, knockdown, recover, ko
- per-frame anchors: head/chest/leftHand/rightHand/feet/front/back/target
- facing flip and mirrored anchor math
- player/opponent differentiation
- V2 floor/contact shadow
- shield/frost/orbit attachment parity using V2 anchors
- vector fallback still works for optional/missing future states/assets
- G2A–G2F smoke gates
- full V0.16/V0.17 regression chain + exact Pages fighter asset validation green

## G3 — COMPLETE ✅: Arena + Camera Presentation V2
Delivered:
- original canonical arena: `assets/duel/arenas/ashen-sanctum/`
- six manifest-driven layers: sky / far / mid / ambient / floor / foreground
- exact logical geometry match to Duel simulation: `1000×560`, floorY `475`, bounds `54–946`
- parallax transforms without changing simulation coordinates
- richer floor/contact plane + atmosphere + safe foreground
- `js/duel-camera.js` presentation-only camera
- fighter-pair framing with hard camera bounds
- desktop zoom cap `1.24`; mobile cap `1.10`
- mobile-reduced impact shake
- semantic hit/area/cast/KO/phase event camera feedback
- shared camera transform for V2 fighters, vector fallback projectiles and VFX
- HUYẾT CHIẾN / TỬ CHIẾN presentation overlay
- conditional canvas resize so layered rendering is not cleared each frame
- `tests/v018-g3-arena-camera-smoke.js`
- Pages workflow validates every referenced arena layer in the exact public artifact
- V0.16/V0.17/G1/G2/G3 Pages chain green
- V0.17 rendered desktop/mobile flow green
- public Pages deploy green at G3 closure

G3 rules remain locked:
- simulation coordinates never move because of camera
- camera never affects targeting/timing
- no arena hazards/gameplay geometry changes
- foreground cannot hide core combat readability

## G4 — NEXT: Full Duel VFX Readability Pass
Create/upgrade semantic visual families without rewriting mechanics.

Core families:
- physical/melee
- projectile
- fire
- frost
- lightning
- poison/DOT
- blood/lifesteal
- shield/defense
- heal/recovery
- control/slow/stun
- summon/orbit
- explosion/area
- chain
- time/space
- soul/death
- divine/mystic Rare

G4 implementation rules:
- semantic combat events map to visual families
- VFX positions come from stable anchors/world event coordinates
- Hợp Đạo and Siêu Cấp receive stronger presentation than base families
- visually meaningful Rare activations receive distinct readable identities
- projectiles may gain asset-driven presentation but simulation projectile truth stays in `duel-engine.js`
- no VFX changes hitboxes/damage/cooldowns/targets/fatal ordering
- no permanent full-screen VFX wall
- retain vector/V2 fallback safety

Recommended first G4 checkpoint:
1. audit current Duel event vocabulary and skill visual hints
2. add `js/duel-vfx-v2.js` semantic event router
3. implement first shared families: physical/projectile/fire/frost/lightning
4. make Renderer V2 consume them using the G3 camera transform and fighter anchors
5. add a dedicated smoke gate before expanding to poison/blood/defense/control/etc.

## Later checkpoints
- G5: Duel UI/HUD/tournament polish
- G6: performance/quality/fallback hardening
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
**G0, G1, G2 and G3 are complete. Continue V0.18 from G4 Full Duel VFX Readability Pass. Do not reopen V0.17 content/balance and do not change combat/AI/tournament truth.**
