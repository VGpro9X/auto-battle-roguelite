# V0.16 Fixed-Build Balance Scenarios

GitHub `main` is canonical. This closes the post-release V0.16 focused balance measurement pass without changing gameplay numbers.

## Purpose
B1.1 froze the released environment/pressure curve in `BALANCE_BASELINE_V016.md`. B1.2 then tested deliberately fixed endpoint builds against the **exact generated GitHub Pages V0.16 artifact** in headless Chromium.

These scenarios are stress/role comparisons, not simulations of normal acquisition order. Each build starts the run fully installed at time 0, so the results must not be used as if they were ordinary player progression telemetry.

No Movement V0.8 logic or gameplay number was changed for these measurements.

## Method
- exact Pages artifact for final V0.16
- Chromium runtime, 1280×720
- deterministic xorshift PRNG seeds: 101, 202, 303
- simulation step: 0.05s
- game `update()` path runs normally; drawing is omitted to isolate mechanics
- level-ups still increase player level/XP requirement, but automatic skill selection is disabled so the fixed build does not mutate during the run
- 5-minute and 10-minute timed pressure were sampled
- a safety stop at **901 active enemies** is used only by the measurement harness to avoid spending unbounded analysis time on a deliberately non-clearing defense build; it is not a shipped gameplay cap

Metrics use observed spawned population where clear percentage = kills / (kills + living enemies at the measurement endpoint).

---

# Scenario definitions

## 1. Offense endpoint
42 invested base-skill levels:
- Nhanh Tay 6
- Cường Kích 6
- Song Tiễn 3
- Xuyên Phá 3
- Bạo Kích 5
- Nảy Đạn 4
- Đạn Nổ 5
- Ảnh Xạ 5
- Phá Giáp 5

Natural unlock in this fixed build: Hợp Đạo Kỹ `Ảnh Xạ`/echo interaction where requirements are met by the live registry.

Intent: high normal-attack/projectile throughput with almost no explicit defense.

## 2. Defense endpoint
41 invested base-skill levels:
- Sinh Lực 6
- Hộ Giáp 5
- Hồi Linh 5
- Hộ Thể Chu Kỳ 5
- Tuyệt Lộ 5
- Ảnh Bộ 5
- Phản Chấn 5
- Gai Máu 5

Intent: maximum survivability/stall with intentionally weak proactive clear.

## 3. Summon / control endpoint
40 invested base-skill levels:
- Phi Kiếm Hộ Thể 5
- Hàn Khí 5
- Linh Hỏa 5
- Lôi Linh 5
- Ngự Linh 5
- Hộ Pháp Mộc Nhân 5
- Trói Hồn 5
- Hắc Vực 5

Natural evolution in the live registry: `swordDomain` where its requirements are met.

Intent: strong passive clear/control with little direct HP/armor investment.

## 4. Rare-heavy defensive hybrid
30 invested base-skill levels plus four owned rare rules:
- Nhanh Tay 4
- Cường Kích 4
- Hộ Giáp 3
- Hộ Thể Chu Kỳ 3
- Linh Hỏa 4
- Lôi Linh 4
- Ngự Linh 4
- Hàn Khí 4

Rare rules:
- Thiên Hộ (`heavenlyWard`)
- Thần Vực (`divineDomain`)
- Nợ Máu (`bloodDebt`)
- Ký Sinh (`parasitePact`)

Intent: deliberately rare/defense-heavy hybrid, not a maximum-DPS rare build.

---

# 5-minute results — 3 deterministic seeds

| Scenario | Avg kills | Kills/min | Observed clear | Avg living enemies | Avg max living | Avg level | Avg final HP |
|---|---:|---:|---:|---:|---:|---:|---:|
| Offense | 577.3 | 115.5 | 93.6% | 39.7 | 46.0 | 11.3 | 100/100 |
| Defense | 55.7 | 11.1 | 9.0% | 564.3 | 564.3 | 6.0 | 208/208 |
| Summon/control | 550.7 | 110.1 | 87.8% | 76.3 | 76.7 | 9.3 | 79.5/100 |
| Rare-heavy hybrid | 403.7 | 80.7 | 64.6% | 221.7 | 221.7 | 10.0 | 100/100 |

Additional 5-minute defensive observations:
- pure defense absorbed about **426.9 shield damage** on average while taking no net HP loss in these seeds
- rare-heavy hybrid absorbed about **323.4 shield damage** on average while taking no net HP loss
- offense did not need explicit defense because its clear/control distance kept contact pressure very low in this artificial fully-built-at-start scenario

---

# 10-minute results — 3 deterministic seeds

| Scenario | Avg measured time | Avg kills | Kills/min | Observed clear at endpoint | Avg living enemies | Avg max living | Avg level | Outcome pattern |
|---|---:|---:|---:|---:|---:|---:|---:|---|
| Offense | 600s | 1202.7 | 120.3 | 96.3% | 45.7 | 54.0 | 13.7 | 3/3 complete at full HP |
| Defense | 554s* | 109.3 | 11.8 | 10.8% | 901.0 | 901.0 | 7.3 | measurement safety threshold reached 3/3; player still at 208/208 HP |
| Summon/control | 586s | 1114.3 | 114.0 | 94.0% | 70.7 | 77.3 | 14.3 | 2/3 die late; 1/3 reaches 600s at ~3 HP |
| Rare-heavy hybrid | 600s | 796.7 | 79.7 | 64.1% | 445.7 | 445.7 | 13.7 | 3/3 complete at full HP |

`*` Defense time is not death time. The analysis harness stopped when living enemies exceeded 900 because this intentionally low-clear build kept surviving while the crowd accumulated.

Rare-heavy hybrid shield absorption in the three 10-minute seeds was approximately **610.3 / 504.9 / 578.8**, while final HP stayed 100/100.

---

# Interpretation

## Clear archetype trade-offs are working
The four endpoints separate in the expected direction:
- offense converts investment into very high clear and low field population
- summon/control nearly matches offense clear but is much less forgiving when enemies finally connect
- pure defense can remain alive while catastrophically losing the clear-rate race
- the chosen rare-heavy defensive hybrid survives comfortably but leaves a much larger field population because its rare investment is protective rather than maximum-DPS

This is useful evidence that offense, defense, control and defensive rare investment are not collapsing into the same outcome.

## Structural observation: survivability can outpace clear
The defense and rare-heavy scenarios demonstrate that a sufficiently defensive build may continue surviving while active-enemy count grows strongly. This is **not currently treated as a release blocker** because:
1. these tests start extreme maxed/fixed builds at time 0 rather than following normal acquisition
2. the user already accepted V0.16 hands-on without a blocking late-game performance/readability issue
3. adding an arbitrary enemy cap/spawn suppression would violate the project's no-hidden-cap rule unless designed and disclosed as a real mechanic

If a future plan targets late-Endless performance or defensive stall gameplay, this is the first baseline to revisit.

## No evidence-backed numeric tuning is justified now
The scenarios reveal role differences, but they do not isolate one specific base skill/Hợp Đạo/Siêu Cấp/rare value as the cause of an unfair outcome. Broadly nerfing offense, buffing summon defense, or weakening defensive rares from these endpoint stress tests would be tuning from an artificial setup rather than normal-run telemetry.

Therefore **B2 makes no gameplay changes**.

Because B2 changes nothing, **B3 before/after validation is not applicable**. Existing V0.16 CI, exact Pages-artifact browser validation and user hands-on sign-off remain the release evidence.

---

# Focused balance pass — CLOSED
Status:
- B1.1 environment/pressure baseline: COMPLETE
- B1.2 fixed-build endpoint scenarios: COMPLETE
- B2 targeted tuning: CLOSED — no evidence-backed change selected
- B3 post-tuning validation: NOT REQUIRED — no gameplay values changed

The released V0.16 gameplay baseline remains unchanged.

The project is now intentionally left with **no active development checkpoint** so a new roadmap can be planned cleanly.
