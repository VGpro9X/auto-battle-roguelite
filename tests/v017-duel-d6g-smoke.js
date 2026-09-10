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
load('js/duel-skills-d6e.js');
load('js/duel-skills-d6f.js');
load('js/duel-skills-d6g.js');

const d6g=['magnet','blood','wisdom','soulHarvest','corpseBurst','xpStorm','markSpread','xpHeal','levelBurst','bountyMark'];
assert.strictEqual(DUEL_SKILL_KEYS.length,80,'D6G must complete Duel base-skill coverage at exactly 80/80');
assert.strictEqual(new Set(DUEL_SKILL_KEYS).size,80,'Duel base-skill registry contains duplicate keys');
for(const key of d6g){
  assert.ok(DUEL_SKILL_KEYS.includes(key),`missing D6G adapter ${key}`);
  assert.ok(getDuelSkillBehavior(key),`missing D6G behavior ${key}`);
  for(let rank=1;rank<=3;rank++)assert.ok(getDuelSkill(key).desc(rank).length>28,`${key} Rank ${rank} lacks explicit Duel mechanics`);
}

// Linh Hấp converts missing XP-pickup utility into a real positional pull with visible range/retry rules.
{
  const {match,p,o}=duel({magnet:3});
  p.x=300;o.x=600;p.hitStun=10;o.hitStun=10;p.skillTimers.magnet=0;
  updateDuelRound(match,.033);
  approx(o.x,510);
  assert.ok(o.hitStun>0,'Magnet pull did not use real Duel displacement/control');
  assert.ok(p.skillTimers.magnet>3.9,'Magnet cooldown did not restart');
}

// Huyết Khí converts kill-healing into damage charge, preserves overflow and uses real Duel healing.
{
  const {match,p,o}=duel({blood:3,lightning:3},{vitality:3});
  p.x=300;o.x=500;p.hp=80;o.hitStun=10;p.skillTimers.lightning=0;
  updateDuelRound(match,.033);
  p.skillTimers.lightning=0;
  updateDuelRound(match,.033);
  approx(o.hp,81);
  approx(p.hp,91);
  approx(p.totalHealing,11);
  approx(p.duelEffects.bloodCharge,34);
}

// Ngộ Tính accelerates skill timers only; the fighter's basic-attack timer is untouched.
{
  const {match,p,o}=duel({wisdom:3,fire:3});
  p.hitStun=10;o.hitStun=10;p.skillTimers.fire=10;p.attackTimer=7;
  updateDuelRound(match,.033);
  approx(p.skillTimers.fire,10-.033*1.15);
  approx(p.attackTimer,Math.max(0,7-.033)); // engine's normal basic timer flow only.
}

// Thực Hồn converts kill scaling into visible per-round damage thresholds with persistent overflow.
{
  const {match,p,o}=duel({soulHarvest:3,lightning:3},{vitality:3});
  p.x=300;o.x=500;o.hitStun=10;p.skillTimers.lightning=0;
  updateDuelRound(match,.033);
  p.skillTimers.lightning=0;
  updateDuelRound(match,.033);
  approx(p.stats.baseDamage,14);
  assert.strictEqual(p.duelEffects.soulHarvest.stacks,1);
  approx(p.duelEffects.soulHarvest.charge,14);
}

// Thi Bạo evaluates the HP ratio created by the triggering hit, so its own explosion cannot cascade into lower thresholds.
{
  const {match,round,p,o}=duel({corpseBurst:3,lightning:3},{vitality:3});
  p.x=300;o.x=500;o.hitStun=10;p.skillTimers.lightning=0;
  updateDuelRound(match,.033);
  approx(o.hp,95); // 165 - 42 lightning - 28 first threshold burst.
  assert.strictEqual(round.events.filter(event=>event.type==='area'&&event.skill==='corpseBurst').length,1);
  assert.strictEqual(Boolean(p.duelEffects.corpseBurstTriggered[0]),true);
  assert.strictEqual(Boolean(p.duelEffects.corpseBurstTriggered[1]),false);
}

// Linh Triều charges from real horizontal movement and preserves excess distance.
{
  const {match,p,o}=duel({xpStorm:3});
  p.x=420;o.x=700;p.hitStun=10;o.hitStun=10; // onCreate anchor was 220, so this is 200px real delta.
  updateDuelRound(match,.033);
  approx(o.hp,52);
  approx(p.duelEffects.xpStorm.distance,20);
}

// Ấn Lan extends each newly-created owned Tử Ấn exactly once and never creates a standalone mark.
{
  const {match,round,p,o}=duel({deathMark:3,markSpread:3});
  p.hitStun=10;o.hitStun=10;p.skillTimers.deathMark=0;
  updateDuelRound(match,.033);
  const mark=o.duelEffects.deathMark;
  assert.ok(mark&&mark.spreadExtended,'Mark Spread did not extend the owned Death Mark');
  approx(mark.until-round.time,9); // native 5s + Rank III 4s.
  const until=mark.until;
  updateDuelRound(match,.033);
  approx(mark.until,until); // no repeated extension of the same mark.
}
{
  const {match,p,o}=duel({markSpread:3});
  p.hitStun=10;o.hitStun=10;
  updateDuelRound(match,.033);
  assert.ok(!o.duelEffects.deathMark,'Mark Spread created a hidden standalone mark');
}

// Linh Dưỡng's Duel conversion is a visible periodic heal and starts only when its timer is ready.
{
  const {match,p,o}=duel({xpHeal:3});
  p.hp=50;p.hitStun=10;o.hitStun=10;p.skillTimers.xpHeal=0;
  updateDuelRound(match,.033);
  approx(p.hp,58);
  approx(p.totalHealing,8);
  assert.ok(p.skillTimers.xpHeal>3.9);
}

// Phá Cảnh becomes one delayed round-start burst; it cannot repeat within the same round.
{
  const {match,round,p,o}=duel({levelBurst:3},{vitality:3});
  p.hitStun=999;o.hitStun=999;
  tick(match,46);
  approx(o.hp,121);
  assert.strictEqual(round.events.filter(event=>event.type==='area'&&event.skill==='levelBurst').length,1);
  tick(match,30);
  approx(o.hp,121);
  assert.strictEqual(round.events.filter(event=>event.type==='area'&&event.skill==='levelBurst').length,1);
}

// Thưởng Săn opens its own bounty window and grants exactly one shield reward after the visible damage goal.
{
  const {match,p,o}=duel({bountyMark:3,lightning:3});
  p.x=300;o.x=500;o.hitStun=10;p.skillTimers.bountyMark=0;p.skillTimers.lightning=0;
  updateDuelRound(match,.033);
  approx(o.hp,58);
  approx(p.shield,22);
  assert.strictEqual(p.duelEffects.bountyMark.rewarded,true);
  const shield=p.shield;
  p.skillTimers.lightning=0;
  updateDuelRound(match,.033);
  approx(p.shield,shield); // one reward maximum for this active window.
}

// Public artifact must load all seven expansion layers before Duel UI consumes the registry.
const index=fs.readFileSync('index.html','utf8');
for(const file of ['js/duel-skills-d6a.js','js/duel-skills-d6b.js','js/duel-skills-d6c.js','js/duel-skills-d6d.js','js/duel-skills-d6e.js','js/duel-skills-d6f.js','js/duel-skills-d6g.js'])assert.ok(index.includes(file),`index missing ${file}`);
assert.ok(index.indexOf('js/duel-skills-d6f.js')<index.indexOf('js/duel-skills-d6g.js'),'D6G must load after D6F');
assert.ok(index.indexOf('js/duel-skills-d6g.js')<index.indexOf('js/duel-ui.js'),'D6G must register before Duel UI');

console.log('V0.17 D6G all-80 base-skill smoke: PASS');
