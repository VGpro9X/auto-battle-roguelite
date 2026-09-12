const fs=require('fs');
const vm=require('vm');
const assert=require('assert');

function load(path){vm.runInThisContext(fs.readFileSync(path,'utf8'),{filename:path});}

global.W=960;
global.H=640;
global.clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
global.getEffectiveMoveSpeed=()=>160;
global.isEnemyHostile=enemy=>!enemy.dead&&!enemy.allied;
global.player={x:W/2,y:H/2,r:16,moveX:1,moveY:0,hp:100,maxHp:100};
global.state={t:0,enemies:[],gems:[]};
load('js/movement.js');
load('js/v019-survival-ai.js');

function reset(){
  player.x=W/2;player.y=H/2;player.moveX=1;player.moveY=0;player.hp=100;player.maxHp=100;
  state.t=0;state.enemies=[];state.gems=[];resetMovementAI();
}
function step(seconds=.033,{applyMovement=false}={}){
  state.t+=seconds;
  const direction=chooseMovementDirection();
  if(applyMovement){
    player.x=clamp(player.x+direction.x*getEffectiveMoveSpeed()*seconds,24,W-24);
    player.y=clamp(player.y+direction.y*getEffectiveMoveSpeed()*seconds,54,H-95);
  }
  return direction;
}
function advance(seconds){
  const dt=.033;
  const count=Math.ceil(seconds/dt);
  for(let i=0;i<count;i++)step(dt,{applyMovement:true});
}
function ring(count=12,distance=105){
  for(let i=0;i<count;i++){
    const a=i/count*Math.PI*2;
    state.enemies.push({x:player.x+Math.cos(a)*distance,y:player.y+Math.sin(a)*distance,r:14,speed:76,dead:false,allied:false});
  }
}
function richGems(){
  state.gems=[
    {x:player.x+45,y:player.y+12,xp:5,dead:false},
    {x:player.x+75,y:player.y-26,xp:4,dead:false},
    {x:player.x-80,y:player.y+32,xp:3,dead:false},
    {x:player.x+115,y:player.y+40,xp:2,dead:false}
  ];
}

// Safe greed is allowed: valuable nearby XP should beat idle patrol.
reset();richGems();step();
let d=getMovementAIDiagnostics();
assert.strictEqual(d.mode,'harvest',`safe XP should select harvest, got ${d.mode}`);
assert.ok(d.utility.scores.harvest>d.utility.scores.patrol,`harvest utility must beat patrol in safe XP fixture: ${JSON.stringify(d.utility.scores)}`);
assert.ok(d.utility.inputs.harvest>.25,'harvest opportunity should be measurable');

// Lethal compression must override greed immediately, even while gems remain.
ring(14,100);step();
d=getMovementAIDiagnostics();
assert.strictEqual(d.mode,'escape',`danger must pre-empt harvest, got ${d.mode}`);
assert.ok(d.utility.scores.escape>d.utility.scores.harvest,`escape utility must beat harvest under lethal pressure: ${JSON.stringify(d.utility.scores)}`);

// Once danger is gone and normal gameplay frames continue, utility must leave
// Escape after commitment expires and return to the still-valuable XP field.
state.enemies=[];advance(2.2);
d=getMovementAIDiagnostics();
assert.strictEqual(d.mode,'harvest',`AI should return to harvest after pressure clears, got ${d.mode}`);
assert.ok(d.utility.scores.harvest>d.utility.scores.escape,'safe post-danger harvest should outrank escape');

// No threats and no XP should settle into patrol rather than sticky escape/kite.
state.gems=[];advance(1.2);
d=getMovementAIDiagnostics();
assert.strictEqual(d.mode,'patrol',`empty safe field should patrol, got ${d.mode}`);

// Moderate single-threat pressure should not falsely trigger emergency Escape.
reset();
state.enemies=[{x:player.x+125,y:player.y,r:14,speed:70,dead:false,allied:false}];
step();d=getMovementAIDiagnostics();
assert.notStrictEqual(d.mode,'escape',`one moderate threat should not be classified as emergency escape: ${JSON.stringify(d.utility)}`);
assert.ok(['kite','patrol'].includes(d.mode),`moderate pressure should resolve to kite/patrol, got ${d.mode}`);

console.log('V0.19 Survival A5 utility smoke: PASS',{
  mode:d.mode,
  scores:Object.fromEntries(Object.entries(d.utility.scores).map(([k,v])=>[k,Number(v.toFixed(3))]))
});
