const fs=require('fs');
const vm=require('vm');
const assert=require('assert');

const events={};
const timers=[];
const randomQueue=[];
const math=Object.create(Math);
math.random=()=>randomQueue.length?randomQueue.shift():0;

function makeClassList(){
  const set=new Set();
  return{
    add:(...names)=>names.forEach(n=>set.add(n)),
    remove:(...names)=>names.forEach(n=>set.delete(n)),
    contains:name=>set.has(name),
    toggle:(name,force)=>{const on=force===undefined?!set.has(name):Boolean(force);on?set.add(name):set.delete(name);return on;}
  };
}

const elements=new Map();
function makeElement(tag='div',id=''){
  const element={
    tagName:String(tag).toUpperCase(),id,type:'',className:'',textContent:'',style:{},children:[],handlers:{},classList:makeClassList(),
    appendChild(child){this.children.push(child);if(child.id)elements.set(child.id,child);return child;},
    append(...children){children.forEach(child=>this.appendChild(child));},
    addEventListener(name,fn){this.handlers[name]=fn;},
    click(){this.handlers.click?.();},
    setAttribute(){},
    insertAdjacentElement(){},
    set innerHTML(value){
      this._innerHTML=String(value);
      for(const match of this._innerHTML.matchAll(/id="([^"]+)"/g)){
        const child=makeElement('div',match[1]);
        this.children.push(child);
        elements.set(child.id,child);
      }
    },
    get innerHTML(){return this._innerHTML||'';}
  };
  if(id)elements.set(id,element);
  return element;
}

const gameWrap=makeElement('div','gameWrap');
const head=makeElement('head','head');
const document={
  head,
  createElement:tag=>makeElement(tag),
  getElementById:id=>elements.get(id)||null,
  querySelector:()=>null
};

const owned={};
const skills={pulse:{name:'Pulse',icon:'*',max:5,tags:['PERIODIC'],apply:()=>{}}};
const state={t:0,running:false,paused:true,gameOver:false,enemies:[],mode:null};
const player={x:0,y:0,r:16,level:1,hp:100,maxHp:100,shield:0,xpMultiplier:1,dodgeChance:0,invulnerableUntil:0,reviveCharges:0};
const skillRuntime={divineSkills:new Set(),divineTimers:{},counters:{},cooldowns:{},listeners:{}};
const MODES={normal:{id:'normal',label:'NORMAL',starterPicks:1,endless:false},endless:{id:'endless',label:'VÔ HẠN',starterPicks:1,endless:true}};
let baseStartCalls=0;
const starterCalls=[];

const context={
  console,Math:math,Set,Object,Array,Number,Boolean,Infinity,document,
  state,player,owned,skills,SYNERGIES:{},EVOLUTIONS:{},skillRuntime,MODES,
  setTimeout:(fn,ms)=>{timers.push({fn,ms});return timers.length;},
  clearTimeout:()=>{},
  clamp:(v,a,b)=>Math.max(a,Math.min(b,v)),
  dist:(a,b)=>Math.hypot((a.x||0)-(b.x||0),(a.y||0)-(b.y||0)),
  skillLevel:key=>owned[key]||0,
  getSkillChoices:()=>['pulse'],
  getOutgoingDamageMultiplier:()=>1,
  getIncomingDamageMultiplier:()=>1,
  getEffectiveMoveSpeed:()=>100,
  hitEnemy:(enemy,damage)=>{enemy.hp-=damage;return enemy.hp<=0;},
  damagePlayer:()=>0,gainXp:amount=>amount,addShield:amount=>amount,healPlayer:amount=>amount,
  spawnEnemy:()=>{},update:()=>{},runSkillEngine:()=>{},
  resetSkillEngine:()=>{skillRuntime.counters={};skillRuntime.cooldowns={};},
  evaluateBuildUnlocks:()=>{},onSkillSelectedEngine:()=>{},finishRun:()=>{},
  onSkillEvent:(name,fn)=>{(events[name]||(events[name]=[])).push(fn);},
  emitSkillEvent:(name,payload={})=>{for(const fn of events[name]||[])fn(payload);},
  nearestEnemy:()=>[null,Infinity],getNearestEnemies:()=>[],getNearestEnemiesFrom:()=>[],findNearestEnemyFrom:()=>null,getRandomEnemies:()=>[],randomEnemy:()=>null,
  getEnemyDangerAt:()=>({danger:0,nearest:Infinity,closeCount:0}),getLocalThreat:()=>({nearest:Infinity,close80:0,close125:0,centroid:null}),
  startRun:modeId=>{baseStartCalls++;state.mode=MODES[modeId]||null;},
  resetRunState:()=>{state.t=0;state.running=true;state.paused=true;state.gameOver=false;context.resetSkillEngine();},
  hideAllOverlays:()=>{},setGameUiVisible:()=>{},updateHud:()=>{},refreshSkillBar:()=>{},refreshBuildTracker:()=>{},
  showLevelUp:isStarter=>starterCalls.push(Boolean(isStarter)),
  localizeGameText:text=>text
};
context.global=context;
vm.createContext(context);
for(const file of ['js/divine-skills.js','js/v016-run-systems.js','js/v016-rares-r3.js','js/v016-rares-r4.js','js/v016-endless-starting-rare.js']){
  vm.runInContext(fs.readFileSync(file,'utf8'),context,{filename:file});
}

const rareIds=vm.runInContext('Object.keys(DIVINE_SKILLS)',context);
assert.strictEqual(rareIds.length,20,'Endless starting pool must use the full 20-rare registry');
assert.strictEqual(context.state.v016EndlessRare.getStartingRareCandidates().length,20,'Fresh run must expose all 20 rares as eligible starting candidates');

// Non-Endless must remain on the existing startRun path and grant no automatic rare.
context.startRun('normal');
assert.strictEqual(baseStartCalls,1,'Non-Endless modes must delegate to the existing startRun implementation');
assert.strictEqual(context.getOwnedDivineCount(),0,'Non-Endless modes must not receive a guaranteed starting rare');

// Every equal-width random interval must map to exactly one of the 20 candidates.
const selected=[];
for(let i=0;i<rareIds.length;i++){
  randomQueue.push((i+.5)/rareIds.length);
  timers.length=0;
  context.startRun('endless');
  selected.push(state.v016EndlessRare.startingRareId);
  assert.strictEqual(context.getOwnedDivineCount(),1,'Each Endless start must grant exactly one rare before starter selection');
}
assert.deepStrictEqual(selected,rareIds,'Uniform index mapping must cover each rare exactly once across the 20 equal probability intervals');

// Verify the dedicated reveal occurs before exactly one normal starter screen.
randomQueue.push(.31);
timers.length=0;starterCalls.length=0;
context.startRun('endless');
const startingId=state.v016EndlessRare.startingRareId;
assert.ok(startingId&&context.hasDivineSkill(startingId),'The chosen starting rare must already be owned before reveal');
assert.strictEqual(state.starterSelectionsRemaining,1,'Endless must retain exactly one normal starter pick');
assert.strictEqual(starterCalls.length,0,'Starter selection must not open before the rare reveal');
assert.deepStrictEqual(timers.map(t=>t.ms),[120],'Endless start must schedule the dedicated rare reveal first');

timers.shift().fn();
assert.strictEqual(state.v016EndlessRare.revealActive,true,'Rare reveal must become active before starter selection');
assert.ok(document.getElementById('endlessRareReveal').classList.contains('visible'),'Dedicated rare overlay must be visible');
assert.strictEqual(document.getElementById('endlessRareName').textContent,vm.runInContext(`DIVINE_SKILLS[${JSON.stringify(startingId)}].name`,context),'Reveal must show the exact granted rare name');
assert.strictEqual(starterCalls.length,0,'Opening the reveal must still not open starter selection');

document.getElementById('endlessRareContinue').click();
assert.strictEqual(state.v016EndlessRare.revealActive,false,'Acknowledgement must close the dedicated reveal');
assert.deepStrictEqual(timers.map(t=>t.ms),[60],'Acknowledgement must schedule the normal starter screen exactly once');
timers.shift().fn();
assert.deepStrictEqual(starterCalls,[true],'Acknowledgement must lead to exactly one normal starter Kỹ Năng screen');

// Starting rare is excluded only as an owned duplicate; the other 19 remain eligible later.
const availableAfterStart=vm.runInContext('getAvailableDivineSkillIds()',context);
assert.strictEqual(availableAfterStart.length,19,'After the guaranteed rare, exactly 19 other rares must remain offerable');
assert.ok(!availableAfterStart.includes(startingId),'The already-owned starting rare must be excluded from future offers');
player.level=40;
randomQueue.push(0,.5); // pass the 12% chance roll, then select uniformly from the remaining pool
const laterOffer=context.rollDivineOffer();
assert.ok(laterOffer&&laterOffer!==startingId,'Later normal rare rolls must remain enabled and cannot duplicate the starting rare');

console.log('V0.16 Endless starting rare smoke: PASS');
