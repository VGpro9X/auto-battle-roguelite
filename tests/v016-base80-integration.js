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

const position=file=>index.indexOf(file);
assert(position('js/skill-codex.js?v=016dev-')>=0,'Codex script must use a V0.16 cache key');
assert(position('js/v016-skills-a4.js?v=016dev-base80-r1')<position('js/skill-codex.js?v=016dev-'),'All V0.16 base skills must register before the Codex script loads');
assert(position('js/v016-run-systems.js?v=016dev-')<position('js/v016-rares-r3.js?v=016dev-'),'Run systems must load before rare R3');
assert(position('js/v016-rares-r3.js?v=016dev-')<position('js/v016-rares-r4.js?v=016dev-'),'Rare R3 must load before rare R4');
assert(position('js/v016-rares-r4.js?v=016dev-')<position('js/skill-codex.js?v=016dev-'),'All rare definitions must register before Codex loads');

// This gate protects the released V0.16 content baseline even while a later DEV shell is active.
// The shell version is owned by core.js; HTML must visibly agree with it and cache-bust core.
const versionMatch=core.match(/const GAME_VERSION="([^"]+)";/);
assert(versionMatch,'Runtime core must declare GAME_VERSION');
const runtimeVersion=versionMatch[1];
assert(index.includes(`Auto Battle Roguelite ${runtimeVersion}`),'Visible HTML must match the runtime GAME_VERSION');
assert(/js\/core\.js\?v=[^"']+/.test(index),'Public HTML must cache-bust the runtime core script');

const codexSource=fs.readFileSync('js/skill-codex.js','utf8');
assert(codexSource.includes('Object.entries(skills)'),'Codex base entries must be generated from the live skills registry');

console.log('V0.16 base80 + public script-order integration smoke test passed');