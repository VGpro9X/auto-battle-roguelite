# Auto Battle Roguelite

Current master version: **V0.11 – Skill Codex & Shared VFX Foundation**

A browser-based auto-battle survival roguelite prototype built around unrestricted cross-archetype skill combinations.

## Current game modes
- 5 minutes — 3 unique starter skill picks
- 10 minutes — 2 unique starter skill picks
- 15 minutes — 1 starter skill pick
- 20 minutes — 1 starter skill pick
- Endless — 1 starter skill pick, difficulty scales without a fixed end

## Movement AI
- V0.8 strategic zone planning + tactical context steering remains the movement baseline
- Harvest, kite, committed emergency escape and patrol modes
- XP clusters, open-space preference, edge/corner penalties and multi-horizon escape routing

## Skill system
- **64 base skills** with no class restriction
- **20 automatic synergies**
- **8 evolutions**
- Shared event bus and periodic scheduler
- Build-aware random level-up choices
- MAX skills and evolved bases are excluded from the level-up pool
- Evolution hints only appear when the offered skill actually advances the evolution recipe

## V0.11 Skill Codex
- Main menu now includes **KỸ NĂNG**
- Synergies are always prioritized at the top of the default codex view
- Evolutions appear immediately after synergies
- Base skills are assigned to readable groups: Attack/Projectile, Elemental, Summon, Defense/Healing, Control/Movement, XP/Growth, Trigger/Chain, and Time/Rule
- Hover, keyboard focus, or click updates a detailed information panel
- Detail view shows descriptions, tags, synergy ingredients, evolution requirements, and related combinations
- Every codex entry has a live Canvas preview; no static image assets are required
- Only visible mini-previews animate, reducing unnecessary work when the catalog contains many entries

## Shared VFX foundation
- `js/vfx.js` contains reusable visual primitives for projectiles, elemental effects, orbit blades, shields, enemy statuses, area pulses, lightning and codex previews
- Gameplay projectile rendering, orbit blades, shields and status rings now call the same primitives used by the Skill Codex
- This is the foundation for the next visual gameplay pass so codex animations and in-run effects can evolve together instead of becoming separate implementations

## Build clarity
- Level-up cards show skill tags and valid synergy/evolution hints
- Persistent `BUILD SYNERGY` tracker shows unlocked and near-complete recipes
- Synergy/evolution unlocks use queued on-screen banners
- Skill bar labels skills as MAX or EVOLVED

## Validation performed for V0.11
- JavaScript syntax checks for all project modules
- Codex definition test confirms 64 base skills, 20 synergies and 8 evolutions
- All 64 base skills resolve to exactly one primary codex group
- All 92 codex entries resolve to a valid preview type
- Mock-canvas rendering test executes every skill/synergy/evolution preview without throwing
- Static index validation confirms the KỸ NĂNG menu entry, codex screen and required script order

## Project structure
- `index.html` — game shell, menus and Skill Codex screen
- `css/game.css` — prototype gameplay UI, build clarity and codex layout
- `js/core.js` — shared state and player build stats
- `js/modes.js` — mode rules and difficulty curves
- `js/leaderboard.js` — local records/settings
- `js/skills.js` — 64 base skill definitions and tags
- `js/skill-engine.js` — event bus, periodic scheduler, choice rules and unlock evaluation
- `js/synergies.js` — 20 synergy definitions and 8 evolution definitions/hooks
- `js/combat.js` — damage, statuses, projectiles, shields, revival and XP drops
- `js/movement.js` — V0.8 strategic/tactical movement AI
- `js/vfx.js` — shared gameplay/codex visual primitives
- `js/skill-codex.js` — catalog grouping, interaction, details and animated previews
- `js/ui.js` — menus, level-up choices, build tracker and unlock banners
- `js/evolution-hint-fix.js` — V0.10 evolution-hint specificity hotfix
- `js/game.js` — main update/draw loop and shared VFX integration

## Development rule
GitHub is the master source. Chat previews and packaged builds are test/checkpoint artifacts.
