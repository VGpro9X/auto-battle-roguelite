const fs=require("fs");
const path=require("path");
const vm=require("vm");
const assert=require("assert");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const qualitySource=read("js/duel-visual-quality.js");
const renderer=read("js/duel-renderer.js");

function loadPolicy(){
  const sandbox={URLSearchParams,globalThis:null};
  sandbox.globalThis=sandbox;
  vm.createContext(sandbox);
  vm.runInContext(qualitySource,sandbox,{filename:"duel-visual-quality.js"});
  return sandbox;
}

const api=loadPolicy();
assert.ok(api.DUEL_VISUAL_QUALITY_PROFILES,'quality profiles must be exported');
assert.ok(api.resolveDuelVisualQuality,'quality resolver must be exported');
assert.ok(api.getDuelVisualQualityStatus,'quality observability must be exported');

const desktop=api.resolveDuelVisualQuality({width:1440,height:900,deviceMemory:8,hardwareConcurrency:8,reducedMotion:false});
assert.strictEqual(desktop.id,"full");
assert.strictEqual(desktop.dprCap,2);
assert.ok(desktop.vfxTransientLimit>=90);
assert.strictEqual(desktop.shakeMultiplier,1);
assert.strictEqual(desktop.reason,"default");

const mobile=api.resolveDuelVisualQuality({width:390,height:844,deviceMemory:8,hardwareConcurrency:8,reducedMotion:false});
assert.strictEqual(mobile.id,"constrained");
assert.strictEqual(mobile.mobile,true);
assert.ok(mobile.dprCap<desktop.dprCap);
assert.ok(mobile.vfxTransientLimit<desktop.vfxTransientLimit);
assert.ok(mobile.shakeMultiplier<desktop.shakeMultiplier);
assert.ok(mobile.reason.includes("mobile"));

const lowMemory=api.resolveDuelVisualQuality({width:1280,height:720,deviceMemory:4,hardwareConcurrency:8,reducedMotion:false});
assert.strictEqual(lowMemory.id,"constrained");
assert.strictEqual(lowMemory.lowMemory,true);

const forcedFull=api.resolveDuelVisualQuality({width:390,height:700,deviceMemory:2,hardwareConcurrency:2,reducedMotion:false,profile:"full"});
assert.strictEqual(forcedFull.id,"full");
assert.strictEqual(forcedFull.reason,"forced:full");

const reduced=api.resolveDuelVisualQuality({width:1440,height:900,deviceMemory:8,hardwareConcurrency:8,reducedMotion:true});
assert.strictEqual(reduced.id,"full");
assert.strictEqual(reduced.reducedMotion,true);
assert.strictEqual(reduced.shakeMultiplier,0);
assert.strictEqual(reduced.zoomKickMultiplier,0);
assert.strictEqual(reduced.motionMultiplier,0);
assert.ok(reduced.vfxTransientLimit>0,'reduced motion must not erase semantic presentation budgets');

const qualityPos=renderer.indexOf("duel-visual-quality.js?v=018-g6a");
const cameraPos=renderer.indexOf("duel-camera.js");
const vfxPos=renderer.indexOf("duel-vfx-v2.js");
const rendererV2Pos=renderer.indexOf("duel-renderer-v2.js");
assert.ok(qualityPos>=0,'G6A quality module must be public-bootstrap reachable');
assert.ok(qualityPos<cameraPos&&qualityPos<vfxPos&&qualityPos<rendererV2Pos,'quality policy must load before presentation consumers');

for(const forbidden of [
  "updateDuelRound","duelDealDamage","settleDuelRound","resolveDuelTournamentStage",
  "getDuelChoices","getDuelRewardChoices","attackCooldown","baseDamage","critChance"
])assert.ok(!qualitySource.includes(forbidden),`quality policy must not encode gameplay truth: ${forbidden}`);
assert.ok(!qualitySource.includes("duel-engine"),'quality policy must not import or wrap Duel engine');
assert.ok(!qualitySource.includes("duel-tournament"),'quality policy must not import or wrap tournament logic');

console.log("V0.18 G6A visual quality policy smoke: PASS");
