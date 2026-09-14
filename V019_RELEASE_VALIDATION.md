# V0.19 – Tactical AI & Movement Intelligence — Release Validation

Status: **COMPLETE / RELEASED**

GitHub `main` is canonical.

## Release scope
V0.19 improves tactical movement/decision truth in Survival/Endless and Duel 1v1. It does not alter the locked V0.17 content counts, tournament structure, damage formulas, cooldowns, fatal/revive ordering, skill acquisition truth, or V0.18 Renderer V2 presentation ownership.

## Pre-promotion validated head
`5f5568031c11009ec1bea68d8d49de89de67b6d0`

On that head the complete pre-release matrix was green:
- V0.19 tactical AI validation
- V0.19 A14 desktop/mobile browser AI validation
- V0.17 historical mechanics/content validation
- V0.18 mobile Duel lobby scroll regression
- V0.18 G5E UI regression
- V0.18 G6D fallback regression
- V0.18 G6E performance/reduced-motion regression
- V0.18 G7 graphics/release regression
- GitHub Pages deploy

## Survival closure
Validated behaviors include:
- 32-sector encirclement perception
- contiguous escape-gap detection
- predictive corridor scoring
- stable corridor commitment
- bounded heading reversals/replans
- stuck detection and emergency breakout
- utility transitions between escape/kite/harvest/patrol
- bounded perception work for performance

A13 Survival matrix result on the development gate:
- 33 scenarios
- wide-gap success: 100%
- narrow-gap success: 100%
- average displacement: ~150.5 px
- maximum heading reversals: 1
- maximum replans: 2

## Duel closure
Validated behaviors include:
- tactical perception and spatial targeting
- ENGAGE / PRESSURE / SPACE / DISENGAGE / CENTER_RESET / CORNER_ESCAPE / FINISH utility states
- post-burst spacing and re-engagement
- self-corner escape
- attacker pressure release while offense cools
- build-aware spacing
- bounded decision cadence
- mirrored/side-symmetry simulation

A13 originally exposed insufficient ranged identity (163.0 px ranged vs 148.5 px melee). The implementation was tuned rather than lowering the gate; the final A13 Duel matrix passes.

## Performance/mobile closure
- expensive tactical perception is cadence-bounded
- Survival predictive work uses a bounded nearby-hostile subset
- deterministic performance smoke passes
- desktop 1280×720 browser AI runtime passes
- compact mobile 360×640 browser AI runtime passes

## Promoted public state
A15 promotion sets:
- `GAME_VERSION` → `V0.19`
- public title/version badge → `V0.19`
- Duel eyebrow → `V0.19 · ĐẤU TRƯỜNG 1V1`
- `core.js`, Survival AI, Duel AI and Duel UI sync release cache keys → `019-release-r1`

The V0.18 G7 audit is retained as a historical graphics regression gate and now accepts a newer runtime release while continuing to enforce 80/28/12/20 content truth, 13 fighter states, 8 required anchors and the six-layer arena.

## Final release gates
The final promoted head must pass:
- `.github/workflows/v019-a15-release-validation.yml`
- `.github/workflows/v019-ai-validation.yml`
- `.github/workflows/v019-a14-browser-validation.yml`
- V0.17 historical validation
- V0.18 G5E/G6D/G6E/G7 historical regressions
- GitHub Pages deployment

## Locked release truth
- current public/runtime baseline: **V0.19**
- V0.18: frozen graphics/presentation regression baseline
- V0.17: frozen mechanics/content regression baseline
- 80 base / 28 Hợp Đạo / 12 Siêu Cấp / 20 Rare retained
- 64-fighter Best-of-3 Duel retained
- HUYẾT CHIẾN 45s / TỬ CHIẾN 60s+ retained
- tests remain under `tests/` and are not shipped in the Pages artifact
