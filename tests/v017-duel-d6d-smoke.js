const fs=require('fs');
const vm=require('vm');
const assert=require('assert');

function load(path){vm.runInThisContext(fs.readFileSync(path,'utf8'),{filename:path});}
function approx(actual,expected,epsilon=1e-6){assert.ok(Math.abs(actual-expected)<=epsilon,`expected ${actual} ≈ ${expected}`);}
function duel(buildA,buildB={},rng=()=>.99){
  const match=createDuelMatch({id:'player',name:'BẠN',build:buildA},{id:'opponent',name:'ĐỐI THỦ',build:buildB},{rng});
  const round=startDuelRound(match);
  return{match,round,p:round.fighters.player,o:round.fighters.opponent};
}
function tick(match,count,dt=.033){let round=match.currentRound;for(let i=0;i<count&&!round.ended;i++)round=updateDuelRound(match,dt);return round;}

load('js/duel-skills.js');
load('js/duel-engine.js');
load('js/duel-skills-d6a.js');
load('js/duel-skills-d6b.js');
load('js/duel-skills-d6c.js');
load('js/duel-skills-d6d.js');

const d6d=['precision','giantSlayer','chaosOrb','fireWisp','stormTotem','strideShock','returnBlade','frostMirror','timeField','bloodShield'];
assert.strictEqual(DUEL_SKILL_KEYS.length,50,'D6D must raise Duel base-skill coverage to exactly 50/80');
for(const key of d6d){
  assert.ok(DUEL_SKILL_KEYS.includes(key),`missing D6D adapter ${key}`);
  assert.ok(getDuelSkillBehavior(key),`missing D6D behavior ${key}`);
  for(let rank=1;rank<=3;rank++)assert.ok(getDuelSkill(key).desc(rank).length>20,`${key} Rank ${rank} lacks mechanical description`);
}

// Tâm Nhãn changes crit damage only, not crit chance.
{
  const stats=computeDuelStats({build:{crit:3,precision:3}});
  approx(stats.critChance,.24);
  approx(stats.critMultiplier,2.10);
}

// Săn Cự Thú is meaningful in 1v1: it keys off higher opponent max HP.
{
  const {match,p,o}=duel({giantSlayer:3},{vitality:3});
  p.x=450;o.x=500;o.hitStun=10;
  updateDuelRound(match,.033);
  approx(o.hp,149.64);
}
{
  const {match,p,o}=duel({giantSlayer:3,vitality:3},{});
  p.x=450;o.x=500;o.hitStun=10;
  updateDuelRound(match,.033);
  approx(o.hp,88);
}

// Chaos Orb's deterministic fire branch is elemental and inherits Ngũ Hành.
{
  const {match,p,o}=duel({chaosOrb:3,elementalMastery:3},{},()=>.01);
  p.hitStun=10;o.hitStun=10;p.skillTimers.chaosOrb=0;
  updateDuelRound(match,.033);
  approx(o.hp,37); // 50 * 1.26 = 63 damage.
  assert.ok(p.skillTimers.chaosOrb>3.2,'Chaos Orb cooldown was not reset');
}

// Linh Hỏa and Lôi Linh expose their stated retry rule when out of range.
{
  const {match,p,o}=duel({fireWisp:3,elementalMastery:3});
  p.x=450;o.x=500;p.hitStun=10;o.hitStun=10;p.skillTimers.fireWisp=0;
  updateDuelRound(match,.033);
  approx(o.hp,79.84); // 16 * 1.26
}
{
  const {match,p,o}=duel({fireWisp:3});
  p.x=100;o.x=800;p.hitStun=10;o.hitStun=10;p.skillTimers.fireWisp=0;
  updateDuelRound(match,.033);
  approx(p.skillTimers.fireWisp,.5);
  approx(o.hp,100);
}
{
  const {match,p,o}=duel({stormTotem:3});
  p.x=100;o.x=800;p.hitStun=10;o.hitStun=10;p.skillTimers.stormTotem=0;
  updateDuelRound(match,.033);
  approx(p.skillTimers.stormTotem,.5);
}

// Bộ Pháp Chấn counts actual movement and keeps excess distance.
{
  const {match,p,o}=duel({strideShock:3});
  p.hitStun=10;o.hitStun=10;
  p.x=400;o.x=500;
  updateDuelRound(match,.033);
  approx(o.hp,64);
  assert.ok(o.x>500,'Stride Shock did not push the opponent');
  approx(p.duelEffects.strideShock.distance,35);
}

// Hồi Phong Nhận may hit once outbound and once returning.
{
  const {match,round,p,o}=duel({returnBlade:3});
  p.x=300;o.x=500;p.hitStun=10;o.hitStun=10;p.skillTimers.returnBlade=0;
  updateDuelRound(match,.033);
  tick(match,34);
  approx(o.hp,28);
  assert.ok(round.events.filter(event=>event.type==='cast'&&event.skill==='returnBlade').length===1);
}

// Hàn Kính starts empty, charges after its visible cooldown, then consumes on a basic hit.
{
  const {match,p,o}=duel({frostMirror:3});
  p.x=300;o.x=700;p.hitStun=10;o.hitStun=10;p.skillTimers.frostMirror=0;
  updateDuelRound(match,.033);
  assert.strictEqual(p.duelEffects.frostMirrorCharge,1);
  p.x=450;o.x=500;p.hitStun=10;o.hitStun=0;o.attackTimer=0;
  updateDuelRound(match,.033);
  approx(p.hp,97);
  assert.strictEqual(p.duelEffects.frostMirrorCharge,0);
  assert.ok(o.hitStun>=.44,'Frost Mirror did not apply its stated attacker stagger');
  assert.ok(p.skillTimers.frostMirror>5.9,'Frost Mirror cooldown did not restart after consumption');
}

// Thời Vực accelerates every other skill timer but not its own 14-second timer.
{
  const {match,p,o}=duel({timeField:3,fire:3});
  p.hitStun=10;o.hitStun=10;p.skillTimers.timeField=0;p.skillTimers.fire=10;
  updateDuelRound(match,.033);
  approx(p.skillTimers.fire,10-.033*1.65);
  approx(p.skillTimers.timeField,14);
  assert.ok(p.duelEffects.timeFieldUntil>4.9,'Time Field duration did not start at Rank III value');
}

// Huyết Thuẫn is a visible round-start conversion of the Survival kill-based identity.
{
  const {round,p}=duel({bloodShield:3});
  approx(p.shield,22);
  approx(p.totalShieldGained,22);
  assert.ok(round.events.some(event=>event.type==='shield_gain'&&event.source==='bloodShield'));
}

// Public script order: all Duel behavior modules must exist before UI creates choices.
const index=fs.readFileSync('index.html','utf8');
for(const file of ['js/duel-skills-d6a.js','js/duel-skills-d6b.js','js/duel-skills-d6c.js','js/duel-skills-d6d.js'])assert.ok(index.includes(file),`index missing ${file}`);
assert.ok(index.indexOf('js/duel-skills-d6c.js')<index.indexOf('js/duel-skills-d6d.js'),'D6D must load after D6C');
assert.ok(index.indexOf('js/duel-skills-d6d.js')<index.indexOf('js/duel-ui.js'),'D6D must register before Duel UI');

console.log('V0.17 D6D 50-skill smoke: PASS');