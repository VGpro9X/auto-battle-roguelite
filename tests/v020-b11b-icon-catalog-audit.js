const fs=require("fs");
const vm=require("vm");
const assert=require("assert");
function load(path){vm.runInThisContext(fs.readFileSync(path,"utf8"),{filename:path});}

load("js/skills.js");
for(const file of [
  "duel-skills","duel-engine",
  "duel-skills-d6a","duel-skills-d6b","duel-skills-d6c","duel-skills-d6d","duel-skills-d6e","duel-skills-d6f","duel-skills-d6g",
  "duel-synergies","duel-synergies-c2a","duel-synergies-c2b","duel-synergies-c2c","duel-synergies-c2d",
  "duel-evolutions","duel-evolutions-c3a","duel-evolutions-c3b",
  "duel-rares","duel-rares-r1","duel-rares-r2","duel-tournament"
])load("js/"+file+".js");
load("js/duel-skill-visual-map-v3.js");
load("js/v020-icons.js");

assert.strictEqual(DUEL_SKILL_KEYS.length,80,"B11B requires all 80 base Duel skills");
assert.strictEqual(Object.keys(DUEL_SYNERGY_ADAPTERS).length,28,"B11B requires all 28 Duel synergies");
assert.strictEqual(Object.keys(DUEL_EVOLUTION_ADAPTERS).length,12,"B11B requires all 12 Duel evolutions");
assert.strictEqual(DUEL_RARE_ORDER.length,20,"B11B requires all 20 Duel rare rules");
assert(V020_ICON_FAMILIES.includes("physical"),"B11B physical icon family missing");
assert(V020_ICON_FAMILIES.length>=16,"B11B semantic icon vocabulary incomplete");

const B8_TO_ICON={
  physical:"physical",projectile:"projectile",fire:"fire",frost:"frost",lightning:"lightning",poison:"poison",
  blood:"blood",defense:"defense",heal:"heal",control:"control",summon:"summon",area:"area",chain:"mark",time:"time",soul:"soul"
};
function auditMapped(kind,id,meta){
  const profile=getDuelVisualProfileV3(id);
  assert(profile,id+" missing B8 semantic profile");
  const expected=B8_TO_ICON[profile.primary];
  assert(expected,id+" B8 family lacks B11 mapping: "+profile.primary);
  const descriptor=getV020IconDescriptor(kind,id,meta);
  assert.strictEqual(descriptor.family,expected,id+" icon family diverges from B8 VFX semantics");
  const svg=getV020IconMarkup(kind,id,meta,{size:"sm"});
  assert(svg.includes("<svg")&&svg.includes("v20Icon--"+expected),id+" SVG icon markup missing");
}
for(const id of DUEL_SKILL_KEYS)auditMapped("skill",id,getDuelSkill(id));
for(const id of Object.keys(DUEL_SYNERGY_CATALOG))auditMapped("synergy",id,getDuelSynergy(id));
for(const id of Object.keys(DUEL_EVOLUTION_CATALOG))auditMapped("evolution",id,getDuelEvolution(id));

const HIGH_TIER={
  bribery:"control",immortalBreath:"heal",heavenlyPunishment:"lightning",fateExchange:"mark",
  heavenlyMandate:"time",divineJudgment:"mark",spatialSwap:"time",equalPrice:"blood",
  heavenlyWard:"defense",divineDomain:"area",lifeRewind:"time",causalInversion:"time",
  divineGift:"growth",timeStop:"time",celestialEdict:"mark",heavenSeal:"defense",
  bloodDebt:"blood",parasitePact:"soul",voidReality:"soul",scapegoatFate:"soul"
};
assert.deepStrictEqual(Object.keys(HIGH_TIER).sort(),[...DUEL_RARE_ORDER].sort(),"B11B high-tier identity map must cover exactly the 20 released rare IDs");
for(const id of DUEL_RARE_ORDER){
  const meta=getDuelRare(id);
  assert(meta,id+" rare metadata missing");
  const descriptor=getV020IconDescriptor("rare",id,meta);
  assert.strictEqual(descriptor.family,HIGH_TIER[id],id+" rare icon family mismatch");
  assert.strictEqual(descriptor.tier,meta.tier,id+" divine/mystic tier frame mismatch");
}

console.log("v020-b11b-icon-catalog-audit: ok · 80 base + 28 synergy + 12 evolution + 20 rare identities");