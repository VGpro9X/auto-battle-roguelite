# V0.21 — Build Intelligence & Choice Clarity

Status: **COMPLETE / RELEASED ✅**

Canonical source: GitHub `main` in `VGpro9X/auto-battle-roguelite`.

## Goal

Make the player's only major Survival interaction — choosing skills — substantially easier to read without changing gameplay truth.

V0.21 is a presentation/readability release layered on top of V0.20 visuals, V0.19 tactical AI and the locked V0.16/V0.17 combat/content systems.

## Delivered

- Build summary inside **BỘ KỸ NĂNG & LIÊN KẾT**:
  - owned Kỹ Năng count
  - unlocked Hợp Đạo count
  - unlocked Siêu Cấp count
  - owned Thần Kỹ/Thần Bí Kỹ count
  - three currently dominant skill tags
- Near-unlock progress:
  - up to three closest Hợp Đạo/Siêu Cấp routes
  - explicit requirement progress and missing pieces
  - Siêu Cấp base-skill level progress
- Choice clarity:
  - KỸ NĂNG MỚI
  - NÂNG CẤP current→next
  - SẮP TỐI ĐA
  - MỞ HỢP ĐẠO only when that exact choice immediately completes the unlock
  - MỞ SIÊU CẤP only when that exact choice immediately completes the evolution
  - THẦN KỸ / THẦN BÍ KỸ identity
  - count of already-present build tags shared with each offered base skill
- Choice-screen context:
  - current build counts
  - dominant tags
  - mobile-sized compact presentation
- Existing one-reroll-per-choice-screen rule remains unchanged and is visually integrated with the new choice UI.

## Locked truth

V0.21 must not change:
- skill offer probability or weighting
- rare probability curve
- reroll count or reroll behavior
- skill damage, cooldown, status or proc rules
- enemy stats/spawning
- Survival/Duel AI
- tournament rules
- 80 / 28 / 12 / 20 Duel content contract
- 10 Thần Kỹ + 10 Thần Bí Kỹ Survival content
- fatal/revive ordering
- V0.12 shield-cap removal
- Survival Săn Ấn +25% base XP rule

## Implementation

- `js/v021-build-intelligence.js`
- `css/v021-build-intelligence.css`
- `tests/v021-build-intelligence-smoke.js`
- existing V0.20 visual runtime stays intact
- existing V0.19 AI runtime stays intact

The layer reads existing state and DOM output. It does not write combat or acquisition state.

## Validation

- JavaScript syntax gate
- V0.16–V0.20 historical regression chain
- V0.21 presentation-only static smoke
- public artifact path/budget audit
- GitHub Pages deployment

## Release

Public/runtime label: **V0.21**.

Public URL: `https://vgpro9x.github.io/auto-battle-roguelite/`
