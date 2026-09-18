const fs=require("fs"),assert=require("assert");
const read=p=>fs.readFileSync(p,"utf8");
const html=read("index.html");
const plan=read("V020_COMPLETE_VISUAL_REBUILD_PLAN.md");
const pages=read(".github/workflows/pages.yml");

assert(/<title>Auto Battle Roguelite V0\.19<\/title>/.test(html),"candidate label must remain V0.19 before promotion");
assert(html.includes('id="version">Auto Battle Roguelite V0.19'),"candidate in-game version must remain V0.19");
assert(plan.includes("B0–B13 COMPLETE, B14 ACTIVE"),"master plan is not at B14 candidate state");

for(const gate of [
  "V0.20 B10 UI/HUD closure gate",
  "V0.20 B11 icon runtime/catalog gate",
  "V0.20 B12A combat polish gate",
  "V0.20 B12B camera impact gate",
  "V0.20 B13A auto quality gate"
])assert(pages.includes(gate),"Pages release chain missing gate: "+gate);

for(const file of [
  "V020_B10_UI_HUD_SPEC.md",
  "V020_B11_ICON_PRODUCTION_SPEC.md",
  "V020_B12_ANIMATION_COMBAT_POLISH_SPEC.md",
  "V020_B13_OPTIMIZATION_MOBILE_FALLBACK_SPEC.md"
])assert(fs.readFileSync(file,"utf8").includes("COMPLETE ✅"),file+" is not closed");

console.log("v020-b14-release-candidate-smoke: ok · B0-B13 closed · V0.19 label safely retained");