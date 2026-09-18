# V0.20 — B13 Optimization / Mobile / Fallback

Status: **ACTIVE — B13A AUTO QUALITY INTEGRATED**

B13 closes performance, mobile and fallback behavior before V0.20 release integration. It must not change gameplay truth.

## B13A — unified auto quality

Problem:
- the legacy V0.18 quality policy already classifies mobile / constrained devices,
- but V3 public bootstrap was hard-coded to `balanced`,
- so V3 core, Duel high-tier and Survival high-tier could use heavier budgets than the existing mobile policy intended.

### Public policy
`index.html` now sets:
- `DUEL_RENDERER_V3_QUALITY='auto'`

Resolution order:
1. explicit `visualQuality=full|balanced|low`
2. explicit runtime config `full|balanced|low`
3. AUTO mapping from the existing quality policy:
   - legacy `constrained` → V3 `low`
   - otherwise → V3 `balanced`

Desktop therefore keeps the previous balanced V3 default. Mobile/constrained automatically uses low budgets unless explicitly overridden.

### Runtime coverage
The same policy is consumed by:
- `js/duel-renderer-v3-bridge.js`
  - core V3 VFX
  - dynamic lighting/projectile/flash budgets
- `js/duel-vfx-tier.js`
  - Hợp Đạo / Siêu Cấp / Rare transient/detail budgets
- `js/v020-survival-divine-vfx.js`
  - Survival Thần Kỹ / Thần Bí Kỹ transient, owned and target budgets

Public cache keys are refreshed for all modified presentation layers.

### Expected auto budgets
Desktop normal:
- V3 core quality: BALANCED
- Duel tier limit: 30
- Survival high-tier limit: 24

Mobile / constrained:
- V3 core quality: LOW
- Duel tier limit: 16
- Survival high-tier limit: 12

Explicit `visualQuality` remains authoritative.

## Ownership boundary
B13A only selects presentation budgets. It must not alter:
- damage / healing
- cooldowns / skill timers
- AI / movement
- targeting or hitboxes
- acquisition / reroll probability
- fatal / revive ordering
- Duel bracket state or Survival run state

## Validation
- `tests/v020-b13a-auto-quality-smoke.js`
  - isolated policy verification across V3 bridge, Duel tier and Survival spectacle
  - desktop balanced / constrained low / explicit override
  - public cache wiring
  - presentation ownership guard
- `tests/v020-b13a-auto-quality-browser-driver.html`
  - real public `index.html`
  - desktop auto
  - mobile auto
  - mobile forced FULL override
- historical G4D, G6A and B9 quality gates remain required.

## Remaining B13
- **B13B — fallback closure:** V3 → V2 → vector forced-mode/browser validation, missing/partial asset fallback and reduced-motion closure.
- **B13C — final performance/mobile audit:** public artifact size/path audit, runtime error check and final B13 handoff to B14.

Public/runtime label remains V0.19 until B14.
