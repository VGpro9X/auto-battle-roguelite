const fs=require('fs');
function assert(v,m){if(!v)throw new Error(m);}
const v2=fs.readFileSync('js/duel-renderer-v2.js','utf8');
const bridge=fs.readFileSync('js/duel-renderer-v3-bridge.js','utf8');
const manifest=JSON.parse(fs.readFileSync('assets/v020/fighters/ash-wanderer/manifest.json','utf8'));
const idle=fs.readFileSync('assets/v020/fighters/ash-wanderer/idle.svg','utf8');

assert(v2.includes('function render(match,dt=0,options={})'),'Renderer V2 partial-render hook missing');
assert(v2.includes('options.skipFighterSides'),'Renderer V2 does not accept external fighter skip list');
assert(v2.includes('function getLastTransform()'),'Renderer V2 does not expose final camera transform');
assert(bridge.includes('fallback.render(match,dt,{skipFighterSides:v3Sides})'),'V3 bridge does not suppress replaced V2 fighters');
assert(bridge.includes("fallback.getLastTransform"),'V3 bridge is not sharing V2/camera transform');
assert(bridge.includes("canvas.dataset.duelRenderer=activeStates.length?'v3-partial':'v3-foundation'"),'partial V3 runtime status missing');
assert(manifest.status==='partial-production','fighter manifest must remain partial-production');
assert(manifest.states.idle&&manifest.states.idle.status==='production','idle production state missing');
assert(manifest.states.idle.frameCount===6&&manifest.states.idle.columns===6,'idle frame contract changed');
assert(manifest.states.idle.anchors.length===6,'idle anchor frames missing');
assert(/^<svg[\s\S]*width="1536"[\s\S]*height="256"/.test(idle),'idle runtime sheet is not 1536x256 SVG');
assert(!/<text\b/i.test(idle),'idle runtime asset must not contain poster/UI text');
console.log('v020-b3-partial-replacement-smoke: ok');