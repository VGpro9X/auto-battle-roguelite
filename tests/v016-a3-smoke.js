const fs=require('fs');
const vm=require('vm');
const assert=require('assert');

const listeners={};
const owned={};
const damageLog=[];
const areaLog=[];

const state={t:0,running:true,paused:false,gameOver:false,enemies:[]};
const player={
  x:100,y:100,r:16,
  critChance:.10,critMultiplier:1.75,
  periodicCooldownMultiplier:1,
  dodgeChance:0,invulnerableUntil:0
};
const skills={};
const skillRuntime={timers:{}};
const ctx=new Proxy({}, {get:(target,key)=>{
  if(!(key in target))target[key]=()=>{};
  return target[key];
},set:(target,key,value)=>{target[key]=value;return true;}});

function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
function skillLevel(key){return owned[key]||0;}
function isEnemyHostile(enemy){return Boolean(enemy&&!enemy.dead&&!enemy.allied);}
function onSkillEvent(name,handler){(listeners[name]??=[]).push(handler);}
function emitSkillEvent(name,payload={}){for(const handler of listeners[name]||[])handler(payload);}
function resetSkillEngine(){skillRuntime.timers={};}
function damagePlayer(amount,meta={}){
  damageLog.push({amount,meta});
  if(amount>0)emitSkillEvent('damage_taken',{amount,source:meta.source||null,meta});
  return amount;
}
function damageAreaAt(x,y,radius,damage,meta={}){
  areaLog.push({x,y,radius,damage,meta});
  return 1;
}
function update(){}
function draw(){}

const sandbox={
  console,Math,Set,
  state,player,skills,skillRuntime,ctx,
  clamp,skillLevel,isEnemyHostile,onSkillEvent,emitSkillEvent,
  resetSkillEngine,damagePlayer,damageAreaAt,update,draw,
  SKILL_VISUAL_PROFILES:{},SKILL_SCENE_DRAWERS:{},
  v12Actor(){},v12Enemy(){},v12Ring(){},v12Line(){},drawGlowDot(){}
};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync('js/v016-skills-a3.js','utf8'),sandbox,{filename:'js/v016-skills-a3.js'});

for(const key of ['guardianIdol','frostMirror','focusMind','sevenStarStrike'])assert(skills[key],`Missing skill ${key}`);
const gameSource=fs.readFileSync('js/game.js','utf8');
assert(gameSource.includes('getEnemyCombatTarget')&&gameSource.includes('damageEnemyCombatTarget'),'game.js must expose the narrow guardian combat-target hook');

function clearOwned(){for(const key of Object.keys(owned))delete owned[key];}
function resetWorld(){
  sandbox.resetSkillEngine();
  clearOwned();
  damageLog.length=0;areaLog.length=0;
  state.t=0;state.running=true;state.paused=false;state.gameOver=false;state.enemies=[];
  player.x=100;player.y=100;player.r=16;
  player.critChance=.10;player.critMultiplier=1.75;player.periodicCooldownMultiplier=1;player.dodgeChance=0;player.invulnerableUntil=0;
}

// Hộ Pháp Mộc Nhân: full first cooldown, exact HP/duration, 150px taunt target and raw guardian damage.
resetWorld();
owned.guardianIdol=1;
emitSkillEvent('skill_selected',{key:'guardianIdol',level:1});
assert.strictEqual(state.v016A3.guardianNextAt,12,'Level 1 guardian first summon must wait the full 12 seconds');
state.t=11.99;sandbox.update(.01);
assert.strictEqual(state.v016A3.guardian,null,'Guardian must not spawn before cooldown');
state.t=12;sandbox.update(.01);
const guardian=state.v016A3.guardian;
assert(guardian,'Guardian must spawn at its scheduled cadence');
assert.strictEqual(guardian.maxHp,22,'Level 1 guardian HP must be 22');
assert.strictEqual(guardian.until,16,'Level 1 guardian duration must be 4 seconds');
const taunted={x:guardian.x+100,y:guardian.y,r:12,hp:100,speed:40,dead:false};
const outside={x:guardian.x+151,y:guardian.y,r:12,hp:100,speed:40,dead:false};
assert.strictEqual(sandbox.getEnemyCombatTarget(taunted),guardian,'Hostile within 150px must prefer guardian');
assert.strictEqual(sandbox.getEnemyCombatTarget(outside),player,'Hostile beyond 150px must keep player target');
assert.strictEqual(sandbox.damageEnemyCombatTarget(guardian,7,{source:taunted,type:'contact'}),7);
assert.strictEqual(guardian.hp,15,'Guardian must lose the raw contact damage amount');

// Hàn Kính: max one charge, exact level-1 45% reduction, charge consumption and 3s chill.
resetWorld();
owned.frostMirror=1;
emitSkillEvent('skill_selected',{key:'frostMirror',level:1});
assert.strictEqual(skillRuntime.timers.frostMirror,8,'Level 1 Hàn Kính first charge must wait 8 seconds');
assert.strictEqual(skills.frostMirror.periodic.execute(1),true);
assert.strictEqual(state.v016A3.frostMirrorCharge,1,'Hàn Kính must gain one charge');
skills.frostMirror.periodic.execute(1);
assert.strictEqual(state.v016A3.frostMirrorCharge,1,'Hàn Kính charge cap must remain one');
const contactEnemy={x:120,y:100,r:12,hp:100,speed:40,dead:false};
state.enemies=[contactEnemy];
const reduced=sandbox.damagePlayer(100,{source:contactEnemy,type:'contact'});
assert.strictEqual(reduced,55,'Level 1 Hàn Kính must reduce contact damage by 45%');
assert.strictEqual(damageLog.at(-1).amount,55,'Reduced amount passed into the normal damage pipeline must be 55');
assert.strictEqual(state.v016A3.frostMirrorCharge,0,'Hàn Kính charge must be consumed');
assert.strictEqual(contactEnemy.chillUntil,3,'Contacting enemy must be chilled for exactly 3 seconds');

// A dodge happens before mirror consumption so an avoided contact does not waste the one charge.
state.v016A3.frostMirrorCharge=1;
player.dodgeChance=1;
const beforeDodgeCalls=damageLog.length;
assert.strictEqual(sandbox.damagePlayer(100,{source:contactEnemy,type:'contact'}),0);
assert.strictEqual(state.v016A3.frostMirrorCharge,1,'Dodged contact must not consume Hàn Kính');
assert.strictEqual(damageLog.length,beforeDodgeCalls,'Dodged contact must not enter the base damage pipeline');

// Tĩnh Tâm: activates after 4 damage-free seconds, applies exact additive crit bonuses and breaks on actual damage.
resetWorld();
owned.focusMind=1;
emitSkillEvent('skill_selected',{key:'focusMind',level:1});
state.t=3.99;sandbox.update(.01);
assert.strictEqual(state.v016A3.focusActive,false,'Tĩnh Tâm must not activate before four seconds');
state.t=4;sandbox.update(.01);
assert.strictEqual(state.v016A3.focusActive,true,'Tĩnh Tâm must activate at four damage-free seconds');
assert(Math.abs(player.critChance-.18)<1e-9,'Level 1 Tĩnh Tâm must add 8% crit chance');
assert(Math.abs(player.critMultiplier-1.93)<1e-9,'Level 1 Tĩnh Tâm must add 18% crit damage');
state.t=4.2;emitSkillEvent('damage_taken',{amount:5,source:null,meta:{}});
assert.strictEqual(state.v016A3.focusActive,false,'Actual damage must break Tĩnh Tâm immediately');
assert(Math.abs(player.critChance-.10)<1e-9,'Crit chance must return to its base value after Tĩnh Tâm breaks');
assert(Math.abs(player.critMultiplier-1.75)<1e-9,'Crit damage must return to its base value after Tĩnh Tâm breaks');
state.t=8.19;sandbox.update(.01);
assert.strictEqual(state.v016A3.focusActive,false,'Tĩnh Tâm must wait four seconds after the last damage');
state.t=8.2;sandbox.update(.01);
assert.strictEqual(state.v016A3.focusActive,true,'Tĩnh Tâm must restore exactly four seconds after the last damage');

// Thất Tinh Kích: level 1 requires seven normal-attack hits and produces the exact radius/damage once.
resetWorld();
owned.sevenStarStrike=1;
const starTarget={x:180,y:120,r:12,hp:100,speed:40,dead:false};
for(let i=0;i<6;i++)emitSkillEvent('hit',{enemy:starTarget,damage:10,meta:{source:'normal'},killed:false});
assert.strictEqual(areaLog.length,0,'Thất Tinh Kích must not trigger before seven normal hits');
emitSkillEvent('hit',{enemy:starTarget,damage:10,meta:{source:'normal'},killed:false});
assert.strictEqual(areaLog.length,1,'Seventh normal hit must trigger Thất Tinh Kích');
assert.strictEqual(areaLog[0].radius,42,'Level 1 Thất Tinh Kích radius must be 42');
assert.strictEqual(areaLog[0].damage,18,'Level 1 Thất Tinh Kích damage must be 18');
assert.strictEqual(areaLog[0].meta.source,'sevenStarStrike');
assert.strictEqual(state.v016A3.starHits,0,'Counter must reset by exactly seven hits after triggering');
emitSkillEvent('hit',{enemy:starTarget,damage:18,meta:{source:'sevenStarStrike'},killed:false});
assert.strictEqual(state.v016A3.starHits,0,'Star-strike damage must not advance its own counter');

console.log('V0.16 A3 smoke test passed');
