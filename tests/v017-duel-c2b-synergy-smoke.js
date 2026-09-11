const fs=require('fs');
const vm=require('vm');
const assert=require('assert');
function load(path){vm.runInThisContext(fs.readFileSync(path,'utf8'),{filename:path});}
function approx(a,b,e=1e-5){assert.ok(Math.abs(a-b)<=e,`expected ${a} ≈ ${b}`);}
function entry(id,build){return{id,name:id,build:{...build}};}
function duel(a,b={},rng=()=>.99){const match=createDuelMatch(entry('player',a),entry('opponent',b),{rng});const round=startDuelRound(match);return{match,round,p:round.fighters.player,o:round.fighters.opponent};}
for(const file of ['duel-skills','duel-engine','duel-skills-d6a','duel-skills-d6b','duel-skills-d6c','duel-skills-d6d','duel-skills-d6e','duel-skills-d6f','duel-skills-d6g','duel-synergies','duel-synergies-c2a','duel-synergies-c2b'])load(`js/${file}.js`);

const c2b=['thermalShock','bloodConductor','arcCollector','explosiveBlades','toxicFlame','stormVolley','timeLoop','plagueLightning'];
assert.deepStrictEqual(DUEL_C2B_SYNERGY_IDS,c2b);
assert.strictEqual(Object.keys(DUEL_SYNERGY_CATALOG).length,28);
assert.strictEqual(Object.keys(DUEL_SYNERGY_ADAPTERS).length,16,'C2B must finish at exactly 16/28 implemented Hợp Đạo');
for(const id of c2b){const meta=getDuelSynergy(id);assert.strictEqual(meta.implemented,true,id);assert.ok(meta.desc.length>70,`${id} description too vague`);}
assert.strictEqual(getDuelSynergy('combustionChain').implemented,false,'C2C+ Hợp Đạo must remain unavailable');

// Sốc Nhiệt: a real Fire projectile inside Hàn Khí can create the advertised Area burst.
{
  const {match,p,o,round}=duel({fire:1,frost:1},{},()=>0);
  p.x=300;o.x=430;o.hitStun=10;p.skillTimers.fire=0;
  for(let i=0;i<12&&o.hp===100;i++){updateDuelRound(match,.033);if(i===0)p.hitStun=10;}
  approx(o.hp,72);
  assert.ok(round.events.some(e=>e.type==='area'&&e.skill==='thermalShock'));
}

// Huyết Dẫn Lôi charges only from actual healing tracked by the engine.
{
  const {match,p,o}=duel({blood:1,lightning:1});
  p.hp=80;p.stats.regen=8/.033;p.hitStun=10;o.hitStun=10;
  updateDuelRound(match,.033);
  approx(p.totalHealing,8);approx(o.hp,90);
}

// Thu Lôi requires two successful Linh Hấp pulls; out-of-band fake charge is not used.
{
  const {match,p,o}=duel({magnet:1,lightning:1});
  p.x=300;o.x=500;p.hitStun=10;o.hitStun=10;p.skillTimers.magnet=0;
  updateDuelRound(match,.033);approx(o.hp,100);
  p.skillTimers.magnet=0;
  updateDuelRound(match,.033);approx(o.hp,88);
}

// Bạo Kiếm procs from a real Orbit hit and cannot require a fake projectile.
{
  const {match,p,o,round}=duel({orbit:1,explosive:1},{},()=>0);
  p.x=400;o.x=490;o.hitStun=10;p.skillTimers.orbitHit=0;
  updateDuelRound(match,.033);
  approx(o.hp,86);
  assert.ok(round.events.some(e=>e.type==='area'&&e.skill==='explosiveBlades'));
}

// Độc Hỏa needs both owned Poison and Burn states simultaneously for a full second.
{
  const {match,p,o,round}=duel({poison:1,burn:1});
  p.hitStun=10;o.hitStun=10;
  o.duelEffects.poison={source:'player',until:10,dps:1.5,tick:100};
  o.statuses.burnUntil=10;o.statuses.burnSource='player';o.statuses.burnDps=1;o.statuses.burnTickTimer=100;
  for(let i=0;i<31;i++)updateDuelRound(match,.033);
  approx(o.hp,93);
  assert.ok(round.events.some(e=>e.type==='area'&&e.skill==='toxicFlame'));
}

// Lôi Tiễn is a proc on an actual Multishot projectile hit.
{
  const {match,p,o,round}=duel({multishot:1,lightning:1},{},()=>0);
  p.x=400;o.x=460;o.hitStun=10;
  for(let i=0;i<8;i++){updateDuelRound(match,.033);if(i===0)p.hitStun=10;}
  assert.ok(round.events.some(e=>e.type==='cast'&&e.skill==='stormVolley'));
}

// Vòng Lặp gets a second, explicit chance only when base Dội Thời Gian did not echo a restarted timer.
{
  const rolls=[.9,.1];let n=0;
  const {match,p,o,round}=duel({timeEcho:3,overclock:1,fire:1},{},()=>rolls[Math.min(n++,rolls.length-1)]);
  p.x=100;o.x=900;p.hitStun=10;o.hitStun=10;
  p.duelEffects.timeEchoPrev.fire=0;p.duelSynergyEffects.timeLoopPrev.fire=0;p.skillTimers.fire=3;
  updateDuelRound(match,.033);
  assert.ok(round.events.some(e=>e.type==='status'&&e.status==='timeLoop'&&e.skill==='fire'));
  assert.ok(p.skillTimers.fire<=0);
}

// Lôi Độc is an additional deterministic cadence while own Poison remains active.
{
  const {match,p,o,round}=duel({conductiveVenom:1,lightning:1,poison:1});
  p.hitStun=10;o.hitStun=10;
  o.duelEffects.poison={source:'player',until:10,dps:1.5,tick:100};
  for(let i=0;i<46;i++)updateDuelRound(match,.033);
  approx(o.hp,92);
  assert.ok(round.events.some(e=>e.type==='cast'&&e.skill==='plagueLightning'));
}

const index=fs.readFileSync('index.html','utf8');
assert.ok(index.indexOf('duel-synergies-c2a.js')<index.indexOf('duel-synergies-c2b.js'));
assert.ok(index.indexOf('duel-synergies-c2b.js')<index.indexOf('duel-ui.js'));
console.log('V0.17 C2B 16-Hợp-Đạo Duel smoke: PASS');