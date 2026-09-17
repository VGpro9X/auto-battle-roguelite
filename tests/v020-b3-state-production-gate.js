const fs=require('fs'),vm=require('vm');
function assert(v,m){if(!v)throw new Error(m);}
const code=fs.readFileSync('js/renderer-v3.js','utf8');
const context={globalThis:{}};context.globalThis.globalThis=context.globalThis;vm.createContext(context);vm.runInContext(code,context);
const api=context.globalThis.AutoBattleRendererV3;
assert(api&&typeof api.validateFighterStateEntry==='function','state validator missing');
const point=(x,y)=>({x,y});
const anchorFrame={head:point(128,54),chest:point(128,96),leftHand:point(106,112),rightHand:point(151,108),feet:point(128,226),front:point(168,116),back:point(89,116),target:point(178,106)};
const production={status:'production',src:'idle.webp',frameCount:6,fps:8,loop:true,anchors:Array.from({length:6},()=>JSON.parse(JSON.stringify(anchorFrame)))};
assert(api.validateFighterStateEntry('idle',production).ok,'valid production state rejected');
assert(!api.validateFighterStateEntry('idle',{...production,status:'proof'}).ok,'proof state must not resolve as production');
assert(!api.validateFighterStateEntry('idle',{...production,anchors:production.anchors.slice(0,5)}).ok,'anchor count mismatch accepted');
const badAnchor=JSON.parse(JSON.stringify(production));delete badAnchor.anchors[2].rightHand;
assert(!api.validateFighterStateEntry('idle',badAnchor).ok,'missing required anchor accepted');
const fighter=JSON.parse(fs.readFileSync('assets/v020/fighters/ash-wanderer/manifest.json','utf8'));
assert(api.validateFighterManifest(fighter).ok,'current proof fighter manifest must remain valid');
console.log('v020-b3-state-production-gate: ok');
