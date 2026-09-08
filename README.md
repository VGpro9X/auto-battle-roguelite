# Auto Battle Roguelite

Current master version: **V0.12 – Skill Visual Identity, Rare Rule Skills & Vietnamese UI**

A browser-based auto-battle survival roguelite prototype built around unrestricted cross-archetype skill combinations.

## Current game modes
- 5 minutes — 3 unique starter skill picks
- 10 minutes — 2 unique starter skill picks
- 15 minutes — 1 starter skill pick
- 20 minutes — 1 starter skill pick
- Vô Hạn — 1 starter skill pick, difficulty scales without a fixed end

## Movement AI
- V0.8 strategic zone planning + tactical context steering remains the movement baseline
- Harvest, kite, committed emergency escape and patrol modes
- XP clusters, open-space preference, edge/corner penalties and multi-horizon escape routing
- Temporarily bribed allies are ignored by hostile targeting and movement threat calculations

## Skill system
- **64 base skills** with no class restriction
- **20 automatic Hợp Đạo Kỹ**
- **8 Siêu Cấp evolutions**
- **4 unique rare rule skills** split between Thần Kỹ and Thần Bí Kỹ
- Shared event bus and periodic scheduler
- Build-aware random level-up choices
- TỐI ĐA skills and evolved bases are excluded from the level-up pool
- Level-up cards stay quiet unless the offered skill is the final piece that immediately opens a Hợp Đạo Kỹ or Siêu Cấp
- Detailed missing requirements remain in the left-side BỘ KỸ NĂNG & LIÊN KẾT tracker instead of being duplicated on choice cards

## V0.12 rare rule skills
Rare rule skills can begin appearing from level 8, replace one normal level-up card when rolled, have no levels, and are limited to one owned rare rule skill per run.

Current set:
- **Mua Chuộc — Thần Bí Kỹ:** periodically converts a random hostile into a temporary ally that fights other enemies
- **Đổi Mệnh — Thần Bí Kỹ:** at low HP, can exchange HP ratios with a healthier enemy when beneficial
- **Bất Tử Nhất Tức — Thần Kỹ:** prevents one lethal hit per run, holds the player at 1 HP and grants a short invulnerability window
- **Thiên Phạt — Thần Kỹ:** after enough kills, calls down heavy lightning damage on multiple enemies

## V0.12 visual identity
- Every one of the **64 base skills has an explicit visual profile**
- Every base skill has its own scene signature in the Bách Khoa Kỹ Năng
- Visual identities are split into four scene modules to keep edits manageable
- Rare rule skills have dedicated animated Codex previews
- Gameplay projectile visuals can react to source skill and build state
- Unique rule-skill triggers have additional in-run feedback
- `js/vfx.js` remains the shared low-level rendering layer for Codex and gameplay

## Vietnamese presentation layer
- Internal engine tags remain stable in English for code safety
- Player-facing tags are translated through `js/localization.js`
- Player-facing system terms use Vietnamese consistently: **Hợp Đạo Kỹ, Siêu Cấp, Tối Đa, Thần Kỹ, Thần Bí Kỹ, Kỹ năng khởi đầu, Lên cấp**
- Main menus, HUD labels, mode names, leaderboard headers, build tracker, level-up cards and Codex presentation are localized
- Mua Chuộc uses a simple cross-platform handshake emoji and a separate emoji font fallback to avoid mixed-font rendering issues

## Bách Khoa Kỹ Năng
- Main menu includes **KỸ NĂNG**
- Default priority order is **Thần Bí Kỹ → Thần Kỹ → Hợp Đạo Kỹ → Siêu Cấp → base-skill groups**
- Hover, keyboard focus or click updates the detail panel
- Only visible mini-previews animate
- Detail view shows descriptions, translated tags, requirements and related combinations
- Codex currently covers **96 entries total**: 64 base skills + 20 Hợp Đạo Kỹ + 8 Siêu Cấp + 4 rare rule skills

## Validation performed for V0.12
- JavaScript syntax checks for V0.12 integration modules
- Definition test confirms 64 base skills, 20 Hợp Đạo Kỹ, 8 Siêu Cấp and 4 rare rule skills
- All 64 base skills have explicit visual profiles and unique visual scene identifiers
- Every tag currently used by the 64 skills has a Vietnamese display label
- All 96 Codex previews render in the integration harness without throwing
- Codex priority order is validated
- Rare rule-skill offer and one-per-run ownership rules are validated
- Mua Chuộc ally combat and hostile-target filtering are validated
- Bất Tử Nhất Tức lethal prevention and invulnerability are validated
- TỐI ĐA base-skill exclusion remains validated
- Level-up relation hints are restricted to immediate final-piece Hợp Đạo Kỹ / Siêu Cấp unlocks

## Project structure
- `index.html` — game shell, menus and Bách Khoa Kỹ Năng screen
- `css/game.css` — gameplay UI and Codex base styling
- `css/v012.css` — Thần Kỹ/Thần Bí Kỹ visual accents and level-up clarity overrides
- `js/core.js` — shared state, version and player build stats
- `js/modes.js` — mode rules and difficulty curves
- `js/leaderboard.js` — local records/settings
- `js/skills.js` — 64 base skill definitions and tags
- `js/skill-engine.js` — event bus, periodic scheduler, choice rules and unlock evaluation
- `js/synergies.js` — 20 Hợp Đạo Kỹ and 8 Siêu Cấp definitions/hooks
- `js/divine-skills.js` — rare Thần Kỹ/Thần Bí Kỹ rules and integrations
- `js/localization.js` — Vietnamese display labels for internal tags and system terms
- `js/combat.js` — damage, statuses, projectiles, shields, revival and XP drops
- `js/movement.js` — V0.8 strategic/tactical movement AI
- `js/vfx.js` — shared low-level VFX primitives
- `js/visual-profiles.js` — 64 explicit skill visual identities and palettes
- `js/visual-scenes-1.js` — core attack and elemental scenes
- `js/visual-scenes-2.js` — blood, defense and risk scenes
- `js/visual-scenes-3.js` — marks, summons and advanced-effect scenes
- `js/visual-scenes-4.js` — mastery, growth and control scenes
- `js/skill-codex.js` — catalog grouping, rare tiers, interaction, details and animated previews
- `js/ui.js` — menus, level-up choices, build tracker, localization and unlock banners
- `js/evolution-hint-fix.js` — final-piece-only level-up hint logic and detailed left-side progress tracker
- `js/game.js` — main update/draw loop and gameplay integration
- `js/visual-bridge.js` — V0.12 bridge between Codex visuals, gameplay visuals and rare-rule feedback

## Development rule
GitHub is the master source. Chat previews and packaged builds are test/checkpoint artifacts.
