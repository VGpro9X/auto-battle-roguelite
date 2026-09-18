const fs=require('fs');
function assert(v,m){if(!v)throw new Error(m);}
const v2=fs.readFileSync('js/duel-renderer-v2.js','utf8');
const bridge=fs.readFileSync('js/duel-renderer-v3-bridge.js','utf8');
const manifest=JSON.parse(fs.readFileSync('assets/v020/fighters/ash-wanderer/manifest.json','utf8'));
const assets={idle:'1536',walk:'2048',run:'2048',dash:'1536',melee:'2560',ranged:'2048',cast:'2560',block:'1280'};

assert(v2.includes('function render(match,dt=0,options={})'),'Renderer V2 partial-render hook missing');
assert(v2.includes('options.skipFighterSides'),'Renderer V2 does not accept external fighter skip list');
assert(v2.includes('function getLastTransform()'),'Renderer V2 does not expose final camera transform');
assert(/fallback\.render\(match,dt,\{skipFighterSides:v3Sides(?:,|\})/.test(bridge),'V3 bridge does not suppress replaced V2 fighters');
assert(bridge.includes('fallback.getLastTransform'),'V3 bridge is not sharing V2/camera transform');
assert(bridge.includes('stateClocks=new Map()'),'state-relative animation clock missing');
assert(bridge.includes('drawV3Attachments'),'V3 replacement drops shield/frost/orbit presentation');
assert(bridge.includes("canvas.dataset.duelRenderer=arenaActive||activeStates.length?'v3-partial':'v3-foundation'")||bridge.includes("canvas.dataset.duelRenderer=activeStates.length?'v3-partial':'v3-foundation'"),'partial V3 runtime status missing');
assert(manifest.status==='partial-production','fighter manifest must remain partial-production');

for(const [state,width] of Object.entries(assets)){
  const entry=manifest.states[state];
  assert(entry&&entry.status==='production',state+' production state missing');
  assert(entry.anchors.length===entry.frameCount,state+' anchor frame count mismatch');
  for(const [i,frame] of entry.anchors.entries())for(const name of manifest.requiredAnchors)assert(frame[name]&&Number.isFinite(frame[name].x)&&Number.isFinite(frame[name].y),`${state} frame ${i} invalid anchor ${name}`);
  const svg=fs.readFileSync(`assets/v020/fighters/ash-wanderer/${state}.svg`,'utf8');
  assert(new RegExp(`^<svg[\\s\\S]*width="${width}"[\\s\\S]*height="256"`).test(svg),state+' runtime sheet dimensions invalid');
  assert(!/<text\b/i.test(svg),state+' runtime asset must not contain poster/UI text');
}
assert(manifest.states.idle.frameCount===6&&manifest.states.walk.frameCount===8&&manifest.states.run.frameCount===8&&manifest.states.dash.frameCount===6,'locomotion frame contract changed');
assert(manifest.states.melee.frameCount===10&&manifest.states.ranged.frameCount===8&&manifest.states.cast.frameCount===10&&manifest.states.block.frameCount===5,'combat/cast frame contract changed');
assert(manifest.states.idle.loop&&manifest.states.walk.loop&&manifest.states.run.loop,'looping locomotion contract changed');
for(const state of ['dash','melee','ranged','cast','block'])assert(manifest.states[state].loop===false,state+' must remain non-looping');
console.log('v020-b3-partial-replacement-smoke: ok');