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

## G6 — Performance / Quality / Fallback Hardening — COMPLETE ✅
Delivered incrementally through G6A–G6E:
- G6A presentation-only `full` / `constrained` quality policy + reduced-motion observability ✅
- canvas DPR cap now follows the active quality profile ✅
- camera shake/zoom now follows presentation quality and reduced-motion multipliers ✅
- G6B manifest/image load dedupe, pending/settled status, decoded-memory estimates and safe LRU lookup pruning ✅
- G6C transient core/tier VFX budgets with dropped-presentation observability ✅
- simulation event arrays remain intact before/after presentation consumption ✅
- G6D forced-vector browser path completes a Best-of-3 Duel ✅
- G6D partial/missing-asset V2 path falls back cleanly and completes a Best-of-3 Duel ✅
- G6D exposed and fixed an invalid Renderer V2 `ctx.ellipse()` runtime call ✅
- G6E production V2 preload validates 13 fighter states + `Ashen Sanctum` with settled runtime asset cache ✅
- G6E desktop full-quality rendered validation ✅
- G6E mobile constrained-quality rendered validation ✅
- G6E reduced-motion rendered validation with semantic VFX retained ✅
- outer and inner Renderer V2/camera cache keys advanced so deployed clients receive G6 fixes ✅
- timing-sensitive browser audits made race-safe without weakening their assertions ✅
- full V0.16/V0.17/G1–G6E Pages chain green ✅
- V0.17 desktop/mobile browser validation green ✅
- G5E UI validation green ✅
- G6D fallback validation green ✅
- G6E performance validation green ✅
- public Pages deploy green at G6 closure ✅

**Exit achieved:** presentation cost is bounded and observable, reduced-motion/mobile quality is active in runtime, production assets preload cleanly, and both normal V2 and vector/partial-asset fallback can finish Duel combat without changing mechanics.

## G7 — V0.18 Integration / Release Validation — NEXT
Required before release:
- all V0.16 + V0.17 mechanics CI green
- Renderer V2 normal path + vector fallback validated
- 13/13 fighter states present
- production arena/camera/VFX/UI complete
- desktop/mobile rendered validation
- exact Pages artifact includes all production assets
- browser console has no missing production asset errors
- V2 combat can finish to a resolved match
- final docs/evidence updated
- create `V018_RELEASE_VALIDATION.md`
- runtime/public label promoted to **V0.18** only after every G7 gate passes
- freeze the accepted V0.18 visual baseline after promotion

---

# PROJECT STATUS

**V0.17 remains the current released/public baseline. V0.18 is ACTIVE at G0 + G1 + G2 + G3 + G4 + G5 + G6 complete / G7 next. Continue with final V0.18 integration/release validation; do not change combat/AI/balance.**
