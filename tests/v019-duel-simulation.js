const fs=require('fs');
const vm=require('vm');
const assert=require('assert');

function load(path){vm.runInThisContext(fs.readFileSync(path,'utf8'),{filename:path});}
load('js/duel-skills.js');
load('js/duel-engine.js');
load('js/v019-duel-ai.js');

function seeded(seed){
  let s=(seed>>>0)||1;
  return()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};
}
function entry(id,build){return{id,name:id,build:{...build}};}
const builds={
  melee:{power:3,rapid:3,orbit:2,speed:2},
  ranged:{fire:3,lightning:3,frost:2,speed:2},
  mobility:{phantomStep:3,speed:3,rapid:2,power:1},
  sustain:{vitality:3,armor:3,heal:3,barrier:2},
  control:{knock:3,nova:3,frost:3,speed:1}
};

function makeDurable(round){
  for(const fighter of Object.values(round.fighters)){
    fighter.maxHp=20000;fighter.hp=20000;
    fighter.stats.maxHp=20000;fighter.stats.baseDamage=Math.min(2,fighter.stats.baseDamage);
    fighter.stats.critChance=0;fighter.stats.dodgeChance=0;fighter.stats.regen=0;
  }
}
function behaviorWindow(a,b,{seed=1,seconds=12,corner=false}={}){
  const match=createDuelMatch(entry('A',a),entry('B',b),{rng:seeded(seed)});
  const round=startDuelRound(match);makeDurable(round);
  if(corner){round.fighters.player.x=810;round.fighters.opponent.x=910;}
  const dt=.033,frames=Math.ceil(seconds/dt);
  let distanceSum=0,samples=0;
  for(let i=0;i<frames&&!round.ended;i++){
    updateDuelRound(match,dt);
    distanceSum+=Math.abs(round.fighters.opponent.x-round.fighters.player.x);samples++;
  }
  const diag=getDuelAIDiagnostics(round);
  return{
    avgDistance:distanceSum/Math.max(1,samples),
    diag,
    playerX:round.fighters.player.x,
    opponentX:round.fighters.opponent.x,
    arena:round.arena,
    duration:round.time
  };
}

const normalPairs=[
  ['melee','melee'],['ranged','melee'],['mobility','melee'],['sustain','control'],['ranged','control'],['control','mobility']
];
const windows=[];
for(let seed=1;seed<=8;seed++){
  for(const [a,b] of normalPairs)windows.push({a,b,seed,...behaviorWindow(builds[a],builds[b],{seed,seconds:10})});
}
const totalTime=windows.reduce((s,w)=>s+w.duration*2,0);
const cornerTime=windows.reduce((s,w)=>s+w.diag.player.cornerTime+w.diag.opponent.cornerTime,0);
const stationaryClose=windows.reduce((s,w)=>s+w.diag.player.stationaryCloseTime+w.diag.opponent.stationaryCloseTime,0);
const spacingCycles=windows.reduce((s,w)=>s+w.diag.player.spacingCycles+w.diag.opponent.spacingCycles,0);
const transitions=windows.reduce((s,w)=>s+w.diag.player.tacticTransitions+w.diag.opponent.tacticTransitions,0);
const cornerRatio=cornerTime/Math.max(1,totalTime);
const stationaryRatio=stationaryClose/Math.max(1,totalTime);
assert.ok(cornerRatio<.28,`normal-fight corner occupancy too high: ${(cornerRatio*100).toFixed(1)}%`);
assert.ok(stationaryRatio<.24,`normal-fight stationary close time too high: ${(stationaryRatio*100).toFixed(1)}%`);
assert.ok(transitions/windows.length>4,`tactical transition density too low: ${(transitions/windows.length).toFixed(2)} per window`);
assert.ok(spacingCycles>8,`footwork spacing cycles too rare across matrix: ${spacingCycles}`);

const rangedAvg=windows.filter(w=>w.a==='ranged').reduce((s,w)=>s+w.avgDistance,0)/windows.filter(w=>w.a==='ranged').length;
const meleeAvg=windows.filter(w=>w.a==='melee'&&w.b==='melee').reduce((s,w)=>s+w.avgDistance,0)/windows.filter(w=>w.a==='melee'&&w.b==='melee').length;
assert.ok(rangedAvg>meleeAvg+18,`ranged identity did not create larger spacing: ranged=${rangedAvg.toFixed(1)} melee=${meleeAvg.toFixed(1)}`);

// Forced right-corner starts across build identities.
const cornerPairs=[['melee','melee'],['ranged','melee'],['control','mobility'],['sustain','melee'],['mobility','ranged']];
const cornerWindows=[];
for(let seed=1;seed<=5;seed++){
  for(const [a,b] of cornerPairs)cornerWindows.push({a,b,seed,...behaviorWindow(builds[a],builds[b],{seed:100+seed,seconds:4.5,corner:true})});
}
const cornerEscaped=cornerWindows.filter(w=>{
  const rightDistance=w.arena.rightBound-w.opponentX;
  return rightDistance>82&&w.playerX<770&&w.diag.opponent.cornerEscapes>=1;
}).length/cornerWindows.length;
assert.ok(cornerEscaped>=.84,`forced-corner escape rate too low: ${(cornerEscaped*100).toFixed(1)}%`);
const cornerStationary=cornerWindows.reduce((s,w)=>s+w.diag.player.stationaryCloseTime+w.diag.opponent.stationaryCloseTime,0)/cornerWindows.reduce((s,w)=>s+w.duration*2,0);
assert.ok(cornerStationary<.36,`forced-corner stationary close ratio too high: ${(cornerStationary*100).toFixed(1)}%`);

function runMatch(buildA,buildB,seed){
  const match=createDuelMatch(entry('A',buildA),entry('B',buildB),{rng:seeded(seed)});
  startDuelRound(match);
  const dt=.033,maxFrames=Math.ceil(190/dt);
  for(let i=0;i<maxFrames&&!match.over;i++){
    updateDuelRound(match,dt);
    if(match.currentRound.ended)settleDuelRound(match);
  }
  assert.ok(match.over,`Best-of-3 did not complete for seed ${seed}`);
  return match.winner;
}

// Side-symmetry gate: mirror each matchup/seed so no fixed player/opponent side
// advantage can dominate the tournament simulation.
const fairPairs=[['melee','ranged'],['mobility','control'],['sustain','melee'],['ranged','control']];
let playerWins=0,totalMatches=0;
for(let seed=1;seed<=10;seed++){
  for(const [a,b] of fairPairs){
    if(runMatch(builds[a],builds[b],1000+seed*31+totalMatches)==='player')playerWins++;totalMatches++;
    if(runMatch(builds[b],builds[a],2000+seed*37+totalMatches)==='player')playerWins++;totalMatches++;
  }
}
const playerWinRate=playerWins/totalMatches;
assert.ok(playerWinRate>=.30&&playerWinRate<=.70,`fixed-side win bias too large: player ${(playerWinRate*100).toFixed(1)}% over ${totalMatches} matches`);

console.log('V0.19 A13 Duel simulation: PASS',{
  behaviorWindows:windows.length,
  cornerWindows:cornerWindows.length,
  cornerRatio:Number((cornerRatio*100).toFixed(1)),
  stationaryRatio:Number((stationaryRatio*100).toFixed(1)),
  spacingCycles,
  rangedAvg:Number(rangedAvg.toFixed(1)),
  meleeAvg:Number(meleeAvg.toFixed(1)),
  cornerEscapeRate:Number((cornerEscaped*100).toFixed(1)),
  playerWinRate:Number((playerWinRate*100).toFixed(1)),
  fullMatches:totalMatches
});
