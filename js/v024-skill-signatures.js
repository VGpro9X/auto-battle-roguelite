// V0.24 — Author-authored Survival skill-ID visual language.
// These metadata entries control visuals only. Every owned base skill (including passives)
// receives a deterministic unique fallback inscription derived from its stable skill ID.
(function(root){"use strict";
const authored={
  fire:["comet","#ff9755","#ffe0a0",1],fireWisp:["wisp","#ffbd6a","#9ef5da",2],
  lightning:["thunder","#fff0a2","#97c9ff",1],stormTotem:["totem","#e3e7ff","#fff68b",2],
  frost:["snowflake","#a7edff","#e9fbff",1],frostMirror:["mirror","#b1ddff","#f7feff",2],
  shatter:["shatter","#a8dfff","#ffffff",3],poison:["spores","#96e7a1","#caff77",1],
  conductiveVenom:["toxicBolt","#d8ff96","#a0e2ff",2],blackHole:["singularity","#af8fff","#dddbff",1],
  nova:["mandala","#d4b2ff","#f3dbff",1],chaosOrb:["chaos","#ffaade","#aeeaff",2],
  echoShot:["echo","#a5bfff","#f1f8ff",1],afterimage:["phantom","#a4cdff","#d0b6ff",2],
  meteorSeal:["meteor","#ffa35e","#ffe1a8",2],runeMine:["rune","#ffb678","#eee5ff",3],
  bloodLink:["bloodChain","#fe92b9","#ffd0db",1],soulBind:["soulChain","#c5abff","#e7d8ff",2],
  strideShock:["footfall","#c8deff","#ffffff",1],returnBlade:["boomerang","#d2f1ff","#a0d0ff",3],
  sevenStarStrike:["sevenStar","#e9ddff","#ffe8ad",1],staticField:["capacitor","#ffe88d","#98d7ff",2],
  soulLantern:["lantern","#d0b5ff","#ffda96",3],guardianIdol:["guardian","#83ddb9","#d4f8e4",1],
  timeField:["clock","#b7c5ff","#eef5ff",2],deathMark:["seal","#d5bdff","#ffc3d8",1],
  sacrifice:["bloodFlame","#ff6685","#ffbb81",1],barrier:["aegis","#88d3ff","#d9f9ff",2],
  luckyStar:["lucky","#fff0ae","#a4e1ff",1],spiritPearl:["pearl","#b3f9e2","#f8fcff",2],
  knock:["windCut","#b9f0ff","#e6faff",2],orbit:["swordDance","#dbebff","#a7c2ff",3],
  thorns:["thorn","#fb8ca5","#ffd1d6",1],retaliate:["shock","#ffb5ca","#ffe9f3",2],
  explosive:["bomb","#ffaf7e","#ffe5c7",3],combustion:["pyre","#ff805f","#ffd587",3],
  corpseBurst:["ash","#de8ba0","#ffdfaa",1],xpStorm:["xpThunder","#9cceff","#fffaa2",3],
  xpHeal:["dew","#8af2bb","#d7fff2",1],levelBurst:["ascension","#d3b4ff","#e6ecff",3],
  shieldPulse:["aegisBreak","#92cfff","#d4f4ff",3],soulHarvest:["soulEye","#bca2ff","#f1d4ff",1],
  armorBreak:["fracture","#ffc89b","#eaf4ff",2],bloodShield:["crimsonWard","#ff91ac","#e2ccff",1],
  focusMind:["focus","#d2daff","#fff4c5",3],timeEcho:["timeSpiral","#b7c5ff","#f9fcff",1],
  staticPulse:["capacitor","#ffe88d","#98d7ff",3],plagueLightning:["toxicBolt","#dbff91","#a0e2ff",3],
  markSpread:["seal","#d5bdff","#ffe5ae",3],phantomStep:["phantom","#b6d7ff","#f2f5ff",1],
  multishot:["swordDance","#d8e9ff","#ffffff",2],ricochet:["boomerang","#e2ecff","#b9dbff",2],
  velocity:["windCut","#bfeeff","#ffffff",3],precision:["focus","#ffeaa9","#e3f0ff",1]
};
const direct=Object.create(null);
for(const [key,data] of Object.entries(authored))direct[key]=Object.freeze({id:key,motif:data[0],color:data[1],accent:data[2],variant:data[3],authored:true});
const palette={
  FIRE:["comet","#ff9b66","#ffe1ae"],ICE:["snowflake","#a8e9ff","#eafaff"],
  LIGHTNING:["thunder","#ffeb91","#a4d7ff"],POISON:["spores","#a1e18d","#ddffa4"],
  BLOOD:["bloodChain","#f48fa8","#fcd1e0"],SOUL:["soulEye","#c7a6ff","#f0d8ff"],
  TIME:["clock","#aebeff","#f3f6ff"],SHIELD:["aegis","#89d3ff","#e6f8ff"],
  HEAL:["dew","#85efba","#e3ffef"],SUMMON:["guardian","#a6e8cb","#e8fff5"],
  CONTROL:["seal","#d0b3ff","#eae1ff"],AREA:["mandala","#d6c1ff","#e9eaff"],
  PROJECTILE:["boomerang","#dae8ff","#f7fbff"],ATTACK:["swordDance","#e6eaff","#fff5da"],
  MOVEMENT:["windCut","#b6ebff","#e9fbff"],XP:["lucky","#a3d2ff","#ffefb5"]
};
function seedFor(key){let hash=2166136261;for(let i=0;i<key.length;i++){hash^=key.charCodeAt(i);hash=Math.imul(hash,16777619);}return hash>>>0;}
function resolve(key,tags){
  if(direct[key])return direct[key];
  if(!key||typeof key!=="string")return null;
  const known=typeof skills!=="undefined"&&skills[key];
  if(!known&&!Array.isArray(tags))return null;
  const actual=Array.isArray(tags)?tags:known?.tags||[];
  const family=Object.keys(palette).find(t=>actual.includes(t));
  const colors=palette[family]||["inscription","#bfcbec","#f2e8ff"],seed=seedFor(key);
  return{id:key,motif:colors[0],color:colors[1],accent:colors[2],variant:(seed%5)+1,authored:false};
}
root.V024_SKILL_SIGNATURES=Object.freeze(direct);
root.getV024SkillSignature=resolve;
root.getV024SkillSignatureCoverage=()=>{
  const names=typeof skills!=="undefined"?Object.keys(skills):[];
  return{baseSkills:names.length,authored:names.filter(key=>!!direct[key]).length,derived:names.filter(key=>!direct[key]).length,activeSources:Object.keys(direct).length};
};
root.getV024SkillSeed=seedFor;
})(typeof window!=="undefined"?window:globalThis);
