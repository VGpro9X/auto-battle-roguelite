const fs=require("fs"),vm=require("vm"),assert=require("assert");
const read=p=>fs.readFileSync(p,"utf8");
const html=read("index.html");
const bridge=read("js/duel-renderer-v3-bridge.js");
const rendererV3=read("js/renderer-v3.js");
const tier=read("js/duel-vfx-tier.js");
const survival=read("js/v020-survival-divine-vfx.js");
const bootstrap=read("js/duel-renderer.js");
const enemyPresentation=read("js/v020-enemy-presentation.js");

assert(html.includes("DUEL_RENDERER_V3_QUALITY='auto'"),"public V3 quality must default to auto");
assert(html.includes("js/duel-renderer-v3-bridge.js?v=020-b13a"),"B13A bridge cache key missing");
assert(bootstrap.includes("js/duel-vfx-tier.js?v=020-b13a"),"B13A Duel tier cache key missing");
assert(enemyPresentation.includes("js/v020-survival-divine-vfx.js?v=020-b13a"),"B13A Survival spectacle cache key missing");

function bridgeQuality({legacyId="full",configured="auto",search=""}={}){
  const root={
    DUEL_RENDERER_V3_DEFAULT:true,
    DUEL_RENDERER_V3_QUALITY:configured,
    getDuelVisualQuality:()=>({id:legacyId,reducedMotion:false}),
    createDuelRendererV2:()=>({preload:Promise.resolve(),render(){},consume(){},getAnchor(){return{x:0,y:0}},getStatus(){return{mode:"v2"}}})
  };
  const context={globalThis:root,URLSearchParams,location:{search}};
  root.globalThis=root;
  vm.createContext(context);
  vm.runInContext(rendererV3,context,{filename:"renderer-v3.js"});
  vm.runInContext(bridge,context,{filename:"duel-renderer-v3-bridge.js"});
  const canvas={dataset:{},getContext:()=>({})};
  const instance=root.createConfiguredDuelRendererV3(canvas);
  return instance.getStatus().lighting.quality;
}
assert.strictEqual(bridgeQuality({legacyId:"full"}),"balanced","desktop auto quality must preserve balanced V3 default");
assert.strictEqual(bridgeQuality({legacyId:"constrained"}),"low","constrained/mobile auto quality must drop V3 to low");
assert.strictEqual(bridgeQuality({legacyId:"constrained",configured:"balanced"}),"balanced","explicit configured balanced must override auto");
assert.strictEqual(bridgeQuality({legacyId:"constrained",search:"?visualQuality=full"}),"full","explicit visualQuality query must override auto");

function tierQuality(legacyId,configured="auto",options={}){
  const root={DUEL_RENDERER_V3_QUALITY:configured,getDuelVisualQuality:()=>({id:legacyId,reducedMotion:false})};
  const context={globalThis:root,URLSearchParams};root.globalThis=root;
  vm.createContext(context);vm.runInContext(tier,context,{filename:"duel-vfx-tier.js"});
  return root.createDuelVfxTierOverlay(options).getStatus().quality;
}
assert.strictEqual(tierQuality("full"),"balanced","Duel tier desktop auto quality mismatch");
assert.strictEqual(tierQuality("constrained"),"low","Duel tier constrained auto quality mismatch");
assert.strictEqual(tierQuality("constrained","auto",{quality:"full"}),"full","Duel tier explicit quality override lost");

function survivalQuality(legacyId,search=""){
  const handlers={};
  const root={
    state:{t:0},player:{x:0,y:0},ctx:{},
    location:{search},URLSearchParams,
    DUEL_RENDERER_V3_QUALITY:"auto",
    getDuelVisualQuality:()=>({id:legacyId,reducedMotion:false}),
    matchMedia:()=>({matches:false}),
    draw(){},onSkillEvent(name,fn){(handlers[name]||(handlers[name]=[])).push(fn);}
  };
  root.window=root;root.globalThis=root;
  vm.createContext(root);vm.runInContext(survival,root,{filename:"v020-survival-divine-vfx.js"});
  return root.getSurvivalHighTierVfxStatusV020().quality;
}
assert.strictEqual(survivalQuality("full"),"balanced","Survival desktop auto quality mismatch");
assert.strictEqual(survivalQuality("constrained"),"low","Survival constrained auto quality mismatch");
assert.strictEqual(survivalQuality("constrained","?visualQuality=full"),"full","Survival explicit visual quality override lost");

for(const source of [bridge,tier,survival])for(const forbidden of [
  "updateDuelRound","duelDealDamage","settleDuelRound","player.hp=","enemy.hp=","attackCooldown","baseDamage"
])assert(!source.includes(forbidden),"B13A presentation quality must not own gameplay truth: "+forbidden);

console.log("v020-b13a-auto-quality-smoke: ok · desktop balanced · constrained low · explicit override preserved");