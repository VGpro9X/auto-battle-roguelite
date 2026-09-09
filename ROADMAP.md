# Auto Battle Roguelite — Roadmap

GitHub `main` is canonical.

## Current baseline
- Released baseline: **V0.15 – Responsive & Mobile/Desktop Readability**.
- Active public development label: **V0.16 DEV**.
- Current main/Pages content: **80 Kỹ Năng + 28 Hợp Đạo Kỹ + 12 Siêu Cấp + 20 rare = 140 Codex entries**.
- Movement baseline remains **V0.8 Strategic Movement AI**; do not rewrite unless explicitly requested.
- Player-facing language remains Vietnamese.
- Mechanical truth, no-hidden-cap and final-piece-only Hợp Đạo/Siêu Cấp hint rules remain locked.

Read before V0.16 work:
1. `PROJECT_HANDOFF.md`
2. `V016_SKILL_DESIGN.md`
3. `V016_RARE_SYSTEM_V2.md`
4. `V016_RELEASE_VALIDATION.md`

---

# V0.15 — COMPLETE
Responsive phone/tablet/desktop UI was accepted by the user on GitHub Pages.

---

# V0.16 — ACTIVE, CONTENT + AUTOMATED AUDIT COMPLETE
## Final quality target
- Base Kỹ Năng: **64 → 80** ✅
- Hợp Đạo Kỹ: **20 → 28** ✅
- Siêu Cấp: **8 → 12** ✅
- Rare rule skills: **4 → 20** ✅
  - Thần Kỹ: **2 → 10** ✅
  - Thần Bí Kỹ: **2 → 10** ✅
- Codex content target: **140 entries** = 80 + 28 + 12 + 20 ✅

## Checkpoint 1 — Design lock — COMPLETE
Base/Hợp Đạo/Siêu Cấp design contract: `V016_SKILL_DESIGN.md`.  
Rare-system V2 and 20-rare target: `V016_RARE_SYSTEM_V2.md`.

## Checkpoint 2 — 16 new base Kỹ Năng — COMPLETE
A1 through A4 are implemented, live and CI-gated:
- A1: Dư Ảnh, Địa Lôi Phù, Huyết Liên, Linh Châu
- A2: Bộ Pháp Chấn, Trói Hồn, Hồi Phong Nhận, Tinh Vẫn
- A3: Hộ Pháp Mộc Nhân, Hàn Kính, Tĩnh Tâm, Thất Tinh Kích
- A4: Lôi Trường, Hồn Đăng, Phá Giáp, Thời Vực

## Checkpoint 2.5 — Run-system / rare expansion — COMPLETE
- icon compatibility
- multiple different rare rules per run
- level-scaled rare chance: Lv8 1%, +0.35 percentage point/level, cap 12%
- one `XOAY LẠI` per choice screen
- full 20-rare pool = 10 Thần Kỹ + 10 Thần Bí Kỹ
- CI coverage for difficult rare mechanics and public rare chain

## Checkpoint 3 — 8 Hợp Đạo Kỹ — COMPLETE
B1:
1. Vạn Ảnh Xạ
2. Trọng Lực Phù Trận
3. Huyết Mạch Cộng Sinh
4. Linh Châu Dưỡng Mệnh

B2:
5. Phong Lôi Bộ
6. Phong Hồn Tử Ấn
7. Thiên Hỏa Tinh Vẫn
8. Hộ Pháp Phản Chấn

All are behavior-changing interactions with explicit source routing, live/Codex identity and mechanic smoke tests. CI asserts exactly **28 unique Hợp Đạo Kỹ** in the public chain.

## Checkpoint 4 — 4 Siêu Cấp — COMPLETE
- **Vạn Ảnh Phân Thân** — Dư Ảnh TỐI ĐA + TIME ×3 + SUMMON ×3
- **Thiên La Địa Võng** — Địa Lôi Phù TỐI ĐA + AREA ×3 + EXPLOSION ×3 + CONTROL ×2
- **Huyết Võng** — Huyết Liên TỐI ĐA + BLOOD ×3 + CHAIN ×3
- **Tinh Hà Trụy Lạc** — Tinh Vẫn TỐI ĐA + FIRE ×2 + AREA ×3 + EXPLOSION ×3

C1 mechanics preserve the matching Hợp Đạo interactions and are CI-gated. Public integration asserts exactly **12 Siêu Cấp**.

## Checkpoint 5 — 20 rare rules — COMPLETE
Original 4 + 16 new rare rules are implemented. Rare mechanics, multi-rare ownership and public 10+10 registry are CI-gated.

## Checkpoint 6 — Vô Hạn guaranteed starting rare — COMPLETE
Vô Hạn now:
1. uniformly grants exactly one random rare from the full 20-skill pool before the normal starter choice
2. shows a dedicated reveal overlay with tier/icon/name/exact description
3. continues to exactly one normal starter Kỹ Năng after acknowledgement
4. excludes the granted rare from future offers because duplicates are forbidden
5. still allows later rare offers through the normal level-scaled curve

The mode card and Cách chơi disclose the rule. CI validates equal interval mapping across all 20 candidates, reveal-before-starter ordering and public script order.

## Checkpoint 7 — Codex / VFX / mechanical-truth audit — COMPLETE at code/CI level
- all 140 entries represented ✅
- all 20 rare rules have dedicated Codex preview coverage ✅
- all 20 rare rules have live feedback coverage ✅
- original four rare live cues remain from V0.13; V0.16 additions use `js/v016-rare-vfx.js` ✅
- hidden generic rare retry timing removed ✅
- only explicitly disclosed retry rules are allowed; Thế Mệnh declares `retryCooldown: 1.25` matching its description ✅
- public script order/cache keys audited ✅
- tests are excluded from Pages artifact ✅
- final-piece-only relation-hint regression gate passes ✅

## Checkpoint 8 — Balance / stress / device validation — AUTOMATED PART COMPLETE, HANDS-ON PENDING
Automated release gates now include:
- deterministic rare-rate simulation ✅
- 400,000-sample Vô Hạn 20-way uniformity simulation ✅
- 20 dedicated rare preview runtime stress ✅
- rare live/persistent VFX 360-frame stress/pruning test ✅
- full Pages deployment after every gate ✅

Latest deterministic sample reported:
- Lv8–60 synthetic one-roll-per-level model: **4.58 rare successes/run average** before duplicate/pool exhaustion
- Vô Hạn 20-way starting rare: **1.07% maximum slot-frequency drift**

Remaining before renaming `V0.16 DEV` to final `V0.16`:
- desktop browser hands-on playtest
- phone/tablet hands-on playtest
- dense late-game visual/FPS judgment
- real touch/layout judgment
- spot-check difficult layered mechanics

Exact checklist: `V016_RELEASE_VALIDATION.md`.

## V0.16 release gate
Do not rename the public build to final `V0.16` until the hands-on checklist is clear. Every shipped mechanic needs truthful Vietnamese description, live feedback, Codex representation where applicable, syntax/runtime validation and at least one mechanic exercise.

---

# After V0.16
Run a focused balance pass before another major expansion; then consider bosses, advanced Hợp Đạo layers, additional enemy archetypes, meta progression or expansion toward 100+ base skills.
