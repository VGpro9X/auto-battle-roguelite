const fs=require("fs");
const path=require("path");
const assert=require("assert");
const vm=require("vm");

const root=path.resolve(__dirname,"..");
const tierSource=fs.readFileSync(path.join(root,"js/duel-vfx-tier.js"),"utf8");
const rendererSource=fs.readFileSync(path.join(root,"js/duel-renderer-v2.js"),"utf8");
const bootstrapSource=fs.readFileSync(path.join(root,"js/duel-renderer.js"),"utf8");

const globals={
  DUEL_C2A_SYNERGY_IDS:["criticalStorm"],
  DUEL_C2B_SYNERGY_IDS:["bloodLink"],
  DUEL_C2C_SYNERGY_IDS:[],
  DUEL_C2D_SYNERGY_IDS:[],
  DUEL_C3A_EVOLUTION_IDS:["heavenfire"],
  DUEL_C3B_EVOLUTION_IDS:["chaosCrown"]
};
const sandbox={globalThis:globals,window:undefined};
vm.createContext(sandbox);
vm.runInContext(tierSource,sandbox);
const api=sandbox.globalThis;

assert.equal(api.getDuelVfxTier({type:"cast",skill:"criticalStorm"}),"synergy");
assert.equal(api.getDuelVfxTier({type:"cast",skill:"bloodLink"}),"synergy");
assert.equal(api.getDuelVfxTier({type:"cast",skill:"heavenfire"}),"evolution");
assert.equal(api.getDuelVfxTier({type:"status",status:"chaosCrown"}),"evolution");
assert.equal(api.getDuelVfxTier({type:"status",status:"timeStop"}),"rare");
assert.equal(api.getDuelVfxTier({type:"hit",source:"basicUnknown"}),"base");

const rareIds=Array.from(api.DUEL_VFX_RARE_IDS);
assert.equal(rareIds.length,20,'G4D must preserve all 20 Rare visual identities');
assert.equal(new Set(rareIds).size,20,'Rare IDs must be unique');
assert.equal(api.getDuelRareVisualId({type:"status",status:"voidPhase"}),"voidReality");
assert.equal(api.getDuelRareVisualId({type:"status",status:"realPhase"}),"voidReality");
assert.equal(api.getDuelRareVisualId({type:"status",status:"scapegoatSaved"}),"scapegoatFate");
assert.equal(api.getDuelRareVisualId({type:"status",status:"divineGift"}),"divineGift");

const signatures=rareIds.map(id=>api.getDuelRareVisualSignature(id));
for(const signature of signatures)assert.ok(signature&&signature.id,'every Rare must expose a visual signature');
const serialized=signatures.map(s=>JSON.stringify([s.sides,s.satellites,s.dash,s.spin,Number(s.phase.toFixed(6))]));
assert.equal(new Set(serialized).size,20,'all 20 Rare visual signatures must be distinct');

assert.match(rendererSource,/createDuelVfxTierOverlay/,'Renderer V2 must create the tier overlay');
assert.match(rendererSource,/tierVfx\?\.consume\?\.\(list\)/,'Renderer V2 must feed semantic events to the tier overlay');
assert.match(rendererSource,/tierVfx\?\.render\?\.\(ctx,tr,match,getAnchor\)/,'tier overlay must share camera transform and anchors');
assert.match(bootstrapSource,/js\/duel-vfx-tier\.js\?v=018-g4d/,'public bootstrap must load the G4D tier module');

const overlay=api.createDuelVfxTierOverlay();
overlay.consume([
  {type:"cast",skill:"criticalStorm",x:100,y:100},
  {type:"cast",skill:"heavenfire",x:120,y:100},
  {type:"status",status:"timeStop",x:140,y:100},
  {type:"hit",source:"basicUnknown",x:160,y:100}
]);
let status=overlay.getStatus();
assert.equal(status.active,3,'base event must not create a tier overlay');
assert.equal(status.tiers.synergy,1);
assert.equal(status.tiers.evolution,1);
assert.equal(status.tiers.rare,1);
overlay.update(2);
status=overlay.getStatus();
assert.equal(status.active,0,'tier/Rare overlays must expire');

console.log("V0.18 G4D tier/Rare VFX smoke: PASS");