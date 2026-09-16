# V0.20 — Ash Wanderer Production Master Specification

Status: **B2 MASTER LOCKED**

This document converts the approved V0.20 concept direction into a deterministic production reference for B3 animation. It does not add or alter gameplay mechanics.

## 1. Canonical identity
Name: **Ash Wanderer**
Role: single neutral-class player fighter able to visually support melee, ranged and martial-magic builds.

The production identity is locked to:
- adult human martial cultivator / wandering fighter
- medium athletic build
- dark charcoal / blue-black layered clothing
- short asymmetric mantle and split lower coat panels
- dark controlled/tied hair silhouette
- restrained aged-brass hardware
- restrained dark-red cloth/scarf accent for directional readability
- subtle cyan spirit accent reserved for focus/magic details
- practical forearm guards and boots
- compact neutral blade/focus only; no giant permanent weapon

The red cloth accent is a readability device, not a permanent elemental affinity. Skill VFX remain free to use their own semantic colors.

## 2. Silhouette lock
At gameplay scale the fighter must read from these landmarks before internal costume detail:
1. tied hair/head mass
2. short asymmetric shoulder/mantle shape
3. exposed forearm/hand action line
4. narrow athletic torso
5. split lower coat panels
6. grounded boots/feet root
7. compact weapon silhouette kept close enough not to dominate class identity

Long cape, wings, giant shoulder armor and giant always-visible weapon are prohibited because they damage mirroring, anchors and neutral-class readability.

## 3. Gameplay scale lock
Compatibility target remains:
- logical frame: 256 × 256
- target displayed fighter width contract: 176 world units
- feet/root centered consistently across frames
- safe transparent margin on every side

High-resolution source masters may be larger, but every runtime derivative must normalize to the same logical root/pivot contract.

Minimum review sizes:
- 176px-equivalent gameplay presentation
- 96px silhouette review
- 64px thumbnail stress review

At 64px the exact face may disappear; facing, stance, mantle/scarf direction, weapon/action line and feet must remain readable.

## 4. Facing and mirroring
The canonical production orientation is right-facing gameplay three-quarter/side view. Left-facing may be produced through runtime mirroring only when all anchors and asymmetric costume landmarks remain semantically correct.

The asymmetry must be visually useful but cannot include readable symbols/text that become invalid when mirrored.

## 5. Material/value hierarchy
Dark world-safe values:
- deepest: hair / inner cloth / boot shadow
- dark-mid: main robe/coat
- mid: armor/leather/cloth edge separation
- warm accent: aged brass and restrained dark-red cloth
- light accent: skin/face/hands
- brightest persistent character accent: small cyan spirit detail only

Persistent character highlights must remain dimmer than important combat VFX.

## 6. Anchor contract
Every B3 frame provides:
- `head`
- `chest`
- `leftHand`
- `rightHand`
- `feet`
- `front`
- `back`
- `target`

Rules:
- `feet` is the stable draw/root reference.
- `front` and `back` follow facing consistently after mirroring.
- hand anchors follow anatomy, never VFX tips.
- `target` is a presentation emission/aim reference and does not become gameplay targeting truth.
- anchors are normalized per frame and validated before manifest promotion.

## 7. Thirteen-state pose intent
B3 must preserve the existing semantic states exactly:
- `idle`: balanced ready stance; breathing/cloth motion only
- `walk`: deliberate grounded martial locomotion
- `run`: stronger forward lean and readable acceleration intent
- `dash`: anticipation → displaced action silhouette → settle
- `melee`: compact windup → clear contact pose → follow-through
- `ranged`: hand/weapon emission line clearly separated from torso
- `cast`: two-hand/body channel with readable magical origin
- `hit`: directional recoil, short and readable
- `block`: compact defensive triangle; does not imply invulnerability
- `knockback`: center mass driven away from threat
- `knockdown`: fall to grounded silhouette
- `recover`: brace/rise → ready stance
- `ko`: unmistakable final grounded silhouette

Animation timing is presentation-only and must fit simulation semantic timing.

## 8. Production frame targets
Initial B3 frame targets remain:
- idle 6
- walk 8
- run 8
- dash 6
- melee 10
- ranged 8
- cast 10
- hit 4
- block 5
- knockback 5
- knockdown 8
- recover 8
- ko 8

These are visual production targets, not gameplay durations. Frame counts may only be adjusted in B3 for motion quality/performance while preserving all 13 semantic states and simulation timing.

## 9. Weapon policy
The master may carry one compact original blade/focus that supports neutral martial identity. It must not visually lock the character to a sword-only build.

For skills, temporary presentation weapons/energy constructs may appear through VFX or state overlays. They do not alter equipment/gameplay truth.

## 10. Generation consistency checklist
A B3 generated source frame is rejected when it changes canonical identity through:
- different face/hair architecture
- different body proportions
- missing/extra limbs
- costume redesign
- inconsistent scarf/mantle placement without motion cause
- giant new permanent weapon
- unexplained armor mutation
- text/logo/watermark-like markings
- incompatible camera angle/perspective
- unstable feet/root position

Regenerate/repair art rather than hiding identity drift with VFX.

## 11. B2 validation result
The approved concept direction passes the B2 design gates at specification level:
- neutral-class identity: PASS
- dark-fantasy cultivation language: PASS
- distinct silhouette: PASS
- melee/ranged/cast compatibility: PASS
- 13-state pose coverage demonstrated: PASS
- eight-anchor layout demonstrated: PASS
- 176px gameplay-scale target demonstrated: PASS
- mirror-safe production constraints documented: PASS

The generated board is a **master/reference**, not a sprite sheet to crop directly into runtime. B3 produces dedicated consistent animation assets from this locked identity.

## 12. B2 exit / B3 entry
B2 is complete when this spec and the master direction are canonical on `main`. B3 starts by producing dedicated right-facing animation source assets in semantic batches, normalizing root/scale/anchors, then validating mirroring and V3 manifest resolution before any state is marked `production`.