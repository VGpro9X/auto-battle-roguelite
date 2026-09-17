# V0.20 — B9 High-Tier Spectacle

Status: **ACTIVE — DUEL HIGH-TIER FOUNDATION INTEGRATED / SURVIVAL DIVINE TIERS NEXT**

B9 gives high-tier content a stronger, deterministic presentation hierarchy without changing combat truth. It builds on B7 semantic VFX families and B8 skill visual mapping.

## Scope
B9 owns presentation for:
- Duel Hợp Đạo Kỹ
- Duel Siêu Cấp
- all 20 Duel Rare rules
- Survival Thần Kỹ
- Survival Thần Bí Kỹ

B9 does not change damage, cooldowns, status duration, targeting, skill acquisition, unlock rules, fatal/revive ordering, Duel tournament state, AI or simulation timing.

## Duel foundation now integrated
`js/duel-vfx-tier.js` resolves high-tier events through real B8 visual profiles first, with catalog/alias fallback for compatibility.

Each high-tier event receives a deterministic signature generated from content ID + tier + semantic family. The signature controls presentation-only geometry such as polygon sides, satellites, dash pattern, spin direction, phase, ray count and pulse scale.

Hierarchy:
- Hợp Đạo Kỹ: restrained ring + geometry + satellites
- Siêu Cấp: stronger nested geometry + rays + satellites
- Rare: largest bounded geometry + nested mark + rays + satellites + pulse

All 20 Rare IDs retain dedicated deterministic signatures. `voidReality` and `scapegoatFate` compatibility aliases remain supported.

## Semantic color
High-tier geometry inherits the B8/B7 semantic family palette rather than using one universal color. This lets a fire evolution remain visually fire-led while still reading as Siêu Cấp through shape and complexity. Color is never the only tier cue.

## Quality budgets
High-tier transient limits are presentation-only:
- FULL: 48
- BALANCED: 30
- LOW: 16

LOW also reduces geometric detail/opacity. Reduced-motion freezes decorative rotational progression while retaining tier identity and readability.

Runtime quality follows `visualQuality=full|balanced|low` when explicitly requested, then falls back to the configured V3/legacy quality policy. Legacy `duelQuality=constrained` maps to LOW for this spectacle layer.

## Fallback and ownership
The high-tier overlay remains attached to the existing Duel renderer fallback chain. V3-owned combat events may still be observed by the tier overlay while core V3 VFX owns the base semantic burst/ring/beam. If V3 core VFX is unavailable, V2 behavior remains available.

The layer is presentation-only. It does not mutate fighters, projectiles, cooldowns, skill catalogs or match state.

## Validation
- `tests/v020-b9-high-tier-spectacle-smoke.js`
  - verifies all 20 Rare IDs/signatures
  - verifies Hợp Đạo/Siêu Cấp/Rare tier resolution
  - verifies deterministic signature stability
  - verifies FULL/BALANCED/LOW budgets and LOW transient cap
  - rejects simulation ownership patterns
- `tests/v020-b9-high-tier-spectacle-browser-driver.html`
  - loads the real app/V3/B8 bootstrap
  - validates real synergy/evolution signature resolution
  - validates all 20 Rare signatures
  - validates runtime quality selection
- `.github/workflows/v020-b9-high-tier-spectacle-validation.yml`
  - static smoke
  - desktop 1280×720 forced FULL
  - mobile 360×640 forced LOW

## Remaining B9 work
B9 is not complete yet. Next work is the Survival high-tier track:
1. audit real Thần Kỹ and Thần Bí Kỹ runtime IDs/events in `divine-skills.js`, V0.16 Rare systems and existing presentation bridges;
2. define deterministic divine/mystic signature grammar that remains visually above ordinary Survival skills;
3. preserve all existing gameplay probabilities and effects;
4. validate desktop/mobile/reduced-motion behavior;
5. run final combined B9 coverage before promoting B9 to COMPLETE.

Public/runtime version remains V0.19 until B14.