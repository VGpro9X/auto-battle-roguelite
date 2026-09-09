const fs=require('fs');
const vm=require('vm');
const assert=require('assert');

function load(path){
  vm.runInThisContext(fs.readFileSync(path,'utf8'),{filename:path});
}
function makeRng(seed=0x5eed1234){
  let value=seed>>>0;
  return()=>{
    value=(Math.imul(value,1664525)+1013904223)>>>0;
    return value/0x100000000;
  };
}
function approx(actual,expected,epsilon=1e-9){
  assert.ok(Math.abs(actual-expected)<=epsilon,`expected ${actual} ≈ ${expected}`);
}

load('js/duel-skills.js');
load('js/duel-tournament.js');
load('js/duel-engine.js');
load('js/duel-skills-d6a.js');
load('js/duel-skills-d6b.js');

// Duel content contract.
assert.strictEqual(DUEL_MAX_RANK,3,'Duel skills must cap at Rank III');
assert.strictEqual(DUEL_SKILL_KEYS.length,32,'V0.17 D6B must expose exactly 32 Duel skill adapters');
const d6a=['execution','berserk','glassCannon','retaliate','thorns','lastStand','deathMark','poison'];
const d6b=['echoShot','pointBlank','elementalMastery','shieldPulse','sacrifice','blackHole','luckyStar','secondWind'];
for(const key of [...d6a,...d6b]){
  assert.ok(DUEL_SKILL_KEYS.includes(key),`missing Duel skill ${key}`);
  assert.ok(getDuelSkillBehavior(key),`missing Duel behavior ${key}`);
}
const starterBuild={};
const starterChoices=getDuelChoices(starterBuild,{starter:true,count:3,rng:makeRng(1)});
assert.strictEqual(starterChoices.length,3,'starter screen must offer three choices');
assert.strictEqual(new Set(starterChoices).size,3,'starter choices must be unique');
const rankKey=starterChoices[0];
assert.ok(addDuelSkillRank(starterBuild,rankKey));
assert.ok(addDuelSkillRank(starterBuild,rankKey));
assert.ok(addDuelSkillRank(starterBuild,rankKey));
assert.strictEqual(getDuelSkillRank(starterBuild,rankKey),3);
assert.strictEqual(addDuelSkillRank(starterBuild,rankKey),false,'Rank III must be a hard visible maximum');

// Defensive builds must not be interpreted as ranged builds just because they avoid melee offense.
const defensiveProfile=getDuelBuildProfile({vitality:2,armor:2,heal:1,barrier:1,lastStand:1,secondWind:1});
assert.ok(defensiveProfile.preferredDistance<120,`defensive build drifted too far: ${defensiveProfile.preferredDistance}px`);
assert.ok(!defensiveProfile.style.includes('Tầm xa'),`defensive build was mislabeled as ranged: ${defensiveProfile.style}`);

// 64-player single-elimination tournament contract.
const tournament=createDuelTournament(makeRng(7));
assert.strictEqual(tournament.bracket.length,64);
assert.strictEqual(Object.keys(tournament.fighters).length,64);
for(const fighter of Object.values(tournament.fighters)){
  if(fighter.isPlayer)continue;
  const ranks=Object.values(fighter.build);
  assert.strictEqual(ranks.reduce((sum,rank)=>sum+rank,0),2,'every AI must receive exactly two starter ranks');
  assert.strictEqual(ranks.length,2,'AI starter skills must be two distinct skills');
}
const expectedSizes=[32,16,8,4,2,1];
for(let i=0;i<expectedSizes.length;i++){
  const result=resolveDuelTournamentStage(tournament,true,{playerRoundWins:2,opponentRoundWins:i%2,rng:makeRng(100+i)});
  assert.strictEqual(tournament.bracket.length,expectedSizes[i]);
  if(i<expectedSizes.length-1)assert.strictEqual(result.status,'advance');
  else assert.strictEqual(result.status,'champion');
}
assert.strictEqual(tournament.championId,'player');
assert.strictEqual(tournament.matchWins,6,'a 64-player champion must win exactly six matchups');
assert.strictEqual(tournament.history.length,6);
assert.strictEqual(tournament.rewardCount,5,'there are five build rewards before the final; no post-final reward');

// Mechanical-truth anchors: no hidden crit, skills begin on their stated cooldown,
// and Huyết Chiến/Tử Chiến values are explicit and deterministic.
const nakedStats=computeDuelStats({build:{}});
assert.strictEqual(nakedStats.critChance,0,'Duel must not grant hidden base crit');
const timerMatch=createDuelMatch(
  {id:'player',name:'BẠN',build:{fire:1,deathMark:3,retaliate:3,blackHole:3,luckyStar:3,sacrifice:3}},
  {id:'opponent',name:'ĐỐI THỦ',build:{}},
  {rng:makeRng(21)}
);
const timerRound=startDuelRound(timerMatch);
approx(timerRound.fighters.player.skillTimers.fire,4.2);
approx(timerRound.fighters.player.skillTimers.deathMark,6);
approx(timerRound.fighters.player.skillTimers.blackHole,4);
approx(timerRound.fighters.player.skillTimers.luckyStar,4.6);
approx(timerRound.fighters.player.skillTimers.sacrifice,5);
assert.strictEqual(timerRound.fighters.player.skillTimers.retaliate,0,'reactive cooldown must start ready');
assert.strictEqual(timerRound.fighters.player.attackTimer,0,'basic attack may be ready immediately');
assert.strictEqual(timerRound.fighters.player.dashTimer,0,'dash may be ready immediately');
approx(duelPressureDamageMultiplier({time:0}),1);
approx(duelPressureDamageMultiplier({time:45}),1);
approx(duelPressureDamageMultiplier({time:52.5}),1.375);
approx(duelPressureDamageMultiplier({time:60}),2);
approx(duelSustainMultiplier({time:45}),1);
approx(duelSustainMultiplier({time:52.5}),.75);
approx(duelSustainMultiplier({time:60}),0);

// D6A behavior checks.
approx(computeDuelStats({build:{glassCannon:3}}).maxHp,76);
{
  const match=createDuelMatch(
    {id:'player',name:'BẠN',build:{execution:3}},
    {id:'opponent',name:'ĐỐI THỦ',build:{}},
    {rng:()=>.99}
  );
  const round=startDuelRound(match);
  round.fighters.player.x=450;round.fighters.opponent.x=500;round.fighters.opponent.hp=40;
  updateDuelRound(match,.033);
  approx(round.fighters.opponent.hp,22.6,1e-6);
}
{
  const match=createDuelMatch(
    {id:'player',name:'BẠN',build:{lastStand:3}},
    {id:'opponent',name:'ĐỐI THỦ',build:{}},
    {rng:()=>.99}
  );
  const round=startDuelRound(match);
  round.fighters.player.x=450;round.fighters.opponent.x=500;round.fighters.player.hp=20;
  updateDuelRound(match,.033);
  approx(round.fighters.player.hp,10.4,1e-6);
}
{
  const match=createDuelMatch(
    {id:'player',name:'BẠN',build:{thorns:3}},
    {id:'opponent',name:'ĐỐI THỦ',build:{}},
    {rng:()=>.99}
  );
  const round=startDuelRound(match);
  round.fighters.player.x=450;round.fighters.opponent.x=500;
  updateDuelRound(match,.033);
  approx(round.fighters.opponent.hp,80,1e-6);
}
{
  const match=createDuelMatch(
    {id:'player',name:'BẠN',build:{retaliate:3}},
    {id:'opponent',name:'ĐỐI THỦ',build:{}},
    {rng:()=>.99}
  );
  const round=startDuelRound(match);
  round.fighters.player.x=450;round.fighters.opponent.x=500;
  updateDuelRound(match,.033);
  approx(round.fighters.opponent.hp,64,1e-6);
  assert.ok(round.fighters.player.skillTimers.retaliate>2.4,'retaliate cooldown was not consumed');
}
{
  const match=createDuelMatch(
    {id:'player',name:'BẠN',build:{poison:3}},
    {id:'opponent',name:'ĐỐI THỦ',build:{}},
    {rng:()=>0}
  );
  const round=startDuelRound(match);
  round.fighters.player.x=450;round.fighters.opponent.x=500;
  updateDuelRound(match,.033);
  assert.ok(round.fighters.opponent.duelEffects.poison,'poison did not apply on deterministic basic hit');
  approx(round.fighters.opponent.duelEffects.poison.dps,5.5);
}
{
  const match=createDuelMatch(
    {id:'player',name:'BẠN',build:{deathMark:3}},
    {id:'opponent',name:'ĐỐI THỦ',build:{}},
    {rng:()=>.99}
  );
  const round=startDuelRound(match);
  round.fighters.player.skillTimers.deathMark=0;
  updateDuelRound(match,.033);
  assert.ok(round.fighters.opponent.duelEffects.deathMark?.until>round.time,'death mark did not activate');
  approx(round.fighters.opponent.duelEffects.deathMark.bonus,.30);
}

// D6B behavior checks.
{
  const match=createDuelMatch(
    {id:'player',name:'BẠN',build:{secondWind:3}},
    {id:'opponent',name:'ĐỐI THỦ',build:{power:3}},
    {rng:()=>.99}
  );
  const round=startDuelRound(match);
  round.fighters.player.x=450;round.fighters.opponent.x=500;round.fighters.player.hp=5;
  updateDuelRound(match,.033);
  assert.ok(round.fighters.player.hp>=49,'Second Wind did not revive to 50% max HP');
  assert.strictEqual(round.fighters.player.duelEffects.secondWindCharges,0,'Second Wind charge was not consumed');
  assert.ok(!round.ended,'Second Wind should prevent the round from ending on its saved fatal hit');
}
{
  const match=createDuelMatch(
    {id:'player',name:'BẠN',build:{shieldPulse:3}},
    {id:'opponent',name:'ĐỐI THỦ',build:{}},
    {rng:()=>.99}
  );
  const round=startDuelRound(match);
  round.fighters.player.x=450;round.fighters.opponent.x=500;round.fighters.player.shield=1;
  updateDuelRound(match,.033);
  assert.ok(round.fighters.opponent.hp<60,`Shield Pulse did not fire on shield break: ${round.fighters.opponent.hp}`);
  assert.strictEqual(round.fighters.player.shield,0);
}
{
  const match=createDuelMatch(
    {id:'player',name:'BẠN',build:{blackHole:3}},
    {id:'opponent',name:'ĐỐI THỦ',build:{}},
    {rng:()=>.99}
  );
  const round=startDuelRound(match);
  round.fighters.player.x=300;round.fighters.opponent.x=600;round.fighters.player.skillTimers.blackHole=0;
  updateDuelRound(match,.033);
  assert.ok(round.fighters.opponent.x<500,`Black Hole did not pull target: ${round.fighters.opponent.x}`);
  assert.ok(round.fighters.opponent.hp<100,'Black Hole did not deal damage');
}
{
  const match=createDuelMatch(
    {id:'player',name:'BẠN',build:{pointBlank:3}},
    {id:'opponent',name:'ĐỐI THỦ',build:{}},
    {rng:()=>.99}
  );
  const round=startDuelRound(match);
  round.fighters.player.x=450;round.fighters.opponent.x=500;
  updateDuelRound(match,.033);
  assert.ok(round.fighters.opponent.hp<84,`Point Blank close-range bonus missing: ${round.fighters.opponent.hp}`);
}
{
  const match=createDuelMatch(
    {id:'player',name:'BẠN',build:{echoShot:3}},
    {id:'opponent',name:'ĐỐI THỦ',build:{vitality:3}},
    {rng:()=>.99}
  );
  const round=startDuelRound(match);
  round.fighters.player.x=450;round.fighters.opponent.x=500;
  for(let i=0;i<3;i++){
    round.fighters.player.attackTimer=0;
    updateDuelRound(match,.033);
    if(round.ended)break;
  }
  assert.ok(round.projectiles.some(projectile=>projectile.source==='echoShot'),'Echo Shot did not spawn after three Rank III basic hits');
}
{
  const match=createDuelMatch(
    {id:'player',name:'BẠN',build:{luckyStar:3}},
    {id:'opponent',name:'ĐỐI THỦ',build:{}},
    {rng:()=>.5}
  );
  const round=startDuelRound(match);
  round.fighters.player.skillTimers.luckyStar=0;
  updateDuelRound(match,.033);
  assert.ok(round.fighters.player.shield>=24,'Lucky Star deterministic shield branch failed');
}

// A real deterministic best-of-3 must terminate through the Duel engine.
const match=createDuelMatch(
  {id:'player',name:'BẠN',build:{power:3,rapid:3,fire:3,lightning:3,crit:3,execution:2,echoShot:2}},
  {id:'opponent',name:'ĐỐI THỦ',build:{vitality:1,armor:1,lastStand:1,secondWind:1}},
  {rng:makeRng(99)}
);
startDuelRound(match);
let ticks=0;
while(!match.over&&ticks<40000){
  const round=updateDuelRound(match,.033);
  if(round?.ended)settleDuelRound(match);
  ticks++;
}
assert.ok(match.over,'best-of-3 did not terminate');
assert.ok(match.winner==='player'||match.winner==='opponent');
assert.strictEqual(match.wins[match.winner],2,'winner must reach two round wins');
assert.ok(match.wins[match.loser]<=1,'loser cannot exceed one round win in best-of-3');

// Public artifact wiring must include the replaceable Duel renderer and D6 modules.
const index=fs.readFileSync('index.html','utf8');
for(const required of [
  'css/v017-duel.css',
  'js/duel-skills.js',
  'js/duel-tournament.js',
  'js/duel-engine.js',
  'js/duel-skills-d6a.js',
  'js/duel-skills-d6b.js',
  'js/duel-renderer.js',
  'js/duel-ui.js',
  'js/duel-ui-sync.js'
])assert.ok(index.includes(required),`index.html missing ${required}`);
assert.ok(index.indexOf('js/duel-engine.js')<index.indexOf('js/duel-skills-d6a.js'),'Duel behavior modules must load after registry engine');
assert.ok(index.indexOf('js/duel-skills-d6a.js')<index.indexOf('js/duel-skills-d6b.js'),'D6B must load after D6A');
assert.ok(index.indexOf('js/duel-skills-d6b.js')<index.indexOf('js/duel-ui.js'),'D6 skills must exist before Duel UI builds choices');
const engineSource=fs.readFileSync('js/duel-engine.js','utf8');
assert.ok(!engineSource.includes('burn-lite'),'Hỏa Cầu must not carry an undocumented burn effect');
assert.ok(engineSource.includes('registerDuelSkillBehavior'),'Duel engine behavior registry is missing');
assert.ok(engineSource.includes('onFatalDamage'),'Duel fatal-damage extension hook is missing');
assert.ok(engineSource.includes('spawnProjectile'),'Duel behavior projectile helper is missing');

console.log('V0.17 Duel smoke test passed:',{
  skillAdapters:DUEL_SKILL_KEYS.length,
  championWins:tournament.matchWins,
  rewardCount:tournament.rewardCount,
  deterministicWinner:match.winner,
  ticks
});
