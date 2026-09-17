const fs=require('fs');
function assert(v,m){if(!v)throw new Error(m);}
const manifest=JSON.parse(fs.readFileSync('assets/v020/fighters/ash-wanderer/manifest.json','utf8'));
const idle=manifest.states&&manifest.states.idle;
const svg=fs.readFileSync('assets/v020/fighters/ash-wanderer/idle.svg','utf8');
const bridge=fs.readFileSync('js/duel-renderer-v3-bridge.js','utf8');
assert(manifest.status==='partial-production','fighter must be partial-production during B3');
assert(idle&&idle.status==='production','idle state not promoted');
assert(idle.frameCount===6&&idle.columns===6&&idle.fps===6&&idle.loop===true,'idle timing contract changed');
assert(Array.isArray(idle.anchors)&&idle.anchors.length===6,'idle anchors must match six frames');
for(const frame of idle.anchors)for(const key of manifest.requiredAnchors)assert(frame[key]&&Number.isFinite(frame[key].x)&&Number.isFinite(frame[key].y),'missing anchor '+key);
assert(svg.includes('width="1536"')&&svg.includes('height="256"'),'idle SVG sheet dimensions invalid');
assert(!/<text\b/i.test(svg),'runtime sprite must not contain text');
assert(bridge.includes('v3-partial'),'V3 partial runtime mode missing');
assert(bridge.includes('drawV3Fighter'),'V3 fighter draw path missing');
assert(bridge.includes('fallback.render(match,dt)'),'V2 fallback render path missing');
console.log('v020-b3-idle-runtime-smoke: ok');
