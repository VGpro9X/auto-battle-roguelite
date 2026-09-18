const fs=require('fs'),vm=require('vm');
function assert(v,m){if(!v)throw new Error(m);}
const v3=fs.readFileSync('js/renderer-v3.js','utf8');
const bridge=fs.readFileSync('js/duel-renderer-v3-bridge.js','utf8');
const canvas={dataset:{},getContext:()=>({})};
const context={globalThis:{DUEL_RENDERER_V3_DEFAULT:true,createDuelRendererV2:()=>({preload:Promise.resolve(),render(){},consume(){},getStatus(){return{mode:'v2'};}})},URLSearchParams};
context.globalThis.globalThis=context.globalThis;
vm.createContext(context);vm.runInContext(v3,context);vm.runInContext(bridge,context);
assert(typeof context.globalThis.createDuelRendererV3Bridge==='function','V3 bridge missing');
assert(context.globalThis.getDuelRendererV3Mode()==='v3','default feature policy failed');
const renderer=context.globalThis.createConfiguredDuelRendererV3(canvas);
assert(renderer&&renderer.v3,'V3 bridge metadata missing');
assert(renderer.fallback,'V2 fallback missing');
assert(typeof renderer.render==='function'&&typeof renderer.consume==='function','fallback renderer contract lost');
assert(renderer.getStatus().mode==='v2','foundation must render through V2 until production V3 art is available');
console.log('v020-b1-renderer-bridge-smoke: ok');
