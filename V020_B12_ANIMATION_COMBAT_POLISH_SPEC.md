# V0.20 — B12 Animation & Combat Polish

Status: **ACTIVE — B12A DUEL IMPACT POLISH INTEGRATED**

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

## Remaining B12 work
- **B12B:** camera/impact timing audit and controlled hit-stop-like presentation cues without pausing simulation
- **B12C:** mobile/reduced-motion combat browser closure and final B12 documentation

Public/runtime version remains V0.19 until B14.
