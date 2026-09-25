# V0.21 — Release Validation

Status: **RELEASE CANDIDATE / AUTOMATION PENDING**

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

Final status is promoted to COMPLETE / RELEASED only after the Pages workflow is green.
