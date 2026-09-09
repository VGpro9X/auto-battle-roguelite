# Auto Battle Roguelite

Released/visible version label: **V0.15 – Responsive & Mobile/Desktop Readability**  
Active development on `main`: **V0.16 – Skill Expansion & Rare Rule Expansion**

A browser-based auto-battle survival roguelite built around unrestricted cross-archetype skill combinations. GitHub `main` is canonical and GitHub Pages is the primary public test surface.

Public build: `https://vgpro9x.github.io/auto-battle-roguelite/`

## Current `main` / Pages content
V0.16 base expansion is already live in the development build while the visible version label intentionally remains V0.15 until the whole V0.16 release is complete.

- **80 base Kỹ Năng**
- **20 Hợp Đạo Kỹ**
- **8 Siêu Cấp**
- **4 unique rare rule skills**: 2 Thần Kỹ + 2 Thần Bí Kỹ
- **112 Codex entries** currently

Current rare rules:
- Mua Chuộc — Thần Bí Kỹ
- Đổi Mệnh — Thần Bí Kỹ
- Bất Tử Nhất Tức — Thần Kỹ
- Thiên Phạt — Thần Kỹ

Current run rule still allows at most one owned Thần Kỹ/Thần Bí Kỹ.

## Game modes
- 5 minutes — 3 starter skill picks
- 10 minutes — 2 starter skill picks
- 15 minutes — 1 starter skill pick
- 20 minutes — 1 starter skill pick
- Vô Hạn — currently 1 normal starter skill; V0.16 will add the guaranteed random Thần Kỹ/Thần Bí Kỹ reveal before this pick

## Locked development rules
### Movement
**V0.8 Strategic Movement AI** remains the player-movement baseline. Do not rewrite it unless explicitly requested.

### Terminology
Player-facing language remains Vietnamese:
- Kỹ Năng
- Hợp Đạo Kỹ
- Siêu Cấp
- Thần Kỹ / Thần Bí Kỹ
- TỐI ĐA

### Mechanical truth
- no silent caps
- no hidden cooldowns
- no undocumented stack maxima / target limits / retry rules
- any intentional restriction must appear in the Vietnamese player description

### Level-up clarity
Partial Hợp Đạo/Siêu Cấp progress stays only in **BỘ KỸ NĂNG & LIÊN KẾT**. A choice card shows a relation hint only when that exact choice immediately unlocks the Hợp Đạo Kỹ or Siêu Cấp.

### Test safety
Executable test harnesses must never ship in the playable build. CI tests live under `tests/`; GitHub Pages copies only `index.html`, `css/`, and `js/`.

## Completed milestones
### V0.12
- explicit visual identity/Codex scenes for the original 64 base skills

### V0.13
- combat readability, hit/crit/status feedback
- visible summon actors
- Hợp Đạo/Siêu Cấp signatures
- rare-rule live feedback

### V0.14
- code-drawn player, enemy and elite presentation
- no player movement/stat rewrite

### V0.15
- responsive phone/tablet/desktop HUD and menus
- safe areas and modern mobile viewport handling
- mobile BỘ KỸ NĂNG drawer
- responsive level-up/result/settings/pause screens
- touch-first Codex flow
- portrait/landscape handling
- accepted by the user on a real phone through GitHub Pages

Detailed V0.15 record: `V015_STATUS.md`.

# V0.16 active development
Design contract: `V016_SKILL_DESIGN.md`.

Target if all content passes quality gates:
- base Kỹ Năng: **64 → 80** ✅
- Hợp Đạo Kỹ: **20 → 28**
- Siêu Cấp: **8 → 12**
- rare rule skills: **4 → 12**
  - Thần Kỹ 2 → 6
  - Thần Bí Kỹ 2 → 6
- Codex: **96 → 124**

## Checkpoint 1 — design lock: COMPLETE
All 16 base skills, 8 Hợp Đạo Kỹ, 4 Siêu Cấp and 8 rare additions are specified with exact mechanics, limits and visual intent.

## Checkpoint 2 — 16 new base Kỹ Năng: COMPLETE
### A1 — `js/v016-skills-a1.js`
- Dư Ảnh
- Địa Lôi Phù
- Huyết Liên
- Linh Châu

### A2 — `js/v016-skills-a2.js`
- Bộ Pháp Chấn
- Trói Hồn
- Hồi Phong Nhận
- Tinh Vẫn

### A3 — `js/v016-skills-a3.js`
- Hộ Pháp Mộc Nhân
- Hàn Kính
- Tĩnh Tâm
- Thất Tinh Kích

### A4 — `js/v016-skills-a4.js`
- Lôi Trường
- Hồn Đăng
- Phá Giáp
- Thời Vực

All 16 additions have:
- implemented mechanics
- truthful Vietnamese descriptions
- live Canvas feedback
- dedicated Codex visual identities
- normal level-up/Codex integration
- non-shipping smoke coverage

A narrow enemy combat-target hook was added to `js/game.js` for Hộ Pháp Mộc Nhân. It does not alter `chooseMovementDirection()` or the V0.8 player movement algorithm.

CI now syntax-checks `js/` + `tests/` and runs A1, A2, A3 and A4 smoke suites before Pages deploy. The final A4-loaded build passed every gate and deployed successfully.

## Immediate next checkpoint — 8 Hợp Đạo Kỹ
- Vạn Ảnh Xạ
- Trọng Lực Phù Trận
- Huyết Mạch Cộng Sinh
- Linh Châu Dưỡng Mệnh
- Phong Lôi Bộ
- Phong Hồn Tử Ấn
- Thiên Hỏa Tinh Vẫn
- Hộ Pháp Phản Chấn

Then: 4 Siêu Cấp → 8 new Thần Kỹ/Thần Bí Kỹ → Vô Hạn guaranteed starting rare/reveal → full Codex/VFX/mechanical-truth/balance/device validation.

## V0.16 Vô Hạn rule — locked
At V0.16, every Vô Hạn run must:
1. uniformly select exactly one random rare from the full valid Thần Kỹ/Thần Bí Kỹ pool
2. grant it before the normal starter Kỹ Năng
3. show a dedicated tier/icon/name/exact-description reveal
4. after acknowledgement, show exactly one normal starter choice
5. consume the run's one rare slot
6. never roll another rare later in that Vô Hạn run

Timed modes keep their current rare-offer behavior. No hidden weighting.

## Project continuity
- `PROJECT_HANDOFF.md` — canonical continuation context
- `ROADMAP.md` — current forward plan
- `V015_STATUS.md` — responsive release validation
- `V016_SKILL_DESIGN.md` — V0.16 implementation contract

Before editing an existing file, fetch its latest GitHub content/SHA. Commit after each meaningful checkpoint. Prefer GitHub Pages for playtesting.
