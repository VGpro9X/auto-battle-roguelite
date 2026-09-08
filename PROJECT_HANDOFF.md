# Auto Battle Roguelite — Project Handoff

Use this file as the starting context when continuing development in a new chat.

## Master source
- Repository: `VGpro9X/auto-battle-roguelite`
- Default branch: `main`
- Repository is public.
- GitHub is canonical; do not reconstruct from stale chat snippets when GitHub is available.
- Before editing any existing file, fetch the current GitHub file and latest blob SHA.
- Commit after every meaningful checkpoint.
- Primary playable test surface: `https://vgpro9x.github.io/auto-battle-roguelite/`
- Pages workflow: `.github/workflows/pages.yml`

Read these before future work:
1. `README.md`
2. `PROJECT_HANDOFF.md`
3. `ROADMAP.md`
4. `V016_SKILL_DESIGN.md` for V0.16 implementation

## Current baseline
- Current released version: **V0.15 – Responsive & Mobile/Desktop Readability**
- V0.15 was hands-on tested by the user on a real phone through GitHub Pages and accepted.
- Movement baseline: **V0.8 Strategic Movement AI**. Do not rewrite movement unless explicitly requested.
- Shipped content remains:
  - 64 base Kỹ Năng
  - 20 Hợp Đạo Kỹ
  - 8 Siêu Cấp
  - 4 rare rule skills: 2 Thần Kỹ + 2 Thần Bí Kỹ
  - 96 Codex entries
- V0.16 is now the active development target; Checkpoint 1 design lock is complete.

## Locked terminology
- Base skill: **Kỹ Năng**
- Synergy: **Hợp Đạo Kỹ**
- Evolution: **Siêu Cấp**
- Unique rare rule skill: **Thần Kỹ** or **Thần Bí Kỹ**
- MAX: **TỐI ĐA**

Never expose raw English tier labels such as `SYNERGY`, `EVOLUTION`, `EVOLVE`, `MAX` or internal tags in player-facing UI.

## Core design identity
Unrestricted cross-archetype skill building:
`Kỹ Năng → Tags/Triggers/Modifiers → Hợp Đạo Kỹ → Siêu Cấp → Thần Kỹ/Thần Bí Kỹ`

- Hợp Đạo Kỹ should change interactions, not merely add flat damage.
- Siêu Cấp should be a major visible power spike stronger than one ordinary Hợp Đạo Kỹ.
- Thần Kỹ / Thần Bí Kỹ have no levels and act like run rules rather than normal stat upgrades.
- Current rare ownership rule: at most **one owned rare rule skill per run**.

## Mechanical truth — CRITICAL
Player description and implementation must match exactly.
- no silent cap
- no hidden cooldown
- no undocumented stack maximum
- no hidden target count or retry behavior
- every intentional restriction must be stated in Vietnamese player-facing description

Known truth fixes to preserve:
- V0.12 removed the hidden 85%-max-HP shield cap.
- V0.13 corrected **Săn Ấn** to the actually implemented extra 25% base XP from marked targets.

## Level-up clarity — CRITICAL
Never reintroduce partial-progress hint noise on choice cards.

Partial progress belongs only in **BỘ KỸ NĂNG & LIÊN KẾT**.

A choice card may show a relation hint only when that exact choice immediately completes the unlock:
- `CHỌN → MỞ HỢP ĐẠO KỸ: <Tên>`
- `CHỌN → ĐẠT SIÊU CẤP: <Tên>`

Do not show `HỖ TRỢ SIÊU CẤP`, `KẾT HỢP`, `0/1 → 1/1`, tag progress, or other partial hints on level-up cards.

## Standalone / test safety
- A prior V0.12 packaged build accidentally shipped an executable validation harness that auto-granted rare skills.
- Never embed executable test harness logic in Pages or user-playable HTML.
- External browser automation is allowed.

## Current rare rule skills
- **Mua Chuộc — Thần Bí Kỹ:** every 8s temporarily converts a random hostile to an ally for 5s.
- **Đổi Mệnh — Thần Bí Kỹ:** below 30% HP, every 20s can exchange HP ratio with a healthier random enemy when beneficial.
- **Bất Tử Nhất Tức — Thần Kỹ:** once per run prevents lethal damage, leaves player at 1 HP and grants 4s invulnerability.
- **Thiên Phạt — Thần Kỹ:** every 75 kills strikes up to 12 hostiles with heavy lightning damage.

Known non-blocking detail:
- Đổi Mệnh currently emits two `divine_trigger` events on success. Only the event carrying `enemy` drives the detailed tether; the generic event adds background feedback. Do not change unless it causes an observed issue.

## Visual progression already completed
### V0.12
- 64/64 base skills have explicit visual profiles and distinct Codex scenes.

### V0.13
- live combat readability
- common projectile identity
- hit/crit/status feedback
- visible Linh Hỏa and Lôi Linh actors
- Hợp Đạo/Siêu Cấp usage signatures
- dedicated rare-rule live feedback

### V0.14
- directional player silhouette and attack/movement presentation
- runner/hunter/anchor enemy presentation from existing speed variance
- distinct elite silhouette
- presentation-only: no movement/stat rewrite

### V0.15 — COMPLETE
Responsive files:
- `css/v015-responsive.css`
- `css/v015-codex.css`
- `js/v015-responsive.js`

Completed behavior:
- safe-area support and `viewport-fit=cover`
- `dvh`/`svh` sizing and overflow protection
- compact phone HUD retaining HP/XP/mode/level/time/kills/pause
- horizontally scrollable mobile skill bar
- mobile **BỘ KỸ NĂNG** drawer instead of hiding the tracker
- portrait/landscape handling
- viewport-safe level-up and run modals
- leaderboard preserves all fields on mobile
- mobile Codex uses catalog → tap → detail → back-to-list flow
- `visualViewport` mobile browser chrome handling
- `visibilitychange` auto-pause fallback
- real-phone GitHub Pages user acceptance

Release record: `V015_STATUS.md`.

## Current render / script integration
Near the end of `index.html`:
1. `js/skill-codex.js`
2. `js/ui.js`
3. `js/v015-responsive.js`
4. `js/evolution-hint-fix.js`
5. `js/game.js`
6. `js/v014-character-enemy-presentation.js`
7. `js/visual-bridge.js`
8. `js/v013-summon-power-feedback.js`
9. `js/v013-rule-feedback.js`

Responsive CSS loads after inherited CSS so V0.15 can safely override earlier mobile rules.

# V0.16 — ACTIVE
Full implementation contract: `V016_SKILL_DESIGN.md`.

## Target content
Subject to quality/playtest:
- base Kỹ Năng: 64 → 80
- Hợp Đạo Kỹ: 20 → 28
- Siêu Cấp: 8 → 12
- rare rule skills: 4 → 12
  - Thần Kỹ 2 → 6
  - Thần Bí Kỹ 2 → 6
- Codex 96 → 124

Targets are not quotas. Cut/redesign weak duplicates.

## V0.16 Checkpoint 1 — COMPLETE: design lock
Design-locked base skills:
1. Dư Ảnh (`afterimage`)
2. Địa Lôi Phù (`runeMine`)
3. Huyết Liên (`bloodLink`)
4. Linh Châu (`spiritPearl`)
5. Bộ Pháp Chấn (`strideShock`)
6. Trói Hồn (`soulBind`)
7. Hồi Phong Nhận (`returnBlade`)
8. Tinh Vẫn (`meteorSeal`)
9. Hộ Pháp Mộc Nhân (`guardianIdol`)
10. Hàn Kính (`frostMirror`)
11. Tĩnh Tâm (`focusMind`)
12. Thất Tinh Kích (`sevenStarStrike`)
13. Lôi Trường (`staticField`)
14. Hồn Đăng (`soulLantern`)
15. Phá Giáp (`armorBreak`)
16. Thời Vực (`timeField`)

Design-locked Hợp Đạo Kỹ:
- Vạn Ảnh Xạ
- Trọng Lực Phù Trận
- Huyết Mạch Cộng Sinh
- Linh Châu Dưỡng Mệnh
- Phong Lôi Bộ
- Phong Hồn Tử Ấn
- Thiên Hỏa Tinh Vẫn
- Hộ Pháp Phản Chấn

Design-locked Siêu Cấp:
- Vạn Ảnh Phân Thân
- Thiên La Địa Võng
- Huyết Võng
- Tinh Hà Trụy Lạc

Design-locked new Thần Kỹ:
- Thiên Mệnh
- Phán Quyết
- Thiên Hộ
- Thần Vực

Design-locked new Thần Bí Kỹ:
- Hoán Vị
- Nghịch Lưu
- Đảo Nhân Quả
- Đồng Giá

Exact numbers, caps, cooldowns, tags and visual intent are in `V016_SKILL_DESIGN.md`. Do not implement from memory when the file can be fetched.

## V0.16 Vô Hạn rule — LOCKED
When a Vô Hạn run begins:
1. select exactly one random rare skill uniformly from the full valid rare pool
2. grant it before the normal starter Kỹ Năng choice
3. show a dedicated reveal overlay with tier/icon/name/exact description
4. user acknowledges reveal
5. then show the existing one normal starter choice
6. starting rare consumes the run's one rare slot
7. no later rare offer during that Vô Hạn run
8. timed modes keep the existing rare-offer system

No hidden weighting.

## Immediate next checkpoint
**V0.16 Batch A1 implementation:**
- Dư Ảnh
- Địa Lôi Phù
- Huyết Liên
- Linh Châu

For each skill in A1, before calling the batch done:
- implement mechanics
- preserve exact description contract
- add live visual identity
- make it appear in level-up pool correctly
- add Codex entry/preview or ensure the generic Codex pipeline recognizes it with a dedicated visual profile before release
- syntax check
- runtime exercise
- commit checkpoint

Then continue A2/A3/A4 from `ROADMAP.md`.

## Future-chat development rules
1. Fetch current GitHub files before modifications.
2. Commit frequently.
3. Do not alter V0.8 movement AI while implementing skills; combat-side skill-specific position/target effects are allowed without rewriting strategic movement.
4. Do not re-add partial relation hints.
5. Keep UI Vietnamese.
6. No hidden caps/limits.
7. Prefer GitHub Pages for user testing.
8. Never ship embedded validation harness code.

## Recommended continuation prompt
`Tiếp tục VGpro9X/auto-battle-roguelite. GitHub main là master. Đọc README.md, PROJECT_HANDOFF.md, ROADMAP.md và V016_SKILL_DESIGN.md trước. Baseline release là V0.15. V0.16 Checkpoint 1 design lock đã xong; bắt đầu/tiếp tục Batch A1 gồm Dư Ảnh, Địa Lôi Phù, Huyết Liên, Linh Châu. Fetch file hiện tại trước khi sửa, giữ Movement V0.8, mechanical truth và final-piece-only hints, commit sau từng checkpoint.`
