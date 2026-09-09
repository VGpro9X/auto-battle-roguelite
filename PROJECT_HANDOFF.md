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
  - **12 Siêu Cấp**
  - **20 rare rules = 10 Thần Kỹ + 10 Thần Bí Kỹ**
  - **140 Codex entries**
- V0.16 content target is fully reached; remaining work is audit/balance/device validation before release.
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

CI exercises B1/B2 mechanics and asserts exactly **28 unique Hợp Đạo Kỹ** in the public chain.

## 12 Siêu Cấp — COMPLETE
New C1 layer:
1. Vạn Ảnh Phân Thân (`phantomLegion`) — base Dư Ảnh
2. Thiên La Địa Võng (`heavenNet`) — base Địa Lôi Phù
3. Huyết Võng (`bloodWeb`) — base Huyết Liên
4. Tinh Hà Trụy Lạc (`starfallCataclysm`) — base Tinh Vẫn

Implementation:
- `js/v016-evolutions-c1.js`
- `js/v016-evolutions-c1-compat.js`

Important exact rules:
- Vạn Ảnh Phân Thân creates 3 active clones; each fires 2 evolved shots at 70% of the current Lv-based Dư Ảnh shot damage.
- Thiên La Địa Võng raises active-rune cap to 8; detonation chains armed runes within 120px after 0.12s; chained runes deal 75% normal rune damage and can propagate the chain.
- Huyết Võng links the 4 nearest enemies for 5s; one target taking damage copies 25% actual damage to each other living web target with no recursion/procs.
- Tinh Hà Trụy Lạc creates 3 meteors spaced by 0.18s; side impacts are offset 38px and deal 70% of the first meteor while preserving burn.
- Existing B1/B2 Hợp Đạo interactions remain active after evolution.

CI validates C1 mechanics and the combined public evolution registry at exactly **12 Siêu Cấp**.

## Cross-platform icon compatibility — COMPLETE
`js/v016-run-systems.js` replaces unsupported newer emoji with stable symbols. Remaining U+1FA70..U+1FAFF icons fall back to `◆`.

## Rare System V2 — COMPLETE at mechanic level
- **20 rare rules = 10 Thần Kỹ + 10 Thần Bí Kỹ**.
- Multiple different rares can coexist; duplicates are forbidden.
- Offer curve: Lv1–7 0%; Lv8 1%; +0.35 percentage point/level; cap 12%.
- Maximum one rare card in one 3-card roll; uniform among unowned rares.
- One `XOAY LẠI` per choice screen rerolls all three cards and rare roll.
- Current public rare chain and difficult rare mechanics are CI-gated.

## Vô Hạn guaranteed starting rare — COMPLETE
Module: `js/v016-endless-starting-rare.js`.

Flow:
1. fresh Vô Hạn run resets normally
2. selects one of all 20 rare rules uniformly
3. grants it immediately
4. shows a dedicated tier/icon/name/exact-description reveal
5. after acknowledgement, opens exactly one normal starter Kỹ Năng choice
6. the granted rare is excluded from later offers only as an owned duplicate
7. the other 19 rare rules remain available through the normal level-scaled offer curve

The mode card and Cách chơi disclose the rule. CI checks all 20 equal probability intervals, reveal-before-starter order, later rare availability, and public script order.

## Current CI gate
Before Pages deploy:
1. syntax-check `js/*.js` + `tests/*.js`
2. A1/A2/A3/A4 smoke
3. base80 + script-order integration
4. rare curve / multi-rare / reroll / icon compatibility
5. actual rare chain = 20 total / 10+10
6. rare mechanic smoke
7. Hợp Đạo B1/B2 smoke + registry = 28
8. Siêu Cấp C1 smoke + registry = 12
9. Vô Hạn guaranteed starting rare smoke + public integration

# Immediate next checkpoint — final V0.16 audit
1. Codex representation/count = 140
2. dedicated preview/live feedback audit for all 20 rare rules
3. mechanical-truth audit: every cooldown/cap/stack/target limit disclosed
4. cross-platform icon audit
5. repeated rare-rate simulation
6. repeated Vô Hạn start simulation
7. dense VFX/late-game stress validation
8. phone + desktop real-device check

No new content expansion should begin until this audit is complete.

## Recommended continuation prompt
`Tiếp tục VGpro9X/auto-battle-roguelite. GitHub main là master. Đọc README.md, PROJECT_HANDOFF.md và ROADMAP.md. V0.16 DEV đã đạt đủ 80 Kỹ Năng + 28 Hợp Đạo + 12 Siêu Cấp + 20 rare = 140 Codex entries. Vô Hạn đã có guaranteed starting rare và CI pass. Tiếp tục final Codex/VFX/mechanical-truth/balance/device audit. Fetch file trước khi sửa, giữ Movement V0.8 và mechanical truth.`
