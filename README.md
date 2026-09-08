# Auto Battle Roguelite

Current master version: **V0.13 – Combat Readability & Feel**

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
- V0.13 does not change the V0.8 movement logic

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

## Rare rule skills
Rare rule skills can begin appearing from level 8, replace one normal level-up card when rolled, have no levels, and are limited to one owned rare rule skill per run.

Current set:
- **Mua Chuộc — Thần Bí Kỹ:** periodically converts a random hostile into a temporary ally that fights other enemies
- **Đổi Mệnh — Thần Bí Kỹ:** at low HP, can exchange HP ratios with a healthier enemy when beneficial
- **Bất Tử Nhất Tức — Thần Kỹ:** prevents one lethal hit per run, holds the player at 1 HP and grants a short invulnerability window
- **Thiên Phạt — Thần Kỹ:** after enough kills, calls down heavy lightning damage on multiple enemies

## V0.13 combat readability
V0.13 moves visual identity from Codex-only presentation into the actual combat loop.

### Common attack identity
- **Cường Kích:** stronger/wider projectile body plus a power aura
- **Song Tiễn:** fan/chevron projectile identity reinforces the multishot mechanic
- **Xuyên Phá:** longer lance shape and trailing cut marks communicate penetration
- **Bạo Kích:** gold critical ring and stronger impact language
- **Tâm Nhãn:** adds a sharper critical reticle around critical projectiles
- Element color and mechanic shape remain separate layers so elemental effects do not erase projectile identity

### Hit, damage and status feedback
- Heavy hits and critical hits use stronger impact bursts without showing a number for every small damage tick
- Damage taken, healing, shield gain, dodge, shield break and revival have distinct player feedback
- Enemy deaths use a short burst; elite deaths are deliberately stronger
- Burn, poison, chill and mark now use compact mechanic-specific marks instead of stacking full circular rings
- Shield remains a player-centered defensive visual and can continue accumulating without an undocumented cap

### Summons
- **Linh Hỏa** now has a visible orbiting summon actor and fires from that visible actor
- **Lôi Linh** now has a visible summon actor and visible lightning arcs from the summon to its targets
- **Ngự Linh** adds an additional summon aura so summon investment is visible

### Hợp Đạo Kỹ and Siêu Cấp
- Hợp Đạo Kỹ usage receives a two-tone mechanic signature at the point where the combined effect actually happens
- Direct and passive Hợp Đạo Kỹ are both covered, including effects triggered by hits, healing, periodic echoes, marked kills and soul/shield interactions
- Siêu Cấp uses a larger and stronger visual signature than ordinary Hợp Đạo Kỹ
- Existing Siêu Cấp-specific visuals such as Kiếm Vực and Dịch Triều remain active alongside the V0.13 feedback layer

### Thần Kỹ / Thần Bí Kỹ
- **Mua Chuộc:** conversion burst, friendly marker, remaining-duration arc and reversion cue make faction state readable without text
- **Bất Tử Nhất Tức:** lethal prevention now has a strong trigger burst plus a visible invulnerability countdown arc
- **Thiên Phạt:** affected targets receive a stronger lightning strike presentation
- **Đổi Mệnh:** the player and target are connected by a two-color exchange tether when the rule triggers

## Visual identity foundation from V0.12
- Every one of the **64 base skills has an explicit visual profile**
- Every base skill has its own scene signature in the Bách Khoa Kỹ Năng
- Visual identities are split into four scene modules to keep edits manageable
- Rare rule skills have dedicated animated Codex previews
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

## Validation status for V0.13
- The two new V0.13 integration modules pass JavaScript syntax checks
- Current `index.html` script order was re-read from GitHub after integration
- Hợp Đạo Kỹ source/signature routing was re-audited so base skills do not incorrectly display a synergy signature
- Passive Hợp Đạo Kỹ received explicit usage cues where their mechanics trigger
- The pre-existing Săn Ấn description was corrected to match its implemented +25% base-XP effect rather than claiming an unimplemented mark-spread bonus
- V0.12 definition/Codex/rule-skill validation remains the inherited content baseline
- **An interactive browser playtest has not yet been completed for this V0.13 checkpoint.** Dense-combat readability and performance still need hands-on playtesting before balance/content expansion

## Project structure
- `index.html` — game shell, menus, Bách Khoa Kỹ Năng screen and V0.13 integration order
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
- `js/visual-bridge.js` — shared gameplay/Codex visual bridge plus V0.13 hit/status/projectile feedback
- `js/v013-summon-power-feedback.js` — summon actors plus Hợp Đạo Kỹ/Siêu Cấp usage signatures
- `js/v013-rule-feedback.js` — Thần Kỹ/Thần Bí Kỹ combat feedback and Mua Chuộc faction-state cues

## Next development target
**V0.14 — Character & Enemy Presentation**, after a hands-on V0.13 playtest confirms combat readability and performance are acceptable.

## Development rule
GitHub is the master source. Chat previews and packaged builds are test/checkpoint artifacts.
