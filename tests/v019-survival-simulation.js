const fs=require('fs');
const vm=require('vm');
const assert=require('assert');

function load(path){vm.runInThisContext(fs.readFileSync(path,'utf8'),{filename:path});}
function angleDiff(a,b){let d=(a-b)%(Math.PI*2);if(d>Math.PI)d-=Math.PI*2;if(d<-Math.PI)d+=Math.PI*2;return d;}

global.W=960;
global.H=640;
global.clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
global.getEffectiveMoveSpeed=()=>160;
global.isEnemyHostile=e=>!e.dead&&!e.allied;
global.player={x:W/2,y:H/2,r:16,moveX:1,moveY:0,hp:100,maxHp:100};
global.state={t:0,enemies:[],gems:[]};
load('js/movement.js');
load('js/v019-survival-ai.js');

function reset({x=W/2,y=H/2}={}){
  player.x=x;player.y=y;player.moveX=1;player.moveY=0;player.hp=100;player.maxHp=100;
  state.t=0;state.enemies=[];state.gems=[];resetMovementAI();
}
function addRing({gapCenter,gapWidth,count=36,distance=112,speed=64}){
  for(let i=0;i<count;i++){
    const a=i/count*Math.PI*2;
    if(Math.abs(angleDiff(a,gapCenter))<gapWidth/2)continue;
    state.enemies.push({x:player.x+Math.cos(a)*distance,y:player.y+Math.sin(a)*distance,r:14,speed,dead:false,allied:false});
  }
}
function simulate(seconds,{moveEnemies=true}={}){
  const start={x:player.x,y:player.y};
  const dt=.033,frames=Math.ceil(seconds/dt);
  for(let i=0;i<frames;i++){
    state.t+=dt;
    const dir=chooseMovementDirection();
    player.x=clamp(player.x+dir.x*getEffectiveMoveSpeed()*dt,24,W-24);
    player.y=clamp(player.y+dir.y*getEffectiveMoveSpeed()*dt,54,H-95);
    if(moveEnemies){
      for(const enemy of state.enemies){
        const dx=player.x-enemy.x,dy=player.y-enemy.y,mag=Math.hypot(dx,dy)||1;
        enemy.x+=dx/mag*enemy.speed*dt;
        enemy.y+=dy/mag*enemy.speed*dt;
      }
    }
  }
  return{start,end:{x:player.x,y:player.y},diag:getMovementAIDiagnostics()};
}

const widths=[Math.PI/2,Math.PI/3,Math.PI*.24];
const angles=Array.from({length:8},(_,i)=>i*Math.PI/4);
const results=[];
for(const gapWidth of widths){
  for(const gapCenter of angles){
    reset();
    addRing({gapCenter,gapWidth,count:40,distance:114,speed:58});
    const {start,end,diag}=simulate(.95);
    const dx=end.x-start.x,dy=end.y-start.y;
    const displacement=Math.hypot(dx,dy);
    const forward=dx*Math.cos(gapCenter)+dy*Math.sin(gapCenter);
    const lateral=Math.abs(-dx*Math.sin(gapCenter)+dy*Math.cos(gapCenter));
    results.push({gapWidth,gapCenter,displacement,forward,lateral,reversals:diag.progress.headingReversals,replans:diag.escape.replans,encirclement:diag.encirclement});
  }
}

const wide=results.filter(r=>r.gapWidth>=Math.PI/3);
const narrow=results.filter(r=>r.gapWidth<Math.PI/3);
const wideSuccess=wide.filter(r=>r.displacement>72&&r.forward>34&&r.reversals<=4).length/wide.length;
const narrowSuccess=narrow.filter(r=>r.displacement>55&&r.forward>18&&r.reversals<=5).length/narrow.length;
const maxReversals=Math.max(...results.map(r=>r.reversals));
const maxReplans=Math.max(...results.map(r=>r.replans));
const avgDisplacement=results.reduce((s,r)=>s+r.displacement,0)/results.length;

assert.ok(wideSuccess>=.875,`wide/medium gap success too low: ${(wideSuccess*100).toFixed(1)}%`);
assert.ok(narrowSuccess>=.75,`narrow gap success too low: ${(narrowSuccess*100).toFixed(1)}%`);
assert.ok(maxReversals<=6,`escape heading reversals too high across matrix: ${maxReversals}`);
assert.ok(maxReplans<=7,`escape replans too high across matrix: ${maxReplans}`);
assert.ok(avgDisplacement>75,`average escape displacement too low: ${avgDisplacement.toFixed(1)}`);

// Near-wall matrix: the available corridor points inward at several vertical positions.
const wallResults=[];
for(const y of [155,H/2,H-185]){
  reset({x:112,y});
  addRing({gapCenter:0,gapWidth:Math.PI*.48,count:34,distance:108,speed:62});
  const {start,end,diag}=simulate(.85);
  wallResults.push({dx:end.x-start.x,wallDistance:end.x-24,reversals:diag.progress.headingReversals});
}
assert.ok(wallResults.every(r=>r.dx>45),`near-wall matrix did not consistently move inward: ${JSON.stringify(wallResults)}`);
assert.ok(wallResults.every(r=>r.wallDistance>110),'near-wall matrix remained pinned to wall');

// No-gap fallback matrix: must still commit to a least-bad breakout.
const full=[];
for(let rotation=0;rotation<6;rotation++){
  reset();
  const count=36,offset=rotation*Math.PI/36;
  for(let i=0;i<count;i++){
    const a=offset+i/count*Math.PI*2;
    state.enemies.push({x:player.x+Math.cos(a)*102,y:player.y+Math.sin(a)*102,r:14,speed:54,dead:false,allied:false});
  }
  const {start,end,diag}=simulate(.80,{moveEnemies:false});
  full.push({displacement:Math.hypot(end.x-start.x,end.y-start.y),reversals:diag.progress.headingReversals,replans:diag.escape.replans});
}
assert.ok(full.every(r=>r.displacement>60),`full-surround fallback stalled: ${JSON.stringify(full)}`);
assert.ok(full.every(r=>r.reversals<=5),'full-surround fallback oscillated excessively');

console.log('V0.19 A13 Survival simulation: PASS',{
  scenarios:results.length+wallResults.length+full.length,
  wideSuccess:Number((wideSuccess*100).toFixed(1)),
  narrowSuccess:Number((narrowSuccess*100).toFixed(1)),
  avgDisplacement:Number(avgDisplacement.toFixed(1)),
  maxReversals,
  maxReplans
});
