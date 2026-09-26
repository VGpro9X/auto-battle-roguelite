# V0.24 — Unique Survival Skill Visual Language Release Validation

Status: **COMPLETE / RELEASED ✅** (owner in-game evaluation pending).

## Delivered
- Procedural, original 2D signature catalog for all 80 existing Survival base skills.
- 52 hand-authored ID-specific profiles (cast, hit, passive acquisition) and 28 deterministic ID-seeded derived designs, tied to existing skill/source IDs. E.g. Fireball's comet vs Fire Wisp orbit, Lightning's forks vs Storm Totem sigil, Frost flake vs Frost Mirror prism, Black Hole accretion, Meteor crater, Rune Mine and Soul Bind glyphs.
- Unique on-canvas silhouettes for active projectiles: fire, Fire Wisp, Chaos Orb, Echo Shot, Afterimage and Spirit Pearl. The legacy V0.13, V0.22 Galaxy and V0.23 generic FX still operate; V0.25 retains high-tier spectacles.
- Presentation-only event subscriptions to selected skill, hit, periodic cast/echo, heal and arrow-build attack. No simulation RNG, damage, cooldown, rarity, AI or Duel changes.
- Full/balanced/low allocation 38/24/12 and per-frame drawing 18/10/5. Per-source and per-target event throttling, reduced-motion path and new-run reset.

## Verified September 26, 2026
- [V0.24 real browser validation run #2](https://github.com/VGpro9X/auto-battle-roguelite/actions/runs/36210439666): **SUCCESS**.
  - Structural smoke: PASS · 80 catalogue skills · 52 hand-authored profiles · individual cast/hit/passive and projectile tests · low-quality budgets/reduced-motion/reset.
  - Desktop 1280×720: PASS · actual fire and lightning periodic skill trigger integration · 139609 differentiated impact pixel delta.
  - Mobile 360×640: PASS · same gameplay triggers and individual silhouettes in low-quality profile · 167209 differentiated pixel delta.
- [Pages integration run #852](https://github.com/VGpro9X/auto-battle-roguelite/actions/runs/36210439766): **SUCCESS** including legacy release gates and V0.24 smoke.
- V0.24 public/runtime promotion commit: `d54f0b5906290184964c4faab6fac1b4244b2c35`.
- [Production GitHub Pages run #854](https://github.com/VGpro9X/auto-battle-roguelite/actions/runs/36210581953): **SUCCESS**, all V0.17–V0.24 static/simulation gates and public artifact deployed.
- [Final V0.24 desktop/mobile skill-identity browser run #4](https://github.com/VGpro9X/auto-battle-roguelite/actions/runs/36210582044): **SUCCESS**; desktop and mobile both verify actual periodic skill triggers, 80/80 coverage, 52 authored profiles and distinct Fireball/Lightning on-canvas impacts.
- Historical release regressions on the promoted commit: [V0.17](https://github.com/VGpro9X/auto-battle-roguelite/actions/runs/36210581949), [V0.18 G7](https://github.com/VGpro9X/auto-battle-roguelite/actions/runs/36210582017), [V0.19 A15](https://github.com/VGpro9X/auto-battle-roguelite/actions/runs/36210582059): **ALL SUCCESS**.

Public URL: https://vgpro9x.github.io/auto-battle-roguelite/

**Stop after V0.24.** Ask the owner to test the real Survival/Endless on the public Pages link before implementing V0.25 high-tier skills.
