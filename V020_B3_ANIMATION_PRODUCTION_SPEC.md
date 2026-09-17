# V0.20 — B3 Fighter Animation Production Spec

Status: **ACTIVE — B3.1 LOCOMOTION RUNTIME COMPLETE / B3.2 NEXT**

Canonical fighter: Ash Wanderer. Concept/master boards are reference only and are never cropped directly into runtime.

## Batch order
### B3.1 Locomotion — COMPLETE ✅
- idle: 6 frames
- walk: 8 frames
- run: 8 frames
- dash: 6 frames

### B3.2 Combat / casting — NEXT
- melee: 10 frames
- ranged: 8 frames
- cast: 10 frames
- block: 5 frames

### B3.3 Reactions / defeat
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
- transparent SVG runtime sheets for current locomotion production
- no poster UI, embedded text or environment inside runtime fighter sheets
- gameplay/VFX truth remains outside sprite art

## Runtime production-state gate
Renderer V3 refuses to resolve a fighter state unless its manifest entry passes the production contract. A valid entry requires:
- `status: production`
- non-empty `src`
- positive integer `frameCount`
- positive `fps`
- explicit boolean `loop`
- exactly one anchor set per frame
- all eight required anchors with finite coordinates

Incomplete/missing states remain on Renderer V2 automatically.

## Real partial-replacement path
B3 now uses an actual partial V3 runtime path rather than drawing a V3 proof image over V2:
1. Bridge resolves production states before V2 rendering.
2. V3 production fighter sides are passed through `skipFighterSides`.
3. Renderer V2 and its vector fallback suppress those fighters only.
4. V3 reuses Renderer V2's final camera transform, so shake/zoom/arena coordinates remain aligned.
5. V3 draws contact shadow, side identity and fighter sprite.
6. Shield/frost/orbit presentation is restored for the replaced fighter.
7. Missing states continue through V2 without changing simulation.

## Animation timing
V3 animation clocks are state-relative, not round-relative. Each fighter side tracks semantic state entry time. This is required for non-loop states such as `dash`; a dash no longer jumps directly to its last frame merely because the round has been running for several seconds.

## B3.1 runtime assets
Production files:
- `assets/v020/fighters/ash-wanderer/idle.svg` — 6× 256×256 cells
- `assets/v020/fighters/ash-wanderer/walk.svg` — 8× 256×256 cells
- `assets/v020/fighters/ash-wanderer/run.svg` — 8× 256×256 cells
- `assets/v020/fighters/ash-wanderer/dash.svg` — 6× 256×256 cells

`manifest.json` is now `partial-production` and promotes `idle`, `walk`, `run`, `dash` independently to V3. All remaining states still resolve through V2.

## B3.1 validation
The locomotion manifest records anchors per frame and keeps the existing 256×256 / 176-world-width contract. `dash` is explicitly non-looping; idle/walk/run loop.

Relevant gates:
- `tests/v020-b3-state-production-gate.js`
- `tests/v020-b3-anchor-mirror-smoke.js`
- `tests/v020-b3-idle-runtime-smoke.js`
- `tests/v020-b3-partial-replacement-smoke.js`

The partial-replacement smoke gate checks V2 suppression, shared camera transform, state-relative timing presence, retained attachments, locomotion asset dimensions/frame contracts and no poster text in runtime SVGs.

## Cache/deployment wiring
`index.html` now cache-busts the B3 renderer bootstrap and `duel-renderer.js` cache-busts the updated V2 partial-render hook. Public version text remains V0.19; this does not promote V0.20 release status.

## Acceptance gate per state
A state remains production only when:
1. identity remains coherent with Ash Wanderer;
2. frame target is explicit;
3. root/crop/scale follow the contract;
4. eight anchors exist for every frame;
5. loop/end semantics are correct;
6. right/left mirroring remains usable;
7. compact presentation remains readable;
8. no embedded UI/text/watermark artifacts exist;
9. V3 resolves the state without breaking V2 fallback states.

## Current task
**B3.1 LOCOMOTION COMPLETE. Begin B3.2 in order: `melee` → `ranged` → `cast` → `block`.** Combat assets must use the same real runtime path, keep VFX separable from body art, and must not invent hit/damage/cooldown truth.