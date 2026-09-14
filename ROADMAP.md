# Auto Battle Roguelite — Roadmap

GitHub `main` is canonical.

## Current baseline
- Released baseline: **V0.19 – Tactical AI & Movement Intelligence**.
- Previous released baseline: **V0.18 – Graphics & Presentation Overhaul**.
- Historical mechanics/content baseline: **V0.17 – Duel Arena / Đấu Trường 1v1**.
- V0.19 authoritative plan: `V019_TACTICAL_AI_PLAN.md`.
- V0.19 release evidence: `V019_RELEASE_VALIDATION.md`.
- V0.18 release evidence: `V018_RELEASE_VALIDATION.md`.
- Survival/Endless V0.16 remains supported.
- Player-facing language: Vietnamese.

---

# V0.15 — COMPLETE ✅
Responsive phone/tablet/desktop UI accepted on GitHub Pages.

# V0.16 — COMPLETE / RELEASED ✅
- 80 base Kỹ Năng
- 28 Hợp Đạo Kỹ
- 12 Siêu Cấp
- 20 Rare rules
- 140 Codex entries

# V0.17 — DUEL ARENA / ĐẤU TRƯỜNG 1v1 — COMPLETE / RELEASED ✅
- 64-fighter tournament
- Best-of-3 automatic combat
- two unrestricted starter choices + one reroll
- opponent scouting
- 80 / 80 Kỹ Năng Duel
- 28 / 28 Hợp Đạo Kỹ Duel
- 12 / 12 Siêu Cấp Duel
- 20 / 20 Rare Duel rules
- HUYẾT CHIẾN at 45s
- TỬ CHIẾN at 60s+
- desktop/mobile rendered validation

V0.17 remains frozen as the historical mechanics/content regression baseline except for bug fixes.

---

# V0.18 — GRAPHICS & PRESENTATION OVERHAUL — COMPLETE / RELEASED ✅

Authoritative plan: `V018_GRAPHICS_PLAN.md`.
Release validation: `V018_RELEASE_VALIDATION.md`.

Delivered:
- G0 architecture/art direction lock
- G1 manifest/image loader + Renderer V2 foundation
- G2 13 / 13 fighter semantic states + required anchors
- G3 six-layer Ashen Sanctum + presentation camera
- G4 semantic VFX readability system
- G5 Duel UI/HUD/tournament presentation polish
- G6 performance/quality/fallback hardening
- G7 integrated release validation

V0.18 remains the frozen graphics/presentation baseline. Its G5E/G6D/G6E/G7 workflows continue as historical regression gates under V0.19.

---

# V0.19 — TACTICAL AI & MOVEMENT INTELLIGENCE — COMPLETE / RELEASED ✅

Authoritative plan: `V019_TACTICAL_AI_PLAN.md`.
Release validation: `V019_RELEASE_VALIDATION.md`.

Primary scope delivered:
- Survival anti-encirclement / anti-spin movement intelligence
- predictive escape corridors + commitment/stuck recovery
- Survival strategic utility improvements
- Duel tactical perception + spatial position scoring
- Duel utility tactics, footsies, spacing and anti-corner-lock behavior
- build-aware AI styles
- seeded AI simulation + mobile/performance validation

Checkpoint status:
- A0 AI Diagnostics & Reproduction — **COMPLETE ✅**
- A1 Shared Decision Stability Foundation — **COMPLETE ✅**
- A2 Survival Encirclement Detection V2 — **COMPLETE ✅**
- A3 Survival Predictive Escape V2 — **COMPLETE ✅**
- A4 Survival Anti-Spin / Stuck Recovery — **COMPLETE ✅**
- A5 Survival Strategic Utility V2 — **COMPLETE ✅**
- A6 Duel Tactical Perception — **COMPLETE ✅**
- A7 Duel Spatial Position Scoring — **COMPLETE ✅**
- A8 Duel Utility Action System — **COMPLETE ✅**
- A9 Duel Footsies / Combat Rhythm — **COMPLETE ✅**
- A10 Duel Corner Intelligence — **COMPLETE ✅**
- A11 Build-Aware Fighting Styles — **COMPLETE ✅**
- A12 Human-Like Decision Timing — **COMPLETE ✅**
- A13 AI Simulation & Balance Lab — **COMPLETE ✅**
- A14 Performance + Mobile Gate — **COMPLETE ✅**
- A15 Integration / Release — **COMPLETE ✅**

### V0.19 validation contract
- Survival deterministic encirclement/escape/stuck scenarios green
- Survival strategic utility scenarios green
- Duel tactical/corner/spacing/build scenarios green
- A13 Survival simulation matrix green
- A13 Duel simulation matrix green
- bounded AI performance smoke green
- desktop/mobile V0.19 browser AI validation green
- V0.17 historical mechanics/content regression green
- V0.18 UI/fallback/performance/graphics regressions green
- Pages public artifact/deploy green

V0.19 is authorized to change AI/movement decision truth only within the approved plan. It does not change the locked combat/content/tournament rules above.

---

# PROJECT STATUS

**V0.19 is COMPLETE / RELEASED and is the current public/runtime baseline. V0.18 remains the frozen graphics/presentation baseline; V0.17 remains the historical mechanics/content baseline.**
