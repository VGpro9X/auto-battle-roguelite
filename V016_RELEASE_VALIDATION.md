# V0.16 Release Validation

GitHub `main` is canonical. This document separates automated/code evidence, exact Pages-artifact browser validation, and the final physical-device judgment still required before changing the visible/runtime label from `V0.16 DEV` to final `V0.16`.

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
- layered rare ordering (`Mua Chuộc` / `Thời Đình`, `Thiên Ấn`, `Đảo Nhân Quả`, `Nợ Máu` + `Ký Sinh` + `Thế Mệnh`, `Bất Tử Nhất Tức`)
- Hợp Đạo B1/B2 mechanics and final registry = 28
- Siêu Cấp C1 mechanics and final registry = 12
- Vô Hạn guaranteed starting rare flow
- final content/truth audit
- deterministic rare-rate balance simulation
- 20-rare Codex/live VFX stress test

Latest audited deterministic sample:
- rare-rate simulation, Lv8–60: **4.58 rare successes/run average** before duplicate/pool exhaustion in the synthetic one-roll-per-level model
- Vô Hạn 20-way starting rare simulation: **1.07% maximum slot-frequency drift** over 400,000 deterministic samples
- all 20 rare Codex previews execute through their dedicated preview paths
- live/persistent rare VFX stress runs 360 synthetic frames and prunes transient effects correctly
- Pages artifact contains `index.html`, `css/`, `js/` only; `tests/` is not shipped

These figures validate implementation consistency, not final difficulty or fun balance.

## Mechanical-truth audit — PASS at code/CI level
- no global hidden rare retry interval remains
- failed periodic rare activations use their stated cooldown unless the rare explicitly declares a retry cooldown
- Thế Mệnh explicitly declares and describes its 1.25s retry when no valid target exists
- final-piece-only Hợp Đạo/Siêu Cấp card hints remain enforced
- partial build progress remains in `BỘ KỸ NĂNG & LIÊN KẾT`
- V0.8 Strategic Movement AI remains untouched

### Layered rare ordering now locked by CI
The integration test uses the real public rare-module order and confirms:
- Mua Chuộc ally is ignored by Thời Đình while hostile enemies freeze, then reverts after the 5s allied window
- Thiên Ấn checks dodge before consuming its per-enemy 12s block cooldown
- armed Đảo Nhân Quả resolves before Nợ Máu, Ký Sinh and Thế Mệnh, so an inverted hit creates no debt/redirect/scapegoat consumption
- with Nợ Máu + Ký Sinh + Thế Mệnh, shield resolves first, Ký Sinh redirects 30% of remaining HP damage, Nợ Máu defers half of the remainder, then Thế Mệnh intercepts lethal immediate damage
- if Thế Mệnh dies in that interaction, its death legitimately counts as an enemy kill and therefore clears 15% of the current Nợ Máu, exactly as Nợ Máu's description states
- Bất Tử Nhất Tức remains the final once-per-run lethal safety net when no earlier rule prevents death

## Rare visual audit — PASS in actual browser runtime
A headless Chromium run against the **exact generated GitHub Pages artifact** found one real integration bug that static CI had missed: the old V0.12 Visual Bridge loaded after the first V0.16 rare preview wrapper and replaced it, causing many new rare entries to fall back to the generic purple-star preview.

That runtime-order bug is fixed. `js/v016-rare-vfx.js?v=016dev-audit-r2` now loads as the final visual wrapper after Codex definitions, Visual Bridge and V0.13 rule feedback. The CI audit now enforces this exact order.

Post-fix browser verification:
- **140** actual Codex cards/canvases present
- exact split: 80 skill / 28 Hợp Đạo / 12 Siêu Cấp / 10 Thần Kỹ / 10 Thần Bí Kỹ
- all **20 rare previews produce 20 distinct rendered pixel hashes** at the same timestamp
- visual contact-sheet inspection shows each rare uses a recognizable mechanic-specific composition rather than the old generic-star fallback
- zero JavaScript page exceptions and zero console errors during the tested flows

## Exact Pages-artifact browser validation — PASS
Chromium executed the generated Pages artifact itself (not a separate development bundle).

### Desktop viewport 1440×1000
- main menu starts correctly; runtime registry = 80 / 28 / 12 / 20
- Bách Khoa shows `140 mục đang hiển thị` and all 140 cards
- Vô Hạn actual UI flow: guaranteed rare reveal → exactly 3 starter cards → one starter pick → gameplay
- guaranteed rare is already owned at reveal and exactly one rare is owned at run start
- starter `XOAY LẠI` starts enabled and becomes disabled after one use
- normal level-up `XOAY LẠI` independently starts enabled and becomes disabled after one use
- **10 repeated Vô Hạn starts** all completed reveal → starter → gameplay with one owned starting rare each time
- no document-level horizontal overflow

### Synthetic dense rendering on desktop
Two draw-only stress scenes were used to isolate rendering cost from AI/combat simulation:
- 350 shipped enemy objects: about **3.99 ms/draw** over 120 draws in the headless environment
- 240 enemies deliberately positioned on-screen + 199 representative combat VFX + all 20 rare rules owned: about **3.46 ms/draw** over 120 draws

These times are **not real-device FPS claims**. They are only regression indicators showing the current draw path remains comfortably below a 16.7ms/frame budget in this headless environment.

### Mobile portrait viewport 390×844
- main menu: no page-level horizontal overflow
- Bách Khoa: all 140 cards, no page-level horizontal overflow
- Codex container remains inside viewport bounds
- Vô Hạn reveal fits completely inside the viewport
- starter modal fits completely inside the viewport
- reroll button remains fully visible with a ~46px rendered height
- gameplay remains width-contained
- synthetic 120-enemy on-screen dense render: about **1.64 ms/draw** over 120 draws in headless Chromium

### Mobile landscape viewport 844×390
- gameplay: no page-level horizontal overflow
- pause modal remains fully inside the viewport
- pause controls stay visible

Again, viewport emulation validates layout/runtime behavior but is not a substitute for physical touch ergonomics, browser chrome/safe-area variation or hardware FPS.

## Remaining physical-device validation — REQUIRED BEFORE V0.16 RELEASE
Only the human/physical-device judgment remains. Automated and headless-browser checks cannot fully judge feel, actual touch comfort, hardware-specific emoji/font rendering, browser safe areas or real-device FPS.

### Desktop / PC
- Play at least one normal run long enough to judge late-game readability and pacing, ideally a 10-minute run.
- Confirm movement still feels like the accepted V0.8 behavior.
- Check whether dense damage/status/VFX information feels readable rather than merely technically renderable.
- Spot-check a few rare previews in the live Bách Khoa to confirm they look good on the actual display/font stack.

### Phone / tablet
- Open the current GitHub Pages build on one real phone/tablet.
- Check portrait; landscape too if the browser allows rotation.
- Tap main menu, mode menu, Bách Khoa, Vô Hạn reveal, starter cards, reroll, pause and result screen.
- Confirm touch targets feel comfortable and no control sits under browser chrome/safe areas.
- Play into a reasonably dense wave and judge hardware FPS/VFX coverage.
- Confirm no remaining emoji/font renders as a square/tofu box on that device.

### Mechanics spot-check already covered by CI
The highest-risk rule ordering is now automated:
- Mua Chuộc conversion/reversion + Thời Đình ally exclusion
- Thiên Ấn dodge-before-block
- Đảo Nhân Quả priority over later HP rules
- Nợ Máu + Ký Sinh + Thế Mệnh combined defensive ordering
- Bất Tử Nhất Tức lethal interception
- all four new Siêu Cấp retain their matching Hợp Đạo interactions in C1 CI tests

## Release decision
Do not rename the public build from `V0.16 DEV` to final `V0.16` until the short physical-device check above has no blocking issue. If a visual/readability problem appears, prefer VFX frequency/alpha/layout tuning over mechanic changes unless the mechanic itself is wrong.
