# V0.20 — B8 Skill Visual Mapping

Status: **ACTIVE — RUNTIME MAPPER INTEGRATED / COVERAGE VALIDATION RUNNING**

B8 maps the real Duel content catalogs onto the reusable V3 semantic VFX grammar created in B7. It does not add skills, alter tags, change unlock conditions, modify damage/cooldowns or change event emission.

## Runtime source of truth
The mapper reads the loaded runtime catalogs rather than maintaining a duplicate skill list:
- `DUEL_SKILL_KEYS` + `getDuelSkill()` for base Kỹ Năng
- `DUEL_SYNERGY_CATALOG` + `getDuelSynergy()` for Hợp Đạo Kỹ
- `DUEL_EVOLUTION_CATALOG` + `getDuelEvolution()` for Siêu Cấp

The current release contract expects 80 base Duel skills, 28 synergies and 12 evolutions. Browser validation verifies those counts against the actual loaded page.

## Profile grammar
Every mapped entry receives:
- `primary` semantic VFX family
- optional `secondary` family
- complete family list
- tier (`base`, `synergy`, `evolution`)
- runtime ID/name
- source tags or ingredient/base metadata

Allowed families remain the B7 vocabulary: physical, projectile, fire, frost, lightning, poison, blood, defense, heal, control, summon, area, chain, time and soul.

## Deterministic resolution
Base skill profiles use:
1. explicit overrides only for known ambiguous/identity-defining skills;
2. Vietnamese/English name cues where useful;
3. actual skill tags from `getDuelSkill()`;
4. stable family priority and a physical fallback.

Synergy profiles inherit semantic families from their required skills. Evolution profiles inherit from their base skill plus required tag families. This keeps the map synchronized with the real content definitions.

## VFX integration
`js/duel-vfx-v3.js` asks `getDuelVisualProfileForEventV3(event)` before its B7 text heuristic. Events carrying a known `skill`, `synergy`, `evolution`, `source` or `status` therefore use the deterministic B8 profile. Unknown/legacy events still use the proven B7 heuristic fallback.

`js/duel-ui-sync.js` extends the existing V3 bootstrap promise to load `js/duel-skill-visual-map-v3.js?v=020-b8`. Duel startup already waits for this promise, so the visual map is available before combat; if mapping fails to load, B7 heuristic VFX remains active.

## B9 boundary
B8 assigns semantic identity only. It does not implement the unique high-tier spectacle for Hợp Đạo Kỹ, Siêu Cấp, Thần Kỹ, Thần Bí Kỹ or 20 Rare rules. Those signatures remain B9 scope.

## Validation
- `tests/v020-b8-skill-visual-map-smoke.js` validates deterministic family assignment, inheritance, B8→B7 integration and presentation-only ownership.
- `tests/v020-b8-skill-visual-map-browser-driver.html` opens the real `index.html`, waits for the real V3/B8 bootstrap, verifies 80/28/12 runtime coverage, checks every profile has a valid family and samples identity-defining mappings.
- `.github/workflows/v020-b8-skill-visual-map-browser-validation.yml` runs static + desktop 1280×720 + mobile 360×640 coverage.

B8 closes only after all three gates are green. Public/runtime version remains V0.19 until B14.