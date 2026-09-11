# Auto Battle Roguelite

Current release: **V0.17 – Duel Arena / Đấu Trường 1v1**

Active development: **V0.18 – Graphics & Presentation Overhaul**

Public build: `https://vgpro9x.github.io/auto-battle-roguelite/`

GitHub `main` is canonical.

## Current status
- V0.17 is **COMPLETE / RELEASED**.
- V0.18 graphics roadmap is **ACTIVE**.
- V0.18 G0 architecture lock is complete.
- V0.18 G1 asset loader + Renderer V2 foundation is complete.
- V0.18 G2 Fighter Visual V2 is complete at **13 / 13 required semantic states**.
- V0.18 G3 Arena + Camera Presentation V2 is complete.
- Next checkpoint: **G4 — Full Duel VFX Readability Pass**.
- Runtime/public version label remains **V0.17** until V0.18 passes G7 release validation.

See `V018_GRAPHICS_PLAN.md` for the authoritative V0.18 plan.

## V0.18 graphics progress
Renderer V2 is manifest-driven and keeps the V0.17 vector renderer as a safe fallback. Combat truth remains simulation-owned; graphics do not decide hit success, damage, cooldowns, knockback, fatal ordering or tournament outcome.

G1 delivered:
- `js/duel-visual-assets.js` loader/cache
- `js/duel-animation.js` semantic state + per-frame anchor resolver
- `js/duel-renderer-v2.js` Renderer V2 + vector fallback
- public `assets/` Pages pipeline
- exact manifest/source integrity validation

G2 delivered:
- clean state-by-state vector → asset replacement
- complete fighter coverage: `idle`, `walk`, `run`, `dash`, `melee`, `ranged`, `cast`, `hit`, `block`, `knockback`, `knockdown`, `recover`, `ko`
- per-frame `head`, `chest`, `leftHand`, `rightHand`, `feet`, `front`, `back`, `target` anchors
- horizontal facing support
- stable feet/root metadata contract
- player/opponent visual differentiation
- V2 floor/contact shadow
- shield/frost/orbit attachment parity using V2 anchors
- G2A–G2F automated smoke gates
- full V0.16/V0.17 regression chain remained green through G2F

G3 delivered:
- original `Ashen Sanctum` arena under `assets/duel/arenas/ashen-sanctum/`
- six manifest-driven layers: sky, far, mid, ambient, floor, foreground
- parallax background/foreground transforms
- `js/duel-camera.js` presentation-only camera
- fighter-pair framing with hard world bounds
- desktop/mobile-safe zoom behavior
- semantic-event impact shake/zoom
- shared camera transform across V2 fighters, vector fallback projectiles and VFX
- HUYẾT CHIẾN / TỬ CHIẾN phase presentation
- exact Pages arena asset-integrity validation
- `tests/v018-g3-arena-camera-smoke.js`
- full V0.16/V0.17/G1/G2/G3 Pages chain and V0.17 rendered validation green at G3 closure

The fighter and arena assets establish the current original V0.18 presentation contract. Later visual polish may improve artwork/effects without changing simulation truth.

## V0.18 next: G4
G4 upgrades full Duel VFX readability without changing mechanics:
- physical / projectile
- fire / frost / lightning
- poison / DOT / blood
- shield / heal / control
- summon / orbit
- explosion / area / chain
- time / space / soul / death
- divine / mystic Rare identities
- stronger Hợp Đạo / Siêu Cấp / Rare visual overrides
- anchor-driven impact placement
- no effect may change hitboxes, targeting, timing or damage

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
- V0.18 visual work must not rebalance combat/AI/tournament/skill acquisition merely for presentation.

## Read before continuing V0.18
1. `README.md`
2. `PROJECT_HANDOFF.md`
3. `ROADMAP.md`
4. `V018_GRAPHICS_PLAN.md`
5. `V017_RELEASE_VALIDATION.md`
6. `V017_DUEL_ARENA_PLAN.md`

## Project status
**V0.17 remains the released/public baseline. V0.18 is active at G0 + G1 + G2 + G3 complete / G4 next.**
