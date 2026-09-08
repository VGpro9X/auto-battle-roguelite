# Auto Battle Roguelite

ChatGPT-assisted web-game prototype.

## Current canonical version

**V0.3**

## Current gameplay

- Character moves and attacks automatically.
- Enemies spawn continuously and scale over time.
- Early XP curve is reduced so the first levels arrive quickly.
- Level-up offers 3 random skills.
- Current skills include attack speed, damage, HP, movement speed, timed fireball, knockback, orbit swords, regeneration, armor, and XP magnet.
- Movement AI evaluates multiple escape directions instead of only reacting to the nearest enemy.
- Movement AI actively seeks nearby XP when it is reasonably safe.
- Restart performs an in-game reset rather than relying on page reload.

## Project structure

- `index.html` — page shell and game UI
- `css/game.css` — visual styling
- `js/core.js` — canvas, helpers, game state, player defaults, XP curve
- `js/skills.js` — skill definitions and owned-skill state
- `js/combat.js` — enemies, targeting, projectiles, damage, XP gain
- `js/movement.js` — auto-movement and XP-seeking AI
- `js/ui.js` — level-up UI, HUD, restart/reset
- `js/game.js` — main update loop and rendering

## Development rule

GitHub should be treated as the master source once this repository is created. Chat versions are checkpoints and discussion history.
