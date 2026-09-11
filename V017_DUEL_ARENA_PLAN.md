# V0.17 — Duel Arena / Đấu Trường 1v1

Status: **ACTIVE ROADMAP — scope locked**.

GitHub `main` remains canonical. V0.16 Survival/Endless is the stable baseline and must remain playable while V0.17 is developed.

**Official completion checklist:** `V017_COMPLETION_PLAN.md`.

That file is the authoritative Definition of Done for V0.17. If an older note or checkpoint conflicts with it, `V017_COMPLETION_PLAN.md` wins.

---

# 1. Product goal

Add a complete **Đấu Trường** mode that keeps the game's core identity — the fighter battles automatically and the player builds the skill set — but changes the battle presentation and run structure:

- side-view 1v1 combat inspired by classic fighting-game staging
- no direct player movement or attack controls
- the build determines whether AI wants to fight close, far or hybrid
- single-elimination tournament starting with **64 fighters**
- each matchup is **best-of-3 rounds**
- the winner advances until one Champion remains
- the full existing V0.16 skill ecosystem is integrated through Duel-specific mechanics instead of copied into a second unrelated skill database

Prototype graphics are intentionally development-quality. The architecture must make a later high-quality graphics replacement straightforward.

---

# 2. V0.17 scope lock

## V0.17 MUST include

V0.17 is only complete when both of these pillars are complete:

### A. Đấu Trường mode
- 64-fighter tournament
- best-of-3 combat
- automatic build-aware AI
- starter/reward/reroll progression
- opponent preview, combat HUD, result flow and Champion/elimination flow
- stable desktop/mobile flow

### B. Full skill-system integration
- **80 / 80 Kỹ Năng**
- **28 / 28 Hợp Đạo Kỹ**
- **12 / 12 Siêu Cấp**
- **20 / 20 rare rules** = 10 Thần Kỹ + 10 Thần Bí Kỹ
- AI and player use equivalent unlock/acquisition rules
- full integration/balance/CI/Pages validation

A playable tournament with incomplete Hợp Đạo/Siêu Cấp/rare support is still **V0.17 DEV**, not a finished V0.17 release.

## Explicitly post-V0.17

The following do not block the V0.17 release:

- high-end final character artwork
- sprite/skeletal renderer replacement
- multiple arenas / arena hazards
- jump or aerial combat
- manual controls
- large cinematic camera overhaul
- server/global leaderboard
- online PvP/netcode
- skill content beyond the existing V0.16 ecosystem

Only release-blocking readability or UX fixes may pull presentation work forward.

---

# 3. Locked design decisions

## Tournament
- Exactly **64 fighters** at tournament start.
- Bracket: `64 → 32 → 16 → 8 → 4 → 2 → Champion`.
- No BYE system.
- Losing one matchup eliminates the player and ends the run.
- Other matches are simulated; only the player's matchup uses the real Duel combat/render loop.
- AI fighters obey the same build progression rules as the player.

## Match / round format
- Every matchup is **best-of-3**; first to 2 round wins advances.
- Build is frozen for all rounds inside one matchup.
- Between rounds reset HP, shield, cooldowns, statuses, summons, projectiles and temporary effects.
- Tournament build persists between matchups.
- At 45 seconds enter visible **HUYẾT CHIẾN**:
  - outgoing damage ramps from ×1.00 to ×1.75 by 60s
  - healing/new shield ramps from ×1.00 to ×0.50 by 60s
- At 60 seconds enter visible **TỬ CHIẾN**:
  - outgoing damage ×2.00
  - healing = 0
  - new shield generation = 0
  - continue until KO; no hidden timeout tiebreak

## Control model
- Player fighter is **100% AI controlled** during combat.
- No manual movement, attack, cast, jump or dodge input.
- Core AI actions: approach, retreat, hold range, pressure, melee attack, cast, dash in, dash out, recover.
- **No jumping in V0.17.**
- Basic dash is not initially an invulnerability move.

## Basic attack / distance identity
- Every fighter always has a simple melee basic attack so non-offensive builds can still finish a fight.
- There is no free universal ranged basic attack.
- Ranged offense comes from owned skills.
- AI derives preferred distance from the build.
- Hybrid builds can change spacing based on threat, cooldowns and opportunity.

## Build progression
- Before the tournament: **2 unrestricted starter selections**.
- Each starter screen offers 3 random supported Duel skills.
- Starter #2 excludes the already owned starter so the fighter begins with two different skills.
- No forced offensive category or class/archetype.
- Every selection screen has exactly **1 XOAY LẠI**.
- After each matchup win except the final, receive **1 skill selection**.
- Maximum before the final: 2 starter decisions + 5 inter-match decisions = **7 build decisions**.

## Duel skill ranks
- Duel uses **Rank I / II / III**, Rank III = `TỐI ĐA`.
- Same skill key/name/icon/tags are reused from the shared identity.
- Duel values/mechanics live in Duel adapters and never mutate Survival values.

Conceptually:

```text
Skill Identity
  ├─ Survival rules
  └─ Duel rules (maxRank 3)
```

---

# 4. Skill-system contract

## Base Kỹ Năng
- All **80 / 80** base skills must have functional Duel mechanics.
- Any Survival trigger that does not exist in 1v1 (XP economy, enemy-population kill trigger, multi-target-only rule, etc.) receives an explicit Duel reinterpretation.
- Duel descriptions must state the actual rule and numbers.

Current status: **80 / 80 COMPLETE**.

## Hợp Đạo Kỹ
- Hợp Đạo is an automatic build unlock and never consumes a reward selection.
- Same Hợp Đạo identity/relationship is preserved.
- Duel uses a dedicated synergy registry/requirement evaluator, not Survival runtime hooks.
- Player and AI use identical unlock requirements.
- Multi-target/XP/kill-specific effects receive explicit Duel behavior when needed.

Release target: **28 / 28**.

## Siêu Cấp
- Main/base skill must reach **Duel Rank III / TỐI ĐA**.
- Duel support/tag requirement must also be satisfied.
- Unlock is automatic and consumes no reward selection.
- Once converted, the base skill must not continue appearing as a normal upgrade choice.
- Choice-card evolution hint appears only when that exact choice immediately completes the unlock.

Release target: **12 / 12**.

## Rare rules
- Thần Kỹ/Thần Bí Kỹ are unique and level-less.
- No duplicate rare in one tournament build; different rares may coexist.
- Starter screens contain no rare.
- Inter-match rare chance:
  - after first win: 0%
  - after second win: 3%
  - after third win: 6%
  - after fourth win: 10%
  - after fifth win / before final: 15%
- At most one rare card in a 3-card reward roll.
- Reroll rerolls the full reward screen including the rare roll.
- AI uses the same stage-based chance and ownership rules.
- Rare rules whose Survival meaning is invalid in 1v1 must receive an explicit Duel mechanic rather than silently doing nothing.

Release target: **20 / 20**.

---

# 5. Architecture lock — gameplay and graphics stay separable

This remains the most important technical rule for V0.17.

## Duel Engine
Owns mechanics/state only:
- fighter positions/facing
- HP/shield/stats
- timers/cooldowns
- AI intentions
- attacks, projectiles, areas, statuses, summons
- damage/healing/knockback
- round state/result
- semantic visual events

The Duel Engine does **not** draw directly.

## DuelRenderer
Consumes Duel state + semantic events.

Current renderer may use:
- vector/silhouette fighters
- procedural/simple animation
- geometric VFX
- one flat arena

Future renderer may replace it with sprites/skeletal animation without changing tournament, AI or skill mechanics.

## Semantic fighter states

`idle`, `walk`, `run`, `dash`, `melee`, `ranged`, `cast`, `hit`, `block`, `knockback`, `knockdown`, `recover`, `ko`.

Standard anchors:

`head`, `chest`, `leftHand`, `rightHand`, `feet`, `front`, `back`, `target`.

## Arena contract

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

V0.17 only requires one functional flat arena.

---

# 6. Duel AI contract

Every decision tick may evaluate:
- distance and preferred distance
- own/opponent HP and shield
- available basic attack/skills
- opponent action/cast state
- projectile/area threat
- dash availability
- statuses/control windows

Possible intents include:

`CHASE`, `PRESSURE`, `HOLD_RANGE`, `RETREAT`, `ATTACK`, `CAST`, `DASH_IN`, `DASH_OUT`, `RECOVER`.

AI build profile is derived from skill tags/adapter hints, never a locked class.

Tournament AI may use a soft preference seed such as melee/projectile/elemental/control/summon/defense/hybrid. It changes weighting only and never prevents cross-class choices.

---

# 7. Tournament UX contract

## Pre-tournament
- mode introduction
- 2 starter selection screens
- tournament begins

## Opponent preview
Show at minimum:
- tournament stage
- opponent name
- opponent build summary
- notable Duel skills/ranks
- unlocked Hợp Đạo/Siêu Cấp/rare when relevant
- coarse AI style
- player's current build

## Combat HUD
- fighter names
- HP + shield
- round score
- round time
- tournament stage
- clear HUYẾT CHIẾN/TỬ CHIẾN state

## Match result
Win:
- resolve rest of bracket stage
- if not final: one build reward then next preview
- if final: Champion result

Loss:
- final placement/stage
- match/round result summary
- final build
- restart/menu options

---

# 8. Remaining canonical checkpoints

Detailed acceptance criteria live in `V017_COMPLETION_PLAN.md`.

From the current 80/80-base checkpoint:

## C1 — Hợp Đạo foundation
- Duel synergy registry
- requirement evaluator
- automatic unlock
- player/AI parity
- first real mechanically tested synergy

## C2 — 28/28 Hợp Đạo
Recommended audited batches: 8 → 16 → 22 → 28.

## C3 — 12/12 Siêu Cấp
- evolution requirement framework
- Rank III + support rule
- automatic conversion/unlock
- truthful final-piece hints
- all 12 adaptations

## C4 — 20/20 rare rules
- tournament rare offer framework
- first 10
- all 20
- ordering/conflict tests

## C5 — Full integration + focused balance
- complete 80 + 28 + 12 + 20 ecosystem
- archetype/matchup/tournament simulations
- no stalled matches or broken dominant mechanics
- no hidden balancing bonuses

## C6 — Final release validation
- full V0.16 + V0.17 CI
- exact Pages artifact/deploy
- desktop/mobile hands-on validation
- docs/runtime closure
- `V0.17 DEV` → **V0.17**
- mark **V0.17 COMPLETE / RELEASED**

---

# 9. Non-regression rules

- V0.16 Survival/Vô Hạn stay mechanically stable unless a separate change is explicitly approved.
- Do not modify Movement V0.8 for Duel.
- Prefer isolated Duel modules over wrappers around Survival `update()` / `damagePlayer()`.
- Player-facing Duel UI remains Vietnamese.
- No hidden caps, weighting, cooldowns, stack maxima, target limits, retry rules or timeout modifiers.
- Duel-specific rules/numbers must be visible in adapter descriptions or the completion contract.
- Player and AI follow equivalent tournament build rules.
- Commit after each meaningful checkpoint and gate it in CI before starting the next content batch.
- GitHub `main` remains canonical.

---

# 10. Post-V0.17 roadmap

Only after V0.17 is `COMPLETE / RELEASED` should a later version plan the non-blocking presentation expansion:

- stronger fighter animation/art
- richer VFX/camera impact
- sprite/skeletal renderer replacement
- additional arenas
- optional jump/air mechanics
- new tournament variants
- further content beyond the existing skill ecosystem

These are **future features, not unfinished V0.17 work**.
