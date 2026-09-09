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
- Current Pages/main content:
  - 80 base Kỹ Năng
  - 20 Hợp Đạo Kỹ
  - 8 Siêu Cấp
  - 4 currently implemented rare rules (2 Thần Kỹ + 2 Thần Bí Kỹ)
  - 112 current Codex entries
- V0.16 final target now:
  - 80 Kỹ Năng
  - 28 Hợp Đạo Kỹ
  - 12 Siêu Cấp
  - **20 rare rules = 10 Thần Kỹ + 10 Thần Bí Kỹ**
  - **140 Codex entries** total. Old `124` target was arithmeticly wrong and is obsolete.
- Movement baseline remains **V0.8 Strategic Movement AI**; do not rewrite unless explicitly requested.

## Locked terminology
- base: Kỹ Năng
- synergy: Hợp Đạo Kỹ
- evolution: Siêu Cấp
- rare rules: Thần Kỹ / Thần Bí Kỹ
- max: TỐI ĐA
- Player-facing language remains Vietnamese.

## Locked truth / clarity rules
- No hidden caps, cooldowns, stack maxima, target limits, retry rules or weighting.
- Preserve V0.12 hidden-shield-cap removal.
- Preserve Săn Ấn truth: marked target gives +25% base XP only.
- Partial Hợp Đạo/Siêu Cấp progress belongs only in BỘ KỸ NĂNG & LIÊN KẾT.
- Choice cards only show relation hints when that exact pick immediately completes the unlock.
- Test harnesses live only under `tests/`; Pages deploys only `index.html`, `css/`, `js/`.

# V0.16 completed work

## Base expansion — COMPLETE
A1: Dư Ảnh, Địa Lôi Phù, Huyết Liên, Linh Châu.
A2: Bộ Pháp Chấn, Trói Hồn, Hồi Phong Nhận, Tinh Vẫn.
A3: Hộ Pháp Mộc Nhân, Hàn Kính, Tĩnh Tâm, Thất Tinh Kích.
A4: Lôi Trường, Hồn Đăng, Phá Giáp, Thời Vực.

All 16 additions have real mechanics, truthful Vietnamese descriptions, live VFX, Codex identities and non-shipping CI smoke tests. Current base pool = **80**.

A3 uses only a narrow enemy combat-target hook for Hộ Pháp; V0.8 player movement logic is untouched.

## Codex/script integration fix — COMPLETE
V0.16 A1–A4 now load before `skill-codex.js`; cache-busting prevents stale V0.15/A1-A4 scripts. CI verifies 80 base skills and script order.

## Cross-platform icon compatibility — COMPLETE, user-visible feel test pending
`js/v016-run-systems.js` normalizes newer U+1FAxx emoji that may render as square boxes on Windows/Android.
Known stable replacements include:
- Xuyên Phá: 🪡 → ➤
- Tham Lam: 🪙 → ●
- Trói Hồn: 🪢 → ⛓
- Hồi Phong Nhận: 🪃 → ↩
- Hộ Pháp Mộc Nhân: 🪵 → ▣
- Hàn Kính: 🪞 → ◇
- wing-like newer glyph: 🪽 → ✦
Any remaining U+1FA70..U+1FAFF icon falls back to `◆`.

## Rare system V2 — IMPLEMENTED SYSTEM LAYER
Old rule "at most one rare per run" is removed.
Different rare rules may coexist; duplicates remain forbidden.

Rare offer curve per normal level-up roll:
- Lv.1–7: 0%
- Lv.8: 1%
- +0.35 percentage point each level
- cap 12% per roll
- formula: `min(12%, 1% + (level-8)*0.35%)`
- examples: Lv20 5.2%, Lv30 8.7%, Lv40+ 12%
- one rare card maximum per three-card roll
- uniform selection among unowned rare pool
- no hidden weighting or ownership penalty

Current four implemented rares still are:
- Thần Kỹ: Bất Tử Nhất Tức, Thiên Phạt
- Thần Bí Kỹ: Mua Chuộc, Đổi Mệnh

V0.16 final pool target is 20. Full additional design is in `V016_RARE_SYSTEM_V2.md`.

## One reroll per choice screen — IMPLEMENTED
Every starter/level-up choice screen has exactly one `XOAY LẠI`.
- rerolls all three cards
- performs a fresh rare roll
- allowance cannot refresh on the same screen
- allowance does not carry to the next screen
- exact rare chance is shown in the level-up description
- Cách chơi documents both reroll and rare formula

## Current CI gate
Before Pages deploy:
1. syntax-check `js/*.js` + `tests/*.js`
2. A1 smoke
3. A2 smoke
4. A3 smoke
5. A4 smoke
6. base80 integration smoke
7. rare curve / multiple rare / reroll / icon compatibility smoke

Latest rare/reroll CI + Pages deployment passed.

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
- implement all 16 new rare rules in CI-gated batches
- Vô Hạn guaranteed starting rare reveal using full 20-skill pool
- full Codex/VFX/mechanical-truth/balance/device audit

# Vô Hạn revised rule
At V0.16, Vô Hạn still begins with exactly one uniformly random rare before the normal starter Kỹ Năng and shows a dedicated reveal.
Because multiple rare/run is now allowed:
- the starting rare does NOT block later rare offers
- later level-ups use the normal level-scaled rare curve
- the starting rare is simply excluded from future offers as an owned duplicate
- no hidden weighting

## Recommended continuation prompt
`Tiếp tục VGpro9X/auto-battle-roguelite. GitHub main là master. Đọc README.md, PROJECT_HANDOFF.md, ROADMAP.md, V016_SKILL_DESIGN.md và V016_RARE_SYSTEM_V2.md. V0.16 DEV hiện có 80 base skills, icon compatibility, multiple-rare level-scaled chance và 1 reroll mỗi choice screen; CI/Pages đã pass. Tiếp tục 8 Hợp Đạo Kỹ mới. Fetch file trước khi sửa, giữ Movement V0.8, mechanical truth và final-piece-only hints.`
