# Auto Battle Roguelite

Public development version: **V0.16 DEV**  
Released baseline: **V0.15 – Responsive & Mobile/Desktop Readability**

Browser-based auto-battle survival roguelite built around unrestricted cross-archetype skill combinations.

Public build: `https://vgpro9x.github.io/auto-battle-roguelite/`

GitHub `main` is canonical.

## Current main / Pages content
- **80 base Kỹ Năng**
- **28 Hợp Đạo Kỹ**
- **12 Siêu Cấp**
- **20 rare rules**: 10 Thần Kỹ + 10 Thần Bí Kỹ
- **140 Codex entries** = 80 + 28 + 12 + 20

Current Thần Kỹ:
- Bất Tử Nhất Tức
- Thiên Phạt
- Thiên Mệnh
- Phán Quyết
- Thiên Hộ
- Thần Vực
- Thiên Tứ
- Thời Đình
- Thiên Lệnh
- Thiên Ấn

Current Thần Bí Kỹ:
- Mua Chuộc
- Đổi Mệnh
- Hoán Vị
- Nghịch Lưu
- Đảo Nhân Quả
- Đồng Giá
- Nợ Máu
- Ký Sinh
- Hư Thực
- Thế Mệnh

## V0.16 run systems
### Multiple rare rules per run
Different Thần Kỹ/Thần Bí Kỹ can coexist; duplicates cannot.

### Rare chance scales with level
Per normal level-up roll:
- Lv.1–7: 0%
- Lv.8: 1%
- each later level: +0.35 percentage point
- cap: 12%

Examples: Lv20 = 5.2%, Lv30 = 8.7%, Lv40+ = 12%.

At most one rare card replaces one of the three normal cards in a single roll. Eligible rare selection is uniform among unowned rare skills; there is no hidden weighting.

### One reroll per choice screen
Every starter/level-up screen has exactly one **XOAY LẠI**:
- rerolls all three choices
- performs a fresh rare roll
- cannot be refreshed on the same screen
- does not carry over

### Vô Hạn guaranteed starting rare
Every Vô Hạn run:
1. uniformly grants exactly one random rare from the full 20-skill pool
2. shows a dedicated reveal with tier/icon/name/exact description
3. continues to exactly one normal starter Kỹ Năng after acknowledgement
4. excludes only the granted rare from later offers as an owned duplicate
5. still allows later rare offers through the normal level-scaled curve

The Vô Hạn mode card and Cách chơi disclose this rule.

### Cross-platform icon compatibility
`js/v016-run-systems.js` replaces newer emoji that may render as square boxes on older Windows/Android emoji fonts with stable symbols.

## Locked development rules
- Movement baseline: **V0.8 Strategic Movement AI**; do not rewrite unless explicitly requested.
- Player-facing language remains Vietnamese.
- No hidden caps/cooldowns/stack maxima/target limits/retry rules/weighting.
- Partial Hợp Đạo/Siêu Cấp progress stays only in **BỘ KỸ NĂNG & LIÊN KẾT**.
- Choice-card relation hints only appear when that exact choice immediately completes a Hợp Đạo Kỹ or Siêu Cấp.
- Executable test harnesses stay under `tests/`; Pages deploys only `index.html`, `css/`, `js/`.

## V0.16 completed content
### 16 new base Kỹ Năng — COMPLETE
A1: Dư Ảnh, Địa Lôi Phù, Huyết Liên, Linh Châu.  
A2: Bộ Pháp Chấn, Trói Hồn, Hồi Phong Nhận, Tinh Vẫn.  
A3: Hộ Pháp Mộc Nhân, Hàn Kính, Tĩnh Tâm, Thất Tinh Kích.  
A4: Lôi Trường, Hồn Đăng, Phá Giáp, Thời Vực.

### 8 new Hợp Đạo Kỹ — COMPLETE
B1:
- Vạn Ảnh Xạ
- Trọng Lực Phù Trận
- Huyết Mạch Cộng Sinh
- Linh Châu Dưỡng Mệnh

B2:
- Phong Lôi Bộ
- Phong Hồn Tử Ấn
- Thiên Hỏa Tinh Vẫn
- Hộ Pháp Phản Chấn

The combined registry is CI-gated at exactly **28 unique Hợp Đạo Kỹ**.

### 4 new Siêu Cấp — COMPLETE
- Vạn Ảnh Phân Thân
- Thiên La Địa Võng
- Huyết Võng
- Tinh Hà Trụy Lạc

The public registry is CI-gated at exactly **12 Siêu Cấp**. Matching Hợp Đạo interactions remain active after evolution.

### Rare System V2 — COMPLETE
- 20 unique rare rules are implemented and registered before Codex.
- Current public script chain is tested to produce exactly 10 Thần Kỹ + 10 Thần Bí Kỹ.
- Reroll, level-scaled rare chance, duplicate prevention and multi-rare ownership are CI-gated.

## V0.16 automated + browser audit — COMPLETE
### Codex / rare VFX
All 20 rare rules have dedicated Codex preview and live-feedback coverage. During exact Pages-artifact Chromium testing, a real runtime-order bug was found: V0.12 Visual Bridge could replace the first V0.16 preview wrapper and make new rare entries fall back to a generic purple-star preview.

That bug is fixed. `js/v016-rare-vfx.js?v=016dev-audit-r2` now loads as the **final visual wrapper after Codex definitions, Visual Bridge and V0.13 rule feedback**, and CI enforces that order.

Post-fix browser validation confirms:
- 140 actual Codex cards/canvases
- 80 skill / 28 Hợp Đạo / 12 Siêu Cấp / 10 Thần Kỹ / 10 Thần Bí Kỹ
- all 20 rare previews produce **20 distinct rendered pixel hashes** at the same timestamp
- zero JavaScript page exceptions / console errors in tested flows

### Mechanical truth
A hidden generic failed-rare retry interval was found during audit and removed. Failed periodic rare activations now wait the stated normal cooldown unless that specific rare explicitly declares a retry cooldown. Thế Mệnh explicitly declares `retryCooldown: 1.25`, matching its Vietnamese description.

A dedicated layered-rule CI test now locks the highest-risk ordering, including:
- Mua Chuộc + Thời Đình ally exclusion/reversion
- Thiên Ấn dodge-before-block
- Đảo Nhân Quả priority over later HP rules
- Nợ Máu + Ký Sinh + Thế Mệnh combined ordering
- Bất Tử Nhất Tức final lethal interception

### Automated balance / stress
Deterministic CI currently reports:
- synthetic one-roll-per-level Lv8–60 model: **4.58 rare successes/run average** before duplicate/pool exhaustion
- 400,000 Vô Hạn starting-rare samples: **1.07% maximum slot-frequency drift** across 20 slots
- live/persistent rare VFX passes a 360-frame synthetic stress/pruning test

Exact Pages-artifact Chromium validation additionally passed:
- 10 repeated Vô Hạn starts: reveal → starter → gameplay every time
- one reroll on starter and one independent reroll on normal level-up
- desktop 1440×1000 and mobile 390×844 / 844×390 with no document-level horizontal overflow
- synthetic dense on-screen rendering: ~3.46 ms/draw for 240 visible enemies + 199 representative VFX on desktop, ~1.64 ms/draw for 120 visible enemies on the mobile viewport in the headless environment

The timing figures are regression indicators only, **not real-device FPS claims**.

## Remaining V0.16 release gate
The runtime/content/browser-artifact side is now release-candidate quality. Only a short **physical-device feel check** remains before changing `V0.16 DEV` to final `V0.16`:
- one desktop run long enough to judge pacing/readability
- one real phone/tablet check for touch ergonomics, browser safe areas, emoji/font rendering and hardware FPS

Use `V016_RELEASE_VALIDATION.md` for the exact final checklist and recorded evidence.

## CI
Before every Pages deploy, GitHub Actions checks:
- syntax across `js/` and `tests/`
- A1/A2/A3/A4 mechanics
- 80-skill integration and public script order
- rare chance curve + multiple rare ownership
- reroll and icon compatibility
- actual public 20-rare chain = 10 + 10
- final rare mechanic smoke suite
- layered rare ordering smoke suite
- Hợp Đạo B1/B2 mechanics and combined registry = 28
- Siêu Cấp C1 mechanics and combined registry = 12
- Vô Hạn guaranteed starting rare flow and public script order
- final 140-entry content/mechanical-truth audit
- deterministic rare-rate balance simulation
- 20-rare VFX runtime stress

## Project continuity
- `PROJECT_HANDOFF.md`
- `ROADMAP.md`
- `V016_RELEASE_VALIDATION.md`
- `V015_STATUS.md`
- `V016_SKILL_DESIGN.md`
- `V016_RARE_SYSTEM_V2.md`

Before editing an existing file, fetch its latest GitHub content/SHA and commit after each meaningful checkpoint.
