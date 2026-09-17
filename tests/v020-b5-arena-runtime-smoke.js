const fs=require('fs');
function assert(v,m){if(!v)throw new Error(m);}
const manifest=JSON.parse(fs.readFileSync('assets/v020/arenas/ashen-sanctum/manifest.json','utf8'));
const renderer=fs.readFileSync('js/renderer-v3.js','utf8');
const bridge=fs.readFileSync('js/duel-renderer-v3-bridge.js','utf8');
const v2=fs.readFileSync('js/duel-renderer-v2.js','utf8');
const required=['sky','far','mid','ambient','floor','foreground'];
assert(manifest.status==='production','arena manifest must be production');
assert(manifest.logicalWidth===1000&&manifest.logicalHeight===560,'logical size changed');
assert(manifest.floorY===475&&manifest.leftBound===54&&manifest.rightBound===946,'gameplay geometry changed');
assert(manifest.layers.length===6,'arena must have exactly six production layers');
assert(JSON.stringify(manifest.requiredLayers)===JSON.stringify(required),'required layer order changed');
for(const id of required){
 const layer=manifest.layers.find(x=>x.id===id);assert(layer,`missing ${id}`);assert(layer.status==='production',`${id} not production`);assert(layer.src&&fs.existsSync(layer.src),`${id} asset missing`);assert(Number.isFinite(layer.parallax),`${id} parallax missing`);assert(layer.width===1000&&layer.height===560,`${id} dimensions changed`);assert(typeof layer.foreground==='boolean',`${id} foreground flag missing`);
 const svg=fs.readFileSync(layer.src,'utf8');assert(svg.includes('width="1000"')&&svg.includes('height="560"'),`${id} svg dimensions invalid`);assert(!/<text\b/i.test(svg),`${id} must not contain poster text`);
}
assert(manifest.layers.find(x=>x.id==='foreground').foreground===true,'foreground layer flag invalid');
for(const id of required.filter(x=>x!=='foreground'))assert(manifest.layers.find(x=>x.id===id).foreground===false,`${id} incorrectly foreground`);
assert(renderer.includes('function validateArenaLayerEntry'),'arena layer production validator missing');
assert(renderer.includes('function resolveArena()'),'complete arena resolver missing');
assert(renderer.includes("renderer:'v2'")&&renderer.includes("reason:'arena incomplete'"),'all-or-nothing arena fallback missing');
assert(bridge.includes('async function preloadProductionArena'),'V3 arena preload missing');
assert(bridge.includes('function drawV3Arena'),'V3 arena draw path missing');
assert(bridge.includes('skipArena:true'),'V3 bridge does not suppress V2 arena');
assert(bridge.includes('drawV3Arena(match,tr,false)')&&bridge.includes('drawV3Arena(match,tr,true)'),'background/foreground ordering missing');
assert(v2.includes('!options.skipArena&&drawArenaLayers'),'V2 external arena suppression missing');
assert(v2.includes('if(!options.preserveCanvas)ctx.clearRect'),'V2 preserveCanvas contract missing');
assert(v2.includes('options.transformOverride||prepareFrameTransform'),'shared transform contract missing');
console.log('v020-b5-arena-runtime-smoke: ok');