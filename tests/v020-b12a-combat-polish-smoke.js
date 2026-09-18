const fs=require("fs"),vm=require("vm"),assert=require("assert");
const source=fs.readFileSync("js/duel-vfx-v3.js","utf8");
const html=fs.readFileSync("index.html","utf8");

assert(html.includes("js/duel-vfx-v3.js?v=020-b12a"),"B12A Duel VFX cache key missing");
for(const token of ["function impactRing","function slashTrail","function koBurst",'combatPolish:"b12a"']){
  assert(source.includes(token),"B12A combat polish primitive missing: "+token);
}
for(const forbidden of ["fighter.hp=","fighter.hp -=","fighter.hp +=","round.time=","damageDealt +=","damageTaken +=","skillTimers["]){
  assert(!source.includes(forbidden),"presentation layer must not mutate combat simulation: "+forbidden);
}

const context={globalThis:{}};
context.globalThis.globalThis=context.globalThis;
vm.createContext(context);
vm.runInContext(source,context,{filename:"js/duel-vfx-v3.js"});
const api=context.globalThis;
assert.strictEqual(typeof api.createDuelVfxV3,"function","V3 VFX factory missing");
const fx=api.createDuelVfxV3({quality:"balanced",reducedMotion:false});
assert.strictEqual(fx.ownsEvent({type:"hit",source:"power"}),true,"hit event not owned");
assert.strictEqual(fx.ownsEvent({type:"attack_melee",source:"power"}),true,"melee event not owned");
assert.strictEqual(fx.ownsEvent({type:"ko",source:"power"}),true,"KO event not owned");
fx.consume([
  {type:"attack_melee",source:"power",side:"player",x:100,y:100},
  {type:"hit",source:"power",attacker:"player",target:"opponent",x:120,y:100,amount:42,critical:true},
  {type:"ko",source:"power",target:"opponent",x:140,y:100}
]);
const status=fx.getStatus();
assert.strictEqual(status.combatPolish,"b12a","B12A status marker missing");
assert.strictEqual(status.active,3,"B12A event consumption changed unexpectedly");

const reduced=api.createDuelVfxV3({quality:"low",reducedMotion:true});
reduced.consume([{type:"hit",source:"power",x:10,y:10,amount:5}]);
assert.strictEqual(reduced.getStatus().reducedMotion,true,"reduced-motion policy lost");

console.log("v020-b12a-combat-polish-smoke: ok · hit/slash/KO presentation only");