# Auto Battle Roguelite

Current master version: **V0.10 – Synergy Clarity & Pool Expansion**

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

## V0.10 skill system
- **64 base skills** with no class restriction
- **20 automatic synergies**
- **8 evolutions**
- Tags span attack, projectile, crit, fire, ice, lightning, poison, blood, summon, shield, XP, mark, soul, time, random, risk, kill, hit, area, chain, control and more
- Shared event bus for attack, hit, kill, damage taken, heal, dodge, shield break, revive, XP collection, level up and periodic triggers
- Shared periodic scheduler for timed skills
- Build-aware random level-up choices
- MAX skills and evolved bases are explicitly excluded from the level-up pool
- UI guard also blocks forced selection of MAX/evolved skills

## Build clarity
- Level-up cards show skill tags
- Cards can show `MỞ SYNERGY`, `KẾT HỢP` and `HỖ TRỢ EVOLVE` hints
- A persistent `BUILD SYNERGY` tracker shows unlocked synergies/evolutions and near-complete recipes
- Synergy/evolution unlocks use queued on-screen banners so simultaneous unlocks are not lost
- Skill bar labels skills as MAX or EVOLVED

## Expanded V0.10 mechanics
New archetypes include critical-damage specialization, elite hunting, on-hit lifesteal, kill-to-shield, chilled-target amplification, shatter explosions, poison-to-lightning conduction, burning-corpse explosions, attack echoes, point-blank scaling, area mastery, summon mastery, elemental mastery, spreading marks, shield-break nova, XP healing, level-up nova, sacrificial periodic blasts, marked-target bonus XP, projectile velocity/range scaling, gravity wells, chain mastery, random lucky effects and limited revives.

## Synergy set
Existing V0.9 synergies remain, plus:
- Hàn Sát — Frostbite + Execution
- Huyết Thành — Blood Shield + Barrier
- Lôi Độc — Conductive Venom + Lightning
- Liên Hoàn Hỏa Táng — Combustion + Corpse Burst
- Vạn Ảnh Tiễn — Echo Shot + Multishot
- Huyết Kính — Glass Cannon + Vampiric Touch
- Trọng Lực Bạo — Black Hole + Nova
- Săn Ấn — Death Mark + Bounty Mark
- Ngũ Hành Hỗn Mang — Chaos Orb + Elemental Mastery
- Hồn Thuẫn — Soul Harvest + Blood Shield
- Bạo Lôi — Crit + Lightning
- Hồi Quang — Last Stand + Second Wind

## Evolutions
Existing evolutions remain, plus:
- Huyết Nguyệt — Blood
- Kỳ Điểm — Black Hole
- Hỗn Mang Vương Miện — Chaos Orb
- Bất Diệt Thuẫn — Barrier

## Validation performed for V0.10
- JavaScript syntax checks for all modified modules
- Definition validation: every synergy references existing skills and every evolution requirement is reachable
- 500 repeated rolls verify MAX/evolved Fire never returns to level-up choices
- 250 randomized build states verify no invalid MAX/evolved choice is returned
- Direct UI guard test verifies forced selection cannot level a MAX skill
- Every one of the 20 synergies is programmatically unlocked from its declared requirements
- Every one of the 8 evolutions is programmatically unlocked and its base is then excluded from choices
- Representative mechanic tests cover lifesteal, kill-to-shield, marked XP bonus, echo multishot and revival
- Dense combat smoke test runs multiple new mechanics and synergies together

## Project structure
- `index.html` — game shell and build-feedback UI
- `css/game.css` — prototype visuals, synergy tracker, unlock banners and level-up hints
- `js/core.js` — shared state and player build stats
- `js/modes.js` — mode rules and difficulty curves
- `js/leaderboard.js` — local records/settings
- `js/skills.js` — 64 base skill definitions and tags
- `js/skill-engine.js` — event bus, periodic scheduler, choice rules, requirement progress and unlock evaluation
- `js/synergies.js` — 20 synergy definitions and 8 evolution definitions/hooks
- `js/combat.js` — damage, statuses, projectiles, shields, revival and XP drops
- `js/movement.js` — V0.8 strategic/tactical movement AI
- `js/ui.js` — menus, level-up choices, build tracker and unlock banners
- `js/game.js` — main update/draw loop

## Development rule
GitHub is the master source. Chat previews and packaged builds are test/checkpoint artifacts.
