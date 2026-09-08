const fs=require('fs');
const vm=require('vm');
const assert=require('assert');

const listeners={};
const owned={};
const hitLog=[];

const state={t:0,running:true,paused:false,gameOver:false,enemies:[],projectiles:[]};
const player={x:100,y:100,damage:20,projectileSpeedMultiplier:1};
const skills={};
const ctx=new Proxy({}, {get:(target,key)=>{
  if(!(key in target))target[key]=()=>{};
  return target[key];
},set:(target,key,value)=>{target[key]=value;return true;}});

function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
function skillLevel(key){return owned[key]||0;}
function isEnemyHostile(enemy){return Boolean(enemy&&!enemy.dead);}
function getNearestEnemies(limit){
  return state.enemies.filter(isEnemyHostile)
    .map(enemy=>({enemy,d:Math.hypot(enemy.x-player.x,enemy.y-player.y)}))
    .sort((a,b)=>a.d-b.d).slice(0,limit).map(entry=>entry.enemy);
}
function onSkillEvent(name,handler){(listeners[name]??=[]).push(handler);}
function emit(name,payload={}){for(const handler of listeners[name]||[])handler(payload);}
function resetSkillEngine(){}
function getOutgoingDamageMultiplier(){return 1;}
function hitEnemy(enemy,damage,knockback=0,meta={}){
  if(!enemy||enemy.dead)return false;
  const dealt=Math.max(0,damage);
  enemy.hp-=dealt;
  hitLog.push({enemy,damage:dealt,meta});
  const killed=enemy.hp<=0;
  if(killed)enemy.dead=true;
  emit('hit',{enemy,damage:dealt,meta,killed});
  return killed;
}
function update(){}
function draw(){}

const sandbox={
  console,Math,Set,
  state,player,skills,ctx,
  clamp,skillLevel,isEnemyHostile,getNearestEnemies,onSkillEvent,
  resetSkillEngine,getOutgoingDamageMultiplier,hitEnemy,update,draw,
  SKILL_VISUAL_PROFILES:{},SKILL_SCENE_DRAWERS:{},
  v12Actor(){},v12Projectile(){},v12Enemy(){},v12Ring(){},v12Line(){},drawGlowDot(){}
};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync('js/v016-skills-a1.js','utf8'),sandbox,{filename:'js/v016-skills-a1.js'});

for(const key of ['afterimage','runeMine','bloodLink','spiritPearl'])assert(skills[key],`Missing skill ${key}`);

// Dư Ảnh: one clone, exactly two delayed shots, no normal on-hit procs.
owned.afterimage=1;
state.enemies=[{x:220,y:100,hp:100,maxHp:100,dead:false,r:12}];
assert.strictEqual(skills.afterimage.periodic.execute(1),true);
assert.strictEqual(state.v016A1.afterimages.length,1);
state.t=.13;sandbox.update(.01);
state.t=.48;sandbox.update(.01);
const afterimageShots=state.projectiles.filter(p=>p.meta?.source==='afterimage');
assert.strictEqual(afterimageShots.length,2,'Dư Ảnh must fire exactly two shots');
assert(afterimageShots.every(p=>p.damage===9),'Level 1 Dư Ảnh shot must be 45% of 20 damage');
assert(afterimageShots.every(p=>p.meta.allowProcs===false),'Dư Ảnh must disable hit procs');

// Reset transient state before next mechanic.
sandbox.resetSkillEngine();
state.projectiles.length=0;state.t=0;

// Địa Lôi Phù: cap replacement + armed trigger + exact damage.
owned.runeMine=1;
state.enemies=[{x:105,y:100,hp:100,maxHp:100,dead:false,r:12}];
skills.runeMine.periodic.execute(1);
state.t=.1;skills.runeMine.periodic.execute(1);
state.t=.2;skills.runeMine.periodic.execute(1);
assert.strictEqual(state.v016A1.mines.length,2,'Level 1 rune cap must be 2');
state.t=1;sandbox.update(.01);
assert(hitLog.some(entry=>entry.meta?.source==='runeMine'&&entry.damage===28),'Rune must deal level 1 damage 28');

sandbox.resetSkillEngine();
hitLog.length=0;state.t=0;

// Huyết Liên: mirror exactly 16% actual damage and no recursion.
owned.bloodLink=1;
const a={x:120,y:100,hp:200,maxHp:200,dead:false,r:12};
const b={x:150,y:100,hp:200,maxHp:200,dead:false,r:12};
state.enemies=[a,b];
assert.strictEqual(skills.bloodLink.periodic.execute(1),true);
hitEnemy(a,100,0,{source:'test',allowProcs:false});
const mirrored=hitLog.filter(entry=>entry.meta?.source==='bloodLink');
assert.strictEqual(mirrored.length,1,'Huyết Liên must mirror once only');
assert.strictEqual(mirrored[0].damage,16,'Level 1 Huyết Liên must mirror exactly 16%');

sandbox.resetSkillEngine();
hitLog.length=0;state.projectiles.length=0;state.t=0;

// Linh Châu: 8 actual healed HP charges one pearl; cap blocks banked overflow; fires after 2.2 s.
owned.spiritPearl=1;
state.enemies=[{x:180,y:100,hp:100,maxHp:100,dead:false,r:12}];
emit('heal',{amount:8,meta:{source:'test'}});
assert.strictEqual(state.v016A1.pearls,1,'8 healing must charge one pearl');
emit('heal',{amount:20,meta:{source:'test'}});
assert.strictEqual(state.v016A1.pearls,1,'Level 1 pearl cap must stay at one');
assert.strictEqual(state.v016A1.pearlCharge,0,'Healing while full must not bank hidden charge');
state.t=2.21;sandbox.update(.01);
const pearlShot=state.projectiles.find(p=>p.meta?.source==='spiritPearl');
assert(pearlShot,'Linh Châu must fire after its 2.2 second cadence');
assert.strictEqual(pearlShot.damage,25,'Level 1 Linh Châu damage must be 25');
assert.strictEqual(state.v016A1.pearls,0,'Firing must consume one pearl');

console.log('V0.16 A1 smoke test passed');
