# V0.20 — B10 UI/HUD V3

Status: **COMPLETE ✅ — B10A/B10B/B10C INTEGRATED**

B10 modernizes presentation and composition while preserving all existing V0.19/V0.18/V0.17 gameplay, tournament and content truth.

## Art direction
Locked to the V0.20 UI Bible:
- dark glass
- aged metal
- restrained mystical/rune accents
- Vietnamese text first
- ornament on edges/corners, never behind body copy
- hierarchy before texture
- touch-friendly mobile composition
- selected/available/locked states must remain distinguishable beyond hue alone

## Existing UI audit
The current app already has a strong functional responsive foundation, but presentation is split across several generations:
- base menu/Survival HUD/result styles in `css/game.css`
- mobile composition in `css/v015-responsive.css`
- mobile Codex interaction in `css/v015-codex.css`
- Duel composition in `css/v017-duel.css`
- selected Duel reward/result polish in `css/v018-ui.css`

B10 therefore uses an additive V0.20 layer rather than replacing functional responsive logic or changing DOM/game state unnecessarily.

## B10A — shared shell + Survival UI
Runtime layer: `css/v020-ui-hud.css`.

B10A covers:
- shared overlay/card surface language
- main menu and mode selection
- buttons/navigation hierarchy
- Survival HP/XP HUD, mode/level/time/kill pills and pause control
- bottom skill strip
- build tracker + mobile build drawer skin
- unlock toast
- level-up/reward choices
- Codex shell/cards/detail skin while preserving V0.15 tap-first mobile behavior
- Survival result, settings, pause and how-to surfaces
- shared shell inheritance for Duel lobby/pre-match/HUD without replacing V0.18 Duel-specific hierarchy

The layer is imported by the already-global `css/v017-duel.css` stylesheet, so no gameplay bootstrap or script order changes are required.

## Mobile composition
At <=700 px:
- existing V0.15 safe-area and compact HUD layout remains authoritative
- B10A reduces ornament/radius/padding rather than adding extra overlays
- mode cards remain compact and scrollable through existing layout rules
- Codex keeps its existing slide-in detail interaction
- skill strip and build drawer remain horizontally/vertically bounded

Landscape <=520 px retains the existing V0.15 layout contract with reduced decorative cost.

## Accessibility / motion
- focus-visible structure remains intact
- hover-only elevation is suppressed on touch devices
- `prefers-reduced-motion: reduce` removes B10A UI transitions/transforms
- presentation color never changes gameplay state

## Ownership boundary
B10 presentation must not mutate:
- HP/XP/level/kill values
- timers/mode rules
- skill roll/reroll logic
- skill acquisition/unlock rules
- tournament bracket or Best-of-3 state
- AI, movement, damage, cooldowns, fatal/revive ordering

## Validation
B10A adds:
- `tests/v020-b10-ui-hud-smoke.js` for stylesheet wiring, required surface coverage, responsive/reduced-motion contract and presentation-only scope
- `tests/v020-b10-ui-hud-browser-driver.html` for real-app desktop/mobile computed-style and width containment checks
- `.github/workflows/v020-b10-ui-hud-validation.yml` for static + 1280×720 desktop + 360×640 mobile coverage

## B10B — Duel UI/HUD V3
Runtime layer: `css/v020-duel-ui.css`.

B10B completes:
- Duel lobby and rules presentation
- pre-match two-sided confrontation layout
- tournament build chips and reward-choice presentation
- combat HUD, HP/shield framing, phase/timer hierarchy
- Duel result/build presentation
- compact mobile layouts at <=760 px and <=480 px
- reduced-motion-safe TỬ CHIẾN presentation

## B10C — cross-device closure
B10C validates the combined UI system instead of treating Survival and Duel as isolated skins:
- desktop 1280×720 composition
- mobile 360×640 composition using an explicit iframe viewport
- menu / mode / Codex / result / Duel surfaces
- no horizontal overflow in the checked public surfaces
- reduced-motion transition/animation closure
- presentation-only ownership boundary retained

Validation:
- `tests/v020-b10-ui-hud-smoke.js`
- `tests/v020-b10-duel-ui-smoke.js`
- `tests/v020-b10c-ui-closure-smoke.js`
- browser validation drivers for desktop/mobile/reduced-motion
- Pages now runs the combined B10 static closure gate before publishing the public artifact

## Handoff
B10 is complete. The next checkpoint is **B11 — Icon Production**. B11 replaces inconsistent runtime emoji presentation with a deterministic SVG icon language while retaining legacy metadata icons as compatibility fallback.

Public/runtime version remains V0.19 until B14.
