const fs=require('fs'),vm=require('vm');
function assert(v,m){if(!v)throw new Error(m);}
const html=fs.readFileSync('index.html','utf8');
const ui=fs.readFileSync('js/duel-ui-v020.js','utf8');
const shim=fs.readFileSync('js/duel-ui.js','utf8');
const renderer=fs.readFileSync('js/renderer-v3.js','utf8');
const bridge=fs.readFileSync('js/duel-renderer-v3-bridge.js','utf8');
const rootManifest=JSON.parse(fs.readFileSync('assets/v020/manifest.json','utf8'));
const fighter=JSON.parse(fs.readFileSync('assets/v020/fighters/ash-wanderer/manifest.json','utf8'));
const arena=JSON.parse(fs.readFileSync('assets/v020/arenas/ashen-sanctum/manifest.json','utf8'));

assert(html.includes('window.DUEL_RENDERER_V3_DEFAULT=true')||html.includes('window.DUEL_RENDERER_V3_DEFAULT = true'),'V3 default flag not wired');
assert(/js\/renderer-v3\.js\?v=020-[^'\"]+/.test(html),'renderer-v3 bootstrap missing');
assert(/js\/duel-renderer-v3-bridge\.js\?v=020-[^'\"]+/.test(html),'V3 bridge bootstrap missing');
assert(html.includes('window.createDuelRenderer=window.createConfiguredDuelRendererV3'),'Duel renderer factory is not promoted after bootstrap');
assert(html.includes('js/duel-ui.js?v=020-ui-fix'),'legacy Duel UI entrypoint not wired');
assert(shim.includes('js/duel-ui-v020.js?v=020-ui-fix'),'legacy Duel UI entrypoint does not delegate to syntax-clean implementation');
assert(ui.includes('await root.__V020_RENDERER_V3_BOOTSTRAP__'),'Duel match does not await V3 bootstrap');
assert(rootManifest.fallbackRenderer==='v2'&&rootManifest.fallback.allowPartial===true,'root fallback policy changed');
assert(fighter.fallback==='v2'&&arena.fallback==='v2','manifest fallback changed');

const context={globalThis:{DUEL_RENDERER_V3_DEFAULT:true,createDuelRendererV2:()=>({preload:Promise.resolve(),render(){},consume(){},getStatus(){return{mode:'v2'};}})},URLSearchParams};
context.globalThis.globalThis=context.globalThis;
vm.createContext(context);vm.runInContext(renderer,context);vm.runInContext(bridge,context);
const configured=context.globalThis.createConfiguredDuelRendererV3({dataset:{},getContext:()=>({})});
assert(configured&&configured.fallback,'V2 fallback missing from configured V3 bridge');
assert(configured.getStatus().mode==='v2','unready V3 assets must remain on V2 render path');
console.log('v020-b1-runtime-wiring-smoke: ok');