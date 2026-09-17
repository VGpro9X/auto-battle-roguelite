# V0.20 — B7 Core Combat VFX Library

Status: **ACTIVE — V3 CORE LIBRARY INTEGRATED / BROWSER VALIDATION RUNNING**

B7 migrates reusable base combat effects from Renderer V2 into a bounded Renderer V3 presentation layer. It does not change combat, projectile, status, skill, AI or tournament truth.

## Semantic families
The V3 core library preserves the established 15-family vocabulary:
- physical
- projectile
- fire
- frost
- lightning
- poison
- blood
- defense
- heal
- control
- summon
- area
- chain
- time
- soul

The library uses three reusable primitive grammars — burst, ring and beam — with family-specific palette and lifecycle behavior. B8 will map individual skills onto this grammar; B9 remains responsible for high-tier spectacle/signatures.

## Event ownership
V3 may consume existing presentation events including hit, melee attack, projectile spawn, cast, status, heal, shield gain, area, orbit hit, dodge, revive and KO when they resolve to a known semantic family.

Ownership is split inside the V3 bridge:
1. V3-owned base events are removed from the Renderer V2 base-VFX feed so the same effect is not drawn twice.
2. Events not owned by V3 continue through Renderer V2 normally.
3. V3-owned events are still forwarded to the existing tier overlay and camera observers, preserving Hợp Đạo / Siêu Cấp / Rare presentation and camera response.
4. If the V3 VFX module is unavailable, all events continue through the released V2 path.

Simulation event creation and outcomes remain untouched.

## Quality/lifecycle budgets
Core transient limits are presentation-only:
- FULL: 112 active effects, up to 6 primitive particles per burst, alpha scale 1.00
- BALANCED: 72 active effects, up to 4 primitive particles per burst, alpha scale 0.82
- LOW: 36 active effects, up to 2 primitive particles per burst, alpha scale 0.62

When the budget is exceeded, the oldest presentation-only effect is discarded. No gameplay event, hit or projectile is discarded.

Effects have bounded lifetimes by family. Reduced-motion shortens projectile-spawn presentation and does not alter projectile simulation.

## Runtime files
- `js/duel-vfx-v3.js` — V3 family resolver, lifecycle/budget manager and reusable primitives.
- `js/duel-renderer-v3-bridge.js` — event ownership split and V3 render integration.
- `index.html` — loads Renderer V3 → VFX V3 → V3 bridge in deterministic order with B7 cache keys.

## Validation
- `tests/v020-b7-core-vfx-runtime-smoke.js`
  - verifies the 15-family vocabulary
  - samples every family
  - verifies balanced transient trimming and lifecycle expiry
  - verifies V3/V2 ownership split and tier/camera forwarding
  - rejects simulation ownership signatures
- `tests/v020-b7-core-vfx-browser-driver.html`
  - exercises a real V3 fire-hit event
  - checks V3 core activity
  - verifies the owned event is not duplicated into the V2 base path
  - verifies tier/camera observers still see the owned event
- `.github/workflows/v020-b7-core-vfx-browser-validation.yml`
  - static smoke
  - desktop Chromium 1280×720
  - mobile Chromium 360×640

## Exit gate
B7 closes only after static + desktop/mobile browser validation passes and the master plan is updated. Public/runtime version text stays V0.19 until B14.