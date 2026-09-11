# V0.18 Release Validation — Graphics & Presentation Overhaul

Status: **G7 PRE-RELEASE VALIDATION**

Canonical source: GitHub `main` in `VGpro9X/auto-battle-roguelite`.

Current released/public baseline while this pre-release gate runs: **V0.17 – Duel Arena / Đấu Trường 1v1**.

Public build: `https://vgpro9x.github.io/auto-battle-roguelite/`

## Scope being validated
V0.18 replaces the prototype Duel presentation with an asset-driven graphics stack while preserving V0.17 mechanics and the V0.16 Survival/Endless baseline.

Release candidate presentation scope:
- Renderer V2 normal Duel path
- verified V0.17 vector fallback
- 13 / 13 fighter semantic states
- stable per-frame fighter anchors
- original `Ashen Sanctum` production arena
- presentation-only camera/parallax/shake/zoom
- 15 semantic VFX families
- Hợp Đạo / Siêu Cấp tier presentation
- 20 / 20 Rare visual identities
- Duel HUD/lobby/scouting/reward/result polish
- full/constrained quality profiles
- reduced-motion path
- cache/memory observability and transient presentation budgets

Mechanics truth remains:
- 80 base Kỹ Năng
- 28 Hợp Đạo Kỹ
- 12 Siêu Cấp
- 20 Rare rules
- 64-fighter tournament
- Best-of-3 automatic Duel combat
- V0.8 Strategic Movement AI baseline

## Completed prerequisite evidence
G0–G6 are complete before G7 label promotion.

G6 closure evidence:
- full V0.16/V0.17/G1–G6E Pages chain green
- V0.17 desktop/mobile rendered browser validation green
- G5E desktop/mobile rendered UI validation green
- G6D forced-vector browser validation green
- G6D partial/missing-asset fallback validation green
- G6E desktop full-quality validation green
- G6E mobile constrained-quality validation green
- G6E reduced-motion validation green
- exact fighter + arena Pages artifact validation green
- Pages deployment green

G6 hardening also caught and fixed a real Renderer V2 `ctx.ellipse()` argument bug before release validation.

## G7 pre-release gates
Before changing any public/runtime version label from V0.17, G7 must confirm:
1. V0.16 regression suite remains green.
2. V0.17 Duel mechanics/content suite remains green.
3. V0.17 desktop/mobile rendered regression remains green.
4. Renderer V2 is the normal production Duel path.
5. 13 / 13 fighter states preload successfully.
6. `Ashen Sanctum` production arena preloads successfully.
7. Every production fighter/arena manifest reference returns HTTP success in browser validation.
8. Production Renderer V2 preload produces no missing-asset/fallback/runtime warning.
9. Production V2 can finish a resolved Best-of-3 Duel.
10. Forced-vector and partial-asset fallback can finish Duel combat.
11. G5E desktop/mobile UI closure remains green.
12. G6E desktop/mobile/reduced-motion validation remains green.
13. Exact Pages artifact ships all required production assets and no `tests/` directory.
14. Canonical docs record G0–G6 complete / G7 active without prematurely claiming V0.18 released.

## Promotion gate
Only after every pre-release gate above passes:
- set runtime version to **V0.18**
- set static title/version badge to **V0.18**
- set Duel release label to **V0.18 · ĐẤU TRƯỜNG 1V1**
- update canonical docs from G7 active to V0.18 COMPLETE / RELEASED
- change this document status to **COMPLETE / RELEASED**
- rerun the complete mechanics/rendered/fallback/Pages matrix on the promoted-label head

If any post-promotion gate fails, V0.18 is not closed until the final promoted-label head is fully green.

## Release evidence to record after promotion
Final closure must record:
- final V0.18 release commit/head
- full Pages G1–G7 audit pass
- V0.17 historical mechanics/content regression pass
- desktop/mobile end-to-end browser pass
- production V2 asset/error audit pass
- forced-vector/partial-asset fallback pass
- G6 performance/reduced-motion pass
- exact Pages artifact validation pass
- successful Pages deploy

## Current conclusion
**Not released yet.** G7 pre-release validation is active and the public/runtime label must remain V0.17 until all pre-release gates pass.
