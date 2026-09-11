# V0.17 — Completion Plan / Kế hoạch chốt Đấu Trường

Status: **LOCKED SCOPE — canonical completion plan for V0.17**.

GitHub `main` is canonical. This document defines exactly what must be finished before V0.17 may be marked `COMPLETE`.

---

# 1. V0.17 Definition of Done

**V0.17 is complete when the Đấu Trường 1v1 mode is functionally complete and the full V0.16 skill ecosystem has been integrated into Duel.**

Required release content:

- 64-fighter single-elimination tournament is fully playable from start to Champion/elimination.
- Best-of-3 Duel combat loop is stable.
- Player fighter remains fully automatic.
- Duel AI uses the fighter's build to choose close/ranged/hybrid behavior.
- Duel Rank I/II/III progression works throughout the tournament.
- 2 unrestricted starter selections + one reward after each non-final victory work correctly.
- **80 / 80 base Kỹ Năng** have Duel mechanics and public Duel descriptions.
- **28 / 28 Hợp Đạo Kỹ** unlock and function in Duel.
- **12 / 12 Siêu Cấp** unlock and function in Duel.
- **20 / 20 rare rules** (10 Thần Kỹ + 10 Thần Bí Kỹ) have explicit Duel behavior and tournament acquisition rules.
- Player and AI use the same ownership/unlock/acquisition rules unless a difference is explicitly player-facing.
- Full-system balance/integration pass is complete.
- V0.16 Survival/Endless regression suite remains green.
- V0.17 CI, public Pages artifact and desktop/mobile hands-on validation are complete.
- Runtime/version/docs are changed from `V0.17 DEV` to final **V0.17** only after all release gates pass.

Anything below this line is **not sufficient by itself** to call V0.17 complete: base skills only, automated CI only, a playable prototype only, or a visually polished prototype missing skill systems.

---

# 2. Explicitly OUT of V0.17 scope

These are future-version presentation/features and must **not block V0.17 completion**:

- final/high-end character artwork
- sprite-sheet or skeletal/Spine replacement of the prototype renderer
- multiple arenas / arena hazards / terrain variants
- jump, aerial combat or air-combo systems
- manual movement/attack/cast controls
- large cinematic camera overhaul
- server/global leaderboard
- online PvP/netcode
- large content expansion beyond the existing 80 + 28 + 12 + 20 skill ecosystem

The V0.17 graphics requirement is architectural, not artistic: the renderer must remain replaceable and the current prototype presentation must be readable and functional.

---

# 3. Current position

Already complete:

- Duel/tournament foundation ✅
- 64 → 32 → 16 → 8 → 4 → 2 → Champion bracket ✅
- best-of-3 round loop ✅
- HUYẾT CHIẾN / TỬ CHIẾN ✅
- side-view isolated Duel engine ✅
- replaceable prototype renderer ✅
- build-aware automatic AI ✅
- starter/reward/reroll tournament progression ✅
- **80 / 80 base Duel Kỹ Năng ✅**
- layered base-skill CI checkpoints 40/50/60/70/80 ✅
- public GitHub Pages deployment with all 80 base adapters ✅

Remaining release content:

- Hợp Đạo: **0 / 28**
- Siêu Cấp: **0 / 12**
- Rare: **0 / 20**
- full-content integration/balance
- final desktop/mobile release validation and V0.17 closure

---

# 4. Remaining execution plan

## C1 — Duel Hợp Đạo foundation

Goal: create a Duel-native synergy system instead of reusing Survival runtime hooks.

Required work:

- `DUEL_SYNERGIES` registry using the same synergy IDs/names/icons as V0.16.
- Duel-specific unlock requirement evaluator using current Duel build ranks/tags.
- Automatic unlock: Hợp Đạo never consumes a reward selection.
- Recompute unlocks when the tournament build changes.
- Fighter round state receives the currently unlocked Hợp Đạo set.
- Hợp Đạo mechanics register through Duel behavior hooks/events, not Survival wrappers.
- Player-facing build/pre-match UI can show unlocked Hợp Đạo.
- AI fighters unlock Hợp Đạo by the exact same requirement rules.
- Deterministic CI for unlock truth, no duplicate unlocks and no Survival regression.

Exit gate: **Hợp Đạo foundation is stable and at least one real synergy is mechanically tested end-to-end.**

## C2 — Port all 28 Hợp Đạo Kỹ

Work in small audited batches rather than one large change.

Recommended checkpoints:

- C2A: 0 → 8
- C2B: 8 → 16
- C2C: 16 → 22
- C2D: 22 → 28

Rules:

- Preserve identity and original relationship between required skills.
- Multi-target/XP/kill-dependent effects receive explicit Duel reinterpretations where literal Survival behavior is impossible.
- Any Duel-specific rule must be written in the Hợp Đạo description.
- No hidden proc rates, cooldowns, caps or target rules.
- Hợp Đạo interactions must respect generic Duel metadata (`projectile`, `area`, `chain`, `summon`, `elemental`, etc.) where available.

Exit gate: **28 / 28 Hợp Đạo work in Duel and have a dedicated all-28 CI gate.**

## C3 — Duel Siêu Cấp foundation + all 12 Siêu Cấp

Goal: make Siêu Cấp realistically achievable inside the short tournament while preserving the meaning of mastery.

Locked progression rule:

- Main/base skill must be **Duel Rank III / TỐI ĐA**.
- Duel support/tag requirement must also be satisfied.
- Siêu Cấp unlocks automatically; it does not consume a reward selection.
- A base skill converted to Siêu Cấp remains unavailable as a normal upgrade choice.

Recommended checkpoints:

- C3A: evolution requirement evaluator + first real Siêu Cấp
- C3B: 1 → 6
- C3C: 6 → 12

Required UI/truth work:

- build view shows unlocked Siêu Cấp.
- choice cards may only hint an evolution when the exact choice immediately completes it.
- Duel descriptions state the actual Duel mechanic/numbers.

Exit gate: **12 / 12 Siêu Cấp work in Duel and all unlock/hint truth tests pass.**

## C4 — Duel Rare System: 20 Thần Kỹ / Thần Bí Kỹ

Goal: integrate all rare rules without allowing one rule to destroy best-of-3 balance or introduce hidden exceptions.

Locked acquisition curve for inter-match rewards:

- after first win: 0%
- after second win: 3%
- after third win: 6%
- after fourth win: 10%
- after fifth win / before final: 15%

Locked rules:

- starter choices contain no rare.
- at most one rare card can appear in a 3-card reward roll.
- rares are unique/level-less.
- no duplicate owned rare.
- different rares may coexist.
- reroll rerolls the whole reward screen and the rare roll.
- AI receives the same stage-based rare chance and ownership rules.
- no special hidden boost for the player or late-tournament AI.

Recommended checkpoints:

- C4A: rare offer/acquisition framework + deterministic probability tests
- C4B: first 10 rare rules
- C4C: all 20 rare rules
- C4D: rare ordering/conflict tests, especially revive/fatal-damage/time/control/defense rules

Special requirement:

Rare rules whose Survival meaning is invalid in 1v1 (for example conversion/bribery or broad enemy-population manipulation) must receive an explicit Duel mechanic rather than silently doing nothing.

Exit gate: **20 / 20 rare rules work, acquisition rules are transparent, and defensive/fatal ordering is deterministic.**

## C5 — Full Duel integration and balance

This is not a broad redesign. It is a focused release pass on the finished content set.

Test the complete system together:

- 80 base + 28 Hợp Đạo + 12 Siêu Cấp + 20 rare.
- melee / ranged / hybrid / defense / control / summon / elemental / DOT archetypes.
- AI preferred-distance behavior with late-game builds.
- build selection and upgrade distribution across a 6-match tournament.
- Hợp Đạo/Siêu Cấp attainability within 7 pre-final build decisions.
- rare frequency by tournament stage.
- defensive-vs-defensive fights and TỬ CHIẾN termination.
- revive/fatal-damage/shield/heal interaction ordering.
- projectile/area/chain/summon metadata interactions.
- offscreen AI tournament simulation versus real Duel strength assumptions.

Balance principle:

- Fix obvious outliers, broken combinations and dead/unusable mechanics.
- Do not chase perfect competitive balance before V0.17 release.
- Prefer transparent numeric adjustment over hidden AI bonuses or hidden counterweights.

Exit gate: **no known blocker, no infinite/stalled match, no dominant broken rule identified by the release scenarios, and deterministic CI remains green.**

## C6 — Final release validation and V0.17 closure

Automated release gate:

- all V0.16 tests green.
- all V0.17 base/Hợp Đạo/Siêu Cấp/rare tests green.
- deterministic 64-player tournament completes.
- player can be eliminated and can become Champion.
- build/reward/reroll rules survive full tournament simulation.
- exact Pages artifact contains every required Duel module.
- public Pages deploy succeeds.

Hands-on release gate:

- desktop play-through of tournament flow.
- mobile/responsive tournament flow.
- selection cards readable and tappable.
- opponent preview/build display readable.
- combat HUD readable.
- no major visual desync between fighter state and mechanics.
- no blocking navigation/menu/result bug.

Closure actions:

- fix release blockers.
- update `README.md`, `ROADMAP.md`, `PROJECT_HANDOFF.md` and this document.
- change runtime label from `V0.17 DEV` → `V0.17`.
- mark **V0.17 — COMPLETE / RELEASED**.
- freeze the V0.17 release baseline before beginning presentation expansion or V0.18.

---

# 5. Release sequence from the current checkpoint

Canonical order from the current 80/80-base checkpoint:

```text
C1  Hợp Đạo foundation
 ↓
C2  28/28 Hợp Đạo
 ↓
C3  12/12 Siêu Cấp
 ↓
C4  20/20 Rare
 ↓
C5  Full integration + focused balance
 ↓
C6  Final desktop/mobile + CI/Pages validation
 ↓
V0.17 COMPLETE / RELEASED
```

Do not start post-V0.17 presentation expansion before C6 is closed unless required to fix a release-blocking readability/UX issue.

---

# 6. Non-negotiable implementation rules

- V0.16 Survival/Endless stays mechanically stable.
- Never rewrite Movement V0.8 as part of Duel work.
- Duel systems remain isolated modules; do not add another chain of wrappers around Survival `update()` / `damagePlayer()`.
- Every gameplay modifier must be explicit in data/description or this contract.
- No hidden caps/cooldowns/stack maxima/weights/target limits/retry rules.
- Player-facing text remains Vietnamese.
- Player and AI follow equivalent tournament build rules.
- Every meaningful checkpoint gets its own commit and CI gate before the next content batch.
- GitHub `main` remains canonical.

---

# 7. What comes after V0.17

Once V0.17 is released, a later roadmap may cover:

- high-quality fighter art/animation
- sprite/skeletal renderer replacement
- richer VFX and camera impact
- more arenas
- jump/aerial mechanics
- new tournament variants
- additional skill content beyond the existing V0.16 ecosystem

Those are **new development goals**, not unfinished V0.17 work.
