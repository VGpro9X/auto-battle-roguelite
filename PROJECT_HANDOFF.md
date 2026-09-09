# Auto Battle Roguelite — Project Handoff

Use this file as the starting context when continuing development in a new chat.

## Master source
- Repository: `VGpro9X/auto-battle-roguelite`
- Default branch: `main`
- Repository is public; GitHub `main` is canonical.
- Public test URL: `https://vgpro9x.github.io/auto-battle-roguelite/`
- Pages workflow: `.github/workflows/pages.yml`
- Before editing any existing file, fetch its current GitHub content and blob SHA.
- Commit after every meaningful checkpoint.

Read before development:
1. `README.md`
2. `PROJECT_HANDOFF.md`
3. `ROADMAP.md`
4. `V016_SKILL_DESIGN.md`

## Released baseline vs active development
- Released/visible version label remains **V0.15 – Responsive & Mobile/Desktop Readability** until all V0.16 release gates pass.
- V0.15 was accepted by the user on a real phone through GitHub Pages.
- V0.16 is active on `main` and its **base-skill expansion checkpoint is now complete**.
- Current `main` / Pages content after A4:
  - **80 base Kỹ Năng**
  - 20 Hợp Đạo Kỹ
  - 8 Siêu Cấp
  - 4 rare rule skills: 2 Thần Kỹ + 2 Thần Bí Kỹ
  - **112 current Codex entries** before the V0.16 Hợp Đạo/Siêu Cấp/rare additions
- Movement baseline remains **V0.8 Strategic Movement AI**. Do not rewrite player movement unless explicitly requested.

## Locked rules
### Terminology
- Base skill: **Kỹ Năng**
- Synergy: **Hợp Đạo Kỹ**
- Evolution: **Siêu Cấp**
- Unique rule skill: **Thần Kỹ / Thần Bí Kỹ**
- Max: **TỐI ĐA**
- Player-facing UI remains Vietnamese; do not expose raw internal tags/tier labels.

### Mechanical truth
- No silent caps, hidden cooldowns, undocumented stack maxima, target limits or retry rules.
- Any intentional restriction must be stated in the Vietnamese description.
- Preserve the V0.12 hidden-shield-cap removal.
- Preserve the corrected Săn Ấn truth: +25% base XP from marked targets only.

### Level-up clarity
Partial progress belongs only in **BỘ KỸ NĂNG & LIÊN KẾT**.
A choice card only shows a relation hint when that exact choice immediately completes the unlock:
- `CHỌN → MỞ HỢP ĐẠO KỸ: <Tên>`
- `CHỌN → ĐẠT SIÊU CẤP: <Tên>`
Never restore partial-progress card noise.

### Test safety
- Never embed executable validation harnesses in the playable build.
- CI tests live under `tests/`.
- Pages deploy copies only `index.html`, `css/` and `js/`; `tests/` does not ship.

## Completed visual/UI milestones
- V0.12: original 64 skills got explicit visual profiles/Codex scenes.
- V0.13: combat readability, hit/crit/status feedback, summon actors, Hợp Đạo/Siêu Cấp/rare feedback.
- V0.14: player/enemy/elite Canvas presentation without player movement/stat rewrite.
- V0.15: full responsive phone/tablet/desktop UI; phone accepted by user.

# V0.16 — ACTIVE
Design contract: `V016_SKILL_DESIGN.md`.

Target if quality gates pass:
- base Kỹ Năng 64 → 80 ✅
- Hợp Đạo Kỹ 20 → 28
- Siêu Cấp 8 → 12
- rare rule skills 4 → 12
- Codex 96 → 124

## Checkpoint 1 — COMPLETE: design lock
All 16 base skills, 8 Hợp Đạo Kỹ, 4 Siêu Cấp and 8 new rare rule skills are design-locked with exact mechanics/numbers/limits/visual intent.

## Checkpoint 2 — COMPLETE: 16 new base Kỹ Năng
### A1 — `js/v016-skills-a1.js`
- Dư Ảnh (`afterimage`)
- Địa Lôi Phù (`runeMine`)
- Huyết Liên (`bloodLink`)
- Linh Châu (`spiritPearl`)

### A2 — `js/v016-skills-a2.js`
- Bộ Pháp Chấn (`strideShock`)
- Trói Hồn (`soulBind`)
- Hồi Phong Nhận (`returnBlade`)
- Tinh Vẫn (`meteorSeal`)

A2 notes:
- Bộ Pháp Chấn observes actual distance moved; it does not influence V0.8 movement decisions.
- Trói Hồn temporarily makes the selected hostile immobile for its bind window and restores its underlying speed immediately after each wrapped gameplay frame.
- Hồi Phong Nhận uses separate outward/return hit sets.
- Tinh Vẫn stores the marked position and impacts there after 0.8s.

### A3 — `js/v016-skills-a3.js`
- Hộ Pháp Mộc Nhân (`guardianIdol`)
- Hàn Kính (`frostMirror`)
- Tĩnh Tâm (`focusMind`)
- Thất Tinh Kích (`sevenStarStrike`)

A3 integration note:
- `js/game.js` now has a **narrow hostile combat-target hook** (`getEnemyCombatTarget` / `damageEnemyCombatTarget`) used only when a skill provides an alternate combat target such as Hộ Pháp.
- Player `chooseMovementDirection()` / V0.8 movement logic was not changed.
- Hàn Kính performs dodge before consuming its one mirror charge.
- Tĩnh Tâm uses a tiny floating-point epsilon at the exact 4.0s threshold so the documented timing does not slip one frame.

### A4 — `js/v016-skills-a4.js`
- Lôi Trường (`staticField`)
- Hồn Đăng (`soulLantern`)
- Phá Giáp (`armorBreak`)
- Thời Vực (`timeField`)

A4 notes:
- Lôi Trường emits exactly six 0.5s pulses over 3s and disables normal on-hit procs for those pulses.
- Hồn Đăng caps at 3 active flames and retains completed kill progress while full until a slot opens; this behavior is disclosed in the description.
- Phá Giáp stacks are target-local, last 4s, refresh together, and affect all player damage after application.
- Thời Vực speeds the timer advancement of **all owned base periodic skills**, including its own timer, exactly as its description says; it does not duplicate executions directly.

## Base-expansion validation — COMPLETE
CI currently runs, before every Pages deploy:
1. syntax-check all `js/*.js` and `tests/*.js`
2. `tests/v016-a1-smoke.js`
3. `tests/v016-a2-smoke.js`
4. `tests/v016-a3-smoke.js`
5. `tests/v016-a4-smoke.js`

Final A4-loaded build passed all four smoke suites and Pages deployment successfully.

Current late script order:
1. `js/skill-codex.js`
2. `js/ui.js`
3. `js/v015-responsive.js`
4. `js/evolution-hint-fix.js`
5. `js/game.js`
6. `js/v014-character-enemy-presentation.js`
7. `js/v016-skills-a1.js`
8. `js/v016-skills-a2.js`
9. `js/v016-skills-a3.js`
10. `js/v016-skills-a4.js`
11. `js/visual-bridge.js`
12. `js/v013-summon-power-feedback.js`
13. `js/v013-rule-feedback.js`

Codex is safe with this order because `skill-codex.js` builds its entry list dynamically when the Codex is first opened, after all scripts have loaded.

## Immediate next checkpoint — 8 new Hợp Đạo Kỹ
Implement from `V016_SKILL_DESIGN.md`:
1. Vạn Ảnh Xạ (`afterimageEcho`)
2. Trọng Lực Phù Trận (`gravityRune`)
3. Huyết Mạch Cộng Sinh (`bloodSymbiosis`)
4. Linh Châu Dưỡng Mệnh (`nourishingPearls`)
5. Phong Lôi Bộ
6. Phong Hồn Tử Ấn
7. Thiên Hỏa Tinh Vẫn
8. Hộ Pháp Phản Chấn

Requirements:
- behavior-changing interactions, not flat filler buffs
- explicit source routing so base effects do not masquerade as Hợp Đạo triggers
- preserve final-piece-only level-up hints
- add live signature/Codex visibility
- extend non-shipping CI smoke tests

Then continue: 4 Siêu Cấp → 8 new rare rules → Vô Hạn guaranteed starting rare/reveal → full Codex/VFX/truth/balance/device audit.

## V0.16 Vô Hạn rule — LOCKED for later
Vô Hạn must uniformly grant exactly one random Thần Kỹ/Thần Bí Kỹ before the normal starter choice, reveal it explicitly, consume the one-rare slot and prevent later rare offers in that run. Timed modes retain current rare-offer behavior. No hidden weighting.

## Recommended continuation prompt
`Tiếp tục VGpro9X/auto-battle-roguelite. GitHub main là master. Đọc README.md, PROJECT_HANDOFF.md, ROADMAP.md và V016_SKILL_DESIGN.md. Release label vẫn V0.15 nhưng V0.16 Checkpoint 2 đã hoàn tất: main/Pages hiện có 80 base Kỹ Năng và A1–A4 đều CI pass. Bắt đầu Checkpoint 3: 8 Hợp Đạo Kỹ mới. Fetch file trước khi sửa, giữ Movement V0.8, mechanical truth, final-piece-only hints và test harness ngoài playable build.`
