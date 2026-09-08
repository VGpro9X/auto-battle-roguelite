# Auto Battle Roguelite — Project Handoff

Use this file as the starting context when continuing development in a new chat.

## Master source
- GitHub repository: `VGpro9X/auto-battle-roguelite`
- Default branch: `main`
- GitHub is the canonical source. Chat test builds are disposable preview artifacts.
- Before editing any existing file, fetch the current file from GitHub first and use its latest blob SHA.
- Commit/checkpoint frequently after meaningful changes so work is not lost between chats.

## Current baseline
- Current version line: **V0.12**
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
- Final V0.12 hotfix removed the undocumented shield cap of 85% max HP from `addShield()`.

## Current rare rule skills
- **Mua Chuộc — Thần Bí Kỹ:** every few seconds, temporarily converts a hostile enemy into an ally that fights other enemies, then returns to normal if still alive.
- **Đổi Mệnh — Thần Bí Kỹ:** at low HP, can exchange HP ratio with a healthier enemy when beneficial.
- **Bất Tử Nhất Tức — Thần Kỹ:** prevents one lethal hit and grants a short invulnerability window.
- **Thiên Phạt — Thần Kỹ:** after enough kills, strikes multiple enemies with heavy lightning damage.

## Latest UI clarity rule — IMPORTANT
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

Latest hotfix also changed Mua Chuộc's icon to the simpler `🤝` and added an emoji font fallback to avoid Windows/Chrome rendering issues.

## Final V0.12 stability hotfix
- A previous standalone test build accidentally shipped with the internal validation harness still embedded. That harness programmatically granted rare rule skills during startup and caused Thần Kỹ/Thần Bí Kỹ unlock toasts to appear on the main menu.
- GitHub master itself did not intentionally auto-grant those skills; the issue was in the packaged preview artifact.
- Future standalone/playable builds must **never include executable test harness code**.
- `visual-bridge.js` now adds a defensive guard so build-unlock toasts only render while a real run is active.
- `combat.js` now allows shield to accumulate without the old undocumented 85%-of-max-HP cap.

## Visual-system status
V0.12 established the visual foundation:
- 64/64 base skills have explicit visual profiles.
- 64/64 base skills have distinct Codex scene identifiers.
- Visual scenes are split across `visual-scenes-1.js` to `visual-scenes-4.js`.
- `vfx.js` is the shared low-level VFX layer.
- `visual-bridge.js` connects Codex visuals, gameplay visuals and rare-rule feedback.
- Codex and gameplay should share the same visual primitives whenever possible.
- Do not generate static image assets for this phase unless the user explicitly asks. Current direction is code/Canvas/CSS visuals.

## Next development roadmap

### V0.13 — Combat Readability & Feel
Priority: make gameplay effects as readable and distinctive in the actual run as they are intended to be in the Codex.

1. **Skill-in-combat visual identity pass**
   - Ensure common skills such as Cường Kích, Song Tiễn, Xuyên Phá, Bạo Kích, Tâm Nhãn visibly behave differently in gameplay, not only in Codex previews.
   - Preserve element color + mechanic identity as two separate layers.

2. **Hit / damage / kill feedback**
   - Stronger impact feedback for heavy hits.
   - Clearer critical-hit feedback.
   - Distinct damage, heal, shield and status feedback.
   - Better death feedback without excessive screen noise.

3. **Status readability**
   - Burn, poison, chill/freeze, mark, shield and other important states should be recognizable at a glance.
   - Avoid stacking so many rings/icons that enemies become unreadable.

4. **Summon readability**
   - Summoned entities should look and move like separate gameplay actors.
   - Hợp Đạo Kỹ affecting summons should be visibly noticeable.

5. **Hợp Đạo Kỹ / Siêu Cấp power feedback**
   - Unlocking and using a Hợp Đạo Kỹ should visibly alter the relevant mechanic.
   - Siêu Cấp should have a clearly larger visual and gameplay power spike than an ordinary Hợp Đạo Kỹ.

6. **Thần Kỹ / Thần Bí Kỹ feedback**
   - Rule-changing effects should be unmistakable when they trigger.
   - Mua Chuộc in particular should make faction change, ally duration and reversion obvious without needing text.

### V0.14 — Character & Enemy Presentation
After combat readability is stable:
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

## Recommended prompt for a new chat
`Tiếp tục project VGpro9X/auto-battle-roguelite. GitHub là master source. Trước tiên hãy đọc README.md và PROJECT_HANDOFF.md trên main, sau đó fetch các file hiện tại liên quan trước khi sửa. Tiếp tục từ roadmap V0.13 và commit thường xuyên sau mỗi checkpoint.`
