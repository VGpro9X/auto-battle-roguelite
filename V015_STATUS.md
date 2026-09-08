# V0.15 Responsive Release Status

V0.15 is **accepted and released**. The user tested the GitHub Pages build on a real phone after Checkpoints 1–5 and reported the responsive result was good.

## Implemented checkpoints

### Checkpoint 1 — Responsive foundation
- Added `css/v015-responsive.css` as a dedicated responsive layer.
- `viewport-fit=cover` enabled.
- Safe-area insets are used for HUD, overlays, skill bar and toasts.
- `dvh`/`svh` viewport sizing added with fallback.
- Horizontal overflow / overscroll protection added.
- Menu/modal max-height follows the usable viewport.

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
- Mobile leaderboard preserves Elite/Level fields with horizontal scrolling instead of hiding them.

Commit:
- `47e192748f4dd9b9e1081d622e9af1f5d63aa4dd`

### Checkpoint 4 — Bách Khoa Kỹ Năng mobile/touch
- Added `css/v015-codex.css`.
- Compact screens use catalog → tap card → detail panel navigation.
- Detail has a dedicated `DANH SÁCH KỸ NĂNG` back control.
- Codex tabs remain horizontally scrollable.
- Mobile detail keeps preview, description, tags, requirements and related links.
- Player-facing Codex help text mentions touch/click as well as mouse interaction.

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

### Checkpoint 6 — Real-device acceptance
- GitHub Pages build was tested by the user on a real phone.
- User confirmed the result was good and accepted the responsive pass.
- This satisfies the required hands-on mobile gate for release.

## Release commits
- `ef97dcf2fac87f79f166fdd65e222227f2ae4bb5` — bump runtime version to V0.15
- `010fe7747a585ef827b553343879761af5752d98` — update visible version to V0.15

## Deployment
Primary test URL:
`https://vgpro9x.github.io/auto-battle-roguelite/`

## Locked constraints preserved
- V0.8 movement AI unchanged.
- Combat balance unchanged.
- No new skill content was introduced in V0.15.
- No player-facing feature was intentionally hidden on mobile.
- Level-up cards still only show immediate final-piece Hợp Đạo Kỹ / Siêu Cấp unlock hints.

## Next target
**V0.16 — Skill Expansion & Rare Rule Expansion.**
Start with `V016_SKILL_DESIGN.md`; do not implement a proposed skill until its exact mechanic and description are design-locked.
