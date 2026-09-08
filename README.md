# Auto Battle Roguelite

Current master version: **V0.9 – Skill Engine Foundation**

A browser-based auto-battle survival roguelite prototype.

## Current game modes
- 5 minutes — 3 unique starter skill picks
- 10 minutes — 2 unique starter skill picks
- 15 minutes — 1 starter skill pick
- 20 minutes — 1 starter skill pick
- Endless — 1 starter skill pick, difficulty scales without a fixed end

Timed modes end in Victory when the countdown reaches zero. Endless ends on death and records survival time.

## Movement AI
- Two-layer autonomous movement: strategic zone planning + tactical context steering
- Strategic modes: harvest XP, kite, emergency escape and patrol
- Stable patrol fallback for low-pressure moments
- XP evaluated as spatial clusters
- Strong center/open-space preference with explicit corner/edge penalties
- Multi-horizon committed emergency escape routing from V0.8 remains unchanged in V0.9

## V0.9 skill architecture
- 40 base skills across attack, projectile, fire, ice, lightning, poison, blood, summon, defense, movement, XP, time, mark, soul, random and rule-changing archetypes
- Skills can have multiple tags; there is no class restriction
- Event bus for `attack`, `hit`, `kill`, `damage_taken`, `heal`, `xp_collected`, `level_up`, `periodic` and future triggers
- Periodic skills use a shared scheduler instead of hard-coded game-loop blocks
- Level-up offers are still random but become build-aware: upgrades, new skills and synergy-weighted candidates are mixed when possible
- 8 automatic synergies in the first synergy set
- 4 first evolutions with max-level + tag requirements
- Risk/reward rule-changing skills such as Glass Cannon, Greed and Overclock
- Status engine for poison, burn, chill and marks
- Shield, dodge, ricochet, chain, AoE, on-kill, on-damage-taken, heal-trigger and XP-charge mechanics

## First synergies
- Thermal Shock — Fire + Frost
- Blood Conductor — Blood + Lightning
- Arc Collector — Magnet + Lightning
- Explosive Blades — Orbit + Explosive
- Toxic Flame — Poison + Burn
- Storm Volley — Multishot + Lightning
- Soul Furnace — Soul Harvest + Blood
- Time Loop — Time Echo + Overclock

## First evolutions
- Heavenfire — max Fireball + Fire/Explosion tag requirements
- Storm Network — max Lightning + Lightning/Chain tag requirements
- Sword Domain — max Orbit + Summon tag requirements
- Plague Tide — max Poison + DOT/Kill tag requirements

## Project structure
- `index.html` — screens and game shell
- `css/game.css` — interface and prototype visuals
- `js/core.js` — canvas, shared state and player base/build stats
- `js/modes.js` — game mode rules, starter picks and difficulty curves
- `js/leaderboard.js` — local records and settings persistence
- `js/skills.js` — base skill definitions, tags and periodic effect declarations
- `js/skill-engine.js` — event bus, shared periodic scheduler, choice weighting and build unlock evaluation
- `js/synergies.js` — synergy and evolution definitions/hooks
- `js/combat.js` — enemies, projectiles, damage, statuses and combat events
- `js/movement.js` — strategic movement planner, patrol, kite and committed emergency escape routing
- `js/ui.js` — menus, run lifecycle, skill pick, synergy display and results
- `js/game.js` — main update/draw loop and runtime integration

## Development rule
GitHub is the master source. Chat previews and packaged builds are test/checkpoint artifacts.
