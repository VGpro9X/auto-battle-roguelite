# Auto Battle Roguelite

Current master version: **V0.14 – Character & Enemy Presentation**

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
- V0.14 does **not** change V0.8 movement logic; presentation only observes the resulting motion

## Skill system
- **64 base Kỹ Năng** with no class restriction
- **20 automatic Hợp Đạo Kỹ**
- **8 Siêu Cấp**
- **4 unique rare rule skills**: 2 Thần Kỹ + 2 Thần Bí Kỹ
- Shared event bus and periodic scheduler
- Build-aware random level-up choices
- TỐI ĐA skills and evolved bases are excluded from the level-up pool
- Level-up cards only show a relation hint when the exact offered pick immediately opens a Hợp Đạo Kỹ or Siêu Cấp
- Partial progress remains in the left-side **BỘ KỸ NĂNG & LIÊN KẾT** tracker

## Rare rule skills
Rare rule skills can begin appearing from level 8, replace one normal level-up card when rolled, have no levels, and are limited to one owned rare rule skill per run.

Current set:
- **Mua Chuộc — Thần Bí Kỹ:** periodically converts a random hostile into a temporary ally that fights other enemies
- **Đổi Mệnh — Thần Bí Kỹ:** at low HP, can exchange HP ratios with a healthier enemy when beneficial
- **Bất Tử Nhất Tức — Thần Kỹ:** prevents one lethal hit per run, holds the player at 1 HP and grants a short invulnerability window
- **Thiên Phạt — Thần Kỹ:** after enough kills, calls down heavy lightning damage on multiple enemies

## V0.14 character & enemy presentation
V0.14 replaces the plain prototype-circle feeling with code-drawn Canvas presentation while leaving gameplay movement and combat values unchanged.

### Player presentation
- Directional cloak/body silhouette with a readable head/hood and shoulder structure
- Facing follows actual movement, but briefly turns toward the real attack target when a normal attack fires
- Movement uses a small bob/alternating foot cue derived from actual movement distance
- Normal attacks briefly extend the visible weapon arm
- Shield and Bất Tử Nhất Tức states affect the actor palette without changing their mechanics
- Presentation state is reset cleanly between runs

### Enemy presentation
- Normal enemies are visually grouped into three presentation archetypes based on their **existing spawn-speed variance**:
  - fast enemies use a narrow runner silhouette
  - middle-speed enemies use a hunter silhouette
  - slower enemies use a broader anchor silhouette
- These classifications do not modify HP, damage, speed or AI; they only make already-existing speed variation easier to read
- Enemies face the player and use a small movement bob plus a short contact-lunge cue near collision range
- Temporarily bribed enemies retain a green allied palette and remain compatible with V0.13 Mua Chuộc markers

### Elite distinction
- Elite enemies use a larger angular/star-like body, crown/horn line and pulsing inner structure
- Elite color treatment stays separate from normal red enemies and allied green enemies
- Existing elite HP, speed, damage and death feedback remain unchanged

### Layering / readability
- V0.14 loads immediately after `game.js` and before the V0.13 combat-feedback bridge
- Hit, crit, damage numbers, Hợp Đạo Kỹ/Siêu Cấp signatures and Thần Kỹ/Thần Bí Kỹ feedback therefore remain visually above the new actors
- A dark inner plate turns the old prototype circle into a thin intentional underglow rather than the main character body
- No static image assets were introduced; presentation remains code/Canvas based

## V0.13 combat readability foundation
V0.13 moved skill identity into the actual combat loop.

### Common attack identity
- **Cường Kích:** stronger/wider projectile body plus power aura
- **Song Tiễn:** fan/chevron projectile identity
- **Xuyên Phá:** longer lance shape and trailing penetration cuts
- **Bạo Kích:** gold critical treatment and stronger impact
- **Tâm Nhãn:** sharper critical reticle on critical projectiles

### Hit, status, summon and power feedback
- Heavy/critical impacts are stronger without showing every small DOT number
- Damage taken, healing, shield gain, dodge, shield break and revival are visually distinct
- Burn, poison, chill and mark use compact mechanic-specific marks
- **Linh Hỏa** and **Lôi Linh** have visible summon actors; **Ngự Linh** adds summon aura feedback
- Hợp Đạo Kỹ use two-tone usage signatures where their combined mechanics actually trigger
- Siêu Cấp uses larger/stronger signatures than ordinary Hợp Đạo Kỹ
- Mua Chuộc, Đổi Mệnh, Bất Tử Nhất Tức and Thiên Phạt have dedicated live-combat rule feedback

## Visual identity foundation from V0.12
- Every one of the **64 base skills has an explicit visual profile**
- Every base skill has its own scene signature in the Bách Khoa Kỹ Năng
- Visual scenes are split across four modules
- Rare rule skills have dedicated animated Codex previews
- `js/vfx.js` remains the shared low-level rendering layer

## Vietnamese presentation layer
- Internal engine tags remain stable in English for code safety
- Player-facing tags are translated through `js/localization.js`
- Player-facing system terms use Vietnamese consistently: **Hợp Đạo Kỹ, Siêu Cấp, TỐI ĐA, Thần Kỹ, Thần Bí Kỹ, Kỹ năng khởi đầu, Lên cấp**
- Main menus, HUD labels, mode names, leaderboard headers, build tracker, level-up cards and Codex presentation are localized

## Bách Khoa Kỹ Năng
- Main menu includes **KỸ NĂNG**
- Default priority order is **Thần Bí Kỹ → Thần Kỹ → Hợp Đạo Kỹ → Siêu Cấp → base-skill groups**
- Hover, keyboard focus or click updates the detail panel
- Only visible mini-previews animate
- Codex currently covers **96 entries total**: 64 base skills + 20 Hợp Đạo Kỹ + 8 Siêu Cấp + 4 rare rule skills

## Validation status
### V0.13
- User completed a hands-on browser playtest and reported no major issue before V0.14 work began
- Source routing and script order were re-audited before starting V0.14
- Săn Ấn remains aligned with its implemented +25% base-XP effect

### V0.14
- `js/v014-character-enemy-presentation.js` passes JavaScript syntax validation
- Initial validation caught and fixed an invalid `player.moveSpeed` reference before the module was enabled; animation now observes the real `player.speed`
- Elite presentation seed initialization was also fixed before release
- Headless Chromium runtime test completed with **0 console errors and 0 page errors**
- Test navigated through CHƠI → 5 phút → all 3 starter choices and entered a live run successfully
- Runner, hunter, anchor and elite render paths were all exercised
- Dense synthetic presentation check with 300 enemies completed without runtime error; 30 `draw()` calls averaged roughly **4.3 ms per draw** in that headless environment
- V0.8 movement code was not modified
- Level-up hint rules and skill mechanics were not modified

## Project structure
- `index.html` — game shell, menus, Codex and visual integration order
- `css/game.css` — gameplay UI and Codex base styling
- `css/v012.css` — rare-tier accents and level-up clarity overrides
- `js/core.js` — shared state, version and player build stats
- `js/modes.js` — mode rules and difficulty curves
- `js/leaderboard.js` — local records/settings
- `js/skills.js` — 64 base skill definitions and tags
- `js/skill-engine.js` — event bus, periodic scheduler, choice rules and unlock evaluation
- `js/synergies.js` — 20 Hợp Đạo Kỹ and 8 Siêu Cấp definitions/hooks
- `js/divine-skills.js` — Thần Kỹ/Thần Bí Kỹ rules and integrations
- `js/localization.js` — Vietnamese display labels
- `js/combat.js` — damage, statuses, projectiles, shields, revival and XP drops
- `js/movement.js` — V0.8 strategic/tactical movement AI
- `js/vfx.js` — shared low-level VFX primitives
- `js/visual-profiles.js` — 64 skill visual identities and palettes
- `js/visual-scenes-1.js` to `js/visual-scenes-4.js` — Codex animation scenes
- `js/skill-codex.js` — catalog grouping, interaction, details and animated previews
- `js/ui.js` — menus, level-up choices, build tracker and unlock banners
- `js/evolution-hint-fix.js` — final-piece-only level-up hint logic
- `js/game.js` — main update/draw loop
- `js/v014-character-enemy-presentation.js` — V0.14 player/enemy silhouettes plus movement/attack presentation
- `js/visual-bridge.js` — V0.13 combat hit/status/projectile feedback
- `js/v013-summon-power-feedback.js` — summon actors plus Hợp Đạo Kỹ/Siêu Cấp usage signatures
- `js/v013-rule-feedback.js` — Thần Kỹ/Thần Bí Kỹ combat feedback

## Next development target
**Playtest / balance pass** before major content expansion:
- evaluate whether the new V0.14 silhouettes remain readable in real dense combat
- identify duplicated-feeling base skills
- identify Hợp Đạo Kỹ that are hard to notice or not worth building
- check whether Siêu Cấp power spikes feel strong enough
- check rare Thần Kỹ/Thần Bí Kỹ frequency and run impact
- tune visual clutter/performance from observed gameplay

After that, expand the base skill pool toward 80 and then 100+ while adding matching Hợp Đạo Kỹ, Siêu Cấp and additional rule-like rare skills.

## Development rule
GitHub `main` is the master source. Chat previews and packaged builds are test/checkpoint artifacts.
