const fs=require('fs');
const assert=require('assert');

const expectedRare=[
  'bribery','immortalBreath','heavenlyPunishment','fateExchange',
  'heavenlyMandate','divineJudgment','spatialSwap','equalPrice',
  'heavenlyWard','divineDomain','lifeRewind','causalInversion',
  'divineGift','timeStop','celestialEdict','heavenSeal',
  'bloodDebt','parasitePact','voidReality','scapegoatFate'
];

const rareSources=[
  'js/divine-skills.js','js/v016-run-systems.js','js/v016-rares-r3.js','js/v016-rares-r4.js'
].map(file=>fs.readFileSync(file,'utf8')).join('\n');
for(const id of expectedRare){
  assert(rareSources.includes(`id:"${id}"`),`Rare registry must define ${id}`);
  assert(rareSources.includes(`preview:"${id}"`),`Rare ${id} must declare its dedicated preview identity`);
}

const rareVfx=fs.readFileSync('js/v016-rare-vfx.js','utf8');
function extractCoverageSet(name){
  const match=rareVfx.match(new RegExp(`${name}:new Set\\(\\[([\\s\\S]*?)\\]\\)`));
  assert(match,`Missing ${name} coverage set`);
  return[...match[1].matchAll(/"([A-Za-z][A-Za-z0-9_]*)"/g)].map(m=>m[1]);
}
const previewIds=extractCoverageSet('previewIds');
const liveIds=extractCoverageSet('liveIds');
assert.deepStrictEqual([...new Set(previewIds)].sort(),expectedRare.slice().sort(),'Dedicated rare preview coverage must equal the full 20-rare registry');
assert.deepStrictEqual([...new Set(liveIds)].sort(),expectedRare.slice().sort(),'Live rare feedback coverage must equal the full 20-rare registry');

// Final content arithmetic is independently asserted here in addition to the focused suites.
const baseSource=fs.readFileSync('js/skills.js','utf8');
const originalSkills=[...baseSource.matchAll(/^  ([A-Za-z][A-Za-z0-9_]*):/gm)].map(m=>m[1]);
const addedSkillSource=['js/v016-skills-a1.js','js/v016-skills-a2.js','js/v016-skills-a3.js','js/v016-skills-a4.js'].map(file=>fs.readFileSync(file,'utf8')).join('\n');
const addedSkills=[...addedSkillSource.matchAll(/skills\.([A-Za-z][A-Za-z0-9_]*)\s*=\s*\{/g)].map(m=>m[1]);
assert.strictEqual(new Set([...originalSkills,...addedSkills]).size,80,'Final base Kỹ Năng count must be 80');

const synergyBase=fs.readFileSync('js/synergies.js','utf8').split('const EVOLUTIONS=')[0];
const synergyAdded=['js/v016-synergies-b1.js','js/v016-synergies-b2.js'].map(file=>fs.readFileSync(file,'utf8')).join('\n');
const synergyIds=[...synergyBase.matchAll(/id:"([A-Za-z][A-Za-z0-9_]*)"/g),...synergyAdded.matchAll(/id:"([A-Za-z][A-Za-z0-9_]*)"/g)].map(m=>m[1]);
assert.strictEqual(new Set(synergyIds).size,28,'Final Hợp Đạo count must be 28');

const synergiesSource=fs.readFileSync('js/synergies.js','utf8');
const evolutionBlock=synergiesSource.split('const EVOLUTIONS={')[1].split('\n};')[0];
const evolutionBase=[...evolutionBlock.matchAll(/id:"([A-Za-z][A-Za-z0-9_]*)"/g)].map(m=>m[1]);
const evolutionAdded=[...fs.readFileSync('js/v016-evolutions-c1.js','utf8').matchAll(/id:"([A-Za-z][A-Za-z0-9_]*)"/g)].map(m=>m[1]);
assert.strictEqual(new Set([...evolutionBase,...evolutionAdded]).size,12,'Final Siêu Cấp count must be 12');
assert.strictEqual(80+28+12+expectedRare.length,140,'Final Codex arithmetic must equal 140');

const codex=fs.readFileSync('js/skill-codex.js','utf8');
assert(codex.includes('Object.entries(skills)'),'Codex must enumerate the live base-skill registry');
assert(codex.includes('Object.entries(SYNERGIES)'),'Codex must enumerate the live Hợp Đạo registry');
assert(codex.includes('Object.entries(EVOLUTIONS)'),'Codex must enumerate the live Siêu Cấp registry');
assert(codex.includes('Object.entries(DIVINE_SKILLS)'),'Codex must enumerate the live rare registry');

// Mechanical-truth guard: there must be no global hidden 1.25s retry rule.
const divine=fs.readFileSync('js/divine-skills.js','utf8');
const r4=fs.readFileSync('js/v016-rares-r4.js','utf8');
assert(divine.includes('item.retryCooldown??item.cooldown'),'Failed rare activations must use only an explicitly declared retry cooldown or their stated normal cooldown');
assert(!divine.includes('Math.min(1.25,item.cooldown*.18)'),'Hidden generic rare retry timing must stay removed');
assert(r4.includes('cooldown:28,retryCooldown:1.25,preview:"scapegoatFate"'),'Thế Mệnh must explicitly declare its disclosed 1.25s retry rule');
assert(r4.includes('thử lại sau tối đa 1.25 giây'),'Thế Mệnh description must disclose its retry timing');

// Final-piece-only hint regression guard.
const hintFix=fs.readFileSync('js/evolution-hint-fix.js','utf8');
assert(hintFix.includes('if(progress.met===progress.total)'),'Hợp Đạo choice hints must require immediate completion');
assert(hintFix.includes('if(contributes&&effect.ready)'),'Siêu Cấp choice hints must require immediate completion');
assert(hintFix.includes('getNearBuildUnlocks'),'Partial progress must remain available in the left build tracker');

// Public integration: audited mechanics and dedicated rare VFX must be the files users actually receive.
const index=fs.readFileSync('index.html','utf8');
const divineTag='js/divine-skills.js?v=016dev-audit-r1';
const r4Tag='js/v016-rares-r4.js?v=016dev-audit-r1';
const endlessTag='js/v016-endless-starting-rare.js?v=016dev-endless-r1';
const rareVfxTag='js/v016-rare-vfx.js?v=016dev-audit-r1';
const codexTag='js/skill-codex.js?v=016dev-evol12-r1';
for(const tag of [divineTag,r4Tag,endlessTag,rareVfxTag,codexTag])assert(index.includes(tag),`Public build must load ${tag}`);
assert(index.indexOf(r4Tag)<index.indexOf(endlessTag),'All rare definitions must load before Endless chooses from the full pool');
assert(index.indexOf(endlessTag)<index.indexOf(rareVfxTag),'Endless flow must register before final rare visual audit layer');
assert(index.indexOf(rareVfxTag)<index.indexOf(codexTag),'Dedicated rare preview wrapper must load before Codex initializes');
assert(!index.includes('tests/'),'Playable public index must never load executable test harnesses');

const workflow=fs.readFileSync('.github/workflows/pages.yml','utf8');
assert(workflow.includes('cp index.html _site/index.html'),'Pages artifact must include the playable index');
assert(workflow.includes('cp -R css _site/css'),'Pages artifact must include CSS');
assert(workflow.includes('cp -R js _site/js'),'Pages artifact must include runtime JS');
assert(!workflow.includes('cp -R tests'),'Pages artifact must not ship the tests directory');

console.log('V0.16 final content/truth audit smoke: PASS');
