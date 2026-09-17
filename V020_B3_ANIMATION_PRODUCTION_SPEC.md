# V0.20 — B3 Fighter Animation Production Spec

Status: **ACTIVE — B3.1–B3.2 RUNTIME COMPLETE / B3.3 NEXT**

Canonical fighter: Ash Wanderer. Concept/master boards are reference only and are never cropped directly into runtime.

## Batch order
### B3.1 Locomotion — COMPLETE ✅
- idle: 6 frames
- walk: 8 frames
- run: 8 frames
- dash: 6 frames

### B3.2 Combat / casting — COMPLETE ✅
- melee: 10 frames
- ranged: 8 frames
- cast: 10 frames
- block: 5 frames

### B3.3 Reactions / defeat — NEXT
- hit: 4 frames
- knockback: 5 frames
- knockdown: 8 frames
- recover: 8 frames
- ko: 8 frames

## Frame contract
- logical cell 256×256
- right-facing canonical source
- displayWorldWidth 176
- stable `feet` root; simulation owns world displacement
- eight anchors per frame: head, chest, leftHand, rightHand, feet, front, back, target
- transparent SVG runtime sheets
- no poster UI, embedded text or environment inside runtime fighter sheets
- gameplay/VFX truth remains outside sprite art

## Runtime production-state gate
Renderer V3 refuses to resolve a fighter state unless its manifest entry passes the production contract. A valid entry requires `status: production`, a non-empty source, valid frame/fps/loop metadata and one complete eight-anchor set per frame. Incomplete or missing states remain on Renderer V2 automatically.

## Real partial-replacement path
B3 uses a real partial V3 runtime path:
1. Bridge resolves production states before V2 rendering.
2. V3 fighter sides are passed through `skipFighterSides`.
3. Renderer V2/vector suppress those fighter bodies only.
4. V3 reuses Renderer V2's final camera transform.
5. V3 draws contact shadow, side identity and fighter sprite.
6. Shield/frost/orbit presentation is restored for replaced fighters.
7. Missing states continue through V2 without changing simulation.

## Animation timing
V3 clocks are state-relative rather than round-relative. Non-loop actions start at frame zero on semantic state entry and clamp at their final frame; loop states cycle from their state-entry timestamp.

## B3.1 production assets
- `idle.svg` — 6× 256×256, loop
- `walk.svg` — 8× 256×256, loop
- `run.svg` — 8× 256×256, loop
- `dash.svg` — 6× 256×256, non-loop

## B3.2 production assets
- `melee.svg` — 10× 256×256, non-loop
- `ranged.svg` — 8× 256×256, non-loop
- `cast.svg` — 10× 256×256, non-loop
- `block.svg` — 5× 256×256, non-loop

Body animation and semantic VFX remain separated: melee does not bake hit/slash truth, ranged does not bake projectile truth, cast does not bake spell-impact truth, and block does not imply invulnerability. The simulation/event layer remains authoritative.

`assets/v020/fighters/ash-wanderer/manifest.json` is `partial-production` and currently promotes eight states independently to V3. Reaction/defeat states still fall back to V2.

## Validation
Relevant gates:
- `tests/v020-b3-state-production-gate.js`
- `tests/v020-b3-anchor-mirror-smoke.js`
- `tests/v020-b3-idle-runtime-smoke.js`
- `tests/v020-b3-partial-replacement-smoke.js`

The partial replacement gate now covers all B3.1/B3.2 runtime files, dimensions, frame contracts, per-frame anchors, no embedded poster text, state-relative timing, shared camera transform and retained attachments.

## Cache/deployment wiring
B3 renderer bootstrap and V2 partial-render hook are cache-busted. Public version text remains V0.19; B3 progress does not promote the public release label.

## Acceptance gate per state
A state remains production only when identity, frame contract, root/crop/scale, eight anchors, semantic loop/end behavior, mirroring, compact readability, runtime-clean asset rules and V3/V2 fallback isolation remain valid.

## Current task
**B3.1–B3.2 COMPLETE. Begin B3.3: `hit` → `knockback` → `knockdown` → `recover` → `ko`.** These states are presentation only and must not alter hit truth, displacement truth, control duration, fatal/revive ordering or KO outcome.