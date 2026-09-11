const fs=require('fs');
const vm=require('vm');
const assert=require('assert');

function load(path){vm.runInThisContext(fs.readFileSync(path,'utf8'),{filename:path});}
function approx(actual,expected,epsilon=1e-6){assert.ok(Math.abs(actual-expected)<=epsilon,`expected ${actual} ≈ ${expected}`);}
function entry(id,build){return{id,name:id,build:{...build}};}
function duel(buildA,buildB={},rng=()=>.99){
  const match=createDuelMatch(entry('player',buildA),entry('opponent',buildB),{rng});
  const round=startDuelRound(match);
  return{match,round,p:round.fighters.player,o:round.fighters.opponent};
}

load('js/duel-skills.js');
load('js/duel-engine.js');
load('js/duel-skills-d6a.js');
load('js/duel-skills-d6b.js');
load('js/duel-skills-d6c.js');
load('js/duel-skills-d6d.js');
load('js/duel-skills-d6e.js');
load('js/duel-skills-d6f.js');
load('js/duel-skills-d6g.js');
load('js/duel-synergies.js');
load('js/duel-synergies-c2a.js');

const expected=['soulFurnace','frozenExecution','crimsonFortress','markedBounty','soulAegis','criticalStorm','lastBreath','glassBlood'];
assert.deepStrictEqual(DUEL_C2A_SYNERGY_IDS,expected);
assert.strictEqual(Object.keys(DUEL_SYNERGY_CATALOG).length,28);
assert.strictEqual(Object.keys(DUEL_SYNERGY_ADAPTERS).length,8,'C2A must finish at exactly 8/28 implemented Duel Hợp Đạo');
for(const id of expected){
  const meta=getDuelSynergy(id);
  assert.strictEqual(meta.implemented,true,`${id} not implemented`);
  assert.ok(meta.desc.length>55,`${id} lacks explicit Duel description`);
  assert.strictEqual(getDuelSynergyRequirementStatus(Object.fromEntries((meta.requires.skills||[]).map(key=>[key,1])),id).unlocked,true,`${id} requirements do not unlock from Duel build`);
}
assert.strictEqual(getDuelSynergy('thermalShock').implemented,false,'unported Hợp Đạo must remain unavailable');

// C1 Lò Luyện Hồn remains live after C2A chaining.
{
  const {p}=duel({soulHarvest:1,blood:1});
  assert.ok(hasDuelSynergy(p,'soulFurnace'));
  approx(p.stats.regen,.45);
}

// Hàn Sát stacks after normal Execution and Hàn Thấu only when the target is actually inside Hàn Khí.
{
  const {match,p,o}=duel({frostbite:1,execution:1,frost:1,lightning:1},{vitality:3});
  p.x=300;o.x=430;o.hp=45;o.hitStun=10;p.skillTimers.lightning=0;
  updateDuelRound(match,.033);
  approx(o.hp,45-(18*1.18*1.25*1.10));
}
{
  const {match,p,o}=duel({frostbite:1,execution:1,frost:1,lightning:1},{vitality:3});
  p.x=300;o.x=500;o.hp=45;o.hitStun=10;p.skillTimers.lightning=0;
  updateDuelRound(match,.033);
  approx(o.hp,45-(18*1.18));
}

// Huyết Thành converts actual healing to shield through the normal shield-generation path.
{
  const {match,p,o}=duel({bloodShield:1,barrier:1,heal:1});
  p.hp=90;p.shield=0;p.hitStun=10;o.hitStun=10;
  updateDuelRound(match,.033);
  const healed=.6*.033;
  approx(p.totalHealing,healed);
  approx(p.shield,healed*.55);
}

// Săn Ấn makes marked bounty damage count at 125%; two basic hits now clear Rank III's 28-damage goal.
{
  const {match,p,o}=duel({deathMark:1,bountyMark:3});
  p.x=400;o.x=460;o.hitStun=10;p.skillTimers.deathMark=0;p.skillTimers.bountyMark=0;
  updateDuelRound(match,.033);
  assert.strictEqual(p.duelEffects.bountyMark.rewarded,false);
  approx(p.duelEffects.bountyMark.progress,12*1.12*1.25);
  p.attackTimer=0;
  updateDuelRound(match,.033);
  assert.strictEqual(p.duelEffects.bountyMark.rewarded,true);
  approx(p.shield,22);
}

// Hồn Thuẫn grants shield only when a real Thực Hồn stack appears.
{
  const {match,p,o}=duel({soulHarvest:3,bloodShield:1,lightning:3},{vitality:3});
  p.shield=0;p.x=300;o.x=500;o.hitStun=10;p.skillTimers.lightning=0;
  updateDuelRound(match,.033);
  approx(p.shield,0);
  p.skillTimers.lightning=0;
  updateDuelRound(match,.033);
  assert.strictEqual(p.duelEffects.soulHarvest.stacks,1);
  approx(p.shield,5);
}

// Bạo Lôi adds a non-crit Chain follow-up equal to Lightning base damage × current crit chance.
{
  const {match,p,o}=duel({crit:3,lightning:1});
  p.x=300;o.x=500;o.hitStun=10;p.skillTimers.lightning=0;
  updateDuelRound(match,.033);
  approx(o.hp,100-(18+18*.24));
  assert.ok(match.currentRound.events.some(event=>event.type==='cast'&&event.skill==='criticalStorm'));
}

// Hồi Quang only fires after Hồi Mệnh has actually restored the fighter from fatal damage.
{
  const {match,p,o}=duel({lastStand:1,secondWind:1});
  p.x=400;o.x=460;p.hp=1;p.hitStun=10;
  updateDuelRound(match,.033);
  approx(p.hp,20);
  approx(p.shield,28);
  approx(o.hp,70);
  assert.ok(match.currentRound.events.some(event=>event.type==='revive'&&event.skill==='secondWind'));
  assert.ok(match.currentRound.events.some(event=>event.type==='area'&&event.skill==='lastBreath'));
}

// Huyết Kính repeats exactly the real Huyết Chạm heal when the attacker was below half HP before the hit.
{
  const {match,p,o}=duel({glassCannon:1,vampiricTouch:3},{},()=>0);
  p.x=400;o.x=460;p.hp=20;o.hitStun=10;
  updateDuelRound(match,.033);
  approx(p.hp,34);
  approx(p.totalHealing,14);
}

// Carrier skill creation must be safe even when the matching synergy is not owned.
for(const build of [{bloodShield:1},{soulHarvest:1},{vampiricTouch:1}])assert.doesNotThrow(()=>duel(build));

const index=fs.readFileSync('index.html','utf8');
assert.ok(index.includes('js/duel-synergies-c2a.js'),'public artifact missing C2A Hợp Đạo batch');
assert.ok(index.indexOf('js/duel-synergies.js')<index.indexOf('js/duel-synergies-c2a.js'),'C2A must load after Hợp Đạo foundation');
assert.ok(index.indexOf('js/duel-synergies-c2a.js')<index.indexOf('js/duel-ui.js'),'C2A must register before Duel UI');

console.log('V0.17 C2A first-8 Duel Hợp Đạo smoke: PASS');
