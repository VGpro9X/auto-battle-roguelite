# V0.18 — Graphics & Presentation Overhaul Plan

Status: **COMPLETE / RELEASED — G0 + G1 + G2 + G3 + G4 + G5 + G6 + G7 COMPLETE**

Canonical source: GitHub `main` in `VGpro9X/auto-battle-roguelite`.

Released baseline: **V0.18 – Graphics & Presentation Overhaul**.

Previous baseline: **V0.17 – Duel Arena / Đấu Trường 1v1**.

Release evidence: `V018_RELEASE_VALIDATION.md`.

V0.18 goal was to replace the prototype visual presentation with a scalable asset-driven graphics system while preserving V0.17 combat truth, AI, tournament logic and balance. That goal is complete.

---

# 1. Scope lock

V0.18 is graphics/presentation-first and does not rebalance gameplay.

Locked gameplay truth:
- V0.17 combat numbers
- Duel AI decision logic
- tournament bracket/progression
- skill acquisition, Hợp Đạo, Siêu Cấp and Rare rules
- HUYẾT CHIẾN / TỬ CHIẾN gameplay rules
- Survival Movement V0.8
- hitboxes, damage timing and combat ordering

Simulation remains the only source of combat truth; rendering/UI only visualize it.

---

# 2. Released visual direction

V0.18 uses an original dark-fantasy cultivation / martial-magic 2D presentation with:
- readable fighter silhouettes
- dark arena atmosphere and high-contrast effects
- restrained base palette for elemental/Rare readability
- energetic martial poses and supernatural effects
- original visual identity rather than copied protected characters or signature costumes

Readability remains above decoration.

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

Renderer/VFX/camera/UI never decide:
- whether an attack hits
- damage amount
- dodge success
- cooldown
- knockback amount
- fatal/revive ordering
- AI choices
- skill offer truth
- tournament progression

## 3.2 Released renderer architecture
- asset-driven Renderer V2 is the normal Duel path
- sprite/image manifest timing and anchors drive animation
- V0.17 vector renderer remains a verified fallback
- state-by-state and arena fallback remain supported

## 3.3 Stable fighter state API
Released 13-state set:
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
Released anchors:
- `head`
- `chest`
- `leftHand`
- `rightHand`
- `feet`
- `front`
- `back`
- `target`

Artwork pixels never define hitboxes.

---

# 4. Public asset pipeline

Released public tree includes:

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
- runtime assets stay under public `assets/`
- manifests reference concrete production sources
- exact Pages artifact validation fails when a production reference is missing
- tests remain under `tests/` and are not shipped publicly

---

# 5. Released graphics modules

- `js/duel-visual-assets.js` — manifest/image loader + cache lifecycle/status
- `js/duel-animation.js` — semantic animation/frame/anchor resolution
- `js/duel-renderer-v2.js` — asset-driven Duel renderer + fallback integration
- `js/duel-camera.js` — presentation-only camera/parallax/shake/zoom + quality multipliers
- `js/duel-vfx-v2.js` — semantic event → VFX family routing
- `js/duel-vfx-tier.js` — Hợp Đạo / Siêu Cấp / Rare presentation classification
- `js/duel-vfx-budget.js` — presentation-only transient VFX budgets
- `js/duel-visual-quality.js` — full/constrained/reduced-motion quality policy
- `js/duel-renderer.js` — vector fallback/reference + V2 bootstrap + quality-aware DPR
- `css/v018-graphics.css` — HUD/lobby/scouting/mobile presentation
- `css/v018-ui.css` — reward/result presentation
- `js/duel-ui-polish.js` — presentation-only result-state mirroring

---

# 6. Checkpoint roadmap — COMPLETE

## G0 — Graphics design + architecture lock — COMPLETE ✅
- scope/art direction locked
- asset/manifest contract locked
- simulation/renderer separation reaffirmed
- vector fallback strategy locked

## G1 — Asset loader + Renderer V2 foundation — COMPLETE ✅
- public `assets/` pipeline
- manifest/image loader + cache
- animation metadata/state resolver
- per-frame anchors
- Renderer V2
- exact Pages asset validation

## G2 — Fighter Visual V2 — COMPLETE ✅
- 13 / 13 required fighter states
- stable feet/root metadata
- facing flip and mirrored anchor math
- player/opponent differentiation
- shield/frost/orbit presentation parity
- state-by-state fallback safety

## G3 — Arena + Camera Presentation V2 — COMPLETE ✅
Canonical arena: **Ashen Sanctum**.
- original six-layer arena
- exact logical Duel geometry preserved
- parallax
- fighter-pair camera
- hard bounds
- desktop/mobile-safe zoom
- semantic impact shake/zoom
- shared world→screen transform
- HUYẾT CHIẾN / TỬ CHIẾN presentation

## G4 — Full Duel VFX Readability Pass — COMPLETE ✅
- 15 semantic VFX families
- event/world-coordinate + stable-anchor placement
- Hợp Đạo / Siêu Cấp tier overlays
- 20 / 20 Rare visual identities/signatures
- active Rare trigger audit
- transient effect expiry

## G5 — Duel UI / HUD / Tournament Presentation Polish — COMPLETE ✅
- combat HUD hierarchy and safe areas
- lobby/scouting/VS presentation
- reward/build cards
- semantic ROUND/K.O./round-result presentation
- Champion/elimination presentation
- rendered desktop/mobile UI closure

## G6 — Performance, Quality Levels and Fallback Hardening — COMPLETE ✅
- full/constrained/reduced-motion quality policy
- quality-aware DPR and camera motion
- cache/preload/memory observability
- transient presentation VFX budgets
- forced-vector full-match fallback
- partial/missing-asset full-match fallback
- production 13-state + Ashen Sanctum preload
- desktop/mobile/reduced-motion rendered closure
- invalid Renderer V2 `ctx.ellipse()` runtime bug found and fixed before release

## G7 — V0.18 Integration / Release Validation — COMPLETE ✅
Pre-release validation passed while the runtime/public label was still V0.17:
- all V0.16 tests green
- V0.17 mechanics/content tests green
- V0.17 desktop/mobile browser regression green
- Renderer V2 production normal path green
- vector and partial/missing-asset fallback green
- 13 / 13 fighter states green
- 8 required anchors green
- `Ashen Sanctum` six-layer arena green
- camera/VFX/UI integration green
- every production fighter/arena HTTP asset reference green
- production browser console/runtime error audit green
- desktop/mobile V2 Best-of-3 completion green
- reduced-motion/constrained quality paths green
- exact Pages artifact green
- integrated G7 workflow green
- Pages G1–G7 pre-release chain/deploy green

Only after that matrix passed was the runtime/public label promoted to **V0.18**.

Final promoted-label validation is required to remain green and is recorded by `V018_RELEASE_VALIDATION.md` plus the release workflows.

---

# 7. Definition of Done — ACHIEVED

V0.18 satisfies the release definition:
- Renderer V2 is the normal Duel path
- vector renderer remains a verified fallback
- complete fighter state set integrated
- production arena integrated
- camera/presentation system integrated
- full Duel ecosystem has readable VFX coverage
- Duel UI/HUD presentation pass complete
- desktop/mobile/reduced-motion performance validation passes
- V0.16 + V0.17 mechanics regressions preserved
- exact public Pages artifact ships required assets
- G7 release evidence recorded
- runtime/docs label promoted to **V0.18**

Multiple arenas, jump/aerial combat, online systems and unrelated new gameplay content are not part of the released V0.18 scope.

---

# 8. Future continuation point

**V0.18 is COMPLETE / RELEASED.**

Before future development:
1. read `README.md`
2. read `PROJECT_HANDOFF.md`
3. read `ROADMAP.md`
4. read `V018_GRAPHICS_PLAN.md`
5. read `V018_RELEASE_VALIDATION.md`
6. fetch latest files/SHAs from GitHub `main`
7. treat V0.18 as the frozen current public baseline unless a new roadmap explicitly changes it
8. do not silently reopen combat/AI/balance truth
