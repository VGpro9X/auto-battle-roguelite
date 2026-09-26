# V0.22–V0.26 — Survival Visual Upgrade
Owner direction: prioritize **Sinh Tồn / Vô Hạn**. Galaxy/space combat background, original animated skill effects, clear skill identities and mobile performance. Duel presentation remains unchanged except shared release labels.

## Release discipline
- One meaningful version/checkpoint at a time: implement → automated validation → GitHub Pages deployment → owner visual/gameplay test → stop. Continue to the next version only after owner approval.
- Presentation only: never alter simulation-owned positions, damage, hit results, cooldowns, skill probabilities, movement AI or rare rules while changing the visuals.
- Preserve V0.20/V0.19/V0.16–V0.17 historical regression gates. Keep Vietnamese player-facing UI.
- Original procedural/vector assets only; no external background requests. Support mobile, reduced motion, fallback and bounded FX budgets.
- Acceptance: a visible improvement while PLAYING Survival, not just the Codex preview or Duel renderer.

## V0.22 — Galaxy Battlefield Foundation (COMPLETE / RELEASED ✅)
- Procedural original deep-space arena: navy/cosmic gradient, diagonal nebulae, dust field, layered stars and restrained celestial/navigation arcs.
- Subtle animated twinkle + parallax drifting by visual depth, stable while paused, without moving gameplay coordinates.
- Cache expensive nebula drawing; cap stars on mobile; detect low quality and prefers-reduced-motion.
- Keep enemy/projectile/XP contrast and UI readable over the new environment.
- Add deterministic visual-only smoke checks, wire the new scene solely into Survival's battle canvas and publish to Pages.
- **Exit criterion:** full-screen Galaxy background visible during timed Survival and Endless, mobile/desktop with no combat-rule changes. Owner tests the published build before V0.23.

## V0.23 — Core Skill Impact FX (COMPLETE / RELEASED ✅)
- Real attack/hit events spawn readable slash arcs, directional impact bursts, sparks, shock rings, crit accents and subtle camera feedback.
- Distinguish melee, projectiles, magic, heal and control; preserve hit truth from simulation.
- Lifetime/pooling and per-frame caps for crowded Survival runs.

Delivered: real Survival attack, hit, cast, echo, heal and shield event-driven choreography with differentiated skill families, directional projectile trails, crit accents and capped device effects. Live desktop/mobile browser validation passed.

## V0.24 — Unique Skill Visual Language (COMPLETE / RELEASED ✅; owner evaluation pending)
- Distinct visual grammar by skill ID where meaningful, not generic tag-only particles.
- Fire flames/explosion, frost crystal/shatter, lightning arc, poison cloud, light/healing circle, dark/void distortion.
- Distinct orbit/summon/projectile motion; prioritize commonly used skills first then complete catalogue coverage.

Delivered: 80/80 base skill IDs mapped; 52 manually authored ID profiles and 28 deterministic fallback inscriptions. Per-skill projectile silhouettes and event-bound cast/hit/passive acquisition visuals; mobile performance caps and reduced-motion support. Real desktop/mobile game browser validation passed with demonstrably different Fireball/Lightning impact frames.

## V0.25 — High-Tier Skill Spectacle (NEXT; awaits owner approval of V0.24)
- Individual signature cast, impact and aftermath for Thần Kỹ, Thần Bí Kỹ, Siêu Cấp and major Hợp Đạo.
- Different scales/readability for high-tier activation, cooldown loops and rare acquisition.
- Bounded spectacle density so a 10+ minute Endless run stays playable.

## V0.26 — Survival Combat Presentation Polish (PLANNED)
- Color/contrast, impact timing, particle caps, background intensity, performance and mobile readability.
- Low/balanced/high profiles and reduced-motion path; mobile rendered validation and regression closure.

## Checkpoints
V0.22 → V0.23 → V0.24 → V0.25 → V0.26, **never skip owner play-testing between versions**.
