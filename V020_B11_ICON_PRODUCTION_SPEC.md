# V0.20 — B11 Icon Production

Status: **ACTIVE — B11A RUNTIME ICON FOUNDATION INTEGRATED**

B11 replaces inconsistent platform-dependent emoji presentation with a coherent deterministic icon language while preserving all existing skill/content metadata and gameplay truth.

## Goals
- complete readable icon coverage for Survival and Duel runtime content
- keep icons legible at 48–64 px and compact HUD sizes
- remove dependence on OS emoji availability for primary presentation
- preserve legacy metadata icons as compatibility fallback
- keep icon rendering presentation-only and deterministic

## B11A — deterministic SVG runtime foundation
Runtime module: `js/v020-icons.js`.

The module resolves icons from semantic tags/content names into a reusable SVG grammar. Current semantic families:
- fire
- frost
- lightning
- poison
- blood
- heal
- defense
- summon
- soul
- time
- control
- area
- mark
- growth
- projectile

Tier frames remain structurally distinct:
- base Kỹ Năng: restrained circular frame
- Hợp Đạo Kỹ: linked hexagonal frame
- Siêu Cấp: crown-like ascended frame
- Rare: emphasized circular/radial frame
- Thần Kỹ: diamond + halo frame
- Thần Bí Kỹ: irregular occult frame

Content ID + kind determines a stable seed/rotation, so the same content always receives the same icon presentation across runs.

## Runtime integration
B11A is wired into:
- Survival level-up choices
- Survival bottom skill strip
- Thần Kỹ / Thần Bí Kỹ owned-skill entries
- Hợp Đạo / Siêu Cấp build tracker
- unlock toast
- Codex catalog cards
- Codex detail heading
- Duel skill/reward choices
- Duel pre-match/build chips
- Duel Hợp Đạo / Siêu Cấp / Rare build presentation

If `getV020IconMarkup` is unavailable, each integration falls back to the existing metadata `icon` value. Existing skill catalogs are intentionally not rewritten in B11A.

## Presentation styling
`css/v020-ui-hud.css` owns:
- icon sizing from compact HUD to choice-card hero size
- semantic family palette
- tier emphasis
- layout alignment
- reduced-motion-safe presentation

Color is not the only cue: family glyph geometry and tier frame geometry remain distinct.

## Ownership boundary
B11 must not change:
- skill rank/level
- damage/cooldowns
- targeting
- unlock/acquisition rules
- reroll probability
- Duel tournament state
- Survival run state
- V0.19 AI/movement truth

The icon module does not mutate `player`, `state`, combat entities, skill catalogs or tournament state.

## Validation
B11A adds:
- `tests/v020-b11-icon-runtime-smoke.js`
  - verifies public-shell load order
  - executes the icon runtime in an isolated VM
  - verifies deterministic SVG output
  - verifies semantic/tier classes
  - verifies Survival/Codex/Duel bridges
  - rejects gameplay ownership
  - keeps public label V0.19
- `.github/workflows/v020-b11-icon-validation.yml`
  - JavaScript syntax checks
  - B11A runtime smoke test
- GitHub Pages now runs B10 closure and B11A icon validation before artifact publication.

## Remaining B11 work
- **B11B — complete catalog audit:** enumerate all runtime base/Hợp Đạo/Siêu Cấp/Rare/Thần Kỹ/Thần Bí Kỹ entries and ensure every content ID resolves to an intentional semantic family rather than accidental name fallback.
- **B11C — visual closure:** desktop/mobile browser validation for choice cards, skill strip, Codex and Duel build surfaces; fix clipping/density/readability; then close B11.

Public/runtime version remains V0.19 until B14.
