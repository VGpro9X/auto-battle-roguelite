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

## V0.16 run-system changes already live
### Multiple rare rules per run
The old one-rare-per-run limit is removed. Different Thần Kỹ/Thần Bí Kỹ can coexist; duplicates cannot.

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

The exact current rare chance is shown on the level-up screen and documented in Cách chơi.

### Vô Hạn guaranteed starting rare
Every Vô Hạn run now:
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

## V0.16 completed development
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

The combined registry is CI-gated at exactly **28 unique Hợp Đạo Kỹ** and both B modules load before Codex.

### 4 new Siêu Cấp — COMPLETE
- Vạn Ảnh Phân Thân
- Thiên La Địa Võng
- Huyết Võng
- Tinh Hà Trụy Lạc

The public registry is CI-gated at exactly **12 Siêu Cấp**. The new evolutions preserve their already-unlocked Hợp Đạo interactions and have dedicated live/Codex identities.

### Rare System V2 — COMPLETE at mechanic level
- 20 unique rare rules are implemented and registered before Codex.
- Current public script chain is tested to produce exactly 10 Thần Kỹ + 10 Thần Bí Kỹ.
- Reroll, level-scaled rare chance, duplicate prevention and multi-rare ownership are CI-gated.

Dedicated visual polish for every new rare remains part of the final V0.16 VFX/Codex audit.

## Immediate next checkpoint
Full V0.16 audit and release validation:
- Codex count/representation audit
- dedicated VFX/live feedback audit for all 20 rare rules
- mechanical-truth audit for cooldowns/caps/stack/target limits
- repeated rare-rate and Vô Hạn-start simulations
- dense late-game stress test
- phone + desktop real-device verification

## CI
Before every Pages deploy, GitHub Actions checks:
- syntax across `js/` and `tests/`
- A1/A2/A3/A4 mechanics
- 80-skill integration and public script order
- rare chance curve + multiple rare ownership
- reroll and icon compatibility
- actual public 20-rare chain = 10 + 10
- final rare mechanic smoke suite
- Hợp Đạo B1/B2 mechanics and combined registry = 28
- Siêu Cấp C1 mechanics and combined registry = 12
- Vô Hạn guaranteed starting rare flow and public script order

## Project continuity
- `PROJECT_HANDOFF.md`
- `ROADMAP.md`
- `V015_STATUS.md`
- `V016_SKILL_DESIGN.md`
- `V016_RARE_SYSTEM_V2.md`

Before editing an existing file, fetch its latest GitHub content/SHA and commit after each meaningful checkpoint.
