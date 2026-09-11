# Auto Battle Roguelite

Current release: **V0.17 – Duel Arena / Đấu Trường 1v1**

Active development: **V0.18 – Graphics & Presentation Overhaul**

Public build: `https://vgpro9x.github.io/auto-battle-roguelite/`

GitHub `main` is canonical.

## Current status
- V0.17 is **COMPLETE / RELEASED**.
- V0.18 G0 architecture lock: **COMPLETE**.
- V0.18 G1 asset loader + Renderer V2: **COMPLETE**.
- V0.18 G2 Fighter Visual V2: **COMPLETE — 13 / 13 semantic states**.
- V0.18 G3 Arena + Camera Presentation V2: **COMPLETE**.
- V0.18 G4 Full Duel VFX Readability Pass: **COMPLETE**.
- Next checkpoint: **G5 — Duel UI / HUD / Tournament Presentation Polish**.
- Runtime/public version label remains **V0.17** until G7 release validation passes.

See `V018_GRAPHICS_PLAN.md` for the authoritative V0.18 plan.

## V0.18 graphics progress
Renderer V2 is asset/manifest-driven and keeps the V0.17 vector renderer as a safe fallback. Simulation remains the only source of combat truth; graphics never decide hit success, damage, cooldowns, targeting, knockback, fatal ordering, AI decisions or tournament outcomes.

### G1 delivered
- `js/duel-visual-assets.js` manifest/image loader + cache
- `js/duel-animation.js` semantic state/frame/anchor resolver
- `js/duel-renderer-v2.js` Renderer V2 + vector fallback integration
- public `assets/` Pages pipeline
- exact production asset integrity validation

### G2 delivered
- clean vector → asset replacement by exact state
- 13 / 13 fighter states: `idle`, `walk`, `run`, `dash`, `melee`, `ranged`, `cast`, `hit`, `block`, `knockback`, `knockdown`, `recover`, `ko`
- per-frame `head`, `chest`, `leftHand`, `rightHand`, `feet`, `front`, `back`, `target` anchors
- facing flip + mirrored anchors
- player/opponent differentiation
- floor/contact shadow
- shield/frost/orbit presentation parity
- G2A–G2F smoke gates

### G3 delivered
- original `Ashen Sanctum` arena under `assets/duel/arenas/ashen-sanctum/`
- six manifest-driven arena layers
- presentation-only fighter-pair camera
- hard world bounds + desktop/mobile-safe zoom
- parallax + semantic impact shake/zoom
- shared world→screen transform across fighters/projectiles/VFX
- HUYẾT CHIẾN / TỬ CHIẾN presentation
- exact Pages arena asset validation

### G4 delivered
- `js/duel-vfx-v2.js` semantic event → visual-family router
- `js/duel-vfx-tier.js` Hợp Đạo / Siêu Cấp / Rare presentation classifier
- 15 cumulative VFX families:
  - physical
  - projectile
  - fire
  - frost
  - lightning
  - poison
  - blood
  - defense
  - heal
  - control
  - summon
  - area
  - chain
  - time
  - soul
- stronger Hợp Đạo / Siêu Cấp presentation overlays
- 20 / 20 Rare visual identities/signatures
- combat-active Rare activation coverage, including visible `heavenSeal` consumption
- `divineGift` intentionally has no fabricated combat VFX because it is reward/acquisition-only
- VFX placement uses event coordinates and fighter anchors
- transient effects expire; no permanent full-screen VFX wall
- G4A–G4E smoke/audit gates green
- full V0.16/V0.17/G1–G4 Pages chain green
- V0.17 desktop/mobile rendered validation green at G4 closure
- public Pages deploy green at G4 closure

## V0.18 next: G5
G5 polishes the player-facing Duel presentation without changing mechanics:
- lobby and mode entry
- opponent scouting / versus screen
- reward choice cards
- combat HUD readability
- HP / shield / timer / round / phase hierarchy
- round K.O., elimination and Champion presentation
- desktop + mobile usability

## V0.17 release baseline
V0.17 remains frozen except for bug fixes and includes:
- 64-fighter single-elimination Duel tournament
- Best-of-3 automatic combat
- two unrestricted starter choices
- one reroll on every choice screen
- opponent scouting
- 80 / 80 base Kỹ Năng Duel
- 28 / 28 Hợp Đạo Kỹ Duel
- 12 / 12 Siêu Cấp Duel
- 20 / 20 Rare Duel rules
- HUYẾT CHIẾN at 45s and TỬ CHIẾN at 60s+
- full V0.16/V0.17 validation and desktop/mobile browser coverage

Survival/Endless V0.16 remains supported and unchanged.

## Locked development rules
- GitHub `main` is canonical.
- Fetch latest content/blob SHA before editing an existing file.
- Commit every meaningful checkpoint.
- Movement baseline is **V0.8 Strategic Movement AI**; do not rewrite unless explicitly requested.
- Player-facing UI remains Vietnamese.
- No hidden gameplay caps/cooldowns/stack maxima/target limits/retry rules/weighting.
- Preserve V0.12 hidden-shield-cap removal.
- Preserve Survival `Săn Ấn`: marked target gives +25% base XP only.
- Choice-card relation hints only appear when that exact choice immediately completes the unlock.
- Executable tests stay under `tests/` and are never shipped in the public Pages artifact.
- V0.18 presentation work must not rebalance combat/AI/tournament/skill acquisition merely for visuals.

## Read before continuing V0.18
1. `README.md`
2. `PROJECT_HANDOFF.md`
3. `ROADMAP.md`
4. `V018_GRAPHICS_PLAN.md`
5. `V017_RELEASE_VALIDATION.md`
6. `V017_DUEL_ARENA_PLAN.md`

## Project status
**V0.17 remains the released/public baseline. V0.18 is active at G0 + G1 + G2 + G3 + G4 complete / G5 next.**
