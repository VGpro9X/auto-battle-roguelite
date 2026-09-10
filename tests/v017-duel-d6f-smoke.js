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

const d6f=['multishot','pierce','ricochet','explosive','areaMastery','velocity','chainMastery','bloodLink','guardianIdol','soulLantern'];
assert.strictEqual(DUEL_SKILL_KEYS.length,70,'D6F must raise Duel base-skill coverage to exactly 70/80');
for(const key of d6f){
  assert.ok(DUEL_SKILL_KEYS.includes(key),`missing D6F adapter ${key}`);
  assert.ok(getDuelSkillBehavior(key),`missing D6F behavior ${key}`);
  for(let rank=1;rank<=3;rank++)assert.ok(getDuelSkill(key).desc(rank).length>24,`${key} Rank ${rank} lacks mechanical description`);
}

// Song Tiễn creates three real projectile hits at Rank III without retriggering basic-hit logic.
{
  const {match,round,p,o}=duel({multishot:3});
  p.x=450;o.x=500;o.hitStun=10;
  updateDuelRound(match,.033);
  approx(o.hp,77.2); // basic 12 + 3 * (12 * .30)
  assert.strictEqual(round.events.filter(event=>event.type==='hit'&&event.source==='multishot').length,3);
}

// Xuyên Phá ignores 60% of the target's armor VALUE for projectile hits only.
{
  const {match,p,o}=duel({fire:3,pierce:3},{armor:3});
  p.x=300;o.x=500;o.hitStun=10;p.skillTimers.fire=0;
  updateDuelRound(match,.033);
  p.hitStun=999;o.hitStun=999;
  tick(match,16);
  approx(o.hp,65.04); // 38 * (1 - .20 * (1-.60)) = 34.96
}
{
  const {match,p,o}=duel({pierce:3},{armor:3});
  p.x=450;o.x=500;o.hitStun=10;
  updateDuelRound(match,.033);
  approx(o.hp,90.4); // basic remains 12 * .80; Pierce does not affect melee.
}

// Nảy Đạn turns every second projectile hit into one Chain projectile at Rank III.
{
  const {match,round,p,o}=duel({multishot:3,ricochet:3});
  p.x=450;o.x=500;o.hitStun=10;
  updateDuelRound(match,.033);
  approx(o.hp,65.8); // 12 basic + 10.8 multishot + 11.4 ricochet.
  assert.ok(round.events.some(event=>event.type==='hit'&&event.source==='ricochet'),'Ricochet projectile never dealt damage');
  assert.strictEqual(p.duelEffects.ricochetHits,1,'Ricochet residual projectile count was not preserved');
}

// Đạn Nổ procs from a real projectile hit and its explosion cannot recurse.
{
  const {match,round,p,o}=duel({fire:3,explosive:3},{},()=>0);
  p.x=300;o.x=500;o.hitStun=10;p.skillTimers.fire=0;
  updateDuelRound(match,.033);
  p.hitStun=999;o.hitStun=999;
  tick(match,16);
  approx(o.hp,34); // 38 fire + 28 explosion.
  assert.strictEqual(round.events.filter(event=>event.type==='area'&&event.skill==='explosive').length,1);
}

// Khuếch Vực modifies damage tagged Area; native Nova now exposes that metadata.
{
  const {match,p,o}=duel({nova:3,areaMastery:3});
  p.x=400;o.x=500;o.hitStun=10;p.skillTimers.nova=0;
  updateDuelRound(match,.033);
  approx(o.hp,49.84); // 38 * 1.32.
}

// Lưu Quang uses the generic projectile hook: speed +40%, lifetime +18% at Rank III.
{
  const {match,round,p,o}=duel({fire:3,velocity:3});
  p.x=300;o.x=700;o.hitStun=10;p.skillTimers.fire=0;
  updateDuelRound(match,.033);
  const projectile=round.projectiles.find(item=>item.source==='fire');
  assert.ok(projectile,'Velocity probe did not create a Fire projectile');
  approx(Math.abs(projectile.vx),497);
  approx(projectile.life,2.2*1.18-.033);
}

// Liên Kết amplifies explicit Chain damage; native Lightning is a Chain hit.
{
  const {match,p,o}=duel({lightning:3,chainMastery:3});
  p.x=300;o.x=500;o.hitStun=10;p.skillTimers.lightning=0;
  updateDuelRound(match,.033);
  approx(o.hp,44.56); // 42 * 1.32.
}

// Huyết Liên mirrors a percentage of real HP loss and does not recurse.
{
  const {match,round,p,o}=duel({bloodLink:3});
  p.x=450;o.x=500;p.hitStun=10;p.skillTimers.bloodLink=0;
  updateDuelRound(match,.033);
  approx(p.hp,88);
  approx(o.hp,95.68); // mirror power = 12 * .36.
  assert.ok(round.events.some(event=>event.type==='cast'&&event.skill==='bloodLink'));
}

// Hộ Pháp Mộc Nhân absorbs post-armor incoming damage before fighter shield/HP.
{
  const {match,p,o}=duel({guardianIdol:3});
  p.x=450;o.x=500;p.hitStun=10;p.skillTimers.guardianIdol=0;
  updateDuelRound(match,.033);
  approx(p.hp,100);
  assert.ok(p.duelEffects.guardianIdol,'Guardian disappeared after a non-lethal block');
  approx(p.duelEffects.guardianIdol.hp,48); // 60 - one 12 damage basic.
}

// Hồn Đăng converts damage dealt into charge, preserves overflow, and detonates after 0.6s.
{
  const {match,round,p,o}=duel({soulLantern:3,lightning:3},{vitality:3});
  p.x=300;o.x=500;o.hitStun=10;p.skillTimers.lightning=0;
  updateDuelRound(match,.033);
  p.skillTimers.lightning=0;
  updateDuelRound(match,.033);
  approx(o.hp,81); // 165 - 84 lightning damage.
  approx(p.duelEffects.soulLantern.charge,24);
  assert.strictEqual(p.duelEffects.soulLantern.flames.length,1);
  p.hitStun=999;o.hitStun=999;p.skillTimers.lightning=999;
  tick(match,19);
  approx(o.hp,31);
  assert.ok(round.events.some(event=>event.type==='area'&&event.skill==='soulLantern'));
}

// Cross-batch metadata: Độc Dẫn is explicitly Chain and inherits Liên Kết.
{
  const {match,p,o}=duel({poison:3,conductiveVenom:3,chainMastery:3},{},()=>0);
  p.x=450;o.x=500;o.hitStun=10;
  updateDuelRound(match,.033); // basic applies poison.
  p.attackTimer=999;p.duelEffects.conductiveTimer=0;
  updateDuelRound(match,.033);
  approx(o.hp,58.96); // 12 basic + 22 * 1.32 Conductive Venom.
}

// Public script order: D6F must be present after D6E and before UI creates Duel choices.
const index=fs.readFileSync('index.html','utf8');
for(const file of ['js/duel-skills-d6a.js','js/duel-skills-d6b.js','js/duel-skills-d6c.js','js/duel-skills-d6d.js','js/duel-skills-d6e.js','js/duel-skills-d6f.js'])assert.ok(index.includes(file),`index missing ${file}`);
assert.ok(index.indexOf('js/duel-skills-d6e.js')<index.indexOf('js/duel-skills-d6f.js'),'D6F must load after D6E');
assert.ok(index.indexOf('js/duel-skills-d6f.js')<index.indexOf('js/duel-ui.js'),'D6F must register before Duel UI');
assert.ok(index.includes('js/duel-engine.js?v=017duel-d6f-r1'),'public artifact must cache-bust the D6F engine hooks');

console.log('V0.17 D6F 70-skill smoke: PASS');
