const fs=require('fs');
const vm=require('vm');
const assert=require('assert');
function load(path){vm.runInThisContext(fs.readFileSync(path,'utf8'),{filename:path});}
function approx(a,b,e=1e-5){assert.ok(Math.abs(a-b)<=e,`expected ${a} ≈ ${b}`);}
function entry(id,build){return{id,name:id,build:{...build}};}
function duel(a,b={},rng=()=>.99){const match=createDuelMatch(entry('player',a),entry('opponent',b),{rng});const round=startDuelRound(match);return{match,round,p:round.fighters.player,o:round.fighters.opponent};}
for(const file of ['duel-skills','duel-engine','duel-skills-d6a','duel-skills-d6b','duel-skills-d6c','duel-skills-d6d','duel-skills-d6e','duel-skills-d6f','duel-skills-d6g','duel-synergies','duel-synergies-c2a','duel-synergies-c2b','duel-synergies-c2c'])load(`js/${file}.js`);

const c2c=['combustionChain','echoBarrage','gravityNova','elementalChaos','afterimageEcho','gravityRune'];
assert.deepStrictEqual(DUEL_C2C_SYNERGY_IDS,c2c);
assert.strictEqual(Object.keys(DUEL_SYNERGY_CATALOG).length,28);
assert.strictEqual(Object.keys(DUEL_SYNERGY_ADAPTERS).length,22,'C2C must finish at exactly 22/28 implemented Hợp Đạo');
for(const id of c2c){const meta=getDuelSynergy(id);assert.strictEqual(meta.implemented,true,id);assert.ok(meta.desc.length>80,`${id} description too vague`);}
assert.strictEqual(getDuelSynergy('bloodSymbiosis').implemented,false,'C2D Hợp Đạo must remain unavailable');

// Liên Hoàn Hỏa Táng: a newly crossed Thi Bạo threshold while own Burn is active adds exactly 50% CorpseBurst damage.
{
  const {match,p,o,round}=duel({combustion:1,corpseBurst:1});
  p.x=400;o.x=460;o.hp=60;o.hitStun=10;
  o.statuses.burnUntil=10;o.statuses.burnSource='player';o.statuses.burnDps=1;o.statuses.burnTickTimer=100;
  updateDuelRound(match,.033);
  approx(o.hp,24); // 12 basic + 16 corpse burst + 8 combustion-chain burst.
  assert.ok(round.events.some(e=>e.type==='area'&&e.skill==='combustionChain'));
}

// Vạn Ảnh Tiễn: when the real EchoShot counter completes, rank-II Multishot creates exactly 2 extra echo-barrage projectiles.
{
  const {match,p,o,round}=duel({echoShot:1,multishot:2});
  p.x=400;o.x=470;o.hitStun=10;p.duelEffects.echoShotHits=4;
  updateDuelRound(match,.033);
  const spawned=round.events.filter(e=>e.type==='projectile_spawn').map(e=>e.source);
  assert.strictEqual(spawned.filter(x=>x==='echoShot').length,1);
  assert.strictEqual(spawned.filter(x=>x==='multishot').length,2);
  assert.strictEqual(spawned.filter(x=>x==='echoBarrage').length,2);
  assert.strictEqual(p.duelEffects.echoShotHits,0);
}

// Trọng Lực Bạo: rank-I Black Hole pulls 55px during Nova, then Nova's normal 25px push still applies => net 30px toward caster.
{
  const {match,p,o,round}=duel({blackHole:1,nova:1});
  p.x=400;o.x=520;o.hitStun=10;p.skillTimers.nova=0;
  updateDuelRound(match,.033);
  approx(o.x,490);
  approx(o.hp,85);
  assert.ok(round.events.some(e=>e.type==='status'&&e.status==='gravityNova'));
}

// Ngũ Hành Hỗn Mang: deterministic Fire roll gives base Chaos Fire plus one reduced extra Fire variant; both receive Ngũ Hành.
{
  const {match,p,o,round}=duel({chaosOrb:1,elementalMastery:1},{},()=>0);
  p.x=300;o.x=500;o.hitStun=10;p.skillTimers.chaosOrb=0;
  updateDuelRound(match,.033);
  approx(o.hp,100-(24*1.08+12*1.08));
  assert.ok(round.events.some(e=>e.type==='cast'&&e.skill==='elementalChaos'&&e.variant==='fire'));
}

// Vạn Ảnh Xạ: a real Afterimage projectile can finish the shared EchoShot counter and spawn a standard EchoShot projectile.
{
  const {match,p,o,round}=duel({afterimage:1,echoShot:1});
  p.x=400;o.x=500;p.hitStun=10;o.hitStun=10;p.duelEffects.echoShotHits=4;p.skillTimers.afterimage=0;
  for(let i=0;i<12&&!round.events.some(e=>e.type==='cast'&&e.skill==='afterimageEcho');i++)updateDuelRound(match,.033);
  assert.ok(round.events.some(e=>e.type==='projectile_spawn'&&e.source==='afterimage'));
  assert.ok(round.events.some(e=>e.type==='cast'&&e.skill==='afterimageEcho'));
  assert.ok(round.events.some(e=>e.type==='projectile_spawn'&&e.source==='echoShot'));
  assert.strictEqual(p.duelEffects.echoShotHits,0);
}

// Trọng Lực Phù Trận: after the real mine explosion/push, synergy performs its explicit pull-back and emits a separate status.
{
  const {match,p,o,round}=duel({runeMine:1,blackHole:1});
  p.x=400;o.x=447;p.hitStun=10;o.hitStun=10;p.skillTimers.runeMine=0;
  for(let i=0;i<20&&!round.events.some(e=>e.type==='status'&&e.status==='gravityRune');i++)updateDuelRound(match,.033);
  assert.ok(round.events.some(e=>e.type==='area'&&e.skill==='runeMine'));
  assert.ok(round.events.some(e=>e.type==='status'&&e.status==='gravityRune'));
  assert.ok(o.x<470,'gravityRune should pull target back after the outward mine push');
}

const index=fs.readFileSync('index.html','utf8');
assert.ok(index.indexOf('duel-synergies-c2b.js')<index.indexOf('duel-synergies-c2c.js'));
assert.ok(index.indexOf('duel-synergies-c2c.js')<index.indexOf('duel-ui.js'));
console.log('V0.17 C2C 22-Hợp-Đạo Duel smoke: PASS');