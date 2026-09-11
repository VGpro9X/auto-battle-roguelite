const fs=require("fs");
const path=require("path");
const assert=require("assert");
const vm=require("vm");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const synergyFiles=["js/duel-synergies-c2a.js","js/duel-synergies-c2b.js","js/duel-synergies-c2c.js","js/duel-synergies-c2d.js"];
const evolutionFiles=["js/duel-evolutions-c3a.js","js/duel-evolutions-c3b.js"];
const rareFiles=["js/duel-rares-r1.js","js/duel-rares-r2.js"];
const sources=Object.fromEntries([...synergyFiles,...evolutionFiles,...rareFiles].map(file=>[file,read(file)]));

function extractArray(source,name){
  const match=source.match(new RegExp(`root\\.${name}=\\[([^\\]]*)\\]`));
  assert.ok(match,`missing exported ID array ${name}`);
  return JSON.parse(`[${match[1]}]`);
}

const globals={
  DUEL_C2A_SYNERGY_IDS:extractArray(sources[synergyFiles[0]],"DUEL_C2A_SYNERGY_IDS"),
  DUEL_C2B_SYNERGY_IDS:extractArray(sources[synergyFiles[1]],"DUEL_C2B_SYNERGY_IDS"),
  DUEL_C2C_SYNERGY_IDS:extractArray(sources[synergyFiles[2]],"DUEL_C2C_SYNERGY_IDS"),
  DUEL_C2D_SYNERGY_IDS:extractArray(sources[synergyFiles[3]],"DUEL_C2D_SYNERGY_IDS"),
  DUEL_C3A_EVOLUTION_IDS:extractArray(sources[evolutionFiles[0]],"DUEL_C3A_EVOLUTION_IDS"),
  DUEL_C3B_EVOLUTION_IDS:extractArray(sources[evolutionFiles[1]],"DUEL_C3B_EVOLUTION_IDS")
};
const synergyIds=[...globals.DUEL_C2A_SYNERGY_IDS,...globals.DUEL_C2B_SYNERGY_IDS,...globals.DUEL_C2C_SYNERGY_IDS,...globals.DUEL_C2D_SYNERGY_IDS];
const evolutionIds=[...globals.DUEL_C3A_EVOLUTION_IDS,...globals.DUEL_C3B_EVOLUTION_IDS];
const rareIds=[...extractArray(sources[rareFiles[0]],"DUEL_C4A_RARE_IDS"),...extractArray(sources[rareFiles[1]],"DUEL_C4B_RARE_IDS")];
assert.equal(synergyIds.length,28,'G4 closure requires 28 Hợp Đạo IDs');
assert.equal(new Set(synergyIds).size,28,'Hợp Đạo IDs must be unique');
assert.equal(evolutionIds.length,12,'G4 closure requires 12 Siêu Cấp IDs');
assert.equal(new Set(evolutionIds).size,12,'Siêu Cấp IDs must be unique');
assert.equal(rareIds.length,20,'G4 closure requires 20 Rare IDs');
assert.equal(new Set(rareIds).size,20,'Rare IDs must be unique');

const tierSandbox={globalThis:globals,window:undefined};
vm.createContext(tierSandbox);
vm.runInContext(read("js/duel-vfx-tier.js"),tierSandbox);
const tier=tierSandbox.globalThis;
assert.deepEqual(Array.from(tier.DUEL_VFX_RARE_IDS),rareIds,'tier classifier Rare IDs must match released Duel Rare truth');
for(const id of synergyIds)assert.equal(tier.getDuelVfxTier({type:"status",status:id}),"synergy",`Hợp Đạo tier missing ${id}`);
for(const id of evolutionIds)assert.equal(tier.getDuelVfxTier({type:"status",status:id}),"evolution",`Siêu Cấp tier missing ${id}`);
for(const id of rareIds)assert.equal(tier.getDuelVfxTier({type:"status",status:id}),"rare",`Rare tier missing ${id}`);

const rareSource=rareFiles.map(file=>sources[file]).join("\n");
const activeRareTriggers={
  bribery:["bribery"],immortalBreath:["immortalBreath"],heavenlyPunishment:["heavenlyPunishment"],
  fateExchange:["fateExchange"],heavenlyMandate:["heavenlyMandate"],divineJudgment:["divineJudgment"],
  spatialSwap:["spatialSwap"],equalPrice:["equalPrice"],heavenlyWard:["heavenlyWard"],divineDomain:["divineDomain"],
  lifeRewind:["lifeRewind"],causalInversion:["causalInversion"],timeStop:["timeStop"],celestialEdict:["celestialEdict"],
  heavenSeal:["heavenSeal"],bloodDebt:["bloodDebt"],parasitePact:["parasitePact"],voidReality:["voidPhase","realPhase"],
  scapegoatFate:["scapegoatFate","scapegoatSaved"]
};
function hasSemanticTrigger(token){
  const q=token.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");
  const semanticProperty=new RegExp(`(?:status|skill|source):[^,}\\n]{0,160}["']${q}["']`);
  const semanticHelper=new RegExp(`(?:heal|addShield)\\([^\\n;]*["']${q}["']`);
  return semanticProperty.test(rareSource)||semanticHelper.test(rareSource);
}
for(const [id,tokens] of Object.entries(activeRareTriggers)){
  assert.ok(tokens.some(hasSemanticTrigger),`combat-active Rare lacks a semantic presentation trigger: ${id}`);
  const alias=tokens.find(token=>tier.getDuelRareVisualId({type:"status",status:token})===id)||id;
  assert.equal(tier.getDuelRareVisualId({type:"status",status:alias}),id,`Rare visual identity missing activation alias for ${id}`);
}
assert.ok(rareIds.includes("divineGift"),'divineGift must remain part of the 20 Rare truth');
assert.ok(!activeRareTriggers.divineGift,'divineGift is reward/acquisition-only and must not receive a fabricated combat activation');
assert.match(sources[rareFiles[1]],/status:"heavenSeal"/,'Heaven Seal consumption must be visible when it actually blocks a hit');
assert.match(sources[rareFiles[0]],/status:"immortalBreath"/,'fatal save Immortal Breath must remain visible');
assert.match(sources[rareFiles[1]],/status:"scapegoatSaved"/,'fatal save Scapegoat must remain visible');

const familySandbox={globalThis:{},window:undefined};
vm.createContext(familySandbox);
vm.runInContext(read("js/duel-vfx-v2.js"),familySandbox);
const family=familySandbox.globalThis;
assert.equal(Array.from(family.DUEL_VFX_V2_FAMILIES).length,15,'G4 closure requires the 15 generic semantic VFX families');
assert.equal(family.isDuelVfxV2OwnedEvent({type:"ko",source:"attack"}),false,'plain K.O. must remain on legacy presentation until a dedicated replacement preserves the text');

const vfx=family.createDuelVfxV2();
const stress=[];
for(let i=0;i<240;i++)stress.push({type:"hit",source:i%3===0?"fire":i%3===1?"chaosPoison":"attack",x:100+i%20,y:100,amount:5});
vfx.consume(stress);
assert.equal(vfx.getStatus().active,stress.length,'stress batch should be represented before expiry');
vfx.update(2);
assert.equal(vfx.getStatus().active,0,'G4 transient VFX must fully expire; no permanent effect wall');

console.log("V0.18 G4E full VFX coverage audit: PASS · 28 Hợp Đạo + 12 Siêu Cấp + 20 Rare identities + 15 families");