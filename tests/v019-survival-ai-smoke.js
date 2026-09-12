const fs=require('fs');
const vm=require('vm');
const assert=require('assert');

function load(path){vm.runInThisContext(fs.readFileSync(path,'utf8'),{filename:path});}
function angleDiff(a,b){let d=(a-b)%(Math.PI*2);if(d>Math.PI)d-=Math.PI*2;if(d<-Math.PI)d+=Math.PI*2;return d;}

global.W=960;
global.H=640;
global.clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
global.getEffectiveMoveSpeed=()=>160;
global.isEnemyHostile=enemy=>!enemy.dead&&!enemy.allied;
global.player={x:W/2,y:H/2,r:16,moveX:1,moveY:0,hp:100,maxHp:100};
global.state={t:0,enemies:[],gems:[]};

load('js/movement.js');
load('js/v019-survival-ai.js');

function resetWorld({x=W/2,y=H/2}={}){
  player.x=x;player.y=y;player.r=16;player.moveX=1;player.moveY=0;player.hp=100;player.maxHp=100;
  state.t=0;state.enemies=[];state.gems=[];
  resetMovementAI();
}

function addEnemy(angle,distance=108,{speed=76,r=14}={}){
  state.enemies.push({
    x:player.x+Math.cos(angle)*distance,
    y:player.y+Math.sin(angle)*distance,
    speed,r,dead:false,allied:false
  });
}

function surroundExceptGap({gapCenter=0,gapWidth=Math.PI/2,count=28,distance=108}={}){
  for(let i=0;i<count;i++){
    const angle=i/count*Math.PI*2;
    if(Math.abs(angleDiff(angle,gapCenter))<gapWidth/2)continue;
    addEnemy(angle,distance);
  }
}

function fullSurround({count=28,distance=104}={}){
  for(let i=0;i<count;i++)addEnemy(i/count*Math.PI*2,distance);
}

function tick(count,{moveEnemies=false}={}){
  const dt=.033;
  for(let i=0;i<count;i++){
    state.t+=dt;
    const direction=chooseMovementDirection();
    player.x=clamp(player.x+direction.x*getEffectiveMoveSpeed()*dt,24,W-24);
    player.y=clamp(player.y+direction.y*getEffectiveMoveSpeed()*dt,54,H-95);
    if(moveEnemies){
      for(const enemy of state.enemies){
        if(enemy.dead)continue;
        const dx=player.x-enemy.x,dy=player.y-enemy.y,mag=Math.hypot(dx,dy)||1;
        enemy.x+=dx/mag*enemy.speed*dt;
        enemy.y+=dy/mag*enemy.speed*dt;
      }
    }
  }
}

function assertUnitDirection(label){
  const diagnostics=getMovementAIDiagnostics();
  const magnitude=Math.hypot(diagnostics.escape.x,diagnostics.escape.y);
  assert.ok(magnitude>.95&&magnitude<1.05,`${label}: committed escape vector not normalized: ${magnitude}`);
}

// A0: diagnostics surface exists and exposes deterministic tactical observability.
resetWorld();
surroundExceptGap({gapCenter:0,gapWidth:Math.PI/2,count:28,distance:108});
state.t+=.033;
chooseMovementDirection();
let diagnostics=getMovementAIDiagnostics();
assert.strictEqual(diagnostics.version,'V0.19');
assert.strictEqual(diagnostics.mode,'escape','270-degree pressure must immediately enter escape');
assert.ok(diagnostics.encirclement>.45,`expected material encirclement, got ${diagnostics.encirclement}`);
assert.ok(diagnostics.longestOpenSectors>=2,'expected a measurable open corridor');
assert.ok(Number.isFinite(diagnostics.escape.score),'escape score must be observable');
assertUnitDirection('A0 telemetry');

// A2/A3: a clear eastward 90-degree gap must be recognized and chosen as the escape corridor.
const start270={x:player.x,y:player.y};
tick(24);
diagnostics=getMovementAIDiagnostics();
assert.ok(player.x>start270.x+70,`270-degree fixture did not commit through east gap: dx=${player.x-start270.x}`);
assert.ok(Math.abs(player.y-start270.y)<75,`270-degree fixture drifted away from corridor center: dy=${player.y-start270.y}`);
assert.ok(diagnostics.progress.headingReversals<=2,`270-degree escape reversed heading too often: ${diagnostics.progress.headingReversals}`);
assert.ok(diagnostics.escape.replans<=4,`270-degree escape replanned too often: ${diagnostics.escape.replans}`);

// A3/A4: a narrow ~40-degree gap still requires decisive committed movement, not spin-in-place.
resetWorld();
surroundExceptGap({gapCenter:0,gapWidth:Math.PI*.23,count:36,distance:112});
state.t+=.033;
chooseMovementDirection();
diagnostics=getMovementAIDiagnostics();
assert.strictEqual(diagnostics.mode,'escape');
assert.ok(diagnostics.encirclement>.62,`330-degree fixture did not register heavy encirclement: ${diagnostics.encirclement}`);
const start330={x:player.x,y:player.y};
tick(28);
diagnostics=getMovementAIDiagnostics();
assert.ok(Math.hypot(player.x-start330.x,player.y-start330.y)>85,`330-degree fixture remained too stationary: displacement=${Math.hypot(player.x-start330.x,player.y-start330.y)}`);
assert.ok(player.x>start330.x+55,`330-degree fixture did not use its east gap: dx=${player.x-start330.x}`);
assert.ok(diagnostics.progress.headingReversals<=3,`330-degree escape spin regression: reversals=${diagnostics.progress.headingReversals}`);

// A3: near-wall pressure must not choose a route through the wall when an inward corridor exists.
resetWorld({x:118,y:H/2});
surroundExceptGap({gapCenter:0,gapWidth:Math.PI*.55,count:30,distance:105});
state.t+=.033;
chooseMovementDirection();
const wallStart=player.x;
tick(22);
diagnostics=getMovementAIDiagnostics();
assert.ok(player.x>wallStart+60,`near-wall fixture failed to move inward: dx=${player.x-wallStart}`);
assert.ok(player.x>100,'near-wall fixture moved into left wall');
assert.ok(diagnostics.progress.headingReversals<=2,`near-wall escape oscillated: ${diagnostics.progress.headingReversals}`);

// A4: even with no clean sector, AI must choose a least-bad breakout and keep moving.
resetWorld();
fullSurround({count:32,distance:100});
state.t+=.033;
chooseMovementDirection();
const fullStart={x:player.x,y:player.y};
tick(26);
diagnostics=getMovementAIDiagnostics();
const fullDisplacement=Math.hypot(player.x-fullStart.x,player.y-fullStart.y);
assert.ok(fullDisplacement>55,`full-surround fallback stalled: displacement=${fullDisplacement}`);
assert.ok(diagnostics.progress.headingReversals<=4,`full-surround fallback spun excessively: reversals=${diagnostics.progress.headingReversals}`);
assertUnitDirection('full-surround fallback');

// A4 stuck recovery: artificial position lock must trigger breakout observability instead of silent oscillation.
resetWorld();
surroundExceptGap({gapCenter:0,gapWidth:Math.PI/2,count:28,distance:108});
for(let i=0;i<30;i++){
  state.t+=.033;
  chooseMovementDirection();
  // Deliberately do not apply movement: this emulates a blocked/stalled locomotion layer.
}
diagnostics=getMovementAIDiagnostics();
assert.ok(diagnostics.progress.breakoutRemaining>0||diagnostics.escape.reason==='stuck-breakout',`stuck detector did not enter breakout: ${JSON.stringify(diagnostics.progress)}`);

const index=fs.readFileSync('index.html','utf8');
assert.ok(index.includes('js/v019-survival-ai.js?v=019-a1a4-r1'),'public shell must load V0.19 Survival AI after the V0.8 baseline');
assert.ok(index.indexOf('js/movement.js')<index.indexOf('js/v019-survival-ai.js'),'V0.19 Survival AI must override movement only after baseline loads');

console.log('V0.19 Survival AI A0-A4 smoke: PASS',{
  mode:diagnostics.mode,
  encirclement:Number(diagnostics.encirclement.toFixed(3)),
  replans:diagnostics.escape.replans,
  headingReversals:diagnostics.progress.headingReversals,
  breakout:Number(diagnostics.progress.breakoutRemaining.toFixed(3))
});
