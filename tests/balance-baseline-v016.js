const fs=require('fs');
const vm=require('vm');
const assert=require('assert');

const context={
  console,Math,
  state:{t:0,mode:null},
  player:{hp:100,maxHp:100,level:1},
  clamp:(v,a,b)=>Math.max(a,Math.min(b,v))
};
vm.createContext(context);
vm.runInContext(fs.readFileSync('js/modes.js','utf8'),context,{filename:'modes.js'});

const MODES=vm.runInContext('MODES',context);
const getDifficultyProfile=()=>vm.runInContext('getDifficultyProfile()',context);
const getRunProgress=()=>vm.runInContext('getRunProgress()',context);

function setMode(id,t){context.state.mode=MODES[id];context.state.t=t;}
function expectedSpawnsPerMinute(id,t){
  setMode(id,t);
  const d=getDifficultyProfile();
  const p=getRunProgress();
  const perEvent=1+d.extraSpawnChance+(p>.78?d.extraSpawnChance*.42:0);
  return{...d,perEvent,spawnsPerMinute:60/d.spawnCooldown*perEvent};
}
function integrate(id,endSeconds,dt=.25){
  let spawns=0,elites=0,xpSupply=0;
  for(let t=dt/2;t<endSeconds;t+=dt){
    const d=expectedSpawnsPerMinute(id,t);
    const sps=d.spawnsPerMinute/60;
    spawns+=sps*dt;
    elites+=sps*d.eliteChance*dt;
    xpSupply+=sps*(1+3*d.eliteChance)*dt;
  }
  return{spawns,elites,xpSupply};
}
function near(actual,expected,tol,label){
  assert.ok(Math.abs(actual-expected)<=tol,`${label}: expected ${expected}±${tol}, got ${actual}`);
}

// Freeze the released V0.16 pressure curve as a reproducible before/after baseline.
const timedAnchors={
  '5':{spawns:662.34,elites:78.70,xp:898.44},
  '10':{spawns:1324.69,elites:157.40,xp:1796.87},
  '15':{spawns:1987.03,elites:236.09,xp:2695.31},
  '20':{spawns:2649.37,elites:314.79,xp:3593.75}
};
for(const id of ['5','10','15','20']){
  const total=integrate(id,MODES[id].duration);
  near(total.spawns,timedAnchors[id].spawns,.25,`${id}m expected spawns`);
  near(total.elites,timedAnchors[id].elites,.10,`${id}m expected elites`);
  near(total.xpSupply,timedAnchors[id].xp,.35,`${id}m perfect-clear XP supply`);
  const start=expectedSpawnsPerMinute(id,0);
  const end=expectedSpawnsPerMinute(id,MODES[id].duration);
  assert.ok(end.hpScale>start.hpScale&&end.damageScale>start.damageScale&&end.spawnsPerMinute>start.spawnsPerMinute,`${id}m difficulty must increase over the run`);
}

// Timed modes share the same normalized spawn-density curve in released V0.16.
const spawnPerMinute=['5','10','15','20'].map(id=>integrate(id,MODES[id].duration).spawns/(MODES[id].duration/60));
assert.ok(Math.max(...spawnPerMinute)-Math.min(...spawnPerMinute)<.05,'Timed modes must preserve the V0.16 normalized spawn-density baseline');

const endlessAnchors={
  5:{spawns:351.97,elites:11.56,xp:386.66},
  10:{spawns:970.38,elites:58.41,xp:1145.61},
  20:{spawns:5239.17,elites:681.62,xp:7284.03},
  30:{spawns:11306.37,elites:2027.11,xp:17387.70}
};
for(const [minutes,anchor] of Object.entries(endlessAnchors)){
  const total=integrate('endless',Number(minutes)*60);
  near(total.spawns,anchor.spawns,.6,`Endless ${minutes}m expected spawns`);
  near(total.elites,anchor.elites,.3,`Endless ${minutes}m expected elites`);
  near(total.xpSupply,anchor.xp,1.0,`Endless ${minutes}m perfect-clear XP supply`);
}

const snapshot=(id,t)=>{
  const d=expectedSpawnsPerMinute(id,t);
  return{
    hpScale:+d.hpScale.toFixed(3),
    damageScale:+d.damageScale.toFixed(3),
    speedScale:+d.speedScale.toFixed(3),
    spawnCooldown:+d.spawnCooldown.toFixed(3),
    eliteChance:+d.eliteChance.toFixed(3),
    extraSpawnChance:+d.extraSpawnChance.toFixed(3),
    spawnsPerMinute:+d.spawnsPerMinute.toFixed(1),
    normalHp:+(25*d.hpScale).toFixed(1),
    normalContactDps:+(8*d.damageScale).toFixed(1)
  };
};

const report={
  timedTotals:Object.fromEntries(['5','10','15','20'].map(id=>{
    const x=integrate(id,MODES[id].duration);
    return[id,{spawns:+x.spawns.toFixed(1),elites:+x.elites.toFixed(1),perfectClearXp:+x.xpSupply.toFixed(1)}];
  })),
  timedEnd:Object.fromEntries(['5','10','15','20'].map(id=>[id,snapshot(id,MODES[id].duration)])),
  endless:Object.fromEntries([0,5,10,20,30,45,60].map(m=>[`${m}m`,snapshot('endless',m*60)]))
};

console.log('V0.16 balance baseline: PASS');
console.log(JSON.stringify(report,null,2));
