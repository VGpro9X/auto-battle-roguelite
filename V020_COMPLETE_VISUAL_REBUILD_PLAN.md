# V0.20 — Complete Visual Rebuild Plan

Status: **APPROVED / IN DEVELOPMENT — B0–B13 COMPLETE, B14 ACTIVE**

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
- `V020_B4_ENEMY_VISUAL_SPEC.md` — completed enemy-family audit, runtime mapping, fallback and browser validation.
- `V020_B6_LIGHTING_SHADOW_SPEC.md` — completed quality-aware lighting/shadow/atmosphere runtime pass and desktop/mobile validation.
- `V020_B7_CORE_VFX_SPEC.md` — completed 15-family semantic V3 core VFX migration, budgets and browser validation.
- `V020_B8_SKILL_VISUAL_MAPPING_SPEC.md` — completed 80/28/12 Duel skill/synergy/evolution semantic mapping and runtime coverage validation.
- `V020_B9_HIGH_TIER_SPECTACLE_SPEC.md` — completed deterministic Duel + Survival high-tier presentation contract with 20 Duel Rare and 20 Survival divine/mystic signatures.\n- `V020_B10_UI_HUD_SPEC.md` — completed shared Survival/Duel/menu/Codex/tournament/result UI/HUD V3 composition and cross-device closure.\n- `V020_B11_ICON_PRODUCTION_SPEC.md` — active deterministic SVG icon production and runtime coverage checkpoint.\n- `V020_B12_ANIMATION_COMBAT_POLISH_SPEC.md` — completed hit/slash/KO VFX, directional camera impact and cross-device/reduced-motion combat closure.

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
- **B2 — Fighter Master Design — COMPLETE ✅**
- **B3 — Fighter Animation Production — COMPLETE ✅**
  - all 13 semantic states have dedicated runtime sheets
  - eight anchors authored for every frame
  - real V3 partial replacement suppresses corresponding V2 fighter bodies
  - 13/13 coverage validation present
- **B4 — Enemy Visual Families — COMPLETE ✅**
  - actual runtime enemy model audited before art production
  - runner→Beast, hunter→Fallen, anchor→Construct, elite→Abyssal
  - Wraith not invented because no current runtime role requires it
  - four transparent V0.20 runtime enemy assets integrated
  - allied/status/hit compatibility retained
  - V0.14 fallback retained for missing assets
  - no enemy simulation truth changed
  - GitHub Actions desktop/mobile browser validation passed
- **B5 — Ashen Sanctum V3 — COMPLETE ✅**
  - six production runtime layers integrated: sky / far / mid / ambient / floor / foreground
  - logical geometry preserved at 1000×560, floorY 475, bounds 54–946
  - locked parallax values and foreground ordering preserved
  - V3 arena activates only when the complete six-layer set validates; otherwise V2 arena fallback remains active
  - V3 bridge suppresses the V2 arena only when V3 arena coverage is ready while sharing the same presentation transform
  - production desktop 1280×720 and mobile 360×640 browser validation passed with all six layers rendered
  - no collision/bounds/simulation truth changed
- **B6 — Lighting & Shadow — COMPLETE ✅**
  - contact shadows preserve simulation collision footprints
  - projectile/shield local glow and event-driven impact/heal/shield/KO flashes integrated in Renderer V3
  - HUYẾT CHIẾN / TỬ CHIẾN atmosphere and restrained low-HP vignette integrated
  - FULL / BALANCED / LOW budgets: 10/6/3 projectile glows and 8/5/2 event flashes
  - reduced-motion-safe presentation path retained
  - desktop 1280×720 and mobile 360×640 browser validation passed
  - no hit/damage/projectile/phase truth moved into presentation
- **B7 — Core Combat VFX Library — COMPLETE ✅**
  - preserved 15 semantic families: physical / projectile / fire / frost / lightning / poison / blood / defense / heal / control / summon / area / chain / time / soul
  - reusable V3 burst / ring / beam primitives integrated
  - FULL / BALANCED / LOW transient budgets: 112 / 72 / 36 active effects
  - V3-owned core events are removed from V2 base-VFX feed to prevent duplicate drawing
  - tier overlay and camera still observe V3-owned events
  - V2 fallback remains authoritative when the V3 VFX module is unavailable
  - static, desktop 1280×720 and mobile 360×640 validation passed
- **B8 — Skill Visual Mapping — COMPLETE ✅**
  - real Duel catalogs drive the mapping: 80 base Kỹ Năng / 28 Hợp Đạo Kỹ / 12 Siêu Cấp
  - deterministic primary/secondary semantic families are assigned from explicit overrides, names, real tags and ingredient/base inheritance
  - V3 core VFX consumes the B8 profile before heuristic fallback
  - static + desktop 1280×720 + mobile 360×640 validation passed
  - no skill logic, unlock, damage, cooldown or event truth changed
- **B9 — High-Tier Spectacle — COMPLETE ✅**
  - deterministic Duel Hợp Đạo / Siêu Cấp / all 20 Rare signatures integrated
  - deterministic Survival coverage integrated for all 20 real high-tier IDs: 10 Thần Kỹ + 10 Thần Bí Kỹ
  - semantic-family palette and tier-specific geometry replace one-size-fits-all spectacle
  - Duel FULL / BALANCED / LOW high-tier transient budgets: 48 / 30 / 16
  - Survival FULL / BALANCED / LOW high-tier transient budgets: 36 / 24 / 12
  - reduced-motion keeps identity while removing decorative rotational progression
  - runtime quality selection reaches the spectacle layers correctly
  - static + desktop FULL + mobile LOW B9 validation passes for Duel and Survival
  - B6 lighting, V0.18 performance and historical V0.18/V0.19 release gates remain compatible after B9 integration
  - no gameplay/simulation truth changed
- **B10 — UI/HUD V3 — COMPLETE ✅**
  - shared Survival/menu/Codex/result shell modernized
  - Duel lobby/pre-match/tournament/combat HUD composition modernized
  - desktop/mobile/reduced-motion combined closure gate added
  - Pages now revalidates B10 before publishing
  - presentation-only modernization; gameplay and tournament truth remain authoritative in existing systems
- **B11 — Icon Production — COMPLETE ✅**
  - B11A deterministic SVG runtime icon foundation integrated
  - B11B audited 80 base + 28 Hợp Đạo + 12 Siêu Cấp + 20 Rare identities
  - B11C desktop/mobile/reduced-motion browser validation passed
  - Survival/Codex/Duel primary UI surfaces now prefer semantic V3 icons
  - legacy metadata emoji retained only as compatibility fallback
- **B12 — Animation & Combat Polish — COMPLETE ✅**
  - B12A hit rings, physical slash trails, critical impact and KO burst
  - B12B bounded directional camera kick for hit/KO with reduced-motion zeroing
  - B12C real Canvas2D desktop/mobile/reduced-motion browser closure passed
  - presentation-only; no simulation ownership
- **B13 — Optimization / Mobile / Fallback — COMPLETE ✅**
  - unified AUTO quality maps constrained/mobile to low V3 budgets while desktop remains balanced
  - forced vector/V2/V3 plus missing-V3→V2 fallback browser closure passed
  - reduced-motion propagation validated through V3 presentation
  - public artifact budget/path + desktop/mobile runtime closure passed
- **B14 — Integration / Release — ACTIVE**
  - V0.16–V0.19 historical regression sweep
  - V0.20 integrated browser/mobile candidate validation
  - promote public label to V0.20 only after candidate gate passes
  - exact GitHub Pages deploy, then owner final visual/gameplay test

## Release discipline
GitHub `main` is canonical. Fetch latest SHA before edits. Commit every meaningful checkpoint. Do not promote public/runtime V0.20 before B14 gates pass. Current public baseline stays V0.19. Tests remain under `tests/` and are not shipped in Pages artifact.

## Definition of Done
V0.20 requires normal production gameplay to use coherent V3 artwork, complete 13 fighter states, coherent required enemies, Ashen Sanctum V3, complete skill visual mapping, distinct high tiers, 20 Rare identities, coherent desktop/mobile UI/icons, unchanged gameplay truth, functional V2/vector fallback, no missing assets/runtime errors, desktop/mobile/performance/reduced-motion gates, historical V0.16–V0.19 regressions, exact Pages deployment, then V0.20 label promotion and final owner visual/gameplay test.

## Current continuation point
**B0–B13 COMPLETE. B14 ACTIVE: run the integrated release candidate gates, promote the public label to V0.20 only after they pass, deploy the exact Pages artifact, then hand off to owner final test.**