const fs=require('fs');
const vm=require('vm');
const assert=require('assert');
function load(path){vm.runInThisContext(fs.readFileSync(path,'utf8'),{filename:path});}
function approx(a,b,e=1e-5){assert.ok(Math.abs(a-b)<=e,`expected ${a} ≈ ${b}`);}
function entry(id,build){return{id,name:id,build:{...build}};}
function duel(a,b={},rng=()=>.99){const match=createDuelMatch(entry('player',a),entry('opponent',b),{rng});const round=startDuelRound(match);return{match,round,p:round.fighters.player,o:round.fighters.opponent};}
for(const file of ['duel-skills','duel-engine','duel-skills-d6a','duel-skills-d6b','duel-skills-d6c','duel-skills-d6d','duel-skills-d6e','duel-skills-d6f','duel-skills-d6g','duel-synergies','duel-synergies-c2a','duel-synergies-c2b','duel-synergies-c2c','duel-synergies-c2d'])load(`js/${file}.js`);

const c2d=['bloodSymbiosis','nourishingPearls','thunderStride','sealedSoul','heavenfallBurn','guardianRetaliation'];
assert.deepStrictEqual(DUEL_C2D_SYNERGY_IDS,c2d);
assert.strictEqual(Object.keys(DUEL_SYNERGY_CATALOG).length,28);
assert.strictEqual(Object.keys(DUEL_SYNERGY_ADAPTERS).length,28,'C2D must finish at 28/28 Duel Hợp Đạo');
for(const [id,base] of Object.entries(DUEL_SYNERGY_CATALOG)){
  const meta=getDuelSynergy(id);
  assert.strictEqual(meta.implemented,true,`${id} is not implemented`);
  assert.ok(meta.desc.length>55,`${id} lacks explicit Duel description`);
  const build=Object.fromEntries((base.requires.skills||[]).map(key=>[key,1]));
  assert.strictEqual(getDuelSynergyRequirementStatus(build,id).unlocked,true,`${id} cannot unlock from its declared Duel requirements`);
}

// Huyết Mạch Cộng Sinh: real HP damage caused by a Blood Link retaliation heals 25% at Vampiric Touch Rank I.
{
  const {match,p,o,round}=duel({bloodLink:1,vampiricTouch:1});
  p.x=400;o.x=460;p.hitStun=10;p.skillTimers.bloodLink=0;
  updateDuelRound(match,.033);
  approx(o.hp,100-12*.18);
  approx(p.hp,100-12+(12*.18*.25));
  assert.ok(round.events.some(e=>e.type==='heal'&&e.source==='bloodSymbiosis'));
}

// Linh Châu Dưỡng Mệnh: a real Spirit Pearl projectile hit produces real healing and therefore feeds future Pearl charge normally.
{
  const {match,p,o,round}=duel({spiritPearl:1,xpHeal:1});
  p.x=400;o.x=500;p.hp=90;p.hitStun=10;o.hitStun=10;
  p.duelEffects.spiritPearl.pearls=1;p.duelEffects.spiritPearl.fireTimer=0;
  for(let i=0;i<10&&p.totalHealing===0;i++)updateDuelRound(match,.033);
  approx(p.hp,91);approx(p.totalHealing,1);
  assert.ok(round.events.some(e=>e.type==='heal'&&e.source==='nourishingPearls'));
}

// Phong Lôi Bộ: a real Stride Shock hit adds the advertised Chain lightning follow-up.
{
  const {match,p,o,round}=duel({strideShock:1,lightning:1});
  p.x=400;o.x=450;p.hitStun=10;o.hitStun=10;
  p.duelEffects.strideShock.distance=219;p.duelEffects.strideShock.lastX=398;
  updateDuelRound(match,.033);
  approx(o.hp,78); // 14 stride + 8 thunder stride.
  assert.ok(round.events.some(e=>e.type==='cast'&&e.skill==='thunderStride'));
}

// Phong Hồn Tử Ấn: Soul Bind creates a short mark when absent, then a later Soul Bind extends the owned mark by 1.5s.
{
  const {match,p,o,round}=duel({soulBind:1,deathMark:1});
  p.x=300;o.x=500;p.hitStun=10;o.hitStun=10;p.skillTimers.soulBind=0;
  updateDuelRound(match,.033);
  const firstUntil=o.duelEffects.deathMark.until;
  approx(firstUntil-round.time,3);
  approx(o.duelEffects.deathMark.bonus,.12);
  p.skillTimers.soulBind=0;
  updateDuelRound(match,.033);
  approx(o.duelEffects.deathMark.until,firstUntil+1.5);
  assert.ok(round.events.some(e=>e.type==='status'&&e.status==='sealedSoul'));
}

// Thiên Hỏa Tinh Vẫn: a real Meteor impact applies the standard 3-second Burn in addition to meteorBurn.
{
  const {match,p,o,round}=duel({meteorSeal:1,burn:1});
  p.x=300;o.x=500;p.hitStun=10;o.hitStun=10;p.skillTimers.meteorSeal=0;
  for(let i=0;i<30&&!round.events.some(e=>e.type==='status'&&e.status==='heavenfallBurn');i++)updateDuelRound(match,.033);
  assert.ok(round.events.some(e=>e.type==='hit'&&e.source==='meteorSeal'));
  assert.ok(round.events.some(e=>e.type==='status'&&e.status==='heavenfallBurn'));
  assert.strictEqual(o.statuses.burnSource,'player');
  approx(o.statuses.burnDps,2);
  assert.ok(o.statuses.burnUntil-round.time>2.9);
}

// Hộ Pháp Phản Chấn: Guardian absorption can trigger ready Retaliate even though fighter HP/shield took zero damage.
{
  const {match,p,o,round}=duel({guardianIdol:1,retaliate:1});
  p.x=400;o.x=460;p.hitStun=10;o.hitStun=10;p.skillTimers.guardianIdol=0;
  updateDuelRound(match,.033);
  assert.strictEqual(p.duelEffects.guardianIdol.hp,24);
  p.skillTimers.retaliate=0;o.hitStun=0;o.attackTimer=0;
  updateDuelRound(match,.033);
  approx(p.hp,100);
  assert.strictEqual(p.duelEffects.guardianIdol.hp,12);
  approx(o.hp,90);
  assert.ok(p.skillTimers.retaliate>3.7);
  assert.ok(round.events.some(e=>e.type==='area'&&e.skill==='guardianRetaliation'));
}

// Exact public layering: foundation → C2A → C2B → C2C → C2D → UI.
const index=fs.readFileSync('index.html','utf8');
for(const name of ['duel-synergies.js','duel-synergies-c2a.js','duel-synergies-c2b.js','duel-synergies-c2c.js','duel-synergies-c2d.js'])assert.ok(index.includes(name),`public artifact missing ${name}`);
assert.ok(index.indexOf('duel-synergies-c2c.js')<index.indexOf('duel-synergies-c2d.js'));
assert.ok(index.indexOf('duel-synergies-c2d.js')<index.indexOf('duel-ui.js'));
console.log('V0.17 C2D all-28 Duel Hợp Đạo smoke: PASS');