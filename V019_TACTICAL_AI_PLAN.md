# V0.19 – Tactical AI & Movement Intelligence

Status: **COMPLETE / RELEASED**

GitHub `main` is canonical. V0.19 is the current released/public baseline after A15 promotion.

## Goal
Improve decision quality in Survival/Endless and Duel 1v1 without changing skill content, damage formulas, tournament structure, reward rules, or Renderer V2 presentation truth.

Primary defects addressed:
- Survival could become surrounded or nearly surrounded and rotate/oscillate instead of committing to an escape route.
- Duel 1v1 could push fighters into a corner and remain nearly stationary while trading attacks with little tactical movement.

## Architecture delivered

### Survival
- context steering with directional danger / interest
- 32-sector encirclement analysis
- predictive escape-corridor scoring
- corridor commitment + hysteresis
- displacement/stuck detection + emergency breakout
- strategic utility for `escape`, `kite`, `harvest`, `patrol`
- bounded nearby-enemy perception for performance

The AI chooses a viable escape corridor and commits to moving through it instead of repeatedly reselecting nearly-equal headings.

### Duel 1v1
The side-view one-dimensional combat space remains unchanged.

Delivered:
- tactical perception
- candidate-position / spatial scoring
- utility tactics: `ENGAGE`, `PRESSURE`, `SPACE`, `DISENGAGE`, `CENTER_RESET`, `CORNER_ESCAPE`, `FINISH`
- post-burst footsies / spacing rhythm
- corner escape and corner-pressure release
- build-aware melee/ranged/mobility/sustain/control weights
- bounded human-like decision cadence and commitment
- shared decision system for both fighters

## Locked invariants retained
- V0.17 content truth remains 80 base / 28 Hợp Đạo / 12 Siêu Cấp / 20 Rare.
- 64-fighter tournament and Best-of-3 rules unchanged.
- HUYẾT CHIẾN at 45s and TỬ CHIẾN at 60s+ unchanged.
- Damage, cooldown, dodge, fatal/revive ordering and skill mechanics unchanged by the AI work.
- Renderer V2 and vector fallback remain presentation-only consumers of simulation truth.
- Player-facing UI remains Vietnamese.
- Tests remain under `tests/` and are not shipped in the Pages artifact.

## Checkpoints
- A0 AI Diagnostics & Reproduction — **COMPLETE ✅**
- A1 Shared Decision Stability Foundation — **COMPLETE ✅**
- A2 Survival Encirclement Detection V2 — **COMPLETE ✅**
- A3 Survival Predictive Escape V2 — **COMPLETE ✅**
- A4 Survival Anti-Spin / Stuck Recovery — **COMPLETE ✅**
- A5 Survival Strategic Utility V2 — **COMPLETE ✅**
- A6 Duel Tactical Perception — **COMPLETE ✅**
- A7 Duel Spatial Position Scoring — **COMPLETE ✅**
- A8 Duel Utility Action System — **COMPLETE ✅**
- A9 Duel Footsies / Combat Rhythm — **COMPLETE ✅**
- A10 Duel Corner Intelligence — **COMPLETE ✅**
- A11 Build-Aware Fighting Styles — **COMPLETE ✅**
- A12 Human-Like Decision Timing — **COMPLETE ✅**
- A13 AI Simulation & Balance Lab — **COMPLETE ✅**
- A14 Performance + Mobile Gate — **COMPLETE ✅**
- A15 Integration / Release — **COMPLETE ✅**

## Validation summary
A13/A14 gates include deterministic and batch simulation for Survival encirclement, Duel spacing/corner behavior, build identity, side symmetry, bounded performance, and desktop/mobile browser runtime.

Pre-promotion A14 head: `5f5568031c11009ec1bea68d8d49de89de67b6d0`.

On that head all of the following were green:
- V0.19 tactical AI validation
- V0.19 A14 desktop/mobile browser validation
- V0.17 historical mechanics/content regression
- V0.18 mobile Duel lobby regression
- V0.18 G5E UI regression
- V0.18 G6D fallback regression
- V0.18 G6E performance regression
- V0.18 G7 graphics/release regression
- GitHub Pages deployment

Final release evidence: `V019_RELEASE_VALIDATION.md`.

## Release policy
V0.19 intentionally changes AI/movement decision truth within the approved scope. It does not authorize unrelated combat/content rebalance.
