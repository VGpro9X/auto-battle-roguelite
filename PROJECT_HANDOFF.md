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
5. `BALANCE_FIXED_BUILDS_V016.md`
6. `V016_RELEASE_VALIDATION.md`
7. `V016_SKILL_DESIGN.md`
8. `V016_RARE_SYSTEM_V2.md`

## Current state
- Released baseline: **V0.16 – Skill Expansion & Rare System V2**.
- Runtime/public label: **V0.16**.
- Current content:
  - **80 base Kỹ Năng**
  - **28 Hợp Đạo Kỹ**
  - **12 Siêu Cấp**
  - **20 rare rules = 10 Thần Kỹ + 10 Thần Bí Kỹ**
  - **140 Codex entries**
- V0.16 content, CI audit, exact Pages-artifact Chromium validation and user hands-on sign-off are complete.
- The post-release focused balance pass is also **complete and closed**.
- **No active development checkpoint remains. The project is ready for a new roadmap.**
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

# V0.16 released systems

## Base / Hợp Đạo / Siêu Cấp
- 80 base Kỹ Năng total.
- 28 Hợp Đạo Kỹ total.
- 12 Siêu Cấp total.
- Matching V0.16 Hợp Đạo interactions remain active after their corresponding evolutions.

## Rare System V2
- 20 unique rare rules = 10 Thần Kỹ + 10 Thần Bí Kỹ.
- Multiple different rares can coexist; duplicates cannot.
- Normal level-up rare curve:
  - Lv1–7: 0%
  - Lv8: 1%
  - +0.35 percentage point per later level
  - cap 12%
- At most one rare card per 3-card roll.
- Eligible unowned rares are selected uniformly; no hidden weighting.
- Every choice screen has exactly one `XOAY LẠI`.
- Vô Hạn grants one uniformly random rare from the full 20-rule pool before the normal starter choice; other unowned rares can still appear later.

## Mechanical-truth corrections already locked
- hidden generic failed-rare retry timing was removed
- Thế Mệnh is the explicit retry exception with `retryCooldown: 1.25`, matching its Vietnamese description
- layered rare ordering is CI-covered, including Mua Chuộc + Thời Đình, Thiên Ấn dodge-before-block, Đảo Nhân Quả priority, Nợ Máu + Ký Sinh + Thế Mệnh, and Bất Tử Nhất Tức final lethal interception

## Visual/runtime validation
- 140 actual Codex cards
- all 20 rare previews have distinct mechanic-specific visuals
- final rare visual wrapper order is CI-enforced
- no JavaScript page errors in audited browser flows
- responsive desktop/mobile Pages artifact validation passed
- user accepted the physical-device release candidate with no blocking issue

# Post-release balance pass — CLOSED

## B1.1 Pressure baseline
Files:
- `BALANCE_BASELINE_V016.md`
- `tests/balance-baseline-v016.js`

CI freezes the released environment curve. No gameplay number was changed.

## B1.2 Fixed-build scenarios
File: `BALANCE_FIXED_BUILDS_V016.md`.

Exact V0.16 Pages artifact was exercised in deterministic Chromium scenarios for offense, defense, summon/control and rare-heavy builds at 5 and 10 minutes.

10-minute summary:
- offense: ~120.3 kills/min, ~96.3% observed clear, 3/3 complete
- summon/control: ~114.0 kills/min, ~94.0% observed clear, fragile late game
- rare-heavy defensive hybrid: ~79.7 kills/min, ~64.1% observed clear, strong shield survival
- pure defense: ~11.8 kills/min, ~10.8% observed clear; reaches the analysis-only 901-living-enemy safety threshold while remaining alive

Interpretation:
- role trade-offs are clearly separated
- fixed-at-time-0 endpoint builds are intentionally artificial
- no single base/Hợp Đạo/Siêu Cấp/rare numeric value was isolated strongly enough to justify a safe nerf/buff

## B2 / B3 closure
- B2 targeted tuning: **no gameplay changes selected**
- B3 before/after validation: **not required because B2 changed nothing**
- released V0.16 gameplay values remain unchanged

# Current CI gate
Before Pages deploy, GitHub Actions checks:
1. JavaScript syntax
2. V0.16 A1–A4 mechanics
3. base80 integration/public order
4. rare curve/reroll/content/mechanics
5. layered rare ordering
6. 28 Hợp Đạo integration
7. 12 Siêu Cấp integration
8. Vô Hạn starting rare flow
9. final 140-content/truth/visual-order audit
10. rare-rate simulation
11. rare VFX stress
12. released V0.16 pressure baseline
13. Pages artifact/deploy

# Status for next conversation
**No unfinished task is carried forward.**

Do not automatically continue balance tuning or start another expansion. Wait for the user's new plan, then update `ROADMAP.md` from this clean V0.16 baseline.

## Recommended continuation prompt
`Tiếp tục VGpro9X/auto-battle-roguelite. GitHub main là master. Đọc README.md, PROJECT_HANDOFF.md và ROADMAP.md. V0.16 đã release chính thức với 80 Kỹ Năng + 28 Hợp Đạo + 12 Siêu Cấp + 20 rare = 140 Codex entries. Post-release balance pass cũng đã đóng: pressure baseline + fixed-build scenarios complete, không có gameplay tuning vì chưa có bằng chứng đủ sạch. Hiện không còn checkpoint dở; chờ plan mới. Fetch file trước khi sửa, giữ Movement V0.8 và mechanical truth.`
