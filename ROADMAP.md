# Auto Battle Roguelite — Roadmap

This roadmap is the canonical forward plan after V0.14. GitHub `main` remains the master source.

## Current baseline
- Current release: **V0.14 – Character & Enemy Presentation**
- Movement baseline remains **V0.8 Strategic Movement AI** and must not be changed unless explicitly requested.
- Current content: 64 base Kỹ Năng, 20 Hợp Đạo Kỹ, 8 Siêu Cấp, 4 rare rule skills (2 Thần Kỹ + 2 Thần Bí Kỹ).
- Player-facing language remains Vietnamese.
- No silent caps or undocumented mechanic limits.
- Level-up cards only show Hợp Đạo Kỹ / Siêu Cấp relation hints when the exact offered pick immediately unlocks them.

---

# V0.15 — Responsive & Mobile/Desktop Readability

## Goal
Make the entire game comfortably playable and fully readable on phones, tablets and desktop browsers without hiding features or changing gameplay mechanics.

## Checkpoint 1 — Responsive foundation
- Add a dedicated responsive layout layer instead of scattering one-off mobile fixes.
- Use `viewport-fit=cover` and safe-area insets where needed.
- Replace fragile fixed-size layout assumptions with responsive sizing using `clamp()`, `%`, `min()`, `max()`, `dvh` / `svh` where appropriate.
- Prevent horizontal page overflow and accidental browser scrolling during gameplay.
- Preserve full-screen Canvas behavior across resize and orientation changes.
- Keep desktop layout visually close to the current V0.14 layout.

### Acceptance criteria
- No horizontal overflow at common mobile widths.
- Rotation between portrait and landscape does not break Canvas or UI positions.
- No core feature becomes inaccessible at small viewport sizes.

## Checkpoint 2 — Mobile gameplay HUD
- Reflow HP / XP / level / timer / kills / pause controls for narrow screens.
- Keep important run information visible without covering excessive playfield area.
- Ensure touch targets are comfortably tappable (target roughly 44px minimum where practical).
- Respect phone safe areas / display cutouts.
- Scale the build tracker for mobile instead of simply hiding it.
- On small screens, the build tracker may become a collapsible drawer / sheet, but all information must remain accessible.

### Acceptance criteria
- HP, XP, level, timer, kills and pause remain available on phone.
- BỘ KỸ NĂNG & LIÊN KẾT remains accessible on phone.
- HUD does not block a large portion of the combat space.

## Checkpoint 3 — Level-up and run modals
- Responsive level-up cards for portrait and landscape.
- On narrow portrait screens, cards can stack vertically and scroll inside the modal.
- Ensure all description text, rarity, final-piece unlock hints and choose buttons are readable.
- Make pause, settings, result and mode-select screens fit without browser-page overflow.

### Acceptance criteria
- All level-up choices are fully readable and selectable on phone.
- No important modal button falls below an unreachable area.
- No information is removed merely to make the modal fit.

## Checkpoint 4 — Bách Khoa Kỹ Năng responsive redesign
- Desktop keeps catalog + detail panel layout.
- Tablet can use a narrower two-column layout.
- Mobile portrait changes to a one-column flow or catalog/detail switch without losing information.
- Make entries usable by tap, not hover-only interaction.
- Ensure the animated preview remains visible at practical size on mobile.
- Requirements, tags, related Hợp Đạo Kỹ / Siêu Cấp and descriptions must remain available.

### Acceptance criteria
- Every Codex entry can be opened by touch.
- Detail panel does not require hover.
- No entry metadata is lost on mobile.

## Checkpoint 5 — Touch and orientation polish
- Remove hover-dependent affordances from critical interactions.
- Add active / focus-visible states that work for both touch and keyboard/mouse.
- Verify portrait and landscape layouts separately.
- Do not introduce virtual movement controls; movement remains automatic.
- Test pause/resume behavior when mobile browser tabs lose focus.

## Checkpoint 6 — Responsive validation matrix
Test at minimum:
- 360×800 phone portrait
- 390×844 / 393×852 phone portrait
- 412×915 phone portrait
- 844×390 phone landscape
- 915×412 phone landscape
- 768×1024 tablet portrait
- 1024×768 tablet landscape
- 1366×768 desktop
- 1920×1080 desktop

Validation checks:
- no console/runtime errors
- no horizontal overflow
- no unreachable UI
- all current menus and Codex accessible
- level-up cards readable
- dense combat still leaves core HUD understandable
- GitHub Pages build tested on a real phone before V0.15 is considered complete

## V0.15 non-goals
- Do not change combat balance.
- Do not change V0.8 movement AI.
- Do not add new skills in this version except tiny compatibility fixes if unavoidable.
- Do not hide features on mobile just to make layout easier.

---

# V0.16 — Skill Expansion & Rare Rule Skill Expansion

## Goal
Expand build variety substantially, with special emphasis on **Thần Kỹ** and **Thần Bí Kỹ**, while keeping every new skill mechanically distinct and visually readable.

## Target content scale
Target for V0.16, subject to playtest quality:
- Base Kỹ Năng: **64 → 80** (+16)
- Hợp Đạo Kỹ: **20 → 28** (+8)
- Siêu Cấp: **8 → 12** (+4)
- Rare rule skills: **4 → 12** (+8)
  - Thần Kỹ: 2 → 6
  - Thần Bí Kỹ: 2 → 6
- Codex total target: **124 entries** if all targets ship.

These are release targets, not mandatory quotas. A weak or duplicated skill should be cut rather than added only to hit a number.

## Checkpoint 1 — Design lock before coding
Before implementing new skills, create a content table for every proposed addition containing:
- name
- tier
- description
- exact mechanic
- trigger / cooldown / limit if any
- tags
- intended visual identity
- likely Hợp Đạo Kỹ relationships
- balance role / reason it exists

Reject or redesign skills that merely repeat an existing mechanic with different numbers.

## Checkpoint 2 — New base Kỹ Năng
Prioritize mechanics that add new decision patterns rather than only more damage:
- cadence / timed-rule skills
- conditional effects based on enemy state or player state
- unusual targeting rules
- area / line / orbit / chain variations
- summon and control mechanics
- resource conversion or risk/reward mechanics
- positional mechanics that do not require manual movement

Every base skill must have:
- working mechanics
- truthful Vietnamese description
- Codex entry
- visual profile / scene identity
- gameplay feedback where needed
- level scaling that does not rely on undocumented caps

## Checkpoint 3 — New Hợp Đạo Kỹ
- Add combinations mainly around the new base skills, while also allowing a few new links between existing skills where a meaningful interaction is missing.
- Each Hợp Đạo Kỹ should change behavior or interaction, not only add a flat damage percentage.
- Ensure source routing is explicit so base effects do not visually masquerade as Hợp Đạo Kỹ.
- Preserve the current level-up rule: partial progress remains in BỘ KỸ NĂNG & LIÊN KẾT; cards only show the final immediate unlock.

## Checkpoint 4 — New Siêu Cấp
- Add four major evolutions tied to maxed base skills plus clear requirements.
- Each Siêu Cấp should feel like a visible power spike stronger than an ordinary single Hợp Đạo Kỹ.
- Each requires a distinctive live-combat signature and Codex preview.

## Checkpoint 5 — Expand Thần Kỹ and Thần Bí Kỹ
Rare rule skills remain level-less, unique and rule-like.

Design direction:
- **Thần Kỹ** should feel like major laws / divine interventions / survival or battlefield rules.
- **Thần Bí Kỹ** should feel stranger, asymmetric or reality-bending: conversion, exchange, inversion, theft, unusual economy, faction or targeting rules.
- Avoid turning either tier into ordinary stat buffs.
- Every rare skill must be visually unmistakable when it activates.
- The current rule remains: **at most one owned Thần Kỹ or Thần Bí Kỹ per run**, unless explicitly redesigned later.

## Checkpoint 6 — Vô Hạn starting rare rule
New V0.16 Endless rule:
- When a **Vô Hạn** run begins, the game automatically grants **exactly one random Thần Kỹ or Thần Bí Kỹ** from the full available rare pool.
- This random rare skill is granted before the normal starter-skill choice.
- Show a dedicated reveal card / screen so the player clearly sees what rare rule was received and what it does.
- After the reveal, continue to the existing one normal starter-skill choice for Vô Hạn.
- The granted rare skill consumes the run's one rare-rule slot.
- Therefore Vô Hạn does **not** later roll another rare rule skill from level-up while the one-per-run rule remains active.
- Other timed modes keep the existing rare-offer system unless later balance testing justifies changes.
- Random selection should use the entire valid rare pool with no hidden preference unless weighting is explicitly documented later.

## Checkpoint 7 — Codex, visuals and mechanical truth audit
- Add all new entries to Bách Khoa Kỹ Năng.
- Update category counts and filters.
- Add dedicated visuals for every new rare rule skill.
- Re-audit every description against source implementation.
- Test cooldowns, limits, max stacks and one-time effects for undocumented restrictions.

## Checkpoint 8 — V0.16 balance / stress validation
Test:
- early game with new common skills
- multiple new Hợp Đạo chains
- all new Siêu Cấp individually
- every Thần Kỹ and Thần Bí Kỹ at least once
- repeated Vô Hạn starts to verify random rare granting and reveal flow
- no duplicate rare grants in Vô Hạn
- dense late-game VFX performance on phone and desktop
- Codex total/count consistency

## V0.16 release rule
Do not call V0.16 complete until all shipped skills have:
1. implemented mechanics
2. truthful Vietnamese descriptions
3. Codex entries
4. readable gameplay feedback
5. syntax/runtime validation
6. at least one live or automated mechanic exercise

---

# After V0.16
Run a focused balance pass before the next major content expansion:
- compare pick rates / practical value of old vs new skills
- identify Hợp Đạo Kỹ that remain visually or mechanically weak
- verify Siêu Cấp still feels special after the larger skill pool
- evaluate whether one rare rule skill per run remains the right long-term rule
- evaluate Vô Hạn difficulty pacing now that every run begins with a rule-level power

Only after that should the project consider V0.17+ systems such as advanced super-synergies, additional enemy archetypes, bosses, progression/meta systems or another expansion toward 100+ base skills.
