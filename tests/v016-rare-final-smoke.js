const fs=require('fs');
const vm=require('vm');
const assert=require('assert');

const events={};
const owned={testSkill:1};
const math=Object.create(Math);math.random=()=>0.5;
const preexisting={};
for(let i=0;i<6;i++)preexisting[`d${i}`]={id:`d${i}`,tier:'divine',name:`D${i}`};
for(let i=0;i<6;i++)preexisting[`m${i}`]={id:`m${i}`,tier:'mystic',name:`M${i}`};

const context={
  console,Math:math,Set,Object,Array,Number,Boolean,Infinity,
  DIVINE_SKILLS:preexisting,
  skills:{testSkill:{name:'Test',max:5,apply:()=>{context.applies++;}}},
  owned,applies:0,unlockChecks:0,defeated:false,
  state:{t:10,enemies:[],running:true,paused:false,gameOver:false,v016RareR2:{domainUntil:0,causalArmed:false}},
  player:{x:0,y:0,r:16,level:20,hp:100,maxHp:100,shield:0,dodgeChance:0,invulnerableUntil:0,reviveCharges:0},
  skillRuntime:{divineSkills:new Set(),divineTimers:{},counters:{},cooldowns:{},listeners:{}},
  skillLevel:key=>owned[key]||0,
  hasDivineSkill:id=>context.skillRuntime.divineSkills.has(id),
  isEnemyHostile:e=>Boolean(e&&!e.dead&&!e.allied),
  evaluateBuildUnlocks:()=>{context.unlockChecks++;},
  onSkillEvent:(name,fn)=>{(events[name]||(events[name]=[])).push(fn);},
  emitSkillEvent:(name,payload={})=>{for(const fn of events[name]||[])fn(payload);},
  getOutgoingDamageMultiplier:()=>1,
  getIncomingDamageMultiplier:()=>1,
  getEffectiveMoveSpeed:()=>100,
  spawnEnemy:()=>{context.state.enemies.push({x:100,y:0,hp:100,maxHp:100,speed:50,dmg:10,dead:false,elite:false});},
  update:dt=>{context.state.t+=dt;},
  damagePlayer:(amount,meta={})=>{if(amount<=0)return 0;context.player.hp-=amount;return amount;},
  hitEnemy:(enemy,damage,knock=0,meta={})=>{if(!enemy||enemy.dead)return false;enemy.hp-=damage;const killed=enemy.hp<=0;if(killed){enemy.dead=true;context.emitSkillEvent('kill',{enemy,meta});}return killed;},
  healPlayer:amount=>{const before=context.player.hp;context.player.hp=Math.min(context.player.maxHp,context.player.hp+amount);return context.player.hp-before;},
  finishRun:()=>{context.state.gameOver=true;context.defeated=true;},
  resetSkillEngine:()=>{},
  clamp:(v,a,b)=>Math.max(a,Math.min(b,v))
};
context.global=context;
vm.createContext(context);
vm.runInContext(fs.readFileSync('js/v016-rares-r3.js','utf8'),context,{filename:'v016-rares-r3.js'});
vm.runInContext(fs.readFileSync('js/v016-rares-r4.js','utf8'),context,{filename:'v016-rares-r4.js'});

let ids=vm.runInContext('Object.keys(DIVINE_SKILLS)',context);
let divine=vm.runInContext('Object.values(DIVINE_SKILLS).filter(x=>x.tier==="divine").length',context);
let mystic=vm.runInContext('Object.values(DIVINE_SKILLS).filter(x=>x.tier==="mystic").length',context);
assert.strictEqual(ids.length,20,'final V0.16 rare pool must contain 20 rules');
assert.strictEqual(divine,10,'final pool must contain 10 Thần Kỹ');
assert.strictEqual(mystic,10,'final pool must contain 10 Thần Bí Kỹ');

// Thiên Tứ: paid selection below MAX gains exactly one free level when 18% roll succeeds.
context.skillRuntime.divineSkills=new Set(['divineGift']);context.Math.random=()=>0;owned.testSkill=1;context.applies=0;context.unlockChecks=0;
context.emitSkillEvent('skill_selected',{key:'testSkill',level:1});
assert.strictEqual(owned.testSkill,2,'Thiên Tứ must grant one free level');
assert.strictEqual(context.applies,1,'free level must run skill apply exactly once');
assert.strictEqual(context.unlockChecks,1,'free level must re-evaluate build unlocks');

// Thời Đình: hostiles freeze immediately, bribed allies do not, speed restores after 2s.
context.Math.random=()=>0.5;context.skillRuntime.divineSkills=new Set(['timeStop']);context.state.t=20;
const hostile={x:0,y:0,hp:100,maxHp:100,speed:50,dmg:10,dead:false,elite:false};
const ally={x:0,y:0,hp:100,maxHp:100,speed:60,dmg:10,dead:false,elite:false,allied:true};context.state.enemies=[hostile,ally];
vm.runInContext('DIVINE_SKILLS.timeStop.execute()',context);
assert.strictEqual(hostile.speed,0,'Thời Đình must freeze hostile speed immediately');
assert.strictEqual(ally.speed,60,'Thời Đình must not freeze bribed/allied enemy');
context.state.t=22.01;context.update(0);
assert.strictEqual(hostile.speed,50,'Thời Đình must restore original speed after its 2s window');

// Thiên Lệnh: current-HP loss, elite ratio, ally excluded, floor above 0.
context.skillRuntime.divineSkills=new Set(['celestialEdict']);context.state.t=30;
const normal={x:0,y:0,hp:100,maxHp:100,speed:50,dead:false,elite:false};
const elite={x:0,y:0,hp:100,maxHp:100,speed:50,dead:false,elite:true};
const friendly={x:0,y:0,hp:100,maxHp:100,speed:50,dead:false,elite:false,allied:true};context.state.enemies=[normal,elite,friendly];
vm.runInContext('DIVINE_SKILLS.celestialEdict.execute()',context);
assert.ok(Math.abs(normal.hp-82)<1e-9,'ordinary target must lose 18% current HP');
assert.ok(Math.abs(elite.hp-92)<1e-9,'elite target must lose 8% current HP');
assert.strictEqual(friendly.hp,100,'allied target must be excluded from Thiên Lệnh');

// Thiên Ấn: first eligible contact is blocked, same enemy passes through during 12s cooldown.
context.skillRuntime.divineSkills=new Set(['heavenSeal']);context.state.t=40;context.player.hp=100;context.player.dodgeChance=0;
const sealer={x:0,y:0,hp:100,maxHp:100,speed:50,dead:false,elite:false};
assert.strictEqual(context.damagePlayer(10,{source:sealer,type:'contact'}),0,'first contact must be sealed');
assert.strictEqual(context.player.hp,100,'sealed hit must not damage player');
assert.ok(Math.abs(sealer.__heavenSealReadyAt-52)<1e-9,'per-enemy seal cooldown must be 12s');
context.damagePlayer(10,{source:sealer,type:'contact'});
assert.strictEqual(context.player.hp,90,'same enemy during cooldown must damage normally');

// Nợ Máu: 40 post-defense HP damage -> 20 now + 20 debt over 5s; 1s pays 4.
context.skillRuntime.divineSkills=new Set(['bloodDebt']);context.state.t=50;context.player.hp=100;context.player.maxHp=100;context.player.shield=0;context.player.dodgeChance=0;context.state.enemies=[];
context.damagePlayer(40,{source:'test'});
assert.ok(Math.abs(context.player.hp-80)<1e-9,'Nợ Máu must defer exactly half of HP damage');
context.update(1);
assert.ok(Math.abs(context.player.hp-76)<1e-9,'Nợ Máu must pay deferred damage linearly over 5s');

// Ký Sinh: after 10 shield absorbs from 50, redirect 30% of remaining 40 = 12; player takes 28.
context.skillRuntime.divineSkills=new Set(['parasitePact']);context.state.t=60;context.player.hp=100;context.player.maxHp=100;context.player.shield=10;context.player.dodgeChance=0;
const hostA={x:0,y:0,hp:200,maxHp:200,speed:50,dead:false,elite:false};const hostB={x:0,y:0,hp:120,maxHp:120,speed:50,dead:false,elite:false};context.state.enemies=[hostA,hostB];
assert.strictEqual(vm.runInContext('DIVINE_SKILLS.parasitePact.execute()',context),true,'Ký Sinh must select a target when hostiles exist');
context.damagePlayer(50,{source:'test'});
assert.ok(Math.abs(context.player.hp-72)<1e-9,'Ký Sinh player share must be 70% of post-shield HP damage');
assert.ok(Math.abs(hostA.hp-188)<1e-9,'Ký Sinh target must receive exact 30% redirected damage');

// Hư Thực: starts HƯ, then becomes THỰC at 6s.
context.skillRuntime.divineSkills=new Set(['voidReality']);context.state.t=70;context.emitSkillEvent('divine_acquired',{id:'voidReality'});
assert.ok(Math.abs(context.getOutgoingDamageMultiplier(null,{})-.8)<1e-9,'HƯ must reduce outgoing damage to 80%');
assert.ok(Math.abs(context.getEffectiveMoveSpeed()-100)<1e-9,'HƯ must not slow movement');
context.state.t=76.01;
assert.ok(Math.abs(context.getOutgoingDamageMultiplier(null,{})-1.25)<1e-9,'THỰC must multiply outgoing damage by 1.25');
assert.ok(Math.abs(context.getEffectiveMoveSpeed()-85)<1e-9,'THỰC must reduce movement speed to 85%');

// Thế Mệnh: fatal immediate hit kills marked ordinary target and leaves player at 1 HP.
context.skillRuntime.divineSkills=new Set(['scapegoatFate']);context.state.t=80;context.player.hp=10;context.player.maxHp=100;context.player.shield=0;context.player.dodgeChance=0;
const proxy={x:0,y:0,hp:50,maxHp:50,speed:50,dead:false,elite:false};context.state.enemies=[proxy];context.Math.random=()=>0;
assert.strictEqual(vm.runInContext('DIVINE_SKILLS.scapegoatFate.execute()',context),true,'Thế Mệnh must mark an ordinary hostile');
context.damagePlayer(20,{source:'test'});
assert.strictEqual(context.player.hp,1,'Thế Mệnh must preserve player at 1 HP');
assert.strictEqual(proxy.dead,true,'marked proxy must die instead');

console.log('V0.16 final rare mechanics smoke: PASS');
