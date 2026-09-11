# Auto Battle Roguelite — Roadmap

GitHub `main` is canonical.

## Current baseline
- Released baseline: **V0.17 – Duel Arena / Đấu Trường 1v1**.
- Active development roadmap: **V0.18 – Graphics & Presentation Overhaul**.
- V0.18 design contract: `V018_GRAPHICS_PLAN.md`.
- Survival/Endless V0.16 systems remain supported inside the V0.17 baseline.
- Movement baseline: **V0.8 Strategic Movement AI**; do not rewrite unless explicitly requested.
- Player-facing language: Vietnamese.

---

# V0.15 — COMPLETE
Responsive phone/tablet/desktop UI accepted on GitHub Pages.

# V0.16 — COMPLETE / RELEASED
- 80 base Kỹ Năng ✅
- 28 Hợp Đạo Kỹ ✅
- 12 Siêu Cấp ✅
- 20 Rare rules ✅
- 140 Codex entries ✅
- post-release focused balance pass CLOSED with no gameplay-number change required ✅

# V0.17 — DUEL ARENA / ĐẤU TRƯỜNG 1v1 — COMPLETE / RELEASED ✅

Design contract: `V017_DUEL_ARENA_PLAN.md`.
Completion contract: `V017_COMPLETION_PLAN.md`.
Release evidence: `V017_RELEASE_VALIDATION.md`.

Released scope:
- 64-fighter tournament ✅
- exact `64 → 32 → 16 → 8 → 4 → 2 → Champion` advancement ✅
- Best-of-3 automatic Duel combat ✅
- side-view build-aware AI ✅
- separate Duel movement/combat; Survival Movement V0.8 untouched ✅
- two unrestricted starter choices ✅
- one reroll on every choice screen ✅
- one reward after each non-final match victory ✅
- opponent preview/scouting ✅
- Duel Rank I/II/III, Rank III = TỐI ĐA ✅
- **80 / 80 Kỹ Năng Duel** ✅
- **28 / 28 Hợp Đạo Kỹ Duel** ✅
- **12 / 12 Siêu Cấp Duel** ✅
- **20 / 20 Rare Duel rules** ✅
- full integration/focused balance gate ✅
- full V0.16 + V0.17 CI ✅
- rendered desktop/mobile browser validation ✅
- public GitHub Pages deployment ✅
- runtime/public label = **V0.17** ✅

V0.17 is frozen except for bug fixes. Do not reopen closed C1–C6 work as feature development.

---

# V0.18 — GRAPHICS & PRESENTATION OVERHAUL — ACTIVE

Authoritative plan: `V018_GRAPHICS_PLAN.md`.

## V0.18 goal
Replace the prototype Duel presentation with a scalable asset-driven graphics system while preserving V0.17 combat truth, AI, tournament logic and balance.

Primary scope:
- higher-quality original fighter art/animation
- sprite-sheet/image-sequence Renderer V2 with future skeletal-ready abstraction
- manifest-driven public asset pipeline
- one production-quality multi-layer Duel arena
- parallax/camera/impact presentation
- full Duel VFX readability coverage
- stronger Hợp Đạo / Siêu Cấp / Rare visual identities
- Duel HUD/menu presentation polish
- desktop/mobile performance and fallback validation

Locked non-goals by default:
- no gameplay rebalance
- no Duel AI rewrite
- no tournament-rule change
- no skill acquisition-rule change
- no Survival Movement rewrite
- no jump/aerial combat unless separately promoted into scope
- no requirement for multiple arenas
- no new skill content merely to justify V0.18

## Graphics architecture contract
- simulation owns positions/hit/damage/timing/outcome
- renderer only visualizes simulation truth
- world hitboxes remain independent from artwork pixels
- preserve semantic animation states and anchor API
- V0.17 vector renderer remains a verified fallback until release
- sprite/image asset pipeline is first implementation target; keep abstraction open for skeletal animation later
- Pages must eventually publish `assets/` in addition to `index.html`, `css/`, `js/`

## G0 — Graphics design + architecture lock — COMPLETE ✅
- V0.18 scope locked ✅
- original dark-fantasy cultivation / martial-magic direction locked ✅
- asset/manifest strategy locked ✅
- sprite-first, skeletal-ready direction locked ✅
- vector fallback strategy locked ✅
- no-gameplay-change principle locked ✅

## G1 — Asset loader + Renderer V2 foundation — NEXT
Planned:
- `assets/` public pipeline
- manifest loader/cache
- animation metadata resolver
- per-frame visual anchors
- Renderer V2 integration
- vector fallback on missing assets
- renderer switch without changing combat outcome
- Pages asset-integrity validation

**Exit:** one proof asset path can render safely in live Duel while all V0.17 mechanics/tests stay unchanged.

## G2 — Fighter Visual V2
- complete fighter state set: idle/walk/run/dash/melee/ranged/cast/hit/block/knockback/knockdown/recover/ko
- stable root/feet alignment
- facing/anchor correctness
- player/opponent differentiation
- shield/frost/orbit attachments retained

## G3 — Arena + Camera Presentation V2
- one original multi-layer arena
- parallax
- floor/contact treatment
- atmospheric/foreground layers
- camera framing
- mild shake/impact zoom
- HUYẾT CHIẾN / TỬ CHIẾN visual phase treatment

## G4 — Full Duel VFX Readability Pass
Visual families cover:
- physical
- projectile
- fire/frost/lightning
- poison/DOT/blood
- shield/heal/control
- summon/orbit
- explosion/area/chain
- time/space/soul/death
- divine/mystic Rare rules

High-value Hợp Đạo, Siêu Cấp and Rare activations receive stronger visual overrides.

## G5 — Duel UI / HUD / Tournament Presentation Polish
- lobby/mode card
- VS/scouting presentation
- reward cards/tier readability
- combat HUD
- round/K.O./Champion/elimination presentation
- mobile usability preserved

## G6 — Performance / Quality / Fallback Hardening
- preload/cache policy
- decoded-memory sanity
- effect-array bounds
- mobile visual reductions where needed
- optional reduced-motion path
- verified vector fallback

Presentation limits must never become hidden gameplay caps.

## G7 — V0.18 Release Validation
Required before release:
- all V0.16 + V0.17 mechanics CI green
- Renderer V2 normal Duel path
- vector fallback validated
- complete fighter visual state coverage
- one production arena
- camera/VFX/UI pass complete
- desktop/mobile rendered validation
- exact Pages artifact includes all required `assets/`
- no missing production asset errors
- release docs/evidence updated
- runtime/public label promoted to **V0.18** only after gates pass

---

# PROJECT STATUS

**V0.17 remains the current released/public baseline. V0.18 is ACTIVE at G0 complete / G1 next. Start the next development chat by reading `V018_GRAPHICS_PLAN.md` and implementing G1 only before mass-producing final art assets.**
