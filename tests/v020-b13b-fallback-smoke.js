const fs=require("fs"),assert=require("assert");
const read=p=>fs.readFileSync(p,"utf8");
const html=read("index.html");
const bridge=read("js/duel-renderer-v3-bridge.js");
const quality=read("js/duel-visual-quality.js");

assert(html.includes("js/duel-renderer-v3-bridge.js?v=020-b13b"),"B13B public bridge cache key missing");
assert(bridge.includes("value==='vector'||value==='v2'||value==='v3'"),"forced renderer mode contract missing");
assert(bridge.includes("if(mode==='vector'"),"forced vector branch missing");
assert(bridge.includes("if(mode!=='v3')return root.createDuelRendererV2(canvas)"),"forced V2 branch missing");
assert(bridge.includes("return root.createDuelRendererV2(canvas);}}"),"V3 create failure must retain V2 fallback");
assert(bridge.includes("typeof legacy?.reducedMotion==='boolean'"),"V3 bridge does not consume unified reduced-motion policy");
assert(quality.includes('motionQuery==="reduce"?true:motionQuery==="full"?false'),"legacy duelMotion override contract missing");

for(const source of [bridge,quality])for(const forbidden of [
  "updateDuelRound","duelDealDamage","settleDuelRound","player.hp=","enemy.hp=","baseDamage","critChance"
])assert(!source.includes(forbidden),"B13B fallback/presentation layer leaked gameplay truth: "+forbidden);

assert.match(html,/<title>Auto Battle Roguelite V0\.(?:19|20|21)<\/title>/,"public label must be V0.19 candidate, V0.20 release or V0.21 release");
console.log("v020-b13b-fallback-smoke: ok · vector/V2/V3 routing · reduced-motion propagation · release label valid");