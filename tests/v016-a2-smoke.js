const fs=require('fs');
const vm=require('vm');
const assert=require('assert');

const listeners={};
const owned={};
const hitLog=[];
const burnLog=[];
let requestedMoveX=0;
let observedSpeeds=[];

const state={t:0,running:true,paused:false,gameOver:false,enemies:[]};
const player={x:100,y:100};
const skills={};
const ctx=new Proxy({}, {get:(target,key)=>{
  if(!(key in target))target[key]=()=>{};
  return target[key];
},set:(target,key,value)=>{target[key]=value;return true;}});

function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
function skillLevel(key){return owned[key]||0;}
function isEnemyHostile(enemy){return Boolean(enemy&&!enemy.dead);}
function randomEnemy(){return state.enemies.find(isEnemyHostile)||null;}
function onSkillEvent(name,handler){(listeners[name]??=[]).push(handler);}
function resetSkillEngine(){}
function hitEnemy(enemy,damage,knockback=0,meta={}){
  if(!enemy||enemy.dead)return false;
  enemy.hp-=damage;
  hitLog.push({enemy,damage,knockback,meta});
  if(enemy.hp<=0)enemy.dead=true;
  return enemy.dead;
}
function applyBurn(enemy,dps,duration){
  enemy.statuses??={};
  enemy.statuses.burn={dps,duration};
  burnLog.push({enemy,dps,duration});
}
function update(){
  observedSpeeds=state.enemies.map(enemy=>enemy.speed);
  player.x+=requestedMoveX;
  requestedMoveX=0;
}
function draw(){}

const sandbox={
  console,Math,Set,
  state,player,skills,ctx,
  clamp,skillLevel,isEnemyHostile,randomEnemy,onSkillEvent,
  resetSkillEngine,hitEnemy,applyBurn,update,draw,
  SKILL_VISUAL_PROFILES:{},SKILL_SCENE_DRAWERS:{},
  v12Actor(){},v12Projectile(){},v12Enemy(){},v12Ring(){},v12Line(){},drawGlowDot(){}
};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync('js/v016-skills-a2.js','utf8'),sandbox,{filename:'js/v016-skills-a2.js'});

for(const key of ['strideShock','soulBind','returnBlade','meteorSeal'])assert(skills[key],`Missing skill ${key}`);

function clearOwned(){for(const key of Object.keys(owned))delete owned[key];}
function resetWorld(){
  sandbox.resetSkillEngine();
  clearOwned();
  hitLog.length=0;burnLog.length=0;
  state.t=0;state.running=true;state.paused=false;state.gameOver=false;state.enemies=[];
  player.x=100;player.y=100;requestedMoveX=0;observedSpeeds=[];
}

// Bộ Pháp Chấn: only actual base-update movement counts; level 1 triggers at exactly 220 px and carries overflow.
resetWorld();
owned.strideShock=1;
const strideEnemy={x:350,y:100,r:12,hp:100,maxHp:100,speed:40,dead:false};
state.enemies=[strideEnemy];
requestedMoveX=100;sandbox.update(.016);
requestedMoveX=100;sandbox.update(.016);
assert.strictEqual(hitLog.filter(entry=>entry.meta?.source==='strideShock').length,0,'Bộ Pháp Chấn must not trigger before 220 px');
requestedMoveX=30;sandbox.update(.016);
const strideHits=hitLog.filter(entry=>entry.meta?.source==='strideShock');
assert.strictEqual(strideHits.length,1,'Bộ Pháp Chấn must trigger once after crossing 220 px');
assert.strictEqual(strideHits[0].damage,14,'Level 1 Bộ Pháp Chấn damage must be 14');
assert.strictEqual(strideHits[0].knockback,26,'Level 1 Bộ Pháp Chấn knockback must be 26');
assert.strictEqual(state.v016A2.strideDistance,10,'Bộ Pháp Chấn must carry excess traveled distance');

// Trói Hồn: choose the fastest hostile within 260, apply exact damage/duration, freeze only during base frame and restore speed.
resetWorld();
owned.soulBind=1;
const slow={x:140,y:100,r:12,hp:100,maxHp:100,speed:50,dead:false};
const fast={x:160,y:100,r:12,hp:100,maxHp:100,speed:80,dead:false};
const fasterOutside={x:500,y:100,r:12,hp:100,maxHp:100,speed:120,dead:false};
state.enemies=[slow,fast,fasterOutside];
assert.strictEqual(skills.soulBind.periodic.execute(1),true);
assert.strictEqual(fast.hp,90,'Level 1 Trói Hồn must deal 10 damage to the selected target');
assert.strictEqual(fast.soulBoundUntil,1,'Level 1 normal target bind duration must be 1 second');
assert.strictEqual(slow.soulBoundUntil,undefined,'Slower in-range target must not be selected');
assert.strictEqual(fasterOutside.soulBoundUntil,undefined,'Faster out-of-range target must not be selected');
state.t=.1;sandbox.update(.016);
assert.strictEqual(observedSpeeds[1],0,'Bound target must be immobile during the wrapped gameplay update');
assert.strictEqual(fast.speed,80,'Bound target base speed must be restored immediately after the frame');

resetWorld();
owned.soulBind=3;
const elite={x:150,y:100,r:18,hp:100,maxHp:100,speed:90,elite:true,dead:false};
state.enemies=[elite];
assert.strictEqual(skills.soulBind.periodic.execute(3),true);
assert.strictEqual(elite.hp,80,'Level 3 Trói Hồn must deal 20 damage');
assert.strictEqual(elite.soulBoundUntil,.75,'Elite bind duration at level 3 must be half of 1.5 seconds');

// Hồi Phong Nhận: target the farthest hostile within 340 and hit each intersected enemy once outward + once returning.
resetWorld();
owned.returnBlade=1;
const near={x:165,y:100,r:12,hp:100,maxHp:100,speed:40,dead:false};
const far={x:300,y:100,r:12,hp:100,maxHp:100,speed:40,dead:false};
const outside={x:500,y:100,r:12,hp:100,maxHp:100,speed:40,dead:false};
state.enemies=[near,far,outside];
assert.strictEqual(skills.returnBlade.periodic.execute(1),true);
assert.strictEqual(state.v016A2.blades[0].targetX,300,'Hồi Phong Nhận must aim at the farthest hostile inside 340 px');
for(let i=0;i<180&&state.v016A2.blades.length;i++){
  state.t+=.02;
  sandbox.update(.02);
}
const bladeHits=hitLog.filter(entry=>entry.meta?.source==='returnBlade');
assert.strictEqual(bladeHits.filter(entry=>entry.enemy===near).length,2,'Near enemy must be hittable once outward and once returning');
assert.strictEqual(bladeHits.filter(entry=>entry.enemy===far).length,2,'Target enemy must be hittable once outward and once returning');
assert.strictEqual(bladeHits.filter(entry=>entry.enemy===outside).length,0,'Enemy outside the blade path/range must not be hit');
assert(bladeHits.every(entry=>entry.damage===18),'Level 1 Hồi Phong Nhận hit damage must be 18');
assert.strictEqual(state.v016A2.blades.length,0,'Returning blade must be caught and removed');

// Tinh Vẫn: fixed-position 0.8s telegraph, exact area damage and guaranteed 2s burn at 4 DPS on level 1 survivors.
resetWorld();
owned.meteorSeal=1;
const meteorEnemy={x:200,y:100,r:12,hp:100,maxHp:100,speed:40,dead:false,statuses:{}};
state.enemies=[meteorEnemy];
assert.strictEqual(skills.meteorSeal.periodic.execute(1),true);
assert.strictEqual(state.v016A2.meteors.length,1);
assert.strictEqual(state.v016A2.meteors[0].impactAt,.8,'Tinh Vẫn telegraph must last 0.8 seconds');
state.t=.79;sandbox.update(.01);
assert.strictEqual(hitLog.filter(entry=>entry.meta?.source==='meteorSeal').length,0,'Tinh Vẫn must not impact before 0.8 seconds');
state.t=.8;sandbox.update(.01);
const meteorHits=hitLog.filter(entry=>entry.meta?.source==='meteorSeal');
assert.strictEqual(meteorHits.length,1,'Tinh Vẫn must impact at 0.8 seconds');
assert.strictEqual(meteorHits[0].damage,30,'Level 1 Tinh Vẫn damage must be 30');
assert.strictEqual(burnLog.length,1,'Tinh Vẫn must apply burn to a surviving hit target');
assert.strictEqual(burnLog[0].dps,4,'Level 1 Tinh Vẫn burn must deal 4 DPS');
assert.strictEqual(burnLog[0].duration,2,'Tinh Vẫn burn duration must be 2 seconds');

console.log('V0.16 A2 smoke test passed');
