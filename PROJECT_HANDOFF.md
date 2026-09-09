# Auto Battle Roguelite — Project Handoff

Use this file as the starting context when continuing development in a new chat.

## Master source
- Repository: `VGpro9X/auto-battle-roguelite`
- Default branch: `main`
- Repository is public; GitHub `main` is canonical.
- Public URL: `https://vgpro9x.github.io/auto-battle-roguelite/`
- Pages workflow: `.github/workflows/pages.yml`
- Before editing an existing file, fetch current GitHub content + blob SHA.
- Commit after each meaningful checkpoint.

Read first:
1. `README.md`
2. `PROJECT_HANDOFF.md`
3. `ROADMAP.md`
4. `BALANCE_BASELINE_V016.md`
5. `V016_RELEASE_VALIDATION.md`
6. `V016_SKILL_DESIGN.md`
7. `V016_RARE_SYSTEM_V2.md`

## Current state
- Released baseline: **V0.16 – Skill Expansion & Rare System V2**.
- Runtime/public label: **V0.16**.
- Current main/Pages content:
  - **80 base Kỹ Năng**
  - **28 Hợp Đạo Kỹ**
  - **12 Siêu Cấp**
  - **20 rare rules = 10 Thần Kỹ + 10 Thần Bí Kỹ**
  - **140 Codex entries**
- V0.16 content, CI audit, exact Pages-artifact Chromium validation and hands-on user sign-off are complete.
- Post-release **focused balance pass** is active; B1.1 environmental pressure baseline is complete and CI-gated. No gameplay balance numbers have been changed yet.
- Next checkpoint: B1.2 reproducible fixed-build measurement scenarios.
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

# V0.16 released content

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

# V0.16 validation status — RELEASED

## Rare VFX/Codex — PASS in actual browser runtime
Module: `js/v016-rare-vfx.js`.

Important integration fix:
- A headless Chromium run against the exact generated GitHub Pages artifact found that the old V0.12 Visual Bridge could overwrite the first V0.16 rare preview wrapper.
- Symptom: many new rare entries fell back to the generic purple-star preview despite static coverage tests passing.
- Fix: `js/v016-rare-vfx.js?v=016dev-audit-r2` loads as the final visual wrapper after `skill-codex.js`, `visual-bridge.js`, `v013-summon-power-feedback.js` and `v013-rule-feedback.js`.
- `tests/v016-final-audit-smoke.js` enforces this exact order.

Post-fix browser evidence:
- 140 actual Codex cards/canvases
- split = 80 skill / 28 Hợp Đạo / 12 Siêu Cấp / 10 Thần Kỹ / 10 Thần Bí Kỹ
- all 20 rare previews produce 20 distinct rendered pixel hashes at the same timestamp
- visual contact-sheet inspection confirms mechanic-specific compositions rather than the old generic fallback
- zero page exceptions / console errors during tested flows

## Layered rare ordering — CI LOCKED
Integration test: `tests/v016-layering-smoke.js`.

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

## Hands-on release sign-off
The user accepted the current GitHub Pages release candidate after hands-on testing and reported no blocking issue. Runtime/public label is final **V0.16**.

# Post-release balance pass

## B1.1 Environmental pressure baseline — COMPLETE
Files:
- `BALANCE_BASELINE_V016.md`
- `tests/balance-baseline-v016.js`

CI now freezes the released V0.16 environment baseline before any tuning.

Key facts:
- timed-mode expected total spawns = **662.3 / 1324.7 / 1987.0 / 2649.4** for 5/10/15/20 minutes
- timed modes share the same normalized spawn-density curve; pressure changes HP/damage
- timed end-state nominal spawn pressure = **361.4 enemies/min**, 20% elites, 0.27s spawn cooldown
- Endless reaches 0.20s spawn cooldown + 72% extra-spawn cap around 20m, producing ~**606.7 enemies/min** while HP/damage continue increasing

These are model expectations, not real player clear counts.

## B1.2 — NEXT
Create reproducible fixed-build scenarios for offense, defense, summon/control and rare-heavy builds. Measure build-vs-pressure metrics before any balance number changes.

Required metrics:
- kills/minute and clear percentage
- player level progression
- incoming HP damage / shield absorption
- survival time
- active enemy/projectile/VFX density
- build outliers across base/Hợp Đạo/Siêu Cấp/rare layers

## Current CI gate
Before Pages deploy:
1. syntax-check `js/*.js` + `tests/*.js`
2. V0.16 content/mechanic suites
3. layered rare ordering smoke
4. 140-content/final visual wrapper audit
5. rare-rate/VFX stress
6. **released V0.16 pressure baseline**
7. Pages artifact/deploy

## Recommended continuation prompt
`Tiếp tục VGpro9X/auto-battle-roguelite. GitHub main là master. Đọc README.md, PROJECT_HANDOFF.md, ROADMAP.md và BALANCE_BASELINE_V016.md. V0.16 đã release chính thức. Focused Balance Pass B1.1 environmental pressure baseline đã complete và CI-gated, chưa đổi gameplay numbers. Tiếp tục B1.2 fixed-build scenarios; đo lường trước khi chỉnh, giữ Movement V0.8 và mechanical truth.`
