# V0.20 — B3 Fighter Animation Production Spec

Status: **ACTIVE — LOCOMOTION BATCH**

Canonical fighter: Ash Wanderer. This file defines production order and validation for dedicated animation assets; concept/master boards are reference only and are never cropped directly into runtime.

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
- stable `feet` root; no accidental locomotion baked into the sprite root
- eight anchors per frame: head, chest, leftHand, rightHand, feet, front, back, target
- transparent background for runtime character derivatives
- no baked shadow, environment, text or gameplay VFX except temporary state-specific presentation explicitly separated from body art

## Motion rules
Idle loops without visible root drift. Walk and run use contact/pass/recoil/up/down structure with coherent cloth follow-through. Dash has anticipation, displacement silhouette and settle, but simulation owns actual displacement. Mirrored playback must preserve front/back and hand anchor semantics.

## Acceptance gate per state
A state can change from fallback to production only when:
1. canonical face/hair/costume identity is stable across every frame;
2. root/crop/scale pass deterministic validation;
3. eight anchors exist for every frame;
4. loop/end pose is visually valid for the semantic state;
5. right-facing and mirrored-left previews are readable;
6. 176px and compact-scale previews pass silhouette review;
7. no malformed anatomy, duplicate equipment, text or watermark-like marks;
8. V3 loader resolves the state without affecting other fallback states.

## Manifest promotion
`manifest.json` stays `status: proof` during partial production. Each accepted state is added independently with `status: production`; missing states continue through V2 fallback. Whole fighter becomes production only after all 13 states pass.

## Current task
Produce B3.1 locomotion sources first: idle → walk → run → dash. Do not start bulk VFX, enemy or arena production from this checkpoint.