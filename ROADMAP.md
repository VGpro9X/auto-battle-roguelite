# Auto Battle Roguelite — Roadmap

GitHub `main` is the canonical source.

## Current baseline
- Current release: **V0.15 – Responsive & Mobile/Desktop Readability**
- V0.15 real-phone GitHub Pages test was accepted by the user.
- Movement baseline remains **V0.8 Strategic Movement AI** and must not be rewritten unless explicitly requested.
- Current shipped content: 64 base Kỹ Năng, 20 Hợp Đạo Kỹ, 8 Siêu Cấp, 4 rare rule skills.
- Player-facing language remains Vietnamese.
- Mechanical truth, no-hidden-cap and final-piece-only level-up hint rules remain locked.

---

# V0.15 — COMPLETE

Completed work:
- responsive foundation with safe areas and modern mobile viewport sizing
- full mobile gameplay HUD
- mobile build-tracker drawer rather than feature removal
- responsive level-up / pause / settings / result / mode screens
- leaderboard keeps all fields on mobile
- Bách Khoa Kỹ Năng uses touch-first catalog → detail navigation on compact screens
- portrait + landscape handling
- `visualViewport` and `visibilitychange` mobile polish
- user hands-on phone acceptance through GitHub Pages

Detailed record: `V015_STATUS.md`.

V0.15 did not change movement, combat balance or skill mechanics.

---

# V0.16 — ACTIVE
## Skill Expansion & Rare Rule Expansion

Implementation contract: `V016_SKILL_DESIGN.md`.

## Release target, subject to quality
- Base Kỹ Năng: **64 → 80** (+16)
- Hợp Đạo Kỹ: **20 → 28** (+8)
- Siêu Cấp: **8 → 12** (+4)
- Rare rule skills: **4 → 12** (+8)
  - Thần Kỹ: 2 → 6
  - Thần Bí Kỹ: 2 → 6
- Codex: **96 → 124** entries if every target ships

These are targets, not quotas. A duplicated or weak skill should be cut or redesigned rather than shipped only to satisfy a number.

## Checkpoint 1 — Design lock — COMPLETE
`V016_SKILL_DESIGN.md` defines every proposed addition with:
- implementation key / name / tier
- Vietnamese player description contract
- exact trigger/cooldown/duration/limit
- tags
- visual identity
- intended interactions
- balance role

Design-locked new base skills:
1. Dư Ảnh
2. Địa Lôi Phù
3. Huyết Liên
4. Linh Châu
5. Bộ Pháp Chấn
6. Trói Hồn
7. Hồi Phong Nhận
8. Tinh Vẫn
9. Hộ Pháp Mộc Nhân
10. Hàn Kính
11. Tĩnh Tâm
12. Thất Tinh Kích
13. Lôi Trường
14. Hồn Đăng
15. Phá Giáp
16. Thời Vực

Design-locked new Hợp Đạo Kỹ:
1. Vạn Ảnh Xạ
2. Trọng Lực Phù Trận
3. Huyết Mạch Cộng Sinh
4. Linh Châu Dưỡng Mệnh
5. Phong Lôi Bộ
6. Phong Hồn Tử Ấn
7. Thiên Hỏa Tinh Vẫn
8. Hộ Pháp Phản Chấn

Design-locked new Siêu Cấp:
1. Vạn Ảnh Phân Thân
2. Thiên La Địa Võng
3. Huyết Võng
4. Tinh Hà Trụy Lạc

Design-locked new Thần Kỹ:
- Thiên Mệnh
- Phán Quyết
- Thiên Hộ
- Thần Vực

Design-locked new Thần Bí Kỹ:
- Hoán Vị
- Nghịch Lưu
- Đảo Nhân Quả
- Đồng Giá

## Checkpoint 2 — Base skill implementation — ACTIVE NEXT
Implement in four small batches:

### Batch A1
- Dư Ảnh
- Địa Lôi Phù
- Huyết Liên
- Linh Châu

### Batch A2
- Bộ Pháp Chấn
- Trói Hồn
- Hồi Phong Nhận
- Tinh Vẫn

### Batch A3
- Hộ Pháp Mộc Nhân
- Hàn Kính
- Tĩnh Tâm
- Thất Tinh Kích

### Batch A4
- Lôi Trường
- Hồn Đăng
- Phá Giáp
- Thời Vực

Every batch must include mechanics + truthful description + basic live VFX + syntax/runtime exercise before moving on.

## Checkpoint 3 — 8 Hợp Đạo Kỹ
- Implement behavior-changing interactions from the design contract.
- Do not add partial-progress hints to level-up cards.
- Explicitly route sources so ordinary base effects do not masquerade as Hợp Đạo triggers.

## Checkpoint 4 — 4 Siêu Cấp
- Implement visible power spikes stronger than one ordinary Hợp Đạo Kỹ.
- Each gets dedicated live signature and Codex preview.

## Checkpoint 5 — 8 new Thần Kỹ / Thần Bí Kỹ
- Rare skills remain level-less, unique and rule-like.
- Keep the current one-rare-owned-per-run rule.
- Every activation must be visually unmistakable.

## Checkpoint 6 — Vô Hạn starting rare rule
When a Vô Hạn run begins:
1. uniformly choose exactly one rare skill from the full valid rare pool
2. grant it before the normal starter Kỹ Năng choice
3. show a dedicated reveal overlay with icon, tier, name and exact description
4. after acknowledgement, continue to the existing single starter-skill choice
5. the granted rare consumes the run's one rare slot
6. no later rare offer appears during that Vô Hạn run
7. timed modes keep the current rare-offer system

No hidden weighting is allowed unless later explicitly designed and documented.

## Checkpoint 7 — Codex / visuals / truth audit
- add every shipped entry to Codex
- update counts and filters
- add dedicated rare-rule previews
- verify all descriptions against implementation
- verify every cap/cooldown/stack limit is disclosed

## Checkpoint 8 — Balance / stress / device validation
Test:
- all new base skills
- all new Hợp Đạo Kỹ
- all new Siêu Cấp
- every Thần Kỹ and Thần Bí Kỹ
- repeated Vô Hạn starts
- no duplicate rare grants
- dense late-game VFX on phone and desktop
- Codex count consistency
- GitHub Pages phone playtest before final V0.16 release

## V0.16 release gate
Do not call V0.16 complete until every shipped skill has:
1. implemented mechanics
2. truthful Vietnamese description
3. Codex entry
4. readable live feedback
5. syntax/runtime validation
6. at least one mechanic exercise

---

# After V0.16
Run a focused balance pass before another large expansion:
- compare old vs new practical value
- identify weak/invisible Hợp Đạo Kỹ
- verify Siêu Cấp still feels special
- evaluate whether one rare per run remains correct
- evaluate Vô Hạn difficulty after guaranteed starting rare

Only then consider V0.17+ systems such as bosses, advanced/super synergies, additional enemy archetypes, meta progression or expansion toward 100+ base skills.
