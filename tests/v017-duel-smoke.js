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

// Duel content contract.
assert.strictEqual(DUEL_MAX_RANK,3,'Duel skills must cap at Rank III');
assert.strictEqual(DUEL_SKILL_KEYS.length,16,'V0.17 prototype must expose exactly 16 Duel skill adapters');
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
const defensiveProfile=getDuelBuildProfile({vitality:2,armor:2,heal:1,barrier:1});
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
  {id:'player',name:'BẠN',build:{fire:1}},
  {id:'opponent',name:'ĐỐI THỦ',build:{}},
  {rng:makeRng(21)}
);
const timerRound=startDuelRound(timerMatch);
approx(timerRound.fighters.player.skillTimers.fire,4.2);
assert.strictEqual(timerRound.fighters.player.attackTimer,0,'basic attack may be ready immediately');
assert.strictEqual(timerRound.fighters.player.dashTimer,0,'dash may be ready immediately');
approx(duelPressureDamageMultiplier({time:0}),1);
approx(duelPressureDamageMultiplier({time:45}),1);
approx(duelPressureDamageMultiplier({time:52.5}),1.375);
approx(duelPressureDamageMultiplier({time:60}),2);
approx(duelSustainMultiplier({time:45}),1);
approx(duelSustainMultiplier({time:52.5}),.75);
approx(duelSustainMultiplier({time:60}),0);

// A real deterministic best-of-3 must terminate through the Duel engine.
const match=createDuelMatch(
  {id:'player',name:'BẠN',build:{power:3,rapid:3,fire:3,lightning:3,crit:3}},
  {id:'opponent',name:'ĐỐI THỦ',build:{vitality:1,armor:1}},
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

// Public artifact wiring must include the replaceable Duel renderer layer.
const index=fs.readFileSync('index.html','utf8');
for(const required of [
  'css/v017-duel.css',
  'js/duel-skills.js',
  'js/duel-tournament.js',
  'js/duel-engine.js',
  'js/duel-renderer.js',
  'js/duel-ui.js'
])assert.ok(index.includes(required),`index.html missing ${required}`);
const engineSource=fs.readFileSync('js/duel-engine.js','utf8');
assert.ok(!engineSource.includes('burn-lite'),'Hỏa Cầu must not carry an undocumented burn effect');

console.log('V0.17 Duel smoke test passed:',{
  skillAdapters:DUEL_SKILL_KEYS.length,
  championWins:tournament.matchWins,
  rewardCount:tournament.rewardCount,
  deterministicWinner:match.winner,
  ticks
});
