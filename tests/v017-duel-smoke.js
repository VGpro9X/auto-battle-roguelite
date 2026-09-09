const fs=require('fs');
const vm=require('vm');
const assert=require('assert');

function load(path){vm.runInThisContext(fs.readFileSync(path,'utf8'),{filename:path});}
function makeRng(seed=0x5eed1234){let v=seed>>>0;return()=>{v=(Math.imul(v,1664525)+1013904223)>>>0;return v/0x100000000;};}
function approx(actual,expected,epsilon=1e-9){assert.ok(Math.abs(actual-expected)<=epsilon,`expected ${actual} ≈ ${expected}`);}
function duel(buildA,buildB={},rng=()=>.99){const match=createDuelMatch({id:'player',name:'BẠN',build:buildA},{id:'opponent',name:'ĐỐI THỦ',build:buildB},{rng});const round=startDuelRound(match);return{match,round};}

load('js/duel-skills.js');
load('js/duel-tournament.js');
load('js/duel-engine.js');
load('js/duel-skills-d6a.js');
load('js/duel-skills-d6b.js');

assert.strictEqual(DUEL_MAX_RANK,3,'Duel skills must cap at Rank III');
assert.strictEqual(DUEL_SKILL_KEYS.length,32,'V0.17 D6B must expose exactly 32 Duel skill adapters');
const d6a=['execution','berserk','glassCannon','retaliate','thorns','lastStand','deathMark','poison'];
const d6b=['echoShot','pointBlank','elementalMastery','shieldPulse','sacrifice','blackHole','luckyStar','secondWind'];
for(const key of [...d6a,...d6b]){assert.ok(DUEL_SKILL_KEYS.includes(key),`missing Duel skill ${key}`);assert.ok(getDuelSkillBehavior(key),`missing Duel behavior ${key}`);}

const starterBuild={};
const choices=getDuelChoices(starterBuild,{starter:true,count:3,rng:makeRng(1)});
assert.strictEqual(choices.length,3);assert.strictEqual(new Set(choices).size,3);
for(let i=0;i<3;i++)assert.ok(addDuelSkillRank(starterBuild,choices[0]));
assert.strictEqual(getDuelSkillRank(starterBuild,choices[0]),3);
assert.strictEqual(addDuelSkillRank(starterBuild,choices[0]),false);

const defensive=getDuelBuildProfile({vitality:2,armor:2,heal:1,barrier:1,lastStand:1,secondWind:1});
assert.ok(defensive.preferredDistance<120);assert.ok(!defensive.style.includes('Tầm xa'));

const tournament=createDuelTournament(makeRng(7));
assert.strictEqual(tournament.bracket.length,64);assert.strictEqual(Object.keys(tournament.fighters).length,64);
for(const fighter of Object.values(tournament.fighters)){if(fighter.isPlayer)continue;const ranks=Object.values(fighter.build);assert.strictEqual(ranks.reduce((a,b)=>a+b,0),2);assert.strictEqual(ranks.length,2);}
for(const [i,size] of [32,16,8,4,2,1].entries()){const result=resolveDuelTournamentStage(tournament,true,{playerRoundWins:2,opponentRoundWins:i%2,rng:makeRng(100+i)});assert.strictEqual(tournament.bracket.length,size);assert.strictEqual(result.status,i===5?'champion':'advance');}
assert.strictEqual(tournament.championId,'player');assert.strictEqual(tournament.matchWins,6);assert.strictEqual(tournament.history.length,6);assert.strictEqual(tournament.rewardCount,5);

const naked=computeDuelStats({build:{}});assert.strictEqual(naked.critChance,0);
{
  const {round}=duel({fire:1,deathMark:3,retaliate:3,blackHole:3,luckyStar:3,sacrifice:3});
  approx(round.fighters.player.skillTimers.fire,4.2);approx(round.fighters.player.skillTimers.deathMark,6);approx(round.fighters.player.skillTimers.blackHole,4);approx(round.fighters.player.skillTimers.luckyStar,4.6);approx(round.fighters.player.skillTimers.sacrifice,5);
  assert.strictEqual(round.fighters.player.skillTimers.retaliate,0);assert.strictEqual(round.fighters.player.attackTimer,0);assert.strictEqual(round.fighters.player.dashTimer,0);
}
approx(duelPressureDamageMultiplier({time:0}),1);approx(duelPressureDamageMultiplier({time:45}),1);approx(duelPressureDamageMultiplier({time:52.5}),1.375);approx(duelPressureDamageMultiplier({time:60}),2);
approx(duelSustainMultiplier({time:45}),1);approx(duelSustainMultiplier({time:52.5}),.75);approx(duelSustainMultiplier({time:60}),0);

approx(computeDuelStats({build:{glassCannon:3}}).maxHp,76);
{
  const {match,round}=duel({execution:3});round.fighters.player.x=450;round.fighters.opponent.x=500;round.fighters.opponent.hp=40;updateDuelRound(match,.033);approx(round.fighters.opponent.hp,22.6,1e-6);
}
{
  const {match,round}=duel({lastStand:3});round.fighters.player.x=450;round.fighters.opponent.x=500;round.fighters.player.hp=20;updateDuelRound(match,.033);approx(round.fighters.player.hp,10.4,1e-6);
}
{
  const {match,round}=duel({thorns:3});round.fighters.player.x=450;round.fighters.opponent.x=500;updateDuelRound(match,.033);approx(round.fighters.opponent.hp,80,1e-6);
}
{
  const {match,round}=duel({retaliate:3});round.fighters.player.x=450;round.fighters.opponent.x=500;updateDuelRound(match,.033);approx(round.fighters.opponent.hp,64,1e-6);assert.ok(round.fighters.player.skillTimers.retaliate>2.4);
}
{
  const {match,round}=duel({poison:3},{},()=>0);round.fighters.player.x=450;round.fighters.opponent.x=500;updateDuelRound(match,.033);assert.ok(round.fighters.opponent.duelEffects.poison);approx(round.fighters.opponent.duelEffects.poison.dps,5.5);
}
{
  const {match,round}=duel({deathMark:3});round.fighters.player.skillTimers.deathMark=0;updateDuelRound(match,.033);assert.ok(round.fighters.opponent.duelEffects.deathMark?.until>round.time);approx(round.fighters.opponent.duelEffects.deathMark.bonus,.30);
}

{
  const {match,round}=duel({secondWind:3},{power:3});round.fighters.player.x=450;round.fighters.opponent.x=500;round.fighters.player.hp=5;updateDuelRound(match,.033);assert.ok(round.fighters.player.hp>=49);assert.strictEqual(round.fighters.player.duelEffects.secondWindCharges,0);assert.ok(!round.ended);
}
{
  const {match,round}=duel({shieldPulse:3});round.fighters.player.x=450;round.fighters.opponent.x=500;round.fighters.player.shield=1;updateDuelRound(match,.033);assert.ok(round.fighters.opponent.hp<60);assert.strictEqual(round.fighters.player.shield,0);
}
{
  const {match,round}=duel({blackHole:3});round.fighters.player.x=300;round.fighters.opponent.x=600;round.fighters.player.skillTimers.blackHole=0;updateDuelRound(match,.033);assert.ok(round.fighters.opponent.x<500);assert.ok(round.fighters.opponent.hp<100);
}
{
  const {match,round}=duel({pointBlank:3});round.fighters.player.x=450;round.fighters.opponent.x=500;updateDuelRound(match,.033);assert.ok(round.fighters.opponent.hp<84);
}
{
  const {match,round}=duel({echoShot:3},{vitality:3});round.fighters.player.x=450;round.fighters.opponent.x=500;
  for(let i=0;i<3;i++){round.fighters.player.attackTimer=0;updateDuelRound(match,.033);if(round.ended)break;}
  assert.ok(round.events.some(event=>event.type==='projectile_spawn'&&event.source==='echoShot'),'Echo Shot did not emit its projectile after three Rank III basic hits');
}
{
  const {match,round}=duel({luckyStar:3},{},()=>.5);round.fighters.player.skillTimers.luckyStar=0;updateDuelRound(match,.033);assert.ok(round.fighters.player.shield>=24);
}

const match=createDuelMatch({id:'player',name:'BẠN',build:{power:3,rapid:3,fire:3,lightning:3,crit:3,execution:2,echoShot:2}},{id:'opponent',name:'ĐỐI THỦ',build:{vitality:1,armor:1,lastStand:1,secondWind:1}},{rng:makeRng(99)});
startDuelRound(match);let ticks=0;
while(!match.over&&ticks<40000){const round=updateDuelRound(match,.033);if(round?.ended)settleDuelRound(match);ticks++;}
assert.ok(match.over);assert.ok(match.winner==='player'||match.winner==='opponent');assert.strictEqual(match.wins[match.winner],2);assert.ok(match.wins[match.loser]<=1);

const index=fs.readFileSync('index.html','utf8');
for(const required of ['css/v017-duel.css','js/duel-skills.js','js/duel-tournament.js','js/duel-engine.js','js/duel-skills-d6a.js','js/duel-skills-d6b.js','js/duel-renderer.js','js/duel-ui.js','js/duel-ui-sync.js'])assert.ok(index.includes(required),`index.html missing ${required}`);
assert.ok(index.indexOf('js/duel-engine.js')<index.indexOf('js/duel-skills-d6a.js'));
assert.ok(index.indexOf('js/duel-skills-d6a.js')<index.indexOf('js/duel-skills-d6b.js'));
assert.ok(index.indexOf('js/duel-skills-d6b.js')<index.indexOf('js/duel-ui.js'));
const engine=fs.readFileSync('js/duel-engine.js','utf8');
assert.ok(!engine.includes('burn-lite'));assert.ok(engine.includes('registerDuelSkillBehavior'));assert.ok(engine.includes('onFatalDamage'));assert.ok(engine.includes('spawnProjectile'));

console.log('V0.17 Duel smoke test passed:',{skillAdapters:DUEL_SKILL_KEYS.length,championWins:tournament.matchWins,rewardCount:tournament.rewardCount,deterministicWinner:match.winner,ticks});
