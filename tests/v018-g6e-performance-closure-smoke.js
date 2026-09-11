const fs=require('fs');
const path=require('path');
const assert=require('assert');

const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
const exists=file=>fs.existsSync(path.join(root,file));

for(const file of [
  'js/duel-visual-quality.js','js/duel-visual-assets.js','js/duel-vfx-budget.js',
  'js/duel-camera.js','js/duel-renderer.js','js/duel-renderer-v2.js',
  'tests/v018-g6a-quality-policy-smoke.js','tests/v018-g6b-asset-cache-smoke.js',
  'tests/v018-g6c-vfx-budget-smoke.js','tests/v018-g6d-fallback-contract-smoke.js',
  'tests/v018-g6d-fallback-browser-driver.html','tests/v018-g6e-performance-browser-driver.html',
  '.github/workflows/v018-g6d-fallback-validation.yml','.github/workflows/v018-g6e-performance-validation.yml'
])assert.ok(exists(file),`G6 closure dependency missing: ${file}`);

const quality=read('js/duel-visual-quality.js');
const camera=read('js/duel-camera.js');
const renderer=read('js/duel-renderer.js');
const rendererV2=read('js/duel-renderer-v2.js');
const budget=read('js/duel-vfx-budget.js');
const browser=read('tests/v018-g6e-performance-browser-driver.html');

assert.match(renderer,/refreshDuelVisualQuality\(\{width,height\}\)/,'renderer resize must refresh visual quality from rendered dimensions');
assert.match(renderer,/quality\?\.dprCap/,'renderer resize must apply quality DPR cap');
assert.match(renderer,/duel-camera\.js\?v=018-g6e/,'G6E camera cache key missing');
assert.match(renderer,/duel-renderer-v2\.js\?v=018-g6e/,'G6E Renderer V2 cache key missing');
assert.match(camera,/getDuelVisualQuality/,'camera must consume visual quality policy');
assert.match(camera,/shakeMultiplier/,'camera shake quality multiplier missing');
assert.match(camera,/zoomKickMultiplier/,'camera zoom quality multiplier missing');
assert.match(quality,/reducedMotion\?0:base\.shakeMultiplier/,'reduced-motion shake policy missing');
assert.match(quality,/reducedMotion\?0:base\.zoomKickMultiplier/,'reduced-motion zoom policy missing');
assert.match(budget,/droppedPresentation/,'transient presentation budget observability missing');
assert.match(budget,/trimOldest/,'transient presentation cap missing');
assert.match(rendererV2,/ctx\.ellipse\(x,y-3\*s,40\*s,10\*s,0,0,Math\.PI\*2\)/,'Renderer V2 side identity ellipse regression returned');
assert.match(rendererV2,/fallback\.render/,'V2 must retain live vector fallback rendering');
assert.match(browser,/coveredStates\.length===13/,'G6E browser closure must validate all 13 production states');
assert.match(browser,/cache\.pendingImages===0&&cache\.pendingManifests===0/,'G6E browser closure must validate settled production assets');
assert.match(browser,/runToMatchEnd/,'G6E browser closure must finish a V2 match');
assert.match(browser,/presentation consumers mutated semantic event input/,'G6E browser closure must protect semantic event immutability');
assert.match(browser,/reduced-motion camera still accumulated shake\/zoom/,'G6E browser closure must validate reduced motion');

for(const source of [quality,budget])for(const forbidden of [
  'updateDuelRound','duelDealDamage','settleDuelRound','resolveDuelTournamentStage',
  'getDuelChoices','getDuelRewardChoices','baseDamage','critChance'
])assert.ok(!source.includes(forbidden),`presentation policy must not own gameplay truth: ${forbidden}`);

console.log('V0.18 G6E performance/fallback closure smoke: PASS');
