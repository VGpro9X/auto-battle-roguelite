# V0.20 — B3 Asset Review Log

Status: **B3 IN PROGRESS**

## Generation pass 01 — animation reference sheet
The first B3 generation pass successfully established a coherent Ash Wanderer motion language across locomotion and reaction poses, but it is **REFERENCE ONLY** and is not promoted into the runtime manifest.

### Useful results
- character identity remains broadly coherent across idle/walk/run/dash
- forward action silhouette is readable
- scarf/coat follow-through gives useful motion direction
- knockdown/recover/KO sequence establishes a viable reaction language
- compact gameplay silhouette remains distinguishable against a dark neutral field

### Rejected as runtime production sheet
- generated frame counts do not exactly match the locked production targets in several states
- sheet includes labels/layout/background rather than isolated transparent runtime cells
- some repeated/incorrect frame numbering indicates it must not be mechanically sliced
- reaction states were generated before their dedicated batch and therefore remain visual reference only
- baked effect examples are not body-animation assets

### Decision
Do **not** add any generated state from pass 01 to `assets/v020/fighters/ash-wanderer/manifest.json`. V2 fallback remains active for every fighter state.

### Next generation pass
Produce dedicated B3.2 combat/casting reference for `melee`, `ranged`, `cast`, `block`, followed by isolated per-state production generation. Runtime promotion only occurs after exact frame count, transparent isolation, root normalization and eight-anchor validation.