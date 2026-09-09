# V0.16 Balance Baseline

This file freezes the released **V0.16** pressure curve before any post-release balance tuning. GitHub `main` is canonical.

No gameplay number was changed to create this baseline. Metrics come from the actual formulas in `js/modes.js` and the spawn logic in `js/game.js` / `js/combat.js`.

## What the baseline measures
For each mode the deterministic harness estimates:
- nominal enemy spawns from spawn cooldown + extra-spawn probabilities
- expected elite count
- theoretical XP supply if every spawned enemy is killed and every gem is collected
- ordinary enemy HP/contact damage at key timestamps
- endless long-run spawn/HP/damage scaling

These are **pressure-model metrics**, not a prediction of real player kills or actual achieved level. They intentionally exclude player build strength, pathing losses, uncollected XP, damage downtime and random combat outcomes.

Test: `tests/balance-baseline-v016.js`

---

## Timed-mode totals — released V0.16
| Mode | Expected spawns | Expected elites | Perfect-clear XP supply |
|---|---:|---:|---:|
| 5 phút | 662.3 | 78.7 | 898.4 |
| 10 phút | 1324.7 | 157.4 | 1796.9 |
| 15 phút | 1987.0 | 236.1 | 2695.3 |
| 20 phút | 2649.4 | 314.8 | 3593.7 |

### Important structural observation
The four timed modes currently share the **same normalized spawn-density curve**. Their spawn cooldown, elite chance and extra-spawn chance are functions of run progress, not the mode's pressure multiplier.

Therefore total expected spawns are almost exactly proportional to duration:
- ~132.5 expected spawns per nominal run-minute in all four timed modes when integrated across the whole run.

The mode `pressure` multiplier currently changes **enemy HP and damage**, not spawn density:
- 5 phút: `0.96`
- 10 phút: `1.00`
- 15 phút: `1.05`
- 20 phút: `1.10`

This is not automatically a balance problem; it is now an explicit baseline fact to evaluate during hands-on tuning.

---

## Timed-mode end-state snapshot
At 100% run progress all timed modes reach the same spawn-side values:
- spawn cooldown: **0.27s**
- elite chance: **20%**
- extra-spawn chance: **44.1%**
- expected nominal spawn rate including the late third-spawn roll: **361.4 enemies/minute**
- enemy speed scale: **1.23×**

Mode pressure then separates HP/damage:

| Mode | HP scale | Normal enemy HP | Damage scale | Normal contact DPS |
|---|---:|---:|---:|---:|
| 5 phút | 3.168× | 79.2 | 2.035× | 16.3 |
| 10 phút | 3.300× | 82.5 | 2.120× | 17.0 |
| 15 phút | 3.465× | 86.6 | 2.226× | 17.8 |
| 20 phút | 3.630× | 90.8 | 2.332× | 18.7 |

Base ordinary enemy values are 25 HP and 8 contact DPS before scaling. Elite base values are 54 HP and 15 contact DPS.

---

## Endless snapshots — released V0.16
| Time | HP scale | Normal HP | Damage scale | Normal contact DPS | Elite chance | Spawn cooldown | Expected nominal spawns/min |
|---|---:|---:|---:|---:|---:|---:|---:|
| 0m | 1.000× | 25.0 | 1.000× | 8.0 | 1.0% | 1.05s | 57.1 |
| 5m | 2.818× | 70.5 | 2.071× | 16.6 | 5.2% | 0.764s | 90.0 |
| 10m | 4.636× | 115.9 | 3.143× | 25.1 | 9.5% | 0.479s | 169.8 |
| 20m | 8.273× | 206.8 | 5.286× | 42.3 | 17.9% | 0.20s | 606.7 |
| 30m | 12.259× | 306.5 | 7.609× | 60.9 | 26.4% | 0.20s | 606.7 |
| 45m | 18.239× | 456.0 | 11.093× | 88.7 | 27.0% | 0.20s | 606.7 |
| 60m | 24.218× | 605.5 | 14.577× | 116.6 | 27.0% | 0.20s | 606.7 |

### Important structural observation
By 20 minutes Endless reaches:
- the **0.20s spawn-cooldown floor**
- the **72% extra-spawn cap**
- the late third-spawn roll is already active

That produces a nominal expectation of about **606.7 spawned enemies/minute** from 20 minutes onward. After the spawn-side caps are reached, HP and damage continue increasing with time.

This is the first obvious area to watch during real Endless balance tests because late-game difficulty shifts from increasing entity arrival rate toward increasing enemy durability/damage.

---

## Integrated Endless pressure
| Horizon | Expected spawns | Expected elites | Perfect-clear XP supply |
|---|---:|---:|---:|
| 5m | 352.0 | 11.6 | 386.7 |
| 10m | 970.4 | 58.4 | 1145.6 |
| 20m | 5239.2 | 681.6 | 7284.0 |
| 30m | 11306.4 | 2027.1 | 17387.7 |

These values grow very quickly after the spawn cooldown reaches its floor. They are intentionally frozen as the V0.16 before-state rather than immediately changed.

---

## XP progression reference
Core XP requirements remain:
- cumulative XP to Lv5: **36**
- Lv10: **202**
- Lv15: **610**
- Lv20: **1508**
- Lv25: **3478**
- Lv30: **7800**

The perfect-clear XP supply above is an upper-bound pressure reference only. Actual level progression is lower whenever enemies survive, gems are not collected promptly, or the build cannot keep pace with spawn density.

---

# Balance Pass B1 interpretation
Do **not** tune from these numbers alone.

The next measurement layer should compare actual reproducible builds against this environmental pressure baseline and record:
- kills/minute
- percentage of spawned enemies actually cleared
- player level over time
- incoming HP damage / shield absorption
- survival time
- active enemy count / projectile count / VFX density
- which base skills, Hợp Đạo, Siêu Cấp or rare rules create the largest deviations

Only after those build-vs-pressure measurements should B2 change gameplay numbers.

## Locked during B1
- no V0.8 movement rewrite
- no arbitrary rare-rate change
- no broad HP/damage/spawn tuning
- no new major content expansion

Any future balance change that intentionally modifies these baseline anchors must update the baseline test and document the before/after reason in the same checkpoint.
