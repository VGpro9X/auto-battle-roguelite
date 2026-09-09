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
- Current main/Pages content:
  - **80 base Kỹ Năng**
  - **28 Hợp Đạo Kỹ**
  - **8 Siêu Cấp**
  - **20 rare rules = 10 Thần Kỹ + 10 Thần Bí Kỹ**
  - **136 Codex entries**
- V0.16 final target: 80 + 28 + 12 + 20 = **140 Codex entries**.
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

All 16 additions have mechanics, truthful Vietnamese descriptions, live VFX/Codex identities and CI smoke tests. Hộ Pháp uses only a narrow hostile combat-target hook; V0.8 player movement remains untouched.

## 28 Hợp Đạo Kỹ — COMPLETE
New B1 module `js/v016-synergies-b1.js`:
1. Vạn Ảnh Xạ (`afterimageEcho`)
2. Trọng Lực Phù Trận (`gravityRune`)
3. Huyết Mạch Cộng Sinh (`bloodSymbiosis`)
4. Linh Châu Dưỡng Mệnh (`nourishingPearls`)

New B2 module `js/v016-synergies-b2.js`:
5. Phong Lôi Bộ (`thunderStride`)
6. Phong Hồn Tử Ấn (`sealedSoul`)
7. Thiên Hỏa Tinh Vẫn (`heavenfallBurn`)
8. Hộ Pháp Phản Chấn (`guardianRetaliation`)

Important exact rules:
- Trọng Lực Phù Trận pulls enemy centers in 105px inward exactly 36px (or to center if nearer) before the normal rune blast; pull deals no damage.
- Huyết Mạch Cộng Sinh heals 10% of actual mirrored Huyết Liên damage.
- Linh Dưỡng actual healing counts ×2 toward Linh Châu; pearl hit heals exactly 0.5 HP.
- Phong Lôi Bộ follows max 2 living stride-shock-hit targets at 50% current Lôi Kích base damage.
- Phong Hồn Tử Ấn prioritizes marked targets, adds +1s bind before elite halving, and bound+marked target takes +20% damage.
- Thiên Hỏa Tinh Vẫn checks the exact selected meteor target immediately before impact; if alive and burning, second same-radius no-proc blast occurs 0.25s later for 55% base Tinh Vẫn damage.
- Hộ Pháp Phản Chấn uses current Phản Chấn radius/damage centered on Hộ Pháp, max once per 0.6s per guardian.

CI exercises B1/B2 mechanics and asserts the combined public Hợp Đạo registry contains exactly 28 unique entries. Both modules load after A1–A4 and before Codex. Final Hợp Đạo integration + Pages deploy passed.

## Cross-platform icon compatibility — COMPLETE
`js/v016-run-systems.js` replaces unsupported newer emoji with stable symbols. Remaining U+1FA70..U+1FAFF icons fall back to `◆`.

## Rare System V2 — COMPLETE at mechanic level
- **20 rare rules = 10 Thần Kỹ + 10 Thần Bí Kỹ**.
- Multiple different rares can coexist; duplicates are forbidden.
- Offer curve: Lv1–7 0%; Lv8 1%; +0.35 percentage point/level; cap 12%.
- Maximum one rare card in one 3-card roll; uniform among unowned rares.
- One `XOAY LẠI` per choice screen rerolls all three cards and rare roll.
- Current public rare chain and difficult rare mechanics are CI-gated.

## Current CI gate
Before Pages deploy:
1. syntax-check `js/*.js` + `tests/*.js`
2. A1/A2/A3/A4 smoke
3. base80 + script-order integration
4. rare curve / multi-rare / reroll / icon compatibility
5. actual rare chain = 20 total / 10+10
6. rare mechanic smoke
7. Hợp Đạo B1 smoke
8. Hợp Đạo B2 smoke
9. Hợp Đạo registry/script-order integration = 28

# Immediate next checkpoint — 4 new Siêu Cấp
From `V016_SKILL_DESIGN.md`:
1. **Vạn Ảnh Phân Thân** — base Dư Ảnh
2. **Thiên La Địa Võng** — base Địa Lôi Phù
3. **Huyết Võng** — base Huyết Liên
4. **Tinh Hà Trụy Lạc** — base Tinh Vẫn

Then:
- Vô Hạn guaranteed starting rare reveal using full 20-skill pool
- full Codex/VFX/mechanical-truth/balance/device audit

# Vô Hạn revised rule — PENDING IMPLEMENTATION
V0.16 Vô Hạn must begin with exactly one uniformly random rare before the normal starter Kỹ Năng and show a dedicated reveal. The starting rare does not block later rare offers; later level-ups use the normal level-scaled curve, and the starting rare is excluded only as an owned duplicate.

## Recommended continuation prompt
`Tiếp tục VGpro9X/auto-battle-roguelite. GitHub main là master. Đọc README.md, PROJECT_HANDOFF.md, ROADMAP.md, V016_SKILL_DESIGN.md và V016_RARE_SYSTEM_V2.md. V0.16 DEV hiện có 80 Kỹ Năng, 28 Hợp Đạo, 8 Siêu Cấp và 20 rare = 136 Codex entries. Checkpoint Hợp Đạo B1/B2 đã CI + Pages pass. Tiếp tục 4 Siêu Cấp mới. Fetch file trước khi sửa, giữ Movement V0.8, mechanical truth và final-piece-only hints.`
