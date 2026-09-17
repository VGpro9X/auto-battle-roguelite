const fs=require('fs');
function assert(v,m){if(!v)throw new Error(m);}
const bridge=fs.readFileSync('js/duel-renderer-v3-bridge.js','utf8');
assert(bridge.includes("prefers-reduced-motion: reduce"),'reduced-motion detection missing');
assert(bridge.includes("projectiles:10")&&bridge.includes("projectiles:6")&&bridge.includes("projectiles:3"),'quality projectile budgets missing');
assert(bridge.includes("['hit','heal','shield_gain','ko']"),'event-driven light ownership missing');
assert(bridge.includes("round.projectiles||[]"),'projectile lighting source missing');
assert(bridge.includes("fighter.shield>0"),'shield local glow missing');
assert(bridge.includes("round.phase==='TỬ CHIẾN'")&&bridge.includes("round.phase!=='NORMAL'"),'phase atmosphere missing');
assert(bridge.includes("if(low<.25)"),'low-HP vignette gate missing');
assert(bridge.includes("globalCompositeOperation='screen'"),'screen-space light blend missing');
assert(bridge.includes('drawLighting(match,tr,dt)'),'lighting pass is not wired after render');
assert(bridge.includes('fallback.consume(events);consumeLighting(events);'),'lighting must observe already-produced events');
for(const forbidden of ['duelDealDamage(','spawnDuelProjectile(','target.hp-=','target.x='])assert(!bridge.includes(forbidden),'lighting bridge must not own simulation truth: '+forbidden);
assert(!/round\.phase\s*=(?!=)/.test(bridge),'lighting bridge must not assign round.phase');
console.log('v020-b6-lighting-runtime-smoke: ok');
