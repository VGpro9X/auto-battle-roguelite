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

load('js/duel-skills.js');
load('js/duel-engine.js');
load('js/duel-skills-d6a.js');
load('js/duel-skills-d6b.js');
load('js/duel-skills-d6c.js');
load('js/duel-skills-d6d.js');
load('js/duel-skills-d6e.js');

const d6e=['overclock','summonMastery','soulBind','spiritPearl','frostbite','shatter','conductiveVenom','combustion','timeEcho','greed'];
assert.strictEqual(DUEL_SKILL_KEYS.length,60,'D6E must raise Duel base-skill coverage to exactly 60/80');
for(const key of d6e){
  assert.ok(DUEL_SKILL_KEYS.includes(key),`missing D6E adapter ${key}`);
  assert.ok(getDuelSkillBehavior(key),`missing D6E behavior ${key}`);
  for(let rank=1;rank<=3;rank++)assert.ok(getDuelSkill(key).desc(rank).length>20,`${key} Rank ${rank} lacks mechanical description`);
}

// Quá Tải Thời Gian trades max HP for faster automatic skill timers, not basic attack timing.
{
  const {match,p,o}=duel({overclock:3,fire:3});
  approx(p.maxHp,88);
  p.hitStun=10;o.hitStun=10;p.skillTimers.fire=10;
  const attackBefore=p.attackTimer;
  updateDuelRound(match,.033);
  approx(p.skillTimers.fire,10-.033*1.30);
  approx(p.attackTimer,attackBefore);
}

// Ngự Linh buffs damage explicitly tagged as summon; Linh Hỏa is the deterministic probe.
{
  const {match,p,o}=duel({fireWisp:3,summonMastery:3});
  p.x=450;o.x=500;p.hitStun=10;o.hitStun=10;p.skillTimers.fireWisp=0;
  updateDuelRound(match,.033);
  approx(o.hp,78.88); // 16 * 1.32 summon multiplier.
}

// Trói Hồn preserves its visible range, damage and stagger contract.
{
  const {match,p,o}=duel({soulBind:3});
  p.x=300;o.x=500;p.hitStun=10;o.hitStun=10;p.skillTimers.soulBind=0;
  updateDuelRound(match,.033);
  approx(o.hp,68);
  assert.ok(o.hitStun>=.86,'Soul Bind did not apply its Rank III stagger');
  assert.ok(p.skillTimers.soulBind>4.5,'Soul Bind cooldown did not reset');
}

// Linh Châu charges from real healing (Lucky Star heal branch), caps charge, then spends one pearl on a projectile.
{
  const {match,round,p,o}=duel({spiritPearl:3,luckyStar:3},{},()=>0);
  p.hp=70;p.hitStun=10;o.hitStun=10;p.skillTimers.luckyStar=0;p.duelEffects.spiritPearl.fireTimer=0;
  updateDuelRound(match,.033);
  approx(p.hp,88);
  approx(p.totalHealing,18);
  assert.strictEqual(p.duelEffects.spiritPearl.pearls,1,'18 actual healing should create two pearls and spend one');
  approx(p.duelEffects.spiritPearl.charge,2);
  assert.ok(round.projectiles.some(projectile=>projectile.source==='spiritPearl'),'Spirit Pearl did not spawn its projectile');
}

// Hàn Thấu only multiplies damage while the opponent is inside the owner's Hàn Khí radius.
{
  const {match,p,o}=duel({frost:3,frostbite:3,lightning:3});
  p.x=300;o.x=500;p.skillTimers.lightning=0;o.hitStun=10;
  updateDuelRound(match,.033);
  approx(o.hp,44.56); // 42 * 1.32.
}
{
  const {match,p,o}=duel({frost:3,frostbite:3,lightning:3});
  p.x=200;o.x=500;p.skillTimers.lightning=0;o.hitStun=10;
  updateDuelRound(match,.033);
  approx(o.hp,58); // Outside Rank III frost radius: no 32% bonus.
}

// Băng Toái counts only successful basics in Hàn Khí and bursts on the Rank III third hit.
{
  const {match,p,o}=duel({frost:3,shatter:3});
  p.x=450;o.x=500;o.hitStun=10;
  for(let i=0;i<3;i++){
    p.attackTimer=0;
    updateDuelRound(match,.033);
  }
  approx(o.hp,30); // 3 * 12 basics + 34 shatter.
  assert.strictEqual(p.duelEffects.shatterHits,0);
}

// Độc Dẫn checks the owner's live poison and produces a non-recursive lightning proc.
{
  const {match,round,p,o}=duel({poison:3,conductiveVenom:3},{},()=>0);
  p.x=450;o.x=500;o.hitStun=10;
  updateDuelRound(match,.033); // basic hit applies poison deterministically.
  approx(o.hp,88);
  assert.ok(o.duelEffects.poison&&o.duelEffects.poison.source==='player','Poison was not applied before Conductive Venom test');
  p.attackTimer=999;p.duelEffects.conductiveTimer=0;
  updateDuelRound(match,.033);
  approx(o.hp,66);
  assert.ok(round.events.some(event=>event.type==='cast'&&event.skill==='conductiveVenom'));
}

// Hỏa Táng requires the owner's active burn and the target to remain in its 220px detonation range.
{
  const {match,round,p,o}=duel({burn:3,combustion:3},{},()=>0);
  p.x=450;o.x=500;o.hitStun=10;
  updateDuelRound(match,.033); // basic hit applies burn.
  approx(o.hp,88);
  assert.ok(o.statuses.burnUntil>round.time&&o.statuses.burnSource==='player','Burn was not applied before Combustion test');
  p.attackTimer=999;p.duelEffects.combustionTimer=0;
  updateDuelRound(match,.033);
  approx(o.hp,54);
  assert.ok(round.events.some(event=>event.type==='area'&&event.skill==='combustion'));
}

// Dội Thời Gian observes an automatic cooldown restart and makes the same skill immediately eligible once more.
{
  const {match,round,p,o}=duel({timeEcho:3,fire:3},{},()=>0);
  p.x=300;o.x=500;o.hitStun=10;p.skillTimers.fire=0;
  updateDuelRound(match,.033); // first Hỏa Cầu starts a new cooldown.
  updateDuelRound(match,.033); // Time Echo detects that restart and resets it to zero before native casting.
  assert.strictEqual(round.events.filter(event=>event.type==='cast'&&event.skill==='fire').length,2,'Time Echo did not repeat the eligible automatic skill');
  assert.ok(round.events.some(event=>event.type==='status'&&event.status==='timeEcho'&&event.skill==='fire'));
}

// Tham Lam exposes both sides of its Duel conversion: own damage bonus and opponent HP risk.
{
  const {match,p,o}=duel({greed:3});
  approx(o.maxHp,128);
  approx(o.hp,128);
  p.x=450;o.x=500;o.hitStun=10;
  updateDuelRound(match,.033);
  approx(o.hp,113.36); // 12 * 1.22 damage.
}

// Public script order: D6E must be present after D6D and before UI creates Duel choices.
const index=fs.readFileSync('index.html','utf8');
for(const file of ['js/duel-skills-d6a.js','js/duel-skills-d6b.js','js/duel-skills-d6c.js','js/duel-skills-d6d.js','js/duel-skills-d6e.js'])assert.ok(index.includes(file),`index missing ${file}`);
assert.ok(index.indexOf('js/duel-skills-d6d.js')<index.indexOf('js/duel-skills-d6e.js'),'D6E must load after D6D');
assert.ok(index.indexOf('js/duel-skills-d6e.js')<index.indexOf('js/duel-ui.js'),'D6E must register before Duel UI');

console.log('V0.17 D6E 60-skill smoke: PASS');
