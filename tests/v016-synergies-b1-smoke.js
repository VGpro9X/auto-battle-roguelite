const fs=require('fs');
const vm=require('vm');
const assert=require('assert');

const events={};
const synergiesOwned=new Set(['afterimageEcho','gravityRune','bloodSymbiosis','nourishingPearls']);
const levels={afterimage:2,echoShot:2,spiritPearl:3,xpHeal:2};
const projectiles=[];
const hits=[];
const heals=[];

const state={
  t:10,running:true,paused:false,gameOver:false,
  enemies:[],
  v016A1:{afterimages:[],mines:[],pearlCharge:0,pearls:0,transient:[]}
};
const player={x:0,y:0,damage:20,hp:50,maxHp:100};

const context={
  console,Math,Set,Object,Array,Number,Boolean,Infinity,globalThis:null,
  state,player,SYNERGIES:{},EVOLUTIONS:{},skills:{},
  skillRuntime:{counters:{echoShot:0},listeners:{},unlockedSynergies:synergiesOwned},
  clamp:(v,a,b)=>Math.max(a,Math.min(b,v)),
  hasSynergy:id=>synergiesOwned.has(id),
  skillLevel:key=>levels[key]||0,
  isEnemyHostile:enemy=>!enemy.dead,
  createProjectileFrom:(x,y,target,damage,speed,radius,type,pierce,meta)=>{projectiles.push({x,y,target,damage,speed,radius,type,pierce,meta});return projectiles.at(-1);},
  hitEnemy:(enemy,damage,knockback,meta)=>{hits.push({enemy,damage,knockback,meta,x:enemy.x,y:enemy.y});enemy.hp-=damage;return enemy.hp<=0;},
  healPlayer:(amount,meta)=>{heals.push({amount,meta});const before=player.hp;player.hp=Math.min(player.maxHp,player.hp+amount);return player.hp-before;},
  onSkillEvent:(name,fn)=>{(events[name]||(events[name]=[])).push(fn);},
  emitSkillEvent:(name,payload)=>{for(const fn of events[name]||[])fn(payload);},
  resetSkillEngine:()=>{},
  update:dt=>{state.t+=dt;},
  draw:()=>{},
  drawCodexPreview:()=>{},
  v12PreviewFrame:()=>{},v12Actor:()=>{},v12Enemy:()=>{},v12Projectile:()=>{},v12Ring:()=>{},v12Line:()=>{},drawGlowDot:()=>{}
};
context.globalThis=context;

// Simulate the A1 heal listener existing before B1: it counts actual healing once.
events.heal=[payload=>{
  if(!payload?.amount)return;
  const cap=1+Math.floor(((levels.spiritPearl||0)-1)/2);
  if(state.v016A1.pearls>=cap)return;
  state.v016A1.pearlCharge+=payload.amount;
  while(state.v016A1.pearlCharge>=8&&state.v016A1.pearls<cap){state.v016A1.pearlCharge-=8;state.v016A1.pearls++;}
  if(state.v016A1.pearls>=cap)state.v016A1.pearlCharge=0;
}];

vm.createContext(context);
vm.runInContext(fs.readFileSync('js/v016-synergies-b1.js','utf8'),context,{filename:'v016-synergies-b1.js'});

assert.strictEqual(Object.keys(context.SYNERGIES).length,4,'B1 must register exactly four Hợp Đạo entries in isolated smoke context');

// 1) Vạn Ảnh Xạ: every active Dư Ảnh fires one extra no-proc shot on the real echo activation.
state.v016A1.afterimages=[
  {x:10,y:4,level:1,until:20},
  {x:-8,y:6,level:2,until:20}
];
const target={x:100,y:0,r:10,hp:100,dead:false};
context.emitSkillEvent('attack',{target});
assert.strictEqual(projectiles.length,2,'Vạn Ảnh Xạ must fire once from every active Dư Ảnh');
assert.ok(projectiles.every(p=>p.meta.source==='afterimageEcho'&&p.meta.allowProcs===false),'Vạn Ảnh Xạ shots must use explicit no-proc source');
assert.ok(Math.abs(projectiles[0].damage-9)<1e-12,'Lv1 stored clone must use 45% current base attack damage');
assert.ok(Math.abs(projectiles[1].damage-11)<1e-12,'Lv2 stored clone must use 55% current base attack damage');

// 2) Trọng Lực Phù Trận: 36px pull happens before rune hit calculation.
hits.length=0;
const e1={x:60,y:0,r:10,hp:200,dead:false};
const e2={x:100,y:0,r:10,hp:200,dead:false};
state.enemies=[e1,e2];
state.v016A1.mines=[{x:0,y:0,level:1,armedAt:9,expiresAt:30,dead:false}];
context.update(.1);
assert.strictEqual(state.v016A1.mines.length,0,'Triggered gravity rune must be consumed');
assert.strictEqual(hits.length,2,'Pull must bring both enemies into the documented rune blast');
assert.ok(Math.abs(hits[0].x-24)<1e-9,'Enemy at 60px must be pulled inward by 36px before damage');
assert.ok(Math.abs(hits[1].x-64)<1e-9,'Enemy at 100px must be pulled inward by 36px before damage');
assert.ok(hits.every(h=>h.meta.source==='runeMine'),'Gravity pull must not add its own damage source');

// 3) Huyết Mạch Cộng Sinh: heal 10% of actual mirrored hit payload.
heals.length=0;player.hp=50;
context.emitSkillEvent('hit',{enemy:e1,damage:32,meta:{source:'bloodLink'}});
assert.ok(Math.abs(heals.at(-1).amount-3.2)<1e-12,'Blood symbiosis must heal exactly 10% of actual mirrored damage');
assert.strictEqual(heals.at(-1).meta.source,'bloodSymbiosis');

// 4) Linh Châu Dưỡng Mệnh: xpHeal contributes exactly twice actual restored HP.
state.v016A1.pearlCharge=0;state.v016A1.pearls=0;
context.emitSkillEvent('heal',{amount:3,meta:{source:'xpHeal'}});
assert.ok(Math.abs(state.v016A1.pearlCharge-6)<1e-12,'Linh Dưỡng heal must count x2 toward pearl charge');

heals.length=0;player.hp=50;
context.emitSkillEvent('hit',{enemy:e1,damage:10,meta:{source:'spiritPearl'}});
assert.ok(Math.abs(heals.at(-1).amount-.5)<1e-12,'Pearl hit must heal exactly 0.5 HP');
assert.strictEqual(heals.at(-1).meta.source,'nourishingPearls');

console.log('V0.16 Hợp Đạo B1 smoke: PASS');
