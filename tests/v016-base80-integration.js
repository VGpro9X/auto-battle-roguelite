const fs=require('fs');
const assert=require('assert');

const baseSource=fs.readFileSync('js/skills.js','utf8');
const moduleFiles=[
  'js/v016-skills-a1.js',
  'js/v016-skills-a2.js',
  'js/v016-skills-a3.js',
  'js/v016-skills-a4.js'
];
const moduleSource=moduleFiles.map(file=>fs.readFileSync(file,'utf8')).join('\n');
const index=fs.readFileSync('index.html','utf8');
const core=fs.readFileSync('js/core.js','utf8');

const originalKeys=[...baseSource.matchAll(/^  ([A-Za-z][A-Za-z0-9_]*):/gm)].map(match=>match[1]);
assert.strictEqual(originalKeys.length,64,`Expected 64 original base skills, found ${originalKeys.length}`);

const addedKeys=[...moduleSource.matchAll(/skills\.([A-Za-z][A-Za-z0-9_]*)\s*=\s*\{/g)].map(match=>match[1]);
const expectedAdded=[
  'afterimage','runeMine','bloodLink','spiritPearl',
  'strideShock','soulBind','returnBlade','meteorSeal',
  'guardianIdol','frostMirror','focusMind','sevenStarStrike',
  'staticField','soulLantern','armorBreak','timeField'
];
assert.deepStrictEqual([...new Set(addedKeys)].sort(),expectedAdded.slice().sort(),'V0.16 base-skill modules must define exactly the 16 locked additions');
assert.strictEqual(new Set([...originalKeys,...addedKeys]).size,80,'Combined base-skill pool must contain exactly 80 unique skills');

for(const file of moduleFiles){
  assert(index.includes(file+'?v=016dev-base80-r1'),`index.html must cache-bust ${file}`);
}
assert(index.includes('js/skill-codex.js?v=016dev-r3'),'Codex script must use the current V0.16 development cache key');
assert(index.indexOf('js/v016-skills-a4.js?v=016dev-base80-r1')<index.indexOf('js/skill-codex.js?v=016dev-r3'),'All V0.16 base skills must register before the Codex script loads');
assert(index.indexOf('js/v016-run-systems.js?v=016dev-r3')<index.indexOf('js/v016-rares-r3.js?v=016dev-r3'),'Run systems must load before rare R3');
assert(index.indexOf('js/v016-rares-r3.js?v=016dev-r3')<index.indexOf('js/v016-rares-r4.js?v=016dev-r3'),'Rare R3 must load before rare R4');
assert(index.indexOf('js/v016-rares-r4.js?v=016dev-r3')<index.indexOf('js/skill-codex.js?v=016dev-r3'),'All rare definitions must register before Codex loads');
assert(index.includes('Auto Battle Roguelite V0.16 DEV'),'Visible HTML must identify the active V0.16 development build');
assert(core.includes('const GAME_VERSION="V0.16 DEV";'),'Runtime version must identify V0.16 DEV');

const codexSource=fs.readFileSync('js/skill-codex.js','utf8');
assert(codexSource.includes('Object.entries(skills)'),'Codex base entries must be generated from the live skills registry');

console.log('V0.16 base80 + public script-order integration smoke test passed');
