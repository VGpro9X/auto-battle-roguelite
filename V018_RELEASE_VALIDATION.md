# V0.18 Release Validation — Graphics & Presentation Overhaul

Status: **COMPLETE / RELEASED**

Canonical source: GitHub `main` in `VGpro9X/auto-battle-roguelite`.

Current released/public baseline: **V0.18 – Graphics & Presentation Overhaul**.

Previous released baseline: **V0.17 – Duel Arena / Đấu Trường 1v1**.

Public build: `https://vgpro9x.github.io/auto-battle-roguelite/`

## Release scope
V0.18 replaces the prototype Duel presentation with an asset-driven graphics stack while preserving V0.17 mechanics and the V0.16 Survival/Endless baseline.

Released presentation scope:
- Renderer V2 as the normal Duel rendering path
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

## G7 pre-release evidence
The pre-release head remained labeled V0.17 until the complete G7 candidate matrix was green.

Validated before promotion:
1. V0.16 regression suite green.
2. V0.17 Duel mechanics/content suite green.
3. V0.17 desktop/mobile rendered regression green.
4. Renderer V2 confirmed as the normal production Duel path.
5. 13 / 13 fighter states preload successfully.
6. `Ashen Sanctum` production arena preloads successfully.
7. Every production fighter/arena manifest reference returns HTTP success in browser validation.
8. Production Renderer V2 preload produces no missing-asset/fallback/runtime warning.
9. Production V2 completes a resolved Best-of-3 Duel.
10. Forced-vector and partial/missing-asset fallback complete Duel combat.
11. G5E desktop/mobile UI closure remains green.
12. G6E desktop/mobile/reduced-motion validation remains green.
13. Exact Pages artifact ships required production assets and no `tests/` directory.
14. Pages G1–G7 audit and deployment completed successfully before promotion.

Pre-release integrated G7 workflow result: **PASS**.

## Promotion
After all pre-release gates passed:
- runtime version promoted to **V0.18**
- static title/version badge promoted to **V0.18**
- Duel release label promoted to **V0.18 · ĐẤU TRƯỜNG 1V1**
- `core.js` and `duel-ui-sync.js` public cache keys advanced to the V0.18 release key
- V0.17 release audit converted to a historical regression gate without weakening its 80/28/12/20 content assertions
- canonical docs advanced to V0.18 COMPLETE / RELEASED

## Final promoted-label validation matrix
Accepted promoted runtime release head: **`567965dab2a16d654eafdadd57996c2f022356bf`**.

Final post-promotion result: **6 / 6 workflow groups PASS**.

Validated on the accepted release head:
- Pages full V0.16/V0.17/G1–G7 static/regression chain + exact asset artifact + successful Pages deploy — **PASS** (`34620000030`)
- V0.17 historical mechanics/content + desktop/mobile rendered regression — **PASS** (`34620000105`)
- G5E desktop/mobile UI closure — **PASS** (`34620000271`)
- G6D forced-vector + partial-asset fallback — **PASS** (`34620000047`)
- G6E desktop/mobile/reduced-motion performance closure — **PASS** (`34620000069`)
- G7 desktop/mobile production V2 asset/error audit + completed Best-of-3 — **PASS** (`34620000011`)

The release matrix also confirms:
- exact Pages fighter + arena artifact integrity
- production asset HTTP/preload success
- no production missing-asset/runtime warning in the G7 browser audit
- Renderer V2 normal production path completes Duel combat
- vector and partial-asset fallback paths complete Duel combat
- reduced-motion and constrained mobile presentation remain functional

This evidence update is documentation-only; the accepted runtime release head remains the promoted and fully validated head above.

## Locked release truth
- V0.18 is a graphics/presentation release, not a combat rebalance.
- Simulation remains the only source of hit, damage, cooldown, AI, fatal ordering, skill-offer and tournament truth.
- Vector fallback remains supported.
- Reduced-motion/constrained quality affects presentation cost only.
- V0.17 remains preserved as the historical Duel mechanics/content baseline.

## Release conclusion
**V0.18 – Graphics & Presentation Overhaul is COMPLETE / RELEASED.** G0–G7 are closed, the promoted runtime/public label is V0.18, and the final promoted-label validation matrix passed all six workflow groups on accepted runtime head `567965dab2a16d654eafdadd57996c2f022356bf`.
