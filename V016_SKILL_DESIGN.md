# V0.16 — Skill Expansion Design Lock

Status: **Checkpoint 1 design-locked for implementation**.

This file is the implementation contract for the V0.16 content expansion. Numbers may be tuned only when the player-facing description is changed in the same checkpoint. No hidden cap, cooldown, retry rule or exception may be introduced.

Current baseline before implementation:
- 64 base Kỹ Năng
- 20 Hợp Đạo Kỹ
- 8 Siêu Cấp
- 4 rare rule skills: 2 Thần Kỹ + 2 Thần Bí Kỹ

V0.16 target if all entries pass implementation/playtest:
- 80 base Kỹ Năng
- 28 Hợp Đạo Kỹ
- 12 Siêu Cấp
- 12 rare rule skills: 6 Thần Kỹ + 6 Thần Bí Kỹ
- 124 Codex entries

---

# A. 16 new base Kỹ Năng

## 1. Dư Ảnh
- Key: `afterimage`
- Icon: `👤`
- Max: 5
- Tags: `TIME`, `SUMMON`, `ATTACK`, `PROJECTILE`
- Player description formula:
  - Every `6.0 - 0.6 × (level-1)` seconds, create one afterimage at the player's current position for 1.8 seconds.
  - The afterimage fires 2 shots, 0.35 seconds apart.
  - Each shot deals `45% + 10% × (level-1)` of current normal-attack base damage.
  - Dư Ảnh shots do not trigger normal-attack on-hit procs.
- Exact mechanic:
  - level cooldowns: 6.0 / 5.4 / 4.8 / 4.2 / 3.6 s
  - shot damage: 45 / 55 / 65 / 75 / 85% normal base damage
  - source `afterimage`, `allowProcs:false`
- Visual identity: translucent copy of player, short-lived, two pale replay shots.
- Role: attack replay / temporary summon; intentionally distinct from Ảnh Xạ because it is a visible actor with its own firing window.
- Relationships: Hợp Đạo with `echoShot`; Siêu Cấp candidate.

## 2. Địa Lôi Phù
- Key: `runeMine`
- Icon: `🔻`
- Max: 5
- Tags: `AREA`, `EXPLOSION`, `PERIODIC`, `CONTROL`
- Player description formula:
  - Every `4.8 - 0.45 × (level-1)` seconds, leave a rune at the player's current position.
  - Rune arms after 0.45 seconds and lasts 5 seconds.
  - It triggers when a hostile enters `55 + 5 × (level-1)` radius.
  - Explosion radius `68 + 8 × (level-1)`, damage `28 + 10 × (level-1)`, knockback `40 + 5 × (level-1)`.
  - Maximum active runes: `2 + floor((level-1)/2)` = 2 / 2 / 3 / 3 / 4.
- Visual identity: floor sigil with clear arm pulse, then radial glyph explosion.
- Role: movement-created trap network; positional gameplay without manual movement.
- Relationships: Hợp Đạo with `blackHole`; Siêu Cấp candidate.

## 3. Huyết Liên
- Key: `bloodLink`
- Icon: `🩸⛓️`
- Max: 5
- Tags: `BLOOD`, `CHAIN`, `PERIODIC`, `DAMAGE`
- Player description formula:
  - Every `7.0 - 0.65 × (level-1)` seconds, link the two nearest hostile enemies for 4.5 seconds.
  - While linked, `16% + 4% × (level-1)` of damage received by either target is copied to the other.
  - Damage created by Huyết Liên cannot trigger Huyết Liên again and cannot trigger hit procs.
  - Only one pair can be linked at a time before Siêu Cấp.
- Exact mirror: 16 / 20 / 24 / 28 / 32%.
- Visual identity: red tether with heartbeat pulse on mirrored damage.
- Role: damage sharing; stronger in dense/elite encounters without being another projectile.
- Relationships: Hợp Đạo with `vampiricTouch`; Siêu Cấp candidate.

## 4. Linh Châu
- Key: `spiritPearl`
- Icon: `🔮`
- Max: 5
- Tags: `HEAL`, `SUMMON`, `CHARGE`, `PROJECTILE`
- Player description:
  - Every 8 HP actually restored charges 1 Linh Châu.
  - Maximum stored pearls: `1 + floor((level-1)/2)` = 1 / 1 / 2 / 2 / 3.
  - Every 2.2 seconds, if a pearl exists, consume one and fire it at the nearest hostile for `25 + 7 × (level-1)` damage.
  - Overheal that does not actually restore HP does not charge Linh Châu.
- Damage: 25 / 32 / 39 / 46 / 53.
- Visual identity: small luminous pearls orbiting player; one leaves orbit when fired.
- Role: converts healing throughput into stored offense.
- Relationships: Hợp Đạo with `xpHeal`.

## 5. Bộ Pháp Chấn
- Key: `strideShock`
- Icon: `👣💥`
- Max: 5
- Tags: `MOVEMENT`, `AREA`, `CONTROL`
- Player description:
  - After traveling `220 - 20 × (level-1)` pixels, emit a shockwave.
  - Radius `80 + 10 × (level-1)`.
  - Damage `14 + 6 × (level-1)` and knockback `26 + 6 × (level-1)`.
  - Distance carries over between movement segments; only actual player movement counts.
- Distance: 220 / 200 / 180 / 160 / 140.
- Visual identity: footstep charge ticks → circular wind shockwave.
- Role: rewards high movement and makes auto-path movement part of build identity without changing V0.8 AI decisions.
- Relationships: Hợp Đạo with `lightning`.

## 6. Trói Hồn
- Key: `soulBind`
- Icon: `🪢👻`
- Max: 5
- Tags: `SOUL`, `CONTROL`, `PERIODIC`
- Player description:
  - Every `7.0 - 0.7 × (level-1)` seconds, bind the fastest hostile within 260 pixels.
  - Normal enemies cannot move for `1.0 + 0.25 × (level-1)` seconds.
  - Elites are bound for half that duration.
  - On application, deal `10 + 5 × (level-1)` damage.
- Visual identity: spectral chain anchors target to floor.
- Role: deterministic anti-runner control; selects by actual speed, not random target.
- Relationships: Hợp Đạo with `deathMark`.

## 7. Hồi Phong Nhận
- Key: `returnBlade`
- Icon: `🪃`
- Max: 5
- Tags: `PROJECTILE`, `PIERCE`, `PERIODIC`
- Player description:
  - Every `4.6 - 0.5 × (level-1)` seconds, throw a blade toward the farthest hostile within 340 pixels.
  - The blade travels outward and returns to the player.
  - Each enemy can be hit once on the outward path and once on the return path.
  - Each hit deals `18 + 7 × (level-1)` damage.
- Visual identity: curved blade with outbound/return trail direction clearly visible.
- Role: line-cleave / return projectile; rewards enemy alignment.

## 8. Tinh Vẫn
- Key: `meteorSeal`
- Icon: `☄️`
- Max: 5
- Tags: `FIRE`, `AREA`, `EXPLOSION`, `PERIODIC`
- Player description:
  - Every `6.0 - 0.55 × (level-1)` seconds, mark a random hostile position.
  - After 0.8 seconds, a meteor lands at the marked position.
  - Radius `58 + 8 × (level-1)`.
  - Damage `30 + 12 × (level-1)`.
  - The landing applies a 2-second burn dealing `3 + level` damage per second.
- Visual identity: telegraphed ground circle + descending streak + crater flash.
- Role: delayed high-impact area spell with dodge/readability window.
- Relationships: Hợp Đạo with `burn`; Siêu Cấp candidate.

## 9. Hộ Pháp Mộc Nhân
- Key: `guardianIdol`
- Icon: `🪵🛡️`
- Max: 5
- Tags: `SUMMON`, `DEFENSE`, `CONTROL`
- Player description:
  - Every `12.0 - 1.0 × (level-1)` seconds, summon one stationary Hộ Pháp at the player's position for `4.0 + 0.5 × (level-1)` seconds.
  - It has `22 + 12 × (level-1)` HP.
  - Hostiles within 150 pixels of it prefer attacking the Hộ Pháp instead of the player.
  - Only one Hộ Pháp can exist at a time.
  - Hộ Pháp does not attack.
- Visual identity: wooden ward/totem with visible HP ring and aggro pulse.
- Role: temporary threat diversion, distinct from offensive summons.
- Relationships: Hợp Đạo with `retaliate`.

## 10. Hàn Kính
- Key: `frostMirror`
- Icon: `🪞❄️`
- Max: 4
- Tags: `ICE`, `DEFENSE`, `CONTROL`, `PERIODIC`
- Player description:
  - Every `9 - level` seconds, gain one Hàn Kính charge; maximum 1 charge.
  - The next enemy contact hit consumes the charge and reduces that hit by `35% + 10% × level`.
  - The contacting enemy is chilled for 3 seconds.
- Damage reduction: 45 / 55 / 65 / 75%.
- Cooldown: 8 / 7 / 6 / 5 s.
- Visual identity: one visible icy mirror shard orbiting player; shatters on block.
- Role: telegraphed single-hit defense with control payoff.

## 11. Tĩnh Tâm
- Key: `focusMind`
- Icon: `🧘`
- Max: 5
- Tags: `TIME`, `CRITICAL`, `RULE`
- Player description:
  - If the player has taken no damage for 4 seconds, enter Tĩnh Tâm until the next damage instance.
  - While active, gain `8% + 3% × (level-1)` critical chance and `18% + 8% × (level-1)` critical damage.
  - Taking damage immediately removes the bonus; avoiding damage for another 4 seconds restores it.
- Crit chance: 8 / 11 / 14 / 17 / 20%.
- Crit damage: 18 / 26 / 34 / 42 / 50%.
- Visual identity: calm halo/reticle around player; breaks visibly on damage.
- Role: conditional high-skill-value offense driven by survival quality rather than another permanent stat increase.

## 12. Thất Tinh Kích
- Key: `sevenStarStrike`
- Icon: `✴️`
- Max: 5
- Tags: `ATTACK`, `HIT`, `AREA`, `CHARGE`
- Player description:
  - Every `8 - level` normal-attack hits, call a star strike on the hit target.
  - Star strike radius `42 + 6 × (level-1)` and damage `18 + 8 × (level-1)`.
  - Star-strike damage does not count as a normal hit and cannot advance its own counter.
- Trigger count: 7 / 6 / 5 / 4 / 3 hits.
- Visual identity: visible star-counter pips, then vertical star flash.
- Role: hit-cadence payoff that scales naturally with attack speed/multishot.

## 13. Lôi Trường
- Key: `staticField`
- Icon: `⚡⭕`
- Max: 5
- Tags: `LIGHTNING`, `AREA`, `PERIODIC`
- Player description:
  - Every `8.0 - 0.7 × (level-1)` seconds, create a stationary lightning field at the player's current position for 3 seconds.
  - Radius `72 + 8 × (level-1)`.
  - Every 0.5 seconds, hostiles inside take `5 + 3 × (level-1)` lightning damage.
  - Field ticks do not trigger normal hit procs.
- Visual identity: floor electric ring with six readable half-second pulses.
- Role: persistent area denial, unlike instant Lôi Kích.

## 14. Hồn Đăng
- Key: `soulLantern`
- Icon: `🏮👻`
- Max: 5
- Tags: `SOUL`, `KILL`, `SUMMON`, `CHARGE`
- Player description:
  - Every `14 - level` kills, summon one soul flame for 6 seconds.
  - Soul flame seeks the nearest hostile and detonates on contact for `24 + 8 × (level-1)` area damage in radius 48.
  - Maximum active soul flames: 3.
- Kill thresholds: 13 / 12 / 11 / 10 / 9.
- Visual identity: blue-green lantern flame detaches and hunts a target.
- Role: kill momentum converted into autonomous burst.

## 15. Phá Giáp
- Key: `armorBreak`
- Icon: `🔨`
- Max: 5
- Tags: `ATTACK`, `HIT`, `MARK`, `DAMAGE`
- Player description:
  - Normal-attack hits apply one Phá Giáp stack for 4 seconds.
  - Each stack makes that target take `2% + 0.5% × (level-1)` more damage from the player.
  - Maximum stacks per target: `3 + level` = 4 / 5 / 6 / 7 / 8.
  - Reapplying refreshes the 4-second duration.
- Visual identity: segmented cracked-armor pips around enemy.
- Role: focus-fire ramp that rewards repeated attacks on the same enemy; distinct from one-shot Tử Ấn.

## 16. Thời Vực
- Key: `timeField`
- Icon: `⌛⭕`
- Max: 5
- Tags: `TIME`, `PERIODIC`, `RULE`
- Player description:
  - Every 14 seconds, enter Thời Vực for `3.0 + 0.5 × (level-1)` seconds.
  - While active, owned base periodic-skill timers advance `35% + 10% × (level-1)` faster.
  - This accelerates timers only; it does not directly duplicate activations.
- Duration: 3.0 / 3.5 / 4.0 / 4.5 / 5.0 s.
- Timer acceleration: 35 / 45 / 55 / 65 / 75% faster.
- Visual identity: clock ring centered on player with visibly accelerated tick marks.
- Role: timed burst window for periodic builds; different from Quá Tải Thời Gian's permanent risk/reward cooldown reduction.

---

# B. 8 new Hợp Đạo Kỹ

## 1. Vạn Ảnh Xạ
- Key: `afterimageEcho`
- Requires: `afterimage` + `echoShot`
- Description: "Khi Ảnh Xạ kích hoạt, Dư Ảnh đang tồn tại bắn thêm một phát vào cùng mục tiêu. Nếu không có Dư Ảnh, tạo một vi ảnh tồn tại 0.8 giây chỉ để bắn phát đó."
- Exact rule: extra shot uses current Dư Ảnh shot damage and `allowProcs:false`.
- Visual: echo projectile leaves both player and clone/vi-image.
- Role: links two replay systems without simply adding a percentage stat.

## 2. Trọng Lực Phù Trận
- Key: `gravityRune`
- Requires: `runeMine` + `blackHole`
- Description: "Khi Địa Lôi Phù vừa kích hoạt, nó kéo mọi kẻ địch trong 105px về phía tâm phù trước khi nổ."
- Exact rule: one pull impulse per mine trigger; no extra damage from the pull itself.
- Visual: violet inward ring before rune explosion.

## 3. Huyết Mạch Cộng Sinh
- Key: `bloodSymbiosis`
- Requires: `bloodLink` + `vampiricTouch`
- Description: "Mỗi lần Huyết Liên sao chép sát thương sang mục tiêu còn lại, hồi HP bằng 10% lượng sát thương sao chép thực tế."
- Exact rule: uses actual mirrored damage after target modifiers; healing cannot recursively create Huyết Liên damage.
- Visual: mirrored damage sends a thin red pulse back to player.

## 4. Linh Châu Dưỡng Mệnh
- Key: `nourishingPearls`
- Requires: `spiritPearl` + `xpHeal`
- Description: "Lượng hồi từ Linh Dưỡng được tính gấp đôi khi nạp Linh Châu. Mỗi Linh Châu trúng mục tiêu còn hồi 0.5 HP."
- Exact rule: actual XP-heal amount contributes ×2 to pearl charge; pearl-hit heal is exactly 0.5.
- Visual: XP-blue energy flows into orbiting pearl, pearl hit returns a green spark.

## 5. Phong Lôi Bộ
- Key: `thunderStride`
- Requires: `strideShock` + `lightning`
- Description: "Mỗi Bộ Pháp Chấn đánh trúng ít nhất một kẻ địch sẽ gọi thêm sét vào tối đa 2 mục tiêu bị trúng, mỗi tia gây 50% sát thương Lôi Kích hiện tại."
- Exact rule: targets selected from shockwave-hit set; max 2; no chain recursion.
- Visual: wind ring followed by two vertical lightning snaps.

## 6. Phong Hồn Tử Ấn
- Key: `sealedSoul`
- Requires: `soulBind` + `deathMark`
- Description: "Trói Hồn ưu tiên mục tiêu đang có Tử Ấn. Mục tiêu vừa bị trói vừa có ấn nhận thêm 20% sát thương và thời gian trói tăng thêm 1 giây."
- Exact rule: elites still receive half final bind duration after the +1s extension.
- Visual: spectral chain locks into the mark reticle.

## 7. Thiên Hỏa Tinh Vẫn
- Key: `heavenfallBurn`
- Requires: `meteorSeal` + `burn`
- Description: "Nếu mục tiêu ở tâm Tinh Vẫn đang cháy khi thiên thạch rơi, sau 0.25 giây vị trí đó nổ lần hai với 55% sát thương Tinh Vẫn."
- Exact rule: second explosion uses same radius, `allowProcs:false`, cannot create another second explosion.
- Visual: first crater remains glowing, then secondary orange-white blast.

## 8. Hộ Pháp Phản Chấn
- Key: `guardianRetaliation`
- Requires: `guardianIdol` + `retaliate`
- Description: "Khi Hộ Pháp Mộc Nhân chịu sát thương, nó có thể phát Phản Chấn quanh chính nó; tối đa một lần mỗi 0.6 giây."
- Exact rule: uses current Phản Chấn damage/radius scaling, centered on idol rather than player.
- Visual: idol flashes then emits the normal retaliation ring.

---

# C. 4 new Siêu Cấp

## 1. Vạn Ảnh Phân Thân
- Key: `phantomLegion`
- Base: `afterimage`
- Requirements: Dư Ảnh TỐI ĐA + `TIME ×3` + `SUMMON ×3`
- Description: "Dư Ảnh TỐI ĐA mỗi lần tạo thành 3 phân thân quanh người. Mỗi phân thân vẫn bắn 2 phát nhưng mỗi phát gây 70% sát thương Dư Ảnh hiện tại."
- Visual: triangular three-clone formation with synchronized fire.
- Power intent: major multi-angle replay spike.

## 2. Thiên La Địa Võng
- Key: `heavenNet`
- Base: `runeMine`
- Requirements: Địa Lôi Phù TỐI ĐA + `AREA ×3` + `EXPLOSION ×3` + `CONTROL ×2`
- Description: "Địa Lôi Phù TỐI ĐA tăng giới hạn phù đang tồn tại lên 8. Một phù phát nổ sẽ kích hoạt các phù đã lên đạn trong 120px sau 0.12 giây; phù bị kích chuỗi gây 75% sát thương bình thường."
- Chain safety: each mine may detonate only once; no hidden chain cap beyond active-mine cap 8.
- Visual: linked rune lines light sequentially across the floor.

## 3. Huyết Võng
- Key: `bloodWeb`
- Base: `bloodLink`
- Requirements: Huyết Liên TỐI ĐA + `BLOOD ×3` + `CHAIN ×3`
- Description: "Huyết Liên TỐI ĐA liên kết 4 kẻ địch gần nhất thành một Huyết Võng trong 5 giây. Khi một mục tiêu nhận sát thương, 25% lượng đó được sao chép sang từng mục tiêu còn lại trong võng."
- Safety: copied damage remains `allowProcs:false` and cannot recursively mirror.
- Visual: four-node red web with pulse branching from damaged node.

## 4. Tinh Hà Trụy Lạc
- Key: `starfallCataclysm`
- Base: `meteorSeal`
- Requirements: Tinh Vẫn TỐI ĐA + `FIRE ×2` + `AREA ×3` + `EXPLOSION ×3`
- Description: "Tinh Vẫn TỐI ĐA mỗi lần gọi 3 thiên thạch quanh vị trí mục tiêu, cách nhau 0.18 giây. Thiên thạch thứ hai và ba gây 70% sát thương thiên thạch đầu."
- Visual: three staggered telegraphs and descending streaks.
- Power intent: visible area-control power spike, stronger than a single Hợp Đạo Kỹ.

---

# D. 8 new rare rule skills

Existing rare skills remain unchanged:
- Thần Kỹ: Bất Tử Nhất Tức, Thiên Phạt
- Thần Bí Kỹ: Mua Chuộc, Đổi Mệnh

## New Thần Kỹ

### 1. Thiên Mệnh
- Key: `heavenlyMandate`
- Tier: `divine`
- Icon: `📜✨`
- Description: "Cứ mỗi 30 giây, toàn bộ Kỹ Năng định kỳ cơ bản bạn đang sở hữu lập tức được kích hoạt thêm đúng 1 lần. Lần kích hoạt thưởng này không đặt lại bộ đếm thời gian bình thường của chúng."
- Exact rule:
  - uniform 30s cooldown
  - invokes each owned base skill with a periodic `execute` once
  - if one skill cannot fire because it has no valid target, that skill simply misses this 30s mandate; no hidden retry
  - bonus activations can still obey that skill's documented mechanics/evolution, but mandate itself does not recursively trigger another mandate
- Visual: golden decree circle; each periodic skill icon flashes outward.
- Role: divine law for periodic builds.

### 2. Phán Quyết
- Key: `divineJudgment`
- Tier: `divine`
- Icon: `⚖️⚡`
- Description: "Mỗi 60 kẻ địch bị hạ, tiêu diệt ngay kẻ địch thường có HP hiện tại cao nhất. Nếu lúc đó chỉ còn Elite, Elite có HP hiện tại cao nhất chịu sát thương bằng 20% HP tối đa của nó."
- Exact rule:
  - kill counter carries overflow
  - normal target: instant death through explicit judgment path
  - elite fallback: damage = 20% target max HP, `allowProcs:false`
- Visual: golden scale/sword marker above chosen target, vertical judgment beam.
- Role: battlefield law that periodically removes the toughest ordinary threat.

### 3. Thiên Hộ
- Key: `heavenlyWard`
- Tier: `divine`
- Icon: `🛡️☀️`
- Description: "Mỗi khi khiên của bạn bị phá, nhận 1.5 giây bất tử. Thiên Hộ có hồi chiêu 12 giây tính từ lần kích hoạt thành công."
- Exact rule: only actual transition from shield >0 to shield 0 triggers; cooldown explicitly 12s.
- Visual: shield shatter immediately replaced by gold sun-disk barrier.
- Role: repeatable shield-law survival distinct from one-time Bất Tử Nhất Tức.

### 4. Thần Vực
- Key: `divineDomain`
- Tier: `divine`
- Icon: `🌕⭕`
- Description: "Cứ mỗi 24 giây, mở Thần Vực bán kính 140 quanh bạn trong 5 giây. Kẻ địch trong Thần Vực di chuyển chậm 40%, gây ít hơn 40% sát thương tiếp xúc và nhận thêm 20% sát thương từ bạn."
- Exact rule: domain follows player for full 5s; modifiers apply only while enemy center is inside radius.
- Visual: large gold-white moving domain boundary with floor sigils.
- Role: temporary battlefield law / major timing window.

## New Thần Bí Kỹ

### 1. Hoán Vị
- Key: `spatialSwap`
- Tier: `mystic`
- Icon: `🌀↔️`
- Description: "Cứ mỗi 12 giây, nếu có ít nhất 3 kẻ địch trong 90px quanh bạn và có một kẻ địch ở khoảng 180–320px, lập tức đổi vị trí với kẻ xa nhất đủ điều kiện. Sau khi đổi vị trí, bạn không nhận sát thương tiếp xúc trong 0.6 giây."
- Exact rule: if conditions fail, engine may retry using the standard failed-cast retry cadence already used by rare periodic skills; successful swap starts full 12s cooldown.
- Visual: two violet portals connected by a curved tether; player/enemy snap through simultaneously.
- Role: asymmetric positional escape law without altering V0.8 pathfinding decisions.

### 2. Nghịch Lưu
- Key: `lifeRewind`
- Tier: `mystic`
- Icon: `⏪❤️`
- Description: "Cứ mỗi 25 giây, nhìn lại trạng thái của bạn 5 giây trước. Nếu tổng HP + khiên khi đó cao hơn hiện tại, khôi phục HP và khiên đúng về các giá trị đã ghi lại; nếu không tốt hơn thì không có gì xảy ra."
- Exact rule:
  - maintain 5s rolling snapshot history while run is active
  - compares `hp + shield`
  - successful restore sets both HP and shield to snapshot values, each bounded only by the values actually recorded then
  - cannot revive after run has already ended
- Visual: ghost silhouette rewinds into player; HP/shield bars briefly trace backward.
- Role: reality rewind, distinct from direct heal/revive.

### 3. Đảo Nhân Quả
- Key: `causalInversion`
- Tier: `mystic`
- Icon: `🔄☯️`
- Description: "Cứ mỗi 15 giây tích một lần Đảo Nhân Quả. Đòn sát thương tiếp theo lẽ ra bạn phải nhận sau giảm sát thương sẽ bị triệt tiêu và thay vào đó hồi HP bằng đúng lượng sát thương đó. Đòn bị đảo không làm mất khiên."
- Exact rule:
  - one armed inversion at a time
  - cooldown begins when an inversion is armed, not when consumed
  - uses the post-mitigation amount that would otherwise be applied
  - heal cannot exceed max HP because normal healing rule applies
- Visual: incoming red hit flips to violet/green spiral and returns as healing pulse.
- Role: binary causality inversion rather than ordinary damage reduction.

### 4. Đồng Giá
- Key: `equalPrice`
- Tier: `mystic`
- Icon: `💎⚖️`
- Description: "Khi HP đang đầy, mỗi tinh thể XP chỉ cho bạn 70% lượng XP lẽ ra nhận; 30% còn lại được đổi thành khiên theo tỷ lệ 2 khiên cho mỗi 1 XP đã đổi. Khi HP không đầy, tinh thể XP hoạt động bình thường."
- Exact rule:
  - use the final XP amount the gem would grant after XP multipliers
  - at full HP: grant 70% XP, convert the remaining 30% to shield at ×2
  - no hidden shield cap
- Visual: XP gem splits into blue XP stream and violet shield stream.
- Role: explicit economy rewrite / progression-for-defense trade.

---

# E. Vô Hạn starting rare rule — implementation contract

When a Vô Hạn run begins in V0.16:
1. Build the full valid rare pool from all 12 Thần Kỹ / Thần Bí Kỹ.
2. Select exactly one with uniform random probability; no hidden weighting.
3. Grant it before the normal starter Kỹ Năng choice.
4. Show a dedicated reveal overlay containing icon, tier, name and exact description.
5. Player acknowledges the reveal; then the existing one starter Kỹ Năng choice begins.
6. The granted rare consumes the run's one rare-rule slot.
7. Vô Hạn therefore cannot roll another rare skill later while the one-rare-per-run rule remains active.
8. Timed modes continue using the existing level-8+ rare-offer system.

Required validation:
- repeated starts cover all 12 pool entries over enough trials
- no run receives 0 or 2 starting rares
- no post-start rare offer appears in Vô Hạn
- starter Kỹ Năng choice still occurs exactly once after reveal
- restart creates a fresh random rare

---

# F. Implementation order

To reduce regression risk, V0.16 code should be committed in small batches:

1. **Batch A1:** Dư Ảnh, Địa Lôi Phù, Huyết Liên, Linh Châu.
2. **Batch A2:** Bộ Pháp Chấn, Trói Hồn, Hồi Phong Nhận, Tinh Vẫn.
3. **Batch A3:** Hộ Pháp Mộc Nhân, Hàn Kính, Tĩnh Tâm, Thất Tinh Kích.
4. **Batch A4:** Lôi Trường, Hồn Đăng, Phá Giáp, Thời Vực.
5. **Batch B:** 8 Hợp Đạo Kỹ.
6. **Batch C:** 4 Siêu Cấp.
7. **Batch D:** 8 rare rule skills.
8. **Batch E:** Vô Hạn starting-rare reveal and grant flow.
9. **Batch F:** Codex scenes, live VFX signatures, count audit and mechanical-truth audit.
10. **Batch G:** balance/stress validation on GitHub Pages phone + desktop.

Every batch must preserve:
- V0.8 movement AI code unless a new skill explicitly needs a combat-side position/target rule; never rewrite strategic movement.
- final-piece-only Hợp Đạo/Siêu Cấp hints on level-up cards.
- Vietnamese player-facing terminology.
- no executable test harness in playable Pages build.
