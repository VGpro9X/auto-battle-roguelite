const fs=require('fs');
const assert=require('assert');

const base=fs.readFileSync('js/synergies.js','utf8').split('const EVOLUTIONS=')[0];
const b1=fs.readFileSync('js/v016-synergies-b1.js','utf8');
const b2=fs.readFileSync('js/v016-synergies-b2.js','utf8');
const index=fs.readFileSync('index.html','utf8');

const ids=[...base.matchAll(/id:"([A-Za-z][A-Za-z0-9_]*)"/g)].map(m=>m[1]);
for(const source of [b1,b2])for(const match of source.matchAll(/id:"([A-Za-z][A-Za-z0-9_]*)"/g))ids.push(match[1]);

const expectedNew=[
  'afterimageEcho','gravityRune','bloodSymbiosis','nourishingPearls',
  'thunderStride','sealedSoul','heavenfallBurn','guardianRetaliation'
];
const unique=[...new Set(ids)];
assert.strictEqual(unique.length,28,`Combined Hợp Đạo registry must contain exactly 28 unique entries, found ${unique.length}`);
for(const id of expectedNew)assert(unique.includes(id),`Missing V0.16 Hợp Đạo ${id}`);

const a4='js/v016-skills-a4.js?v=016dev-base80-r1';
const b1Tag='js/v016-synergies-b1.js?v=016dev-syn28-r1';
const b2Tag='js/v016-synergies-b2.js?v=016dev-syn28-r1';
const codex='js/skill-codex.js?v=016dev-syn28-r1';
assert(index.includes(b1Tag),'Public build must load B1 with the current cache key');
assert(index.includes(b2Tag),'Public build must load B2 with the current cache key');
assert(index.includes(codex),'Codex must use the Hợp Đạo-28 cache key');
assert(index.indexOf(a4)<index.indexOf(b1Tag),'B1 must load after all 80 base skills are registered');
assert(index.indexOf(b1Tag)<index.indexOf(b2Tag),'B1 must load before B2');
assert(index.indexOf(b2Tag)<index.indexOf(codex),'All 8 new Hợp Đạo must register before Codex');

console.log('V0.16 synergy28 integration: PASS');
