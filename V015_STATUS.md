# V0.15 Responsive RC Status

Current release remains **V0.14** until real-device validation is complete. This file records active V0.15 work on `main`.

## Implemented checkpoints

### Checkpoint 1 — Responsive foundation
- Added `css/v015-responsive.css` as a dedicated responsive layer.
- `viewport-fit=cover` enabled.
- Safe-area insets are used for HUD, overlays, skill bar and toasts.
- `dvh`/`svh` viewport sizing added with fallback.
- Horizontal overflow / overscroll protection added.
- Menu/modal max-height now follows the usable viewport.

Commits:
- `0525e59d37288af96289325e5d54bb1f1ed03c3b`
- `84840cdfaa2b96fc97037d4d6715ef3770175d14`

### Checkpoint 2 — Mobile gameplay HUD
- Phone HUD reflows into compact rows while keeping HP, XP, mode, level, timer, kills and pause visible.
- Skill bar becomes compact horizontal scroll.
- Added `BỘ KỸ NĂNG` mobile button.
- Build tracker is a collapsible drawer instead of being hidden below 700px.
- Phone landscape also uses the drawer to reduce playfield obstruction.
- Added `js/v015-responsive.js` for responsive interaction state.

Commits:
- `4d60bdc42a8b449401aa56acb73bc4c9f55e9416`
- `ea169ec664ba713a9b50d3c847ee852a0de93316`
- `831d9af9ce314a364819c6f1d06ab355c02c01b2`

### Checkpoint 3 — Level-up and run modals
- Portrait level-up cards stack vertically and scroll inside the modal.
- Landscape keeps three choices side by side with smaller responsive typography.
- Result, pause, settings and how-to screens receive viewport-safe scrolling.
- Mobile leaderboard no longer hides Elite/Level columns; it preserves all fields with horizontal scrolling.

Commit:
- `47e192748f4dd9b9e1081d622e9af1f5d63aa4dd`

### Checkpoint 4 — Bách Khoa Kỹ Năng mobile/touch
- Added `css/v015-codex.css`.
- Compact screens use catalog → tap card → detail panel navigation.
- Detail has a dedicated `DANH SÁCH KỸ NĂNG` back control.
- Codex tabs remain horizontally scrollable.
- Mobile detail keeps preview, description, tags, requirements and related links.
- Player-facing Codex help text now mentions touch/click as well as mouse interaction.

Commits:
- `7b323baa67f952d409464f72db857355d35f0a24`
- `46610bb0477ee003ac585dc6ed84dffd990f7721`
- `a512cbcbf39df607af918162e0cacf7ab172cb58`

### Checkpoint 5 — Touch / orientation polish
- Responsive state reacts to orientation changes and compact breakpoint changes.
- Uses `visualViewport` resize/scroll events when available so Canvas sizing follows mobile browser chrome changes more reliably.
- Added `visibilitychange` auto-pause fallback for mobile app/tab switching.
- `js/v015-responsive.js` passes `node --check`.
- No movement, combat, balance or skill mechanics were changed.

Commit:
- `d35fff892527739f038d7c0171330c3de05f08b9`

## Deployment
- GitHub Pages deployment for commit `d35fff892527739f038d7c0171330c3de05f08b9` completed successfully.
- Test URL: `https://vgpro9x.github.io/auto-battle-roguelite/`

## Still required before V0.15 release
Checkpoint 6 real-device / viewport validation:
- 360×800 phone portrait
- 390×844 / 393×852 phone portrait
- 412×915 phone portrait
- 844×390 phone landscape
- 915×412 phone landscape
- 768×1024 tablet portrait
- 1024×768 tablet landscape
- 1366×768 desktop
- 1920×1080 desktop

Must confirm:
- no horizontal overflow
- no unreachable UI
- all HUD information visible
- build tracker drawer opens/closes correctly
- all level-up choices readable/selectable
- Codex catalog/detail flow works by touch
- leaderboard preserves all fields
- rotation does not break Canvas/HUD
- dense combat remains readable

Do **not** bump `GAME_VERSION` to V0.15 or begin V0.16 until real-device validation is accepted.
