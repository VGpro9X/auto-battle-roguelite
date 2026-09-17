# V0.20 — B3 Fighter Animation Production Spec

Status: **COMPLETE ✅ — 13/13 RUNTIME STATES**

Canonical fighter: Ash Wanderer. Concept/master boards remain reference only and are never cropped directly into runtime.

## Completed state coverage
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

### B3.3 Reactions / defeat — COMPLETE ✅
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

## Real partial-replacement path
Renderer V3 uses real fighter replacement rather than drawing over V2:
1. Bridge resolves production states before V2 rendering.
2. V3 fighter sides are passed through `skipFighterSides`.
3. Renderer V2/vector suppress those fighter bodies only.
4. V3 reuses Renderer V2's final camera transform.
5. V3 draws contact shadow, side identity and fighter sprite.
6. Shield/frost/orbit presentation is restored for replaced fighters.
7. Invalid/missing V3 state data still deterministically falls back to V2.

## State validation
A V3 fighter state requires:
- `status: production`
- valid runtime source
- positive frame/fps metadata
- explicit loop flag
- exactly one complete eight-anchor set per frame

State-relative clocks ensure non-loop actions begin at frame zero on semantic state entry and clamp at the last frame; looping states cycle from their own entry timestamp.

## Runtime assets
B3 runtime fighter sheets now cover all 13 semantic states under `assets/v020/fighters/ash-wanderer/`.

The original large fighter manifest contains B3.1/B3.2 production states. B3.3 reaction/defeat production metadata lives in `b3-final-states.json` and is merged by Renderer V3 at preload time. This avoids rewriting the large base manifest through the connector while preserving deterministic validation and explicit runtime paths.

## Validation gates
- `tests/v020-b3-state-production-gate.js`
- `tests/v020-b3-anchor-mirror-smoke.js`
- `tests/v020-b3-idle-runtime-smoke.js`
- `tests/v020-b3-partial-replacement-smoke.js`
- `tests/v020-b3-full-state-runtime-smoke.js`

The final coverage gate verifies 13/13 production states, asset existence, frame metadata, per-frame anchors, runtime-clean SVGs, V2 fighter suppression and supplemental-state merge.

## Gameplay ownership
B3 changes presentation only. It does not alter hit truth, displacement, action timing truth, control duration, damage, cooldowns, fatal/revive ordering, AI decisions, skill offers or tournament outcomes.

## Exit
**B3 COMPLETE. Next checkpoint: B4 — Enemy Visual Families.** Public/runtime release label remains V0.19 until B14 validation and promotion.