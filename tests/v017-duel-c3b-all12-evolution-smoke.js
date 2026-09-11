const fs=require('fs');
const vm=require('vm');
const assert=require('assert');
function load(path){vm.runInThisContext(fs.readFileSync(path,'utf8'),{filename:path});}
function approx(a,b,e=1e-5){assert.ok(Math.abs(a-b)<=e,`expected ${a} ≈ ${b}`);}
function entry(id,build){return{id,name:id,build:{...build}};}
function duel(a,b={},rng=()=>.99){const match=createDuelMatch(entry('player',a),entry('opponent',b),{rng});const round=startDuelRound(match);return{match,round,p:round.fighters.player,o:round.fighters.opponent};}
load('js/skills.js');
for(const file of ['duel-skills','duel-engine','duel-skills-d6a','duel-skills-d6b','duel-skills-d6c','duel-skills-d6d','duel-skills-d6e','duel-skills-d6f','duel-skills-d6g','duel-synergies','duel-synergies-c2a','duel-synergies-c2b','duel-synergies-c2c','duel-synergies-c2d','duel-evolutions','duel-evolutions-c3a','duel-evolutions-c3b'])load(`js/${file}.js`);

const c3b=['chaosCrown','immortalAegis','phantomLegion','heavenNet','bloodWeb','starfallCataclysm'];
assert.deepStrictEqual(DUEL_C3B_EVOLUTION_IDS,c3b);
assert.strictEqual(Object.keys(DUEL_EVOLUTION_CATALOG).length,12);
assert.strictEqual(Object.keys(DUEL_EVOLUTION_ADAPTERS).length,12,'C3B must finish at 12/12 Duel Siêu Cấp');

function satisfyingBuild(id){
  const meta=DUEL_EVOLUTION_CATALOG[id],build={[meta.base]:3};
  for(let guard=0;guard<50;guard++){
    const status=getDuelEvolutionRequirementStatus(build,id);if(!status.missingTags.length)return build;
    const missing=status.missingTags[0];
    const candidate=DUEL_SKILL_KEYS.find(key=>!build[key]&&(getDuelSkill(key)?.tags||[]).includes(missing.tag));
    assert.ok(candidate,`No Duel skill can satisfy ${missing.tag} for ${id}`);build[candidate]=1;
  }
  throw new Error(`Could not satisfy ${id}`);
}
for(const id of Object.keys(DUEL_EVOLUTION_CATALOG)){
  const meta=getDuelEvolution(id),build=satisfyingBuild(id);assert.strictEqual(meta.implemented,true,`${id} not implemented`);assert.ok(meta.desc.length>80,`${id} lacks explicit Duel description`);
  assert.strictEqual(getDuelEvolutionRequirementStatus(build,id).unlocked,true,`${id} requirement mismatch`);
  const base=DUEL_EVOLUTION_CATALOG[id].base,rank2={...build,[base]:2};assert.ok(getDuelEvolutionChoiceHints(rank2,base).some(item=>item.id===id),`${id} exact final-piece hint missing`);
}

// Hỗn Mang Vương Miện: one base Chaos activation adds two independent crown variants.
{
  const {match,p,o,round}=duel({chaosOrb:3},{vitality:3},()=>.1);p.unlockedEvolutionSet=new Set(['chaosCrown']);p.hitStun=10;o.hitStun=10;p.skillTimers.chaosOrb=0;p.stats.moveSpeed=0;o.stats.moveSpeed=0;
  updateDuelRound(match,.033);assert.strictEqual(round.events.filter(e=>e.skill==='chaosCrown').length,2);
}

// Bất Diệt Thuẫn: Rank-III Barrier cast totals 70 shield before sustain scaling.
{
  const {match,p,o}=duel({barrier:3});p.unlockedEvolutionSet=new Set(['immortalAegis']);p.x=300;o.x=500;o.hitStun=10;p.stats.moveSpeed=0;o.stats.moveSpeed=0;p.skillTimers.barrier=0;
  updateDuelRound(match,.033);approx(p.shield,70);
}

// Vạn Ảnh Phân Thân: each Rank-III Afterimage cycle creates three clones total.
{
  const {match,p,o}=duel({afterimage:3});p.unlockedEvolutionSet=new Set(['phantomLegion']);p.hitStun=10;o.hitStun=10;p.skillTimers.afterimage=0;
  updateDuelRound(match,.033);assert.strictEqual(p.duelEffects.afterimages.length,3);
}

// Thiên La Địa Võng: an armed mine can chain-detonate another armed mine within 120px after 0.12s.
{
  const {match,p,o,round}=duel({runeMine:3});p.unlockedEvolutionSet=new Set(['heavenNet']);p.hitStun=10;o.hitStun=10;p.stats.moveSpeed=0;o.stats.moveSpeed=0;p.skillTimers.runeMine=99;p.x=400;o.x=450;
  p.duelEffects.runeMines=[{x:400,armedAt:0,until:5,chainAt:null,chainScale:1,dead:false},{x:300,armedAt:0,until:5,chainAt:null,chainScale:1,dead:false}];
  for(let i=0;i<6;i++)updateDuelRound(match,.033);
  assert.ok(round.events.some(e=>e.type==='area'&&e.skill==='heavenNet'&&e.chain===true));
}

// Huyết Võng: damage dealt inside the Blood Link window mirrors 25% as Chain damage.
{
  const {match,p,o,round}=duel({bloodLink:3});p.unlockedEvolutionSet=new Set(['bloodWeb']);p.duelEffects.bloodLinkUntil=10;p.stats.baseDamage=20;p.x=400;o.x=460;o.hitStun=10;p.attackTimer=0;
  updateDuelRound(match,.033);assert.ok(round.events.some(e=>e.type==='hit'&&e.source==='bloodWeb'));approx(o.hp,75);
}

// Tinh Hà Trụy Lạc: one Meteor cast schedules and lands both 70% secondary meteors while the target is still alive.
{
  const {match,p,o,round}=duel({meteorSeal:3},{vitality:3});p.unlockedEvolutionSet=new Set(['starfallCataclysm']);p.hitStun=10;o.hitStun=10;p.stats.moveSpeed=0;o.stats.moveSpeed=0;p.x=300;o.x=500;p.skillTimers.meteorSeal=0;
  updateDuelRound(match,.033);assert.strictEqual(p.duelEvolutionEffects.starfallSecondaries.length,2);
  for(let i=0;i<40&&!round.ended;i++)updateDuelRound(match,.033);
  assert.strictEqual(round.events.filter(e=>e.type==='hit'&&e.source==='starfallCataclysm').length,2);
}

// Player and AI derive the same unlocked Siêu Cấp from the same build.
{
  const build=satisfyingBuild('heavenfire'),{round}=duel(build,build);assert.ok(round.fighters.player.unlockedEvolutionSet.has('heavenfire'));assert.ok(round.fighters.opponent.unlockedEvolutionSet.has('heavenfire'));
}

const index=fs.readFileSync('index.html','utf8');
for(const name of ['duel-evolutions.js','duel-evolutions-c3a.js','duel-evolutions-c3b.js'])assert.ok(index.includes(name),`public artifact missing ${name}`);
assert.ok(index.indexOf('duel-synergies-c2d.js')<index.indexOf('duel-evolutions.js'));
assert.ok(index.indexOf('duel-evolutions.js')<index.indexOf('duel-evolutions-c3a.js'));
assert.ok(index.indexOf('duel-evolutions-c3a.js')<index.indexOf('duel-evolutions-c3b.js'));
assert.ok(index.indexOf('duel-evolutions-c3b.js')<index.indexOf('duel-ui.js'));
console.log('V0.17 C3B all-12 Duel Siêu Cấp smoke: PASS');