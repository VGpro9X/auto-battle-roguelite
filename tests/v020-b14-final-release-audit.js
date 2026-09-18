const fs=require("fs"),vm=require("vm"),assert=require("assert");
const read=p=>fs.readFileSync(p,"utf8");
const exists=p=>fs.existsSync(p);
const core=read("js/core.js"),html=read("index.html"),uiSync=read("js/duel-ui-sync.js"),duelUi=read("js/duel-ui-v020.js");
const readme=read("README.md"),roadmap=read("ROADMAP.md"),handoff=read("PROJECT_HANDOFF.md"),plan=read("V020_COMPLETE_VISUAL_REBUILD_PLAN.md"),spec=read("V020_B14_RELEASE_SPEC.md"),pages=read(".github/workflows/pages.yml");

assert(core.includes('const GAME_VERSION="V0.20";'),"runtime GAME_VERSION is not V0.20");
assert(html.includes("<title>Auto Battle Roguelite V0.20</title>"),"public title is not V0.20");
assert(html.includes('<div id="version">Auto Battle Roguelite V0.20</div>'),"public version badge is not V0.20");
assert(uiSync.includes("V0.20 · ĐẤU TRƯỜNG 1V1"),"Duel UI sync label is not V0.20");
assert(duelUi.includes("V0.20 · ĐẤU TRƯỜNG 1V1"),"Duel lobby source label is not V0.20");
assert(html.includes("js/core.js?v=020-release-r1"),"V0.20 core cache key missing");
assert(html.includes("js/duel-ui-sync.js?v=020-release-r1"),"V0.20 Duel UI sync cache key missing");
assert(html.includes("js/duel-renderer-v3-bridge.js?v=020-b13b"),"B13B renderer bridge cache key missing");
assert(html.includes("js/duel-vfx-v3.js?v=020-b12a"),"B12A VFX cache key missing");

assert(readme.includes("Current release: **V0.20 – Complete Visual Rebuild**"),"README current release mismatch");
assert(roadmap.includes("Released baseline: **V0.20 – Complete Visual Rebuild**"),"ROADMAP current release mismatch");
assert(handoff.includes("Current released/public baseline: **V0.20 – Complete Visual Rebuild**"),"handoff current baseline mismatch");
assert(/B0–B13 COMPLETE, B14 (?:ACTIVE|COMPLETE)/.test(plan),"master plan not in B14 release state");
assert(spec.includes("# V0.20 — B14 Integration / Release"),"B14 release spec missing");

for(const file of [
 "V019_RELEASE_VALIDATION.md","V018_RELEASE_VALIDATION.md","V017_RELEASE_VALIDATION.md",
 "V020_B10_UI_HUD_SPEC.md","V020_B11_ICON_PRODUCTION_SPEC.md","V020_B12_ANIMATION_COMBAT_POLISH_SPEC.md","V020_B13_OPTIMIZATION_MOBILE_FALLBACK_SPEC.md"
])assert(exists(file),"release evidence missing: "+file);

assert(pages.includes("cp -R assets _site/assets"),"Pages must ship production assets");
assert(!pages.includes("cp -R tests _site/tests"),"tests must not ship to Pages");

vm.runInThisContext(read("js/skills.js"),{filename:"js/skills.js"});
for(const file of ["duel-skills","duel-engine","duel-skills-d6a","duel-skills-d6b","duel-skills-d6c","duel-skills-d6d","duel-skills-d6e","duel-skills-d6f","duel-skills-d6g","duel-synergies","duel-synergies-c2a","duel-synergies-c2b","duel-synergies-c2c","duel-synergies-c2d","duel-evolutions","duel-evolutions-c3a","duel-evolutions-c3b","duel-rares","duel-rares-r1","duel-rares-r2","duel-tournament"]){
 vm.runInThisContext(read("js/"+file+".js"),{filename:"js/"+file+".js"});
}
assert.strictEqual(DUEL_SKILL_KEYS.length,80,"V0.20 must retain 80 Duel base skills");
assert.strictEqual(Object.keys(DUEL_SYNERGY_ADAPTERS).length,28,"V0.20 must retain 28 Hợp Đạo");
assert.strictEqual(Object.keys(DUEL_EVOLUTION_ADAPTERS).length,12,"V0.20 must retain 12 Siêu Cấp");
assert.strictEqual(Object.keys(DUEL_RARE_ADAPTERS).length,20,"V0.20 must retain 20 Rare rules");

console.log("v020-b14-final-release-audit: PASS · V0.20 promoted · 80/28/12/20 retained · Pages artifact clean");