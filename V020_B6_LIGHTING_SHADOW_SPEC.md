# V0.20 — B6 Lighting & Shadow Runtime Contract

Status: **ACTIVE — RUNTIME PASS INTEGRATED / VALIDATION RUNNING**

B6 is presentation-only. Simulation remains authoritative for hit, damage, projectile position, shield value, HP, targeting, movement, phase timing and KO truth.

## Implemented runtime pass
The V3 bridge now adds a bounded post-render lighting layer that reads existing Duel state/events only:
- fighter contact shadows remain tied to the existing visual root and do not change collision footprints;
- local projectile glow reads `round.projectiles` without changing projectile movement or hit logic;
- shield glow reads existing positive shield values;
- short impact/heal/shield/KO light flashes are spawned from already-produced renderer events;
- HUYẾT CHIẾN and TỬ CHIẾN receive restrained atmosphere tint from `round.phase`;
- a low-HP vignette appears below 25% HP and never changes combat state.

## Quality budgets
`FULL`, `BALANCED` and `LOW` limit presentation work only.

Current caps:
- FULL: up to 10 projectile glows, 8 active event flashes, alpha scale 1.00
- BALANCED: up to 6 projectile glows, 5 active event flashes, alpha scale 0.78
- LOW: up to 3 projectile glows, 2 active event flashes, alpha scale 0.52

Reduced-motion mode shortens/contains spatial light response and avoids adding animation-driven camera behavior.

## Event ownership
Lighting may observe:
- `hit`
- `heal`
- `shield_gain`
- `ko`

It may not create those events or call damage/heal/projectile simulation functions.

## Fallback
Lighting exists only inside the Renderer V3 bridge. If V3 initialization fails, released Renderer V2/vector fallback continues without depending on B6.

## Validation
- `tests/v020-b6-lighting-runtime-smoke.js` checks budgets, event ownership, phase/low-HP hooks and absence of simulation mutation signatures.
- `tests/v020-b6-lighting-browser-driver.html` renders a real V3 scene with projectile, shield, impact flash, TỬ CHIẾN atmosphere and low HP.
- `.github/workflows/v020-b6-lighting-browser-validation.yml` runs the static gate and desktop 1280×720/mobile 360×640 Chromium smoke.

B6 remains ACTIVE until the browser workflow is green and the master plan is updated.