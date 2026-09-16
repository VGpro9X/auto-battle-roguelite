# V0.20 — Complete Visual Rebuild Plan

Status: **APPROVED / IN DEVELOPMENT — B0–B1 COMPLETE, B2 NEXT**

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
  - V0.18/V0.19 asset/render architecture audited
  - Art Bible locked
  - asset inventory/generation spec locked
  - Renderer V3 ownership/fallback boundary locked
  - fighter and arena concept briefs ready
- **B1 — Renderer V3 Foundation — COMPLETE ✅**
  - isolated `assets/v020/` root/fighter/arena manifests and V3 loader/validator
  - locked 13-state, eight-anchor and six-layer semantic compatibility
  - FULL/BALANCED/LOW presentation quality normalization
  - runtime V3 feature flag/bootstrap wired into Duel without changing simulation ownership
  - deterministic V3→V2 fallback for missing proof fighter states and arena layers; V2 retains vector fallback
  - Duel start waits for the V3 bootstrap and safely continues through released fallback on failure
  - deterministic foundation, bridge and runtime-wiring smoke gates live under `tests/`
  - proof manifests intentionally contain no production fighter states/layers; B2/B5 will populate production art
- **B2 — Fighter Master Design — NEXT** — generate/select/normalize Ash Wanderer master, turnaround/reference, silhouette/game-scale validation
- **B3 — Fighter Animation Production** — all 13 states, root stability, eight anchors, facing/mirroring
- **B4 — Enemy Visual Families** — required family/archetype production, elite/status/hit readability
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
**B0–B1 COMPLETE. Begin B2 Fighter Master Design. Ash Wanderer is the canonical neutral-class fighter; concept generation, selection, normalization and silhouette/game-scale validation now become the active production task. Public/runtime label remains V0.19 until B14.**