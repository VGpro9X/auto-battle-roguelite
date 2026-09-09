# Auto Battle Roguelite — Roadmap

GitHub `main` is canonical.

## Current baseline
- Released baseline: **V0.15 – Responsive & Mobile/Desktop Readability**.
- Active public development label: **V0.16 DEV — RELEASE CANDIDATE**.
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

# V0.16 — RELEASE CANDIDATE
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

## Checkpoint 7 — Codex / VFX / mechanical-truth audit — COMPLETE
Code/CI and the exact generated Pages artifact have both been validated.

- all 140 entries represented ✅
- all 20 rare rules have dedicated Codex preview and live-feedback coverage ✅
- hidden generic rare retry timing removed ✅
- only explicitly disclosed retry rules allowed; Thế Mệnh declares `retryCooldown: 1.25` matching its description ✅
- final-piece-only relation-hint regression gate passes ✅
- test harnesses excluded from Pages artifact ✅
- zero JavaScript page exceptions / console errors in tested browser flows ✅

A real browser integration bug was found and fixed during this checkpoint: V0.12 Visual Bridge could overwrite the V0.16 rare preview wrapper, causing generic purple-star previews. `js/v016-rare-vfx.js?v=016dev-audit-r2` now loads as the final visual wrapper after Codex/Visual Bridge/V0.13 feedback, and CI enforces that order. Post-fix Chromium rendering produced **20 distinct pixel hashes for the 20 rare previews** at the same timestamp. ✅

## Checkpoint 8 — Balance / stress / device validation — BROWSER/AUTOMATED COMPLETE, PHYSICAL DEVICE PENDING
Automated and exact Pages-artifact validation now includes:
- deterministic rare-rate simulation ✅
- 400,000-sample Vô Hạn 20-way uniformity simulation ✅
- 20 dedicated rare preview runtime stress ✅
- rare live/persistent VFX 360-frame stress/pruning test ✅
- layered rare ordering integration test ✅
- 10 repeated browser Vô Hạn starts: reveal → starter → gameplay ✅
- starter and normal-level reroll each independently limited to one use ✅
- desktop 1440×1000 browser layout/runtime ✅
- mobile portrait 390×844 viewport layout/runtime ✅
- mobile landscape 844×390 viewport layout/runtime ✅
- synthetic dense visible rendering on desktop/mobile ✅

Latest deterministic sample:
- Lv8–60 synthetic one-roll-per-level model: **4.58 rare successes/run average** before duplicate/pool exhaustion
- Vô Hạn 20-way starting rare: **1.07% maximum slot-frequency drift** over 400,000 samples

Headless Chromium draw regression indicators:
- desktop: 240 deliberately visible enemies + 199 representative VFX + all 20 rares owned ≈ **3.46 ms/draw** over 120 draws
- mobile portrait viewport: 120 deliberately visible enemies ≈ **1.64 ms/draw** over 120 draws

These timings are not physical-device FPS claims.

### Layered mechanics now CI-locked
- Mua Chuộc ally exclusion/reversion with Thời Đình
- Thiên Ấn dodge-before-block ordering
- Đảo Nhân Quả priority over Nợ Máu / Ký Sinh / Thế Mệnh
- Nợ Máu + Ký Sinh + Thế Mệnh exact post-shield ordering
- Thế Mệnh proxy death correctly counts as a kill and therefore clears 15% current Nợ Máu
- Bất Tử Nhất Tức remains the final once-per-run lethal safety net
- all four new Siêu Cấp preserve their matching Hợp Đạo interactions

### Only remaining release gate
Before renaming the visible/runtime build from `V0.16 DEV` to final `V0.16`, perform a short physical-device/human feel check:
- one desktop play session long enough to judge pacing, readability and accepted V0.8 movement feel
- one real phone/tablet session to judge touch ergonomics, browser chrome/safe areas, actual emoji/font rendering and hardware FPS

Exact checklist/evidence: `V016_RELEASE_VALIDATION.md`.

## V0.16 release gate
Do not rename the public build to final `V0.16` until the physical-device check has no blocking issue. Runtime/content/CI/browser-artifact validation is otherwise release-candidate complete.

---

# After V0.16
Run a focused balance pass before another major expansion; then consider bosses, advanced Hợp Đạo layers, additional enemy archetypes, meta progression or expansion toward 100+ base skills.
