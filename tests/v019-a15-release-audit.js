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
const plan=read('V019_TACTICAL_AI_PLAN.md');
const release=read('V019_RELEASE_VALIDATION.md');
const pages=read('.github/workflows/pages.yml');

const currentVersion=core.includes('const GAME_VERSION="V0.20"')?'V0.20':core.includes('const GAME_VERSION="V0.19"')?'V0.19':null;
assert.ok(currentVersion,'runtime GAME_VERSION must remain V0.19+ compatible');
assert.ok(index.includes(`<title>Auto Battle Roguelite ${currentVersion}</title>`),'static title/runtime version mismatch');
assert.ok(index.includes(`<div id="version">Auto Battle Roguelite ${currentVersion}</div>`),'static badge/runtime version mismatch');
assert.ok(uiSync.includes(`${currentVersion} · ĐẤU TRƯỜNG 1V1`),'Duel release label/runtime version mismatch');
for(const src of [
  'js/v019-survival-ai.js?v=019-release-r1',
  'js/v019-duel-ai.js?v=019-release-r1'
])assert.ok(index.includes(src),`historical AI cache key missing: ${src}`);
assert.ok(/js\/core\.js\?v=(?:019-release-r1|020-release-r1)/.test(index),'core release cache key missing');
assert.ok(/js\/duel-ui-sync\.js\?v=(?:019-release-r1|020-release-r1)/.test(index),'Duel UI sync release cache key missing');

if(currentVersion==='V0.20'){
  assert.ok(readme.includes('Current release: **V0.20 – Complete Visual Rebuild**'),'README current release mismatch');
  assert.ok(roadmap.includes('Released baseline: **V0.20 – Complete Visual Rebuild**'),'ROADMAP current release mismatch');
  assert.ok(handoff.includes('Current released/public baseline: **V0.20 – Complete Visual Rebuild**'),'handoff current baseline mismatch');
}else{
  assert.ok(readme.includes('Current release: **V0.19 – Tactical AI & Movement Intelligence**'),'README current release mismatch');
  assert.ok(roadmap.includes('Released baseline: **V0.19 – Tactical AI & Movement Intelligence**'),'ROADMAP current release mismatch');
  assert.ok(handoff.includes('Current released/public baseline: **V0.19 – Tactical AI & Movement Intelligence**'),'handoff current baseline mismatch');
}
assert.ok(plan.includes('Status: **COMPLETE / RELEASED**'),'V0.19 plan must be closed');
assert.ok(release.includes('Status: **COMPLETE / RELEASED**'),'V0.19 release evidence must be closed');
for(const checkpoint of Array.from({length:16},(_,i)=>`A${i}`))assert.ok(plan.includes(`${checkpoint}`)&&plan.includes('COMPLETE'),`plan closure missing ${checkpoint}`);

for(const file of [
  'js/v019-survival-ai.js','js/v019-duel-ai.js',
  'tests/v019-survival-ai-smoke.js','tests/v019-survival-utility-smoke.js','tests/v019-duel-ai-smoke.js',
  'tests/v019-survival-simulation.js','tests/v019-duel-simulation.js','tests/v019-ai-performance-smoke.js',
  'tests/v019-a14-ai-browser-driver.html',
  '.github/workflows/v019-ai-validation.yml','.github/workflows/v019-a14-browser-validation.yml',
  '.github/workflows/v019-a15-release-validation.yml'
])assert.ok(exists(file),`V0.19 release dependency missing: ${file}`);

load('js/skills.js');
for(const file of ['duel-skills','duel-engine','duel-skills-d6a','duel-skills-d6b','duel-skills-d6c','duel-skills-d6d','duel-skills-d6e','duel-skills-d6f','duel-skills-d6g','duel-synergies','duel-synergies-c2a','duel-synergies-c2b','duel-synergies-c2c','duel-synergies-c2d','duel-evolutions','duel-evolutions-c3a','duel-evolutions-c3b','duel-rares','duel-rares-r1','duel-rares-r2','duel-tournament'])load(`js/${file}.js`);
assert.strictEqual(DUEL_SKILL_KEYS.length,80,'V0.19 must retain 80 Duel base skills');
assert.strictEqual(Object.keys(DUEL_SYNERGY_ADAPTERS).length,28,'V0.19 must retain 28 Hợp Đạo');
assert.strictEqual(Object.keys(DUEL_EVOLUTION_ADAPTERS).length,12,'V0.19 must retain 12 Siêu Cấp');
assert.strictEqual(Object.keys(DUEL_RARE_ADAPTERS).length,20,'V0.19 must retain 20 Rare rules');

assert.ok(pages.includes('cp -R assets _site/assets'),'Pages must ship production assets');
assert.ok(!pages.includes('cp -R tests _site/tests'),'tests must not ship to Pages');
assert.ok(readme.includes('V0.18')&&readme.includes('V0.17'),'historical baselines must remain documented');
assert.ok(handoff.includes('Current released/public baseline'),'required handoff marker missing');

console.log(`V0.19 A15 historical regression audit: PASS · current=${currentVersion} · 80/28/12/20 retained · tests excluded from Pages`);
