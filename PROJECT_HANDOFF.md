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

## Current project state
- Current released/public baseline: **V0.17 – Duel Arena / Đấu Trường 1v1**.
- Runtime/public label remains **V0.17** until V0.18 release closure.
- V0.17 has no unfinished checkpoint.
- Active development roadmap: **V0.18 – Graphics & Presentation Overhaul**.
- V0.18 authoritative plan: `V018_GRAPHICS_PLAN.md`.
- V0.18 status: **G0 + G1 complete, G2 next**.

## Read first in a new chat
1. `README.md`
2. `PROJECT_HANDOFF.md`
3. `ROADMAP.md`
4. `V018_GRAPHICS_PLAN.md`
5. `V017_RELEASE_VALIDATION.md`
6. `V017_DUEL_ARENA_PLAN.md`

Then fetch latest before editing:
- `js/duel-renderer.js`
- `js/duel-renderer-v2.js`
- `js/duel-visual-assets.js`
- `js/duel-animation.js`
- `js/duel-engine.js`
- `js/duel-ui.js`
- `assets/duel/fighters/base/manifest.json`
- `index.html`
- `.github/workflows/pages.yml`

## V0.17 frozen gameplay baseline
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

Do not alter V0.17 gameplay numbers/rules merely to implement V0.18 visuals.

## Duel combat contract
- fighters are fully automatic; player does not manually move/attack
- normal attack remains close range; ranged pressure is build-driven
- build-derived preferred distance controls pressure/kiting behavior
- one flat logical arena in the V0.17 baseline
- renderer is replaceable and does not own combat truth
- world hitboxes/logic are independent from artwork pixels
- pressure phases are fixed:
  - 0–45s NORMAL
  - 45–60s HUYẾT CHIẾN
  - 60s+ TỬ CHIẾN until K.O.

## V0.18 graphics direction
V0.18 is graphics/presentation-first, not a gameplay expansion.

Target visual direction:
- original dark-fantasy cultivation / martial-magic 2D style
- strong readable fighter silhouettes
- darker environment palette so elemental/Rare VFX remain readable
- crisp 2D sprites rather than pseudo-3D realism
- do not copy protected characters, logos, signature costumes or another game's exact visual identity

Implementation direction:
- **sprite-sheet/image-sequence first**
- renderer abstraction remains **skeletal-ready** for a later version
- V0.17 vector renderer remains a verified fallback during V0.18
- manifests drive assets/animation timing/anchors
- runtime assets live under public `assets/`

## V0.18 architecture rules
Simulation stays authoritative.

`js/duel-engine.js` and Duel content modules own:
- position/facing
- action state
- HP/shield
- hit/damage/dodge result
- projectile truth
- control/KO state
- combat events

Graphics must never decide:
- hit success
- damage
- cooldown
- knockback distance
- fatal/revive ordering
- tournament outcome

Preserve visual anchors:
- head
- chest
- leftHand
- rightHand
- feet
- front
- back
- target

Required semantic animation states:
- idle
- walk
- run
- dash
- melee
- ranged
- cast
- hit
- block
- knockback
- knockdown
- recover
- ko

## V0.18 checkpoint map

### G0 — COMPLETE ✅
- scope/art direction locked
- manifest/asset architecture locked
- sprite-first/skeletal-ready choice locked
- vector fallback locked
- no-gameplay-change principle locked

### G1 — COMPLETE ✅: Asset loader + Renderer V2 foundation
Delivered:
- `js/duel-visual-assets.js` manifest/image loader + cache
- `js/duel-animation.js` semantic state/frame resolver + per-frame anchors
- `js/duel-renderer-v2.js` asset-driven Renderer V2 wrapper/factory
- `assets/duel/fighters/base/manifest.json` + one original proof `idle` asset
- public Pages pipeline now includes `assets/`
- exact Pages manifest/source integrity validation
- URL/internal renderer switching (`vector` ↔ `v2`)
- missing state/asset returns safely to the V0.17 vector renderer
- G1 smoke test under `tests/v018-g1-assets-smoke.js`
- full V0.16/V0.17 Pages regression chain remained green at G1 integration

G1 rule now proven:
- use an asset only when that exact semantic state exists
- never substitute `idle` artwork for a missing combat state
- missing assets must not crash or alter simulation

### G2 — NEXT: Fighter Visual V2
Complete production fighter state coverage and player/opponent readability.

Required work:
- replace covered states cleanly instead of drawing asset over the vector fighter
- complete idle/walk/run/dash/melee/ranged/cast/hit/block/knockback/knockdown/recover/ko
- stable root/feet alignment
- horizontal facing + anchor correctness
- player/opponent differentiation
- preserve floor/contact shadow
- preserve shield/frost/orbit attachments
- validate state/asset batches in-engine before creating the full art set

### G3 — Arena + Camera Presentation V2
One production-quality multi-layer arena, parallax, framing, impact camera and phase presentation.

### G4 — Full Duel VFX Readability
Use shared visual families plus stronger Hợp Đạo/Siêu Cấp/Rare overrides. Full mechanics need readable visuals, not necessarily 140 bespoke cinematics.

### G5 — UI/HUD/Tournament polish
Upgrade lobby/scouting/reward/combat HUD/round/K.O./result presentation while preserving truth text and mobile usability.

### G6 — Performance + fallback hardening
Preload/cache/memory/effect limits/quality policy/mobile reductions/reduced-motion/vector fallback.

Presentation caps must never become hidden gameplay caps.

### G7 — Release validation
All V0.16 + V0.17 tests green, Renderer V2 normal path, fallback validated, production assets present in exact Pages artifact, desktop/mobile rendering green, release docs updated, then promote runtime/public label to **V0.18**.

## Critical implementation order
Do not start by generating dozens of final images.

Current progression:
1. G1 asset/renderer infrastructure ✅
2. one proof asset/state ✅
3. validate transform/anchors/animation ✅ foundation proven
4. expand fighter states ← **NEXT**
5. arena/camera
6. VFX families
7. UI polish
8. performance/fallback
9. release validation

## Locked terminology / truth rules
- Kỹ Năng / Hợp Đạo Kỹ / Siêu Cấp / Thần Kỹ / Thần Bí Kỹ / TỐI ĐA.
- Player-facing UI remains Vietnamese.
- No hidden gameplay caps, cooldowns, stack maxima, target limits, retry rules or weighting.
- Preserve V0.12 hidden-shield-cap removal.
- Preserve Survival `Săn Ấn`: marked target gives +25% base XP only.
- Choice-card relation hints only appear when that exact choice immediately completes the unlock.
- Tests live under `tests/`.
- Pages publishes `assets/`; test harnesses still must not ship publicly.

## Status for next conversation
**Continue V0.18 from G2. G0 and G1 are complete. Do not reopen V0.17 content/balance work. Expand fighter state coverage incrementally and keep vector rendering as the state-by-state fallback until G2 coverage is complete.**

Recommended continuation prompt:

`Tiếp tục VGpro9X/auto-battle-roguelite từ V0.18. GitHub main là canonical. Đọc README.md, PROJECT_HANDOFF.md, ROADMAP.md và V018_GRAPHICS_PLAN.md. G0 + G1 đã complete; G2 Fighter Visual V2 là checkpoint tiếp theo. Bắt đầu bằng state-by-state clean replacement để state có asset thay vector hoàn toàn, state chưa có asset vẫn fallback vector; sau đó mở rộng fighter states từng batch, không thay combat/AI/balance. Fetch file trước khi sửa và commit sau mỗi checkpoint có ý nghĩa.`
