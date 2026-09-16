# V0.20 — Asset Inventory & Production Generation Spec

Status: **B0 LOCKED SPEC**

Canonical source: GitHub `main`. This file defines what V0.20 must create, how generated masters become runtime assets, and what is allowed to enter production.

## 1. Production principle
V0.20 uses original project-specific generated artwork. Reference imagery is inspiration only and is never shipped. Production masters are reviewed against `V020_ART_BIBLE.md` before runtime integration.

The asset pipeline is: brief → generation → consistency review → cleanup → transparent isolation where needed → normalization → runtime derivative → manifest → browser validation.

## 2. Runtime root
New production work lives under `assets/v020/` during development. V0.18 assets remain untouched as Renderer V2 fallback.

Target tree:
- `assets/v020/fighters/ash-wanderer/`
- `assets/v020/enemies/{fallen,beast,wraith,construct,abyssal}/`
- `assets/v020/arenas/ashen-sanctum/`
- `assets/v020/vfx/{core,projectiles,status,tier,rare}/`
- `assets/v020/ui/{frames,panels,ornaments,icons}/`

## 3. Fighter inventory
Master identity: **Ash Wanderer**.

Required concept/master deliverables before animation production:
- neutral hero master pose
- front/three-quarter gameplay-facing reference
- silhouette sheet at gameplay scale
- costume/material reference
- face/head reference kept simple enough for runtime readability
- hands/forearms reference for anchor/VFX consistency

Required runtime semantic states remain 13:
`idle`, `walk`, `run`, `dash`, `melee`, `ranged`, `cast`, `hit`, `block`, `knockback`, `knockdown`, `recover`, `ko`.

Initial frame targets (subject to B3 motion validation):
- idle 6
- walk 8
- run 8
- dash 6
- melee 10
- ranged 8
- cast 10
- hit 4
- block 5
- knockback 5
- knockdown 8
- recover 8
- ko 8

Every frame retains eight anchors: `head`, `chest`, `leftHand`, `rightHand`, `feet`, `front`, `back`, `target`.

Source generation should be substantially larger than runtime presentation. Runtime derivatives must preserve a consistent square frame, root alignment and alpha edge quality. V2 logical scale compatibility is the starting point: 256×256 frame contract / displayWorldWidth 176, with V3 allowed to use higher-resolution sheets if browser/memory gates permit.

## 4. Enemy inventory
Five families are required: Fallen, Beast, Wraith, Construct, Abyssal.

Minimum visual roles per family are driven by actual gameplay needs; the production language supports melee, fast, tank, ranged and elite. Do not manufacture unused gameplay variants merely for art count.

Each integrated enemy requires:
- gameplay-scale silhouette approval
- root/contact shadow definition
- idle/move/action/hit/death presentation sufficient for its existing semantic behavior
- elite signature where applicable
- status-overlay compatibility

Enemy art must not visually imply mechanics the simulation does not have.

## 5. Ashen Sanctum V3 inventory
Preserve logical geometry: 1000×560, floorY 475, leftBound 54, rightBound 946.

Required six runtime layers:
- `sky`
- `far`
- `mid`
- `ambient`
- `floor`
- `foreground`

Concept/master generation should first create one cohesive full-scene key art. Production layers are then generated/derived to match that key art rather than independently inventing six unrelated scenes.

Layer requirements:
- overscan for camera/parallax
- seamless enough edges for allowed camera movement
- combat floor remains visually quiet
- foreground detail concentrated at outer framing regions
- no text/logos/watermarks
- no baked fighter/enemy silhouettes

## 6. VFX inventory
Reusable primitive library rather than one bespoke asset per skill.

Core primitive families:
slash, impact, pierce, explosion, lightning, fire, frost, poison, shadow, spirit-light, blood, shield, heal, aura, teleport, shockwave, ground-rune, orb, beam.

Projectile archetypes target:
spirit-bolt, fire-orb, ice-shard, lightning-spear, shadow-blade, blood-dart, energy-wave, magic-missile, soul-orb, stone-shard, wind-blade, poison-globule, rune-lance, void-needle, radiant-seal, chain-spark.

Each projectile composition supports head + trail + impact; glow is optional and quality-tier aware.

Status assets cover shield, burn, freeze, poison, bleed, slow, stun, mark, buff and debuff using shape/motion cues in addition to hue.

## 7. Tier/Rare inventory
High-tier presentation assets are composition/signature assets, not full-screen noise.

Coverage:
- Hợp Đạo signature grammar
- Siêu Cấp signature grammar
- Thần Kỹ signature grammar
- Thần Bí Kỹ signature grammar
- 20 Rare visual signatures

Rare signatures may use aura/rune/trail/idle particles/trigger effect combinations. They cannot alter combat truth.

## 8. UI inventory
V3 art coverage must support:
main menu, mode selection, Survival HUD, Duel HUD, HP/shield/XP, choice cards, reroll, Codex, Duel lobby, scouting, VS, bracket, round/K.O., reward/result, Champion/elimination.

UI artwork is modular. Prefer reusable frames/panels/corners/dividers/runes rather than baked screenshots. Text remains HTML/CSS/player-facing Vietnamese, never generated into image assets.

## 9. Icon inventory
Production icon coverage must be deterministic from content IDs. Required categories:
- 80 base Kỹ Năng
- 28 Hợp Đạo Kỹ
- 12 Siêu Cấp
- 20 Rare rules
- relevant status/system icons
- Thần Kỹ / Thần Bí Kỹ icons where those runtime content entries exist

Icons use one dominant symbol and no embedded text. Runtime readability is judged at 48 px and 64 px.

## 10. Generation acceptance rules
Reject a generated master if any of these fail:
- coherent with Art Bible
- original visual identity
- silhouette readable at target scale
- anatomy/action direction usable
- perspective matches gameplay
- no accidental letters, signatures or watermark-like marks
- no unexplained duplicate limbs/weapons
- no uncontrolled full-body glow
- transparent subjects isolate cleanly
- family/material language consistent with approved masters

Do not compensate for a bad master in code; regenerate/repair the art.

## 11. File format policy
Masters may be lossless/high resolution outside the runtime path. Runtime format is chosen per asset after browser testing:
- WebP preferred for painted opaque/alpha raster assets where quality is acceptable
- PNG allowed where alpha edge fidelity requires it
- SVG retained for procedural/simple vector fallback assets
- JSON manifests contain timing, dimensions, anchors, pivots, layer metadata and production version

No runtime code may depend on source/master files.

## 12. Performance budget policy
B0 establishes policy; B13 measures/tunes exact budgets.

Rules:
- preload only assets required for the immediate mode/scene
- lazy-load Codex/secondary presentation where safe
- avoid giant mostly-empty atlases
- transient VFX expire deterministically
- FULL/BALANCED/LOW may vary raster resolution, particles, glow and compositing only
- gameplay state and outcomes remain identical across quality tiers

## 13. Production sequence
1. Fighter + arena concept masters.
2. Approve visual consistency internally against Art Bible.
3. Fighter animation source production.
4. Arena six-layer production.
5. Enemy family masters and runtime derivatives.
6. Core VFX/projectile/status primitives.
7. Tier/Rare signatures.
8. UI modular art.
9. Icons.
10. Compression/atlasing/manifest validation.

## 14. B0 asset-spec gate
This spec is locked for B0. Bulk generation begins only after Renderer V3 boundaries and the two first concept briefs are also committed.