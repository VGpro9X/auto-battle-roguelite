# V0.20 — B14 Integration / Release

Status: **ACTIVE — RELEASE CANDIDATE VALIDATION**

B14 is the final integration checkpoint. It does not add new gameplay or visual scope; it proves the B0–B13 build is coherent, promotes the public version label, deploys the exact Pages artifact, and hands the build to the owner for final visual/gameplay testing.

## B14A — release candidate gate
The candidate remains publicly labeled V0.19 while validation runs.

Required historical regressions:
- V0.16 final audit
- V0.17 release audit
- V0.18 G7 release audit
- V0.19 A15 release audit

Required V0.20 closure:
- fighter production
- enemy family runtime
- high-tier Duel + Survival presentation
- UI/HUD closure
- icon runtime/catalog
- combat polish + camera impact
- auto quality
- renderer fallback
- public artifact budget/path audit

Required browser checks:
- desktop public runtime
- explicit 360×640 mobile public runtime
- V3 renderer path
- reduced-motion fallback path

Only after B14A passes may the public/runtime label be promoted to V0.20.

## B14B — version promotion
Promotion targets:
- document title
- in-game version label
- Duel public eyebrow/version copy
- project handoff / README / roadmap references where they describe the current released baseline

No gameplay constants are changed during promotion.

## B14C — exact Pages release
After promotion:
- final V0.20 static release audit
- final desktop/mobile browser smoke
- GitHub Pages artifact must be generated from the promoted commit
- Pages deploy must succeed
- owner receives the public test URL and performs final visual/gameplay acceptance

## Ownership boundary
B14 is integration/release only. No silent balance or mechanics changes.

Current public/runtime label: V0.19 until B14A passes.
