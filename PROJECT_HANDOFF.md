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
- Runtime/public label remains **V0.17** until V0.18 G7 release closure.
- V0.17 has no unfinished checkpoint.
- Active roadmap: **V0.18 – Graphics & Presentation Overhaul**.
- Authoritative plan: `V018_GRAPHICS_PLAN.md`.
- V0.18 status: **G0 + G1 + G2 + G3 + G4 complete, G5 next**.

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
- `js/duel-vfx-v2.js`
- `js/duel-vfx-tier.js`
- `js/duel-camera.js`
- `js/duel-engine.js`
- `js/duel-ui.js`
- `css/v017-duel.css`
- `index.html`
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
- 15 cumulative VFX families:
  - physical
  - projectile
  - fire
  - frost
  - lightning
  - poison
  - blood
  - defense
  - heal
  - control
  - summon
  - area
  - chain
  - time
  - soul
- event/world-coordinate + fighter-anchor placement
- stronger Hợp Đạo / Siêu Cấp overlays
- 20 / 20 Rare visual signatures
- combat-active Rare semantic trigger audit
- `divineGift` intentionally reward-only; no fabricated combat VFX
- visible `heavenSeal` consumption presentation event
- transient VFX expiry / no permanent screen wall
- plain K.O. intentionally remains legacy-owned until G5 safely replaces presentation
- G4A–G4E CI gates green
- full V0.16/V0.17/G1–G4 Pages chain green
- V0.17 desktop/mobile rendered validation green
- Pages deploy green at G4 closure

G4 rules remain locked:
- no VFX changes hitboxes, damage, cooldowns, targeting, fatal ordering or projectile truth
- VFX only visualizes semantic events

## G5 — NEXT: Duel UI / HUD / Tournament Presentation Polish
Recommended implementation order:
1. **G5A — Combat HUD shell**
   - improve HP/shield/timer/round/phase hierarchy
   - preserve current DOM IDs used by `duel-ui.js`
   - desktop + phone safe-area layout
   - do not hide the arena/fighters with large opaque panels
2. **G5B — Lobby + scouting**
   - polish Duel mode entry, lobby and versus screen
   - make player/opponent identity clearer
3. **G5C — Reward/build cards**
   - improve rank/tier/Hợp Đạo/Siêu Cấp/Rare readability
   - preserve exact choice semantics and reroll behavior
4. **G5D — Match outcome presentation**
   - round start
   - K.O.
   - match win/elimination
   - Champion state
5. **G5E — rendered UI closure audit**
   - desktop/mobile browser validation
   - no overflow/click-blocking regressions

Suggested G5 files:
- `css/v018-graphics.css` or another dedicated V0.18 UI stylesheet
- existing `css/v017-duel.css` only as an import/compatibility bridge if useful
- `js/duel-ui.js` only when markup/state hooks are actually needed
- tests under `tests/`

G5 rules:
- player-facing UI stays Vietnamese
- runtime/public label remains V0.17 until G7
- UI must not alter combat or tournament truth
- maintain mobile safe areas and usable touch targets
- do not create opaque overlays that obscure active combat for long periods

## Later checkpoints
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
**G0, G1, G2, G3 and G4 are complete. Continue V0.18 from G5 Duel UI / HUD / Tournament Presentation Polish. Do not reopen V0.17 content/balance and do not change combat/AI/tournament truth.**
