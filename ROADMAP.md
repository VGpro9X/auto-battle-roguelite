# Auto Battle Roguelite — Roadmap

GitHub `main` is canonical.

## Current baseline
- Released baseline: **V0.15 – Responsive & Mobile/Desktop Readability**.
- Active public development label: **V0.16 DEV**.
- Current main/Pages content: **80 Kỹ Năng + 20 Hợp Đạo Kỹ + 8 Siêu Cấp + 4 rare = 112 Codex entries**.
- Movement baseline remains **V0.8 Strategic Movement AI**; do not rewrite unless explicitly requested.
- Player-facing language remains Vietnamese.
- Mechanical truth, no-hidden-cap and final-piece-only Hợp Đạo/Siêu Cấp hint rules remain locked.

Read before V0.16 work:
1. `PROJECT_HANDOFF.md`
2. `V016_SKILL_DESIGN.md`
3. `V016_RARE_SYSTEM_V2.md`

---

# V0.15 — COMPLETE
Responsive phone/tablet/desktop UI was accepted by the user on GitHub Pages.

---

# V0.16 — ACTIVE
## Final quality target
- Base Kỹ Năng: **64 → 80** ✅
- Hợp Đạo Kỹ: **20 → 28**
- Siêu Cấp: **8 → 12**
- Rare rule skills: **4 → 20**
  - Thần Kỹ: **2 → 10**
  - Thần Bí Kỹ: **2 → 10**
- Correct final Codex target: **140 entries** = 80 + 28 + 12 + 20.

The old `124` target was an arithmetic error and is obsolete.

## Checkpoint 1 — Design lock — COMPLETE
Base/Hợp Đạo/Siêu Cấp design contract: `V016_SKILL_DESIGN.md`.
Rare-system V2 and expanded 20-rare target: `V016_RARE_SYSTEM_V2.md`.

## Checkpoint 2 — 16 new base Kỹ Năng — COMPLETE
A1 through A4 are implemented, live and CI-gated:
- A1: Dư Ảnh, Địa Lôi Phù, Huyết Liên, Linh Châu
- A2: Bộ Pháp Chấn, Trói Hồn, Hồi Phong Nhận, Tinh Vẫn
- A3: Hộ Pháp Mộc Nhân, Hàn Kính, Tĩnh Tâm, Thất Tinh Kích
- A4: Lôi Trường, Hồn Đăng, Phá Giáp, Thời Vực

All 80 base skills are in the dynamic level-up/Codex pool. V0.8 player movement remains unchanged.

## Checkpoint 2.5 — Run-system polish — COMPLETE, awaiting user feel test
### Cross-platform icon compatibility
`js/v016-run-systems.js` replaces newer U+1FAxx emoji that render as square boxes on some Windows/Android font stacks with stable symbols. Known mappings include Xuyên Phá, Tham Lam, Trói Hồn, Hồi Phong Nhận, Hộ Pháp Mộc Nhân, Hàn Kính and wing-like icons.

### Multiple rare acquisition + level-scaled chance
The old one-rare-per-run rule is removed.
- Lv.1–7: 0%
- Lv.8: 1%
- +0.35 percentage point each level
- cap 12% per roll
- one rare card maximum per three-card roll
- only unowned rares are eligible
- no maximum number of different rares per run

### One reroll per choice screen
Every starter/level-up choice screen has exactly one **XOAY LẠI**.
- refreshes all three cards
- performs a fresh rare roll
- allowance does not carry over
- using reroll consumes it for that screen only

The exact rare chance is displayed on level-up screens and documented in Cách chơi.

CI covers syntax, A1–A4, base80 integration and rare/reroll rules before Pages deploy.

## Checkpoint 3 — 8 Hợp Đạo Kỹ — NEXT
1. Vạn Ảnh Xạ
2. Trọng Lực Phù Trận
3. Huyết Mạch Cộng Sinh
4. Linh Châu Dưỡng Mệnh
5. Phong Lôi Bộ
6. Phong Hồn Tử Ấn
7. Thiên Hỏa Tinh Vẫn
8. Hộ Pháp Phản Chấn

Requirements: behavior-changing interactions, explicit source routing, final-piece-only choice hints, live/Codex identity and CI mechanic coverage.

## Checkpoint 4 — 4 Siêu Cấp
- Vạn Ảnh Phân Thân
- Thiên La Địa Võng
- Huyết Võng
- Tinh Hà Trụy Lạc

## Checkpoint 5 — Implement 16 new rare rules
### New Thần Kỹ
- Thiên Mệnh
- Phán Quyết
- Thiên Hộ
- Thần Vực
- Thiên Tứ
- Thời Đình
- Thiên Lệnh
- Thiên Ấn

### New Thần Bí Kỹ
- Hoán Vị
- Nghịch Lưu
- Đảo Nhân Quả
- Đồng Giá
- Nợ Máu
- Ký Sinh
- Hư Thực
- Thế Mệnh

Together with the original 4, this yields **10 Thần Kỹ + 10 Thần Bí Kỹ**.

## Checkpoint 6 — Vô Hạn guaranteed starting rare
Vô Hạn must:
1. uniformly grant exactly one random rare from the full valid 20-skill pool before the normal starter choice
2. show a dedicated reveal overlay with tier/icon/name/exact description
3. continue to exactly one normal starter Kỹ Năng after acknowledgement
4. exclude the granted rare from future offers because duplicates are forbidden
5. **still allow later rare offers** through the normal level-scaled curve

No hidden weighting.

## Checkpoint 7 — Codex / VFX / mechanical-truth audit
- all entries represented
- count must equal shipped content
- every rare has dedicated preview/live feedback
- every cooldown/cap/stack/target limit disclosed
- cross-platform icon audit

## Checkpoint 8 — Balance / stress / device validation
- repeated rare-rate simulations
- repeated Vô Hạn starts
- dense VFX on phone and desktop
- reroll flow on starter and normal level-ups
- final GitHub Pages real-device test

## V0.16 release gate
Every shipped mechanic needs truthful Vietnamese description, live feedback, Codex representation where applicable, syntax/runtime validation and at least one mechanic exercise.

---

# After V0.16
Run a focused balance pass before another major expansion; then consider bosses, advanced Hợp Đạo layers, additional enemy archetypes, meta progression or expansion toward 100+ base skills.
