# V0.21 — Release Validation

Status: **COMPLETE / RELEASED ✅**

## Scope

V0.21 adds Build Intelligence & Choice Clarity only. Gameplay, balance, AI and acquisition truth remain owned by the existing V0.16–V0.20 systems.

## Required release gates

- syntax-check all JavaScript
- V0.16 historical Survival tests
- V0.17 historical Duel tests
- V0.18 graphics/fallback tests
- V0.20 Renderer V3/UI/icon/combat/fallback/public-artifact tests
- `tests/v021-build-intelligence-smoke.js`
- exact Pages artifact generation
- GitHub Pages deployment

## Presentation-only assertions

The V0.21 runtime must not mutate:
- `owned` skill levels
- player combat stats
- rarity/acquisition probabilities
- reroll state
- AI decisions

Choice unlock badges must use existing immediate-unlock relation truth; near-progress data belongs in the build tracker, not as a false promise on a choice card.

## Public target

`https://vgpro9x.github.io/auto-battle-roguelite/`

Release evidence:
- public artifact commit validated: `9a7eb24b16ae062690deaf0b45ba319c694bded6`
- Deploy game to GitHub Pages run #828: **SUCCESS**
- V0.20 B14 historical regression release: **SUCCESS**
- V0.18 G7 historical regression release: **SUCCESS**
- V0.19 A15 historical regression release: **SUCCESS**
- V0.21 build-intelligence smoke gate: **SUCCESS**
- public Pages target: `https://vgpro9x.github.io/auto-battle-roguelite/`

V0.21 is promoted to COMPLETE / RELEASED.
