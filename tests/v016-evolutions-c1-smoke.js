const fs=require('fs');
const vm=require('vm');
const assert=require('assert');

const events={};
const evolutionsOwned=new Set(['phantomLegion','heavenNet','bloodWeb','starfallCataclysm']);
const synergiesOwned=new Set(['afterimageEcho','gravityRune','bloodSymbiosis','heavenfallBurn']);
const levels={afterimage:5,runeMine:5,bloodLink:5,meteorSeal:5};
const projectileLog=[];
const hitLog=[];
const areaLog=[];
const healLog=[];
const burnLog=[];

const state={
  t:0,running:true,paused:false,gameOver:false,enemies:[],
  v016A1:{afterimages:[],mines:[],bloodLink:null,transient:[]},
  v016B1:{transient:[]},
  v016A2:{meteors:[],transient:[]}
};
const player={x:0,y:0,damage:20,areaMultiplier:1,hp:50,maxHp:100};
const skills={
  afterimage:{periodic:{execute:()=>true}},
  runeMine:{periodic:{execute:()=>true}},
  bloodLink:{periodic:{execute:()=>true}},
  meteorSeal:{periodic:{execute:()=>true}}
};
const SYNERGIES={
  bloodSymbiosis:{desc:'base blood symbiosis'},
  heavenfallBurn:{desc:'base heavenfall'}
};
const EVOLUTIONS={};

const context={
  console,Math,Set,Object,Array,Number,Boolean,Infinity,
  state,player,skills,SYNERGIES,EVOLUTIONS,skillRuntime:{},
  clamp:(v,a,b)=>Math.max(a,Math.min(b,v)),
  hasEvolution:id=>evolutionsOwned.has(id),
  hasSynergy:id=>synergiesOwned.has(id),
  skillLevel:key=>levels[key]||0,
  isEnemyHostile:enemy=>!enemy.dead,
  randomEnemy:()=>state.enemies.find(e=>!e.dead)||null,
  getOutgoingDamageMultiplier:()=>1,
  createProjectileFrom:(x,y,target,damage,speed,radius,type,pierce,meta)=>{projectileLog.push({x,y,target,damage,speed,radius,type,pierce,meta});return projectileLog.at(-1);},
  hitEnemy:(enemy,damage,knockback=0,meta={})=>{hitLog.push({enemy,damage,knockback,meta});enemy.hp-=damage;if(enemy.hp<=0)enemy.dead=true;context.emitSkillEvent('hit',{enemy,damage,meta,killed:enemy.dead});return enemy.dead;},
  healPlayer:(amount,meta={})=>{healLog.push({amount,meta});const before=player.hp;player.hp=Math.min(player.maxHp,player.hp+amount);return player.hp-before;},
  applyBurn:(enemy,dps,duration)=>{burnLog.push({enemy,dps,duration});enemy.statuses=enemy.statuses||{};enemy.statuses.burn={dps,until:state.t+duration};},
  damageAreaAt:(x,y,radius,damage,meta={},knockback=0)=>{areaLog.push({x,y,radius,damage,meta,knockback});return 1;},
  onSkillEvent:(name,fn)=>{(events[name]||(events[name]=[])).push(fn);},
  emitSkillEvent:(name,payload)=>{for(const fn of events[name]||[])fn(payload);},
  resetSkillEngine:()=>{},
  update:dt=>{state.t+=dt;},
  draw:()=>{},drawCodexPreview:()=>{},
  v12PreviewFrame:()=>{},v12Actor:()=>{},v12Enemy:()=>{},v12Ring:()=>{},v12Line:()=>{},drawAreaPulse:()=>{},drawGlowDot:()=>{},
  ctx:{save:()=>{},restore:()=>{},beginPath:()=>{},arc:()=>{},stroke:()=>{},fill:()=>{},moveTo:()=>{},lineTo:()=>{},set strokeStyle(v){},set fillStyle(v){},set lineWidth(v){},set globalAlpha(v){}}
};
vm.createContext(context);
vm.runInContext(fs.readFileSync('js/v016-evolutions-c1.js','utf8'),context,{filename:'v016-evolutions-c1.js'});
vm.runInContext(fs.readFileSync('js/v016-evolutions-c1-compat.js','utf8'),context,{filename:'v016-evolutions-c1-compat.js'});

assert.strictEqual(Object.keys(EVOLUTIONS).length,4,'C1 must register exactly four Siêu Cấp in isolated context');

// 1) Vạn Ảnh Phân Thân: 3 clones × 2 shots, each 70% of current Dư Ảnh shot.
state.t=0;state.enemies=[{x:100,y:0,r:10,hp:999,dead:false}];
assert.strictEqual(skills.afterimage.periodic.execute(5),true);
assert.strictEqual(state.v016A1.afterimages.length,3,'Vạn Ảnh Phân Thân must create exactly three active Dư Ảnh actors');
assert.ok(state.v016A1.afterimages.every(c=>c.shots.length===0&&c.evoShots.length===2),'Evolution clones must suppress ordinary A1 shots and own exactly two evolved shots');
context.update(.12);
context.update(.35);
assert.strictEqual(projectileLog.filter(p=>p.meta.source==='phantomLegion').length,6,'Three evolved clones must fire exactly two normal evolved shots each');
const expectedPhantom=20*.85*.70;
assert.ok(projectileLog.filter(p=>p.meta.source==='phantomLegion').every(p=>Math.abs(p.damage-expectedPhantom)<1e-12),'Each phantom shot must deal exactly 70% of current Lv5 Dư Ảnh shot damage');

// 2) Thiên La Địa Võng: cap 8 and chain after .12 at 75% damage. Also normalize a pre-evolution mine.
state.t=10;state.enemies=[];state.v016A1.mines=[];
for(let i=0;i<9;i++){player.x=i*10;skills.runeMine.periodic.execute(5);}
assert.strictEqual(state.v016A1.mines.length,8,'Heaven Net active mine cap must be exactly 8');

const oldMine={x:0,y:0,level:5,createdAt:9,armedAt:9,expiresAt:30,dead:false};
// 110px stays inside the 120px chain radius but outside this Lv5 rune's natural
// 75px trigger radius + 10px enemy radius, so the test isolates the 0.12s chain path.
state.v016A1.mines=[oldMine,{x:110,y:0,level:5,createdAt:9.1,armedAt:9,expiresAt:30,dead:false,heavenNet:true,chainAt:null,chainScale:1}];
context.emitSkillEvent('build_unlock',{kind:'evolution',item:{id:'heavenNet'}});
assert.strictEqual(oldMine.chainAt,null,'Pre-evolution mine must be normalized into the chain system');
const triggerEnemy={x:20,y:0,r:10,hp:1000,dead:false};state.enemies=[triggerEnemy];hitLog.length=0;
context.update(.01);
assert.strictEqual(oldMine.dead,true,'Triggered primary net mine must detonate');
const neighbour=state.v016A1.mines.find(m=>!m.dead);
assert.ok(neighbour&&neighbour.chainAt!==null,'Armed neighbour within 120px must be scheduled for chain detonation');
context.update(.12);
const chainHits=hitLog.filter(h=>h.meta.source==='heavenNet');
assert.ok(chainHits.length>=1,'Chained mine must damage an enemy after the 0.12s delay');
assert.ok(chainHits.every(h=>Math.abs(h.damage-(68*.75))<1e-12),'Lv5 chained rune damage must be exactly 75% of normal 68 damage');

// 3) Huyết Võng: 4 targets, 5s, copy 25% to every other target, no recursion; Blood Symbiosis heals each copy.
state.t=20;player.x=0;player.y=0;player.hp=50;hitLog.length=0;healLog.length=0;
const webTargets=[1,2,3,4].map(i=>({x:i*20,y:0,r:10,hp:200,dead:false}));state.enemies=webTargets;
assert.strictEqual(skills.bloodLink.periodic.execute(5),true,'Huyết Võng should form with four valid targets');
assert.strictEqual(state.v016C1.bloodWeb.targets.length,4);
assert.ok(Math.abs(state.v016C1.bloodWeb.until-25)<1e-12,'Huyết Võng duration must be exactly 5s');
context.emitSkillEvent('hit',{enemy:webTargets[0],damage:40,meta:{source:'normal'},killed:false});
const webCopies=hitLog.filter(h=>h.meta.source==='bloodWeb');
assert.strictEqual(webCopies.length,3,'One web target hit must copy damage to the other three living targets');
assert.ok(webCopies.every(h=>Math.abs(h.damage-10)<1e-12&&h.meta.allowProcs===false),'Each copy must be exactly 25% and non-recursive');
assert.ok(Math.abs(healLog.filter(h=>h.meta.source==='bloodSymbiosis').reduce((s,h)=>s+h.amount,0)-3)<1e-12,'Huyết Mạch Cộng Sinh must heal 10% for each of the three 10-damage web copies');

// 4) Tinh Hà Trụy Lạc: 3 meteors, .18 spacing, 38px side offsets, 100/70/70 damage, all retain burn.
state.t=30;hitLog.length=0;burnLog.length=0;areaLog.length=0;
const starTarget={x:100,y:0,r:10,hp:2000,dead:false,statuses:{burn:{dps:1,until:40}}};state.enemies=[starTarget];player.x=0;player.y=0;
assert.strictEqual(skills.meteorSeal.periodic.execute(5),true);
assert.strictEqual(state.v016C1.starMeteors.length,3);
const [m1,m2,m3]=state.v016C1.starMeteors;
assert.ok(Math.abs((m2.impactAt-m1.impactAt)-.18)<1e-12&&Math.abs((m3.impactAt-m2.impactAt)-.18)<1e-12,'Meteor impacts must be spaced by exactly .18s');
assert.ok(Math.abs(Math.hypot(m2.x-m1.x,m2.y-m1.y)-38)<1e-9&&Math.abs(Math.hypot(m3.x-m1.x,m3.y-m1.y)-38)<1e-9,'Second and third meteor centers must be offset exactly 38px from the first');
context.update(.8);context.update(.18);context.update(.18);
const starHits=hitLog.filter(h=>h.meta.source==='starfallCataclysm');
assert.strictEqual(starHits.length,3,'Each of the three meteor impacts must hit the selected target in this test geometry');
assert.ok(Math.abs(starHits[0].damage-78)<1e-12,'First Lv5 meteor must deal normal 78 base damage');
assert.ok(Math.abs(starHits[1].damage-54.6)<1e-12&&Math.abs(starHits[2].damage-54.6)<1e-12,'Second/third meteors must deal exactly 70% of first damage');
assert.strictEqual(burnLog.length,3,'All three evolved meteors must preserve Tinh Vẫn burn');

console.log('V0.16 Siêu Cấp C1 smoke: PASS');
