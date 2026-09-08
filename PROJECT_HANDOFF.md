# Auto Battle Roguelite — Project Handoff

Use this file as the starting context when continuing development in a new chat.

## Master source
- GitHub repository: `VGpro9X/auto-battle-roguelite`
- Default branch: `main`
- GitHub is the canonical source. Chat test builds are disposable preview artifacts.
- Before editing any existing file, fetch the current file from GitHub first and use its latest blob SHA.
- Commit/checkpoint frequently after meaningful changes so work is not lost between chats.

## Current baseline
- Current version line: **V0.13 – Combat Readability & Feel**
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
- If the description says a resource keeps accumulating (for example, periodically gaining shield), the implementation must continue accumulating unless the description explicitly states a maximum.
- V0.12 removed the undocumented shield cap of 85% max HP from `addShield()`.
- V0.13 corrected **Săn Ấn** to describe only the implemented extra `25%` base XP from marked targets; do not re-add the old unimplemented “ấn lan ổn định hơn” claim unless that mechanic is actually implemented.

## Current rare rule skills
- **Mua Chuộc — Thần Bí Kỹ:** every few seconds, temporarily converts a hostile enemy into an ally that fights other enemies, then returns to normal if still alive.
- **Đổi Mệnh — Thần Bí Kỹ:** at low HP, can exchange HP ratio with a healthier enemy when beneficial.
- **Bất Tử Nhất Tức — Thần Kỹ:** prevents one lethal hit and grants a short invulnerability window.
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
- A previous standalone V0.12 test build accidentally shipped with the internal validation harness still embedded. That harness programmatically granted rare rule skills during startup and caused Thần Kỹ/Thần Bí Kỹ unlock toasts to appear on the main menu.
- GitHub master itself did not intentionally auto-grant those skills; the issue was in the packaged preview artifact.
- Future standalone/playable builds must **never include executable test harness code**.
- `visual-bridge.js` contains a defensive guard so build-unlock toasts only render while a real run is active.

## Visual-system status
V0.12 established the Codex visual foundation; V0.13 moved that identity into live combat.

Foundation:
- 64/64 base skills have explicit visual profiles.
- 64/64 base skills have distinct Codex scene identifiers.
- Visual scenes are split across `visual-scenes-1.js` to `visual-scenes-4.js`.
- `vfx.js` is the shared low-level VFX layer.
- `visual-bridge.js` connects Codex visuals and gameplay feedback.
- Do not generate static image assets for this phase unless the user explicitly asks. Current direction is code/Canvas/CSS visuals.

### V0.13 completed — Combat Readability & Feel
1. **Common attack identity**
   - Cường Kích: stronger/wider projectile body and power aura.
   - Song Tiễn: fan/chevron mechanic shape.
   - Xuyên Phá: longer lance and penetration marks.
   - Bạo Kích: gold critical treatment and stronger impact.
   - Tâm Nhãn: sharper critical reticle.
   - Element color and mechanic shape remain separate layers.

2. **Hit / damage / kill feedback**
   - Heavy and critical impacts are stronger without flooding the screen with every DOT number.
   - Damage taken, heal, shield gain, dodge, shield break and revive are visually distinct.
   - Death feedback is stronger for elites than ordinary enemies.

3. **Status readability**
   - Burn = compact flame strokes.
   - Poison = compact bubbles/dots.
   - Chill = short ice marks.
   - Mark = corner-reticle treatment.
   - Avoid returning to multiple stacked full rings.

4. **Summon readability**
   - `Linh Hỏa` has a visible orbiting actor and fires from its visible position.
   - `Lôi Linh` has a visible actor and visible lightning arcs to targets.
   - `Ngự Linh` adds summon aura feedback.
   - Integration lives in `js/v013-summon-power-feedback.js`.

5. **Hợp Đạo Kỹ / Siêu Cấp power feedback**
   - Hợp Đạo Kỹ receive two-tone usage signatures where the combined mechanic actually triggers.
   - Direct and passive Hợp Đạo Kỹ are covered; routing was re-audited after initial implementation so base effects do not incorrectly masquerade as synergy effects.
   - Siêu Cấp uses a deliberately larger/stronger signature.
   - Existing evolved visuals such as Kiếm Vực and poison spreading remain in use.

6. **Thần Kỹ / Thần Bí Kỹ feedback**
   - Mua Chuộc shows conversion burst, friendly marker, remaining-duration arc and reversion cue.
   - Bất Tử Nhất Tức shows trigger burst and a 4-second invulnerability countdown arc.
   - Thiên Phạt has stronger target strike presentation.
   - Đổi Mệnh has a two-color exchange tether.
   - Integration lives in `js/v013-rule-feedback.js`.

## V0.13 validation status
Completed:
- New V0.13 integration modules pass JavaScript syntax checks.
- Current `index.html` integration order was re-read from GitHub after the modules were added.
- Hợp Đạo Kỹ source routing was checked against the actual sources emitted by `synergies.js` / `skill-engine.js`.
- Passive Hợp Đạo Kỹ received usage cues where their mechanics trigger.
- Săn Ấn player-facing description was aligned with implemented mechanics.
- V0.8 movement code was not modified.
- Level-up hint behavior was not changed.

Still required before calling V0.13 fully playtested:
- Run an interactive browser playtest across early, mid and dense late-game combat.
- Check visual clutter and FPS/performance under high enemy/projectile counts.
- Confirm the common projectile identities remain distinguishable when elemental/proc effects overlap.
- Exercise every Hợp Đạo Kỹ and all 8 Siêu Cấp at least once in live gameplay.
- Exercise all four rare rule skills, especially Mua Chuộc conversion/reversion and Bất Tử Nhất Tức's full invulnerability window.
- If the new feedback feels too noisy, tune animation frequency/alpha first; do not remove mechanical information blindly.

## Current V0.13 integration files
- `js/visual-bridge.js` — base V0.12 bridge plus V0.13 combat hit/status/projectile feedback
- `js/v013-summon-power-feedback.js` — visible summon actors and Hợp Đạo Kỹ/Siêu Cấp usage signatures
- `js/v013-rule-feedback.js` — rare rule-skill feedback and Mua Chuộc faction-state cues
- `index.html` loads both V0.13 modules after `game.js` and `visual-bridge.js`

## Next development roadmap

### Immediate checkpoint — V0.13 hands-on playtest
Before adding V0.14 presentation work:
- Verify the V0.13 readability pass in the browser.
- Fix any actual runtime regressions found by the playtest.
- Tune noise/performance only from observed gameplay, not assumptions.

### V0.14 — Character & Enemy Presentation
After V0.13 combat readability is stable:
- Replace the plain prototype-circle feeling of player/enemies with cleaner code-drawn silhouettes/shapes.
- Add readable enemy archetypes and elite distinction.
- Improve movement/attack animation cues without changing the V0.8 movement logic.
- Keep the playfield visually clean enough for dense late-game combat.

### Playtest / balance pass
Before massively expanding content:
- Identify skills that feel duplicated despite different names.
- Identify Hợp Đạo Kỹ that are hard to notice or not worth building.
- Check whether Siêu Cấp power spikes feel strong enough.
- Check rare Thần Kỹ/Thần Bí Kỹ frequency and whether they genuinely change a run.
- Check visual clutter/performance with dense enemy counts.

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
12. After V0.13, do not start V0.14 until a hands-on V0.13 playtest has checked runtime behavior and visual density.

## Recommended prompt for a new chat
`Tiếp tục project VGpro9X/auto-battle-roguelite. GitHub main là master source. Đọc README.md và PROJECT_HANDOFF.md trước. Baseline hiện tại là V0.13; hãy playtest/ổn định V0.13 trước, sau đó tiếp tục roadmap V0.14. Fetch file hiện tại trước khi sửa và commit thường xuyên sau mỗi checkpoint.`
