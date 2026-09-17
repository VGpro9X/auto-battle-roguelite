# V0.20 — B9 High-Tier Spectacle

Status: **COMPLETE ✅ — DUEL + SURVIVAL HIGH-TIER PRESENTATION INTEGRATED**

B9 gives high-tier content a stronger, deterministic presentation hierarchy without changing combat truth. It builds on B7 semantic VFX families and B8 skill visual mapping.

## Scope completed
B9 owns presentation for:
- Duel Hợp Đạo Kỹ
- Duel Siêu Cấp
- all 20 Duel Rare rules
- Survival Thần Kỹ
- Survival Thần Bí Kỹ

B9 does not change damage, cooldowns, status duration, targeting, skill acquisition, unlock rules, fatal/revive ordering, Duel tournament state, AI or simulation timing.

## Duel high-tier presentation
`js/duel-vfx-tier.js` resolves high-tier events through real B8 visual profiles first, with catalog/alias fallback for compatibility.

Each high-tier event receives a deterministic signature generated from content ID + tier + semantic family. The signature controls presentation-only geometry such as polygon sides, satellites, dash pattern, spin direction, phase, ray count and pulse scale.

Hierarchy:
- Hợp Đạo Kỹ: restrained ring + geometry + satellites
- Siêu Cấp: stronger nested geometry + rays + satellites
- Rare: largest bounded geometry + nested mark + rays + satellites + pulse

All 20 Rare IDs retain dedicated deterministic signatures. `voidReality` and `scapegoatFate` compatibility aliases remain supported.

## Survival divine/mystic presentation
`js/v020-survival-divine-vfx.js` adds a bounded, presentation-only spectacle layer for the real Survival high-tier catalog.

Coverage is locked to the actual 20 high-tier Survival IDs:
- 10 Thần Kỹ
- 10 Thần Bí Kỹ

Every ID has deterministic geometry/signature behavior so divine and mystic activations remain recognizable across runs without moving gameplay truth into presentation code. The layer observes existing skill/VFX events and never owns damage, targeting, acquisition chance, cooldowns or fatal/revive ordering.

Survival high-tier transient limits:
- FULL: 36
- BALANCED: 24
- LOW: 12

## Semantic color and readability
High-tier geometry inherits the B8/B7 semantic family palette rather than using one universal color. This lets a fire evolution remain visually fire-led while still reading as Siêu Cấp through shape and complexity. Color is never the only tier cue.

Duel high-tier transient limits:
- FULL: 48
- BALANCED: 30
- LOW: 16

LOW reduces geometric detail/opacity. Reduced-motion keeps the identifying geometry but freezes/removes decorative rotational progression.

Runtime quality follows `visualQuality=full|balanced|low` when explicitly requested, then falls back to the configured V3/legacy quality policy. Legacy `duelQuality=constrained` maps to LOW for the Duel spectacle layer.

## Fallback and ownership
The Duel high-tier overlay remains attached to the existing renderer fallback chain. V3-owned combat events may still be observed by the tier overlay while core V3 VFX owns the base semantic burst/ring/beam. If V3 core VFX is unavailable, V2 behavior remains available.

The Survival high-tier layer is likewise additive and presentation-only. Neither path mutates fighters, enemies, projectiles, cooldowns, skill catalogs, probabilities or match/run state.

## Validation completed
- `tests/v020-b9-high-tier-spectacle-smoke.js`
  - verifies all 20 Duel Rare IDs/signatures
  - verifies Hợp Đạo/Siêu Cấp/Rare tier resolution
  - verifies deterministic signature stability
  - verifies FULL/BALANCED/LOW budgets and LOW transient cap
  - rejects simulation ownership patterns
- `tests/v020-b9-high-tier-spectacle-browser-driver.html`
  - loads the real app/V3/B8 bootstrap
  - validates real synergy/evolution signature resolution
  - validates all 20 Rare signatures
  - validates runtime quality selection
- `tests/v020-b9-survival-divine-spectacle-smoke.js`
  - validates the 20 real Survival high-tier IDs and the 10/10 divine/mystic split
  - validates bounded presentation ownership and quality policy
- `tests/v020-b9-survival-divine-spectacle-browser-driver.html`
  - validates real app integration on desktop/mobile paths
- `.github/workflows/v020-b9-high-tier-spectacle-validation.yml`
  - static Duel + Survival smoke
  - Duel desktop 1280×720 FULL: pass, 20 Rare signatures, limit 48
  - Duel mobile 360×640 LOW: pass, 20 Rare signatures, limit 16
  - Survival desktop 1280×720 FULL: pass, 20 IDs (10 divine + 10 mystic), limit 36
  - Survival mobile 360×640 LOW: pass, 20 IDs (10 divine + 10 mystic), limit 12

## Regression closure
B9 also restored compatibility with older presentation gates without weakening the new spectacle budgets:
- B6 lighting runtime/browser validation passes desktop + mobile.
- V0.18 performance validation passes desktop + mobile + reduced-motion while reporting both internal B9 drops and historical wrapper-budget drops correctly.
- V0.18 and V0.19 historical release gates remain intact.
- V0.17 Siêu Cấp UI smoke follows the current `duel-ui.js` compatibility loader into `duel-ui-v020.js` instead of requiring presentation text to remain inside the legacy wrapper.

Checkpoint compatibility commits include `36fc16f7` and `dadd146e`.

## Handoff
B9 is complete. The next checkpoint is **B10 — UI/HUD V3**, covering Survival, Duel, menu, Codex, tournament and results composition across desktop/mobile.

Public/runtime version remains V0.19 until B14.