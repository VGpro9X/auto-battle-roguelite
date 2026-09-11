const fs=require("fs");
const path=require("path");
const assert=require("assert");
const vm=require("vm");

const root=path.resolve(__dirname,"..");
const vfxSource=fs.readFileSync(path.join(root,"js/duel-vfx-v2.js"),"utf8");
const bootstrapSource=fs.readFileSync(path.join(root,"js/duel-renderer.js"),"utf8");

const sandbox={globalThis:{},window:undefined};
vm.createContext(sandbox);
vm.runInContext(vfxSource,sandbox);
const api=sandbox.globalThis;
const families=Array.from(api.DUEL_VFX_V2_FAMILIES);
for(const family of ["poison","blood","defense","heal","control"])assert.ok(families.includes(family),`G4B family missing: ${family}`);
assert.equal(families.length,10,'G4B should expose 10 cumulative semantic VFX families');

const cases=[
  [{type:"status",status:"chaosPoison"},"poison"],
  [{type:"hit",source:"chaosPoison"},"poison"],
  [{type:"status",status:"bloodLink"},"blood"],
  [{type:"heal",source:"blood"},"blood"],
  [{type:"shield_gain",source:"barrier"},"defense"],
  [{type:"shield_gain",source:"guardianBlock"},"defense"],
  [{type:"heal",source:"xpHeal"},"heal"],
  [{type:"heal",source:"heal"},"heal"],
  [{type:"status",status:"soulBind"},"control"],
  [{type:"status",status:"magnet"},"control"],
  [{type:"hit",source:"soulBind"},"control"]
];
for(const [event,family] of cases){assert.equal(api.getDuelVfxFamily(event),family,`wrong family for ${JSON.stringify(event)}`);assert.equal(api.isDuelVfxV2OwnedEvent(event),true,`G4B should own ${JSON.stringify(event)}`);}
assert.equal(api.isDuelVfxV2OwnedEvent({type:"area",skill:"corpseBurst"}),false,'unimplemented area/explosion family must remain legacy-owned');
assert.equal(api.isDuelVfxV2OwnedEvent({type:"status",status:"soulHarvest"}),false,'unclassified future status must remain legacy-owned');
assert.match(vfxSource,/drawPoison/);
assert.match(vfxSource,/drawBlood/);
assert.match(vfxSource,/drawDefense/);
assert.match(vfxSource,/drawHeal/);
assert.match(vfxSource,/drawControl/);
assert.match(bootstrapSource,/js\/duel-vfx-v2\.js\?v=018-g4b/,'browser bootstrap cache key must expose the G4B VFX module');

const vfx=api.createDuelVfxV2();
vfx.consume(cases.map(([event])=>({...event,x:100,y:100,amount:8})));
const status=vfx.getStatus();
assert.equal(status.active,cases.length);
assert.ok(status.counts.poison>=2);
assert.ok(status.counts.blood>=2);
assert.ok(status.counts.defense>=2);
assert.ok(status.counts.heal>=2);
assert.ok(status.counts.control>=3);
vfx.update(2);
assert.equal(vfx.getStatus().active,0,'G4B transient effects must expire');

console.log("V0.18 G4B sustain/control VFX smoke: PASS");