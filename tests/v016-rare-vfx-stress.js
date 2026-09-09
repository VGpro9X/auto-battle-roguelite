const fs=require('fs');
const vm=require('vm');
const assert=require('assert');

const ids=[
  'bribery','immortalBreath','heavenlyPunishment','fateExchange',
  'heavenlyMandate','divineJudgment','spatialSwap','equalPrice',
  'heavenlyWard','divineDomain','lifeRewind','causalInversion',
  'divineGift','timeStop','celestialEdict','heavenSeal',
  'bloodDebt','parasitePact','voidReality','scapegoatFate'
];
const events={};
const owned=new Set(ids);
const enemy={x:180,y:100,r:12,hp:100,maxHp:100,dead:false,elite:false};
const state={
  t:100,running:true,gameOver:false,enemies:[enemy],
  v016RareR2:{domainUntil:104,causalArmed:true},
  v016RareR3:{timeStopUntil:102},
  v016RareR4:{
    debts:[{remaining:20,rate:4}],parasiteTarget:enemy,parasiteUntil:104,
    voidStart:96,scapegoat:enemy
  }
};
const player={x:100,y:100,r:14,hp:100,maxHp:100,shield:20};
const DIVINE_SKILLS=Object.fromEntries(ids.map((id,i)=>[id,{id,tier:i%2?'mystic':'divine',name:id,preview:id}]));

const gradient={addColorStop:()=>{}};
const rawCtx={createRadialGradient:()=>gradient,measureText:()=>({width:10})};
const ctx=new Proxy(rawCtx,{
  get(target,prop){if(prop in target)return target[prop];return()=>{};},
  set(target,prop,value){target[prop]=value;return true;}
});

let basePreviewCalls=0,baseDrawCalls=0,baseGainXpCalls=0;
const context={
  console,Math,Set,Object,Array,Number,Boolean,Infinity,
  state,player,DIVINE_SKILLS,ctx,
  hasDivineSkill:id=>owned.has(id),
  localizeGameText:text=>text,
  clamp:(v,a,b)=>Math.max(a,Math.min(b,v)),
  drawPreviewActor:(g,x,y,r)=>{g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill();},
  drawGlowDot:(g,x,y,r)=>{g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill();},
  drawShieldVisual:(g,x,y,r)=>{g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.stroke();},
  drawLightningArc:(g,x1,y1,x2,y2)=>{g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();},
  drawCodexPreview:()=>{basePreviewCalls++;},
  gainXp:amount=>{baseGainXpCalls++;return amount;},
  draw:()=>{baseDrawCalls++;},
  resetSkillEngine:()=>{},
  onSkillEvent:(name,fn)=>{(events[name]||(events[name]=[])).push(fn);},
  emitSkillEvent:(name,payload={})=>{for(const fn of events[name]||[])fn(payload);}
};
vm.createContext(context);
vm.runInContext(fs.readFileSync('js/v016-rare-vfx.js','utf8'),context,{filename:'v016-rare-vfx.js'});

// Every rare must take its dedicated path rather than falling through to the base preview.
for(const id of ids){
  context.drawCodexPreview(ctx,DIVINE_SKILLS[id].tier,id,DIVINE_SKILLS[id],101.25,360,190);
}
assert.strictEqual(basePreviewCalls,0,'All 20 rare Codex entries must use dedicated preview paths');

// Non-rare preview still delegates normally.
context.drawCodexPreview(ctx,'skill','dummy',{tags:[]},1,360,190);
assert.strictEqual(basePreviewCalls,1,'Non-rare Codex entries must still delegate to the existing preview renderer');

// Exercise all new live trigger families with representative payloads.
const triggerPayloads={
  heavenlyMandate:{id:'heavenlyMandate'},
  divineJudgment:{id:'divineJudgment',enemy},
  spatialSwap:{id:'spatialSwap',from:{x:70,y:100},to:{x:150,y:100},enemy},
  equalPrice:{id:'equalPrice'},
  heavenlyWard:{id:'heavenlyWard'},
  divineDomain:{id:'divineDomain'},
  lifeRewind:{id:'lifeRewind'},
  causalInversion:{id:'causalInversion',consumed:true},
  divineGift:{id:'divineGift'},
  timeStop:{id:'timeStop'},
  celestialEdict:{id:'celestialEdict',targets:[{enemy,loss:18}]},
  heavenSeal:{id:'heavenSeal',enemy},
  parasitePact:{id:'parasitePact',enemy},
  scapegoatFate:{id:'scapegoatFate',enemy}
};
for(const payload of Object.values(triggerPayloads))context.emitSkillEvent('divine_trigger',payload);
context.emitSkillEvent('damage_taken',{amount:2,meta:{source:'bloodDebt'}});
context.gainXp(5); // full HP + Đồng Giá owned => observed visual without mechanic mutation
assert.strictEqual(baseGainXpCalls,1,'Rare VFX XP observer must delegate exactly once to gameplay XP logic');

// Repeated draw frames with all persistent states active should not throw or grow effects forever.
for(let frame=0;frame<360;frame++){
  state.t=100+frame/60;
  context.draw();
}
assert.strictEqual(baseDrawCalls,360,'Rare VFX layer must delegate every draw frame exactly once');
assert.ok(state.v016RareVfx.bursts.length<4,'Transient rare VFX must be pruned after their lifetime during stress frames');

context.resetSkillEngine();
assert.strictEqual(state.v016RareVfx.bursts.length,0,'Rare VFX reset must clear transient effects');

console.log('V0.16 rare VFX stress: PASS · 20 dedicated previews + live/persistent paths');
