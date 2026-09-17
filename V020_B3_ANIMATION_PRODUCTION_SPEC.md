# V0.20 — B3 Fighter Animation Production Spec

Status: **ACTIVE — PRODUCTION STATE GATE READY / DEDICATED IDLE ASSET NEXT**

Canonical fighter: Ash Wanderer. Concept/master boards are reference only and are never cropped directly into runtime.

## Batch order
### B3.1 Locomotion
- idle: 6 frames
- walk: 8 frames
- run: 8 frames
- dash: 6 frames

### B3.2 Combat / casting
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
- stable `feet` root; no accidental locomotion baked into sprite root
- eight anchors per frame: head, chest, leftHand, rightHand, feet, front, back, target
- transparent background for runtime character derivatives
- no baked environment or text
- body art and semantic VFX are separated wherever practical

## Motion rules
Idle loops without visible root drift. Walk/run use contact/pass/recoil/up/down structure with coherent cloth follow-through. Dash may show anticipation and motion silhouette but simulation owns actual displacement. Mirrored playback preserves front/back and hand anchor semantics.

## Source-board review
The V0.20 animation reference boards generated so far successfully lock the broad Ash Wanderer motion language and prove that locomotion, reactions, melee, ranged and cast poses remain readable at the intended presentation scale.

They are **not accepted as runtime sprite sheets**. Observed generation drift that dedicated production must correct:
- some reference-board frame counts differ from canonical targets;
- numbering/labels are presentation artifacts and cannot become runtime metadata;
- some frames include baked slash/projectile/magic effects;
- root/pivot alignment is visually approximate rather than deterministic;
- exact eight-anchor coordinates are not encoded;
- generated sheets include poster UI/background rather than isolated transparent cells;
- optional special/ultimate/color-variant material is non-canonical and does not imply new gameplay.

Therefore no state is promoted to `production` from the boards themselves.

## Dedicated source production rule
For each semantic state, generate or construct a clean state-only source sequence from the locked master identity. Normalize every frame into the 256×256 logical cell, remove poster/background material, separate reusable VFX, then author anchors and run validation. Only the resulting dedicated derivative may be referenced by `assets/v020/fighters/ash-wanderer/manifest.json`.

## Runtime production-state gate
Renderer V3 now refuses to resolve a fighter state unless its manifest entry passes the production contract. A valid entry requires:
- `status: production`
- non-empty `src`
- positive integer `frameCount`
- positive `fps`
- explicit boolean `loop`
- exactly one anchor set per frame
- all eight required anchors in every frame with finite `x/y`

Proof/incomplete entries deterministically remain on Renderer V2. This prevents concept/proof assets from leaking into normal V3 rendering merely because a state key exists.

Smoke gate: `tests/v020-b3-state-production-gate.js`.

## Acceptance gate per state
A state can change from fallback to production only when:
1. canonical face/hair/costume identity is stable across every frame;
2. canonical frame target is met or an explicitly documented B3 motion-quality adjustment is approved;
3. root/crop/scale pass deterministic validation;
4. eight anchors exist for every frame;
5. loop/end pose is visually valid for the semantic state;
6. right-facing and mirrored-left previews are readable;
7. 176px and compact-scale previews pass silhouette review;
8. no malformed anatomy, duplicate equipment, text or watermark-like marks;
9. V3 loader resolves the state without affecting other fallback states.

## Manifest promotion
`manifest.json` stays `status: proof` during partial production. Each accepted state is added independently with `status: production`; missing states continue through V2 fallback. Whole fighter becomes production only after all 13 states pass.

## Current task
The state-promotion safety gate is now implemented. Next active production target is a dedicated clean six-frame `idle` sequence, followed by normalization → eight anchors → V3 manifest integration → mirrored/fallback validation. Only after `idle` passes end-to-end do `walk`, `run` and `dash` enter dedicated production.