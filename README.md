# Auto Battle Roguelite

Current release: **V0.18 – Graphics & Presentation Overhaul**

Public build: `https://vgpro9x.github.io/auto-battle-roguelite/`

GitHub `main` is canonical.

## Current status
- V0.17 is **COMPLETE / RELEASED** and remains the frozen historical Duel mechanics/content baseline.
- V0.18 G0 architecture lock: **COMPLETE**.
- V0.18 G1 asset loader + Renderer V2: **COMPLETE**.
- V0.18 G2 Fighter Visual V2: **COMPLETE — 13 / 13 semantic states**.
- V0.18 G3 Arena + Camera Presentation V2: **COMPLETE**.
- V0.18 G4 Full Duel VFX Readability Pass: **COMPLETE**.
- V0.18 G5 Duel UI / HUD / Tournament Presentation Polish: **COMPLETE**.
- V0.18 G6 Performance / Quality / Fallback Hardening: **COMPLETE**.
- V0.18 G7 Integration / Release Validation: **COMPLETE**.
- Runtime/public version label: **V0.18**.

Release evidence: `V018_RELEASE_VALIDATION.md`.

## V0.18 graphics release
Renderer V2 is asset/manifest-driven and keeps the V0.17 vector renderer as a verified fallback. Simulation remains the only source of combat truth; graphics never decide hit success, damage, cooldowns, targeting, knockback, fatal ordering, AI decisions, skill offers or tournament outcomes.

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
- 15 cumulative VFX families: physical, projectile, fire, frost, lightning, poison, blood, defense, heal, control, summon, area, chain, time, soul
- stronger Hợp Đạo / Siêu Cấp overlays
- 20 / 20 Rare visual identities/signatures
- combat-active Rare trigger coverage, including visible `heavenSeal` consumption
- `divineGift` intentionally has no fabricated combat VFX because it is reward/acquisition-only
- anchor/world-coordinate placement and transient effect expiry
- G4A–G4E smoke/audit gates green

### G5 delivered
- combat HUD hierarchy for HP, shield, timer, score, round and phase
- safe-area-aware desktop/mobile HUD with pointer-transparent presentation
- polished Duel mode entry, lobby, opponent scouting and VS screen
- reward/build card hierarchy for base Rank, TỐI ĐA, Siêu Cấp hints, Thần Kỹ and Thần Bí Kỹ
- exact-choice evolution hints and one-reroll semantics preserved
- semantic `ROUND`, `K.O.`, round-winner and draw/replay presentation driven by existing engine events
- Champion / elimination result presentation mirrors already-resolved tournament truth
- G5E rendered desktop/mobile closure verifies scrolling, clickability, horizontal overflow, HUD pointer behavior and combat-center occlusion

### G6 delivered
- `js/duel-visual-quality.js` full/constrained presentation profiles plus reduced-motion policy
- canvas DPR cap follows active quality profile
- camera shake/zoom honors quality/reduced-motion without changing semantic combat events
- manifest/image cache dedupe, pending/settled observability, decoded-memory estimates and safe LRU lookup pruning
- presentation-only transient VFX budgets with `droppedPresentation` observability; engine event input remains intact
- production V2 preload confirms all 13 fighter states + `Ashen Sanctum`
- forced-vector Best-of-3 validation
- partial/missing-asset fallback Best-of-3 validation
- G6D browser audit exposed and fixed an invalid `ctx.ellipse()` Renderer V2 call
- G6E desktop full-quality, mobile constrained-quality and reduced-motion validation green

### G7 delivered
- integrated static release audit for version/content/assets/workflows
- production Renderer V2 desktop/mobile browser validation
- HTTP validation of every production fighter/arena manifest reference
- production console/runtime error audit
- 13 / 13 state + 8-anchor + six-layer arena release audit
- normal V2 Best-of-3 completion
- forced-vector and partial-asset fallback revalidation
- G6 performance/reduced-motion revalidation
- exact Pages artifact validation
- V0.17 historical mechanics/content regression preserved
- public shell/runtime/Duel release label promoted to **V0.18** only after pre-release G7 gates passed

## V0.17 historical release baseline
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
- Presentation work must not rebalance combat/AI/tournament/skill acquisition merely for visuals.

## Read before future development
1. `README.md`
2. `PROJECT_HANDOFF.md`
3. `ROADMAP.md`
4. `V018_GRAPHICS_PLAN.md`
5. `V018_RELEASE_VALIDATION.md`
6. `V017_RELEASE_VALIDATION.md`
7. `V017_DUEL_ARENA_PLAN.md`

## Project status
**V0.18 is COMPLETE / RELEASED. V0.17 remains the frozen historical Duel mechanics/content baseline.**
