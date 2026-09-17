# V0.20 — Complete Visual Rebuild Plan

Status: **APPROVED / IN DEVELOPMENT — B0–B3 COMPLETE, B4 ACTIVE**

Canonical source: GitHub `main` in `VGpro9X/auto-battle-roguelite`.

Current released baseline: **V0.19 – Tactical AI & Movement Intelligence**. V0.18 remains the frozen graphics/presentation regression baseline and V0.17 remains the frozen mechanics/content regression baseline.

## Goal
Upgrade the project into a cohesive high-quality **2D dark-fantasy roguelite with 2.5D presentation depth**, preserving gameplay truth. Visual identity: **original Dark Fantasy × Cultivation × Martial Magic**. Priority: readability → silhouette → motion → impact → spectacle.

## Locked gameplay truth
V0.20 is presentation-first. It does not silently rebalance V0.19 tactical AI/movement, V0.17/V0.16 combat/content, 80 base Kỹ Năng, 28 Hợp Đạo Kỹ, 12 Siêu Cấp, 20 Rare, 64-fighter Best-of-3 Duel, HUYẾT CHIẾN/TỬ CHIẾN timing, fatal/revive ordering, damage/cooldown/skill acquisition, Survival Săn Ấn +25% base XP, or hidden-cap rules. Simulation remains authoritative.

## Technology direction
Remain 2D; add 2.5D depth with layered environments, parallax, foreground occlusion, contact shadows, atmospheric particles, cosmetic lighting, camera response, semantic VFX and depth-aware compositing. Full 3D conversion is out of scope.

## Production specifications
The detailed production truth is split into locked documents:
- `V020_ART_BIBLE.md` — visual identity, palette/value, fighter/enemy/environment/VFX/UI/icon language.
- `V020_ASSET_PRODUCTION_SPEC.md` — deterministic asset inventory, generation acceptance, runtime tree/formats/performance policy.
- `V020_RENDERER_V3_CONTRACT.md` — simulation/presentation ownership, V3→V2→vector fallback, depth/lighting/camera/quality rules.
- `V020_CONCEPT_GENERATION_BRIEFS.md` — first production concept briefs for Ash Wanderer and Ashen Sanctum V3.
- `V020_ASH_WANDERER_MASTER_SPEC.md` — canonical fighter identity, scale/root/mirroring/anchor and B3 animation constraints.
- `V020_B3_ANIMATION_PRODUCTION_SPEC.md` — completed 13-state runtime fighter production and validation contract.

New runtime work is isolated under `assets/v020/`; V0.18 production assets remain intact as fallback.

## Stable compatibility contracts
Fighter semantic states remain 13: `idle`, `walk`, `run`, `dash`, `melee`, `ranged`, `cast`, `hit`, `block`, `knockback`, `knockdown`, `recover`, `ko`.

Anchors remain eight: `head`, `chest`, `leftHand`, `rightHand`, `feet`, `front`, `back`, `target`.

Ashen Sanctum logical geometry remains 1000×560, floorY 475, bounds 54–946, with six visual layers: sky/far/mid/ambient/floor/foreground.

## Visual production scope
- canonical fighter: original neutral-class **Ash Wanderer**
- enemy families: Fallen / Beast / Wraith / Construct / Abyssal, only actual gameplay roles produced
- Ashen Sanctum V3: one cohesive environment master → six production layers
- reusable VFX grammar: slash/impact/pierce/explosion/lightning/fire/frost/poison/shadow/spirit-light/blood/shield/heal/aura/teleport/shockwave/ground-rune/orb/beam
- reusable projectile grammar with head/trail/impact and optional quality-aware glow
- status grammar with shape/motion cues, not hue alone
- high-tier hierarchy for Hợp Đạo / Siêu Cấp / Thần Kỹ / Thần Bí Kỹ plus all 20 Rare signatures
- modular UI/HUD V3 for Survival/Duel/menu/Codex/tournament/results
- deterministic icon coverage for content IDs, readable at 48–64 px

## Renderer V3 target
`Simulation → Visual Event Layer → Renderer V3 → Animation / VFX / Lighting / Camera / Assets`

Fallback: `Renderer V3 → Renderer V2 → vector renderer`.

FULL/BALANCED/LOW affect presentation cost only, never gameplay truth.

## Checkpoint roadmap
- **B0 — Visual Audit & Art Bible — COMPLETE ✅**
- **B1 — Renderer V3 Foundation — COMPLETE ✅**
  - isolated V0.20 asset manifests/loader/validator
  - locked semantic contracts and quality tiers
  - runtime Duel bootstrap and deterministic V3→V2→vector fallback
  - foundation/bridge/runtime-wiring smoke gates under `tests/`
- **B2 — Fighter Master Design — COMPLETE ✅**
  - Ash Wanderer canonical identity locked
  - turnaround/material/silhouette direction selected
  - gameplay target remains 256×256 logical frame / 176 world-width compatibility
  - 96px and 64px readability stress-review rules locked
  - right-facing production orientation and mirror constraints locked
  - eight-anchor rules locked
  - all 13 semantic pose intents and initial frame targets locked
  - generated concept/master board explicitly treated as reference, never cropped directly into runtime
- **B3 — Fighter Animation Production — COMPLETE ✅**
  - all 13 semantic states have dedicated runtime sheets
  - scale/root/crop normalized to 256×256 logical cells / 176 display width
  - eight anchors authored for every frame
  - state-relative timing and loop/non-loop behavior locked
  - real V3 partial replacement suppresses the corresponding V2 fighter body instead of drawing over it
  - shield/frost/orbit presentation retained for V3 fighters
  - B3.3 reaction/defeat states are merged through `b3-final-states.json`
  - 13/13 runtime coverage gate added under `tests/`
  - no combat/AI/tournament truth moved into presentation
- **B4 — Enemy Visual Families — ACTIVE**
  - audit actual enemy types used by Survival/Duel before producing art
  - establish Fallen / Beast / Wraith / Construct / Abyssal silhouettes only where gameplay roles require them
  - build runtime enemy visual contract with role/state/status/elite readability
  - preserve all existing enemy movement/combat/XP/drop truth
- **B5 — Ashen Sanctum V3** — six production layers, parallax/foreground/atmosphere, desktop/mobile validation
- **B6 — Lighting & Shadow** — contact shadows, local glow/impact lighting, atmosphere states, quality tiers
- **B7 — Core Combat VFX Library** — primitives/projectiles/status/lifecycle budgets
- **B8 — Skill Visual Mapping** — complete skill ecosystem coverage
- **B9 — High-Tier Spectacle** — Hợp Đạo/Siêu Cấp/Thần Kỹ/Thần Bí Kỹ + 20 Rare signatures
- **B10 — UI/HUD V3** — Survival/Duel/menu/Codex/tournament/results; desktop/mobile composition
- **B11 — Icon Production** — complete coherent runtime icon coverage
- **B12 — Animation & Combat Polish** — impact/camera/trail/KO presentation, no simulation leakage
- **B13 — Optimization / Mobile / Fallback** — compression/memory, quality gates, reduced motion, V3→V2→vector fallback
- **B14 — Integration / Release** — V0.16–V0.19 regressions, V0.20 browser/mobile/Pages validation, then promote label to V0.20 and owner final test

## Release discipline
GitHub `main` is canonical. Fetch latest SHA before edits. Commit every meaningful checkpoint. Do not promote public/runtime V0.20 before B14 gates pass. Current public baseline stays V0.19. Tests remain under `tests/` and are not shipped in Pages artifact.

## Definition of Done
V0.20 requires normal production gameplay to use coherent V3 artwork, complete 13 fighter states, coherent required enemies, Ashen Sanctum V3, complete skill visual mapping, distinct high tiers, 20 Rare identities, coherent desktop/mobile UI/icons, unchanged gameplay truth, functional V2/vector fallback, no missing assets/runtime errors, desktop/mobile/performance/reduced-motion gates, historical V0.16–V0.19 regressions, exact Pages deployment, then V0.20 label promotion and final owner visual/gameplay test.

## Current continuation point
**B0–B3 COMPLETE. B4 ACTIVE: audit the actual runtime enemy model first, then produce only the enemy families/archetypes that map to real gameplay entities. Public/runtime label remains V0.19 until B14.**