# V0.20 — Visual Art Bible

Status: **B0 WORKING SPEC**

This document converts the approved V0.20 direction into production constraints for generated artwork and Renderer V3 integration.

## 1. Visual identity

Original **Dark Fantasy × Cultivation × Martial Magic**.

Mood: ancient, dangerous, supernatural, restrained rather than grotesque. The base world is dark/desaturated so gameplay effects can own the brightest values.

Readability order:
1. fighter/enemy silhouette
2. action pose and facing
3. attack origin/target direction
4. threat/status information
5. rarity/spectacle
6. decorative detail

## 2. Core palette roles

Do not lock gameplay meaning to exact RGB values; these are art roles.

- world near-black: charcoal / blue-black
- stone/metal: cool slate / ash gray
- cloth/leather: desaturated umber / graphite
- cultivation accent: aged brass / muted warm gold
- player identity accent: restrained cyan-spirit light
- enemy danger accent: restrained crimson/ember
- neutral spirit: pale ivory
- shadow/abyss: violet-black
- poison: sickly green with mist/shape cue
- frost: pale cyan with crystal cue
- lightning: white-gold/blue with fork cue

No status may depend on color alone.

## 3. Value and contrast

- fighter silhouette must separate from arena at gameplay scale
- brightest persistent environment value must remain below ordinary combat highlights
- floor behind fighters stays lower-detail than far/mid scenery
- foreground may frame the scene but must not permanently obscure combat center
- UI text contrast outranks ornamental texture

## 4. Fighter master

Archetype: **The Ash Wanderer** (working production identity; player-facing naming is not required).

Design goals:
- human martial-cultivator silhouette
- neutral enough to plausibly use melee, ranged and spell builds
- medium athletic proportions; not giant armor and not fragile robe-only mage
- layered short mantle + split lower coat for readable motion
- asymmetric shoulder/waist detail for facing readability
- forearms/hands clearly visible for VFX anchors
- restrained talisman/rune details
- no permanent giant weapon that conflicts with ranged/cast builds
- optional compact weapon/focus elements may appear contextually in action artwork

Avoid:
- copied anime/franchise costume language
- oversized decorative wings
- excessive dangling micro-detail
- photorealistic face rendering that becomes noise at runtime
- permanently glowing full-body aura

## 5. Fighter production framing

Current V2 contract uses 256×256 frames and displayWorldWidth 176. V3 should preserve logical/root compatibility initially while allowing higher-resolution source masters.

Production master recommendation:
- generate/paint at high resolution
- normalize transparent runtime frames to a consistent square source canvas
- derive optimized runtime sheets after animation validation
- feet/root remains stable whenever the semantic action does not intentionally displace the body

Required semantic states remain 13:
idle, walk, run, dash, melee, ranged, cast, hit, block, knockback, knockdown, recover, ko.

Required anchors remain:
head, chest, leftHand, rightHand, feet, front, back, target.

## 6. Animation language

Idle: controlled breathing, cloth secondary motion, low energy.
Walk: deliberate martial step.
Run: forward intent, torso lean, readable leg cycle.
Dash: compressed anticipation → sharp displacement pose → settle.
Melee: clear wind-up → contact silhouette → follow-through.
Ranged: hand/weapon line clearly points toward target anchor.
Cast: two-hand/body channeling shape with readable spell origin.
Hit: directional recoil, short.
Block: compact defensive triangle silhouette.
Knockback: center-of-mass displaced opposite threat.
Knockdown: readable fall and grounded state.
Recover: grounded brace → rise → ready.
KO: final grounded silhouette distinct from temporary knockdown.

## 7. Enemy families

### Fallen
Corrupted humanoid martial remnants. Angular broken weapons, torn layered cloth. General-purpose readable humanoid threat.

### Beast
Low center of gravity, broad limbs/jaws/horns where appropriate. Fast/tank roles communicated through body mass and stance.

### Wraith
Floating/tapered silhouette, missing or obscured feet, cloth/smoke breakup. Ranged/control readability.

### Construct
Stone/metal/talisman assembly, hard geometric silhouette, heavy readable joints. Tank/elite readability.

### Abyssal
Late/high-threat supernatural forms with asymmetric void shapes. Use sparingly; strongest contrast language reserved for elite/high-threat presentation.

Archetype shape rules:
- fast: narrow/forward-leaning
- melee: weapon/limb reach readable
- tank: broad torso/base
- ranged: clear emitter/arm/focus silhouette
- elite: larger silhouette + one persistent signature, not particle spam

## 8. Ashen Sanctum V3

Logical geometry is locked to the current arena contract:
- logicalWidth 1000
- logicalHeight 560
- floorY 475
- leftBound 54
- rightBound 946

Six-layer composition remains:
- sky: moon/cloud/ash atmosphere, low detail
- far: monumental distant mountains/ruins
- mid: sanctuary architecture and broken cultivation structures
- ambient: fog/ash/embers, sparse and motion-friendly
- floor: readable combat plane, cracks/runes kept below fighter contrast
- foreground: broken pillars/rocks/vegetation framing outer edges

Keep current parallax concept; V3 may tune presentation values but not logical arena geometry.

## 9. VFX grammar

Every effect is built from reusable primitives:
- core/emitter
- body/shape
- trail
- secondary particles
- impact
- residue/decay
- optional light response

Tier budgets are relative, not gameplay mechanics:
- base: 1–3 visual layers
- Hợp Đạo: 2–4 + signature
- Siêu Cấp: 3–5 + lighting/camera response
- Thần Kỹ: signature composition + brief atmosphere response
- Thần Bí Kỹ: unique composition/screen-space accent, tightly duration-bounded

Never hide both fighters for spectacle longer than a brief impact beat.

## 10. Projectile grammar

Projectile families should combine head + trail + impact and optionally glow.

Target reusable archetypes:
spirit bolt, fire orb, ice shard, lightning spear, shadow blade, blood dart, energy wave, magic missile, soul orb, stone shard, wind blade, poison globule, rune lance, void needle, radiant seal, chain spark.

## 11. Status grammar

- shield: shell/rim
- burn: upward ember/flame
- freeze: crystalline edge + frost
- poison: drifting mist/bubbles
- bleed: sharp crimson directional droplets
- slow: weighted ring/trailing distortion
- stun: broken electric fragments
- mark: geometric rune marker
- buff: rising organized particles
- debuff: falling/fractured particles

## 12. UI Bible

Style: dark glass + aged metal + mystical rune accents.

Rules:
- Vietnamese text remains primary
- ornament lives on edges/corners, not behind body copy
- cards use hierarchy before texture
- selected/available/locked states differ by shape/border/contrast as well as color
- touch targets remain generous on mobile
- desktop and mobile can recompose layout
- rarity frames are recognizable at small size

## 13. Icon Bible

At 48–64 px, icon must still read.

Structure:
- one dominant symbol
- one supporting shape maximum
- controlled background value
- tier frame handled by UI where possible
- no text embedded in generated icon artwork
- no tiny facial scenes or complex full-character compositions

## 14. Generated-asset acceptance gate

Before an image becomes production art it must pass:
- original/no protected franchise copying
- matches Art Bible
- silhouette readable at intended runtime size
- correct orientation/perspective
- no unwanted text/signature/watermark
- no malformed anatomy that affects action readability
- transparent-background cleanup where required
- consistent crop/root/pivot
- compression does not introduce visible halo/blocking
- deterministic filename and manifest entry

## 15. Naming convention

Use lowercase kebab-case runtime paths.

Examples:
- `assets/v020/fighters/ash-wanderer/idle.webp`
- `assets/v020/enemies/fallen/fallen-melee.webp`
- `assets/v020/arenas/ashen-sanctum/sky.webp`
- `assets/v020/vfx/projectiles/spirit-bolt.webp`
- `assets/v020/ui/icons/skills/<skill-id>.webp`

Source/master artwork should not overwrite the V0.18 production tree during development.

## 16. Performance starting budgets

Budgets are presentation targets to validate/tune in B13, not hidden gameplay caps.

- normal gameplay should avoid loading source/master-resolution art
- atlases/sheets preferred where they reduce requests without excessive memory waste
- mobile BALANCED path should avoid unnecessary full-screen compositing
- transient VFX must expire deterministically
- ambient particles should be aggressively reusable
- no visual asset may be required for simulation progression

## 17. B0 exit criteria

B0 is complete when:
- current asset architecture has been audited
- this Art Bible is locked
- asset inventory is recorded
- production generation specs are recorded
- Renderer V3 integration/fallback boundaries are documented
- first concept-generation brief for Fighter Master and Ashen Sanctum is ready

Bulk production generation must not begin before these gates are complete.
