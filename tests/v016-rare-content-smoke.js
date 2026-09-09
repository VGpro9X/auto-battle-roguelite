const fs=require('fs');
const vm=require('vm');
const assert=require('assert');

const events={};
const owned={};
const skills={
  pulse:{name:'Pulse',icon:'*',max:5,tags:['PERIODIC'],apply:()=>{},periodic:{cooldown:()=>2,execute:()=>{context.pulseExecs++;return true;}}}
};

const context={
  console,Math,Set,Object,Array,Number,Boolean,Infinity,
  pulseExecs:0,lastXpInput:null,shieldAdded:0,
  owned,skills,SYNERGIES:{},EVOLUTIONS:{},
  state:{t:10,enemies:[],running:true,paused:false,gameOver:false},
  player:{x:0,y:0,r:16,level:20,hp:100,maxHp:100,shield:0,xpMultiplier:2,dodgeChance:0,invulnerableUntil:0},
  skillRuntime:{divineSkills:new Set(),divineTimers:{},counters:{},cooldowns:{},listeners:{}},
  document:{getElementById:()=>null,querySelector:()=>null},
  clamp:(v,a,b)=>Math.max(a,Math.min(b,v)),
  dist:(a,b)=>Math.hypot((a.x||0)-(b.x||0),(a.y||0)-(b.y||0)),
  skillLevel:key=>owned[key]||0,
  getSkillChoices:()=>[],
  getOutgoingDamageMultiplier:()=>1,
  getIncomingDamageMultiplier:()=>1,
  hitEnemy:(enemy,damage)=>{enemy.hp-=damage;if(enemy.hp<=0)enemy.dead=true;return enemy.dead;},
  damagePlayer:()=>0,
  gainXp:amount=>{context.lastXpInput=amount;return amount;},
  addShield:amount=>{context.shieldAdded+=amount;context.player.shield+=amount;return amount;},
  healPlayer:amount=>{const before=context.player.hp;context.player.hp=Math.min(context.player.maxHp,context.player.hp+amount);return context.player.hp-before;},
  update:()=>{},
  runSkillEngine:()=>{},
  resetSkillEngine:()=>{},
  evaluateBuildUnlocks:()=>{},
  onSkillSelectedEngine:()=>{},
  onSkillEvent:(name,fn)=>{(events[name]||(events[name]=[])).push(fn);},
  emitSkillEvent:(name,payload)=>{for(const fn of events[name]||[])fn(payload);},
  nearestEnemy:()=>[null,Infinity],getNearestEnemies:()=>[],getNearestEnemiesFrom:()=>[],findNearestEnemyFrom:()=>null,getRandomEnemies:()=>[],randomEnemy:()=>null,
  getEnemyDangerAt:()=>({danger:0,nearest:Infinity,closeCount:0}),getLocalThreat:()=>({nearest:Infinity,close80:0,close125:0,centroid:null})
};
context.global=context;
vm.createContext(context);
vm.runInContext(fs.readFileSync('js/divine-skills.js','utf8'),context,{filename:'divine-skills.js'});
vm.runInContext(fs.readFileSync('js/v016-run-systems.js','utf8'),context,{filename:'v016-run-systems.js'});

const ids=vm.runInContext('Object.keys(DIVINE_SKILLS)',context);
const divineCount=vm.runInContext('Object.values(DIVINE_SKILLS).filter(x=>x.tier==="divine").length',context);
const mysticCount=vm.runInContext('Object.values(DIVINE_SKILLS).filter(x=>x.tier==="mystic").length',context);
assert.strictEqual(ids.length,12,'current development pool must contain 12 rare rules');
assert.strictEqual(divineCount,6,'must contain 6 Thần Kỹ');
assert.strictEqual(mysticCount,6,'must contain 6 Thần Bí Kỹ');

for(const id of ids)assert.strictEqual(context.grantDivineSkill(id),true,`should grant distinct rare ${id}`);
assert.strictEqual(context.getOwnedDivineCount(),12,'all distinct rares must coexist');
assert.strictEqual(context.grantDivineSkill(ids[0]),false,'duplicate rare must remain blocked');

context.skillRuntime.divineSkills=new Set(['heavenlyMandate']);
owned.pulse=1;context.pulseExecs=0;
const mandateResult=vm.runInContext('DIVINE_SKILLS.heavenlyMandate.execute()',context);
assert.strictEqual(mandateResult,true,'Thiên Mệnh should complete its 30s decree');
assert.strictEqual(context.pulseExecs,1,'Thiên Mệnh must execute an owned periodic skill exactly once');

context.skillRuntime.divineSkills=new Set(['spatialSwap']);
context.player.x=0;context.player.y=0;
context.state.enemies=[
  {x:20,y:0,hp:10,maxHp:10,dead:false,elite:false},
  {x:40,y:0,hp:10,maxHp:10,dead:false,elite:false},
  {x:60,y:0,hp:10,maxHp:10,dead:false,elite:false},
  {x:250,y:0,hp:10,maxHp:10,dead:false,elite:false}
];
const swapResult=vm.runInContext('DIVINE_SKILLS.spatialSwap.execute()',context);
assert.strictEqual(swapResult,true,'Hoán Vị should fire when both crowd and distant-target conditions are met');
assert.strictEqual(context.player.x,250,'player must swap to the far eligible enemy position');
assert.strictEqual(context.state.enemies[3].x,0,'far enemy must move to the old player position');
assert.ok(context.player.spatialSwapImmuneUntil>context.state.t,'Hoán Vị must grant 0.6s contact immunity');

context.skillRuntime.divineSkills=new Set(['equalPrice']);
context.player.hp=context.player.maxHp=100;context.player.xpMultiplier=2;context.player.shield=0;context.lastXpInput=null;context.shieldAdded=0;
context.gainXp(10);
assert.ok(Math.abs(context.lastXpInput-7)<1e-12,'Đồng Giá must pass only 70% base amount into normal XP flow');
assert.ok(Math.abs(context.shieldAdded-12)<1e-12,'Đồng Giá must convert 30% of final 20 XP into 12 shield');

console.log('V0.16 rare content smoke: PASS');
