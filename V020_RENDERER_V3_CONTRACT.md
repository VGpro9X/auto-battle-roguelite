# V0.20 — Renderer V3 Integration Contract

Status: **B0 LOCKED SPEC**

## 1. Purpose
Renderer V3 is a presentation upgrade layered over the released simulation. It consumes existing semantic state/events and adds V0.20 art, animation, VFX, lighting and depth composition without taking ownership of gameplay truth.

## 2. Ownership boundary
Simulation remains authoritative for positions, facing, semantic action state, HP/shield, hit/dodge/damage result, projectiles, control/KO, AI decisions, skill offers, fatal/revive ordering and tournament progression.

Renderer V3 may decide only presentation details: animation frame interpolation/selection inside a semantic state, visual layering, cosmetic particles, light/glow, contact shadow, camera response, presentation trails, transient residue and quality-tier reductions.

## 3. Compatibility inputs
V3 must consume the released 13-state fighter contract and eight anchors. It must not require new combat states merely to make art work.

Existing V0.18 Renderer V2 and vector paths remain frozen fallback baselines.

## 4. Fallback chain
Normal target: Renderer V3.

Fallback chain:
`Renderer V3 → Renderer V2 → vector renderer`.

Failure of a V3 fighter state may fall back state-by-state where safe. Failure of a V3 arena layer may use the corresponding V2 layer or an explicitly verified fallback. Missing cosmetic VFX must never halt simulation.

## 5. Asset isolation
V3 runtime assets live under `assets/v020/`. V0.18 production assets are not overwritten during development. Manifests must use explicit versioned IDs and concrete paths.

## 6. Visual event layer
A presentation adapter converts simulation events into semantic visual requests. Examples: hit event → impact primitive; block event → block response; projectile spawn → projectile visual archetype; Rare trigger → signature composition.

The adapter cannot invent a hit, damage event, projectile, status, cooldown completion or skill activation that simulation did not emit.

## 7. Depth composition
Recommended world composition order:
1. sky/far/mid environment
2. ambient behind combat
3. floor
4. ground decals/runes/shadows
5. fighters/enemies/projectiles
6. combat VFX with explicit behind/front lanes
7. foreground
8. screen-space presentation effects
9. HUD/UI

Depth is presentation metadata only.

## 8. Lighting
Lighting is cosmetic compositing. It cannot be queried by AI, targeting or visibility logic. FULL/BALANCED/LOW may reduce or disable expensive glow/composite passes without gameplay differences.

## 9. Camera
Camera reads world state/events but never feeds modified coordinates back into simulation. World→screen transformation remains one-way presentation logic. Shake/zoom/hit emphasis must remain bounded and mobile-safe.

## 10. Animation/root rules
Feet/root metadata is authoritative for drawing alignment, not collision. Mirroring must transform anchors consistently. Animation frame timing may not change simulation action timing; visual anticipation/recovery must fit inside or cosmetically bridge semantic timing without delaying/advancing combat truth.

## 11. Quality tiers
FULL, BALANCED and LOW/REDUCED select presentation cost only. Permitted differences include particle count, raster resolution, blur/glow, atmospheric density, parallax amplitude and camera motion. Forbidden differences include targeting, damage, AI cadence, projectile truth, skill offer weighting or tournament result.

## 12. Validation requirements
Before V3 becomes normal public path:
- exact production asset references resolve on Pages
- all 13 fighter states render or verified fallback
- all eight anchors remain valid under facing/mirroring
- missing/partial V3 assets complete a full match through fallback
- FULL/BALANCED/LOW complete representative Survival and Duel runs
- compact mobile and desktop browser runs complete without runtime errors
- historical V0.16–V0.19 regressions remain green

## 13. B1 implementation boundary
B1 may build loader/manifest/layer/feature-flag/fallback foundations using proof assets. B1 does not authorize combat rebalance, new gameplay mechanics, bulk production art, or promotion of public runtime label to V0.20.