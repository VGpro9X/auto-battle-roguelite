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
4. `V016_RELEASE_VALIDATION.md`
5. `V016_SKILL_DESIGN.md`
6. `V016_RARE_SYSTEM_V2.md`

## Current state
- Released baseline: **V0.15** responsive/mobile work accepted by user.
- Public development label: **V0.16 DEV**.
- Current main/Pages content:
  - **80 base Kỹ Năng**
  - **28 Hợp Đạo Kỹ**
  - **12 Siêu Cấp**
  - **20 rare rules = 10 Thần Kỹ + 10 Thần Bí Kỹ**
  - **140 Codex entries**
- V0.16 content, CI audit, exact Pages-artifact Chromium validation and synthetic desktop/mobile viewport checks are complete.
- Remaining release gate is a **short physical-device feel check** before changing the visible/runtime label from `V0.16 DEV` to final `V0.16`.
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

# V0.16 completed content

## 80 base Kỹ Năng — COMPLETE
A1: Dư Ảnh, Địa Lôi Phù, Huyết Liên, Linh Châu.  
A2: Bộ Pháp Chấn, Trói Hồn, Hồi Phong Nhận, Tinh Vẫn.  
A3: Hộ Pháp Mộc Nhân, Hàn Kính, Tĩnh Tâm, Thất Tinh Kích.  
A4: Lôi Trường, Hồn Đăng, Phá Giáp, Thời Vực.

All 16 additions have mechanics, truthful Vietnamese descriptions, live VFX/Codex identities and CI smoke tests. Hộ Pháp uses only a narrow hostile combat-target hook; V0.8 player movement remains untouched.

## 28 Hợp Đạo Kỹ — COMPLETE
B1 module `js/v016-synergies-b1.js`:
1. Vạn Ảnh Xạ (`afterimageEcho`)
2. Trọng Lực Phù Trận (`gravityRune`)
3. Huyết Mạch Cộng Sinh (`bloodSymbiosis`)
4. Linh Châu Dưỡng Mệnh (`nourishingPearls`)

B2 module `js/v016-synergies-b2.js`:
5. Phong Lôi Bộ (`thunderStride`)
6. Phong Hồn Tử Ấn (`sealedSoul`)
7. Thiên Hỏa Tinh Vẫn (`heavenfallBurn`)
8. Hộ Pháp Phản Chấn (`guardianRetaliation`)

CI exercises B1/B2 mechanics and asserts exactly **28 unique Hợp Đạo Kỹ** in the public chain.

## 12 Siêu Cấp — COMPLETE
C1:
1. Vạn Ảnh Phân Thân (`phantomLegion`) — base Dư Ảnh
2. Thiên La Địa Võng (`heavenNet`) — base Địa Lôi Phù
3. Huyết Võng (`bloodWeb`) — base Huyết Liên
4. Tinh Hà Trụy Lạc (`starfallCataclysm`) — base Tinh Vẫn

Implementation:
- `js/v016-evolutions-c1.js`
- `js/v016-evolutions-c1-compat.js`

Exact rules:
- Vạn Ảnh Phân Thân creates 3 active clones; each fires 2 evolved shots at 70% of current Lv-based Dư Ảnh shot damage.
- Thiên La Địa Võng raises active-rune cap to 8; armed rune chain within 120px after 0.12s; chained runes deal 75% normal rune damage and propagate.
- Huyết Võng links 4 nearest enemies for 5s; 25% actual damage copies to each other living web target with no recursion/procs.
- Tinh Hà Trụy Lạc creates 3 meteors spaced by 0.18s; side impacts offset 38px and deal 70% of the first while preserving burn.
- Matching B1/B2 Hợp Đạo interactions remain active after evolution.

## Rare System V2 — COMPLETE
- **20 rare rules = 10 Thần Kỹ + 10 Thần Bí Kỹ**.
- Multiple different rares can coexist; duplicates are forbidden.
- Offer curve: Lv1–7 0%; Lv8 1%; +0.35 percentage point/level; cap 12%.
- Maximum one rare card per 3-card roll; uniform among unowned rares.
- One `XOAY LẠI` per choice screen rerolls all three cards and rare roll.
- Current public rare chain and difficult mechanics are CI-gated.

### Mechanical-truth audit correction
A hidden generic failed-activation retry rule used to retry conditional periodic rare skills at <=1.25s. It has been removed.
- Failed activation now waits the rare's stated normal cooldown unless that rare explicitly declares `retryCooldown`.
- Thế Mệnh is the explicit exception: `retryCooldown: 1.25`, matching its Vietnamese description.

## Vô Hạn guaranteed starting rare — COMPLETE
Module: `js/v016-endless-starting-rare.js`.

Flow:
1. fresh Vô Hạn reset
2. select one of all 20 rare rules uniformly
3. grant immediately
4. dedicated tier/icon/name/exact-description reveal
5. acknowledgement opens exactly one normal starter Kỹ Năng choice
6. granted rare is excluded later only as an owned duplicate
7. other 19 rares remain available through normal level-scaled offers

The mode card and Cách chơi disclose the rule.

# Final V0.16 audit status

## Rare VFX/Codex — PASS in actual browser runtime
Module: `js/v016-rare-vfx.js`.

Important integration fix:
- A headless Chromium run against the **exact generated GitHub Pages artifact** found that the old V0.12 Visual Bridge could overwrite the first V0.16 rare preview wrapper.
- Symptom: many new rare entries fell back to the generic purple-star preview despite static coverage tests passing.
- Fix: `js/v016-rare-vfx.js?v=016dev-audit-r2` now loads as the **final visual wrapper after `skill-codex.js`, `visual-bridge.js`, `v013-summon-power-feedback.js` and `v013-rule-feedback.js`**.
- `tests/v016-final-audit-smoke.js` now enforces this exact order.

Post-fix browser evidence:
- 140 actual Codex cards/canvases
- split = 80 skill / 28 Hợp Đạo / 12 Siêu Cấp / 10 Thần Kỹ / 10 Thần Bí Kỹ
- all 20 rare previews produce 20 distinct rendered pixel hashes at the same timestamp
- visual contact-sheet inspection confirms mechanic-specific compositions rather than the old generic fallback
- zero page exceptions / console errors during tested flows

## Layered rare ordering — CI LOCKED
New integration test: `tests/v016-layering-smoke.js`.

It uses the real public rare-module order and locks:
- Mua Chuộc ally is excluded from Thời Đình freeze and later reverts normally
- Thiên Ấn checks dodge before consuming its 12s per-enemy block cooldown
- armed Đảo Nhân Quả resolves before Nợ Máu / Ký Sinh / Thế Mệnh
- Nợ Máu + Ký Sinh + Thế Mệnh exact ordering after shield handling
- when Thế Mệnh dies, that death legitimately counts as a kill and therefore clears 15% of current Nợ Máu
- Bất Tử Nhất Tức remains the final once-per-run lethal safety net when earlier rules do not prevent death

## Automated balance/release validation — COMPLETE
`tests/v016-balance-simulation.js` uses deterministic PRNG samples.
Latest audited result:
- synthetic one-roll-per-level Lv8–60: **4.58 rare successes/run average** before duplicate/pool exhaustion
- 400,000 Vô Hạn starting-rare samples across 20 slots: **1.07% maximum slot-frequency drift**

These are implementation-consistency checks, not a final fun/difficulty judgment.

## Exact Pages-artifact Chromium validation — PASS
Desktop 1440×1000:
- registry 80 / 28 / 12 / 20
- Bách Khoa = 140 cards
- Vô Hạn reveal → starter → gameplay works
- starter and normal-level reroll each work once independently
- 10 repeated Vô Hạn starts all reached gameplay with exactly one starting rare
- no page-level horizontal overflow

Synthetic rendering regression indicators:
- 240 deliberately visible enemies + 199 representative combat VFX + all 20 rares owned: ~3.46 ms/draw over 120 draws in headless Chromium
- mobile portrait 390×844 with 120 deliberately visible enemies: ~1.64 ms/draw over 120 draws

Mobile viewport checks:
- portrait 390×844: main menu, Bách Khoa, Vô Hạn reveal, starter modal, reroll and gameplay stay within page width
- landscape 844×390: gameplay and pause modal stay within page width and controls remain visible

These draw timings are **not physical-device FPS claims**.

## Current CI gate
Before Pages deploy:
1. syntax-check `js/*.js` + `tests/*.js`
2. A1/A2/A3/A4 smoke
3. base80 + public script-order integration
4. rare curve / multi-rare / reroll / icon compatibility
5. actual rare chain = 20 total / 10+10
6. rare mechanic smoke
7. layered rare ordering smoke
8. Hợp Đạo B1/B2 + registry = 28
9. Siêu Cấp C1 + registry = 12
10. Vô Hạn guaranteed starting rare + public integration
11. final content/truth audit = 140 + final visual wrapper order
12. deterministic rare-rate balance simulation
13. 20-rare Codex/live VFX stress

# Immediate next checkpoint — physical-device V0.16 release check
Do not start another major content expansion yet.

Only a short human/physical-device judgment remains before renaming `V0.16 DEV` to final `V0.16`:
- one desktop run long enough to judge pacing/readability and confirm V0.8 movement still feels unchanged
- one real phone/tablet check for touch comfort, browser safe areas, actual emoji/font rendering and hardware FPS

Exact evidence/checklist: `V016_RELEASE_VALIDATION.md`.

## Recommended continuation prompt
`Tiếp tục VGpro9X/auto-battle-roguelite. GitHub main là master. Đọc README.md, PROJECT_HANDOFF.md, ROADMAP.md và V016_RELEASE_VALIDATION.md. V0.16 DEV đã đạt đủ 80 Kỹ Năng + 28 Hợp Đạo + 12 Siêu Cấp + 20 rare = 140 Codex entries. Final CI, layered rare ordering, exact Pages-artifact Chromium validation, 20 distinct rare previews và desktop/mobile viewport stress đều pass. Chỉ còn physical-device feel check trước khi đổi nhãn thành V0.16 final. Fetch file trước khi sửa, giữ Movement V0.8 và mechanical truth.`
