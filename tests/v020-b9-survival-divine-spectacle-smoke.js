const fs=require('fs'),vm=require('vm');
function assert(v,m){if(!v)throw new Error(m);}
const source=fs.readFileSync('js/v020-survival-divine-vfx.js','utf8');
const handlers={};
const noop=()=>{};
const ctx={save:noop,restore:noop,translate:noop,beginPath:noop,closePath:noop,moveTo:noop,lineTo:noop,stroke:noop,fill:noop,arc:noop,set globalCompositeOperation(v){},set strokeStyle(v){},set fillStyle(v){},set lineWidth(v){},set globalAlpha(v){}};
const root={
  state:{t:10},player:{x:100,y:80},ctx,
  location:{search:'?visualQuality=low'},
  matchMedia:()=>({matches:true}),
  draw(){},
  onSkillEvent(name,fn){(handlers[name]||(handlers[name]=[])).push(fn);},
  getOwnedDivineSkillIds:()=>['timeStop','voidReality','heavenlyPunishment']
};
root.window=root;root.globalThis=root;vm.createContext(root);vm.runInContext(source,root);
const ids=root.SURVIVAL_HIGH_TIER_IDS_V020;
assert(Array.isArray(ids)&&ids.length===20,'expected 20 Survival high-tier IDs');
assert(new Set(ids).size===20,'Survival high-tier IDs must be unique');
const signatures=ids.map(id=>root.getSurvivalHighTierSignatureV020(id));
assert(signatures.every(Boolean),'missing high-tier signature');
assert(signatures.filter(s=>s.tier==='divine').length===10,'expected 10 Thần Kỹ');
assert(signatures.filter(s=>s.tier==='mystic').length===10,'expected 10 Thần Bí Kỹ');
assert(new Set(signatures.map(s=>JSON.stringify(s))).size===20,'signatures must be distinct');
for(const id of ids)assert(JSON.stringify(root.getSurvivalHighTierSignatureV020(id))===JSON.stringify(root.getSurvivalHighTierSignatureV020(id)),'signature must be deterministic: '+id);
const status0=root.getSurvivalHighTierVfxStatusV020();
assert(status0.quality==='low'&&status0.limit===12&&status0.ownedLimit===2,'LOW budget changed');
assert(status0.reducedMotion===true,'reduced motion detection failed');
for(let i=0;i<30;i++){root.state.t+=.07;for(const fn of handlers.divine_trigger||[])fn({id:ids[i%ids.length]});}
const status1=root.getSurvivalHighTierVfxStatusV020();
assert(status1.active===12,'LOW active transient cap failed');
assert(status1.dropped===18,'LOW dropped transient count failed');
root.draw();
const status2=root.getSurvivalHighTierVfxStatusV020();
assert(status2.draws>0,'spectacle draw path did not execute');
for(const forbidden of ['player.hp=','player.hp-=','enemy.hp=','enemy.hp-=','hitEnemy(','damagePlayer(','grantDivineSkill(','Math.random('])assert(!source.includes(forbidden),'presentation layer owns gameplay truth: '+forbidden);
console.log('v020-b9-survival-divine-spectacle-smoke: ok');
