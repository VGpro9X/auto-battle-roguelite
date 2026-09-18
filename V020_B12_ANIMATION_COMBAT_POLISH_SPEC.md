# V0.20 — B12 Animation & Combat Polish

Status: **COMPLETE ✅ — B12A/B12B/B12C VALIDATED**

B12 improves motion readability and combat impact without changing simulation truth.

## Locked boundary
B12 must not change:
- damage or healing values
- cooldowns or skill timers
- AI decisions or movement
- hitboxes / collision
- round timing or HUYẾT CHIẾN / TỬ CHIẾN
- fatal / revive ordering
- skill acquisition or reroll rules

## B12A — Duel impact readability
Runtime source: `js/duel-vfx-v3.js`.

B12A adds:
- hit impact rings for readable contact confirmation
- directional slash trails for physical melee events
- stronger critical-hit impact structure
- dedicated KO burst language
- reduced-motion variants with shorter/simpler geometry
- quality-budget reuse from the existing V3 VFX system

The layer consumes already-emitted render events only. It does not mutate fighters, combat state, timers or skill data.

## Public wiring
`index.html` now loads:
- `js/duel-vfx-v3.js?v=020-b12a`

This prevents the public Pages build from retaining the older B7 VFX file in browser cache after B12A ships.

## Validation
- `tests/v020-b12a-combat-polish-smoke.js`
  - confirms hit/melee/KO event ownership
  - confirms B12A runtime marker
  - confirms reduced-motion mode
  - rejects direct combat-state mutation from the presentation layer
  - confirms the public cache key

## B12B — camera impact timing
Runtime source: `js/duel-camera.js`.

B12B adds directional presentation kick for hit and KO events:
- horizontal kick follows event position/target side
- critical hits and KOs receive stronger bounded impulse
- impulses decay independently from existing shake/zoom response
- mobile keeps the existing reduced camera scale
- reduced-motion quality sets shake, zoom and directional kick to zero

Validation:
- `tests/v020-b12b-camera-impact-smoke.js`
- historical G3 and G6E camera regressions
- `.github/workflows/v020-b12b-camera-impact-validation.yml`

## B12C — browser closure
`tests/v020-b12c-combat-browser-driver.html` renders real Canvas2D presentation and validates:
- hit ring / slash / KO VFX are visibly drawn
- directional camera impact is active on normal desktop/mobile
- mobile zoom remains within the existing camera contract
- reduced-motion disables camera kick while preserving semantic VFX
- B12A runtime status is available in-browser

`.github/workflows/v020-b12c-combat-browser-validation.yml` passed desktop, mobile and forced reduced-motion coverage.

## Handoff
B12 is complete. Next checkpoint: **B13 — Optimization / Mobile / Fallback**.

Public/runtime version remains V0.19 until B14.
