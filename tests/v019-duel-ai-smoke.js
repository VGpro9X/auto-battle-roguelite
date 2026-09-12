const fs=require('fs');
const vm=require('vm');
const assert=require('assert');

function load(path){vm.runInThisContext(fs.readFileSync(path,'utf8'),{filename:path});}
load('js/duel-skills.js');
load('js/duel-engine.js');
load('js/v019-duel-ai.js');

function rng(){return .37;}
function entry(id,build){return{id,name:id,build:{...build}};}
function durable(match){
  const round=match.currentRound;
  for(const fighter of Object.values(round.fighters)){
    fighter.maxHp=10000;fighter.hp=10000;
    fighter.stats.maxHp=10000;fighter.stats.baseDamage=1;fighter.stats.critChance=0;fighter.stats.dodgeChance=0;fighter.stats.regen=0;
  }
  return round;
}
function advance(match,seconds,{sample=null}={}){
  const dt=.033;
  const count=Math.ceil(seconds/dt);
  for(let i=0;i<count&&!match.currentRound.ended;i++){
    updateDuelRound(match,dt);
    if(sample)sample(match.currentRound);
  }
}

// A6/A12: diagnostics, bounded decision cadence and real tactical transitions.
let match=createDuelMatch(
  entry('melee-a',{power:2,rapid:2,speed:1}),
  entry('melee-b',{power:2,rapid:2,speed:1}),
  {rng}
);
startDuelRound(match);durable(match);
advance(match,10);
let diag=getDuelAIDiagnostics(match);
assert.strictEqual(diag.version,'V0.19');
for(const side of ['player','opponent']){
  const ai=diag[side];
  assert.ok(ai.perception,`${side}: tactical perception missing`);
  assert.ok(ai.decisions>=20&&ai.decisions<=75,`${side}: decision cadence out of bounds: ${ai.decisions}`);
  assert.ok(ai.tacticTransitions>=2,`${side}: expected tactical transitions, got ${ai.tacticTransitions}`);
  assert.ok(ai.spacingCycles>=1,`${side}: expected at least one engage/pressure -> space cycle`);
  assert.ok(ai.stationaryCloseTime<4.5,`${side}: too much stationary close combat: ${ai.stationaryCloseTime.toFixed(2)}s`);
}

// A7/A10: reproduce the reported right-corner lock. Both fighters must migrate
// materially away from the wall without side swapping or teleport-through.
match=createDuelMatch(
  entry('corner-attacker',{power:2,rapid:2,speed:1}),
  entry('corner-defender',{vitality:2,armor:2,speed:1}),
  {rng}
);
let round=startDuelRound(match);durable(match);
round.fighters.player.x=810;
round.fighters.opponent.x=910;
round.fighters.player.attackTimer=0;
round.fighters.opponent.attackTimer=.45;
const rightBound=round.arena.rightBound;
const startPlayerX=round.fighters.player.x,startOpponentX=round.fighters.opponent.x;
advance(match,4);
diag=getDuelAIDiagnostics(match);
assert.ok(round.fighters.player.x<startPlayerX-55,`corner attacker failed to release toward center: ${startPlayerX} -> ${round.fighters.player.x}`);
assert.ok(round.fighters.opponent.x<startOpponentX-55,`corner defender failed to migrate out of wall: ${startOpponentX} -> ${round.fighters.opponent.x}`);
assert.ok(round.fighters.opponent.x-round.fighters.player.x>=53.5,'fighters must preserve separation/order during corner release');
assert.ok(rightBound-round.fighters.opponent.x>90,`defender still corner-locked: wall distance=${rightBound-round.fighters.opponent.x}`);
assert.ok(diag.opponent.cornerEscapes>=1,`corner defender never selected CORNER_ESCAPE: ${JSON.stringify(diag.opponent)}`);
assert.ok(diag.player.spacingCycles>=1||diag.player.tactic==='CENTER_RESET'||diag.player.tactic==='SPACE',`attacker never released pressure: ${JSON.stringify(diag.player)}`);

// A11: build identity must materially alter tactical preferred range.
match=createDuelMatch(
  entry('ranged',{fire:3,lightning:3,frost:2,speed:1}),
  entry('melee',{power:3,rapid:3,orbit:2,speed:1}),
  {rng}
);
startDuelRound(match);durable(match);
advance(match,.5);
diag=getDuelAIDiagnostics(match);
assert.ok(diag.player.perception.preferred>=150,`ranged build preferred range too short: ${diag.player.perception.preferred}`);
assert.ok(diag.player.perception.preferred>diag.opponent.perception.preferred+55,`build-aware range separation missing: ranged=${diag.player.perception.preferred} melee=${diag.opponent.perception.preferred}`);
assert.ok(diag.player.perception.weights.ranged>diag.player.perception.weights.melee,'ranged build profile not reflected in tactical weights');
assert.ok(diag.opponent.perception.weights.melee>diag.opponent.perception.weights.ranged,'melee build profile not reflected in tactical weights');

// A9: over time a ranged fighter should create more average separation than a
// melee-vs-melee fight rather than collapsing into the same static wall exchange.
let rangedDistance=0,rangedSamples=0;
advance(match,8,{sample:r=>{rangedDistance+=Math.abs(r.fighters.opponent.x-r.fighters.player.x);rangedSamples++;}});
const rangedAverage=rangedDistance/Math.max(1,rangedSamples);
assert.ok(rangedAverage>105,`ranged tactical spacing collapsed: avg=${rangedAverage.toFixed(1)}`);

diag=getDuelAIDiagnostics(match);
assert.ok(diag.player.tacticTransitions>=2,'ranged fighter should change tactics over a live fight');
assert.ok(diag.player.decisions<75,'ranged fighter decision loop is running too frequently');

const index=fs.readFileSync('index.html','utf8');
assert.ok(index.includes('js/v019-duel-ai.js?v=019-a6a12-r1'),'public shell must load V0.19 Duel AI');
assert.ok(index.indexOf('js/duel-rares-r2.js')<index.indexOf('js/v019-duel-ai.js'),'V0.19 Duel AI must load after Duel mechanics/content layers');
assert.ok(index.indexOf('js/v019-duel-ai.js')<index.indexOf('js/duel-renderer.js'),'V0.19 Duel AI must wrap simulation before Renderer V2 starts');

console.log('V0.19 Duel A6-A12 tactical AI smoke: PASS',{
  rangedAverage:Number(rangedAverage.toFixed(1)),
  rangedDecisions:diag.player.decisions,
  rangedTransitions:diag.player.tacticTransitions,
  rangedSpacingCycles:diag.player.spacingCycles
});
