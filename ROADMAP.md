# Auto Battle Roguelite — Roadmap

GitHub `main` is canonical.

## Current baseline
- Released baseline: **V0.16 – Skill Expansion & Rare System V2**.
- Current public/runtime label: **V0.16**.
- Current main/Pages content: **80 Kỹ Năng + 28 Hợp Đạo Kỹ + 12 Siêu Cấp + 20 rare = 140 Codex entries**.
- Movement baseline remains **V0.8 Strategic Movement AI**; do not rewrite unless explicitly requested.
- Player-facing language remains Vietnamese.
- Mechanical truth, no-hidden-cap and final-piece-only Hợp Đạo/Siêu Cấp hint rules remain locked.

Read before work:
1. `PROJECT_HANDOFF.md`
2. `BALANCE_BASELINE_V016.md`
3. `V016_RELEASE_VALIDATION.md`
4. `V016_SKILL_DESIGN.md`
5. `V016_RARE_SYSTEM_V2.md`

---

# V0.15 — COMPLETE
Responsive phone/tablet/desktop UI was accepted by the user on GitHub Pages.

---

# V0.16 — COMPLETE / RELEASED
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
Vô Hạn:
1. uniformly grants exactly one random rare from the full 20-skill pool before the normal starter choice
2. shows a dedicated reveal overlay with tier/icon/name/exact description
3. continues to exactly one normal starter Kỹ Năng after acknowledgement
4. excludes the granted rare from future offers because duplicates are forbidden
5. still allows later rare offers through the normal level-scaled curve

## Checkpoint 7 — Codex / VFX / mechanical-truth audit — COMPLETE
- all 140 entries represented ✅
- all 20 rare rules have dedicated Codex preview and live-feedback coverage ✅
- hidden generic rare retry timing removed ✅
- only explicitly disclosed retry rules allowed; Thế Mệnh declares `retryCooldown: 1.25` matching its description ✅
- final-piece-only relation-hint regression gate passes ✅
- test harnesses excluded from Pages artifact ✅
- zero JavaScript page exceptions / console errors in tested browser flows ✅
- final rare VFX wrapper ordering fixed and CI-enforced ✅

## Checkpoint 8 — Balance / stress / device validation — COMPLETE FOR RELEASE
Validation included:
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
- user hands-on sign-off with no blocking issue ✅

V0.16 was promoted from `V0.16 DEV` to final **V0.16** after this sign-off.

---

# Next phase — FOCUSED BALANCE PASS
Do **not** begin another major content expansion yet.

## Goal
Use reproducible scenarios and run data to identify actual outliers before changing numbers. Preserve the feel of accepted systems unless evidence shows a problem.

## Checkpoint B1 — Baseline measurement — ACTIVE
### B1.1 Environment/pressure baseline — COMPLETE
Frozen in:
- `BALANCE_BASELINE_V016.md`
- `tests/balance-baseline-v016.js`

The test is now part of the Pages CI gate. No gameplay number was changed.

Released V0.16 pressure anchors:
- timed-mode expected total spawns: **662.3 / 1324.7 / 1987.0 / 2649.4** for 5/10/15/20 minutes
- all timed modes share the same normalized spawn-density curve; mode pressure changes HP/damage rather than spawn density
- timed modes end at nominal **361.4 spawns/min**, 20% elite chance and 0.27s spawn cooldown
- Endless reaches the **0.20s spawn-cooldown floor** and **72% extra-spawn cap** around 20 minutes, giving a nominal **606.7 spawns/min** thereafter while HP/damage continue scaling

These are pressure-model expectations, not actual player kill counts.

### B1.2 Fixed-build scenarios — NEXT
Establish reproducible offense, defense, summon/control and rare-heavy scenarios against the frozen pressure baseline and record:
- kills/minute and clear percentage
- player level progression
- incoming HP damage / shield absorption
- survival time
- active enemy/projectile/VFX density
- major base/Hợp Đạo/Siêu Cấp/rare outliers

Do not change balance numbers until these scenarios produce evidence.

## Checkpoint B2 — Targeted tuning
Only after B1 evidence:
- tune clearly over/under-performing base skills
- tune Hợp Đạo/Siêu Cấp power spikes if needed
- inspect rare frequency/value versus the current level-scaled curve
- inspect timed-mode difficulty progression and Vô Hạn scaling separately
- prefer small isolated changes with CI regression tests

## Checkpoint B3 — Validation
- rerun the same B1 scenarios after changes
- compare before/after metrics
- hands-on Pages check for pacing/readability
- keep V0.8 player movement unchanged unless explicitly requested

Possible later expansion directions after the balance pass: bosses, advanced Hợp Đạo layers, additional enemy archetypes, meta progression or expansion toward 100+ base skills.
