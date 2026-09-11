const fs=require('fs');
const vm=require('vm');
const assert=require('assert');
function load(path){vm.runInThisContext(fs.readFileSync(path,'utf8'),{filename:path});}
function lcg(seed){let s=seed>>>0;return()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296);}
function entry(id,build={},rares=[]){return{id,name:id,build:{...build},rares:[...rares],duelRarePersistent:{},affinity:'hybrid',isPlayer:id==='player',wins:0,roundWins:0,roundLosses:0,eliminated:false};}
load('js/skills.js');
for(const file of ['duel-skills','duel-engine','duel-skills-d6a','duel-skills-d6b','duel-skills-d6c','duel-skills-d6d','duel-skills-d6e','duel-skills-d6f','duel-skills-d6g','duel-synergies','duel-synergies-c2a','duel-synergies-c2b','duel-synergies-c2c','duel-synergies-c2d','duel-evolutions','duel-evolutions-c3a','duel-evolutions-c3b','duel-rares','duel-rares-r1','duel-rares-r2','duel-tournament'])load(`js/${file}.js`);

assert.strictEqual(DUEL_SKILL_KEYS.length,80);
assert.strictEqual(Object.keys(DUEL_SYNERGY_ADAPTERS).length,28);
assert.strictEqual(Object.keys(DUEL_EVOLUTION_ADAPTERS).length,12);
assert.strictEqual(Object.keys(DUEL_RARE_ADAPTERS).length,20);

// Every Hợp Đạo needs only two starting/rank choices and is therefore attainable in the short tournament.
for(const [id,meta] of Object.entries(DUEL_SYNERGY_CATALOG)){
  const build=Object.fromEntries((meta.requires.skills||[]).map(key=>[key,1]));
  const cost=Object.values(build).reduce((a,b)=>a+b,0);
  assert.ok(cost<=7,`${id} costs ${cost} selections`);
  assert.strictEqual(getDuelSynergyRequirementStatus(build,id).unlocked,true,`${id} unattainable`);
}

// Find a legal <=7-selection path for every Siêu Cấp: base Rank III plus at most four support picks.
function minEvolutionCost(id){
  const meta=DUEL_EVOLUTION_CATALOG[id],build={[meta.base]:3};let best=Infinity;
  const keys=DUEL_SKILL_KEYS.filter(key=>key!==meta.base);
  function dfs(start,cost){
    const status=getDuelEvolutionRequirementStatus(build,id);
    if(status.unlocked){best=Math.min(best,cost);return;}
    if(cost>=7||cost>=best)return;
    const needed=new Set(status.missingTags.map(x=>x.tag));
    for(let i=start;i<keys.length;i++){
      const key=keys[i],tags=getDuelSkill(key)?.tags||[];
      if(!tags.some(tag=>needed.has(tag)))continue;
      build[key]=1;dfs(i+1,cost+1);delete build[key];
    }
  }
  dfs(0,3);return best;
}
for(const id of Object.keys(DUEL_EVOLUTION_CATALOG)){
  const cost=minEvolutionCost(id);assert.ok(Number.isFinite(cost)&&cost<=7,`${id} cannot be reached within 7 selections; cost=${cost}`);
}

function assertFiniteFighter(f){
  for(const key of ['hp','maxHp','shield','x'])assert.ok(Number.isFinite(f[key]),`${f.side}.${key} is not finite`);
  assert.ok(f.maxHp>0);assert.ok(f.hp<=f.maxHp+1e-6);assert.ok(f.x>=DUEL_ARENA_FLAT.leftBound-1&&f.x<=DUEL_ARENA_FLAT.rightBound+1);
}
function runMatch(a,b,seed,{maxTicks=24000}={}){
  const rng=lcg(seed),match=createDuelMatch(a,b,{rng});startDuelRound(match);
  let ticks=0,sawDeath=false,maxRoundTime=0,rounds=0,lastRound=0;
  while(!match.over&&ticks<maxTicks){
    const round=match.currentRound;
    if(round.number!==lastRound){rounds++;lastRound=round.number;}
    if(round.ended){settleDuelRound(match);continue;}
    updateDuelRound(match,.033);ticks++;maxRoundTime=Math.max(maxRoundTime,round.time);if(round.phase==='TỬ CHIẾN')sawDeath=true;
    if((ticks%100)===0){assertFiniteFighter(round.fighters.player);assertFiniteFighter(round.fighters.opponent);}
  }
  assert.ok(match.over,`match stalled after ${ticks} ticks, maxRoundTime=${maxRoundTime.toFixed(1)}`);
  assert.ok(['player','opponent'].includes(match.winner));
  return{winner:match.winner,ticks,sawDeath,maxRoundTime,rounds};
}

const melee={power:3,rapid:3,pointBlank:3,crit:3,armorBreak:3,vampiricTouch:2,lastStand:2,secondWind:2};
const ranged={fire:3,multishot:3,velocity:3,ricochet:3,explosive:2,barrier:2,afterimage:2,echoShot:2};
const defense={vitality:3,armor:3,barrier:3,guardianIdol:3,blackHole:3,frost:3,stormTotem:3,fireWisp:2};
const elemental={poison:3,burn:3,fire:3,lightning:3,conductiveVenom:3,meteorSeal:3,areaMastery:2,elementalMastery:2};
const turtleA={vitality:3,armor:3,barrier:3,heal:3,guardianIdol:3,frostMirror:3,secondWind:3,lastStand:3,bloodShield:3};
const turtleB={vitality:3,armor:3,barrier:3,heal:3,guardianIdol:3,frostMirror:3,xpHeal:3,retaliate:3,bloodShield:3};

// Late-build spacing remains build-driven rather than a class lock.
assert.ok(computeDuelStats(entry('m',melee)).preferredDistance<computeDuelStats(entry('r',ranged)).preferredDistance,'ranged build should prefer more distance than melee build');

const scenarios=[
  ['melee-v-ranged',entry('player',melee,['divineGift']),entry('opponent',ranged,['voidReality']),101],
  ['defense-v-elemental',entry('player',defense,['heavenlyWard']),entry('opponent',elemental,['bloodDebt']),202],
  ['elemental-v-melee',entry('player',elemental,['heavenlyPunishment']),entry('opponent',melee,['parasitePact']),303]
];
const metrics=[];
for(const [name,a,b,seed] of scenarios){const result=runMatch(a,b,seed);metrics.push({name,...result});assert.ok(result.maxRoundTime<180,`${name} produced an excessively long round`);}

// Pure defensive builds must still terminate through TỬ CHIẾN; sustain cannot create an endless match.
{
  const result=runMatch(entry('player',turtleA,['immortalBreath','lifeRewind']),entry('opponent',turtleB,['heavenlyWard','bloodDebt']),404,{maxTicks:30000});
  metrics.push({name:'defense-v-defense',...result});assert.strictEqual(result.sawDeath,true,'defense mirror should exercise TỬ CHIẾN');assert.ok(result.maxRoundTime<240,'defense mirror remained stalled too long after TỬ CHIẾN');
}

// Mirrored hybrid builds should not show a catastrophic fixed-side bias.
{
  const hybrid={power:2,rapid:2,fire:2,lightning:2,barrier:2,crit:2,phantomStep:2,blackHole:1};let playerWins=0;
  for(let seed=1;seed<=24;seed++)if(runMatch(entry('player',hybrid),entry('opponent',hybrid),1000+seed,{maxTicks:18000}).winner==='player')playerWins++;
  assert.ok(playerWins>=4&&playerWins<=20,`mirror side bias too large: player won ${playerWins}/24`);metrics.push({name:'mirror-24',playerWins});
}

// Rare rates statistically follow the locked stage curve.
{
  const trials=30000,tolerance=.008;
  for(const [rewardIndex,expected] of [[2,.03],[3,.06],[4,.10],[5,.15]]){
    const rng=lcg(9000+rewardIndex);let hits=0;
    for(let i=0;i<trials;i++)if(rollDuelRareOffer(entry(`r${i}`,{}),rewardIndex,rng))hits++;
    const rate=hits/trials;assert.ok(Math.abs(rate-expected)<=tolerance,`rare rate ${rewardIndex}: ${rate} vs ${expected}`);metrics.push({name:`rare-${rewardIndex}`,rate:Number(rate.toFixed(4))});
  }
}

// 64-player offscreen bracket always halves cleanly and gives equal stage growth opportunities.
{
  const rng=lcg(777),t=createDuelTournament(rng),player=getDuelTournamentPlayer(t);addDuelSkillRank(player.build,'power');addDuelSkillRank(player.build,'rapid');
  const sizes=[t.bracket.length];
  while(!t.championId&&!t.playerEliminated){
    const result=resolveDuelTournamentStage(t,true,{playerRoundWins:2,opponentRoundWins:0,rng});
    sizes.push(t.bracket.length);
    if(result.status==='advance'){
      const choices=getDuelRewardChoices(player,{count:3,rewardIndex:t.rewardCount,rng});const choice=choices[0];
      if(choice?.kind==='rare')grantDuelRare(player,choice.key);else if(choice?.key){addDuelSkillRank(player.build,choice.key);applyDuelDivineGift(player,choice.key,rng);}
    }
    for(const id of t.bracket){const f=t.fighters[id];assert.strictEqual(new Set(f.rares||[]).size,(f.rares||[]).length,`${id} has duplicate rares`);for(const rank of Object.values(f.build))assert.ok(rank>=1&&rank<=3,`${id} has invalid Duel rank`);}
  }
  assert.deepStrictEqual(sizes,[64,32,16,8,4,2,1]);assert.strictEqual(t.championId,'player');assert.strictEqual(t.matchWins,6);assert.strictEqual(t.rewardCount,5);
}

console.log('V0.17 C5 full integration/balance: PASS');
console.log(JSON.stringify(metrics,null,2));
