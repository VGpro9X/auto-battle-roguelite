const fs=require('fs');
const vm=require('vm');
const assert=require('assert');

function load(path){vm.runInThisContext(fs.readFileSync(path,'utf8'),{filename:path});}

global.W=960;
global.H=640;
global.clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
global.getEffectiveMoveSpeed=()=>160;
global.isEnemyHostile=e=>!e.dead&&!e.allied;
global.player={x:W/2,y:H/2,r:16,moveX:1,moveY:0,hp:100,maxHp:100};
global.state={t:0,enemies:[],gems:[]};
load('js/movement.js');
load('js/v019-survival-ai.js');

function reset(){
  player.x=W/2;player.y=H/2;player.moveX=1;player.moveY=0;player.hp=100;player.maxHp=100;
  state.t=0;state.enemies=[];state.gems=[];resetMovementAI();
}
function addDensePopulation(count=240){
  for(let i=0;i<count;i++){
    const angle=i/count*Math.PI*2;
    const ring=i%4;
    const distance=285+ring*32;
    state.enemies.push({
      x:player.x+Math.cos(angle)*distance,
      y:player.y+Math.sin(angle)*distance,
      r:12+(i%3),speed:52+(i%5)*3,dead:false,allied:false
    });
  }
}
function step(dt=.016,{move=true}={}){
  state.t+=dt;
  const dir=chooseMovementDirection();
  assert.ok(Number.isFinite(dir.x)&&Number.isFinite(dir.y),'movement direction must stay finite');
  if(move){
    player.x=clamp(player.x+dir.x*getEffectiveMoveSpeed()*dt,24,W-24);
    player.y=clamp(player.y+dir.y*getEffectiveMoveSpeed()*dt,54,H-95);
  }
  return dir;
}

reset();
addDensePopulation(240);
const frames=180;
const start={x:player.x,y:player.y};
for(let i=0;i<frames;i++)step();
let d=getMovementAIDiagnostics();
assert.strictEqual(d.version,'V0.19');
assert.ok(d.performance.sourceHostiles>=200,`stress fixture did not expose enough hostiles: ${d.performance.sourceHostiles}`);
assert.strictEqual(d.performance.hostileCap,48,'V0.19 hostile cap changed unexpectedly');
assert.ok(d.performance.nearbyHostiles<=48,`nearby hostile working set exceeded cap: ${d.performance.nearbyHostiles}`);
assert.ok(d.performance.perceptionRefreshes<frames*.45,`perception refreshed too often: ${d.performance.perceptionRefreshes}/${frames}`);
assert.ok(d.performance.strategicDecisions<frames*.45,`strategic AI ran too often: ${d.performance.strategicDecisions}/${frames}`);
assert.ok(d.performance.steeringDecisions<frames*.55,`steering AI ran too often: ${d.performance.steeringDecisions}/${frames}`);
assert.ok(Math.hypot(player.x-start.x,player.y-start.y)>20,'bounded AI stress fixture stalled movement');

// A newly spawned lethal ring must invalidate the normal cadence immediately.
const beforeStrategic=d.performance.strategicDecisions;
for(let i=0;i<14;i++){
  const a=i/14*Math.PI*2;
  state.enemies.push({x:player.x+Math.cos(a)*92,y:player.y+Math.sin(a)*92,r:14,speed:76,dead:false,allied:false});
}
step(.016,{move:false});
d=getMovementAIDiagnostics();
assert.strictEqual(d.mode,'escape',`new lethal population must pre-empt cached plan immediately, got ${d.mode}`);
assert.ok(d.performance.strategicDecisions>beforeStrategic,'population change did not force a strategic refresh');
assert.ok(d.performance.nearbyHostiles<=48,'emergency refresh exceeded hostile working-set cap');

console.log('V0.19 A14 bounded AI performance smoke: PASS',{
  frames,
  sourceHostiles:d.performance.sourceHostiles,
  nearbyHostiles:d.performance.nearbyHostiles,
  hostileCap:d.performance.hostileCap,
  perceptionRefreshes:d.performance.perceptionRefreshes,
  strategicDecisions:d.performance.strategicDecisions,
  steeringDecisions:d.performance.steeringDecisions,
  emergencyMode:d.mode
});
