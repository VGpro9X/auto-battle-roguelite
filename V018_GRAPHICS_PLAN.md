# V0.18 — Graphics & Presentation Overhaul Plan

Status: **ACTIVE — G0 + G1 + G2 + G3 COMPLETE / G4 NEXT**

Canonical source: GitHub `main` in `VGpro9X/auto-battle-roguelite`.

Released baseline: **V0.17 – Duel Arena / Đấu Trường 1v1**.

V0.18 goal: **replace the prototype visual presentation with a scalable asset-driven graphics system while preserving V0.17 combat truth, AI, tournament logic and balance.**

---

# 1. Scope lock

V0.18 is graphics/presentation-first.

Primary scope:
- higher-quality original Duel fighter art and animation
- asset-driven Renderer V2
- richer canonical arena/background presentation
- camera/parallax/impact presentation
- readable VFX across the complete Duel ecosystem
- Duel HUD/menu presentation polish
- mobile/desktop quality and performance controls
- asset manifests, fallback behavior and release validation

V0.18 does **not** change gameplay by default.

Do not change merely for visuals:
- V0.17 combat numbers
- Duel AI decision logic
- tournament bracket/progression
- skill acquisition, Hợp Đạo, Siêu Cấp or Rare rules
- HUYẾT CHIẾN / TỬ CHIẾN gameplay rules
- Survival Movement V0.8
- V0.17 hitboxes, damage timing or combat ordering

If presentation appears to require a mechanic change, solve it in the renderer/presentation layer first.

---

# 2. Visual direction

Use an **original dark-fantasy cultivation / martial-magic 2D style**.

Target feel:
- strong readable silhouettes
- dark arena atmosphere with high-contrast effects
- restrained base palette so elemental/Rare VFX stay legible
- crisp 2D illustration rather than pseudo-3D realism
- energetic martial poses and supernatural effects
- original visual identity; do not copy protected characters, logos or signature costumes

Readability outranks decoration. Always preserve:
- player/opponent side readability
- facing direction
- anticipation and impact timing
- projectile visibility
- shield/defensive/control-state visibility
- HUYẾT CHIẾN / TỬ CHIẾN phase readability
- HP/shield HUD clarity

Do not let large VFX hide fighters for long periods.

---

# 3. Architecture contract

## 3.1 Combat truth remains simulation-owned

`js/duel-engine.js` and Duel content modules decide:
- positions/facing
- semantic action/state
- HP/shield
- hit/damage/dodge outcomes
- projectiles
- control/KO state
- combat events
- tournament result

Graphics only visualize those truths.

Renderer/VFX/camera must never decide:
- whether an attack hits
- damage amount
- dodge success
- cooldown
- knockback amount
- fatal/revive ordering
- AI choices
- tournament progression

## 3.2 Asset-driven renderer

Locked implementation direction:
- sprite-sheet/image-sequence first
- skeletal-ready abstraction later
- manifest-driven timing/anchors
- V0.17 vector renderer retained as fallback through V0.18 validation

## 3.3 Stable fighter state API

Required semantic states:
- `idle`
- `walk`
- `run`
- `dash`
- `melee`
- `ranged`
- `cast`
- `hit`
- `block`
- `knockback`
- `knockdown`
- `recover`
- `ko`

Optional visual-only extensions may be added later but must map back to stable simulation states.

## 3.4 Stable anchor API

Required anchors:
- `head`
- `chest`
- `leftHand`
- `rightHand`
- `feet`
- `front`
- `back`
- `target`

VFX attach to anchors/world event coordinates. Artwork pixels never define hitboxes.

---

# 4. Public asset pipeline

Current public tree includes:

```text
assets/
  duel/
    fighters/
      base/
        manifest.json
        <13 state sheets>
    arenas/
      ashen-sanctum/
        manifest.json
        sky.svg
        far.svg
        mid.svg
        ambient.svg
        floor.svg
        foreground.svg
    vfx/
      ... G4
    ui/
      ... G5
```

Rules:
- all runtime assets must be under public `assets/`
- manifests reference concrete production sources
- exact Pages artifact validation must fail when a referenced production asset is missing
- tests remain under `tests/` and are not shipped publicly

---

# 5. Current graphics modules

Implemented:
- `js/duel-visual-assets.js` — manifest/image loader + cache
- `js/duel-animation.js` — semantic animation/frame/anchor resolution
- `js/duel-renderer-v2.js` — asset-driven Duel renderer + fallback integration
- `js/duel-camera.js` — presentation-only camera/parallax/shake/zoom
- `js/duel-renderer.js` — V0.17 vector fallback/reference, extended to share V2 camera transforms safely

Planned next:
- `js/duel-vfx-v2.js` — G4 semantic event → visual-family routing
- `js/duel-visual-quality.js` — G6 quality/performance policy
- `css/v018-graphics.css` — G5 presentation/HUD polish as needed

Do not build V0.18 by wrapping `updateDuelRound()` or modifying Survival rendering loops.

---

# 6. Checkpoint roadmap

## G0 — Graphics design + architecture lock — COMPLETE ✅

Delivered:
- scope locked
- art direction locked
- asset/manifest contract locked
- simulation/renderer separation reaffirmed
- sprite-first/skeletal-ready direction locked
- vector fallback strategy locked

---

## G1 — Asset loader + Renderer V2 foundation — COMPLETE ✅

Delivered:
- Pages publishes `assets/`
- manifest/image loader + cache
- missing-asset fallback
- animation metadata/state resolver
- per-frame anchors
- Renderer V2 feature switch
- exact Pages asset validation
- V0.16/V0.17 mechanics regressions remained green

Exit achieved: graphics infrastructure can replace semantic states without altering simulation.

---

## G2 — Fighter Visual V2 — COMPLETE ✅

Delivered incrementally through G2A–G2F:
- clean exact-state replacement instead of asset-over-vector double drawing
- **13 / 13 required fighter states**
- stable feet/root metadata
- facing flip and mirrored anchor math
- player/opponent differentiation
- floor/contact shadow
- shield/frost/orbit attachment parity
- state-by-state fallback safety
- dedicated G2 smoke gates
- exact Pages fighter asset validation
- full V0.16/V0.17 regression chain remained green

Exit achieved: normal Duel fighter coverage no longer requires the vector fighter.

---

## G3 — Arena + Camera Presentation V2 — COMPLETE ✅

Canonical arena: **Ashen Sanctum**.

Delivered:
- original six-layer arena: sky / far / mid / ambient / floor / foreground
- logical geometry exactly matches Duel simulation:
  - width `1000`
  - height `560`
  - floorY `475`
  - left/right bounds `54 / 946`
- parallax transforms
- richer floor/contact plane
- atmospheric ambient layer
- safe foreground layer
- `js/duel-camera.js`
- framing based on both fighters
- hard camera bounds
- desktop zoom cap `1.24`
- mobile zoom cap `1.10`
- mobile-reduced shake
- semantic hit/area/cast/KO/phase shake + zoom
- shared world→screen transform across V2 fighters and vector fallback projectiles/VFX
- HUYẾT CHIẾN / TỬ CHIẾN phase presentation
- conditional canvas resize to preserve layered rendering
- G3 arena/camera smoke gate
- exact Pages arena layer validation
- V0.16/V0.17/G1/G2/G3 Pages chain green
- V0.17 desktop/mobile rendered flow green
- public Pages deploy green

Camera rules remain locked:
- simulation coordinates never change because of camera
- camera never affects target selection or timing
- no arena hazards/gameplay geometry changes
- foreground never intentionally blocks core combat readability

Exit achieved: the arena no longer relies on the prototype/debug presentation.

---

## G4 — Full Duel VFX Readability Pass — NEXT

Goal: full visual coverage, **not 140 bespoke cinematics**.

Use shared visual families plus high-value overrides.

Core families:
- physical/melee impact
- projectile
- fire
- frost
- lightning
- poison/DOT
- blood/lifesteal
- shield/defense
- heal/recovery
- control/slow/stun
- summon/orbit
- explosion/area
- chain
- time/space
- soul/death
- divine/mystic Rare

Required architecture:
- semantic combat events map into VFX families
- effect placement uses world event coordinates and/or stable fighter anchors
- projectile visuals remain driven by simulation projectile truth
- effects render through the G3 camera transform
- presentation lifetime/particle caps may exist, but they must never cap gameplay projectiles, targets, damage instances or mechanics

High-value overrides:
- major Hợp Đạo activations
- major Siêu Cấp casts
- fatal save/revive Rare rules
- large area/control effects
- divine/mystic Rare rule activations

Acceptance:
- every visually meaningful Duel mechanic has a readable representation
- critical defensive states are never invisible
- no common build creates a permanent full-screen VFX wall
- no VFX changes hitboxes, damage, cooldowns, targeting, knockback or fatal ordering

Recommended implementation order:
1. audit existing Duel event vocabulary + skill visual hints
2. add `js/duel-vfx-v2.js`
3. first shared families: physical / projectile / fire / frost / lightning
4. integrate with Renderer V2, anchors and G3 camera
5. add G4A smoke gate
6. expand poison/blood/defense/heal/control
7. expand summon/orbit/area/chain/time/space/soul/death
8. add stronger Hợp Đạo / Siêu Cấp / Rare overrides
9. close G4 only after full family coverage and regression gates are green

---

## G5 — Duel UI / HUD / Tournament Presentation Polish

Tasks:
- Duel mode card/lobby
- pre-match VS presentation
- opponent scouting
- skill/reward card polish without rule changes
- Hợp Đạo / Siêu Cấp / Rare tier readability
- combat HUD refinement
- round/K.O./Champion/elimination presentation
- mobile usability preserved

---

## G6 — Performance, Quality Levels and Fallback Hardening

Tasks:
- preload/cache strategy
- decoded-memory sanity
- image-cache lifecycle
- presentation-only transient effect limits
- mobile/constrained quality reductions
- reduced-motion path
- vector fallback hardening

Presentation caps must never become hidden gameplay caps.

---

## G7 — V0.18 Integration / Release Validation

Automated requirements:
- all V0.16 tests green
- all V0.17 Duel mechanics tests green
- Renderer V2 normal path green
- vector fallback green
- manifest/asset integrity green
- exact Pages artifact includes all required assets
- browser console has no missing production asset errors
- desktop rendered flow green
- mobile rendered flow green
- combat can finish with V2 active

Release closure:
- update `README.md`
- update `ROADMAP.md`
- update `PROJECT_HANDOFF.md`
- create `V018_RELEASE_VALIDATION.md`
- promote runtime/public label to **V0.18** only after all gates pass
- freeze the V0.18 visual baseline

---

# 7. Implementation order rule

Required order:
1. G1 asset/renderer infrastructure ✅
2. proof asset/state ✅
3. transform/anchor/animation validation ✅
4. complete fighter states ✅
5. arena/camera ✅
6. VFX families ← **NEXT**
7. UI polish
8. performance/fallback
9. release validation

Do not mass-produce assets before their renderer contract is validated.

---

# 8. Definition of Done for V0.18

V0.18 may be marked `COMPLETE / RELEASED` only when:
- asset-driven Renderer V2 is the normal Duel path
- vector renderer remains a verified fallback
- complete fighter state set is integrated
- one production-quality arena is integrated
- camera/presentation system is integrated
- full Duel ecosystem has readable VFX coverage
- Duel UI/HUD presentation pass is complete
- desktop/mobile performance validation passes
- all V0.16 + V0.17 mechanics regressions remain green
- exact public Pages artifact ships all required assets
- final runtime/docs label is **V0.18**

Multiple arenas, jump/aerial combat, online systems and unrelated new gameplay content are not automatically part of V0.18.

---

# 9. Current continuation point

Continue from **G4 — Full Duel VFX Readability Pass**.

Before editing:
1. read `README.md`
2. read `PROJECT_HANDOFF.md`
3. read `ROADMAP.md`
4. read `V018_GRAPHICS_PLAN.md`
5. fetch latest Duel event/renderer/content files
6. keep GitHub `main` canonical
7. commit meaningful checkpoints frequently
8. do not change combat/AI/balance truth for visual convenience
