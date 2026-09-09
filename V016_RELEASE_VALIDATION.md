# V0.16 Release Validation

GitHub `main` is canonical. This document separates automated evidence from the remaining hands-on browser/device checks.

## Release content target — PASS
- 80 Kỹ Năng
- 28 Hợp Đạo Kỹ
- 12 Siêu Cấp
- 20 rare rules = 10 Thần Kỹ + 10 Thần Bí Kỹ
- 140 Codex entries

## Automated CI — PASS
The Pages workflow currently gates all of the following before deployment:
- JavaScript syntax across `js/` and `tests/`
- A1/A2/A3/A4 mechanics
- 80-skill public integration
- rare chance / reroll / multiple-rare ownership
- actual 20-rare public chain
- difficult rare mechanics
- Hợp Đạo B1/B2 mechanics and final registry = 28
- Siêu Cấp C1 mechanics and final registry = 12
- Vô Hạn guaranteed starting rare flow
- final content/truth audit
- deterministic rare-rate balance simulation
- 20-rare Codex/live VFX stress test

Latest audited CI sample:
- rare-rate simulation, Lv8–60: **4.58 rare successes/run average** before duplicate/pool exhaustion in the synthetic one-roll-per-level model
- Vô Hạn 20-way starting rare simulation: **1.07% maximum slot-frequency drift** over 400,000 deterministic samples
- all 20 rare Codex previews executed without falling through to generic preview
- live/persistent rare VFX stress ran 360 frames and pruned transient effects correctly
- Pages artifact contains `index.html`, `css/`, `js/` only; `tests/` is not shipped

These figures validate implementation consistency, not final difficulty or fun balance.

## Mechanical-truth audit — PASS at code/CI level
- no global hidden rare retry interval remains
- failed periodic rare activations use their stated cooldown unless the rare explicitly declares a retry cooldown
- Thế Mệnh explicitly declares and describes its 1.25s retry when no valid target exists
- final-piece-only Hợp Đạo/Siêu Cấp card hints remain enforced
- partial build progress remains in `BỘ KỸ NĂNG & LIÊN KẾT`
- V0.8 Strategic Movement AI remains untouched

## Rare visual audit — PASS at code/CI level
All 20 rare rules have dedicated Codex preview identities and live feedback coverage. The original four retain their V0.13 bespoke gameplay cues; V0.16 additions use `js/v016-rare-vfx.js`.

## Remaining hands-on validation — REQUIRED BEFORE V0.16 RELEASE
Automated tests cannot judge readability, feel, visual clutter, touch ergonomics or real-device FPS. Test the current GitHub Pages build on at least desktop and one phone/tablet.

### Desktop / PC
- Open Bách Khoa and scroll through all 140 entries.
- Check all 20 Thần Kỹ/Thần Bí Kỹ previews for clearly different visual identities.
- Start Vô Hạn at least 10 times; verify reveal → one starter choice → gameplay every time.
- Verify `XOAY LẠI` exactly once on starter and normal level-up screens.
- Play at least one 10-minute run into dense late game.
- Watch for overlapping damage numbers, unreadable status effects, disappearing projectiles, stutter or long-frame spikes.
- Confirm V0.8 movement behavior still feels unchanged.

### Phone / tablet
- Test portrait and landscape if the browser allows both.
- Check main menu, mode menu, Bách Khoa, level-up cards, reroll button, pause menu and result screen for clipping/overflow.
- Check the Vô Hạn rare reveal at narrow width.
- Confirm touch targets are comfortable and no important control sits under browser safe areas.
- Play into a dense wave and watch for FPS drops or excessive VFX coverage.

### Mechanics spot-check
Prioritize the interactions most likely to reveal layering bugs:
- Mua Chuộc conversion and reversion
- Bất Tử Nhất Tức lethal interception
- Thời Đình with allied enemy present
- Thiên Ấn dodge-before-block ordering
- Nợ Máu + Ký Sinh + Thế Mệnh combined defensive ordering
- Vạn Ảnh Phân Thân + Vạn Ảnh Xạ
- Thiên La Địa Võng + Trọng Lực Phù Trận
- Huyết Võng + Huyết Mạch Cộng Sinh
- Tinh Hà Trụy Lạc + Thiên Hỏa Tinh Vẫn

## Release decision
Do not rename the public build from `V0.16 DEV` to final `V0.16` until the hands-on checklist above has no blocking issue. If a visual/readability problem appears, prefer VFX frequency/alpha/layout tuning over mechanic changes unless the mechanic itself is wrong.
