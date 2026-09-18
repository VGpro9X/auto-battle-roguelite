const fs=require("fs"),vm=require("vm"),assert=require("assert");
const source=fs.readFileSync("js/duel-camera.js","utf8");
const bootstrap=fs.readFileSync("js/duel-renderer.js","utf8");

assert(bootstrap.includes("js/duel-camera.js?v=020-b12b"),"B12B camera cache key missing");
for(const token of ["impactKickX","impactKickY"]){
  assert(source.includes(token),"B12B directional camera state missing: "+token);
}
for(const forbidden of ["updateDuelRound","duelDealDamage","fighter.hp=","attackCooldown","baseDamage","critChance"]){
  assert(!source.includes(forbidden),"camera presentation leaked into gameplay truth: "+forbidden);
}

function loadCamera(profile){
  const sandbox={Math,globalThis:null};
  sandbox.globalThis=sandbox;
  sandbox.getDuelVisualQuality=()=>profile;
  vm.createContext(sandbox);
  vm.runInContext(source,sandbox,{filename:"js/duel-camera.js"});
  return sandbox.createDuelCamera();
}
const arena={width:1000,height:560,floorY:475,leftBound:54,rightBound:946};
const match={arena,currentRound:{number:1,time:12,fighters:{player:{x:260},opponent:{x:740}}}};

const camera=loadCamera({shakeMultiplier:1,zoomKickMultiplier:1});
camera.update(match,1/60,1280,720);
camera.consume([{type:"hit",critical:true,amount:90,x:780,target:"opponent"}]);
let state=camera.getState();
assert(state.impactKickX>0,"critical hit must create directional horizontal camera kick");
assert(state.impactKickY<0,"critical hit must create upward impact kick");
assert(state.shakePower>0&&state.zoomKick>0,"critical hit lost shake/zoom response");
const before=Math.abs(state.impactKickX);
camera.update(match,.10,1280,720);
state=camera.getState();
assert(Math.abs(state.impactKickX)<before,"directional camera kick must decay over render time");

camera.consume([{type:"ko",x:820,target:"opponent"}]);
state=camera.getState();
assert(state.impactKickX>0&&state.zoomKick>0,"KO must create directional camera impact");

const reduced=loadCamera({shakeMultiplier:0,zoomKickMultiplier:0,reducedMotion:true});
reduced.update(match,1/60,1280,720);
reduced.consume([{type:"hit",critical:true,amount:120,x:800,target:"opponent"},{type:"ko",x:800,target:"opponent"}]);
const reducedState=reduced.getState();
assert.strictEqual(reducedState.shakePower,0,"reduced-motion must disable camera shake");
assert.strictEqual(reducedState.zoomKick,0,"reduced-motion must disable zoom kick");
assert.strictEqual(reducedState.impactKickX,0,"reduced-motion must disable directional kick");
assert.strictEqual(reducedState.impactKickY,0,"reduced-motion must disable vertical kick");

console.log("v020-b12b-camera-impact-smoke: ok · directional hit/KO camera response · reduced-motion safe");