const fs = require('fs');
const vm = require('vm');

const code = fs.readFileSync('js/renderer-v3.js', 'utf8');
const context = { globalThis: {} };
vm.createContext(context);
vm.runInContext(code, context);
const api = context.globalThis.AutoBattleRendererV3;

function assert(condition, message) { if (!condition) throw new Error(message); }

assert(api, 'Renderer V3 API missing');
assert(api.REQUIRED_STATES.length === 13, '13-state contract changed');
assert(api.REQUIRED_ANCHORS.length === 8, '8-anchor contract changed');
assert(api.REQUIRED_ARENA_LAYERS.length === 6, '6-layer arena contract changed');

const fighter = JSON.parse(fs.readFileSync('assets/v020/fighters/ash-wanderer/manifest.json', 'utf8'));
const arena = JSON.parse(fs.readFileSync('assets/v020/arenas/ashen-sanctum/manifest.json', 'utf8'));
assert(api.validateFighterManifest(fighter).ok, 'fighter proof manifest invalid');
assert(api.validateArenaManifest(arena).ok, 'arena proof manifest invalid');

const renderer = api.create({ enabled: true, quality: 'full' });
assert(renderer.snapshot().quality === 'full', 'quality normalization failed');
assert(renderer.setQuality('nonsense') === 'balanced', 'invalid quality must normalize to balanced');
const unresolved = renderer.resolveFighterState('melee');
assert(unresolved.renderer === 'v2', 'missing V3 production state must fall back to V2');
const missingLayer = renderer.resolveArenaLayer('sky');
assert(missingLayer.renderer === 'v2', 'missing V3 arena layer must fall back to V2');
console.log('renderer-v3-foundation: ok');
