# Auto Battle Roguelite

Current release: **V0.19 – Tactical AI & Movement Intelligence**

Public build: `https://vgpro9x.github.io/auto-battle-roguelite/`

GitHub `main` is canonical.

## Current status
- V0.19 A0–A15: **COMPLETE / RELEASED**.
- Runtime/public version label: **V0.19**.
- V0.18 Graphics & Presentation Overhaul remains the frozen graphics/presentation baseline.
- V0.17 Duel Arena remains the frozen historical mechanics/content baseline.
- Survival/Endless V0.16 remains supported.

Release evidence: `V019_RELEASE_VALIDATION.md`.

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
- V0.19 is the authorized tactical AI/movement rewrite; unrelated combat/content rebalance still requires a new explicit roadmap.
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
4. `V019_TACTICAL_AI_PLAN.md`
5. `V019_RELEASE_VALIDATION.md`
6. `V018_GRAPHICS_PLAN.md`
7. `V018_RELEASE_VALIDATION.md`
8. `V017_RELEASE_VALIDATION.md`
9. `V017_DUEL_ARENA_PLAN.md`

## Project status
**V0.19 is COMPLETE / RELEASED. V0.18 remains the frozen graphics/presentation baseline and V0.17 remains the frozen historical mechanics/content baseline.**
