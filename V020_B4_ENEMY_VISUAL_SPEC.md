# V0.20 — B4 Enemy Visual Families

Status: **ACTIVE — RUNTIME MAPPING LOCKED**

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
Family selection must use the existing presentation archetype result. It must not change or write `enemy.speed`, `enemy.hp`, `enemy.dmg`, `enemy.r`, `enemy.elite`, spawn probability or targeting.

A normal enemy must not randomly change family mid-life. Existing `_v14Archetype` / speed-derived classification can be reused as the stable presentation source.

## 4. Runtime art contract
Initial runtime family assets live under:
- `assets/v020/enemies/beast/`
- `assets/v020/enemies/fallen/`
- `assets/v020/enemies/construct/`
- `assets/v020/enemies/abyssal/`

B4 first-pass assets are transparent vector runtime silhouettes, not posters. Each family needs readable neutral/move/contact-hit identity at Survival scale. Elite/Abyssal gets a distinct persistent signature but not a gameplay aura.

## 5. Status/allied compatibility
Visual family art must leave room for existing overlays:
- allied/bribed indication
- hit flash
- poison
- burn
- chill/frost
- mark/status graphics
- health bar

Color alone cannot be the only status cue. Family silhouette must remain identifiable when hit/allied/status tints are active.

## 6. Drawing ownership
The B4 presentation layer may read:
- enemy position/radius
- `elite`
- existing presentation archetype
- hit flash timer
- allied/status state
- player position for facing
- current presentation time

It may decide cosmetic facing, bob, limb sway, contact anticipation, shadow and family-specific ornament motion.

It may not decide collision, hit success, contact range, damage, knockback, target choice, movement vector, death, XP or drop truth.

## 7. Acceptance gates
B4 is complete when:
1. all four actual runtime archetypes resolve to V0.20 families;
2. each mapped family has a runtime-clean asset/presentation path;
3. elite remains visibly distinct at compact scale;
4. allied/status overlays remain readable;
5. missing V0.20 family art falls back to V0.14/base enemy presentation;
6. no Wraith or other unused gameplay role is invented;
7. Survival simulation values remain untouched;
8. desktop/mobile smoke validation shows no runtime errors.

## 8. Current implementation order
1. Build family resolver and fallback contract.
2. Add Fallen / Beast / Construct / Abyssal runtime assets.
3. Hook V0.20 family drawing after the existing enemy simulation update and replace presentation only.
4. Add deterministic smoke gate covering mapping, fallback and no gameplay mutation.
5. Validate statuses/allied/elite readability.

B4 does not alter Duel fighter/tournament logic.