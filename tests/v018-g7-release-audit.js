const fs=require('fs');
const path=require('path');
const vm=require('vm');
const assert=require('assert');

const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const exists=file=>fs.existsSync(path.join(root,file));
const load=file=>vm.runInThisContext(read(file),{filename:file});

const core=read('js/core.js');
const index=read('index.html');
const uiSync=read('js/duel-ui-sync.js');
const readme=read('README.md');
const roadmap=read('ROADMAP.md');
const handoff=read('PROJECT_HANDOFF.md');
const plan=read('V018_GRAPHICS_PLAN.md');
const release=read('V018_RELEASE_VALIDATION.md');
const pages=read('.github/workflows/pages.yml');
const g7Workflow=read('.github/workflows/v018-g7-release-validation.yml');

const versionMatch=core.match(/GAME_VERSION="(V0\.17|V0\.18)"/);
assert.ok(versionMatch,'runtime version must be V0.17 pre-release or V0.18 released');
const version=versionMatch[1];
assert.ok(index.includes(`<title>Auto Battle Roguelite ${version}</title>`),'static title/runtime version mismatch');
assert.ok(index.includes(`<div id="version">Auto Battle Roguelite ${version}</div>`),'static badge/runtime version mismatch');
assert.ok(uiSync.includes(`${version} · ĐẤU TRƯỜNG 1V1`),'Duel release label/runtime version mismatch');
assert.ok(handoff.includes('Current released/public baseline:'),'PROJECT_HANDOFF must preserve released/public baseline marker');

if(version==='V0.17'){
  assert.ok(release.includes('Status: **G7 PRE-RELEASE VALIDATION**'),'pre-release document status must remain explicit before promotion');
  assert.ok(readme.includes('G6 Performance / Quality / Fallback Hardening: **COMPLETE**'),'README must close G6 before G7');
  assert.ok(readme.includes('G7 — V0.18 Integration / Release Validation'),'README must point to G7');
  assert.ok(roadmap.includes('G7 — V0.18 Integration / Release Validation — NEXT'),'ROADMAP must point to G7');
  assert.ok(handoff.includes('G6 complete, G7 next'),'handoff must point to G7');
  assert.ok(plan.includes('G6 COMPLETE / G7 NEXT'),'graphics plan must point to G7');
}else{
  assert.ok(release.includes('Status: **COMPLETE / RELEASED**'),'promoted V0.18 requires released validation document');
  for(const [name,text] of [['README',readme],['ROADMAP',roadmap],['PROJECT_HANDOFF',handoff],['V018_GRAPHICS_PLAN',plan]])assert.ok(/V0\.18/.test(text)&&/COMPLETE|RELEASED/.test(text),`${name} must record V0.18 closure after promotion`);
}

load('js/skills.js');
for(const file of ['duel-skills','duel-engine','duel-skills-d6a','duel-skills-d6b','duel-skills-d6c','duel-skills-d6d','duel-skills-d6e','duel-skills-d6f','duel-skills-d6g','duel-synergies','duel-synergies-c2a','duel-synergies-c2b','duel-synergies-c2c','duel-synergies-c2d','duel-evolutions','duel-evolutions-c3a','duel-evolutions-c3b','duel-rares','duel-rares-r1','duel-rares-r2','duel-tournament'])load(`js/${file}.js`);
assert.strictEqual(DUEL_SKILL_KEYS.length,80,'G7 release must retain 80 Duel base skills');
assert.strictEqual(Object.keys(DUEL_SYNERGY_ADAPTERS).length,28,'G7 release must retain 28 Hợp Đạo');
assert.strictEqual(Object.keys(DUEL_EVOLUTION_ADAPTERS).length,12,'G7 release must retain 12 Siêu Cấp');
assert.strictEqual(Object.keys(DUEL_RARE_ADAPTERS).length,20,'G7 release must retain 20 Rare rules');

const requiredStates=['idle','walk','run','dash','melee','ranged','cast','hit','block','knockback','knockdown','recover','ko'];
const requiredAnchors=['head','chest','leftHand','rightHand','feet','front','back','target'];
const fighterBase=path.join(root,'assets/duel/fighters/base');
const fighter=JSON.parse(fs.readFileSync(path.join(fighterBase,'manifest.json'),'utf8'));
assert.deepStrictEqual(Object.keys(fighter.animations||{}).sort(),[...requiredStates].sort(),'production fighter manifest must contain exactly 13 required states');
for(const state of requiredStates){const animation=fighter.animations[state];assert.ok(animation?.src,`${state} asset src missing`);assert.ok(fs.existsSync(path.join(fighterBase,animation.src)),`${state} production asset missing`);assert.ok(Array.isArray(animation.anchors)&&animation.anchors.length>=1,`${state} anchors missing`);for(const anchor of requiredAnchors)assert.ok(animation.anchors[0][anchor],`${state} missing anchor ${anchor}`);}

const arenaBase=path.join(root,'assets/duel/arenas/ashen-sanctum');
const arena=JSON.parse(fs.readFileSync(path.join(arenaBase,'manifest.json'),'utf8'));
assert.strictEqual(arena.id,'ashen-sanctum','canonical production arena id changed');
assert.strictEqual((arena.layers||[]).length,6,'production arena must retain six layers');
for(const layer of arena.layers){assert.ok(layer.src,`arena layer ${layer.id} src missing`);assert.ok(fs.existsSync(path.join(arenaBase,layer.src)),`arena production asset missing: ${layer.src}`);}

for(const file of [
  'js/duel-visual-assets.js','js/duel-animation.js','js/duel-visual-quality.js','js/duel-camera.js',
  'js/duel-vfx-v2.js','js/duel-vfx-tier.js','js/duel-vfx-budget.js','js/duel-renderer.js','js/duel-renderer-v2.js',
  'js/duel-ui-polish.js','tests/v018-g5e-browser-driver.html','tests/v018-g6d-fallback-browser-driver.html',
  'tests/v018-g6e-performance-browser-driver.html','tests/v018-g7-release-browser-driver.html',
  '.github/workflows/v018-g5e-ui-validation.yml','.github/workflows/v018-g6d-fallback-validation.yml',
  '.github/workflows/v018-g6e-performance-validation.yml','.github/workflows/v018-g7-release-validation.yml'
])assert.ok(exists(file),`G7 release dependency missing: ${file}`);

assert.ok(index.includes('js/duel-renderer.js?v=018-g6e'),'public shell must carry the G6E outer renderer cache key into G7');
assert.ok(pages.includes('v018-g6e-performance-closure-smoke.js'),'Pages must retain G6E closure gate');
assert.ok(pages.includes('v018-g7-release-audit.js'),'Pages must include G7 release audit');
assert.ok(pages.includes('cp -R assets _site/assets'),'Pages must ship production assets');
assert.ok(!pages.includes('cp -R tests _site/tests'),'tests must never ship to Pages');
assert.ok(g7Workflow.includes('v018-g7-release-audit.js'),'G7 workflow missing static release audit');
assert.ok(g7Workflow.includes('V018_G7_BROWSER_PASS'),'G7 workflow missing production browser gate');
assert.ok(g7Workflow.includes('V018_G6D_FALLBACK_PASS'),'G7 workflow must revalidate fallback');
assert.ok(g7Workflow.includes('V018_G6E_PERF_PASS'),'G7 workflow must revalidate performance/reduced-motion matrix');

console.log(`V0.18 G7 integrated release audit: PASS · phase=${version==='V0.17'?'pre-release':'released'} · 80/28/12/20 · 13 states · 8 anchors · 6 arena layers`);
