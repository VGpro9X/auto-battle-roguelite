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
- V0.16 content and automated audit are complete. Remaining release gate is hands-on desktop + phone/device validation.
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

## Final rare VFX/Codex audit — COMPLETE at code/CI level
Module: `js/v016-rare-vfx.js`.
- all 20 rare IDs have dedicated Codex preview coverage
- all 20 rare IDs have live feedback coverage
- original four keep V0.13 bespoke live feedback
- 16 V0.16 additions receive trigger/persistent feedback in the new module
- public script order loads this wrapper before Codex initialization
- 360-frame synthetic live/persistent VFX stress passes and transient effects prune correctly

## Automated balance/release validation — COMPLETE
`tests/v016-balance-simulation.js` uses deterministic PRNG samples.
Latest CI result:
- synthetic one-roll-per-level Lv8–60: **4.58 rare successes/run average** before duplicate/pool exhaustion
- 400,000 Vô Hạn starting-rare samples across 20 slots: **1.07% maximum slot-frequency drift**

These are implementation-consistency checks, not a final fun/difficulty judgment.

## Current CI gate
Before Pages deploy:
1. syntax-check `js/*.js` + `tests/*.js`
2. A1/A2/A3/A4 smoke
3. base80 + public script-order integration
4. rare curve / multi-rare / reroll / icon compatibility
5. actual rare chain = 20 total / 10+10
6. rare mechanic smoke
7. Hợp Đạo B1/B2 + registry = 28
8. Siêu Cấp C1 + registry = 12
9. Vô Hạn guaranteed starting rare + public integration
10. final content/truth audit = 140
11. deterministic rare-rate balance simulation
12. 20-rare Codex/live VFX stress

Latest full gate passed and GitHub Pages deployed successfully.

# Immediate next checkpoint — hands-on V0.16 release validation
Do not start another content expansion yet. Use `V016_RELEASE_VALIDATION.md`.

Required before renaming `V0.16 DEV` to final `V0.16`:
- desktop browser hands-on run
- phone/tablet hands-on run
- all 140 Codex entries visually inspectable
- all 20 rare previews visually distinct enough in practice
- Vô Hạn reveal → starter flow feel test
- reroll starter + normal level-up touch/mouse test
- dense late-game VFX/FPS/readability judgment
- difficult interaction spot-checks, especially Nợ Máu + Ký Sinh + Thế Mệnh and four new Siêu Cấp + matching Hợp Đạo

## Recommended continuation prompt
`Tiếp tục VGpro9X/auto-battle-roguelite. GitHub main là master. Đọc README.md, PROJECT_HANDOFF.md, ROADMAP.md và V016_RELEASE_VALIDATION.md. V0.16 DEV đã đạt 80 Kỹ Năng + 28 Hợp Đạo + 12 Siêu Cấp + 20 rare = 140 Codex entries. Final content/truth audit, rare VFX stress, balance simulation và Pages deploy đều pass. Chỉ còn hands-on desktop/phone release validation trước khi đổi nhãn thành V0.16 final. Fetch file trước khi sửa, giữ Movement V0.8 và mechanical truth.`
