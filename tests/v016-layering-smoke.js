const fs=require('fs');
const vm=require('vm');
const assert=require('assert');

const events={};
const owned={};
const math=Object.create(Math);
let randomValue=.5; math.random=()=>randomValue;
const state={t:0,enemies:[],running:true,paused:false,gameOver:false};
const player={x:0,y:0,r:16,level:30,hp:100,maxHp:100,shield:0,xpMultiplier:1,dodgeChance:0,invulnerableUntil:0,reviveCharges:0};
const skillRuntime={divineSkills:new Set(),divineTimers:{},counters:{},cooldowns:{},listeners:{}};
const skills={pulse:{name:'Pulse',icon:'*',max:5,tags:['PERIODIC'],apply:()=>{}}};
const document={getElementById:()=>null,querySelector:()=>null,createElement:()=>({style:{},addEventListener:()=>{},insertAdjacentElement:()=>{}})};

const context={
  console,Math:math,Set,Object,Array,Number,Boolean,Infinity,document,
  state,player,owned,skills,SYNERGIES:{},EVOLUTIONS:{},skillRuntime,
  clamp:(v,a,b)=>Math.max(a,Math.min(b,v)),
  dist:(a,b)=>Math.hypot((a.x||0)-(b.x||0),(a.y||0)-(b.y||0)),
  skillLevel:key=>owned[key]||0,
  getSkillChoices:()=>['pulse'],
  getOutgoingDamageMultiplier:()=>1,
  getIncomingDamageMultiplier:()=>1,
  getEffectiveMoveSpeed:()=>100,
  hitEnemy:(enemy,damage,knock=0,meta={})=>{if(!enemy||enemy.dead)return false;enemy.hp-=damage;if(enemy.hp<=0){enemy.dead=true;context.emitSkillEvent('kill',{enemy,meta});}return enemy.dead;},
  damagePlayer:(amount,meta={})=>{if(amount<=0||player.hp<=0)return 0;let remaining=amount;if(player.shield>0){const absorbed=Math.min(player.shield,remaining);player.shield-=absorbed;remaining-=absorbed;if(player.shield<=0)context.emitSkillEvent('shield_broken',{absorbed,meta});}if(remaining<=0)return 0;player.hp-=remaining;context.emitSkillEvent('damage_taken',{amount:remaining,source:meta.source||null,meta});return remaining;},
  gainXp:amount=>amount,
  addShield:amount=>{player.shield+=amount;return amount;},
  healPlayer:(amount,meta={})=>{const before=player.hp;player.hp=Math.min(player.maxHp,player.hp+amount);if(player.hp>before)context.emitSkillEvent('heal',{amount:player.hp-before,meta});return player.hp-before;},
  spawnEnemy:()=>{},
  update:dt=>{state.t+=dt;},
  runSkillEngine:()=>{},
  resetSkillEngine:()=>{skillRuntime.counters={};skillRuntime.cooldowns={};},
  evaluateBuildUnlocks:()=>{},onSkillSelectedEngine:()=>{},finishRun:()=>{state.gameOver=true;},
  onSkillEvent:(name,fn)=>{(events[name]||(events[name]=[])).push(fn);},
  emitSkillEvent:(name,payload={})=>{for(const fn of events[name]||[])fn(payload);},
  nearestEnemy:()=>[null,Infinity],getNearestEnemies:()=>[],getNearestEnemiesFrom:()=>[],findNearestEnemyFrom:()=>null,getRandomEnemies:()=>[],randomEnemy:()=>null,
  getEnemyDangerAt:()=>({danger:0,nearest:Infinity,closeCount:0}),getLocalThreat:()=>({nearest:Infinity,close80:0,close125:0,centroid:null}),
  showLevelUp:()=>{},settings:{particles:true}
};
context.global=context;
vm.createContext(context);
for(const file of ['js/divine-skills.js','js/v016-run-systems.js','js/v016-rares-r3.js','js/v016-rares-r4.js']){
  vm.runInContext(fs.readFileSync(file,'utf8'),context,{filename:file});
}

function enemy(hp=100,elite=false){return{x:0,y:0,r:10,hp,maxHp:hp,speed:50,dmg:10,dead:false,elite,statuses:{},markedUntil:0};}
function own(...ids){skillRuntime.divineSkills=new Set(ids);skillRuntime.divineTimers={};skillRuntime.counters={};skillRuntime.cooldowns={};}
function resetPlayer(){player.hp=100;player.maxHp=100;player.shield=0;player.dodgeChance=0;player.invulnerableUntil=0;player.reviveCharges=0;state.gameOver=false;}

// 1) Mua Chuộc + Thời Đình: allied enemy must remain active while hostile freezes, then hostility returns after alliedUntil.
resetPlayer();state.t=10;const hostile=enemy(),ally=enemy();ally.x=20;context.convertEnemyToAlly(ally,5);state.enemies=[hostile,ally];own('bribery','timeStop');
assert.strictEqual(context.isEnemyAllied(ally),true,'Mua Chuộc target must be allied inside its 5s window');
vm.runInContext('DIVINE_SKILLS.timeStop.execute()',context);
assert.strictEqual(hostile.speed,0,'Thời Đình must freeze hostile enemy');
assert.strictEqual(ally.speed,50,'Thời Đình must not freeze bribed ally');
state.t=15.01;context.update(0);
assert.strictEqual(context.isEnemyHostile(ally),true,'Bribed enemy must revert after alliedUntil expires');
assert.strictEqual(hostile.speed,50,'Thời Đình must restore frozen hostile speed after its window');

// 2) Thiên Ấn ordering: a dodge happens before seal consumption, so the per-enemy 12s seal cooldown remains unused.
resetPlayer();state.t=20;const sealer=enemy();state.enemies=[sealer];own('heavenSeal');player.dodgeChance=1;randomValue=0;
assert.strictEqual(context.damagePlayer(30,{source:sealer,type:'contact'}),0,'Guaranteed dodge must prevent contact damage');
assert.strictEqual(sealer.__heavenSealReadyAt,undefined,'Dodged hit must not consume Thiên Ấn');
player.dodgeChance=0;randomValue=.5;
assert.strictEqual(context.damagePlayer(30,{source:sealer,type:'contact'}),0,'Next non-dodged contact must be sealed');
assert.ok(Math.abs(sealer.__heavenSealReadyAt-32)<1e-9,'Thiên Ấn cooldown must begin only after the actual block');

// 3) Đảo Nhân Quả must resolve before Nợ Máu/Ký Sinh/Thế Mệnh: no debt, redirect or scapegoat consumption.
resetPlayer();state.t=30;const parasite=enemy(200),proxy=enemy(80);state.enemies=[parasite,proxy];own('causalInversion','bloodDebt','parasitePact','scapegoatFate');
state.v016RareR2.causalArmed=true;state.v016RareR4.parasiteTarget=parasite;state.v016RareR4.parasiteUntil=40;state.v016RareR4.scapegoat=proxy;player.hp=50;
assert.strictEqual(context.damagePlayer(40,{source:'layer-test'}),0,'Armed Đảo Nhân Quả must cancel the incoming hit');
assert.strictEqual(player.hp,90,'Đảo Nhân Quả must heal by the cancelled post-reduction damage');
assert.strictEqual(parasite.hp,200,'Ký Sinh must not redirect a hit already consumed by Đảo Nhân Quả');
assert.strictEqual(proxy.dead,false,'Thế Mệnh must not be consumed by an inverted hit');
assert.strictEqual(state.v016RareR4.debts.length,0,'Nợ Máu must not schedule debt for an inverted hit');
assert.strictEqual(state.v016RareR2.causalArmed,false,'Đảo Nhân Quả charge must be consumed exactly once');

// 4) Nợ Máu + Ký Sinh + Thế Mệnh exact order on a lethal post-shield hit.
resetPlayer();state.t=40;const parasite2=enemy(200),proxy2=enemy(80);state.enemies=[parasite2,proxy2];own('bloodDebt','parasitePact','scapegoatFate');
player.hp=10;player.shield=10;state.v016RareR4.parasiteTarget=parasite2;state.v016RareR4.parasiteUntil=50;state.v016RareR4.scapegoat=proxy2;
context.damagePlayer(50,{source:'layer-test'});
// 50 incoming - 10 shield = 40 HP damage; 30% redirect = 12; 28 remains; half deferred = 14; immediate 14 is lethal at 10 HP -> proxy dies, player held at 1.
assert.strictEqual(player.shield,0,'Shield must absorb before rare HP rules');
assert.ok(Math.abs(parasite2.hp-188)<1e-9,'Ký Sinh must redirect exactly 12 damage (30% of post-shield 40)');
assert.strictEqual(proxy2.dead,true,'Thế Mệnh must die instead of player when the immediate 14 damage is lethal');
assert.strictEqual(player.hp,1,'Thế Mệnh must keep player at 1 HP');
assert.strictEqual(state.v016RareR4.debts.length,1,'Nợ Máu must still schedule the deferred half');
assert.ok(Math.abs(state.v016RareR4.debts[0].remaining-11.9)<1e-9,'Thế Mệnh proxy death must count as a kill and clear 15% of the newly scheduled 14 Nợ Máu, leaving 11.9');

// 5) Bất Tử Nhất Tức remains the final lethal safety net when no earlier rare prevents the hit.
resetPlayer();state.t=60;state.enemies=[];own('immortalBreath');player.hp=8;
context.damagePlayer(20,{source:'lethal-test'});
assert.strictEqual(player.hp,1,'Bất Tử Nhất Tức must intercept lethal damage at 1 HP');
assert.ok(player.invulnerableUntil>=64,'Bất Tử Nhất Tức must grant the stated 4s invulnerability window');
assert.strictEqual(skillRuntime.counters.immortalBreathUsed,1,'Bất Tử Nhất Tức must remain once per run');

console.log('V0.16 layered rare ordering smoke: PASS');
