# V0.18 — Graphics & Presentation Overhaul Plan

Status: **ACTIVE — G0 + G1 + G2 + G3 + G4 + G5 + G6 COMPLETE / G7 NEXT**

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
- `js/duel-visual-assets.js` — manifest/image loader + cache lifecycle/status
- `js/duel-animation.js` — semantic animation/frame/anchor resolution
- `js/duel-renderer-v2.js` — asset-driven Duel renderer + fallback integration
- `js/duel-camera.js` — presentation-only camera/parallax/shake/zoom + quality multipliers
- `js/duel-vfx-v2.js` — semantic event → VFX family routing
- `js/duel-vfx-tier.js` — Hợp Đạo / Siêu Cấp / Rare presentation classification
- `js/duel-vfx-budget.js` — presentation-only transient VFX budgets
- `js/duel-visual-quality.js` — full/constrained/reduced-motion quality policy
- `js/duel-renderer.js` — V0.17 vector fallback/reference + V2 bootstrap + quality-aware DPR
- `css/v018-graphics.css` — HUD/lobby/scouting + mobile closure presentation
- `css/v018-ui.css` — reward/result presentation
- `js/duel-ui-polish.js` — presentation-only Champion/elimination result mirroring

Final validation work belongs to G7. Do not build G7 by wrapping `updateDuelRound()` or modifying Survival rendering loops.

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
- timing-safe browser checks preserve the same layout assertions under virtual-time
- V0.17 desktop/mobile validation remained green
- full Pages chain and deploy green at closure

G5 acceptance achieved:
- combat HUD readable at desktop and phone widths
- all player-facing text remains Vietnamese
- no UI change affects combat/tournament/skill-offer truth
- safe areas and touch targets remain usable

## G6 — Performance, Quality Levels and Fallback Hardening — COMPLETE ✅

### G6A — Quality policy + observability foundation — COMPLETE ✅
- `js/duel-visual-quality.js`
- explicit full/constrained presentation profiles
- reduced-motion mode
- renderer/VFX/camera-readable quality status
- no policy value changes simulation truth

### G6B — Cache/preload/memory sanity — COMPLETE ✅
- manifest/image load dedupe
- pending/settled status
- decoded-image memory estimates
- safe LRU lookup pruning for settled cache entries
- renderer-held `Image` objects are not invalidated by cache pruning

### G6C — Transient presentation budgets — COMPLETE ✅
- `js/duel-vfx-budget.js`
- bounded core VFX and tier overlay arrays
- presentation drops are observable via `droppedPresentation`
- semantic event input is never mutated or filtered before camera/non-visual consumers

### G6D — Vector fallback hardening — COMPLETE ✅
- forced vector browser path validated through full Best-of-3 completion
- partial fighter asset + missing arena path validated through full Best-of-3 completion
- state-by-state/arena fallback remains live
- browser audit caught an invalid Renderer V2 `ctx.ellipse()` call; fixed before closure

### G6E — Performance/fallback closure — COMPLETE ✅
- quality-aware canvas DPR cap active
- camera shake/zoom honors full/constrained/reduced-motion multipliers
- production V2 preload confirms all 13 fighter states
- production `Ashen Sanctum` preload succeeds
- runtime asset cache reaches zero pending loads and reports decoded-memory estimate
- desktop full-quality rendered path green
- mobile constrained-quality rendered path green
- reduced-motion rendered path green without erasing semantic VFX
- VFX stress budgets cap presentation objects without mutating event input
- production Renderer V2 completes a Best-of-3 Duel
- forced-vector and partial-asset fallback remain green
- outer bootstrap + changed inner G6 modules use cache-busting keys
- full V0.16/V0.17/G1–G6 regression chain green
- V0.17 desktop/mobile browser validation green
- G5E UI rendered validation green
- G6D fallback rendered validation green
- G6E performance rendered validation green
- Pages artifact integrity + deploy green

G6 acceptance achieved:
- presentation cost is bounded/observable
- constrained/mobile quality actually affects runtime DPR/VFX/camera cost
- reduced-motion removes presentation motion, not semantic information
- normal V2 and fallback paths can both finish Duel combat
- no G6 policy changes gameplay truth

## G7 — V0.18 Integration / Release Validation — NEXT
Automated requirements:
- all V0.16 tests green
- all V0.17 Duel mechanics tests green
- V0.17 desktop/mobile browser regression green
- Renderer V2 production normal path green
- vector fallback green
- partial/missing-asset fallback green
- 13 / 13 fighter states green
- production `Ashen Sanctum` arena green
- camera/VFX/UI integration green
- manifest/asset integrity green
- exact Pages artifact includes all required production assets
- browser console has no missing production asset errors
- desktop rendered end-to-end flow green
- mobile rendered end-to-end flow green
- combat can finish with V2 active
- reduced-motion/constrained quality paths remain green

Release closure order:
1. build final G7 integration/release audit gate(s)
2. create `V018_RELEASE_VALIDATION.md` with exact evidence
3. keep public/runtime label **V0.17** while validating the pre-release head
4. only after all pre-release G7 gates pass, promote runtime/public label to **V0.18**
5. rerun mechanics, rendered and Pages validation on the promoted-label head
6. update canonical docs to `COMPLETE / RELEASED`
7. freeze the accepted V0.18 visual baseline

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
8. performance/fallback ✅
9. release validation ← **NEXT**

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
- G7 release evidence is recorded
- final runtime/docs label is **V0.18**

Multiple arenas, jump/aerial combat, online systems and unrelated new gameplay content are not automatically part of V0.18.

---

# 9. Current continuation point

Continue from **G7 — V0.18 Integration / Release Validation**.

Before editing:
1. read `README.md`
2. read `PROJECT_HANDOFF.md`
3. read `ROADMAP.md`
4. read `V018_GRAPHICS_PLAN.md`
5. fetch latest release/browser/renderer/workflow files
6. keep GitHub `main` canonical
7. commit meaningful checkpoints frequently
8. do not promote public/runtime label from V0.17 until every pre-release G7 gate passes
9. do not change combat/AI/balance truth to make release validation pass
