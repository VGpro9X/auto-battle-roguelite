const fs=require('fs');
const vm=require('vm');
const assert=require('assert');

const divineSource=fs.readFileSync('js/divine-skills.js','utf8');
const runSystemsSource=fs.readFileSync('js/v016-run-systems.js','utf8');

const events={};
const context={
  console,
  Math,
  Set,
  Object,
  Array,
  Number,
  Boolean,
  Infinity,
  state:{t:0,enemies:[],running:true,paused:false,gameOver:false},
  player:{level:1,hp:100,maxHp:100},
  skillRuntime:{divineSkills:new Set(),divineTimers:{},counters:{},listeners:{}},
  clamp:(v,a,b)=>Math.max(a,Math.min(b,v)),
  dist:(a,b)=>Math.hypot((a.x||0)-(b.x||0),(a.y||0)-(b.y||0)),
  randomEnemy:()=>null,
  hitEnemy:()=>true,
  damagePlayer:()=>0,
  runSkillEngine:()=>{},
  resetSkillEngine:()=>{},
  getRunProgress:()=>0,
  onSkillEvent:(name,fn)=>{(events[name]||(events[name]=[])).push(fn);},
  emitSkillEvent:()=>{},
  getNearestEnemies:()=>[],
  getNearestEnemiesFrom:()=>[],
  findNearestEnemyFrom:()=>null,
  getRandomEnemies:()=>[],
  nearestEnemy:()=>[null,Infinity],
  getEnemyDangerAt:()=>({danger:0,nearest:Infinity,closeCount:0}),
  getLocalThreat:()=>({nearest:Infinity,close80:0,close125:0,centroid:null})
};
context.global=context;
vm.createContext(context);
vm.runInContext(divineSource,context,{filename:'divine-skills.js'});

assert.strictEqual(context.getDivineOfferChance(7),0,'rare chance must be 0 before level 8');
assert.ok(Math.abs(context.getDivineOfferChance(8)-0.01)<1e-12,'level 8 must be 1%');
assert.ok(Math.abs(context.getDivineOfferChance(20)-0.052)<1e-12,'level 20 must be 5.2%');
assert.ok(Math.abs(context.getDivineOfferChance(30)-0.087)<1e-12,'level 30 must be 8.7%');
assert.ok(Math.abs(context.getDivineOfferChance(40)-0.12)<1e-12,'level 40 must hit 12% cap');
assert.ok(Math.abs(context.getDivineOfferChance(80)-0.12)<1e-12,'rare chance must stay capped at 12%');

assert.strictEqual(context.grantDivineSkill('bribery'),true,'first rare should grant');
assert.strictEqual(context.grantDivineSkill('heavenlyPunishment'),true,'a different second rare should also grant');
assert.strictEqual(context.getOwnedDivineCount(),2,'multiple distinct rares must coexist');
assert.strictEqual(context.grantDivineSkill('bribery'),false,'duplicate rare must not grant');
context.player.level=20;
assert.strictEqual(context.canOfferDivineSkill(),true,'more unowned rares should remain offerable after owning two');

for(const glyph of ['🪡','🪙','🪢','🪃','🪵','🪞','🪽']){
  assert.ok(runSystemsSource.includes(`[\"${glyph}\"`),`missing compatibility mapping for ${glyph}`);
}
assert.ok(runSystemsSource.includes('rerollButton.id="rerollChoicesButton"'),'reroll button must exist');
assert.ok(runSystemsSource.includes('rerollUsed=true'),'reroll must consume its one allowance');
assert.ok(runSystemsSource.includes('baseShowLevelUp(currentStarter)'),'reroll must rerender without refreshing allowance');
assert.ok(runSystemsSource.includes('Cơ hội xuất hiện Thần Kỹ/Thần Bí Kỹ'),'level-up UI must disclose rare chance');

console.log('V0.16 rare/reroll smoke: PASS');
