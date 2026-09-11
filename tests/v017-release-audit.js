const fs=require('fs');
const vm=require('vm');
const assert=require('assert');
function load(path){vm.runInThisContext(fs.readFileSync(path,'utf8'),{filename:path});}

const core=fs.readFileSync('js/core.js','utf8');
const index=fs.readFileSync('index.html','utf8');
const uiSync=fs.readFileSync('js/duel-ui-sync.js','utf8');
const roadmap=fs.readFileSync('ROADMAP.md','utf8');
const readme=fs.readFileSync('README.md','utf8');
const handoff=fs.readFileSync('PROJECT_HANDOFF.md','utf8');
const validation=fs.readFileSync('V017_RELEASE_VALIDATION.md','utf8');

const current=core.match(/GAME_VERSION="(V0\.17|V0\.18)"/);
assert.ok(current,'current runtime must remain a validated V0.17/V0.18 release line');
const currentVersion=current[1];
assert.ok(index.includes(`<title>Auto Battle Roguelite ${currentVersion}</title>`),'static title/current runtime version mismatch');
assert.ok(index.includes(`<div id="version">Auto Battle Roguelite ${currentVersion}</div>`),'static badge/current runtime version mismatch');
assert.ok(uiSync.includes(`${currentVersion} · ĐẤU TRƯỜNG 1V1`),'Duel release eyebrow/current runtime version mismatch');
assert.ok(!core.includes('V0.17 DEV'),'historical V0.17 DEV marker returned');
assert.ok(!index.includes('Auto Battle Roguelite V0.17 DEV'),'historical V0.17 DEV shell marker returned');

for(const [name,text] of [['ROADMAP',roadmap],['README',readme],['PROJECT_HANDOFF',handoff],['V017_RELEASE_VALIDATION',validation]])assert.ok(text.includes('V0.17'),`${name} no longer records V0.17 history`);
assert.ok(roadmap.includes('V0.17 — DUEL ARENA / ĐẤU TRƯỜNG 1v1 — COMPLETE / RELEASED'),'ROADMAP no longer records V0.17 as released history');
assert.ok(/V0\.17[^\n]*COMPLETE \/ RELEASED/s.test(readme)||readme.includes('V0.17 is **COMPLETE / RELEASED**'),'README no longer records V0.17 release closure');
assert.ok(handoff.includes('V0.17 has no unfinished checkpoint')||handoff.includes('No unfinished V0.17 checkpoint remains')||handoff.includes('V0.17 remains frozen'),'PROJECT_HANDOFF no longer records V0.17 closure/freeze');
assert.ok(validation.includes('Status: **COMPLETE / RELEASED**'),'historical V0.17 release evidence lost');

load('js/skills.js');
for(const file of ['duel-skills','duel-engine','duel-skills-d6a','duel-skills-d6b','duel-skills-d6c','duel-skills-d6d','duel-skills-d6e','duel-skills-d6f','duel-skills-d6g','duel-synergies','duel-synergies-c2a','duel-synergies-c2b','duel-synergies-c2c','duel-synergies-c2d','duel-evolutions','duel-evolutions-c3a','duel-evolutions-c3b','duel-rares','duel-rares-r1','duel-rares-r2','duel-tournament'])load(`js/${file}.js`);
assert.strictEqual(DUEL_SKILL_KEYS.length,80,'historical V0.17 regression must retain 80 Duel base skills');
assert.strictEqual(Object.keys(DUEL_SYNERGY_ADAPTERS).length,28,'historical V0.17 regression must retain 28 Duel Hợp Đạo');
assert.strictEqual(Object.keys(DUEL_EVOLUTION_ADAPTERS).length,12,'historical V0.17 regression must retain 12 Duel Siêu Cấp');
assert.strictEqual(Object.keys(DUEL_RARE_ADAPTERS).length,20,'historical V0.17 regression must retain 20 Duel Rare rules');

const requiredScripts=['duel-skills-d6g.js','duel-synergies-c2d.js','duel-evolutions-c3b.js','duel-rares.js','duel-rares-r1.js','duel-rares-r2.js','duel-renderer.js','duel-ui.js','duel-ui-sync.js'];
for(const script of requiredScripts)assert.ok(index.includes(`js/${script}`),`public index missing historical V0.17 subsystem ${script}`);
const ordered=['duel-engine.js','duel-skills-d6g.js','duel-synergies.js','duel-synergies-c2d.js','duel-evolutions.js','duel-evolutions-c3b.js','duel-rares.js','duel-rares-r2.js','duel-renderer.js','duel-ui.js','duel-ui-sync.js'];
let last=-1;for(const script of ordered){const pos=index.indexOf(`js/${script}`);assert.ok(pos>last,`public script order invalid at ${script}`);last=pos;}

const pages=fs.readFileSync('.github/workflows/pages.yml','utf8');
assert.ok(pages.includes('v017-duel-c4-all20-rare-smoke.js'),'Pages gate missing V0.17 C4 regression');
assert.ok(pages.includes('v017-duel-c5-integration-balance.js'),'Pages gate missing V0.17 C5 regression');
assert.ok(pages.includes('cp index.html _site/index.html'));
assert.ok(pages.includes('cp -R css _site/css'));
assert.ok(pages.includes('cp -R js _site/js'));
assert.ok(!pages.includes('cp -R tests _site/tests'),'tests must not ship to Pages');

console.log(`V0.17 historical release regression: PASS · current=${currentVersion} · 80 base + 28 Hợp Đạo + 12 Siêu Cấp + 20 Rare · historical baseline preserved`);
