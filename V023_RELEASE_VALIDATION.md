# V0.23 — Core Survival Skill Impact FX Release Validation

Status: **COMPLETE / RELEASED ✅** (owner visual/gameplay evaluation pending).

## Scope
Actual Survival and Endless Canvas2D combat VFX. Procedural muzzle flashes and directional projectile trails; dedicated family animations for melee, projectile impact, fire, ice, lightning, poison, control, area and magic; heal, shield, revive and crit FX; tiny visual-only camera shake. No gameplay simulation, skill, probability, AI or Duel changes.

The visual-only module `js/v023-survival-skill-fx.js` uses the existing real event stream, does not call Math.random, suppresses DOT/regen floods, resets on a fresh run and honors reduced motion. Quality transient/frame caps: full 76/33, balanced 48/21, low 24/10.

## Verification — September 25, 2026
- [Real desktop/mobile browser validation run #3](https://github.com/VGpro9X/auto-battle-roguelite/actions/runs/36150584482): **SUCCESS**. Desktop 1280×720 actual auto-attack spawned 7 VFX and full-quality critical impact passed a large canvas pixel-difference test. Mobile 360×640 actual auto-attack spawned 9 VFX, low quality and canvas visibility passed. No runtime errors.
- [GitHub Pages run #840](https://github.com/VGpro9X/auto-battle-roguelite/actions/runs/36150233612): **SUCCESS**, including V0.23 event, trail, mobile budget, reduced motion and cleanup smoke.
- Final runtime label promotion to V0.23 in this commit triggers a fresh Pages and browser verification cycle.

Public URL: https://vgpro9x.github.io/auto-battle-roguelite/

**Stop after V0.23.** The owner must visually test live combat and approve before starting V0.24 individual skill signatures.
