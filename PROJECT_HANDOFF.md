# Auto Battle Roguelite — Project Handoff

Use this file as the starting context when continuing development in a new chat.

## Master source
- GitHub repository: `VGpro9X/auto-battle-roguelite`
- Default branch: `main`
- GitHub is the canonical source. Chat test builds are disposable preview artifacts.
- Before editing any existing file, fetch the current file from GitHub first and use its latest blob SHA.
- Commit/checkpoint frequently after meaningful changes so work is not lost between chats.

## Current baseline
- Current version line: **V0.14 – Character & Enemy Presentation**
- Movement baseline: **V0.8 Strategic Movement AI**. Do not alter movement unless specifically requested.
- Current skill content:
  - 64 base Kỹ Năng
  - 20 Hợp Đạo Kỹ
  - 8 Siêu Cấp
  - 4 unique rule skills: 2 Thần Kỹ + 2 Thần Bí Kỹ
- Bách Khoa Kỹ Năng contains all current skill tiers and animated previews.
- Player-facing UI should be Vietnamese. Internal engine keys/tags can remain English for code stability.

## Locked terminology
- Base skill: **Kỹ Năng**
- Synergy: **Hợp Đạo Kỹ**
- Evolution: **Siêu Cấp**
- Unique rare rule skill: **Thần Kỹ** or **Thần Bí Kỹ**
- MAX: **TỐI ĐA**

Do not show English system labels such as `SYNERGY`, `EVOLUTION`, `EVOLVE`, `MAX`, or raw English tags in player-facing UI.

## Skill-system design philosophy
The core identity of the game is unrestricted cross-archetype skill building.

Architecture direction:
`Kỹ Năng → Tags/Triggers/Modifiers → Hợp Đạo Kỹ → Siêu Cấp → Thần Kỹ/Thần Bí Kỹ → future advanced rule interactions`

- Hợp Đạo Kỹ connects multiple skills/mechanics and changes how a build interacts.
- Siêu Cấp is a major power spike/evolution of a maxed base skill.
- One ordinary Hợp Đạo Kỹ is generally weaker than one Siêu Cấp, but multiple interacting Hợp Đạo Kỹ can exceed a single Siêu Cấp.
- Thần Kỹ / Thần Bí Kỹ have no levels. They are rare, unique, rule-like effects rather than normal stat upgrades.
- Current design limits rare rule skills to at most one owned Thần Kỹ/Thần Bí Kỹ per run.

### Mechanical truth rule — IMPORTANT
A skill must behave exactly as its player-facing description says.
- Do **not** add silent caps, hidden limits or undocumented exceptions to a skill effect.
- If an effect has a cap/limit/cooldown/maximum stack count, that restriction must be stated in the skill description.
- If the description says a resource keeps accumulating, the implementation must continue accumulating unless the description explicitly states a maximum.
- V0.12 removed the undocumented shield cap of 85% max HP from `addShield()`.
- V0.13 corrected **Săn Ấn** to describe only the implemented extra `25%` base XP from marked targets; do not re-add the old unimplemented mark-spread claim unless that mechanic is actually implemented.

## Current rare rule skills
- **Mua Chuộc — Thần Bí Kỹ:** every 8 seconds, temporarily converts a random hostile into an ally for 5 seconds.
- **Đổi Mệnh — Thần Bí Kỹ:** at low HP, can exchange HP ratio with a healthier enemy when beneficial.
- **Bất Tử Nhất Tức — Thần Kỹ:** prevents one lethal hit and grants a 4-second invulnerability window.
- **Thiên Phạt — Thần Kỹ:** after enough kills, strikes multiple enemies with heavy lightning damage.

## Level-up clarity rule — IMPORTANT
Level-up cards must **not** show partial-progress hints such as:
- `HỖ TRỢ SIÊU CẤP`
- `KẾT HỢP`
- `0/1 → 1/1`
- tag-count contribution text

The left **BỘ KỸ NĂNG & LIÊN KẾT** panel already shows what is still missing.

A level-up card should show a relation hint **only when that exact pick is the final piece and immediately unlocks something**:
- `CHỌN → MỞ HỢP ĐẠO KỸ: <Tên>`
- `CHỌN → ĐẠT SIÊU CẤP: <Tên>`

If the pick only makes progress toward a future combination, show no hint on the card.

Mua Chuộc uses the simpler `🤝` icon and an emoji font fallback to avoid Windows/Chrome rendering issues.

## Standalone-build safety rule
- A previous standalone V0.12 test build accidentally shipped with an executable validation harness that auto-granted rare skills.
- Future playable builds must **never include executable test harness code**.
- Test automation may drive a build externally, but harness logic must not be embedded in the delivered HTML.
- `visual-bridge.js` also guards build-unlock toasts so they only render during a real run.

## Visual-system status
V0.12 established Codex identities, V0.13 moved skill identity into live combat, and V0.14 upgrades the player/enemy actors.

Foundation:
- 64/64 base skills have explicit visual profiles.
- 64/64 base skills have distinct Codex scene identifiers.
- Visual scenes are split across `visual-scenes-1.js` to `visual-scenes-4.js`.
- `vfx.js` is the shared low-level VFX layer.
- Do not generate static image assets for this phase unless the user explicitly asks. Current direction remains code/Canvas/CSS visuals.

### V0.13 completed — Combat Readability & Feel
- Common attack identity for Cường Kích, Song Tiễn, Xuyên Phá, Bạo Kích and Tâm Nhãn.
- Stronger but controlled hit/crit/death feedback.
- Compact burn/poison/chill/mark status visuals.
- Visible Linh Hỏa and Lôi Linh actors; Ngự Linh adds aura feedback.
- Hợp Đạo Kỹ and Siêu Cấp use live usage signatures.
- Mua Chuộc, Đổi Mệnh, Bất Tử Nhất Tức and Thiên Phạt have dedicated combat feedback.
- V0.8 movement was not modified.

### V0.13 playtest status
- User completed a hands-on playtest of the packaged V0.13 build and reported no major issue.
- Before V0.14 implementation, current GitHub source and integration order were re-audited.
- One non-blocking detail remains known: Đổi Mệnh emits two `divine_trigger` events for one successful activation; only the event carrying `enemy` drives the detailed tether, while the second generic event contributes only generic background feedback. Do not change this unless an actual visual problem appears in playtest.

## V0.14 completed — Character & Enemy Presentation
Integration file: `js/v014-character-enemy-presentation.js`

### Player
- Code-drawn directional cloak/body silhouette with hood/head, shoulders and a small weapon arm.
- Facing follows actual movement and temporarily faces the real normal-attack target when an attack fires.
- Movement bob/foot cues are derived from actual movement distance only; they do not alter pathfinding or speed.
- The visible weapon briefly extends on normal attacks.
- Shield and invulnerability states influence presentation palette only.
- Presentation state resets between runs.

### Enemies
- Normal enemies are assigned a presentation archetype from their **existing spawn-speed variance**:
  - `runner` for faster-than-average normal enemies
  - `hunter` for middle-speed enemies
  - `anchor` for slower-than-average normal enemies
- These archetypes are purely visual classifications. They do **not** change HP, damage, speed, radius, collision or AI.
- Enemies face the player and receive small movement bob/contact-lunge cues.
- Bribed allies use the existing green faction treatment and remain compatible with V0.13 Mua Chuộc feedback.

### Elites
- Elite enemies use a larger angular/star-like silhouette, crown/horn stroke and pulsing inner structure.
- Elite combat stats remain exactly as defined by the existing spawn logic.

### Layering
Current order near the end of `index.html` is:
1. `js/game.js`
2. `js/v014-character-enemy-presentation.js`
3. `js/visual-bridge.js`
4. `js/v013-summon-power-feedback.js`
5. `js/v013-rule-feedback.js`

This order is intentional: V0.14 actors render before V0.13 hit/crit/synergy/rule feedback so combat information stays on top.

### V0.14 implementation notes
- A dark inner plate makes the old prototype circle read as a thin underglow rather than the main actor body.
- No static assets were added.
- No changes were made to `js/movement.js`.
- No skill mechanics or level-up hint rules were changed.

## V0.14 validation status
Completed:
- `js/v014-character-enemy-presentation.js` passes `node --check`.
- Initial validation caught an invalid `player.moveSpeed` reference before module activation; corrected to observe the actual `player.speed` value.
- Elite visual seed initialization was fixed before release.
- A headless Chromium runtime test loaded the single-file build with **0 console errors and 0 page errors**.
- Automated UI path: CHƠI → 5 phút → all three starter picks → live run.
- Runner, hunter, anchor and elite render paths were exercised.
- Synthetic dense test pushed the run to 300 enemies and executed 30 `draw()` calls without runtime errors.
- In that headless environment, the dense test averaged about **4.3 ms per draw()**; treat this only as a regression indicator, not a real-device FPS guarantee.

Still required for V0.14 hands-on validation:
- User playtest the V0.14 single-file build in normal browser gameplay.
- Confirm the actor silhouettes remain readable under actual late-game VFX density.
- Confirm the old circle underglow feels intentional rather than visually redundant.
- Confirm contact-lunge/movement animation is helpful rather than distracting.
- Confirm elite enemies are easy to identify instantly.

## Current integration files
- `js/visual-bridge.js` — V0.13 hit/status/projectile feedback
- `js/v013-summon-power-feedback.js` — summon actors and Hợp Đạo Kỹ/Siêu Cấp signatures
- `js/v013-rule-feedback.js` — rare rule-skill feedback
- `js/v014-character-enemy-presentation.js` — V0.14 actor silhouettes and movement/attack presentation

## Next development roadmap

### Immediate checkpoint — V0.14 hands-on playtest
- Test the new character/enemy presentation in early, mid and dense late-game combat.
- Tune silhouette scale, animation amplitude and underglow only from observed gameplay.
- Do not change V0.8 movement during this pass.

### Playtest / balance pass
Before massively expanding content:
- Identify base skills that feel duplicated despite different names.
- Identify Hợp Đạo Kỹ that are hard to notice or not worth building.
- Check whether Siêu Cấp power spikes feel strong enough.
- Check rare Thần Kỹ/Thần Bí Kỹ frequency and whether they genuinely change a run.
- Re-check visual clutter/performance with dense enemy/projectile counts.

### Later content expansion
Only after the visual/combat feedback loop is understandable:
- Expand base skill pool from 64 toward 80, then 100+.
- Expand Hợp Đạo Kỹ and Siêu Cấp alongside new base skills.
- Add more rule-like Thần Kỹ and stranger Thần Bí Kỹ.
- Consider an advanced/super synergy layer for rare high-requirement interactions between Siêu Cấp + Hợp Đạo Kỹ.

## Development rules for future chats
1. Read `README.md` and this `PROJECT_HANDOFF.md` first.
2. Fetch current relevant GitHub files before modifying them.
3. GitHub `main` is master source; never reconstruct from stale chat snippets when GitHub is available.
4. Commit after each meaningful checkpoint rather than waiting until a large batch is complete.
5. Self-test syntax and core logic before giving the user a playable build.
6. For user testing, package a new single-file HTML preview in `/mnt/data/` with a fresh filename and **strip all executable test harnesses from the playable artifact**.
7. Do not change movement AI unless explicitly requested.
8. Do not add partial synergy/evolution hints back to level-up cards.
9. Keep player-facing terminology Vietnamese and consistent.
10. Favor readable gameplay feedback over decorative complexity.
11. Do not implement silent skill caps. Any intentional limit must be stated in the player-facing description.
12. After V0.14, run a hands-on presentation playtest before expanding content aggressively.

## Recommended prompt for a new chat
`Tiếp tục project VGpro9X/auto-battle-roguelite. GitHub main là master source. Đọc README.md và PROJECT_HANDOFF.md trước. Baseline hiện tại là V0.14; hãy playtest/ổn định V0.14 rồi tiếp tục playtest/balance pass. Fetch file hiện tại trước khi sửa và commit thường xuyên sau mỗi checkpoint.`
