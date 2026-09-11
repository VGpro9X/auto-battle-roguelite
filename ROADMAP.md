# Auto Battle Roguelite — Roadmap

GitHub `main` is canonical.

## Current baseline
- Released baseline: **V0.18 – Graphics & Presentation Overhaul**.
- Previous released baseline: **V0.17 – Duel Arena / Đấu Trường 1v1**.
- V0.18 release evidence: `V018_RELEASE_VALIDATION.md`.
- Survival/Endless V0.16 remains supported.
- Movement baseline: **V0.8 Strategic Movement AI**; do not rewrite unless explicitly requested.
- Player-facing language: Vietnamese.
- Runtime/public label = **V0.18**.

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

V0.17 remains frozen as the historical mechanics/content baseline except for bug fixes.

---

# V0.18 — GRAPHICS & PRESENTATION OVERHAUL — COMPLETE / RELEASED ✅

Authoritative plan: `V018_GRAPHICS_PLAN.md`.
Release validation: `V018_RELEASE_VALIDATION.md`.

## Architecture contract
- simulation owns position, hit/damage/timing/outcome
- renderer only visualizes simulation truth
- world hitboxes remain independent from artwork pixels
- V0.17 vector renderer remains a verified fallback
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
- Renderer V2 normal path ✅
- graceful vector fallback ✅
- exact Pages asset integrity validation ✅

## G2 — Fighter Visual V2 — COMPLETE ✅
- clean state-by-state V2 replacement ✅
- **13 / 13 required semantic states** ✅
- per-frame required anchors ✅
- facing flip + mirrored anchor math ✅
- player/opponent visual differentiation ✅
- floor/contact shadow retained ✅
- shield/frost/orbit attachment parity ✅
- exact Pages asset sources validated ✅
- G2A–G2F gates green ✅

## G3 — Arena + Camera Presentation V2 — COMPLETE ✅
- original `Ashen Sanctum` canonical arena ✅
- six manifest-driven layers ✅
- presentation-only fighter-pair camera ✅
- hard world bounds + desktop/mobile zoom limits ✅
- parallax transforms ✅
- shared world→screen transform ✅
- HUYẾT CHIẾN / TỬ CHIẾN presentation ✅

## G4 — Full Duel VFX Readability Pass — COMPLETE ✅
- semantic `js/duel-vfx-v2.js` router ✅
- Hợp Đạo / Siêu Cấp / Rare `js/duel-vfx-tier.js` classifier ✅
- 15 cumulative visual families ✅
- anchor/world-coordinate driven VFX placement ✅
- stronger Hợp Đạo and Siêu Cấp overlays ✅
- 20 / 20 Rare visual identities/signatures ✅
- active Rare trigger audit ✅
- transient VFX expiry / no permanent effect wall ✅

## G5 — Duel UI / HUD / Tournament Presentation Polish — COMPLETE ✅
- combat HUD hierarchy and safe-area mobile/desktop layout ✅
- polished Duel mode entry/lobby/scouting/VS presentation ✅
- reward/build card hierarchy ✅
- semantic ROUND/K.O./round-result presentation ✅
- Champion/Bị loại presentation mirrors tournament truth ✅
- G5E rendered desktop/mobile closure green ✅

## G6 — Performance / Quality / Fallback Hardening — COMPLETE ✅
- full/constrained/reduced-motion quality policy ✅
- quality-aware DPR + camera motion ✅
- manifest/image cache dedupe/status/memory estimate/LRU lookup pruning ✅
- transient VFX budgets with semantic-input preservation ✅
- forced-vector Best-of-3 fallback validation ✅
- partial/missing-asset Best-of-3 fallback validation ✅
- production V2 preload validates 13 states + `Ashen Sanctum` ✅
- desktop/mobile/reduced-motion rendered validation ✅
- real Renderer V2 ellipse runtime bug caught and fixed ✅

## G7 — V0.18 Integration / Release Validation — COMPLETE ✅
- all V0.16 regression tests green ✅
- V0.17 historical Duel mechanics/content tests green ✅
- V0.17 desktop/mobile rendered regression green ✅
- Renderer V2 production normal path green ✅
- vector and partial/missing-asset fallback green ✅
- 13 / 13 fighter states + 8 required anchors green ✅
- six-layer `Ashen Sanctum` production arena green ✅
- production HTTP asset-reference audit green ✅
- production console/runtime error audit green ✅
- desktop/mobile production V2 Best-of-3 completion green ✅
- G5E UI closure green ✅
- G6E desktop/mobile/reduced-motion matrix green ✅
- exact Pages artifact validation green ✅
- integrated G7 pre-release matrix green before label promotion ✅
- runtime/public label promoted to **V0.18** ✅
- final promoted-label matrix is the release gate ✅

---

# PROJECT STATUS

**V0.18 is COMPLETE / RELEASED. V0.17 remains the frozen historical Duel mechanics/content baseline. Future work should begin from a new explicitly approved roadmap rather than silently reopening V0.18 balance or combat truth.**
