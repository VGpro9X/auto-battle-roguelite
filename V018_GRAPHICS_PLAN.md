# V0.18 — Graphics & Presentation Overhaul Plan

Status: **ACTIVE — G0 + G1 + G2 + G3 + G4 + G5 COMPLETE / G6 NEXT**

Canonical source: GitHub `main` in `VGpro9X/auto-battle-roguelite`.

Released baseline: **V0.17 – Duel Arena / Đấu Trường 1v1**.

V0.18 goal: **replace the prototype visual presentation with a scalable asset-driven graphics system while preserving V0.17 combat truth, AI, tournament logic and balance.**

---

# 1. Scope lock

V0.18 is graphics/presentation-first.

Primary scope:
- original Duel fighter art and animation
- asset-driven Renderer V2
- richer canonical arena/background presentation
- camera/parallax/impact presentation
- readable VFX across the complete Duel ecosystem
- Duel HUD/menu/tournament presentation polish
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
- hitboxes, damage timing or combat ordering

If presentation appears to require a mechanic change, solve it in the renderer/UI layer first.

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

Do not let large VFX or opaque UI hide fighters for long periods.

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

Graphics/UI only visualize those truths.

Renderer/VFX/camera/UI must never decide:
- whether an attack hits
- damage amount
- dodge success
- cooldown
- knockback amount
- fatal/revive ordering
- AI choices
- skill offer truth
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
- `js/duel-vfx-v2.js` — semantic event → VFX family routing
- `js/duel-vfx-tier.js` — Hợp Đạo / Siêu Cấp / Rare presentation classification
- `js/duel-renderer.js` — V0.17 vector fallback/reference + V2 bootstrap
- `css/v018-graphics.css` — G5 HUD/lobby/scouting + mobile closure presentation
- `css/v018-ui.css` — G5 reward/result presentation
- `js/duel-ui-polish.js` — presentation-only Champion/elimination result mirroring

Planned next:
- `js/duel-visual-quality.js` — G6 quality/performance policy
- focused G6 cache/effect/fallback hardening tests under `tests/`

Do not build V0.18 by wrapping `updateDuelRound()` or modifying Survival rendering loops.

---

# 6. Checkpoint roadmap

## G0 — Graphics design + architecture lock — COMPLETE ✅
- scope/art direction locked
- asset/manifest contract locked
- simulation/renderer separation reaffirmed
- sprite-first/skeletal-ready direction locked
- vector fallback strategy locked

## G1 — Asset loader + Renderer V2 foundation — COMPLETE ✅
- Pages publishes `assets/`
- manifest/image loader + cache
- missing-asset fallback
- animation metadata/state resolver
- per-frame anchors
- Renderer V2 feature switch
- exact Pages asset validation
- V0.16/V0.17 mechanics regressions green

## G2 — Fighter Visual V2 — COMPLETE ✅
- clean exact-state replacement
- **13 / 13 required fighter states**
- stable feet/root metadata
- facing flip and mirrored anchor math
- player/opponent differentiation
- floor/contact shadow
- shield/frost/orbit attachment parity
- state-by-state fallback safety
- G2A–G2F gates green

## G3 — Arena + Camera Presentation V2 — COMPLETE ✅
Canonical arena: **Ashen Sanctum**.

Delivered:
- original six-layer arena
- exact logical Duel geometry preserved
- parallax transforms
- presentation-only fighter-pair camera
- hard camera bounds
- desktop/mobile-safe zoom
- semantic impact shake/zoom
- shared world→screen transform
- HUYẾT CHIẾN / TỬ CHIẾN presentation
- G3 Pages + rendered validation green

## G4 — Full Duel VFX Readability Pass — COMPLETE ✅
Delivered through G4A–G4E:
- 15 semantic VFX families: physical, projectile, fire, frost, lightning, poison, blood, defense, heal, control, summon, area, chain, time, soul
- event/world-coordinate + stable-anchor placement
- VFX uses the G3 camera transform
- stronger Hợp Đạo / Siêu Cấp presentation
- 20 / 20 Rare visual identities/signatures
- combat-active Rare trigger audit
- `divineGift` intentionally reward-only
- visible fatal/defensive Rare triggers including `heavenSeal`
- transient effect expiry; no permanent full-screen wall
- G4A–G4E gates green
- full V0.16/V0.17/G1–G4 Pages chain green
- V0.17 desktop/mobile rendered validation green
- Pages deploy green at G4 closure

Exit achieved: visually meaningful Duel combat events have readable semantic V2 presentation without changing mechanics.

## G5 — Duel UI / HUD / Tournament Presentation Polish — COMPLETE ✅

### G5A — Combat HUD shell — COMPLETE ✅
- dedicated V0.18 HUD presentation layer
- improved HP/shield/timer/score/round/phase hierarchy
- current DOM IDs used by `duel-ui.js` preserved
- safe-area padding retained
- desktop + mobile responsive readability
- HUD pointer-transparent except intentional controls

### G5B — Lobby + scouting — COMPLETE ✅
- polished Duel mode card/lobby
- improved pre-match VS presentation
- stronger player/opponent identity
- tournament rules/text truth retained

### G5C — Reward/build cards — COMPLETE ✅
- improved base Rank / TỐI ĐA readability
- clearer Hợp Đạo / Siêu Cấp / Rare hierarchy
- exact reward and reroll behavior preserved
- exact-choice Siêu Cấp hint contract preserved

### G5D — Outcome presentation — COMPLETE ✅
- round start
- K.O.
- round winner / draw replay
- elimination
- Champion presentation
- semantic outcome banner uses existing engine `round_start`, `ko` and `round_end` events
- result card styling mirrors already-resolved Champion/Bị loại state
- no outcome is recomputed by graphics/UI

### G5E — UI closure audit — COMPLETE ✅
- dedicated rendered desktop/mobile workflow
- no horizontal-overflow regressions
- scroll-reachability and click-blocking audit
- HUD pointer behavior and combat-center occlusion audit
- mobile long Duel overlays made safely scrollable with safe-area padding
- audit caught and fixed a real unreachable mobile lobby action
- V0.17 desktop/mobile validation remained green
- full Pages chain and deploy green at closure

G5 acceptance achieved:
- combat HUD readable at desktop and phone widths
- all player-facing text remains Vietnamese
- no UI change affects combat/tournament/skill-offer truth
- safe areas and touch targets remain usable

## G6 — Performance, Quality Levels and Fallback Hardening — NEXT

### G6A — Quality policy + observability foundation
- add `js/duel-visual-quality.js`
- derive presentation profile from constrained/mobile/reduced-motion context
- expose explicit presentation-only budgets/status to renderer/VFX/camera
- no policy value may change simulation truth

### G6B — Cache/preload/memory sanity
- audit manifest/image preload strategy
- decoded-memory sanity
- image-cache lifecycle
- prevent duplicate loads / unbounded stale decoded-image retention

### G6C — Transient presentation budgets
- cap or dedupe presentation-only transient VFX under stress
- retain semantic information/readability
- never drop/alter engine events before non-visual consumers

### G6D — Vector fallback hardening
- validate partial/missing-asset fallback
- validate forced vector fallback path
- prove a Duel can finish with fallback active

### G6E — Performance/fallback closure
- desktop/mobile rendered quality validation
- stress/fallback evidence
- full V0.16/V0.17/G1–G6 regressions green
- Pages artifact/deploy green

Presentation caps must never become hidden gameplay caps.
Reduced-motion may reduce animation/shake/flash, not semantic information.

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
- update canonical docs/evidence
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
6. VFX families ✅
7. UI polish ✅
8. performance/fallback ← **NEXT**
9. release validation

---

# 8. Definition of Done for V0.18

V0.18 may be marked `COMPLETE / RELEASED` only when:
- asset-driven Renderer V2 is the normal Duel path
- vector renderer remains a verified fallback
- complete fighter state set is integrated
- one production arena is integrated
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

Continue from **G6A — Quality policy + observability foundation**.

Before editing:
1. read `README.md`
2. read `PROJECT_HANDOFF.md`
3. read `ROADMAP.md`
4. read `V018_GRAPHICS_PLAN.md`
5. fetch latest visual asset/VFX/camera/renderer/workflow files
6. keep GitHub `main` canonical
7. commit meaningful checkpoints frequently
8. do not change combat/AI/balance truth for performance convenience
