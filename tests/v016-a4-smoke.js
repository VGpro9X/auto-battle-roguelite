const fs=require('fs');
const vm=require('vm');
const assert=require('assert');

const listeners={};
const owned={};
const areaLog=[];

const state={t:0,running:true,paused:false,gameOver:false,enemies:[]};
const player={x:100,y:100,r:16,periodicCooldownMultiplier:1};
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
function getOutgoingDamageMultiplier(){return 1;}
function damageAreaAt(x,y,radius,damage,meta={}){
  areaLog.push({x,y,radius,damage,meta});
  return state.enemies.filter(isEnemyHostile).length;
}
function update(dt){
  state.t+=dt;
  for(const key of Object.keys(skillRuntime.timers))skillRuntime.timers[key]-=dt;
}
function draw(){}

const sandbox={
  console,Math,Set,
  state,player,skills,skillRuntime,ctx,
  clamp,skillLevel,isEnemyHostile,onSkillEvent,emitSkillEvent,
  resetSkillEngine,getOutgoingDamageMultiplier,damageAreaAt,update,draw,
  SKILL_VISUAL_PROFILES:{},SKILL_SCENE_DRAWERS:{},
  v12Actor(){},v12Enemy(){},v12Ring(){},v12Line(){},drawGlowDot(){}
};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync('js/v016-skills-a4.js','utf8'),sandbox,{filename:'js/v016-skills-a4.js'});

for(const key of ['staticField','soulLantern','armorBreak','timeField'])assert(skills[key],`Missing skill ${key}`);

function clearOwned(){for(const key of Object.keys(owned))delete owned[key];}
function resetWorld(){
  sandbox.resetSkillEngine();
  clearOwned();
  areaLog.length=0;
  state.t=0;state.running=true;state.paused=false;state.gameOver=false;state.enemies=[];
  player.x=100;player.y=100;player.r=16;player.periodicCooldownMultiplier=1;
}

// Lôi Trường: one field lasts for exactly six half-second pulses with exact level-1 radius/damage and proc suppression.
resetWorld();
owned.staticField=1;
assert.strictEqual(skills.staticField.periodic.execute(1),true);
assert.strictEqual(state.v016A4.fields.length,1,'Lôi Trường must create one field');
for(let i=0;i<6;i++)sandbox.update(.5);
const staticHits=areaLog.filter(entry=>entry.meta?.source==='staticField');
assert.strictEqual(staticHits.length,6,'Lôi Trường must pulse exactly six times over three seconds');
assert(staticHits.every(entry=>entry.radius===72),'Level 1 Lôi Trường radius must be 72');
assert(staticHits.every(entry=>entry.damage===5),'Level 1 Lôi Trường pulse damage must be 5');
assert(staticHits.every(entry=>entry.meta.allowProcs===false),'Lôi Trường pulses must disable normal hit procs');

// Hồn Đăng: level 1 triggers every 13 kills, flame lives at most six seconds, seeks and detonates for 24 damage / radius 48.
resetWorld();
owned.soulLantern=1;
for(let i=0;i<12;i++)emitSkillEvent('kill',{enemy:{dead:true}});
sandbox.update(.01);
assert.strictEqual(state.v016A4.flames.length,0,'Hồn Đăng must not spawn before 13 kills at level 1');
emitSkillEvent('kill',{enemy:{dead:true}});
sandbox.update(.01);
assert.strictEqual(state.v016A4.flames.length,1,'13th kill must produce one soul flame');
assert(Math.abs(state.v016A4.flames[0].until-state.t-6)<1e-9,'Soul flame lifetime must be exactly six seconds');
state.enemies=[{x:105,y:100,r:12,hp:100,maxHp:100,speed:40,dead:false}];
sandbox.update(.01);
const soulBurst=areaLog.find(entry=>entry.meta?.source==='soulLantern');
assert(soulBurst,'Soul flame must detonate on contact with a hostile');
assert.strictEqual(soulBurst.damage,24,'Level 1 Hồn Đăng damage must be 24');
assert.strictEqual(soulBurst.radius,48,'Hồn Đăng explosion radius must be 48');
assert.strictEqual(state.v016A4.flames.length,0,'Detonated soul flame must be removed');

// Cap behavior: progress earned while three flames are active is retained until a slot opens.
resetWorld();
owned.soulLantern=1;
for(let i=0;i<39;i++)emitSkillEvent('kill',{});
sandbox.update(.01);
assert.strictEqual(state.v016A4.flames.length,3,'Hồn Đăng active flame cap must be three');
for(let i=0;i<13;i++)emitSkillEvent('kill',{});
sandbox.update(.01);
assert.strictEqual(state.v016A4.soulKills,13,'Kill progress while capped must be retained');
state.v016A4.flames[0].dead=true;
sandbox.update(.01);
sandbox.update(.01);
assert.strictEqual(state.v016A4.flames.length,3,'Retained progress must fill the next open flame slot');
assert.strictEqual(state.v016A4.soulKills,0,'Retained threshold must be consumed when the slot is filled');

// Phá Giáp: normal hits add/refresh stacks, level-1 cap is four, each stack adds 2% player damage and expires at four seconds.
resetWorld();
owned.armorBreak=1;
const armorTarget={x:160,y:100,r:12,hp:100,maxHp:100,speed:40,dead:false};
state.enemies=[armorTarget];
for(let i=0;i<5;i++)emitSkillEvent('hit',{enemy:armorTarget,damage:10,meta:{source:'normal'},killed:false});
assert.strictEqual(armorTarget.armorBreakStacks,4,'Level 1 Phá Giáp stack cap must be four');
assert.strictEqual(armorTarget.armorBreakUntil,4,'Normal hits must refresh the full four-second duration');
assert(Math.abs(sandbox.getOutgoingDamageMultiplier(armorTarget,{source:'test'})-1.08)<1e-9,'Four level-1 stacks must amplify player damage by 8%');
state.t=3.99;
assert(Math.abs(sandbox.getOutgoingDamageMultiplier(armorTarget,{source:'test'})-1.08)<1e-9,'Phá Giáp must remain active before four seconds');
state.t=4;
assert.strictEqual(sandbox.getOutgoingDamageMultiplier(armorTarget,{source:'test'}),1,'Phá Giáp must expire at four seconds');

// Thời Vực: first activation waits 14 seconds; active window adds 35% timer advancement without duplicating execution.
resetWorld();
skills.testPeriodic={max:1,tags:['PERIODIC'],periodic:{cooldown:()=>10,execute:()=>true}};
owned.timeField=1;owned.testPeriodic=1;
emitSkillEvent('skill_selected',{key:'timeField',level:1});
assert.strictEqual(skillRuntime.timers.timeField,14,'Thời Vực first activation must wait the full 14-second base cadence');
assert.strictEqual(skills.timeField.periodic.execute(1),true);
assert.strictEqual(state.v016A4.timeFieldUntil,3,'Level 1 Thời Vực duration must be three seconds');
skillRuntime.timers.timeField=14;
skillRuntime.timers.testPeriodic=10;
sandbox.update(1);
assert(Math.abs(skillRuntime.timers.testPeriodic-8.65)<1e-9,'One second inside level-1 Thời Vực must advance a periodic timer by 1.35 seconds');
assert(Math.abs(skillRuntime.timers.timeField-12.65)<1e-9,'Thời Vực is itself an owned base periodic timer and follows the documented all-periodic acceleration');
assert.strictEqual(state.v016A4.timeFieldUntil,3,'Timer acceleration must not duplicate or extend the active window directly');

console.log('V0.16 A4 smoke test passed');
