const fs=require('fs');
const assert=require('assert');

const synergySource=fs.readFileSync('js/synergies.js','utf8');
const evolutionBlock=synergySource.split('const EVOLUTIONS={')[1].split('\n};')[0];
const c1=fs.readFileSync('js/v016-evolutions-c1.js','utf8');
const index=fs.readFileSync('index.html','utf8');

const original=[...evolutionBlock.matchAll(/id:"([A-Za-z][A-Za-z0-9_]*)"/g)].map(m=>m[1]);
const added=[...c1.matchAll(/id:"([A-Za-z][A-Za-z0-9_]*)"/g)].map(m=>m[1]);
const expected=['phantomLegion','heavenNet','bloodWeb','starfallCataclysm'];
assert.strictEqual(original.length,8,`Expected 8 original Siêu Cấp, found ${original.length}`);
assert.deepStrictEqual([...new Set(added)].sort(),expected.slice().sort(),'C1 must define exactly the four locked new Siêu Cấp');
assert.strictEqual(new Set([...original,...added]).size,12,'Combined Siêu Cấp registry must contain exactly 12 unique entries');

const position=file=>index.indexOf(file);
assert(position('js/v016-evolutions-c1.js?v=016dev-evol12-r1')>=0,'Public build must load C1 with the evol12 cache key');
assert(position('js/v016-evolutions-c1-compat.js?v=016dev-evol12-r1')>=0,'Public build must load the C1 compatibility bridge');
assert(position('js/v016-synergies-b2.js?v=016dev-')<position('js/v016-evolutions-c1.js?v=016dev-evol12-r1'),'C1 must load after all V0.16 Hợp Đạo modules');
assert(position('js/v016-evolutions-c1.js?v=016dev-evol12-r1')<position('js/v016-evolutions-c1-compat.js?v=016dev-evol12-r1'),'C1 core must load before its compatibility bridge');
assert(position('js/v016-evolutions-c1-compat.js?v=016dev-evol12-r1')<position('js/v016-run-systems.js?v=016dev-'),'All new Siêu Cấp must register before run-system icon normalization');
assert(position('js/v016-evolutions-c1-compat.js?v=016dev-evol12-r1')<position('js/skill-codex.js?v=016dev-evol12-r1'),'All new Siêu Cấp must register before Codex');

console.log('V0.16 evolution12 integration: PASS');
