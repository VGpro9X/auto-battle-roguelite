# Auto Battle Roguelite — Project Handoff

Use this file as the starting context when continuing development in a new chat.

## Master source
- Repository: `VGpro9X/auto-battle-roguelite`
- Default branch: `main`
- GitHub `main` is canonical.
- Public URL: `https://vgpro9x.github.io/auto-battle-roguelite/`
- Pages workflow: `.github/workflows/pages.yml`
- V0.17 validation workflow: `.github/workflows/v017-validation.yml`
- Before editing an existing file, fetch current GitHub content + blob SHA.
- Commit after every meaningful checkpoint.

## Current release state
- Released baseline: **V0.17 – Duel Arena / Đấu Trường 1v1**.
- Runtime/public label: **V0.17**.
- **No unfinished V0.17 checkpoint remains.**

V0.17 includes:
- Survival/Endless from V0.16 unchanged as a supported mode.
- 64-fighter automatic Duel tournament.
- Best-of-3 side-view combat.
- Build-aware AI and separate Duel movement/combat logic; Survival Movement V0.8 remains untouched.
- 2 unrestricted starter choices + one reroll per choice screen.
- one build reward after every non-final victory.
- opponent scouting before each match.
- Duel Rank I/II/III, Rank III = TỐI ĐA.
- **80/80 base Kỹ Năng Duel**.
- **28/28 Hợp Đạo Kỹ Duel**.
- **12/12 Siêu Cấp Duel**.
- **20/20 Duel Rare rules** = 10 Thần Kỹ + 10 Thần Bí Kỹ.

## Tournament Rare contract
- no starter Rare
- reward chance after wins 1/2/3/4/5: `0% / 3% / 6% / 10% / 15%`
- at most one Rare in a 3-card reward roll
- unique/level-less; no duplicate ownership
- reroll rerolls the Rare roll
- AI uses the same stage chance and ownership rules

## Duel combat contract
- fully automatic fighters; player does not manually move/attack
- normal attack remains close range; ranged pressure is build-driven
- build-derived preferred distance controls pressure/kiting behavior
- no jump in V0.17
- one flat prototype arena in V0.17
- renderer is replaceable and does not own combat truth
- world hitboxes/logic are independent from final artwork
- explicit pressure phases:
  - 0–45s NORMAL
  - 45–60s HUYẾT CHIẾN
  - 60s+ TỬ CHIẾN until K.O.

## Architecture
Duel is deliberately separated from the Survival loop. Do not merge Duel movement into `js/movement.js` or rewrite the V0.8 Survival baseline.

Key V0.17 files:
- `js/duel-skills.js`, `duel-skills-d6a.js` … `duel-skills-d6g.js`
- `js/duel-engine.js`
- `js/duel-tournament.js`
- `js/duel-synergies.js`, `duel-synergies-c2a.js` … `c2d.js`
- `js/duel-evolutions.js`, `duel-evolutions-c3a.js`, `duel-evolutions-c3b.js`
- `js/duel-rares.js`, `duel-rares-r1.js`, `duel-rares-r2.js`
- `js/duel-renderer.js`
- `js/duel-ui.js`, `duel-ui-sync.js`
- `css/v017-duel.css`

Script order matters: base Duel engine/skills → Hợp Đạo → Siêu Cấp → Rare → renderer/UI.

## Locked terminology / truth rules
- Kỹ Năng / Hợp Đạo Kỹ / Siêu Cấp / Thần Kỹ / Thần Bí Kỹ / TỐI ĐA.
- Player-facing UI remains Vietnamese.
- No hidden caps, cooldowns, stack maxima, target limits, retry rules or weighting.
- Preserve V0.12 hidden-shield-cap removal.
- Preserve Survival `Săn Ấn`: marked target gives +25% base XP only.
- Choice-card relation hints only appear when that exact choice immediately completes the unlock.
- Tests live under `tests/`; public Pages artifact contains only `index.html`, `css/`, `js/`.

## V0.17 release validation
See `V017_RELEASE_VALIDATION.md`.

Frozen validation includes:
- full V0.16 regression suite
- all 80 base Duel gates
- all 28 Hợp Đạo gates
- all 12 Siêu Cấp gates
- all 20 Rare mechanics/acquisition/ordering gate
- full-system C5 deterministic simulation
- defense-v-defense termination through TỬ CHIẾN
- 64-player bracket sanity
- rendered Chrome flow at desktop 1440×900 and mobile 390×844
- GitHub Pages deploy

C5 did not identify a release-blocking stalled match or a sufficiently isolated value that justified a safe balance-number change, so V0.17 was released without arbitrary tuning.

## Post-V0.17 work
Not release blockers and not automatically active:
- higher-quality fighter art/animations
- sprite or skeletal renderer
- richer camera/VFX
- more arenas/hazards
- jump/aerial combat
- new tournament variants
- online/global systems
- new skills beyond the V0.16 ecosystem

## Status for next conversation
**Clean V0.17 released baseline. No carried unfinished task.**

Do not automatically resume tuning. Wait for the user's next roadmap, then update `ROADMAP.md` from this V0.17 baseline.
