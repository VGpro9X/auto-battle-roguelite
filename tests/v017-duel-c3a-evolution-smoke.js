const fs=require('fs');
const vm=require('vm');
const assert=require('assert');
function load(path){vm.runInThisContext(fs.readFileSync(path,'utf8'),{filename:path});}
function approx(a,b,e=1e-5){assert.ok(Math.abs(a-b)<=e,`expected ${a} ≈ ${b}`);}
function entry(id,build){return{id,name:id,build:{...build}};}
function duel(a,b={},rng=()=>.99){const match=createDuelMatch(entry('player',a),entry('opponent',b),{rng});const round=startDuelRound(match);return{match,round,p:round.fighters.player,o:round.fighters.opponent};}
load('js/skills.js');
for(const file of ['duel-skills','duel-engine','duel-skills-d6a','duel-skills-d6b','duel-skills-d6c','duel-skills-d6d','duel-skills-d6e','duel-skills-d6f','duel-skills-d6g','duel-synergies','duel-synergies-c2a','duel-synergies-c2b','duel-synergies-c2c','duel-synergies-c2d','duel-evolutions','duel-evolutions-c3a'])load(`js/${file}.js`);

const expected=['heavenfire','stormNetwork','swordDomain','plagueTide','crimsonMoon','singularity'];
assert.deepStrictEqual(DUEL_C3A_EVOLUTION_IDS,expected);
assert.strictEqual(Object.keys(DUEL_EVOLUTION_CATALOG).length,12);
assert.strictEqual(Object.keys(DUEL_EVOLUTION_ADAPTERS).length,6);

function satisfyingBuild(id){
  const meta=DUEL_EVOLUTION_CATALOG[id],build={[meta.base]:3};
  for(let guard=0;guard<40;guard++){
    const status=getDuelEvolutionRequirementStatus(build,id);if(!status.missingTags.length)return build;
    const missing=status.missingTags[0];
    const candidate=DUEL_SKILL_KEYS.find(key=>!build[key]&&(getDuelSkill(key)?.tags||[]).includes(missing.tag));
    assert.ok(candidate,`No Duel skill can satisfy tag ${missing.tag} for ${id}`);build[candidate]=1;
  }
  throw new Error(`Could not satisfy ${id}`);
}
for(const id of expected){
  const build=satisfyingBuild(id),status=getDuelEvolutionRequirementStatus(build,id);assert.strictEqual(status.unlocked,true,`${id} should unlock`);
  const base=DUEL_EVOLUTION_CATALOG[id].base,rank2={...build,[base]:2};assert.strictEqual(getDuelEvolutionRequirementStatus(rank2,id).unlocked,false,`${id} must require Rank III base`);
  assert.ok(getDuelEvolutionChoiceHints(rank2,base).some(meta=>meta.id===id),`${id} exact final Rank-III pick must show a hint`);
  const rank1={...build,[base]:1};assert.ok(!getDuelEvolutionChoiceHints(rank1,base).some(meta=>meta.id===id),`${id} non-final base upgrade must not hint`);
}
assert.strictEqual(getDuelEvolution('chaosCrown').implemented,false);

// Thiên Hỏa: one real Fire hit adds exactly two secondary Heavenfire hits.
{
  const {match,p,o,round}=duel({fire:3});p.unlockedEvolutionSet=new Set(['heavenfire']);p.x=300;o.x=500;o.hitStun=10;p.skillTimers.fire=0;p.stats.moveSpeed=0;
  for(let i=0;i<40&&!round.events.some(e=>e.type==='hit'&&e.source==='heavenfire');i++)updateDuelRound(match,.033);
  assert.strictEqual(round.events.filter(e=>e.type==='hit'&&e.source==='heavenfire').length,2);
}

// Thiên Lôi Võng: Lightning Rank III adds two Chain branches.
{
  const {match,p,o,round}=duel({lightning:3});p.unlockedEvolutionSet=new Set(['stormNetwork']);p.x=300;o.x=500;o.hitStun=10;p.skillTimers.lightning=0;p.stats.moveSpeed=0;
  updateDuelRound(match,.033);assert.strictEqual(round.events.filter(e=>e.type==='hit'&&e.source==='stormNetwork').length,2);
}

// Kiếm Vực: 150px zone works outside ordinary Rank-III orbit contact range.
{
  const {match,p,o,round}=duel({orbit:3});p.unlockedEvolutionSet=new Set(['swordDomain']);p.x=400;o.x=520;o.hitStun=10;p.stats.moveSpeed=0;o.stats.moveSpeed=0;
  for(let i=0;i<18;i++)updateDuelRound(match,.033);
  approx(o.hp,93);assert.ok(round.events.some(e=>e.type==='area'&&e.skill==='swordDomain'));
}

// Dịch Triều: active owned poison creates a 1-second plague pulse.
{
  const {match,p,o,round}=duel({poison:3});p.unlockedEvolutionSet=new Set(['plagueTide']);p.hitStun=10;o.hitStun=10;p.stats.moveSpeed=0;o.stats.moveSpeed=0;
  o.duelEffects.poison={source:'player',until:4,dps:0,tick:99};for(let i=0;i<31;i++)updateDuelRound(match,.033);
  approx(o.hp,93);assert.ok(round.events.some(e=>e.type==='area'&&e.skill==='plagueTide'));
}

// Huyết Nguyệt: a real Rank-III Blood threshold heal gains +50% actual heal and 4 shield.
{
  const {match,p,o,round}=duel({blood:3});p.unlockedEvolutionSet=new Set(['crimsonMoon']);p.hp=50;p.stats.baseDamage=60;p.x=400;o.x=460;o.hitStun=10;p.attackTimer=0;
  updateDuelRound(match,.033);approx(p.hp,66.5);approx(p.shield,4);assert.ok(round.events.some(e=>e.type==='heal'&&e.source==='crimsonMoon'));
}

// Kỳ Điểm: Black Hole activation adds its separate damage/pull event.
{
  const {match,p,o,round}=duel({blackHole:3});p.unlockedEvolutionSet=new Set(['singularity']);p.x=400;o.x=560;o.hitStun=10;p.skillTimers.blackHole=0;p.stats.moveSpeed=0;o.stats.moveSpeed=0;
  updateDuelRound(match,.033);assert.ok(round.events.some(e=>e.type==='hit'&&e.source==='singularity'));assert.ok(round.events.some(e=>e.type==='area'&&e.skill==='singularity'));
}

const index=fs.readFileSync('index.html','utf8');
assert.ok(index.includes('js/duel-evolutions.js'));
assert.ok(index.includes('js/duel-evolutions-c3a.js'));
assert.ok(index.indexOf('js/duel-synergies-c2d.js')<index.indexOf('js/duel-evolutions.js'));
assert.ok(index.indexOf('js/duel-evolutions-c3a.js')<index.indexOf('js/duel-ui.js'));
const ui=fs.readFileSync('js/duel-ui.js','utf8');assert.ok(ui.includes('getDuelEvolutionChoiceHints'));assert.ok(ui.includes('MỞ SIÊU CẤP'));
console.log('V0.17 C3A 6-Siêu-Cấp smoke: PASS');