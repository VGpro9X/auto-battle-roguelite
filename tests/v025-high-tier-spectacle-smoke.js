// V0.25 high-tier signature + live event test. No gameplay or rare-rule modifications.
const fs=require("fs"),vm=require("vm"),assert=require("assert"),read=p=>fs.readFileSync(p,"utf8");
const code=read("js/v025-high-tier-spectacle.js"),html=read("index.html"),pages=read(".github/workflows/pages.yml");
const divineIds=["bribery","immortalBreath","heavenlyPunishment","fateExchange","heavenlyMandate","divineJudgment","spatialSwap","equalPrice","heavenlyWard","divineDomain","lifeRewind","causalInversion","divineGift","timeStop","celestialEdict","heavenSeal","bloodDebt","parasitePact","voidReality","scapegoatFate"];
const evoIds=["heavenfire","stormNetwork","swordDomain","plagueTide","crimsonMoon","singularity","chaosCrown","immortalAegis","phantomLegion","heavenNet","bloodWeb","starfallCataclysm"];
const synIds=["thermalShock","bloodConductor","arcCollector","explosiveBlades","toxicFlame","stormVolley","soulFurnace","timeLoop","frozenExecution","crimsonFortress","plagueLightning","combustionChain","echoBarrage","glassBlood","gravityNova","markedBounty","elementalChaos","soulAegis","criticalStorm","lastBreath","afterimageEcho","gravityRune","bloodSymbiosis","nourishingPearls","thunderStride","sealedSoul","heavenfallBurn","guardianRetaliation"];
const divRegistry=Object.fromEntries(divineIds.map((id,i)=>[id,{id,tier:i===0||i===3||i===6||i===7||i===10||i===11||i>=16?"mystic":"divine",name:id}]));
const evoRegistry=Object.fromEntries(evoIds.map(id=>[id,{id,name:id}]));
const synRegistry=Object.fromEntries(synIds.map(id=>[id,{id,name:id}]));
const types={divine:10,mystic:10,evolution:12,synergy:28};
const actual=[];for(const id of [...divineIds,...evoIds,...synIds])actual.push(id);
assert.strictEqual(new Set(actual).size,60,"catalogue ID collisions");
// Verify the V0.25 list corresponds exactly to the production registries (not invented IDs).
const divineSources=["js/divine-skills.js","js/v016-run-systems.js","js/v016-rares-r3.js","js/v016-rares-r4.js"].map(read).join("\n");
const productionRare=[...divineSources.matchAll(/DIVINE_SKILLS\.([A-Za-z]\w*)\s*=\s*\{[\s\S]{0,80}?\bid:"([A-Za-z]\w*)",tier:"(divine|mystic)"/g)].map(x=>x[1]);
const baseRare=[...read("js/divine-skills.js").matchAll(/\bid:"([A-Za-z]\w*)",tier:"(divine|mystic)"/g)].map(x=>x[1]);
assert.deepStrictEqual([...new Set([...productionRare,...baseRare])].sort(),divineIds.slice().sort(),"rare registry mismatch");
const baseSyn=read("js/synergies.js");
const prodSynergies=[...baseSyn.slice(baseSyn.indexOf("const SYNERGIES"),baseSyn.indexOf("const EVOLUTIONS")).matchAll(/\bid:"([A-Za-z]\w*)"/g)].map(x=>x[1]);
const prodEvo=[...baseSyn.slice(baseSyn.indexOf("const EVOLUTIONS"),baseSyn.indexOf("function setupSynergyHooks")).matchAll(/\bid:"([A-Za-z]\w*)"/g)].map(x=>x[1]);
for(const f of ["js/v016-synergies-b1.js","js/v016-synergies-b2.js"]){const c=read(f);prodSynergies.push(...[...c.slice(0,c.indexOf("const runtime")).matchAll(/\bid:"([A-Za-z]\w*)"/g)].map(x=>x[1]));}
{const c=read("js/v016-evolutions-c1.js");prodEvo.push(...[...c.slice(0,c.indexOf("const runtime")).matchAll(/\bid:"([A-Za-z]\w*)"/g)].map(x=>x[1]));}
assert.deepStrictEqual(prodSynergies.sort(),synIds.slice().sort(),"Hợp Đạo registry mismatch");
assert.deepStrictEqual(prodEvo.sort(),evoIds.slice().sort(),"Siêu Cấp registry mismatch");
let strokes=0,paint=0,draws=0,resetCalls=0;
const g={save(){},restore(){},translate(){},beginPath(){},arc(){},moveTo(){},lineTo(){},closePath(){},stroke(){strokes++},fill(){paint++},fillText(){paint++},rotate(){},setLineDash(){}};
const handlers={},scope={Math,Number,URLSearchParams,Object,Array,Set,Map,WeakMap,ctx:g,W:1280,H:720,DIVINE_SKILLS:divRegistry,EVOLUTIONS:evoRegistry,SYNERGIES:synRegistry,
  state:{t:1,running:true,paused:false,gameOver:false,mode:{id:"5"}},player:{x:120,y:110,r:16},navigator:{deviceMemory:8},location:{search:"?visualQuality=full"},
  matchMedia(){return{matches:false}},getOwnedDivineSkillIds(){return["heavenlyPunishment","voidReality"];},
  hasSynergy(id){return id==="thermalShock";},hasEvolution(id){return id==="heavenfire";},
  onSkillEvent(name,fn){(handlers[name]||(handlers[name]=[])).push(fn);},
  draw(){draws++},resetSkillEngine(){resetCalls++}
};scope.window=scope;
vm.runInNewContext(code,scope,{filename:"js/v025-high-tier-spectacle.js"});
assert.strictEqual(typeof scope.getV025HighTierSignature,"function");
const status=()=>scope.getV025HighTierSpectacleStatus();
assert.strictEqual(status().total,60);
for(const [tier,count] of Object.entries(types))assert.strictEqual(status()[tier==="evolution"?"evolutions":tier==="synergy"?"synergies":tier],count);
for(const id of actual)assert(scope.getV025HighTierSignature(id),"missing "+id);
assert.strictEqual(scope.getV025HighTierSignature("bribery").tier,"mystic");
assert.strictEqual(scope.getV025HighTierSignature("heavenlyPunishment").tier,"divine");
assert.notStrictEqual(scope.getV025HighTierSignature("heavenlyPunishment").motif,scope.getV025HighTierSignature("voidReality").motif);
const dispatch=(kind,payload)=>{assert(handlers[kind]?.length,kind+" not registered");handlers[kind].forEach(h=>h(payload));};
dispatch("divine_acquired",{id:"heavenlyPunishment",item:divRegistry.heavenlyPunishment});
dispatch("divine_trigger",{id:"heavenlyPunishment",targets:[{enemy:{x:210,y:160,r:12}}]});
dispatch("divine_acquired",{id:"voidReality",item:divRegistry.voidReality});
dispatch("build_unlock",{kind:"evolution",item:evoRegistry.heavenfire});
dispatch("build_unlock",{kind:"synergy",item:synRegistry.thermalShock});
dispatch("periodic",{skillKey:"fire",level:3});
dispatch("hit",{enemy:{x:250,y:180,r:12},damage:50,meta:{source:"thermalShock",tags:["FIRE","ICE"]}});
const before=status();assert(before.active<=11&&before.emitted>=6,"event choreography inactive");
scope.draw();const after=status();assert(after.rendered>0&&strokes>25&&draws===1,"high-tier shapes not rendered");
assert(Object.keys(after.drawnIds).length>=4,"distinct high-tier IDs not drawn");
scope.state.t+=.23;dispatch("divine_trigger",{id:"spatialSwap",from:{x:120,y:110},to:{x:320,y:220}});
scope.draw();assert(status().emitted>before.emitted,"spatial transition not rendered");
scope.location.search="?visualQuality=low";scope.state.t+=.5;for(let i=0;i<30;i++){dispatch("build_unlock",{kind:"synergy",item:synRegistry[synIds[i%synIds.length]]});scope.state.t+=.015;}
const low=status();assert(low.limit===4&&low.active<=4&&low.dropped>0,"mobile transient cap");
const rendered=low.rendered;scope.draw();assert(status().rendered-rendered<=2,"mobile frame budget exceeded");
scope.matchMedia=()=>({matches:true});scope.draw();assert(status().reducedMotion===true,"reduced-motion support missing");
const emissions=status().emitted;dispatch("hit",{enemy:{x:200,y:200},damage:1,meta:{source:"thermalShock",tags:["DOT"]}});
assert.strictEqual(status().emitted,emissions,"DOT shouldn't spawn an expensive spectacle");
scope.resetSkillEngine();assert.strictEqual(status().active,0);assert.strictEqual(resetCalls,1);
scope.state.running=false;dispatch("divine_trigger",{id:"heavenlyPunishment"});assert.strictEqual(status().active,0,"menu must not emit V0.25 bursts");
assert(!/Math\.random\s*\(/.test(code),"V0.25 must not consume gameplay RNG");
assert(!/\b(?:player|state)\.[A-Za-z]*?(?:hp|speed|damage|cooldown|xp|kills)\s*[-+*/]?=/.test(code),"visual code must not write gameplay truth");
assert(html.includes("js/v025-high-tier-spectacle.js?v=025-release-r1"),"V0.25 runtime not wired");
assert(html.indexOf("js/v025-high-tier-spectacle.js")>html.indexOf("js/v024-skill-identity-fx.js"),"high-tier layer must load after V0.24");
assert(pages.includes("V0.25 high-tier Survival spectacle gate"),"Pages validation missing");
console.log("v025-high-tier-spectacle-smoke: PASS · 20 rare + 12 evolutions + 28 synergies · event truth · tier shapes · mobile budget · reduced motion · clean reset");
