# Auto Battle Roguelite — Roadmap

GitHub `main` is the canonical source.

## Current baseline
- Released/visible baseline: **V0.15 – Responsive & Mobile/Desktop Readability**
- V0.15 real-phone GitHub Pages test was accepted by the user.
- V0.16 development is active on `main`; the release label stays V0.15 until V0.16 passes its full release gate.
- Current `main` / Pages development content: **80 base Kỹ Năng**, 20 Hợp Đạo Kỹ, 8 Siêu Cấp, 4 rare rule skills = **112 Codex entries**.
- Movement baseline remains **V0.8 Strategic Movement AI** and must not be rewritten unless explicitly requested.
- Player-facing language remains Vietnamese.
- Mechanical truth, no-hidden-cap and final-piece-only level-up hint rules remain locked.

---

# V0.15 — COMPLETE
Detailed release record: `V015_STATUS.md`.

Completed:
- safe-area / `dvh` / `svh` responsive foundation
- complete mobile HUD
- mobile build-tracker drawer instead of feature removal
- responsive level-up, pause, settings, result and mode screens
- leaderboard preserves all fields
- touch-first mobile Codex catalog → detail flow
- portrait + landscape handling
- `visualViewport` / `visibilitychange` polish
- real-phone user acceptance through GitHub Pages

V0.15 did not change combat balance or V0.8 movement AI.

---

# V0.16 — ACTIVE
## Skill Expansion & Rare Rule Expansion

Implementation contract: `V016_SKILL_DESIGN.md`.

### Release target, subject to quality
- Base Kỹ Năng: **64 → 80** (+16) ✅
- Hợp Đạo Kỹ: **20 → 28** (+8)
- Siêu Cấp: **8 → 12** (+4)
- Rare rule skills: **4 → 12** (+8)
  - Thần Kỹ: 2 → 6
  - Thần Bí Kỹ: 2 → 6
- Codex: **96 → 124** if all targets pass quality gates

Targets are not quotas; weak/duplicated content should be cut or redesigned.

## Checkpoint 1 — Design lock — COMPLETE
All proposed additions have exact names/keys, Vietnamese mechanic contracts, cooldowns/limits, tags, visual intent and interaction roles in `V016_SKILL_DESIGN.md`.

## Checkpoint 2 — Base skill implementation — COMPLETE

### Batch A1 — COMPLETE
`js/v016-skills-a1.js`
- Dư Ảnh
- Địa Lôi Phù
- Huyết Liên
- Linh Châu

### Batch A2 — COMPLETE
`js/v016-skills-a2.js`
- Bộ Pháp Chấn
- Trói Hồn
- Hồi Phong Nhận
- Tinh Vẫn

### Batch A3 — COMPLETE
`js/v016-skills-a3.js`
- Hộ Pháp Mộc Nhân
- Hàn Kính
- Tĩnh Tâm
- Thất Tinh Kích

A3 introduced only a narrow hostile combat-target hook in `game.js` for Hộ Pháp. Player V0.8 movement logic remains unchanged.

### Batch A4 — COMPLETE
`js/v016-skills-a4.js`
- Lôi Trường
- Hồn Đăng
- Phá Giáp
- Thời Vực

### Checkpoint 2 validation
All four batches include:
- implemented mechanics
- truthful Vietnamese descriptions
- live Canvas feedback
- dedicated Codex visual profile/scene identity
- normal dynamic level-up/Codex integration
- non-shipping smoke tests under `tests/`

CI before every Pages deploy now performs:
1. JavaScript syntax checks across `js/` and `tests/`
2. A1 smoke
3. A2 smoke
4. A3 smoke
5. A4 smoke

The A4-loaded build passed all checks and Pages deployment successfully. Test files do not ship because Pages copies only `index.html`, `css/`, and `js/`.

## Checkpoint 3 — 8 Hợp Đạo Kỹ — ACTIVE NEXT
Implement:
1. **Vạn Ảnh Xạ (`afterimageEcho`)** — Dư Ảnh + Ảnh Xạ
2. **Trọng Lực Phù Trận (`gravityRune`)** — Địa Lôi Phù + Hắc Vực
3. **Huyết Mạch Cộng Sinh (`bloodSymbiosis`)** — Huyết Liên + Huyết Chạm
4. **Linh Châu Dưỡng Mệnh (`nourishingPearls`)** — Linh Châu + Linh Dưỡng
5. **Phong Lôi Bộ** — Bộ Pháp Chấn + Lôi Kích
6. **Phong Hồn Tử Ấn** — Trói Hồn + Tử Ấn
7. **Thiên Hỏa Tinh Vẫn** — Tinh Vẫn + Hỏa Cầu Định Kỳ
8. **Hộ Pháp Phản Chấn** — Hộ Pháp Mộc Nhân + Phản Chấn

Requirements:
- each must change interaction/behavior rather than add a filler flat percentage
- explicit source routing
- ordinary base effects must not visually masquerade as Hợp Đạo effects
- preserve final-piece-only choice hints
- add readable live signature and Codex visibility
- add non-shipping mechanic exercises to CI

## Checkpoint 4 — 4 Siêu Cấp
- Vạn Ảnh Phân Thân
- Thiên La Địa Võng
- Huyết Võng
- Tinh Hà Trụy Lạc

Each must be a visible power spike stronger than one ordinary Hợp Đạo Kỹ and receive dedicated live/Codex feedback.

## Checkpoint 5 — 8 new rare rule skills
New Thần Kỹ:
- Thiên Mệnh
- Phán Quyết
- Thiên Hộ
- Thần Vực

New Thần Bí Kỹ:
- Hoán Vị
- Nghịch Lưu
- Đảo Nhân Quả
- Đồng Giá

Rare skills remain level-less, unique and rule-like. Current one-owned-rare-per-run rule remains unless explicitly redesigned later.

## Checkpoint 6 — Vô Hạn starting rare rule
When a Vô Hạn run begins:
1. uniformly choose exactly one rare skill from the full valid pool
2. grant it before the normal starter Kỹ Năng choice
3. show dedicated tier/icon/name/description reveal
4. after acknowledgement, continue to exactly one normal starter choice
5. starting rare consumes the run's rare slot
6. no later rare offer in that Vô Hạn run
7. timed modes retain the existing rare-offer system

No hidden weighting.

## Checkpoint 7 — Codex / visuals / mechanical-truth audit
- all shipped entries represented
- counts and filters correct
- every rare gets a dedicated preview
- descriptions match source exactly
- every cap/cooldown/stack limit disclosed

## Checkpoint 8 — Balance / stress / device validation
Test all new base skills, Hợp Đạo, Siêu Cấp and rare rules; repeated Vô Hạn starts; dense VFX on phone/desktop; count consistency; final GitHub Pages phone playtest.

## V0.16 release gate
Every shipped skill needs:
1. implemented mechanics
2. truthful Vietnamese description
3. Codex entry
4. readable live feedback
5. syntax/runtime validation
6. at least one mechanic exercise

---

# After V0.16
Run a focused balance pass before another major expansion. Then consider V0.17+ systems such as bosses, advanced/super synergies, additional enemy archetypes, meta progression or expansion toward 100+ base skills.
