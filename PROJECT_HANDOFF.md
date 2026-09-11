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
- V0.18 G6D fallback workflow: `.github/workflows/v018-g6d-fallback-validation.yml`
- V0.18 G6E performance workflow: `.github/workflows/v018-g6e-performance-validation.yml`
- Fetch current GitHub content + blob SHA before editing existing files.
- Commit every meaningful checkpoint.

## Current project state
- Current released/public baseline: **V0.17 – Duel Arena / Đấu Trường 1v1**.
- Runtime/public label remains **V0.17** until V0.18 G7 release closure.
- V0.17 has no unfinished checkpoint.
- Active roadmap: **V0.18 – Graphics & Presentation Overhaul**.
- Authoritative plan: `V018_GRAPHICS_PLAN.md`.
- V0.18 status: **G0 + G1 + G2 + G3 + G4 + G5 + G6 complete, G7 next**.

## Read first
1. `README.md`
2. `PROJECT_HANDOFF.md`
3. `ROADMAP.md`
4. `V018_GRAPHICS_PLAN.md`
5. `V017_RELEASE_VALIDATION.md`
6. `V017_DUEL_ARENA_PLAN.md`

Then fetch latest before editing:
- `index.html`
- `js/duel-visual-assets.js`
- `js/duel-animation.js`
- `js/duel-visual-quality.js`
- `js/duel-camera.js`
- `js/duel-vfx-v2.js`
- `js/duel-vfx-tier.js`
- `js/duel-vfx-budget.js`
- `js/duel-renderer.js`
- `js/duel-renderer-v2.js`
- `js/duel-engine.js`
- `js/duel-ui.js`
- `js/duel-ui-polish.js`
- `css/v018-graphics.css`
- `css/v018-ui.css`
- `css/v017-duel.css`
- `.github/workflows/pages.yml`
- `.github/workflows/v017-validation.yml`
- `.github/workflows/v018-g5e-ui-validation.yml`
- `.github/workflows/v018-g6d-fallback-validation.yml`
- `.github/workflows/v018-g6e-performance-validation.yml`

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

G5 closure evidence:
- G5D smoke gate green
- G5E desktop/mobile rendered UI closure green
- V0.17 desktop/mobile rendered validation green
- full V0.16/V0.17/G1–G5 Pages chain green
- Pages deploy green

## G6 — COMPLETE ✅: Performance / Quality / Fallback Hardening
Delivered through G6A–G6E:
1. **G6A — quality policy + observability**
   - `js/duel-visual-quality.js`
   - explicit full/constrained presentation profiles
   - reduced-motion policy
   - DPR / VFX / camera presentation budgets exposed for tests/runtime
2. **G6B — cache/preload/memory sanity**
   - manifest/image load dedupe
   - pending/settled cache status
   - decoded-image memory estimate
   - safe LRU pruning of settled lookup entries without invalidating renderer-held images
3. **G6C — transient presentation budgets**
   - `js/duel-vfx-budget.js`
   - bounded core/tier transient VFX arrays
   - `droppedPresentation` observability
   - semantic input event arrays remain unchanged
4. **G6D — vector fallback hardening**
   - forced vector mode completes a Best-of-3 Duel in browser validation
   - partial fighter assets + missing arena manifest fall back cleanly and still finish a Duel
   - browser gate exposed invalid `ctx.ellipse()` argument count in Renderer V2; fixed to the correct 7-argument call
5. **G6E — performance/fallback closure**
   - canvas DPR cap now follows active quality profile
   - camera shake/zoom honors full/constrained/reduced-motion presentation multipliers
   - production V2 runtime preload confirms all 13 states + `Ashen Sanctum`
   - production cache settles with zero pending image/manifest loads in browser audit
   - desktop full-quality path passes
   - mobile constrained-quality path passes
   - reduced-motion path passes while semantic VFX remains visible
   - VFX stress budgets cap presentation objects without mutating semantic events
   - V2 Best-of-3 match completes under the production renderer path
   - outer `duel-renderer.js` cache key and changed inner G6 modules are cache-busted for deployed clients
   - V0.17 C6 and G5E browser checks are timing-safe under virtual-time without weakening their assertions

G6 closure evidence on the final G6 runtime head:
- V0.17 static/release audit green
- V0.17 desktop/mobile rendered validation green
- G5E desktop/mobile UI validation green
- G6D forced-vector + partial-asset fallback browser validation green
- G6E desktop/mobile/reduced-motion browser validation green
- full V0.16/V0.17/G1–G6E Pages chain green
- exact public fighter + arena asset artifact validation green
- Pages deploy green

G6 rules remain locked:
- performance caps are visual-only; never hidden gameplay caps
- no quality mode changes combat, AI, skill offers, cooldowns, damage or outcomes
- reduced-motion reduces presentation motion, not semantic information
- vector fallback must remain able to finish a Duel
- runtime/public label stays V0.17 until G7

## G7 — NEXT: V0.18 Integration / Release Validation
Required closure work:
1. run/freeze the final V0.16 + V0.17 mechanics and rendered regression matrix
2. validate production Renderer V2 normal path with all 13 states and `Ashen Sanctum`
3. validate forced-vector fallback and production V2 fallback evidence
4. validate production browser console has no missing asset/runtime errors
5. validate desktop + mobile end-to-end rendered Duel flow and completed V2 match
6. validate exact Pages artifact contains all required production assets
7. create `V018_RELEASE_VALIDATION.md` with evidence
8. only after every gate is green, promote runtime/public label to **V0.18**
9. rerun final validation on the promoted-label head and freeze the accepted V0.18 baseline

Do not promote the label early.

## Locked terminology / truth rules
- Kỹ Năng / Hợp Đạo Kỹ / Siêu Cấp / Thần Kỹ / Thần Bí Kỹ / TỐI ĐA.
- Player-facing UI remains Vietnamese.
- No hidden gameplay caps/cooldowns/stack maxima/target limits/retry rules/weighting.
- Preserve V0.12 hidden-shield-cap removal.
- Preserve Survival `Săn Ấn`: marked target gives +25% base XP only.
- Choice-card relation hints only appear when that exact choice immediately completes the unlock.
- Tests stay under `tests/` and are not shipped publicly.

## Status for next conversation
**G0, G1, G2, G3, G4, G5 and G6 are complete. Continue V0.18 from G7 Integration / Release Validation. Keep the public/runtime label at V0.17 until every G7 gate passes. Do not reopen V0.17 content/balance and do not change combat/AI/tournament truth.**
