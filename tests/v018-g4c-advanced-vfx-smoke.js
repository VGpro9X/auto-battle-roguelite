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

assert.deepEqual(Array.from(api.DUEL_VFX_V2_ADVANCED_FAMILIES),["summon","area","chain","time","soul"]);
const families=Array.from(api.DUEL_VFX_V2_FAMILIES);
assert.equal(families.length,15,'G4C should expose 15 cumulative generic VFX families');

const cases=[
  [{type:"orbit_hit",side:"player",target:"opponent"},"summon"],
  [{type:"status",status:"spiritPearlCharge"},"summon"],
  [{type:"area",skill:"runeMine",radius:70},"area"],
  [{type:"area",skill:"corpseBurst",radius:78},"area"],
  [{type:"projectile_spawn",source:"ricochet"},"chain"],
  [{type:"cast",skill:"ricochet"},"chain"],
  [{type:"status",status:"timeStop"},"time"],
  [{type:"status",status:"lifeRewind"},"time"],
  [{type:"status",status:"voidPhase"},"time"],
  [{type:"status",status:"afterimage"},"time"],
  [{type:"status",status:"soulHarvest"},"soul"],
  [{type:"status",status:"sealedSoul"},"soul"],
  [{type:"hit",source:"deathMark"},"soul"]
];
for(const [event,family] of cases){assert.equal(api.getDuelVfxFamily(event),family,`wrong G4C family for ${JSON.stringify(event)}`);assert.equal(api.isDuelVfxV2OwnedEvent(event),true,`G4C should own ${JSON.stringify(event)}`);}

// Existing specific family identity must outrank new generic chain/area labels.
assert.equal(api.getDuelVfxFamily({type:"cast",skill:"thunderStride",chain:true}),"lightning");
assert.equal(api.getDuelVfxFamily({type:"hit",source:"conductiveVenom",chain:true}),"lightning");
assert.equal(api.getDuelVfxFamily({type:"cast",skill:"bloodLink",chain:true}),"blood");
assert.equal(api.getDuelVfxFamily({type:"status",status:"soulBind"}),"control");
assert.equal(api.isDuelVfxV2OwnedEvent({type:"ko",source:"attack"}),false,'plain KO must stay legacy-owned until a dedicated KO override preserves K.O. presentation');

for(const name of ["drawSummon","drawArea","drawChain","drawTime","drawSoul"])assert.match(vfxSource,new RegExp(name),`${name} missing`);
assert.match(bootstrapSource,/js\/duel-vfx-v2\.js\?v=018-g4c/,'browser bootstrap cache key must expose G4C');

const vfx=api.createDuelVfxV2();
vfx.consume(cases.map(([event])=>({...event,x:120,y:120,amount:9})));
const status=vfx.getStatus();
assert.equal(status.active,cases.length);
assert.ok(status.counts.summon>=2);
assert.ok(status.counts.area>=2);
assert.ok(status.counts.chain>=2);
assert.ok(status.counts.time>=4);
assert.ok(status.counts.soul>=3);
vfx.update(2);
assert.equal(vfx.getStatus().active,0,'G4C transient effects must expire');

console.log("V0.18 G4C advanced semantic VFX smoke: PASS");