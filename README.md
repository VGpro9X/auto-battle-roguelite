# Auto Battle Roguelite

Current master version: **V0.8 – Committed Escape Routing**

A browser-based auto-battle survival roguelite prototype.

## Current game modes
- 5 minutes — 3 unique starter skill picks
- 10 minutes — 2 unique starter skill picks
- 15 minutes — 1 starter skill pick
- 20 minutes — 1 starter skill pick
- Endless — 1 starter skill pick, difficulty scales without a fixed end

Timed modes end in Victory when the countdown reaches zero. Endless ends on death and records survival time.

## Current systems
- Main menu and mode select
- Pause / restart / return to menu
- Local leaderboards per mode
- Timed-mode Run Score
- Endless survival-time ranking
- Local settings
- Two-layer autonomous movement: strategic zone planning + tactical context steering
- Strategic modes: harvest XP, kite, emergency escape and patrol
- Stable patrol fallback for low-pressure moments
- XP evaluated as spatial clusters
- Strong center/open-space preference with explicit corner/edge penalties
- V0.8 emergency escape hysteresis to reduce ESCAPE/KITE indecision
- V0.8 multi-horizon escape scan across 48 headings and 4 look-ahead distances
- V0.8 committed escape corridor: keep the chosen gap briefly unless it materially collapses
- 18-skill pool including multishot, piercing, critical hits, lightning, nova, frost aura, heal-on-kill and XP gain
- Difficulty normalized by run progress for timed modes

## Project structure
- `index.html` — screens and game shell
- `css/game.css` — interface and prototype visuals
- `js/core.js` — canvas, shared state and player base/build stats
- `js/modes.js` — game mode rules, starter picks and difficulty curves
- `js/leaderboard.js` — local records and settings persistence
- `js/skills.js` — skill definitions
- `js/combat.js` — enemies, projectiles, damage, crit/pierce and XP
- `js/movement.js` — strategic movement planner, patrol, kite and committed emergency escape routing
- `js/ui.js` — menus, run lifecycle, pause, skill pick and results
- `js/game.js` — update/draw loop and active skill execution

## Development rule
GitHub is the master source. Chat previews and packaged builds are test/checkpoint artifacts.
