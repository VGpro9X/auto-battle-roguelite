# V0.16 Release Validation

GitHub `main` is canonical. V0.16 has passed automated/code validation, exact Pages-artifact browser validation, and final hands-on user sign-off.

## Release content target — PASS
- 80 Kỹ Năng
- 28 Hợp Đạo Kỹ
- 12 Siêu Cấp
- 20 rare rules = 10 Thần Kỹ + 10 Thần Bí Kỹ
- 140 Codex entries

## Automated CI — PASS
The Pages workflow gates all of the following before deployment:
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

## Mechanical-truth audit — PASS
- no global hidden rare retry interval remains
- failed periodic rare activations use their stated cooldown unless the rare explicitly declares a retry cooldown
- Thế Mệnh explicitly declares and describes its 1.25s retry when no valid target exists
- final-piece-only Hợp Đạo/Siêu Cấp card hints remain enforced
- partial build progress remains in `BỘ KỸ NĂNG & LIÊN KẾT`
- V0.8 Strategic Movement AI remains untouched

### Layered rare ordering locked by CI
The integration test uses the real public rare-module order and confirms:
- Mua Chuộc ally is ignored by Thời Đình while hostile enemies freeze, then reverts after the 5s allied window
- Thiên Ấn checks dodge before consuming its per-enemy 12s block cooldown
- armed Đảo Nhân Quả resolves before Nợ Máu, Ký Sinh and Thế Mệnh, so an inverted hit creates no debt/redirect/scapegoat consumption
- with Nợ Máu + Ký Sinh + Thế Mệnh, shield resolves first, Ký Sinh redirects 30% of remaining HP damage, Nợ Máu defers half of the remainder, then Thế Mệnh intercepts lethal immediate damage
- if Thế Mệnh dies in that interaction, its death counts as an enemy kill and clears 15% of the current Nợ Máu, matching Nợ Máu's description
- Bất Tử Nhất Tức remains the final once-per-run lethal safety net when no earlier rule prevents death

## Rare visual audit — PASS in actual browser runtime
A headless Chromium run against the **exact generated GitHub Pages artifact** found one real integration bug that static CI had missed: the old V0.12 Visual Bridge loaded after the first V0.16 rare preview wrapper and replaced it, causing many new rare entries to fall back to the generic purple-star preview.

That runtime-order bug is fixed. `js/v016-rare-vfx.js?v=016dev-audit-r2` loads as the final visual wrapper after Codex definitions, Visual Bridge and V0.13 rule feedback. The CI audit enforces this exact order.

Post-fix browser verification:
- **140** actual Codex cards/canvases present
- exact split: 80 skill / 28 Hợp Đạo / 12 Siêu Cấp / 10 Thần Kỹ / 10 Thần Bí Kỹ
- all **20 rare previews produce 20 distinct rendered pixel hashes** at the same timestamp
- visual contact-sheet inspection shows each rare uses a recognizable mechanic-specific composition rather than the old generic-star fallback
- zero JavaScript page exceptions and zero console errors during tested flows

## Exact Pages-artifact browser validation — PASS
Chromium executed the generated Pages artifact itself.

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

These times are **not real-device FPS claims**.

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

## Hands-on user sign-off — PASS
The user tested the current public release candidate and reported it was stable/acceptable with no blocking issue. This closes the final human/device release gate.

The release is promoted from `V0.16 DEV` to final **V0.16**.

## Release decision — PASS
V0.16 is released.

Any future issue found in normal play should be handled as a post-release bug/balance fix rather than reopening the completed V0.16 content milestone.

Next phase: run the focused balance pass defined in `ROADMAP.md` before another major content expansion.
