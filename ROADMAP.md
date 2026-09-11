# Auto Battle Roguelite — Roadmap

GitHub `main` is canonical.

## Current baseline
- Released baseline: **V0.17 – Duel Arena / Đấu Trường 1v1**.
- Active development roadmap: **V0.18 – Graphics & Presentation Overhaul**.
- V0.18 design contract: `V018_GRAPHICS_PLAN.md`.
- Survival/Endless V0.16 remains supported.
- Movement baseline: **V0.8 Strategic Movement AI**; do not rewrite unless explicitly requested.
- Player-facing language: Vietnamese.
- Runtime/public label remains **V0.17** until G7 release validation passes.

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
- per-frame required anchors ✅
- facing flip + mirrored anchor math ✅
- player/opponent visual differentiation ✅
- floor/contact shadow retained ✅
- shield/frost/orbit attachment parity ✅
- exact Pages asset sources validated ✅
- G2A–G2F smoke gates green ✅
- full V0.16/V0.17 mechanics regression chain remained green ✅

## G3 — Arena + Camera Presentation V2 — COMPLETE ✅
- original `Ashen Sanctum` canonical arena ✅
- six manifest-driven layers ✅
- presentation-only fighter-pair camera ✅
- hard world bounds ✅
- desktop/mobile zoom limits ✅
- parallax transforms ✅
- mobile-reduced semantic impact shake/zoom ✅
- shared world→screen transform ✅
- HUYẾT CHIẾN / TỬ CHIẾN presentation ✅
- exact Pages arena artifact validation ✅
- G3 smoke gate + regression chain + rendered validation + Pages deploy green ✅

## G4 — Full Duel VFX Readability Pass — COMPLETE ✅
Delivered incrementally through G4A–G4E:
- semantic `js/duel-vfx-v2.js` router ✅
- Hợp Đạo / Siêu Cấp / Rare `js/duel-vfx-tier.js` classifier ✅
- 15 cumulative visual families ✅
  - physical / projectile
  - fire / frost / lightning
  - poison / blood
  - defense / heal / control
  - summon / area / chain
  - time / soul
- anchor/world-coordinate driven VFX placement ✅
- stronger Hợp Đạo and Siêu Cấp overlays ✅
- 20 / 20 Rare visual identities/signatures ✅
- active Rare trigger audit; `divineGift` intentionally reward-only ✅
- visible `heavenSeal` consumption event ✅
- transient VFX expiry / no permanent effect wall ✅
- G4A–G4E gates green ✅
- V0.16/V0.17/G1–G4 Pages chain green ✅
- V0.17 desktop/mobile rendered validation green ✅
- public Pages deploy green at G4 closure ✅

**Exit achieved:** visually meaningful Duel combat events have a readable V2 semantic presentation without changing combat truth.

## G5 — Duel UI / HUD / Tournament Presentation Polish — COMPLETE ✅
Delivered incrementally through G5A–G5E:
- G5A combat HUD hierarchy: HP / shield / score / timer / round / phase ✅
- safe-area-aware desktop/mobile HUD ✅
- pointer-transparent combat HUD except intentional controls ✅
- G5B Duel mode entry, lobby, VS screen and opponent scouting polish ✅
- stronger player/opponent presentation identity ✅
- G5C reward/build cards for base Rank, TỐI ĐA, Siêu Cấp and Rare tiers ✅
- exact-choice Siêu Cấp hint behavior preserved ✅
- one-reroll-per-choice-screen behavior preserved ✅
- G5D semantic `ROUND`, `K.O.`, round result and replay presentation ✅
- Champion / Bị loại result presentation mirrors existing tournament truth ✅
- G5D smoke gate verifies outcomes remain simulation-owned ✅
- G5E dedicated rendered desktop/mobile closure workflow ✅
- no horizontal-overflow / click-blocking / combat-center occlusion regressions ✅
- long mobile Duel overlays are scroll-reachable with safe-area padding ✅
- G5E caught and fixed an unreachable mobile lobby action before closure ✅
- full V0.16/V0.17/G1–G5 Pages chain green ✅
- V0.17 desktop/mobile rendered validation green ✅
- G5E rendered desktop/mobile validation green ✅
- public Pages deploy green at G5 closure ✅

**Exit achieved:** Duel HUD, lobby/scouting, reward cards and outcome/result presentation are readable and usable on desktop and mobile without altering combat/tournament/skill-selection truth.

## G6 — Performance / Quality / Fallback Hardening — NEXT
Planned work:
- preload/cache/memory sanity
- image-cache lifecycle
- presentation-only transient effect limits
- mobile/constrained quality reductions
- reduced-motion path
- vector fallback hardening

Rules:
- presentation caps must never become gameplay caps
- semantic events remain simulation-owned and must not be dropped before gameplay consumers
- quality changes may only reduce presentation cost/readability effects, never combat truth
- keep runtime/public label V0.17 until G7

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

**V0.17 remains the current released/public baseline. V0.18 is ACTIVE at G0 + G1 + G2 + G3 + G4 + G5 complete / G6 next. Continue with performance/quality/fallback hardening; do not change combat/AI/balance.**
