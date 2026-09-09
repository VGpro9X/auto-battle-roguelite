const fs=require('fs');
const vm=require('vm');
const assert=require('assert');

const synergiesOwned=new Set(['thunderStride','sealedSoul','heavenfallBurn','guardianRetaliation']);
const levels={lightning:2,soulBind:3,deathMark:1,meteorSeal:2,burn:1,guardianIdol:1,retaliate:2};
const hitLog=[];
const areaLog=[];
const burnLog=[];

const state={
  t:10,running:true,paused:false,gameOver:false,
  enemies:[],
  v016A2:{meteors:[],transient:[]},
  v016A3:{guardian:null}
};
const player={x:0,y:0,areaMultiplier:1};

const skills={
  soulBind:{periodic:{execute:()=>false}},
  meteorSeal:{periodic:{execute:level=>{const target=context.randomEnemy();if(!target)return false;state.v016A2.meteors.push({x:target.x,y:target.y,level,impactAt:state.t+.8,dead:false});return true;}}}
};

const context={
  console,Math,Set,Object,Array,Number,Boolean,Infinity,
  state,player,skills,SYNERGIES:{},EVOLUTIONS:{},
  skillRuntime:{},
  clamp:(v,a,b)=>Math.max(a,Math.min(b,v)),
  hasSynergy:id=>synergiesOwned.has(id),
  skillLevel:key=>levels[key]||0,
  isEnemyHostile:enemy=>!enemy.dead,
  getOutgoingDamageMultiplier:()=>1,
  hitEnemy:(enemy,damage,knockback=0,meta={})=>{hitLog.push({enemy,damage,knockback,meta});enemy.hp-=damage;enemy.dead=enemy.hp<=0;return enemy.dead;},
  damageAreaAt:(x,y,radius,damage,meta={},knockback=0)=>{areaLog.push({x,y,radius,damage,meta,knockback});return 1;},
  applyBurn:(enemy,dps,duration)=>{burnLog.push({enemy,dps,duration});enemy.statuses=enemy.statuses||{};enemy.statuses.burn={dps,until:state.t+duration};},
  damageEnemyCombatTarget:(target,amount)=>{const dealt=Math.max(0,amount);target.hp=Math.max(0,target.hp-dealt);if(target.hp<=0&&state.v016A3.guardian===target)state.v016A3.guardian=null;return dealt;},
  randomEnemy:()=>state.enemies.find(e=>!e.dead)||null,
  resetSkillEngine:()=>{},
  update:dt=>{state.t+=dt;},
  draw:()=>{},drawCodexPreview:()=>{},
  v12PreviewFrame:()=>{},v12Actor:()=>{},v12Enemy:()=>{},v12Ring:()=>{},v12Line:()=>{},drawAreaPulse:()=>{},drawLightningArc:()=>{},drawGlowDot:()=>{},
  ctx:{save:()=>{},restore:()=>{},beginPath:()=>{},arc:()=>{},stroke:()=>{},fill:()=>{},moveTo:()=>{},lineTo:()=>{},fillRect:()=>{},set strokeStyle(v){},set fillStyle(v){},set lineWidth(v){},set globalAlpha(v){}}
};
vm.createContext(context);
vm.runInContext(fs.readFileSync('js/v016-synergies-b2.js','utf8'),context,{filename:'v016-synergies-b2.js'});

assert.strictEqual(Object.keys(context.SYNERGIES).length,4,'B2 must register four Hợp Đạo entries in isolated context');

// 1) Phong Lôi Bộ: maximum two follow-up bolts, each at 50% current Lightning base damage.
hitLog.length=0;
const s1={x:20,y:0,r:10,hp:100,dead:false},s2={x:30,y:0,r:10,hp:100,dead:false},s3={x:40,y:0,r:10,hp:100,dead:false};
context.hitEnemy(s1,5,0,{source:'strideShock',tags:['MOVEMENT','AREA']});
context.hitEnemy(s2,5,0,{source:'strideShock',tags:['MOVEMENT','AREA']});
context.hitEnemy(s3,5,0,{source:'strideShock',tags:['MOVEMENT','AREA']});
const thunderHits=hitLog.filter(h=>h.meta.source==='thunderStride');
assert.strictEqual(thunderHits.length,2,'Phong Lôi Bộ must cap at two struck targets per shock frame');
assert.ok(thunderHits.every(h=>Math.abs(h.damage-14)<1e-12),'Lv2 Lôi Kích base 28 must yield 14-damage follow-up before shared multipliers');
assert.ok(thunderHits.every(h=>h.meta.allowProcs===false),'Phong Lôi Bộ bolts must not recurse through ordinary hit procs');

// 2) Phong Hồn Tử Ấn: marked target priority +1s extension, elite halves final duration, +20% damage window.
state.t=20;
const unmarkedFast={x:50,y:0,r:10,hp:100,dead:false,speed:100,elite:false,markedUntil:0};
const markedSlow={x:70,y:0,r:10,hp:100,dead:false,speed:40,elite:false,markedUntil:30};
state.enemies=[unmarkedFast,markedSlow];
assert.strictEqual(context.skills.soulBind.periodic.execute(3),true);
assert.ok(markedSlow.soulBoundUntil>0&&!unmarkedFast.soulBoundUntil,'Trói Hồn must prioritize an active Tử Ấn over a faster unmarked target');
assert.ok(Math.abs(markedSlow.soulBoundUntil-22.5)<1e-12,'Lv3 marked normal target must be bound for 1.5+1 = 2.5s');
assert.ok(Math.abs(context.getOutgoingDamageMultiplier(markedSlow,{})-1.2)<1e-12,'Bound+marked target must take exactly +20% damage');

state.t=30;
const markedElite={x:60,y:0,r:12,hp:100,dead:false,speed:80,elite:true,markedUntil:40};
state.enemies=[markedElite];
assert.strictEqual(context.skills.soulBind.periodic.execute(3),true);
assert.ok(Math.abs(markedElite.soulBoundUntil-31.25)<1e-12,'Elite must receive half of the final 2.5s marked bind duration');

// 3) Thiên Hỏa Tinh Vẫn: capture selected target, check burn before primary impact, delay secondary by .25s at 55%.
state.t=40;hitLog.length=0;areaLog.length=0;burnLog.length=0;
const meteorTarget={x:80,y:0,r:10,hp:500,dead:false,statuses:{burn:{dps:5,until:50}}};
state.enemies=[meteorTarget];
assert.strictEqual(context.skills.meteorSeal.periodic.execute(2),true);
assert.strictEqual(state.v016A2.meteors[0].synergyTarget,meteorTarget,'Meteor must remember the exact originally selected target');
context.update(.8);
assert.strictEqual(state.v016A2.meteors.length,0,'Primary meteor must resolve at its original 0.8s impact timing');
assert.ok(hitLog.some(h=>h.meta.source==='meteorSeal'&&Math.abs(h.damage-42)<1e-12),'Lv2 primary meteor must keep its documented 42 base damage');
assert.strictEqual(areaLog.filter(a=>a.meta.source==='heavenfallBurn').length,0,'Secondary blast must not fire immediately');
context.update(.25);
const secondary=areaLog.find(a=>a.meta.source==='heavenfallBurn');
assert.ok(secondary,'Burning selected target must schedule the second explosion');
assert.ok(Math.abs(secondary.damage-23.1)<1e-12,'Secondary must deal exactly 55% of Lv2 Tinh Vẫn base damage');
assert.strictEqual(secondary.meta.allowProcs,false);

// 4) Hộ Pháp Phản Chấn: same retaliate scaling centered on idol, fixed .6s per-idol cadence.
state.t=60;areaLog.length=0;
const guardian={x:25,y:35,r:16,hp:50,maxHp:50};state.v016A3.guardian=guardian;
context.damageEnemyCombatTarget(guardian,5,{type:'contact'});
let guardianBursts=areaLog.filter(a=>a.meta.source==='guardianRetaliation');
assert.strictEqual(guardianBursts.length,1);
assert.strictEqual(guardianBursts[0].x,25);assert.strictEqual(guardianBursts[0].y,35);
assert.strictEqual(guardianBursts[0].radius,92,'Lv2 Phản Chấn radius must be 72+20 = 92 before area multiplier');
assert.strictEqual(guardianBursts[0].damage,14,'Lv2 Phản Chấn damage must be 4+10 = 14');
context.damageEnemyCombatTarget(guardian,5,{type:'contact'});
assert.strictEqual(areaLog.filter(a=>a.meta.source==='guardianRetaliation').length,1,'Same guardian cannot retaliate twice inside .6s');
state.t+=.6;
context.damageEnemyCombatTarget(guardian,5,{type:'contact'});
assert.strictEqual(areaLog.filter(a=>a.meta.source==='guardianRetaliation').length,2,'Guardian may retaliate again at the documented .6s boundary');

console.log('V0.16 Hợp Đạo B2 smoke: PASS');
