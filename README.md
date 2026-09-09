# Auto Battle Roguelite

Public development version: **V0.16 DEV**  
Released baseline: **V0.15 – Responsive & Mobile/Desktop Readability**

Browser-based auto-battle survival roguelite built around unrestricted cross-archetype skill combinations.

Public build: `https://vgpro9x.github.io/auto-battle-roguelite/`

GitHub `main` is canonical.

## Current main / Pages content
- **80 base Kỹ Năng**
- **20 Hợp Đạo Kỹ**
- **8 Siêu Cấp**
- **20 rare rules**: 10 Thần Kỹ + 10 Thần Bí Kỹ
- **128 current Codex entries** = 80 + 20 + 8 + 20

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

### Cross-platform icon compatibility
`js/v016-run-systems.js` replaces newer emoji that may render as square boxes on older Windows/Android emoji fonts with stable symbols. Known fixes include Xuyên Phá, Tham Lam, Trói Hồn, Hồi Phong Nhận, Hộ Pháp Mộc Nhân and Hàn Kính.

## V0.16 final content target
- base Kỹ Năng: **80** ✅
- Hợp Đạo Kỹ: **28**
- Siêu Cấp: **12**
- rare rules: **20** ✅
- final Codex target: **140 entries** = 80 + 28 + 12 + 20

The older `124` target was an arithmetic error and is obsolete.

Rare-system V2 design: `V016_RARE_SYSTEM_V2.md`.
Base/Hợp Đạo/Siêu Cấp contract: `V016_SKILL_DESIGN.md`.

## Game modes
- 5 minutes — 3 starter skill picks
- 10 minutes — 2 starter skill picks
- 15 minutes — 1 starter skill pick
- 20 minutes — 1 starter skill pick
- Vô Hạn — currently normal starter flow; V0.16 will additionally guarantee one random rare reveal before the starter choice

The revised Vô Hạn rule will still allow later rare offers through the normal level-scaled curve; the guaranteed starting rare only becomes ineligible as a duplicate.

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

All have real mechanics, truthful Vietnamese descriptions, live Canvas feedback, Codex identities and CI smoke coverage. A3's Hộ Pháp only uses a narrow hostile combat-target hook; V0.8 player movement remains unchanged.

### Rare System V2 — COMPLETE at mechanic level
- 20 unique rare rules are implemented and registered before Codex.
- Current public script chain is tested to produce exactly 10 Thần Kỹ + 10 Thần Bí Kỹ.
- Reroll, level-scaled rare chance, duplicate prevention and multi-rare ownership are CI-gated.
- R3/R4 smoke tests exercise the difficult mechanics including Thiên Tứ, Thời Đình, Thiên Ấn, Nợ Máu, Ký Sinh, Hư Thực and Thế Mệnh.

Dedicated visual polish for every new rare remains part of the final V0.16 VFX/Codex audit.

## Immediate next content checkpoint
8 new Hợp Đạo Kỹ:
- Vạn Ảnh Xạ
- Trọng Lực Phù Trận
- Huyết Mạch Cộng Sinh
- Linh Châu Dưỡng Mệnh
- Phong Lôi Bộ
- Phong Hồn Tử Ấn
- Thiên Hỏa Tinh Vẫn
- Hộ Pháp Phản Chấn

Then: 4 Siêu Cấp → Vô Hạn guaranteed starting rare reveal → full Codex/VFX/mechanical-truth/balance/device audit.

## CI
Before every Pages deploy, GitHub Actions checks:
- syntax across `js/` and `tests/`
- A1/A2/A3/A4 mechanics
- 80-skill integration and public script order
- rare chance curve + multiple rare ownership
- reroll and icon compatibility
- actual public 20-rare chain = 10 + 10
- final rare mechanic smoke suite

## Project continuity
- `PROJECT_HANDOFF.md`
- `ROADMAP.md`
- `V015_STATUS.md`
- `V016_SKILL_DESIGN.md`
- `V016_RARE_SYSTEM_V2.md`

Before editing an existing file, fetch its latest GitHub content/SHA and commit after each meaningful checkpoint.
