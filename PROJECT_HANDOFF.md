# Auto Battle Roguelite — Project Handoff

Use this file as the starting context when continuing development in a new chat.

## Master source
- Repository: `VGpro9X/auto-battle-roguelite`
- Default branch: `main`
- GitHub `main` is canonical.
- Public URL: `https://vgpro9x.github.io/auto-battle-roguelite/`
- Pages workflow: `.github/workflows/pages.yml`
- V0.17 historical validation workflow: `.github/workflows/v017-validation.yml`
- V0.18 G5E rendered UI workflow: `.github/workflows/v018-g5e-ui-validation.yml`
- V0.18 G6D fallback workflow: `.github/workflows/v018-g6d-fallback-validation.yml`
- V0.18 G6E performance workflow: `.github/workflows/v018-g6e-performance-validation.yml`
- V0.18 G7 release workflow: `.github/workflows/v018-g7-release-validation.yml`
- Fetch current GitHub content + blob SHA before editing existing files.
- Commit every meaningful checkpoint.

## Current project state
- Current released/public baseline: **V0.18 – Graphics & Presentation Overhaul**.
- Runtime/public label: **V0.18**.
- V0.18 status: **G0–G7 COMPLETE / RELEASED**.
- V0.17 remains frozen as the historical Duel mechanics/content baseline.
- V0.17 has no unfinished checkpoint.
- V0.16 Survival/Endless remains supported.
- Authoritative release evidence: `V018_RELEASE_VALIDATION.md`.

## Read first
1. `README.md`
2. `PROJECT_HANDOFF.md`
3. `ROADMAP.md`
4. `V018_GRAPHICS_PLAN.md`
5. `V018_RELEASE_VALIDATION.md`
6. `V017_RELEASE_VALIDATION.md`
7. `V017_DUEL_ARENA_PLAN.md`

Before editing, fetch latest relevant files and SHAs from GitHub `main`.

## Frozen gameplay contract
Do not alter the V0.17 gameplay baseline merely for presentation work.

Simulation owns:
- positions/facing
- action state
- HP/shield
- hit/damage/dodge result
- projectile truth
- control/KO state
- combat events
- tournament result

Graphics/UI never decide:
- hit success
- damage
- cooldown
- knockback distance
- fatal/revive ordering
- AI decisions
- skill offer truth
- tournament progression

Survival Movement V0.8 remains untouched unless explicitly requested.

## V0.18 released graphics stack
- asset/manifest-driven Renderer V2 is the normal Duel path
- V0.17 vector renderer remains a verified fallback
- 13 / 13 states: idle, walk, run, dash, melee, ranged, cast, hit, block, knockback, knockdown, recover, ko
- per-frame anchors: head/chest/leftHand/rightHand/feet/front/back/target
- original six-layer `Ashen Sanctum` arena
- presentation-only camera/parallax/shake/zoom
- 15 semantic VFX families
- Hợp Đạo / Siêu Cấp presentation overlays
- 20 / 20 Rare visual signatures
- Duel HUD/lobby/scouting/reward/result presentation polish
- full/constrained quality profiles + reduced-motion
- cache/memory observability + presentation-only VFX budgets

## G0–G6 closure summary
- G0 architecture/art direction lock ✅
- G1 asset loader + Renderer V2 foundation ✅
- G2 Fighter Visual V2, 13 / 13 states ✅
- G3 Ashen Sanctum + Camera Presentation V2 ✅
- G4 Full Duel VFX Readability Pass ✅
- G5 Duel UI / HUD / Tournament Presentation Polish ✅
- G6 Performance / Quality / Fallback Hardening ✅

Important G6 evidence:
- forced-vector Best-of-3 completes
- partial fighter asset + missing arena fallback completes
- production V2 preload confirms all 13 states + `Ashen Sanctum`
- desktop full/mobile constrained/reduced-motion paths pass
- transient VFX budgets preserve semantic input events
- browser hardening caught and fixed an invalid Renderer V2 `ctx.ellipse()` call

## G7 — COMPLETE ✅: V0.18 Integration / Release Validation
Pre-release label remained V0.17 until all G7 candidate gates were green.

Validated before promotion:
- V0.16 regression suite green
- V0.17 Duel mechanics/content regression green
- V0.17 desktop/mobile rendered validation green
- G5E UI closure green
- G6D forced-vector + partial-asset fallback green
- G6E desktop/mobile/reduced-motion green
- G7 production Renderer V2 desktop/mobile green
- production fighter/arena HTTP references green
- no missing production asset/runtime warning in G7 browser audit
- production V2 Best-of-3 completion green
- exact Pages asset artifact green
- Pages G1–G7 audit/deploy green on the pre-release head

Promotion performed only after those gates passed:
- `GAME_VERSION` → V0.18
- public title/version badge → V0.18
- Duel eyebrow → `V0.18 · ĐẤU TRƯỜNG 1V1`
- public cache keys for promoted version-bearing files advanced
- V0.17 final audit converted to a historical regression audit while keeping 80/28/12/20 assertions intact

Final promoted-label validation is the release gate. `V018_RELEASE_VALIDATION.md` records the closure contract and evidence.

## Locked content truth
- 80 base Kỹ Năng
- 28 Hợp Đạo Kỹ
- 12 Siêu Cấp
- 20 Rare rules
- 64-fighter Duel tournament
- Best-of-3 automatic combat
- two unrestricted starter choices
- one reroll per choice screen
- HUYẾT CHIẾN at 45s
- TỬ CHIẾN at 60s+

## Locked terminology / truth rules
- Kỹ Năng / Hợp Đạo Kỹ / Siêu Cấp / Thần Kỹ / Thần Bí Kỹ / TỐI ĐA.
- Player-facing UI remains Vietnamese.
- No hidden gameplay caps/cooldowns/stack maxima/target limits/retry rules/weighting.
- Preserve V0.12 hidden-shield-cap removal.
- Preserve Survival `Săn Ấn`: marked target gives +25% base XP only.
- Choice-card relation hints only appear when that exact choice immediately completes the unlock.
- Tests stay under `tests/` and are not shipped publicly.

## Status for next conversation
**V0.18 is COMPLETE / RELEASED. Treat it as the current frozen public baseline. V0.17 remains the historical mechanics/content regression baseline. Start future feature work from a new explicitly approved roadmap rather than silently reopening V0.18 combat/AI/balance truth.**
