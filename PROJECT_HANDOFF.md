# Auto Battle Roguelite — Project Handoff

Use this file as the starting context when continuing development in a new chat.

## Master source
- GitHub repository: `VGpro9X/auto-battle-roguelite`
- Default branch: `main`
- Repository is public and GitHub Pages deployment is configured through `.github/workflows/pages.yml`.
- GitHub is the canonical source. Chat test builds are disposable preview artifacts.
- Before editing any existing file, fetch the current file from GitHub first and use its latest blob SHA.
- Commit/checkpoint frequently after meaningful changes so work is not lost between chats.
- Forward roadmap is also recorded in `ROADMAP.md`.

## Current baseline
- Current version line: **V0.14 – Character & Enemy Presentation**
- Movement baseline: **V0.8 Strategic Movement AI**. Do not alter movement unless specifically requested.
- Current content:
  - 64 base Kỹ Năng
  - 20 Hợp Đạo Kỹ
  - 8 Siêu Cấp
  - 4 unique rule skills: 2 Thần Kỹ + 2 Thần Bí Kỹ
- Bách Khoa Kỹ Năng currently covers 96 entries.
- Player-facing UI must remain Vietnamese. Internal engine keys/tags can remain English for code stability.

## Locked terminology
- Base skill: **Kỹ Năng**
- Synergy: **Hợp Đạo Kỹ**
- Evolution: **Siêu Cấp**
- Unique rare rule skill: **Thần Kỹ** or **Thần Bí Kỹ**
- MAX: **TỐI ĐA**

Do not show raw English system labels such as `SYNERGY`, `EVOLUTION`, `EVOLVE`, `MAX`, or raw English tags in player-facing UI.

## Skill-system design philosophy
Core identity: unrestricted cross-archetype skill building.

Architecture direction:
`Kỹ Năng → Tags/Triggers/Modifiers → Hợp Đạo Kỹ → Siêu Cấp → Thần Kỹ/Thần Bí Kỹ → future advanced rule interactions`

- Hợp Đạo Kỹ connects multiple skills/mechanics and should change interaction, not merely add a flat stat number.
- Siêu Cấp is a major power spike/evolution of a maxed base skill.
- One ordinary Hợp Đạo Kỹ is generally weaker than one Siêu Cấp, but multiple interacting Hợp Đạo Kỹ may exceed one Siêu Cấp.
- Thần Kỹ / Thần Bí Kỹ have no levels. They are rare, unique, rule-like effects rather than normal stat upgrades.
- Current design limits rare rule skills to at most **one owned Thần Kỹ or Thần Bí Kỹ per run**.

### Mechanical truth rule — IMPORTANT
A skill must behave exactly as its player-facing description says.
- Do not add silent caps, hidden limits or undocumented exceptions.
- If an effect has a cap, cooldown, stack maximum, one-time limit or other restriction, it must be stated in the player-facing description.
- V0.12 removed the undocumented 85% max-HP shield cap.
- V0.13 corrected **Săn Ấn** to describe only the implemented extra 25% base XP from marked targets. Do not restore the old unimplemented mark-spread claim unless that mechanic is actually added.

## Current rare rule skills
- **Mua Chuộc — Thần Bí Kỹ:** every 8 seconds, temporarily converts a random hostile into an ally for 5 seconds.
- **Đổi Mệnh — Thần Bí Kỹ:** at low HP, can exchange HP ratio with a healthier enemy when beneficial.
- **Bất Tử Nhất Tức — Thần Kỹ:** prevents one lethal hit and grants a 4-second invulnerability window.
- **Thiên Phạt — Thần Kỹ:** after enough kills, strikes multiple enemies with heavy lightning damage.

## Level-up clarity rule — IMPORTANT
Level-up cards must not show partial-progress hints such as:
- `HỖ TRỢ SIÊU CẤP`
- `KẾT HỢP`
- `0/1 → 1/1`
- tag-count contribution text

Partial progress belongs in the left **BỘ KỸ NĂNG & LIÊN KẾT** tracker.

A level-up card shows a relation hint only when that exact pick is the final piece and immediately unlocks something:
- `CHỌN → MỞ HỢP ĐẠO KỸ: <Tên>`
- `CHỌN → ĐẠT SIÊU CẤP: <Tên>`

## Standalone-build safety rule
- A prior V0.12 packaged preview accidentally shipped an executable validation harness that auto-granted rare skills.
- Future playable builds must never include executable test harness code.
- External browser automation is allowed for testing, but harness logic must not be embedded in delivered HTML.
- `visual-bridge.js` guards build-unlock toasts so they only render during a real run.

## Visual-system status
### V0.12 foundation
- 64/64 base skills have explicit visual profiles and distinct Codex scenes.
- Visual scenes are split across `visual-scenes-1.js` to `visual-scenes-4.js`.
- `vfx.js` remains the shared low-level VFX layer.

### V0.13 completed — Combat Readability & Feel
- Common attack identity for Cường Kích, Song Tiễn, Xuyên Phá, Bạo Kích and Tâm Nhãn.
- Stronger but controlled hit/crit/death feedback.
- Compact burn/poison/chill/mark visuals.
- Visible Linh Hỏa and Lôi Linh actors; Ngự Linh adds aura feedback.
- Hợp Đạo Kỹ and Siêu Cấp have live usage signatures.
- Mua Chuộc, Đổi Mệnh, Bất Tử Nhất Tức and Thiên Phạt have dedicated live feedback.
- User hands-on tested V0.13 and reported no major issue.

Known non-blocking detail:
- Đổi Mệnh currently emits two `divine_trigger` events on one successful activation. Only the event carrying `enemy` drives the detailed tether; the second generic event contributes only generic background feedback. Do not change unless it causes an observed problem.

### V0.14 completed — Character & Enemy Presentation
Integration file: `js/v014-character-enemy-presentation.js`

Player:
- directional code-drawn silhouette
- facing follows movement and attack target
- movement bob / foot cue derives from real motion
- visible weapon extension on attack
- shield/invulnerability only change presentation palette

Enemies:
- normal enemies are visually classified from their existing speed variance as runner / hunter / anchor
- classifications are presentation-only and do not modify stats or AI
- elites use a distinct larger angular silhouette and crown/horn treatment
- bribed allies remain visually compatible with Mua Chuộc feedback

Intentional render order near the end of `index.html`:
1. `js/game.js`
2. `js/v014-character-enemy-presentation.js`
3. `js/visual-bridge.js`
4. `js/v013-summon-power-feedback.js`
5. `js/v013-rule-feedback.js`

V0.14 validation completed:
- syntax validation passed
- headless Chromium loaded with 0 console errors / 0 page errors
- automated path reached live gameplay
- runner/hunter/anchor/elite render paths exercised
- 300-enemy synthetic draw stress test completed without runtime error
- V0.8 movement was not modified
- level-up hint rules and skill mechanics were not modified

## Public testing / deployment
- GitHub Pages workflow: `.github/workflows/pages.yml`
- Public test URL is expected at `https://vgpro9x.github.io/auto-battle-roguelite/` once the current deployment succeeds.
- Prefer Pages for future user testing because it is easier to test on phone and desktop than downloading standalone HTML files.
- A packaged single-file build can still be created when needed, but Pages should be the main test surface going forward.

# Locked forward roadmap
Full detail is in `ROADMAP.md`.

## V0.15 — Responsive & Mobile/Desktop Readability
Primary goal: every existing feature must remain readable and accessible on phone, tablet and desktop.

Required work:
- responsive CSS/layout foundation instead of isolated mobile hacks
- safe-area handling and reliable mobile viewport sizing
- responsive gameplay HUD without losing HP, XP, level, timer, kills or pause
- mobile-accessible BỘ KỸ NĂNG & LIÊN KẾT, likely as a collapsible drawer/sheet on narrow screens rather than hiding it
- responsive level-up cards and modals
- responsive Bách Khoa Kỹ Năng with tap-first interaction and no hover dependency
- portrait + landscape support
- touch target / focus / active-state polish
- no horizontal page overflow
- no unreachable buttons or missing information

Validation matrix must include phones around 360–412px portrait, phone landscape, tablet portrait/landscape, 1366×768 and 1920×1080 desktop.

V0.15 non-goals:
- no combat balance changes
- no V0.8 movement changes
- no major skill expansion
- do not hide features merely to make mobile layout easier

## V0.16 — Skill Expansion & Rare Rule Expansion
Target content, subject to quality:
- base Kỹ Năng: 64 → 80 (+16)
- Hợp Đạo Kỹ: 20 → 28 (+8)
- Siêu Cấp: 8 → 12 (+4)
- rare rule skills: 4 → 12 (+8)
  - Thần Kỹ: 2 → 6
  - Thần Bí Kỹ: 2 → 6
- target Codex total if all content ships: 124 entries

Quality rule: these are targets, not quotas. Cut a weak/duplicate skill rather than ship it only to hit a count.

V0.16 implementation order:
1. design-lock all proposed skills before coding: exact description, trigger, cooldown/limit, tags, visual identity, role and interactions
2. implement new base Kỹ Năng with distinct mechanics
3. add new Hợp Đạo Kỹ centered on meaningful interactions
4. add four new Siêu Cấp with visible power spikes
5. expand Thần Kỹ / Thần Bí Kỹ with rule-level mechanics rather than ordinary stat buffs
6. add the new Vô Hạn starting-rare rule
7. update Codex / visuals / counts
8. complete mechanic truth + balance + stress validation

### V0.16 Vô Hạn starting rare rule — LOCKED
When a Vô Hạn run begins:
- automatically grant exactly **one random Thần Kỹ or Thần Bí Kỹ** from the full valid rare pool
- grant it before the normal starter-skill choice
- show a dedicated reveal card/screen explaining what was received
- then continue to the existing one normal starter Kỹ Năng choice
- the random rare consumes the run's one rare-rule slot
- therefore Vô Hạn does not later roll another rare rule skill while the one-per-run rule remains active
- timed modes keep their existing rare-offer system unless later balance testing changes it
- random selection should have no hidden weighting unless a weighting rule is explicitly documented later

Every shipped new skill must have:
- implemented mechanics
- truthful Vietnamese description
- Codex entry
- readable live visual feedback
- syntax/runtime validation
- at least one live or automated mechanic exercise

## After V0.16
Run a focused balance pass before another major content expansion:
- compare old vs new skill practical value
- identify weak or invisible Hợp Đạo Kỹ
- verify Siêu Cấp still feels special
- evaluate rare-skill run impact and whether one rare per run should remain permanent
- evaluate Vô Hạn difficulty after every run starts with a rule-level skill

Only after that consider V0.17+ systems such as super-synergies, bosses, additional enemy archetypes, meta progression or expansion toward 100+ base skills.

## Development rules for future chats
1. Read `README.md`, `PROJECT_HANDOFF.md` and `ROADMAP.md` first.
2. Fetch current relevant GitHub files before modifying them.
3. GitHub `main` is master source; never reconstruct from stale chat snippets when GitHub is available.
4. Commit after each meaningful checkpoint.
5. Self-test syntax and core logic before giving the user a playable build or deploying Pages.
6. Prefer GitHub Pages as the main user test surface now that the repo is public.
7. Never ship executable test harness logic in playable builds.
8. Do not change movement AI unless explicitly requested.
9. Do not add partial synergy/evolution hints back to level-up cards.
10. Keep player-facing terminology Vietnamese and consistent.
11. Favor readable gameplay feedback over decorative complexity.
12. Do not implement silent skill caps or undocumented limits.
13. V0.15 must be completed and phone-tested before V0.16 content expansion begins.

## Recommended prompt for a new chat
`Tiếp tục project VGpro9X/auto-battle-roguelite. GitHub main là master source. Đọc README.md, PROJECT_HANDOFF.md và ROADMAP.md trước. Baseline hiện tại là V0.14. Roadmap đã khóa: V0.15 responsive đầy đủ cho phone/tablet/desktop, sau đó V0.16 mở rộng skill pool và Thần Kỹ/Thần Bí Kỹ; Vô Hạn bắt đầu bằng 1 rare rule skill ngẫu nhiên. Fetch file hiện tại trước khi sửa và commit thường xuyên sau mỗi checkpoint.`
