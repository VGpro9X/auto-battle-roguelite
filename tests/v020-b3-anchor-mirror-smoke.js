const fs=require('fs'),vm=require('vm');
function assert(v,m){if(!v)throw new Error(m);}
const code=fs.readFileSync('js/renderer-v3.js','utf8');
const context={globalThis:{}};context.globalThis.globalThis=context.globalThis;vm.createContext(context);vm.runInContext(code,context);
const api=context.globalThis.AutoBattleRendererV3;
const frame={head:{x:128,y:50},chest:{x:130,y:94},leftHand:{x:104,y:111},rightHand:{x:153,y:107},feet:{x:128,y:226},front:{x:174,y:118},back:{x:86,y:118},target:{x:188,y:106}};
assert(api.validateAnchorFrame(frame,256,256).ok,'valid anchor frame rejected');
const mirrored=api.mirrorAnchorFrame(frame,256);
for(const key of api.REQUIRED_ANCHORS){assert(mirrored[key].x===256-frame[key].x,key+' mirror x mismatch');assert(mirrored[key].y===frame[key].y,key+' mirror y mismatch');}
assert(mirrored.front.x<mirrored.back.x,'front/back facing relation not mirrored');
assert(mirrored.target.x<mirrored.feet.x,'target must move to mirrored forward side');
const bad=JSON.parse(JSON.stringify(frame));bad.target.x=300;
assert(!api.validateAnchorFrame(bad,256,256).ok,'out-of-bounds anchor accepted');
console.log('v020-b3-anchor-mirror-smoke: ok');
