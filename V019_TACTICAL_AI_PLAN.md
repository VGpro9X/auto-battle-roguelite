# V0.19 – Tactical AI & Movement Intelligence

Status: **APPROVED / IN PROGRESS**

GitHub `main` is canonical. V0.18 remains the current released/public baseline until V0.19 final promotion.

## Goal
Improve decision quality in both supported automatic-combat modes without changing skill content, damage formulas, tournament structure, reward rules, or Renderer V2 presentation truth.

Primary user-reported defects:
- Survival can become surrounded or nearly surrounded and visibly rotate/oscillate instead of committing to an escape route.
- Duel 1v1 often pushes both fighters into a corner, then remains nearly stationary while trading attacks with little tactical movement.

## Architecture direction
### Survival
Use a hybrid of:
- context steering / directional danger + interest
- encirclement-sector analysis
- predictive corridor scoring
- tactical hysteresis / commitment
- stuck detection + emergency breakout
- strategic utility for `escape`, `kite`, `harvest`, `patrol`

The AI must choose an escape corridor and commit to moving through it instead of repeatedly reselecting nearly-equal headings.

### Duel 1v1
Keep the existing side-view one-dimensional combat space for V0.19. Do not add a second movement axis.

Use:
- tactical perception
- candidate-position spatial scoring
- utility-based tactical states
- combat rhythm / footsies
- explicit corner pressure and corner escape logic
- build-aware tactical weights
- bounded human-like decision cadence and commitment

## Locked invariants
- V0.18 remains public/released until V0.19 release validation passes.
- V0.17 content truth stays 80 base / 28 Hợp Đạo / 12 Siêu Cấp / 20 Rare.
- 64-fighter tournament and Best-of-3 rules stay unchanged.
- HUYẾT CHIẾN at 45s and TỬ CHIẾN at 60s+ stay unchanged.
- Damage, cooldown, dodge, fatal/revive ordering and skill mechanics do not change merely because AI changed.
- Renderer V2 and vector fallback remain presentation-only consumers of simulation truth.
- Player-facing UI remains Vietnamese.
- Tests remain under `tests/` and are not shipped in Pages artifact.

## Checkpoints

### A0 – AI Diagnostics & Reproduction
Status: **NEXT**
- deterministic seeded scenario helpers
- Survival encirclement fixtures: 180°, 270°, 330° pressure and near-wall variants
- Duel corner-lock fixture and long stationary-exchange detection
- observability for current tactic, chosen heading/corridor, danger, stuck duration, corner pressure and movement distance
- no production debug UI required

Exit gate: the two reported failure classes are reproducible and measurable.

### A1 – Shared Decision Stability Foundation
Status: **PENDING**
- explicit perception → tactical decision → movement separation
- hysteresis between tactics
- minimum tactical commitment windows
- stable tie-breaking for near-equal scores
- decision cadence slower than render cadence where possible

Exit gate: no high-frequency mode/heading thrash in deterministic tests.

### A2 – Survival Encirclement Detection V2
Status: **PENDING**
- 24–32 angular sectors around player
- threat density / nearest threat / wall risk per sector
- contiguous-open-sector detection
- encirclement score before full enclosure occurs

Exit gate: 180° / 270° / 330° fixtures classify pressure correctly and identify available gaps.

### A3 – Survival Predictive Escape V2
Status: **PENDING**
- predict enemy positions along short future horizons
- evaluate a corridor, not a single ray endpoint
- score corridor width, future closure risk, edge/corner risk and final clearance
- choose center of the best contiguous escape corridor

Exit gate: available future-safe gap is preferred over a currently-open but closing route.

### A4 – Survival Anti-Spin / Stuck Recovery
Status: **PENDING**
- track expected movement vs actual displacement over a rolling window
- detect repeated large heading reversals
- emergency breakout state with stronger commitment
- keep chosen corridor roughly 0.6–1.0s unless it truly collapses
- if every direction is dangerous, force the least-bad committed breakout rather than indecision

Exit gate: surrounded fixtures never remain effectively stationary while repeatedly changing headings when movement space exists.

### A5 – Survival Strategic Utility V2
Status: **PENDING**
- replace brittle threshold-only transitions with bounded utility scoring
- include HP pressure, enemy density, edge risk, XP value and build mobility/survivability where available
- preserve readable tactic hysteresis

Exit gate: AI reliably abandons greed under lethal pressure and returns to harvest/patrol when safe.

### A6 – Duel Tactical Perception
Status: **PENDING**
- distance and preferred range
- own/opponent wall distance
- center control
- HP ratio
- attack/dash readiness
- relevant skill readiness summary
- recent tactic/action history
- corner pressure state

Exit gate: both fighters expose a deterministic tactical snapshot each decision tick.

### A7 – Duel Spatial Position Scoring
Status: **PENDING**
Candidate positions include:
- center reset
- preferred-range points
- forward pressure
- backstep / disengage
- corner escape

Score terms include:
- range fit
- center control
- own wall safety
- opponent corner pressure
- travel cost
- cooldown readiness

Exit gate: AI selects non-corner positions when offense is not ready and has viable space.

### A8 – Duel Utility Action System
Status: **PENDING**
Tactics:
- `ENGAGE`
- `PRESSURE`
- `SPACE`
- `DISENGAGE`
- `CENTER_RESET`
- `CORNER_ESCAPE`
- `FINISH`

Basic attack remains an execution action, not an unconditional top-level tactic solely because target is in range.

Exit gate: tactical choices vary with position/readiness/HP instead of distance alone.

### A9 – Duel Footsies / Combat Rhythm
Status: **PENDING**
- short post-burst spacing window
- re-engage near attack/skill readiness
- ranged builds preserve greater space
- melee/mobile builds pressure more aggressively
- prevent perpetual ping-pong via tactic commitment

Exit gate: measurable engage → disengage/reset → re-engage cycles occur in normal matches.

### A10 – Duel Corner Intelligence
Status: **PENDING**
- corner escape utility rises sharply when self is trapped
- attacker may pressure a corner only while offense is ready
- attacker yields spacing when main offense is cooling down
- anti-corner-lock timer prevents long min-separation exchanges at the wall

Exit gate: corner occupancy and stationary wall exchanges fall materially in deterministic simulations.

### A11 – Build-Aware Fighting Styles
Status: **PENDING**
- melee
- ranged
- mobility
- sustain
- control

Use shared tactics with different weights; do not fork the engine into separate AI implementations.

### A12 – Human-Like Decision Timing
Status: **PENDING**
- normal tactical re-evaluation roughly 0.18–0.32s
- emergency reactions faster
- tactics have commitment windows
- deterministic RNG remains injectable for tests

### A13 – AI Simulation & Balance Lab
Status: **PENDING**
- seeded batch simulation
- Survival encirclement matrices
- Duel melee/ranged/mobility/sustain/control matchups
- corner start / low HP / dash-ready cases
- metrics: displacement, heading reversals, stuck duration, corner occupancy, stationary melee time, tactic transitions and win-rate symmetry

### A14 – Performance + Mobile Gate
Status: **PENDING**
- expensive perception runs on bounded cadence
- predictive Survival scans use nearby hostile subset
- no per-frame unbounded allocations/scans
- desktop/mobile browser validation

### A15 – Integration / Release
Status: **PENDING**
- V0.16 regression green
- V0.17 historical mechanics/content regression green
- V0.18 graphics/fallback/UI/performance regression green
- V0.19 AI deterministic tests green
- V0.19 browser/mobile gate green
- version/public label promoted only after pre-release matrix is green

## Acceptance metrics
### Survival
- When a viable escape gap exists, emergency movement must not remain effectively stationary for ~0.4–0.5s due to decision oscillation.
- Heading reversals during a single committed escape must be bounded.
- 180° and 270° pressure scenarios should escape reliably; 330° scenarios should choose and commit to the remaining gap when viable.
- Edge/corner avoidance must not override an immediately necessary breakout into the only survivable corridor.

### Duel
- materially lower corner occupancy than V0.18 baseline
- materially lower stationary melee time at or near minimum separation
- regular tactical spacing/re-engagement cycles
- ranged builds maintain meaningfully larger distance than melee builds
- no fixed side advantage introduced by AI logic
- both fighters use the same decision system and information rules

## Release policy
V0.19 development may intentionally change AI/movement decision truth because this roadmap explicitly authorizes that scope. It does not authorize unrelated combat rebalance or content changes.
