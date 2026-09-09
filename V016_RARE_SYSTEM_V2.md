# V0.16 — Rare System V2

This document supersedes the old one-rare-per-run rule in `V016_SKILL_DESIGN.md`.
GitHub `main` is canonical.

## Final V0.16 rare target
- **10 Thần Kỹ**
- **10 Thần Bí Kỹ**
- **20 rare rule skills total**
- All are unique, level-less and cannot be duplicated in the same run.
- A run may own multiple different rare skills.

With the other V0.16 targets, the correct final Codex count is:
- 80 Kỹ Năng
- 28 Hợp Đạo Kỹ
- 12 Siêu Cấp
- 20 rare rule skills
- **140 total Codex entries**

The earlier `124` target was arithmeticly incorrect and must no longer be used.

---

# Rare offer probability — IMPLEMENTED SYSTEM CONTRACT

Normal level-up rare roll:
- Level 1–7: **0%**
- Level 8: **1%**
- Each level after 8: **+0.35 percentage point**
- Hard cap: **12% per roll**
- Formula: `min(12%, 1% + (level - 8) × 0.35%)`

Examples:
- Lv.8: 1.00%
- Lv.10: 1.70%
- Lv.20: 5.20%
- Lv.30: 8.70%
- Lv.40+: 12.00%

Rules:
- At most one rare card can occupy a three-card level-up roll.
- If the rare roll succeeds, one normal card is replaced by one uniformly random unowned rare.
- Owned rare skills are excluded; no duplicates.
- There is no maximum number of different rares a run may own.
- The one-per-level-up **XOAY LẠI** performs a fresh rare roll as well as three fresh card choices.
- No hidden ownership penalty or hidden weighting.

Balance intent with a player who always uses reroll:
- around Lv.20: about 0.8 rare offers expected cumulatively
- around Lv.30: about 2.2
- around Lv.40: about 4.2
This keeps early runs mostly base-skill driven while letting long/endless runs accumulate rule-changing identities.

---

# Existing 4 rare skills

## Thần Kỹ
1. Bất Tử Nhất Tức
2. Thiên Phạt

## Thần Bí Kỹ
1. Mua Chuộc
2. Đổi Mệnh

---

# Previously designed 8 additions — retained

## Thần Kỹ
3. Thiên Mệnh (`heavenlyMandate`)
4. Phán Quyết (`divineJudgment`)
5. Thiên Hộ (`heavenlyWard`)
6. Thần Vực (`divineDomain`)

## Thần Bí Kỹ
3. Hoán Vị (`spatialSwap`)
4. Nghịch Lưu (`lifeRewind`)
5. Đảo Nhân Quả (`causalInversion`)
6. Đồng Giá (`equalPrice`)

Exact mechanics for these eight remain in `V016_SKILL_DESIGN.md`.

---

# Additional 8 rare designs — NEW

## New Thần Kỹ

### 7. Thiên Tứ
- Key: `divineGift`
- Tier: `divine`
- Safe icon: `✦+`
- Description: "Mỗi lần bạn chọn một Kỹ Năng cơ bản, có 18% cơ hội kỹ năng vừa chọn lập tức tăng thêm 1 cấp miễn phí nếu sau lựa chọn nó vẫn chưa TỐI ĐA. Cấp thưởng không tiêu hao lượt chọn và vẫn có thể mở Hợp Đạo Kỹ hoặc Siêu Cấp bình thường."
- Exact rule:
  - roll once after a successful normal base-skill selection
  - chance exactly 18%
  - if selected skill reached max from the paid selection, no bonus roll is consumed into another skill; it simply does nothing
  - bonus level calls the normal skill `apply`, selection-engine update and build-unlock evaluation exactly once
  - cannot recursively trigger another Thiên Tứ bonus from its own free level
- Role: progression law; rare power through accelerated build completion rather than direct combat stats.

### 8. Thời Đình
- Key: `timeStop`
- Tier: `divine`
- Safe icon: `Ⅱ✦`
- Description: "Cứ mỗi 24 giây, thời gian của toàn bộ kẻ địch dừng trong 2 giây: chúng không di chuyển và không gây sát thương tiếp xúc, trong khi bạn, đạn và các bộ đếm kỹ năng của bạn vẫn hoạt động bình thường."
- Exact rule:
  - successful activation every 24s
  - duration exactly 2s
  - pauses hostile movement/contact attacks only
  - does not pause allied bribed enemies, player movement, projectiles, periodic timers, DOT timers or VFX clocks
- Role: true battlefield time law, distinct from slowing or cooldown acceleration.

### 9. Thiên Lệnh
- Key: `celestialEdict`
- Tier: `divine`
- Safe icon: `✦!`
- Description: "Cứ mỗi 36 giây, toàn bộ kẻ địch thường đang tồn tại mất 18% HP hiện tại; Tinh Anh mất 8% HP hiện tại. Thiên Lệnh không thể trực tiếp hạ mục tiêu xuống dưới 1 HP và không kích hoạt hiệu ứng khi đánh trúng."
- Exact rule:
  - ordinary hostile: subtract 18% current HP
  - elite hostile: subtract 8% current HP
  - floor target at 1 HP
  - allied/bribed enemies are excluded
  - `allowProcs:false`; no kill event from the edict itself
- Role: periodic global law that compresses large crowds without replacing normal kill mechanics.

### 10. Thiên Ấn
- Key: `heavenSeal`
- Tier: `divine`
- Safe icon: `◎✦`
- Description: "Đòn tiếp xúc đầu tiên mỗi kẻ địch gây lên bạn bị triệt tiêu hoàn toàn. Sau khi Thiên Ấn chặn một đòn từ kẻ địch đó, cùng kẻ địch phải chờ 12 giây mới có thể bị Thiên Ấn chặn lại."
- Exact rule:
  - per-enemy cooldown exactly 12s
  - applies only to hostile contact damage
  - block occurs before shield/HP loss
  - dodge is checked first; a naturally dodged hit does not consume that enemy's seal cooldown
  - no global cooldown
- Role: enemy-local protection law that scales differently against swarms and elites.

## New Thần Bí Kỹ

### 7. Nợ Máu
- Key: `bloodDebt`
- Tier: `mystic`
- Safe icon: `♥⌛`
- Description: "50% sát thương lẽ ra đi vào HP của bạn không mất ngay mà trở thành Nợ Máu và được trả đều trong 5 giây. Mỗi kẻ địch bị hạ xóa 15% số Nợ Máu còn lại. Sát thương đi vào khiên không tạo Nợ Máu."
- Exact rule:
  - calculate post-mitigation/post-shield HP damage first
  - 50% applies immediately, 50% becomes debt
  - debt drains linearly over 5s from each contribution
  - each kill removes exactly 15% of aggregate remaining debt
  - debt damage cannot be re-deferred by Nợ Máu
- Role: damage timing rewrite that rewards aggressive kill momentum.

### 8. Ký Sinh
- Key: `parasitePact`
- Tier: `mystic`
- Safe icon: `◎↔`
- Description: "Cứ mỗi 18 giây, ký sinh lên kẻ địch có HP hiện tại cao nhất trong 6 giây. Trong thời gian đó, 30% sát thương lẽ ra đi vào HP của bạn được chuyển sang mục tiêu ký sinh; 70% còn lại vẫn do bạn chịu. Sát thương chuyển không kích hoạt hiệu ứng khi đánh trúng."
- Exact rule:
  - excludes allied enemies
  - target = highest current HP hostile at cast time
  - duration exactly 6s
  - redirects only post-mitigation HP damage after shield handling
  - redirected damage uses `allowProcs:false`
  - if target dies, link ends immediately; no hidden retarget until next 18s cast
- Role: dangerous asymmetric damage-sharing rule.

### 9. Hư Thực
- Key: `voidReality`
- Tier: `mystic`
- Safe icon: `◇◆`
- Description: "Luân phiên hai trạng thái, mỗi trạng thái kéo dài 6 giây. HƯ: tăng 30% né tránh nhưng giảm 20% sát thương gây ra. THỰC: tăng 25% sát thương gây ra nhưng giảm 15% tốc độ di chuyển. Bắt đầu lượt chơi ở trạng thái HƯ."
- Exact rule:
  - fixed 6s/6s cycle
  - starts HƯ immediately on acquisition
  - HƯ dodge bonus is +30 percentage points, still obeying the game's explicit global dodge ceiling if one exists and is documented at release audit
  - HƯ outgoing multiplier ×0.80
  - THỰC outgoing multiplier ×1.25
  - THỰC movement multiplier ×0.85
- Role: permanent alternating rule that changes optimal risk windows.

### 10. Thế Mệnh
- Key: `scapegoatFate`
- Tier: `mystic`
- Safe icon: `☯✕`
- Description: "Cứ mỗi 28 giây, đánh dấu một kẻ địch thường ngẫu nhiên làm Thế Mệnh. Nếu bạn nhận sát thương chí tử khi Thế Mệnh còn sống, kẻ đó chết thay và HP của bạn được giữ ở 1. Nếu Thế Mệnh chết trước, dấu mất và phải chờ lần đánh dấu tiếp theo. Tinh Anh không thể trở thành Thế Mệnh."
- Exact rule:
  - one marked ordinary hostile at a time
  - successful marking uses full 28s cooldown
  - fatal interception consumes/kills the marked target and leaves player at 1 HP
  - marked target dying naturally clears mark without refund/retry
  - cannot intercept fatal damage if no living marked ordinary target exists
- Role: repeatable but externally fragile fate-replacement law, distinct from Bất Tử Nhất Tức.

---

# Vô Hạn revision

V0.16 Vô Hạn still begins with **exactly one uniformly random rare** before the normal starter Kỹ Năng choice.

However, because the one-rare-per-run rule has been removed:
- the starting rare does **not** lock rare acquisition for the rest of the run
- later level-ups use the normal level-scaled rare curve
- the starting rare is excluded from future offers because duplicates are forbidden
- no hidden weighting between Thần Kỹ and Thần Bí Kỹ; selection is uniform across the full unowned pool

---

# Implementation order change

The new priority inserted into V0.16 is:
1. icon compatibility pass
2. multiple-rare + level-scaled offer system
3. one reroll per choice screen
4. resume 8 Hợp Đạo Kỹ
5. 4 Siêu Cấp
6. implement all **16 new rare rules** in small CI-gated batches
7. Vô Hạn guaranteed starting-rare reveal using the full 20-skill pool
8. Codex/VFX/mechanical-truth/balance/device audit
