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

const position=file=>index.indexOf(file);
assert(position('js/v016-synergies-b1.js?v=016dev-')>=0,'Public build must load B1 with a V0.16 cache key');
assert(position('js/v016-synergies-b2.js?v=016dev-')>=0,'Public build must load B2 with a V0.16 cache key');
assert(position('js/skill-codex.js?v=016dev-')>=0,'Codex must use a V0.16 development cache key');
assert(position('js/v016-skills-a4.js?v=016dev-base80-r1')<position('js/v016-synergies-b1.js?v=016dev-'),'B1 must load after all 80 base skills are registered');
assert(position('js/v016-synergies-b1.js?v=016dev-')<position('js/v016-synergies-b2.js?v=016dev-'),'B1 must load before B2');
assert(position('js/v016-synergies-b2.js?v=016dev-')<position('js/skill-codex.js?v=016dev-'),'All 8 new Hợp Đạo must register before Codex');

console.log('V0.16 synergy28 integration: PASS');
