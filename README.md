# Auto Battle Roguelite

Current release: **V0.20 – Complete Visual Rebuild**

Public build: `https://vgpro9x.github.io/auto-battle-roguelite/`

GitHub `main` is canonical.

## Current status
- V0.20 B0–B13: **COMPLETE**; B14 release integration is in final validation.
- Runtime/public version label: **V0.20**.
- V0.19 A0–A15: **COMPLETE / RELEASED** and retained as the tactical AI regression baseline.
- V0.18 Graphics & Presentation Overhaul remains the frozen graphics/presentation baseline.
- V0.17 Duel Arena remains the frozen historical mechanics/content baseline.
- Survival/Endless V0.16 remains supported.

Current V0.20 release evidence: `V020_COMPLETE_VISUAL_REBUILD_PLAN.md` and `V020_B14_RELEASE_SPEC.md`. Historical V0.19 evidence: `V019_RELEASE_VALIDATION.md`.

## V0.20 complete visual rebuild
- Renderer V3 with V2/vector fallback
- 13-state Ash Wanderer production animation set and Ashen Sanctum V3
- coherent enemy families, semantic combat VFX and high-tier spectacle
- UI/HUD V3 across Survival, Duel, Codex, tournament and results
- deterministic SVG icon system covering 80 base + 28 Hợp Đạo + 12 Siêu Cấp + 20 Rare identities
- combat impact/camera polish
- AUTO presentation quality for desktop/mobile/constrained devices
- desktop/mobile/reduced-motion/fallback and public artifact closure

V0.20 preserves V0.19 tactical AI plus locked V0.16/V0.17 combat/content truth.

## V0.19 tactical AI release
### Survival / Endless
- 32-sector encirclement perception
- predictive escape-corridor scoring
- stable corridor commitment instead of high-frequency heading thrash
- stuck/displacement detection + emergency breakout
- utility-based `escape`, `kite`, `harvest`, `patrol`
- bounded nearby-enemy perception for performance

The main behavioral change is that the fighter now commits to a viable escape corridor when surrounded or nearly surrounded instead of repeatedly reselecting almost-equal directions and appearing to spin in place.

### Duel 1v1
- tactical perception of range, walls, center, HP and offense readiness
- spatial target scoring
- utility tactics: ENGAGE, PRESSURE, SPACE, DISENGAGE, CENTER_RESET, CORNER_ESCAPE, FINISH
- post-burst spacing / re-engagement rhythm
- corner escape + attacker pressure-release logic
- build-aware melee/ranged/mobility/sustain/control behavior
- bounded human-like decision cadence
- same information/decision system for both fighters

The Duel AI now actively manages space rather than only walking toward preferred range and trading indefinitely in a corner.

### Validation delivered
- deterministic Survival A0–A5 gates
- deterministic Duel A6–A12 gates
- A13 Survival simulation matrix
- A13 Duel simulation matrix with build spacing and side-symmetry checks
- A14 bounded-performance smoke
- A14 rendered desktop/mobile browser validation
- full V0.17 historical regression
- V0.18 UI/fallback/performance/Renderer V2 regression
- GitHub Pages deployment validation

## V0.18 graphics baseline — COMPLETE / RELEASED
Renderer V2 remains asset/manifest-driven and keeps the V0.17 vector renderer as a verified fallback. V0.19 does not move combat truth into the renderer.

V0.18 retained:
- 13 / 13 semantic fighter states: `idle`, `walk`, `run`, `dash`, `melee`, `ranged`, `cast`, `hit`, `block`, `knockback`, `knockdown`, `recover`, `ko`
- per-frame `head`, `chest`, `leftHand`, `rightHand`, `feet`, `front`, `back`, `target` anchors
- six-layer `Ashen Sanctum` arena
- presentation camera/parallax/shake/zoom
- semantic VFX system
- Duel HUD/lobby/scouting/reward/result presentation
- full/constrained/reduced-motion quality paths
- forced-vector and partial-asset fallback coverage

Historical evidence: `V018_RELEASE_VALIDATION.md`.

## V0.17 historical mechanics/content baseline
V0.17 remains frozen except for bug fixes and retains:
- 64-fighter single-elimination Duel tournament
- Best-of-3 automatic combat
- two unrestricted starter choices
- one reroll on every choice screen
- opponent scouting
- 80 / 80 base Kỹ Năng Duel
- 28 / 28 Hợp Đạo Kỹ Duel
- 12 / 12 Siêu Cấp Duel
- 20 / 20 Rare Duel rules
- HUYẾT CHIẾN at 45s and TỬ CHIẾN at 60s+

## Locked development rules
- GitHub `main` is canonical.
- Fetch latest content/blob SHA before editing an existing file.
- Commit every meaningful checkpoint.
- V0.20 is presentation-first and preserves V0.19 tactical AI/movement plus the frozen V0.16/V0.17 combat/content truth; unrelated balance/content changes still require a new explicit roadmap.
- Player-facing UI remains Vietnamese.
- No hidden gameplay caps/cooldowns/stack maxima/target limits/retry rules/weighting.
- Preserve V0.12 hidden-shield-cap removal.
- Preserve Survival `Săn Ấn`: marked target gives +25% base XP only.
- Choice-card relation hints only appear when that exact choice immediately completes the unlock.
- Executable tests stay under `tests/` and are never shipped in the public Pages artifact.
- Presentation work must not rebalance combat/AI/tournament/skill acquisition merely for visuals.

## Read before future development
1. `README.md`
2. `PROJECT_HANDOFF.md`
3. `ROADMAP.md`
4. `V020_COMPLETE_VISUAL_REBUILD_PLAN.md`
5. `V020_B14_RELEASE_SPEC.md`
6. `V019_TACTICAL_AI_PLAN.md`
7. `V019_RELEASE_VALIDATION.md`
8. `V018_GRAPHICS_PLAN.md`
9. `V018_RELEASE_VALIDATION.md`
10. `V017_RELEASE_VALIDATION.md`
11. `V017_DUEL_ARENA_PLAN.md`

## Project status
**V0.20 is the current public release candidate in B14 final validation. V0.19 remains the frozen tactical AI baseline; V0.18 and V0.17 remain historical presentation/mechanics regression baselines.**
