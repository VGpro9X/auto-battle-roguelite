# V0.18 — Graphics & Presentation Overhaul Plan

Status: **ACTIVE PLAN / IMPLEMENTATION NOT STARTED**

Canonical source: GitHub `main` in `VGpro9X/auto-battle-roguelite`.

Released baseline: **V0.17 – Duel Arena / Đấu Trường 1v1**.

V0.18 goal: **replace the prototype visual presentation with a scalable asset-driven graphics system while preserving V0.17 combat truth, AI, tournament logic and balance.**

---

# 1. Scope lock

V0.18 is a graphics/presentation version first.

Primary scope:
- higher-quality Duel fighter art and animation
- asset-driven renderer that can replace the V0.17 vector fighter renderer safely
- richer arena/background presentation
- camera impact and screen-space presentation
- readable skill/VFX presentation across the complete Duel ecosystem
- Duel HUD/menu visual polish
- mobile/desktop rendering quality and performance controls
- graphics asset pipeline, manifests, fallback behavior and validation

V0.18 does **not** change gameplay by default.

Do not change unless a visual integration bug makes it unavoidable:
- V0.17 combat numbers
- Duel AI decision logic
- tournament bracket/progression
- skill acquisition, Hợp Đạo, Siêu Cấp or Rare rules
- HUYẾT CHIẾN / TỬ CHIẾN rules
- Survival Movement V0.8
- V0.17 hitboxes, damage timing or combat ordering

If a visual effect appears to require a mechanic change, solve it in the renderer/presentation layer first.

---

# 2. Visual direction

## 2.1 Art direction
Use an **original dark-fantasy cultivation / martial-magic 2D style** suitable for the existing Vietnamese fantasy skill system.

Target feel:
- strong readable silhouettes
- dark arena atmosphere with high-contrast effects
- restrained base palette so elemental/rare VFX remain legible
- crisp 2D illustration rather than pseudo-3D realism
- energetic melee poses and supernatural skill effects
- original visual identity; do not copy protected Mortal Kombat, Shadow Fight, anime/game characters, logos or signature costumes

## 2.2 Readability rules
Gameplay readability is more important than decoration.

Always preserve:
- player/opponent side readability
- facing direction readability
- attack anticipation and impact timing
- projectile visibility
- shield / invulnerability / control-state visibility
- HUYẾT CHIẾN and TỬ CHIẾN phase readability
- HP/shield HUD clarity

Do not let large VFX hide fighters for long periods.

---

# 3. Architecture contract

V0.17 deliberately separated simulation and renderer. V0.18 must preserve that separation.

## 3.1 Combat truth remains simulation-owned
`js/duel-engine.js` and Duel skill modules decide:
- positions
- facing
- action/state
- HP/shield
- hit/damage outcome
- projectiles
- control/KO state
- semantic combat events

The graphics layer only visualizes those truths.

Renderer must never decide:
- whether an attack hits
- damage amount
- dodge success
- skill cooldown
- knockback amount
- fatal/revive ordering
- tournament outcome

## 3.2 Asset-driven renderer
Preferred V0.18 direction:

**Sprite-sheet / image-sequence first, skeletal-ready abstraction later.**

Reason:
- simpler to author and validate for the current browser game
- easier to replace individual states incrementally
- deterministic and lightweight enough for desktop/mobile
- no external runtime dependency required
- visual API can remain compatible with a future skeletal renderer

The V0.17 vector renderer remains a fallback until V0.18 asset coverage is complete.

## 3.3 Required visual animation state API
Keep/support these semantic fighter states:
- `idle`
- `walk`
- `run`
- `dash`
- `melee`
- `ranged`
- `cast`
- `hit`
- `block`
- `knockback`
- `knockdown`
- `recover`
- `ko`

Optional V0.18 extensions may include visual-only sub-states such as:
- `melee_alt`
- `cast_heavy`
- `victory`
- `intro`

These must map back to the stable simulation states rather than adding combat rules.

## 3.4 Required anchors
Preserve the V0.17 anchor contract:
- `head`
- `chest`
- `leftHand`
- `rightHand`
- `feet`
- `front`
- `back`
- `target`

Sprite metadata may define per-frame anchor offsets. VFX attaches to anchors; it must not infer hitboxes from image pixels.

---

# 4. Asset pipeline

Create an explicit public asset tree. Recommended structure:

```text
assets/
  duel/
    fighters/
      base/
        manifest.json
        idle.webp
        walk.webp
        run.webp
        dash.webp
        melee.webp
        ranged.webp
        cast.webp
        hit.webp
        block.webp
        knockback.webp
        knockdown.webp
        recover.webp
        ko.webp
    arenas/
      prototype-temple/
        manifest.json
        sky.webp
        far.webp
        mid.webp
        floor.webp
        foreground.webp
    vfx/
      manifest.json
      elemental.webp
      impact.webp
      aura.webp
      rare.webp
    ui/
      ...
```

Exact filenames may evolve, but the manifest-driven principle is locked.

## 4.1 Fighter asset standard
Recommended export baseline:
- transparent WebP or PNG
- frame box around `256×256` for normal gameplay sprites
- per-animation strips/sheets rather than one giant atlas
- consistent feet/root position in every frame
- no baked floor shadow inside fighter sprites
- artwork authored at higher resolution if desired, then exported down for runtime
- player/opponent may share the same base art with deterministic palette/accent treatment to avoid duplicating decoded memory

Minimum frame guidance:
- idle: 6–8
- walk/run: 6–8
- dash: 4–6
- melee/ranged: 6–10
- cast: 8–12
- hit/block: 4–6
- knockback/recover: 5–8
- knockdown/ko: 8–12

Animation timing must be metadata-driven, not inferred from file size.

## 4.2 Arena asset standard
Arena manifest should support:
- `id`
- logical width/height
- `floorY`
- left/right bounds
- background layers
- parallax factor per layer
- optional ambient overlays
- optional foreground masks

V0.18 initially upgrades **one canonical arena**. Multiple arenas are only required if explicitly promoted into the V0.18 scope later.

## 4.3 Public deployment change
V0.17 Pages publishes only `index.html`, `css/`, `js/`.

V0.18 must update Pages deployment to also publish:
- `assets/`

CI must fail if required production assets referenced by manifests are missing from the exact Pages artifact.

---

# 5. Technical modules planned

Recommended new modules:
- `js/duel-visual-assets.js` — manifest loading/cache/fallback
- `js/duel-animation.js` — animation state/time/frame resolution
- `js/duel-camera.js` — presentation camera, shake, impact zoom, bounds
- `js/duel-renderer-v2.js` — asset-driven Duel renderer
- `js/duel-vfx-v2.js` — semantic event → visual effect mapping
- `js/duel-visual-quality.js` — quality/performance policy
- `css/v018-graphics.css` — V0.18 Duel presentation/HUD styling

Existing `js/duel-renderer.js` remains the fallback/reference until G6 release closure.

Do not build V0.18 by wrapping `updateDuelRound()` or modifying Survival rendering loops.

---

# 6. Checkpoint roadmap

## G0 — Graphics design + architecture lock — COMPLETE WHEN THIS PLAN IS COMMITTED

Deliverables:
- V0.18 scope frozen
- art direction frozen
- asset folder/manifest contract frozen
- simulation/renderer separation reaffirmed
- sprite-first, skeletal-ready direction frozen
- fallback strategy frozen

Exit:
- future chat can start implementation without redesigning the architecture

---

## G1 — Asset loader + Renderer V2 foundation

Build the infrastructure before creating many assets.

Tasks:
- add `assets/` support to Pages build
- add visual asset manifest loader/cache
- graceful missing-asset fallback to V0.17 vector rendering
- add animation metadata/state resolver
- add per-frame anchor metadata support
- add Renderer V2 feature switch internally
- preserve exact world-to-screen transform independence
- no gameplay changes

Validation:
- existing V0.17 tests all green
- missing asset does not crash a match
- renderer can switch vector ↔ V2 without changing simulation result
- Pages artifact contains required assets

Exit: graphics infrastructure is safe enough to replace one fighter state at a time.

---

## G2 — Fighter Visual V2

Replace the prototype stick/silhouette fighter with the first complete original fighter asset set.

Required states:
- idle
- walk/run
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

Tasks:
- stable feet/root alignment
- horizontal facing flip without changing anchors/hitboxes
- action animation selection from semantic fighter state
- animation restart/interrupt rules
- player/opponent differentiation
- floor/contact shadow
- shield/frost/orbit attachments retained
- visual knockback/KO matches simulation position/state

Acceptance:
- no visible foot sliding during idle/attack transitions beyond reasonable animation tolerance
- attacks visually face the actual target
- KO state never visually returns to combat before round reset
- both sides remain identifiable on mobile

Exit: full Best-of-3 can be watched with no vector fighter required during normal coverage.

---

## G3 — Arena + Camera Presentation V2

Upgrade the single flat prototype arena without changing logical arena geometry.

Tasks:
- one original multi-layer arena
- parallax background layers
- richer floor/contact plane
- atmospheric ambient layer
- foreground layer that never blocks core combat readability
- camera framing based on both fighters
- mild impact shake
- mild attack/cast impact zoom
- phase presentation for HUYẾT CHIẾN / TỬ CHIẾN
- camera hard bounds; never lose fighters off-screen

Camera rules:
- simulation coordinates do not change
- no camera effect changes target selection or timing
- avoid motion sickness / excessive shaking
- mobile shake/zoom may be reduced automatically

Exit: arena no longer looks like a debug/prototype stage.

---

## G4 — VFX Readability Pass for Full Duel Ecosystem

Goal is full visual coverage, not 140 bespoke cinematic effects.

Use visual families plus high-value overrides.

Core families:
- physical/melee impact
- projectile
- fire
- frost
- lightning
- poison/DOT
- blood/lifesteal
- shield/defense
- heal/recovery
- control/slow/stun
- summon/orbit
- explosion/area
- chain
- time/space
- soul/death
- Rare rule / divine / mystic

Tasks:
- semantic events map to VFX families
- Hợp Đạo and Siêu Cấp receive stronger upgrade visuals than their base families
- all 20 Rare rules receive distinct readable visual identities where they activate
- projectiles use asset-driven sprites/trails where appropriate
- impact points use visual anchors
- no effect changes hitboxes
- phase/fatal/revive ordering remains visually understandable

Priority bespoke effects:
- major Siêu Cấp casts
- fatal save/revive Rare rules
- large area/control effects
- TỬ CHIẾN transition

Acceptance:
- every implemented Duel mechanic has a visible/readable representation when visually meaningful
- no critical defensive state is invisible
- no common build produces a permanent full-screen VFX wall

Exit: full V0.17 skill ecosystem has production-level visual readability.

---

## G5 — Duel UI / HUD / Tournament Presentation Polish

Tasks:
- visually upgrade Duel mode card/lobby
- pre-match VS presentation
- opponent scouting layout
- skill/reward cards polish without changing selection rules
- clearer Hợp Đạo / Siêu Cấp / Rare visual tiers
- combat HUD refinement
- round win markers
- match transition / round intro / K.O. presentation
- Champion/elimination result presentation
- preserve Vietnamese player-facing text

Rules:
- UI polish cannot hide mechanical descriptions
- rare chance/truth text remains explicit
- mobile tap targets remain usable

Exit: menus/HUD visually match the upgraded combat presentation.

---

## G6 — Performance, Quality Levels and Fallback Hardening

Target platforms:
- desktop PC browser
- Android/mobile browser

Tasks:
- asset preload strategy
- decoded-memory sanity
- image cache lifecycle
- cap transient particle/effect counts visually, without changing gameplay mechanics
- quality presets or automatic reductions for expensive presentation features
- reduce camera shake/parallax/particles on constrained/mobile rendering when needed
- optional reduced-motion support
- vector fallback remains usable if asset load fails

Important distinction:
visual particle/effect caps are presentation limits only. They must not cap gameplay projectiles, targets, damage instances or mechanics.

Validation targets:
- no unbounded effect array growth
- no repeated image decode/load each frame
- no large layout jank when entering Duel
- mobile browser flow stays responsive

Exit: upgraded visuals are safe enough for public Pages.

---

## G7 — V0.18 Integration / Release Validation

Automated:
- all V0.16 tests remain green
- all V0.17 Duel mechanics tests remain green
- render-switch determinism check
- asset manifest integrity check
- exact Pages artifact includes `assets/`
- browser console has no missing production asset errors
- desktop rendered flow
- mobile rendered flow
- combat can finish with V2 renderer active
- fallback renderer path also works

Visual validation:
- fighter animation state coverage
- player/opponent readability
- VFX family coverage
- major Hợp Đạo/Siêu Cấp/Rare readability
- arena/camera bounds
- HUD readability
- responsive mobile layout

Release closure:
- update `README.md`
- update `ROADMAP.md`
- update `PROJECT_HANDOFF.md`
- create `V018_RELEASE_VALIDATION.md`
- promote runtime/public label from development label to final **V0.18** only after all gates pass
- freeze V0.18 visual baseline

---

# 7. Implementation order rule

Do not start by generating dozens of final images.

Required order:
1. G1 asset/renderer infrastructure
2. one small proof asset set
3. validate transform/anchors/animation
4. expand fighter states
5. arena/camera
6. VFX families
7. UI polish
8. performance/fallback
9. release validation

This prevents expensive art generation from locking the project into a broken renderer contract.

---

# 8. Asset creation workflow for future chats

When actual art creation begins:
- generate/design one canonical fighter sheet or one animation state at a time
- keep the visual design original
- use transparent background for fighter/VFX assets
- preserve consistent root/feet placement
- avoid text/logos inside combat artwork
- test the asset in-engine before producing the entire state family
- keep source/master art separate from runtime-optimized exports if source files are introduced

Do not assume AI-generated frames are animation-compatible without alignment cleanup. Runtime validation is required after each state batch.

---

# 9. Definition of Done for V0.18

V0.18 may be marked `COMPLETE / RELEASED` only when:
- asset-driven Renderer V2 is the normal Duel path
- vector renderer remains a verified fallback
- complete fighter state set is integrated
- one production-quality arena is integrated
- camera/presentation system is integrated
- full Duel ecosystem has readable VFX coverage
- Duel UI/HUD presentation pass is complete
- desktop/mobile performance validation passes
- all V0.16 + V0.17 mechanic regression tests remain green
- exact public Pages artifact ships all required assets
- final runtime/docs label is **V0.18**

Multiple arenas, jump/aerial combat, online systems and new gameplay content are not automatically part of V0.18.

---

# 10. First checkpoint for the next chat

Start with **G1 — Asset loader + Renderer V2 foundation**.

Before editing:
1. read `README.md`
2. read `PROJECT_HANDOFF.md`
3. read `ROADMAP.md`
4. read `V018_GRAPHICS_PLAN.md`
5. read `V017_RELEASE_VALIDATION.md`
6. fetch latest `js/duel-renderer.js`, `js/duel-engine.js`, `js/duel-ui.js`, `index.html`, `.github/workflows/pages.yml`

Then implement G1 only, commit meaningful checkpoints frequently, and keep GitHub `main` canonical.
