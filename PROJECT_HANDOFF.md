# Auto Battle Roguelite — Project Handoff

Use this file as the starting context when continuing development in a new chat.

## Master source
- Repository: `VGpro9X/auto-battle-roguelite`
- Default branch: `main`
- Repository is public; GitHub is canonical.
- Primary playable test URL: `https://vgpro9x.github.io/auto-battle-roguelite/`
- Pages workflow: `.github/workflows/pages.yml`
- Before editing an existing file, fetch its current GitHub version and blob SHA.
- Commit after every meaningful checkpoint.

Read before development:
1. `README.md`
2. `PROJECT_HANDOFF.md`
3. `ROADMAP.md`
4. `V016_SKILL_DESIGN.md`

## Current released baseline
- **V0.15 – Responsive & Mobile/Desktop Readability**
- V0.15 was tested by the user on a real phone via GitHub Pages and accepted.
- Movement baseline remains **V0.8 Strategic Movement AI**; do not rewrite it unless explicitly requested.
- Released V0.15 content was 64 base Kỹ Năng, 20 Hợp Đạo Kỹ, 8 Siêu Cấp and 4 rare rule skills.
- V0.16 development is active on `main`; the visible/runtime release label remains V0.15 until V0.16 release is finished.

## Locked rules
### Terminology
- Base: **Kỹ Năng**
- Synergy: **Hợp Đạo Kỹ**
- Evolution: **Siêu Cấp**
- Rare rule: **Thần Kỹ / Thần Bí Kỹ**
- MAX: **TỐI ĐA**
- Do not expose raw English tier labels/tags in player-facing UI.

### Mechanical truth
- No silent caps, hidden cooldowns, hidden stack maxima, hidden target limits or undocumented retry rules.
- Any intentional restriction in code must be stated in the Vietnamese player description.
- Preserve the V0.12 removal of the old hidden shield cap.
- Preserve the corrected Săn Ấn description: +25% base XP from marked targets only.

### Level-up clarity
Partial Hợp Đạo/Siêu Cấp progress belongs only in **BỘ KỸ NĂNG & LIÊN KẾT**.
Choice cards only show a hint when that exact pick immediately completes the unlock:
- `CHỌN → MỞ HỢP ĐẠO KỸ: <Tên>`
- `CHỌN → ĐẠT SIÊU CẤP: <Tên>`
Do not restore partial-progress card hints.

### Test safety
- Never embed executable validation/test harness code in `index.html`, `css/` or `js/` playable output.
- CI tests live under `tests/`; the Pages workflow deploys only `index.html`, `css/` and `js/`, so tests do not ship.

## Visual / UI milestones already complete
- V0.12: explicit visual profiles + Codex scenes for original 64 base skills.
- V0.13: combat readability, hit/crit/status feedback, summon actors, Hợp Đạo/Siêu Cấp and rare-rule live feedback.
- V0.14: player/enemy/elite Canvas presentation without movement/stat changes.
- V0.15: safe-area responsive HUD, mobile build drawer, responsive modals, touch-first Codex, portrait/landscape handling and phone acceptance.

## Current rare rule skills shipped before V0.16
- Mua Chuộc — Thần Bí Kỹ
- Đổi Mệnh — Thần Bí Kỹ
- Bất Tử Nhất Tức — Thần Kỹ
- Thiên Phạt — Thần Kỹ

Known non-blocking detail: Đổi Mệnh emits two `divine_trigger` events on success; only the event carrying `enemy` drives the detailed tether. Do not change unless an observed problem appears.

# V0.16 — ACTIVE
Full design contract: `V016_SKILL_DESIGN.md`.

Target, subject to quality:
- base Kỹ Năng 64 → 80
- Hợp Đạo Kỹ 20 → 28
- Siêu Cấp 8 → 12
- rare rule skills 4 → 12 (6 Thần Kỹ + 6 Thần Bí Kỹ total)
- Codex 96 → 124

## Checkpoint 1 — COMPLETE: design lock
All 16 base skills, 8 Hợp Đạo Kỹ, 4 Siêu Cấp and 8 new rare rule skills are specified in `V016_SKILL_DESIGN.md` with exact mechanics/numbers/visual intent.

## Batch A1 — COMPLETE
Integration file: `js/v016-skills-a1.js`

Implemented base skills:
1. **Dư Ảnh (`afterimage`)** — temporary visible clone, two delayed shots, `allowProcs:false`.
2. **Địa Lôi Phù (`runeMine`)** — player-position trap, explicit arm/lifetime/trigger/explosion/knockback/active-cap behavior.
3. **Huyết Liên (`bloodLink`)** — links two nearest hostiles and mirrors the documented percentage of actual dealt damage without recursion.
4. **Linh Châu (`spiritPearl`)** — actual healing charges stored pearls; stored-cap behavior is disclosed; pearls fire on 2.2s cadence.

A1 also provides dedicated live Canvas identities and Codex scene/profile entries for all four skills. Because base skills are read dynamically from `skills`, the four additions enter the normal level-up/Codex pipeline without modifying V0.8 movement.

Current late script order:
1. `js/skill-codex.js`
2. `js/ui.js`
3. `js/v015-responsive.js`
4. `js/evolution-hint-fix.js`
5. `js/game.js`
6. `js/v014-character-enemy-presentation.js`
7. `js/v016-skills-a1.js`
8. `js/visual-bridge.js`
9. `js/v013-summon-power-feedback.js`
10. `js/v013-rule-feedback.js`

This places A1 live actors/effects above the V0.14 actor layer and below the V0.13 hit/crit/rule feedback layers.

### A1 validation
- GitHub Actions now syntax-checks all JavaScript before Pages deployment.
- `tests/v016-a1-smoke.js` is a non-shipping Node smoke test.
- Smoke test exercises all four A1 mechanics.
- Latest A1 CI pass confirmed:
  - JavaScript syntax check ✅
  - A1 smoke test ✅
  - Pages artifact/deploy ✅
- Movement V0.8 was not modified.
- Level-up final-piece-only hint logic was re-audited and remains intact in `js/evolution-hint-fix.js`.
- New A1 tags are already translated by `js/localization.js`.

Important A1 commits:
- `cad7b9b21f17c4ce4a4d93ce3240d8265b370750` — add A1 module
- `a1f13b5c6e5247dd9d954465dc49477d2fa2b571` — load A1 module
- `eecd18cc4b098aa80db4b3ba5cc4e39b43712d25` — add JS syntax gate
- `6daa38c019664d918e8d1a34102dbbf216add08d` — add non-shipping A1 smoke test
- `4be9e8b05ba5e6413cc6a198bd3cf2050fde8942` — run smoke test in CI
- `76da4c64e2ff54e5f67880c34719ce98ac615bb2` — correct test acquisition cadence; final A1 CI/deploy passed

## V0.16 Vô Hạn rule — LOCKED for later checkpoint
At V0.16, Vô Hạn must:
1. uniformly select exactly one random Thần Kỹ/Thần Bí Kỹ from the full valid rare pool
2. grant it before the normal starter Kỹ Năng
3. show a dedicated reveal overlay with tier/icon/name/exact description
4. continue to exactly one normal starter choice after acknowledgement
5. consume the run's one rare slot
6. never offer another rare in that Vô Hạn run
Timed modes retain the current rare-offer system. No hidden weighting.

## Immediate next checkpoint — Batch A2
Implement from `V016_SKILL_DESIGN.md`:
- **Bộ Pháp Chấn (`strideShock`)**
- **Trói Hồn (`soulBind`)**
- **Hồi Phong Nhận (`returnBlade`)**
- **Tinh Vẫn (`meteorSeal`)**

For A2, require mechanics + truthful Vietnamese descriptions + live visual identity + Codex identity + syntax validation + non-shipping smoke tests before calling it complete.

After A2: A3 → A4 → 8 Hợp Đạo → 4 Siêu Cấp → 8 rare rules → Vô Hạn reveal/grant → full Codex/VFX/truth/balance audit.

## Future-chat rules
1. Fetch current GitHub source before edits.
2. Commit frequently.
3. Keep V0.8 movement unchanged; skill-specific combat-side position/target logic is allowed without rewriting movement AI.
4. Preserve mechanical truth and final-piece-only hints.
5. Keep player-facing UI Vietnamese.
6. Prefer Pages for testing.
7. Keep all test harnesses outside deployed paths.

## Recommended continuation prompt
`Tiếp tục VGpro9X/auto-battle-roguelite. GitHub main là master. Đọc README.md, PROJECT_HANDOFF.md, ROADMAP.md và V016_SKILL_DESIGN.md trước. Release baseline là V0.15. V0.16 design lock và Batch A1 đã hoàn tất/CI pass. Tiếp tục Batch A2: Bộ Pháp Chấn, Trói Hồn, Hồi Phong Nhận, Tinh Vẫn. Fetch file trước khi sửa, giữ Movement V0.8, mechanical truth và final-piece-only hints, commit/test sau mỗi checkpoint.`
