# Auto Battle Roguelite — Roadmap

GitHub `main` is canonical.

## Current baseline
- Released baseline: **V0.17 – Duel Arena / Đấu Trường 1v1**.
- Active development roadmap: **V0.18 – Graphics & Presentation Overhaul**.
- V0.18 design contract: `V018_GRAPHICS_PLAN.md`.
- Survival/Endless V0.16 remains supported.
- Movement baseline: **V0.8 Strategic Movement AI**; do not rewrite unless explicitly requested.
- Player-facing language: Vietnamese.

---

# V0.15 — COMPLETE
Responsive phone/tablet/desktop UI accepted on GitHub Pages.

# V0.16 — COMPLETE / RELEASED
- 80 base Kỹ Năng ✅
- 28 Hợp Đạo Kỹ ✅
- 12 Siêu Cấp ✅
- 20 Rare rules ✅
- 140 Codex entries ✅

# V0.17 — DUEL ARENA / ĐẤU TRƯỜNG 1v1 — COMPLETE / RELEASED ✅
- 64-fighter tournament ✅
- Best-of-3 automatic Duel combat ✅
- build-aware Duel AI ✅
- two unrestricted starter choices + reroll ✅
- opponent scouting ✅
- 80 / 80 Kỹ Năng Duel ✅
- 28 / 28 Hợp Đạo Kỹ Duel ✅
- 12 / 12 Siêu Cấp Duel ✅
- 20 / 20 Rare Duel rules ✅
- full V0.16 + V0.17 CI ✅
- desktop/mobile rendered validation ✅
- runtime/public label = **V0.17** ✅

V0.17 remains frozen except for bug fixes.

---

# V0.18 — GRAPHICS & PRESENTATION OVERHAUL — ACTIVE

Authoritative plan: `V018_GRAPHICS_PLAN.md`.

## Architecture contract
- simulation owns position, hit/damage/timing/outcome
- renderer only visualizes simulation truth
- world hitboxes remain independent from artwork pixels
- V0.17 vector renderer remains the fallback through V0.18 development
- assets/animation timing/anchors are manifest-driven
- Pages publishes `assets/`
- no gameplay rebalance, AI rewrite, tournament-rule change or skill-acquisition change merely for visuals

## G0 — Graphics design + architecture lock — COMPLETE ✅
- scope/art direction locked ✅
- manifest architecture locked ✅
- sprite-first/skeletal-ready direction locked ✅
- vector fallback locked ✅
- no-gameplay-change principle locked ✅

## G1 — Asset loader + Renderer V2 foundation — COMPLETE ✅
- public `assets/` pipeline ✅
- manifest/image loader + cache ✅
- semantic animation resolver ✅
- per-frame anchors ✅
- Renderer V2 internal switch ✅
- graceful vector fallback ✅
- exact Pages asset integrity validation ✅
- V0.16/V0.17 regression chain green ✅

## G2 — Fighter Visual V2 — COMPLETE ✅
Delivered in incremental G2A–G2F checkpoints:
- clean state-by-state V2 replacement ✅
- **13 / 13 required semantic states** ✅
  - idle
  - walk
  - run
  - dash
  - melee
  - ranged
  - cast
  - hit
  - block
  - knockback
  - knockdown
  - recover
  - ko
- per-frame required anchors ✅
- facing flip + mirrored anchor math ✅
- player/opponent visual differentiation ✅
- floor/contact shadow retained ✅
- shield/frost/orbit attachment parity ✅
- exact Pages asset sources validated ✅
- G2A–G2F smoke gates green ✅
- full V0.16/V0.17 mechanics regression chain remained green through G2F ✅

## G3 — Arena + Camera Presentation V2 — COMPLETE ✅
Delivered:
- original `Ashen Sanctum` canonical arena ✅
- six manifest-driven layers: sky / far / mid / ambient / floor / foreground ✅
- parallax transforms ✅
- richer floor/contact plane ✅
- atmospheric ambient + safe foreground layers ✅
- presentation-only camera in `js/duel-camera.js` ✅
- fighter-pair camera framing with hard bounds ✅
- desktop/mobile zoom limits ✅
- mobile-reduced impact shake ✅
- semantic hit/area/cast/KO/phase impact shake + zoom ✅
- one shared world→screen transform for V2 fighters and vector fallback projectiles/VFX ✅
- HUYẾT CHIẾN / TỬ CHIẾN phase presentation ✅
- G3 smoke gate green ✅
- exact Pages arena artifact validation green ✅
- V0.16/V0.17/G1/G2/G3 Pages chain green ✅
- V0.17 rendered desktop/mobile validation remained green ✅
- public Pages deploy green ✅

**Exit achieved:** the Duel arena no longer depends on the prototype/debug stage while simulation coordinates remain unchanged.

## G4 — Full Duel VFX Readability Pass — NEXT
Planned visual families:
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
- divine/mystic Rare rules

Required:
- semantic events → shared VFX families
- anchor-driven impact placement
- stronger Hợp Đạo / Siêu Cấp / Rare overrides
- all visually meaningful Duel mechanics readable
- no permanent full-screen VFX wall
- no VFX changes hitboxes, damage, targeting or timing

## G5 — Duel UI / HUD / Tournament Presentation Polish
- lobby/scouting/reward cards
- combat HUD
- round/K.O./Champion/elimination presentation
- mobile usability retained

## G6 — Performance / Quality / Fallback Hardening
- preload/cache/memory sanity
- presentation-only effect limits
- mobile reductions
- reduced-motion option
- vector fallback hardening

## G7 — V0.18 Release Validation
Required before release:
- all V0.16 + V0.17 mechanics CI green
- Renderer V2 normal path + vector fallback validated
- 13/13 fighter states present
- production arena/camera/VFX/UI complete
- desktop/mobile rendered validation
- exact Pages artifact includes all production assets
- no missing production asset errors
- final docs/evidence updated
- runtime/public label promoted to **V0.18** only after all gates pass

---

# PROJECT STATUS

**V0.17 remains the current released/public baseline. V0.18 is ACTIVE at G0 + G1 + G2 + G3 complete / G4 next. Continue with the Full Duel VFX Readability Pass; do not change combat/AI/balance.**
