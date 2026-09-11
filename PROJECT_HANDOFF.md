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
- Released/public baseline: **V0.17 – Duel Arena / Đấu Trường 1v1**.
- Runtime/public label remains **V0.17** until V0.18 release closure.
- Active roadmap: **V0.18 – Graphics & Presentation Overhaul**.
- Authoritative plan: `V018_GRAPHICS_PLAN.md`.
- V0.18 status: **G0 + G1 + G2 complete, G3 next**.

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
- `js/duel-engine.js`
- `js/duel-ui.js`
- `assets/duel/fighters/base/manifest.json`
- `.github/workflows/pages.yml`

For G3, expected new/next files include:
- `js/duel-camera.js`
- arena manifest/assets under `assets/duel/arenas/`
- optional `css/v018-graphics.css` when presentation styling needs it

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

## G3 — NEXT: Arena + Camera Presentation V2
Goal: replace the flat prototype stage presentation without changing the logical arena geometry.

Implement incrementally:
1. arena manifest + public multi-layer asset pipeline
2. one original arena with sky/far/mid/floor/foreground layers
3. `js/duel-camera.js` presentation camera
4. camera framing based on both fighter positions
5. hard bounds so fighters never leave view
6. mild parallax
7. mild impact shake/zoom driven by semantic visual events only
8. HUYẾT CHIẾN / TỬ CHIẾN presentation treatment
9. desktop/mobile camera validation

G3 rules:
- simulation coordinates do not move because of camera
- camera cannot affect targeting or timing
- foreground must never hide critical combat readability
- mobile shake/zoom may be visually reduced
- no arena hazards/gameplay geometry changes unless separately promoted to scope

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
**Start from G3 only. G0, G1 and G2 are complete. Build the arena/camera presentation incrementally, preserve Renderer V2/vector fallback and do not change combat/AI/balance.**

Recommended continuation prompt:

`Tiếp tục VGpro9X/auto-battle-roguelite V0.18 từ G3. GitHub main là canonical. G0/G1/G2 đã complete và fighter Renderer V2 có đủ 13/13 semantic states. Bắt đầu bằng arena manifest + multi-layer asset pipeline và duel-camera.js, giữ logical arena/combat/AI/balance nguyên vẹn, commit sau mỗi checkpoint có ý nghĩa.`
