# V0.17 — Duel Arena / Đấu Trường 1v1

Status: **ACTIVE ROADMAP — implementation authorized by the user**.

GitHub `main` remains canonical. V0.16 Survival/Endless is the stable baseline and must remain playable while V0.17 is developed.

## 1. Product goal

Add a new **Đấu Trường** mode that keeps the game's core identity — the fighter battles automatically and the player builds the skill set — but changes the battle presentation and run structure:

- side-view 1v1 combat inspired by classic fighting-game staging
- no direct player movement or attack controls
- the build determines whether AI wants to fight close, far, or hybrid
- single-elimination tournament starting with **64 fighters**
- each matchup is **best-of-3 rounds**
- the winner advances until one champion remains
- the existing skill identities are reused through Duel-specific mechanics rather than copied into a second unrelated skill database

The first implementation is intentionally a development-quality prototype visually. The architecture must make a later high-quality graphics replacement straightforward.

---

# 2. Locked design decisions

## Tournament
- Exactly **64 fighters** at tournament start.
- Bracket: `64 → 32 → 16 → 8 → 4 → 2 → Champion`.
- No BYE system is required.
- Losing one matchup eliminates the player and ends the tournament run.
- Other matches are simulated; only the player's matchup runs through the real Duel combat simulation/render loop.
- AI fighters obey the same build progression rules as the player.

## Match / round format
- Every matchup is **best-of-3**: first fighter to 2 round wins advances.
- Build is frozen for all rounds in one matchup.
- Between rounds, reset HP, shield, cooldowns, statuses, summons, projectiles and temporary effects.
- Tournament build persists between matchups.
- Base round clock: **60 seconds**.
- At 45 seconds, enter visible **HUYẾT CHIẾN** pressure:
  - outgoing damage ramps linearly from ×1.00 at 45s to ×1.75 at 60s
  - healing and newly generated shield ramp linearly from ×1.00 at 45s to ×0.50 at 60s
- If neither fighter is KO at 60s, enter visible **TỬ CHIẾN**:
  - outgoing damage ×2.00
  - healing = 0
  - new shield generation = 0
  - continue until a KO, so there is no hidden draw/tiebreak rule

## Control model
- Player fighter is **100% AI controlled** during combat.
- No manual movement, attack, cast, jump or dodge input.
- Prototype AI actions: approach, retreat, hold range, pressure, melee attack, cast, dash in, dash out, recover.
- **No jumping in the first implementation.**
- Basic dash exists as an AI action; it is not initially an invulnerability move.

## Basic attack / distance identity
- Every fighter always has a simple melee basic attack so a non-offensive starting build can still finish a fight.
- There is no free universal ranged basic attack.
- Ranged offense comes from owned skills.
- AI derives preferred fighting distance from the current build, so projectile/control builds naturally keep more space while melee/defense builds close distance.
- Hybrid builds can alternate between ranges based on cooldowns, threat and opportunity.

## Build progression
- Before the tournament, the player receives **2 independent free starter selections**.
- Each starter screen offers 3 random supported Duel skills.
- Starter choice #2 excludes the already owned starter skill so the player begins with two different skills.
- No forced offensive category or forced class/archetype.
- Every selection screen has exactly **1 XOAY LẠI**, consistent with the existing V0.16 build philosophy.
- After each matchup win except the final, receive **1 skill selection** before the next opponent.
- Therefore the player has 2 starter selections plus up to 5 inter-match selections before the final: **7 build decisions before the championship match**.

## Duel skill ranks
- Duel uses **Rank I / II / III**, with Rank III = `TỐI ĐA`.
- This is separate from Survival's existing per-skill max level.
- Same skill identity/key/name/icon/tags are reused.
- Duel values are stored in Duel adapters, not by mutating Survival values.
- No separate `skillNamePvP` clone database.

Conceptual structure:

```text
Skill Identity
  ├─ Survival rules (existing)
  └─ Duel rules (V0.17 adapter, maxRank 3)
```

## Hợp Đạo / Siêu Cấp
- Architecture must support Duel-specific Hợp Đạo and Siêu Cấp conditions.
- Hợp Đạo remains an automatic build unlock and does not consume a selection.
- Siêu Cấp requires its main skill at Duel Rank III plus its Duel support requirement.
- Initial prototype may ship with base Duel skills first; Hợp Đạo/Siêu Cấp are expanded after the combat foundation is stable.

## Rare rules
- Thần Kỹ/Thần Bí Kỹ remain unique and level-less when ported to Duel.
- No duplicate rare in one tournament build.
- Rare rollout is a later checkpoint after normal Duel combat is validated.
- Planned rare chance by inter-match reward count:
  - after first win: 0%
  - after second win: 3%
  - after third win: 6%
  - after fourth win: 10%
  - after fifth win / before final: 15%
- At most one rare card in a 3-card reward roll.
- AI uses the same rare chance and ownership rules.

---

# 3. Architecture lock — gameplay and graphics must be separable

This is the most important technical rule for V0.17.

## DuelSimulation / Duel Engine
Owns only mechanics and state:
- fighter positions and facing
- HP/shield/stats
- timers/cooldowns
- AI intentions
- attacks, projectiles, areas, statuses and summons
- damage/healing/knockback
- round state and result
- semantic visual events such as `attack_melee`, `cast`, `hit`, `projectile_spawn`, `shield_break`, `ko`

The Duel Engine must **not draw directly**.

## DuelRenderer
Consumes Duel state + semantic visual events and draws them.

Prototype renderer:
- vector/silhouette fighters
- procedural/simple animation
- geometric VFX
- one basic flat arena

Future renderer may replace this with:
- sprite sheets
- frame animation
- skeletal/Spine-style characters
- authored particles and backgrounds
- higher-quality hit/cast/KO animations

Changing renderer assets must not require rewriting tournament, AI or skill mechanics.

## Standard fighter animation contract
Prototype and future renderers use shared semantic states:

`idle`, `walk`, `run`, `dash`, `melee`, `ranged`, `cast`, `hit`, `block`, `knockback`, `knockdown`, `recover`, `ko`.

Standard attachment/anchor names:

`head`, `chest`, `leftHand`, `rightHand`, `feet`, `front`, `back`, `target`.

Skills request an anchor; they never hard-code artwork-specific hand coordinates.

## Arena data contract
First arena is a flat stage only, but the engine uses an arena definition from day one:

```js
{
  id,
  width,
  floorY,
  leftBound,
  rightBound,
  background,
  layers
}
```

This leaves room for future arenas without changing combat logic.

---

# 4. Duel AI design

AI is deterministic in intent structure but retains tactical variation.

Every decision tick evaluates:
- current distance
- preferred distance derived from build
- own/opponent HP and shield
- available melee attack
- available skill cooldowns
- opponent cast/action state
- projectiles/areas that threaten current position
- dash availability
- control/status windows

Possible intents:
- `CHASE`
- `PRESSURE`
- `HOLD_RANGE`
- `RETREAT`
- `ATTACK`
- `CAST`
- `DASH_IN`
- `DASH_OUT`
- `RECOVER`

AI build profile is derived from owned skill tags and Duel adapter hints rather than a locked class.

Tournament AI may receive a soft preference seed such as melee, projectile, elemental, control, summon, defense or hybrid. This changes selection weights only; it never prevents cross-class skill choices.

---

# 5. Tournament UX

## Pre-tournament
- mode introduction
- 2 starter selection screens
- then tournament bracket/run begins

## Pre-match opponent preview
Show at minimum:
- tournament stage
- opponent name
- opponent build summary
- notable owned Duel skills and ranks
- coarse AI style derived from build (`Áp sát`, `Tầm xa`, `Khống chế`, `Phòng thủ`, `Hỗn hợp`, etc.)
- player's current build

## Combat HUD
- player/opponent names
- HP + shield
- round score
- round timer
- current tournament stage
- clear `HUYẾT CHIẾN` / `TỬ CHIẾN` state when active

## Match result
On win:
- resolve/simulate the rest of the bracket stage
- if not final: offer one build selection, then preview next opponent
- if final: show Champion result

On loss:
- show final placement/stage reached
- match wins
- round record if available
- final build
- return/restart options

---

# 6. Initial Duel skill slice

Do **not** attempt 140 entries before validating the core combat.

Initial target: **16 existing base skill identities**, chosen to cover the major mechanics needed by the engine:

1. `rapid` — Nhanh Tay
2. `power` — Cường Kích
3. `vitality` — Sinh Lực
4. `speed` — Thân Pháp
5. `fire` — Hỏa Cầu Định Kỳ
6. `knock` — Chấn Khí
7. `orbit` — Phi Kiếm Hộ Thể
8. `heal` — Hồi Linh
9. `armor` — Hộ Giáp
10. `crit` — Bạo Kích
11. `lightning` — Lôi Kích
12. `nova` — Linh Bạo
13. `frost` — Hàn Khí
14. `burn` — Thiêu Đốt
15. `barrier` — Hộ Thể Chu Kỳ
16. `phantomStep` — Ảnh Bộ

This slice exercises:
- stats
- melee attack modification
- periodic ranged attacks
- direct cast damage
- area damage
- knockback
- aura/control
- DOT
- regen
- shield
- armor
- dodge
- movement
- summon/orbit-style pressure

After this foundation works, expand in small audited batches toward all 80 base skills, then 28 Hợp Đạo, 12 Siêu Cấp and 20 rare rules.

---

# 7. Implementation checkpoints

## D0 — Plan/design lock
- add this document
- mark V0.17 active in `ROADMAP.md`
- preserve V0.16 stable systems

## D1 — Isolated Duel foundation
- add Duel mode entry
- side-view canvas/UI separate from Survival canvas loop
- Duel arena data model
- tournament model with 64 fighters
- 2 starter selections + reroll
- pre-match opponent preview
- best-of-3 round state machine
- no existing Survival/Endless behavior changes

## D2 — Combat engine + renderer separation
- semantic Duel combat state/events
- vector prototype renderer
- standard animation states/anchors
- flat arena
- melee basic attack
- move/retreat/hold/dash AI
- HP/shield/KO and round reset
- 60s clock + Huyết Chiến + Tử Chiến

## D3 — First 16 Duel skill adapters
- Rank I/II/III
- adapter values/descriptions visible in selection UI
- build-derived preferred distance
- projectile/area/DOT/aura/shield/heal/dodge interactions
- AI weighted selection for supported skills

## D4 — Tournament completion loop
- simulate non-player matches
- advance bracket correctly through 64/32/16/8/4/2
- award one build choice after each non-final victory
- player elimination flow
- Champion flow
- run summary

## D5 — Prototype validation
- syntax and smoke tests in CI
- deterministic tournament-structure tests
- Duel rank/selection/reroll tests
- best-of-3 reset tests
- timeout pressure tests
- ensure Survival/Endless V0.16 CI remains green
- browser validation on desktop and responsive layout

## D6 — Skill expansion
Small batches toward:
- 40 base Duel skills
- 60 base Duel skills
- all 80 base Duel skills
- 28 Hợp Đạo Duel adaptations
- 12 Siêu Cấp Duel adaptations
- 20 rare Duel adaptations

Every port must preserve the skill's identity while documenting any Duel-specific numeric/mechanical difference.

## D7 — Presentation expansion
Only after the mode is mechanically solid:
- stronger fighter animations
- richer VFX
- authored character art/sprites
- additional arenas
- more camera impact and hit feedback
- optional future jump/air mechanics only if explicitly designed later

---

# 8. Non-regression rules

- V0.16 Survival and Vô Hạn remain available and mechanically unchanged unless a separate change is explicitly approved.
- Do not reuse/modify Movement V0.8 for Duel. Duel has its own side-view AI controller.
- Duel code should prefer new isolated modules over another chain of wrappers around the existing Survival `update()` / `damagePlayer()` stack.
- Player-facing Duel UI remains Vietnamese.
- No hidden caps, weighting, cooldowns, timeout modifiers or tiebreak rules.
- Duel-specific numbers must be present in adapter descriptions or this implementation contract.
- Commit after each meaningful checkpoint and keep GitHub `main` as the canonical source.
