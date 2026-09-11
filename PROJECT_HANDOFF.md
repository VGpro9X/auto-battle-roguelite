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
- V0.18 status: **G0 + G1 + G2 complete, G3 active**.

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
- `tests/v018-g2a-state-replacement-smoke.js`
- `tests/v018-g2b-locomotion-smoke.js`
- `tests/v018-g2c-combat-motion-smoke.js`
- `tests/v018-g2d-presentation-parity-smoke.js`
- `tests/v018-g2e-ranged-cast-block-smoke.js`
- `tests/v018-g2f-full-state-coverage-smoke.js`
- full V0.16/V0.17 regression chain + exact Pages asset validation green through G2F

Important: G2 establishes the complete fighter asset/animation contract. Future artwork refinement must preserve root/anchor/state contracts and must not alter simulation.

## G3 — ACTIVE: Arena + Camera Presentation V2
Current implementation in `main`:
- original `ashen-sanctum` arena manifest
- six visual layers: sky / far / mid / ambient / floor / foreground
- `js/duel-camera.js` presentation-only camera
- shared camera transform for V2 fighters and vector projectile/VFX fallback
- camera framing from both fighter positions with hard bounds
- desktop/mobile zoom limits
- semantic-event impact shake/zoom
- HUYẾT CHIẾN / TỬ CHIẾN phase overlay
- exact Pages arena asset validation added
- G3 smoke gate added under `tests/v018-g3-arena-camera-smoke.js`

G3 remains ACTIVE until the full CI chain and Pages artifact/deploy gates are green.

G3 rules:
- simulation coordinates do not move because of camera
- camera cannot affect targeting or timing
- foreground must never hide critical combat readability
- mobile shake/zoom is visually reduced
- no arena hazards/gameplay geometry changes

## Later checkpoints
- G4: full Duel VFX readability families + major overrides
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
**G0, G1 and G2 are complete. G3 is active and awaiting full green CI closure before moving to G4. Do not change combat/AI/balance.**
