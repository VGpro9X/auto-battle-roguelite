const fs=require('fs');
function assert(v,m){if(!v)throw new Error(m);}
const base=JSON.parse(fs.readFileSync('assets/v020/fighters/ash-wanderer/manifest.json','utf8'));
const extra=JSON.parse(fs.readFileSync('assets/v020/fighters/ash-wanderer/b3-final-states.json','utf8'));
const states=Object.assign({},base.states||{},extra.states||{});
const required=base.requiredStates;
assert(required.length===13,'expected 13 required fighter states');
for(const state of required){
  const entry=states[state];
  assert(entry&&entry.status==='production',state+' is not production');
  assert(fs.existsSync(entry.src),state+' runtime asset missing: '+entry.src);
  assert(entry.frameCount>0&&entry.columns>0&&entry.fps>0,state+' timing metadata invalid');
  assert(Array.isArray(entry.anchors)&&entry.anchors.length===entry.frameCount,state+' anchor frame count mismatch');
  for(const [i,frame] of entry.anchors.entries())for(const name of base.requiredAnchors)assert(frame[name]&&Number.isFinite(frame[name].x)&&Number.isFinite(frame[name].y),`${state} frame ${i} invalid ${name}`);
  const svg=fs.readFileSync(entry.src,'utf8');
  assert(!/<text\b/i.test(svg),state+' contains poster/UI text');
  assert(svg.includes('height="256"'),state+' sheet height changed');
}
const v2=fs.readFileSync('js/duel-renderer-v2.js','utf8');
const bridge=fs.readFileSync('js/duel-renderer-v3-bridge.js','utf8');
const v3=fs.readFileSync('js/renderer-v3.js','utf8');
assert(v2.includes('options.skipFighterSides'),'V2 fighter suppression hook missing');
assert(bridge.includes('skipFighterSides:v3Sides'),'V3 bridge does not suppress replaced V2 fighters');
assert(v3.includes('b3-final-states.json'),'Renderer V3 supplemental state merge missing');
assert(v3.includes('Object.assign({}, fighter.states || {}, extra.states)'),'supplemental states are not merged');
console.log('v020-b3-full-state-runtime-smoke: ok');