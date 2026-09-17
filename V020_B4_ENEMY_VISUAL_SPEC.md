# V0.20 — B4 Enemy Visual Families

Status: **ACTIVE — RUNTIME ASSETS + FALLBACK INTEGRATED**

B4 upgrades enemy presentation only. Enemy HP, radius, speed, damage, spawning, elite chance, contact damage, XP, drops, allied conversion, statuses and AI remain owned by the existing simulation.

## 1. Runtime audit
Survival currently creates one base enemy model with an `elite` flag. Normal enemies receive speed variance but no gameplay class ID. The existing V0.14 presentation layer derives four visual archetypes only:
- `runner` — faster normal enemy
- `hunter` — middle-speed normal enemy
- `anchor` — slower normal enemy
- `elite` — any simulation enemy with `elite === true`

No separate ranged/tank/wraith enemy gameplay class currently exists.

## 2. V0.20 family mapping
B4 maps only those real presentation roles:

| Existing presentation role | V0.20 family | Visual identity | Gameplay changes |
| --- | --- | --- | --- |
| `runner` | Beast | low center of mass, forward limbs, aggressive motion silhouette | none |
| `hunter` | Fallen | corrupted humanoid, balanced pursuing silhouette | none |
| `anchor` | Construct | broad geometric stone/metal/talisman silhouette | none |
| `elite` | Abyssal | larger asymmetric void-corrupted silhouette, persistent elite signature | none |

`Wraith` stays in the Art Bible as a future visual family vocabulary but is **not produced as a runtime enemy in B4** because no current runtime role requires it.

## 3. Stable assignment
Family selection uses the existing `enemyArchetypeV014(enemy)` result. It does not write `enemy.speed`, `enemy.hp`, `enemy.dmg`, `enemy.r`, `enemy.elite`, spawn probability or targeting.

A normal enemy does not randomly change family mid-life because the existing presentation archetype is cached on the enemy.

## 4. Runtime assets
Integrated transparent runtime assets:
- `assets/v020/enemies/beast/beast-runner.svg`
- `assets/v020/enemies/fallen/fallen-hunter.svg`
- `assets/v020/enemies/construct/construct-anchor.svg`
- `assets/v020/enemies/abyssal/abyssal-elite.svg`

Each file is a 128×128 transparent SVG with no poster/UI text.

## 5. Runtime presentation path
`js/v020-enemy-presentation.js` now:
- maps existing archetypes to the four V0.20 families;
- preloads the corresponding runtime SVG;
- draws the family asset using existing enemy position/radius and player-facing information;
- keeps family-specific cosmetic bob/scale only;
- preserves hit feedback and allied tint at presentation level;
- redraws existing enemy status visuals for compatibility;
- calls the original V0.14 enemy renderer when a V0.20 asset is unavailable or fails to load.

The module is bootstrapped after the V0.14 presentation layer from the existing page script chain. Failure to load the B4 module leaves V0.14 active.

## 6. Status/allied compatibility
The V0.20 path explicitly preserves:
- allied/bribed ring/tint
- hit flash/brightness
- poison/burn/chill/mark overlays through `drawEnemyStatusVisual`
- base simulation health bar remains owned by the underlying draw pass

Color is supplementary; each family has a distinct silhouette.

## 7. Drawing ownership
The B4 presentation layer may read:
- enemy position/radius
- `elite`
- existing presentation archetype
- hit flash timer
- allied/status state
- player position for facing
- current presentation time

It may decide cosmetic facing, bob, shadow, family scale and presentation tint.

It does not decide collision, hit success, contact range, damage, knockback, target choice, movement vector, death, XP or drop truth.

## 8. Validation
Static/runtime contract gate:
- `tests/v020-b4-enemy-family-runtime-smoke.js`

The gate checks:
- four runtime assets exist and are runtime-clean;
- runner→Beast, hunter→Fallen, anchor→Construct, elite→Abyssal mapping;
- Wraith is not invented;
- V0.14 fallback exists;
- status compatibility exists;
- B4 bootstrap is wired;
- presentation code does not assign enemy speed/HP/damage/radius/elite truth;
- core simulation elite/speed rules remain present.

This gate has been added to the repository; it has not been claimed as executed by this connector session.

## 9. Remaining B4 gate
Before B4 closes:
1. browser desktop visual smoke;
2. compact/mobile visual smoke;
3. verify allied/status overlays and elite readability in live Survival rendering;
4. verify missing-asset fallback produces no runtime error.

B4 does not alter Duel fighter/tournament logic.