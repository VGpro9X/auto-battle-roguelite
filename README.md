# Auto Battle Roguelite

Current master version: **V0.15 – Responsive & Mobile/Desktop Readability**

A browser-based auto-battle survival roguelite built around unrestricted cross-archetype skill combinations. GitHub `main` is the canonical source and GitHub Pages is the primary public test surface.

Public build:
`https://vgpro9x.github.io/auto-battle-roguelite/`

## Current game modes
- 5 minutes — 3 unique starter skill picks
- 10 minutes — 2 unique starter skill picks
- 15 minutes — 1 starter skill pick
- 20 minutes — 1 starter skill pick
- Vô Hạn — 1 starter skill pick, difficulty scales without a fixed end

V0.16 will change Vô Hạn so every run begins with exactly one random Thần Kỹ or Thần Bí Kỹ before the normal starter choice.

## Current content
- **64 base Kỹ Năng**
- **20 Hợp Đạo Kỹ**
- **8 Siêu Cấp**
- **4 unique rare rule skills**: 2 Thần Kỹ + 2 Thần Bí Kỹ
- **96 Codex entries** total

Current rare rule skills:
- **Mua Chuộc — Thần Bí Kỹ**
- **Đổi Mệnh — Thần Bí Kỹ**
- **Bất Tử Nhất Tức — Thần Kỹ**
- **Thiên Phạt — Thần Kỹ**

Rare rule skills have no levels and the current run rule allows at most one owned Thần Kỹ/Thần Bí Kỹ.

## V0.15 completed — Responsive & Mobile/Desktop Readability
V0.15 was tested by the user on the live GitHub Pages build on a real phone and accepted.

Implemented:
- dedicated responsive layer in `css/v015-responsive.css`
- `viewport-fit=cover`, safe-area support and `dvh` / `svh` sizing
- no intentional horizontal page overflow during gameplay
- mobile HUD keeps HP, XP, mode, level, timer, kills and pause accessible
- mobile skill bar becomes compact horizontal scroll
- **BỘ KỸ NĂNG & LIÊN KẾT** becomes a mobile drawer instead of disappearing
- portrait and landscape layouts are handled separately
- level-up cards stack/scroll safely on narrow portrait screens
- result, pause, settings and how-to screens use viewport-safe scrolling
- leaderboard preserves all fields on mobile through horizontal scrolling instead of hiding data
- responsive Codex flow: catalog → tap skill → detail → `DANH SÁCH KỸ NĂNG`
- Codex remains tap-first on mobile and mouse/keyboard friendly on desktop
- `visualViewport` hooks improve behavior when mobile browser chrome changes size
- `visibilitychange` adds a mobile-friendly auto-pause fallback

V0.15 did **not** change combat balance, skill mechanics or V0.8 movement AI.

Detailed release record: `V015_STATUS.md`.

## Movement AI
- V0.8 Strategic Movement AI remains the locked movement baseline.
- Harvest, kite, committed emergency escape and patrol modes remain intact.
- XP clusters, open-space preference, edge/corner penalties and multi-horizon escape routing remain intact.
- Temporarily bribed allies are ignored by hostile targeting/threat calculations.
- Do not rewrite movement unless explicitly requested.

## Skill-system rules
Core architecture:
`Kỹ Năng → Tags/Triggers/Modifiers → Hợp Đạo Kỹ → Siêu Cấp → Thần Kỹ/Thần Bí Kỹ`

Locked terminology:
- base: **Kỹ Năng**
- synergy: **Hợp Đạo Kỹ**
- evolution: **Siêu Cấp**
- rare rule: **Thần Kỹ / Thần Bí Kỹ**
- max: **TỐI ĐA**

Mechanical truth is mandatory:
- no silent caps
- no hidden cooldowns
- no undocumented stack limits or exceptions
- if a restriction exists in code, it must exist in the Vietnamese player-facing description

Level-up clarity remains locked:
- partial Hợp Đạo/Siêu Cấp progress belongs only in **BỘ KỸ NĂNG & LIÊN KẾT**
- a level-up card shows a relation hint only when that exact choice immediately unlocks the Hợp Đạo Kỹ or Siêu Cấp

## Visual foundation
### V0.12
- 64/64 base skills have explicit visual profiles and Codex scene identities.
- `vfx.js` is the shared low-level VFX layer.

### V0.13
- live combat readability, common projectile identity, hit/crit/status feedback
- visible Linh Hỏa / Lôi Linh actors
- Hợp Đạo Kỹ / Siêu Cấp usage signatures
- dedicated feedback for current Thần Kỹ / Thần Bí Kỹ

### V0.14
- code-drawn player silhouette and attack/movement presentation
- runner / hunter / anchor enemy silhouettes derived from existing speed variance
- elite presentation is visually distinct
- no movement/stat changes

### V0.15
- responsive UI and Codex presentation on phone/tablet/desktop

## V0.16 active target — Skill Expansion & Rare Rule Expansion
Design contract: `V016_SKILL_DESIGN.md`.

Target if all content passes implementation and playtest:
- base Kỹ Năng: **64 → 80** (+16)
- Hợp Đạo Kỹ: **20 → 28** (+8)
- Siêu Cấp: **8 → 12** (+4)
- rare rule skills: **4 → 12** (+8)
  - Thần Kỹ: 2 → 6
  - Thần Bí Kỹ: 2 → 6
- Codex: **96 → 124** entries

The 16 proposed base skills are design-locked around mechanics currently missing from the pool, including:
- visible attack replay / temporary clone
- player-position trap runes
- damage-link between enemies
- healing-charged projectile pearls
- distance-traveled shockwaves
- deterministic anti-fast-enemy binding
- returning projectiles
- telegraphed meteors
- defensive taunt summon
- single-hit ice mirror defense
- no-damage critical state
- hit-counter star strikes
- persistent lightning fields
- kill-charged soul summons
- stacking armor break
- timed periodic-skill acceleration window

The eight new rare designs are also locked:
- Thần Kỹ: **Thiên Mệnh, Phán Quyết, Thiên Hộ, Thần Vực**
- Thần Bí Kỹ: **Hoán Vị, Nghịch Lưu, Đảo Nhân Quả, Đồng Giá**

V0.16 implementation will be committed in small batches; weak/duplicated skills may be cut rather than shipped only to hit a quota.

## Vô Hạn rule planned for V0.16
When a Vô Hạn run begins:
1. uniformly select exactly one rare from the full valid Thần Kỹ/Thần Bí Kỹ pool
2. grant it before the normal starter Kỹ Năng choice
3. show a dedicated reveal screen with icon, tier, name and exact description
4. after acknowledgement, show the existing one starter Kỹ Năng choice
5. the granted rare consumes the run's one rare-rule slot
6. no later rare offer appears in that Vô Hạn run while the one-rare rule remains active

Timed modes keep the existing rare-offer system unless later balance work changes it.

## Project structure
Core:
- `index.html` — shell, menus, HUD, Codex and integration order
- `js/core.js` — shared state and version
- `js/modes.js` — mode rules
- `js/leaderboard.js` — local records/settings
- `js/skills.js` — base skills
- `js/skill-engine.js` — events, periodic scheduler, choices and unlock evaluation
- `js/synergies.js` — Hợp Đạo Kỹ and Siêu Cấp
- `js/divine-skills.js` — Thần Kỹ/Thần Bí Kỹ
- `js/combat.js` — damage/status/projectile/shield/XP systems
- `js/movement.js` — V0.8 movement AI
- `js/ui.js` — menus, HUD choices, build tracker and result flow

Presentation:
- `css/game.css`
- `css/v012.css`
- `css/v015-responsive.css`
- `css/v015-codex.css`
- `js/vfx.js`
- `js/visual-profiles.js`
- `js/visual-scenes-1.js` to `js/visual-scenes-4.js`
- `js/skill-codex.js`
- `js/v014-character-enemy-presentation.js`
- `js/visual-bridge.js`
- `js/v013-summon-power-feedback.js`
- `js/v013-rule-feedback.js`
- `js/v015-responsive.js`

Project continuity:
- `PROJECT_HANDOFF.md` — canonical continuation context
- `ROADMAP.md` — version roadmap
- `V015_STATUS.md` — V0.15 release validation
- `V016_SKILL_DESIGN.md` — V0.16 implementation contract

## Development rule
Before editing an existing file, fetch its current GitHub version and latest blob SHA. Commit after every meaningful checkpoint. GitHub `main` is master source; Pages is the primary playable test surface.
