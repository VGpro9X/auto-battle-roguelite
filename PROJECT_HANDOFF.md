# Auto Battle Roguelite — Project Handoff

Use this file as the starting context when continuing development in a new chat.

## Master source
- Repository: `VGpro9X/auto-battle-roguelite`
- Default branch: `main`
- Repository is public; GitHub `main` is canonical.
- Public test URL: `https://vgpro9x.github.io/auto-battle-roguelite/`
- Pages workflow: `.github/workflows/pages.yml`
- Before editing an existing file, fetch current GitHub content + blob SHA.
- Commit after each meaningful checkpoint.

Read first:
1. `README.md`
2. `PROJECT_HANDOFF.md`
3. `ROADMAP.md`
4. `V016_SKILL_DESIGN.md`
5. `V016_RARE_SYSTEM_V2.md`

## Current state
- Released baseline: **V0.15** responsive/mobile work accepted by user.
- Public development label: **V0.16 DEV**.
- Current main/Pages content after the rare expansion:
  - **80 base Kỹ Năng**
  - **20 Hợp Đạo Kỹ**
  - **8 Siêu Cấp**
  - **20 rare rules = 10 Thần Kỹ + 10 Thần Bí Kỹ**
  - **128 current Codex entries**
- V0.16 final target: 80 Kỹ Năng + 28 Hợp Đạo + 12 Siêu Cấp + 20 rare = **140 Codex entries**.
- Old target `124` was an arithmetic error and is obsolete.
- Movement baseline remains **V0.8 Strategic Movement AI**; do not rewrite unless explicitly requested.

## Locked terminology / truth rules
- Kỹ Năng / Hợp Đạo Kỹ / Siêu Cấp / Thần Kỹ / Thần Bí Kỹ / TỐI ĐA.
- Player-facing UI remains Vietnamese.
- No hidden caps, cooldowns, stack maxima, target limits, retry rules or weighting.
- Preserve V0.12 hidden-shield-cap removal.
- Preserve Săn Ấn truth: marked target gives +25% base XP only.
- Partial Hợp Đạo/Siêu Cấp progress belongs only in `BỘ KỸ NĂNG & LIÊN KẾT`.
- Choice cards only show relation hints when that exact pick immediately completes the unlock.
- Test harnesses live only under `tests/`; Pages deploys only `index.html`, `css/`, `js/`.

# V0.16 completed work

## 80 base Kỹ Năng — COMPLETE
A1: Dư Ảnh, Địa Lôi Phù, Huyết Liên, Linh Châu.  
A2: Bộ Pháp Chấn, Trói Hồn, Hồi Phong Nhận, Tinh Vẫn.  
A3: Hộ Pháp Mộc Nhân, Hàn Kính, Tĩnh Tâm, Thất Tinh Kích.  
A4: Lôi Trường, Hồn Đăng, Phá Giáp, Thời Vực.

All 16 additions have mechanics, truthful Vietnamese descriptions, live VFX/Codex identities and CI smoke tests. A3 uses only a narrow hostile combat-target hook for Hộ Pháp; V0.8 player movement is untouched.

## Script/Codex integration — COMPLETE
- A1–A4 load before Codex.
- `V0.16 DEV` is visible/runtime label.
- cache keys are used for active V0.16 modules.
- public script-order CI prevents regression.

## Cross-platform icon compatibility — COMPLETE, user feel test pending
`js/v016-run-systems.js` replaces newer emoji that can render as square boxes:
- Xuyên Phá: `🪡 → ➤`
- Tham Lam: `🪙 → ●`
- Trói Hồn: `🪢 → ⛓`
- Hồi Phong Nhận: `🪃 → ↩`
- Hộ Pháp Mộc Nhân: `🪵 → ▣`
- Hàn Kính: `🪞 → ◇`
- wing-like newer glyph: `🪽 → ✦`
- remaining U+1FA70..U+1FAFF icons fall back to `◆`.

## Rare System V2 — COMPLETE at mechanic level
Old one-rare-per-run limit is removed. Different rare rules may coexist; duplicates are forbidden.

Rare chance per normal level-up roll:
- Lv1–7: 0%
- Lv8: 1%
- +0.35 percentage point each later level
- cap 12%
- examples: Lv20 5.2%, Lv30 8.7%, Lv40+ 12%
- at most one rare card per 3-card roll
- uniform among unowned rare pool
- no hidden weighting/ownership penalty

### Current 10 Thần Kỹ
1. Bất Tử Nhất Tức
2. Thiên Phạt
3. Thiên Mệnh
4. Phán Quyết
5. Thiên Hộ
6. Thần Vực
7. Thiên Tứ
8. Thời Đình
9. Thiên Lệnh
10. Thiên Ấn

### Current 10 Thần Bí Kỹ
1. Mua Chuộc
2. Đổi Mệnh
3. Hoán Vị
4. Nghịch Lưu
5. Đảo Nhân Quả
6. Đồng Giá
7. Nợ Máu
8. Ký Sinh
9. Hư Thực
10. Thế Mệnh

Implementation locations:
- original 4 + rare chance engine: `js/divine-skills.js`
- first 8 additions + reroll/icon layer: `js/v016-run-systems.js`
- final four Thần Kỹ: `js/v016-rares-r3.js`
- final four Thần Bí Kỹ: `js/v016-rares-r4.js`

Important rare mechanics now tested:
- Thiên Tứ free level and build re-evaluation
- Thời Đình hostile freeze / allied exemption / speed restoration
- Thiên Lệnh exact current-HP percentage and elite ratio
- Thiên Ấn per-enemy 12s contact block with dodge first
- Nợ Máu 50/50 immediate/deferred damage and 5s repayment
- Ký Sinh post-shield 30/70 damage split
- Hư Thực 6s alternating modifiers
- Thế Mệnh fatal interception
- earlier Thiên Mệnh / Hoán Vị / Đồng Giá mechanics

Dedicated bespoke VFX for every new rare is still part of the final V0.16 visual audit; generic rare Codex/live feedback remains available meanwhile.

## One reroll per choice screen — COMPLETE
Every starter/level-up choice screen has exactly one `XOAY LẠI`:
- fresh 3-card roll
- fresh rare roll
- allowance cannot reset on the same screen
- allowance does not carry over
- exact current rare chance is displayed in the normal level-up description
- Cách chơi documents the rule.

## Current CI gate
Before Pages deploy:
1. syntax-check `js/*.js` + `tests/*.js`
2. A1/A2/A3/A4 smoke suites
3. base80 + public script-order integration
4. rare curve / multi-rare / reroll / icon compatibility
5. actual public rare script chain = 20 total / 10+10
6. final R3/R4 rare mechanic smoke

# Immediate next checkpoint — 8 new Hợp Đạo Kỹ
From `V016_SKILL_DESIGN.md`:
1. Vạn Ảnh Xạ
2. Trọng Lực Phù Trận
3. Huyết Mạch Cộng Sinh
4. Linh Châu Dưỡng Mệnh
5. Phong Lôi Bộ
6. Phong Hồn Tử Ấn
7. Thiên Hỏa Tinh Vẫn
8. Hộ Pháp Phản Chấn

Then:
- 4 Siêu Cấp
- Vô Hạn guaranteed starting rare reveal using the full 20-skill pool
- full Codex/VFX/mechanical-truth/balance/device audit

# Vô Hạn revised rule — PENDING IMPLEMENTATION
V0.16 Vô Hạn must begin with exactly one uniformly random rare before the normal starter Kỹ Năng and show a dedicated reveal.
Because multiple rare/run is now allowed:
- starting rare does not block later rare offers
- later level-ups use the normal level-scaled curve
- starting rare is excluded only as an owned duplicate
- no hidden weighting.

## Recommended continuation prompt
`Tiếp tục VGpro9X/auto-battle-roguelite. GitHub main là master. Đọc README.md, PROJECT_HANDOFF.md, ROADMAP.md, V016_SKILL_DESIGN.md và V016_RARE_SYSTEM_V2.md. V0.16 DEV hiện có 80 base skills và 20 rare rules (10 Thần Kỹ + 10 Thần Bí Kỹ), rare chance tăng theo cấp, nhiều rare/run, 1 XOAY LẠI mỗi choice screen và icon compatibility. Tiếp tục 8 Hợp Đạo Kỹ mới. Fetch file trước khi sửa, giữ Movement V0.8, mechanical truth và final-piece-only hints.`
