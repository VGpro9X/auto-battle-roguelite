# V0.20 — Complete Visual Rebuild Plan

Status: **APPROVED / IN DEVELOPMENT — B0 STARTED**

Canonical source: GitHub `main` in `VGpro9X/auto-battle-roguelite`.

Current released baseline: **V0.19 – Tactical AI & Movement Intelligence**.

V0.18 remains the frozen graphics/presentation regression baseline and V0.17 remains the frozen mechanics/content regression baseline.

## 1. Goal

V0.20 upgrades the project from a functional asset-driven web-game presentation into a cohesive, high-quality **2D dark-fantasy roguelite with 2.5D presentation depth** while preserving gameplay truth.

Target visual identity: **original Dark Fantasy × Cultivation × Martial Magic**.

Priority order: readability → silhouette → motion → impact → spectacle.

The final player-facing result must look intentionally art-directed rather than like unrelated generated assets assembled together.

## 2. Scope lock

V0.20 is a visual rebuild. It does not silently rebalance combat, AI, tournament logic or skill acquisition.

Locked truth includes:
- V0.19 tactical AI and movement behavior
- V0.17/V0.16 combat/content rules
- 80 base Kỹ Năng
- 28 Hợp Đạo Kỹ
- 12 Siêu Cấp
- 20 Rare rules
- 64-fighter Best-of-3 Duel tournament
- HUYẾT CHIẾN at 45s and TỬ CHIẾN at 60s+
- fatal/revive ordering
- damage/cooldown/skill acquisition truth
- Survival Săn Ấn +25% base XP rule
- no hidden gameplay caps/cooldowns/stack maxima/target limits/retry rules/weighting

Simulation remains the only source of combat truth. Presentation reacts to simulation events and never decides outcomes.

## 3. Technology direction

V0.20 remains **2D** and adds a premium **2.5D presentation layer** through:
- layered environments
- parallax
- foreground occlusion
- contact shadows
- atmospheric particles
- presentation-only dynamic lighting
- camera response
- semantic VFX
- depth-aware compositing

A full 3D conversion is explicitly out of scope.

## 4. Art direction

### 4.1 Fighter
One original neutral-class Wanderer/Cultivator master design capable of visually supporting melee, ranged, magic, mobility, sustain and control builds.

Requirements:
- strong silhouette at gameplay scale
- readable hands/head/weapon/action line
- restrained dark base palette so skill VFX remain readable
- asymmetric but not noisy costume landmarks for facing/motion readability
- no copied protected character, costume, logo or franchise identity

### 4.2 Enemy language
Enemy families:
- Fallen
- Beast
- Wraith
- Construct
- Abyssal

Each family may expose melee, fast, tank, ranged and elite archetypes where gameplay requires them. Silhouette must communicate threat role before text.

### 4.3 Environment
Canonical arena remains **Ashen Sanctum**, rebuilt as V3 artwork while preserving logical Duel geometry.

Six visual layers remain:
1. sky
2. far
3. mid
4. ambient
5. floor
6. foreground

Visual themes: ruined sanctuary, ash, ancient cultivation architecture, restrained supernatural glow, readable combat floor.

### 4.4 UI
Visual language: dark glass + aged metal + mystical rune accents.

UI decoration must never reduce text/card readability. Desktop and mobile use the same art language but may use different layout composition rather than naive scaling.

## 5. Fighter Visual V3

Preserve the stable 13-state semantic contract:
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

Production animation should use multi-frame anticipation/action/recovery where appropriate instead of abrupt state swaps.

Preserve the eight anchor contract:
- head
- chest
- leftHand
- rightHand
- feet
- front
- back
- target

Artwork pixels never define hitboxes.

## 6. Enemy Visual V3

Deliver:
- coherent family silhouettes
- archetype readability
- elite/boss differentiation
- consistent shadow/root handling
- hit/status readability
- mobile-safe visual scale

Enemy art must reuse a controlled style bible and palette rules so generated production assets remain coherent.

## 7. Ashen Sanctum V3

Rebuild all six production layers with original artwork.

Requirements:
- preserve gameplay geometry and world coordinates
- clear floor/character separation
- safe contrast behind HUD and fighters
- parallax-safe edges
- desktop and compact-mobile framing
- atmosphere that can react visually to HUYẾT CHIẾN/TỬ CHIẾN without changing gameplay

## 8. Lighting and shadow

Presentation-only 2D lighting system:
- fighter/enemy contact shadows
- local skill/projectile glow
- impact/explosion flash
- short high-tier atmosphere tint
- restrained low-HP vignette
- HUYẾT CHIẾN/TỬ CHIẾN atmosphere states

No lighting result may change combat truth or visibility logic used by AI.

## 9. Combat VFX V3

Build a reusable VFX primitive library rather than one bespoke rendered animation per skill.

Core families include:
- slash
- impact
- pierce
- projectile
- explosion
- lightning
- fire
- frost
- poison
- shadow
- spirit/light
- blood
- shield
- heal
- aura
- teleport
- shockwave
- ground rune
- orb
- beam

Skills map to compositions of primitives. This provides consistency and makes the complete content set feasible.

## 10. Skill-tier visual hierarchy

### Kỹ Năng
Compact, fast, low-noise effects.

### Hợp Đạo Kỹ
Additional layers, signature aura/rune and stronger impact language.

### Siêu Cấp
Large composition, lighting response and bounded camera response.

### Thần Kỹ
Distinct signature VFX and brief atmosphere reaction.

### Thần Bí Kỹ
Highest spectacle tier: unique rune/screen-space/environmental presentation where appropriate, still bounded by gameplay readability and performance budgets.

## 11. Projectile V3

Target approximately 15–20 reusable projectile archetypes. Each may combine:
- head
- trail
- glow
- impact

Examples: spirit bolt, fire orb, ice shard, lightning spear, shadow blade, blood projectile, energy wave, magic missile and soul orb.

## 12. Status-effect language

Status effects require shape/motion identity in addition to color:
- shield: shell/barrier
- burn: ember/flame
- freeze: frost/crystal
- poison: toxic mist
- bleed: crimson directional particles
- slow: ring/distortion/frost cue
- stun: energy fragments
- mark: rune marker
- buff: rising motion
- debuff: descending/dark motion

Do not rely on hue alone.

## 13. Rare visual identity

All 20 Rare rules retain their gameplay truth but receive coherent V3 signatures through combinations of aura, rune, trail, idle particles and trigger effects.

Build progression should become increasingly visible on the fighter without overwhelming the screen.

## 14. UI/HUD V3

Rebuild presentation for:
- main menu
- mode selection
- Survival HUD
- Duel HUD
- HP/shield/XP
- skill choice cards
- reroll
- Codex
- Duel lobby
- scouting
- VS screen
- tournament bracket
- round/K.O. presentation
- rewards/results
- Champion/elimination state

Player-facing UI remains Vietnamese.

## 15. Icon system

Create one coherent icon grammar:
- dominant readable symbol
- simple supporting background
- rarity/tier frame
- strong silhouette at 48–64 px

Production coverage includes base skills, Hợp Đạo, Siêu Cấp and relevant Rare/status/system icons. Avoid tiny AI-generated detail that collapses at runtime scale.

## 16. Combat feedback polish

Presentation-only polish may include:
- bounded hit-stop illusion/presentation response without changing simulation timing
- micro camera shake
- directional impact
- damage-number motion
- critical response
- block response
- dodge trail
- short K.O. emphasis

Simulation timing and combat ordering remain authoritative.

## 17. Asset generation pipeline

Production pipeline:

Art Bible → Character Master → Environment Master → VFX Bible → UI Bible → Production Generation → Cleanup → Crop/Scale → Naming → Compression → Manifest → Runtime Integration → Validation.

Rules:
- production art is original/generated specifically for this project
- internet/reference imagery is inspiration only and is never shipped as a game asset
- generated assets must pass consistency review before integration
- source/master assets and runtime-optimized assets may be separated
- transparent assets must be checked for halos/background contamination
- runtime dimensions, pivots, anchors and naming are deterministic

Expected final runtime inventory is approximately 150–250 assets, reduced through sheets/atlases/reusable VFX composition rather than hundreds of independent bespoke generations.

## 18. Renderer V3 architecture

Target stack:

Simulation → Visual Event Layer → Renderer V3 → Animation / VFX / Lighting / Camera / Asset System

Fallback chain:

Renderer V3 → Renderer V2 → vector renderer

Renderer V3 may consume existing stable semantic states/events but never owns combat truth.

## 19. Quality/performance tiers

### FULL
High-quality desktop path: full particles, lighting, parallax and appropriate DPR.

### BALANCED
Default mobile/general path: reduced particles/compositing/resolution where needed.

### LOW / REDUCED
Weak-device/reduced-motion path: restrained camera motion, particles and expensive compositing.

Gameplay truth is identical across tiers.

## 20. Checkpoint roadmap

### B0 — Visual Audit & Art Bible
- audit current V0.18/V0.19 rendering/assets/UI
- lock palette, silhouette, proportions, scale and camera rules
- lock generation specs and asset naming
- create Fighter/Enemy/Environment/VFX/UI visual bibles
- define asset inventory and performance budgets

### B1 — Renderer V3 Foundation
- V3 asset/layer architecture
- compatibility with stable semantic states/events
- V3 feature flags and fallback chain
- deterministic asset validation

### B2 — Fighter Master Design
- generate original master fighter
- select/normalize production master
- turnaround/reference sheet
- silhouette/game-scale validation

### B3 — Fighter Animation Production
- produce all 13 states
- preserve feet/root stability
- author eight anchors
- integrate and validate facing/mirroring

### B4 — Enemy Visual Families
- produce/integrate enemy families and required archetypes
- elite presentation
- status/hit readability

### B5 — Ashen Sanctum V3
- generate/integrate six environment layers
- parallax/foreground/atmosphere
- desktop/mobile composition validation

### B6 — Lighting & Shadow
- contact shadows
- local glow/impact lighting
- atmosphere state reactions
- quality-tier integration

### B7 — Core Combat VFX Library
- reusable primitive families
- projectile architecture
- status effects
- transient lifecycle/budgets

### B8 — Skill Visual Mapping
- map complete skill ecosystem to V3 compositions
- coverage validation with no unmapped production skill

### B9 — High-Tier Spectacle
- Hợp Đạo / Siêu Cấp / Thần Kỹ / Thần Bí Kỹ hierarchy
- 20 Rare signatures
- readability/performance caps

### B10 — UI/HUD V3
- Survival/Duel/menu/Codex/tournament/result presentation
- dedicated desktop/mobile layouts where necessary

### B11 — Icon Production
- coherent icon grammar
- complete required runtime coverage
- small-size readability validation

### B12 — Animation & Combat Polish
- impact/camera/trail/KO polish
- presentation cadence tuning
- no simulation ownership leakage

### B13 — Optimization / Mobile / Fallback
- asset compression and memory audit
- FULL/BALANCED/LOW gates
- reduced-motion validation
- Renderer V3 → V2 → vector fallback validation

### B14 — Integration / Release
- V0.16–V0.19 regression matrix
- V0.20 graphics/browser/mobile validation
- exact GitHub Pages artifact validation
- promote runtime/public label to V0.20 only after all gates are green
- final human test by project owner

## 21. Release discipline

- GitHub `main` is canonical.
- Fetch latest content/blob SHA before editing an existing file.
- Commit every meaningful checkpoint.
- Do not promote the public/runtime version label before B14 release gates pass.
- During development the public released baseline remains V0.19 unless an explicitly safe preview mechanism is introduced.
- Tests remain under `tests/` and are not shipped in the Pages artifact.

## 22. Definition of Done

V0.20 is complete only when:
- production gameplay presentation uses V3 artwork with no obvious placeholder path in the normal renderer
- 13 fighter states are complete and integrated
- required enemy families/archetypes are visually coherent
- Ashen Sanctum V3 is complete
- complete production skill ecosystem has visual mapping
- high-tier skills are visually distinct from ordinary skills
- all 20 Rare rules have V3 visual identity
- required UI and icons are coherent on desktop/mobile
- gameplay truth, AI, tournament and skill acquisition remain unchanged unless separately authorized
- Renderer V2 and vector fallbacks remain functional
- no missing production asset
- no production console/runtime error
- desktop/mobile/performance/reduced-motion gates pass
- historical V0.16/V0.17/V0.18/V0.19 regressions pass
- exact GitHub Pages deployment passes
- runtime/public label is promoted to V0.20 only after validation
- project owner performs the final human visual/gameplay test

## 23. Current continuation point

**V0.20 is approved. Start at B0. Do not skip the Art Bible and production-spec lock before bulk asset generation.**
