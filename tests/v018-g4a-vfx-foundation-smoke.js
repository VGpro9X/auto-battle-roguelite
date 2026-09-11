const fs=require("fs");
const path=require("path");
const assert=require("assert");
const vm=require("vm");

const root=path.resolve(__dirname,"..");
const vfxPath=path.join(root,"js/duel-vfx-v2.js");
const rendererPath=path.join(root,"js/duel-renderer-v2.js");
const bootstrapPath=path.join(root,"js/duel-renderer.js");
const vfxSource=fs.readFileSync(vfxPath,"utf8");
const rendererSource=fs.readFileSync(rendererPath,"utf8");
const bootstrapSource=fs.readFileSync(bootstrapPath,"utf8");

assert.match(vfxSource,/physical/);
assert.match(vfxSource,/projectile/);
assert.match(vfxSource,/fire/);
assert.match(vfxSource,/frost/);
assert.match(vfxSource,/lightning/);
assert.match(rendererSource,/createDuelVfxV2/,'Renderer V2 must create the semantic VFX router');
assert.match(rendererSource,/list\.filter\(event=>!vfx\.ownsEvent\(event\)\)/,'owned G4A events must not be double-drawn by legacy VFX');
assert.match(rendererSource,/vfx\?\.render\?\.\(ctx,tr,match,getAnchor\)/,'VFX V2 must render in the shared camera transform and anchor space');
assert.match(bootstrapSource,/js\/duel-vfx-v2\.js\?v=018-g4/,'VFX V2 module must remain in the public bootstrap chain');

const sandbox={globalThis:{},window:undefined};
vm.createContext(sandbox);
vm.runInContext(vfxSource,sandbox);
const api=sandbox.globalThis;
assert.equal(typeof api.getDuelVfxFamily,"function");
assert.equal(typeof api.isDuelVfxV2OwnedEvent,"function");
assert.deepEqual(Array.from(api.DUEL_VFX_V2_FOUNDATION_FAMILIES),["physical","projectile","fire","frost","lightning"]);
for(const family of api.DUEL_VFX_V2_FOUNDATION_FAMILIES)assert.ok(Array.from(api.DUEL_VFX_V2_FAMILIES).includes(family),`expanded VFX coverage lost G4A family ${family}`);
assert.equal(api.getDuelVfxFamily({type:"attack_melee"}),"physical");
assert.equal(api.getDuelVfxFamily({type:"projectile_spawn",source:"arrow"}),"projectile");
assert.equal(api.getDuelVfxFamily({type:"projectile_spawn",source:"fire"}),"fire");
assert.equal(api.getDuelVfxFamily({type:"status",status:"burn"}),"fire");
assert.equal(api.getDuelVfxFamily({type:"cast",skill:"frost"}),"frost");
assert.equal(api.getDuelVfxFamily({type:"cast",skill:"lightning"}),"lightning");
assert.equal(api.isDuelVfxV2OwnedEvent({type:"hit",source:"attack"}),true);

const vfx=api.createDuelVfxV2();
vfx.consume([
  {type:"hit",source:"attack",x:100,y:100,amount:12},
  {type:"cast",skill:"fire",x:120,y:90},
  {type:"cast",skill:"lightning",x:200,y:80}
]);
const status=vfx.getStatus();
assert.equal(status.active,3);
assert.equal(status.counts.physical,1);
assert.equal(status.counts.fire,1);
assert.equal(status.counts.lightning,1);
vfx.update(2);
assert.equal(vfx.getStatus().active,0,'transient VFX must expire and not grow without bound');

console.log("V0.18 G4A semantic VFX foundation smoke: PASS");