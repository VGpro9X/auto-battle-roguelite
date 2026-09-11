const fs=require("fs");
const path=require("path");
const vm=require("vm");
const assert=require("assert");

const root=path.resolve(__dirname,"..");
const budgetSource=fs.readFileSync(path.join(root,"js/duel-vfx-budget.js"),"utf8");
const bootstrap=fs.readFileSync(path.join(root,"js/duel-renderer.js"),"utf8");
const rendererV2=fs.readFileSync(path.join(root,"js/duel-renderer-v2.js"),"utf8");

function makeFactory(kind){
  return()=>{
    const effects=[];
    return{
      effects,
      consume(events){for(const event of events||[])effects.push({...event,kind});},
      update(){},render(){},
      getStatus(){return{active:effects.length,kind};}
    };
  };
}

const quality={id:"constrained",vfxTransientLimit:64,tierTransientLimit:32};
const sandbox={
  globalThis:null,
  getDuelVisualQuality:()=>quality,
  createDuelVfxV2:makeFactory("vfx"),
  createDuelVfxTierOverlay:makeFactory("tier")
};
sandbox.globalThis=sandbox;
vm.createContext(sandbox);
vm.runInContext(budgetSource,sandbox,{filename:"duel-vfx-budget.js"});

const install=sandbox.getDuelVfxBudgetInstallStatus();
assert.strictEqual(install.vfx,true,'base VFX factory should be wrapped');
assert.strictEqual(install.tier,true,'tier VFX factory should be wrapped');

const burst=Array.from({length:140},(_,index)=>({type:"hit",serial:index,payload:`event-${index}`}));
const snapshot=JSON.stringify(burst);
const vfx=sandbox.createDuelVfxV2();
vfx.consume(burst);
assert.strictEqual(JSON.stringify(burst),snapshot,'presentation budget must not mutate semantic event input');
assert.strictEqual(vfx.effects.length,64,'constrained base VFX budget must retain only the newest 64 presentation objects');
assert.strictEqual(vfx.effects[0].serial,76,'base VFX budget must prune oldest presentation objects first');
let status=vfx.getStatus();
assert.strictEqual(status.budget.profile,"constrained");
assert.strictEqual(status.budget.limit,64);
assert.strictEqual(status.budget.droppedPresentation,76);
assert.strictEqual(status.budget.peakActive,140);

const tier=sandbox.createDuelVfxTierOverlay();
tier.consume(burst);
assert.strictEqual(tier.effects.length,32,'constrained tier budget must retain only the newest 32 presentation objects');
assert.strictEqual(tier.effects[0].serial,108,'tier budget must prune oldest presentation objects first');
status=tier.getStatus();
assert.strictEqual(status.budget.limit,32);
assert.strictEqual(status.budget.droppedPresentation,108);

quality.id="full";quality.vfxTransientLimit=96;quality.tierTransientLimit=48;
const fullVfx=sandbox.createDuelVfxV2();
fullVfx.consume(burst);
assert.strictEqual(fullVfx.effects.length,96,'full profile must allow the larger base VFX budget');
const fullTier=sandbox.createDuelVfxTierOverlay();
fullTier.consume(burst);
assert.strictEqual(fullTier.effects.length,48,'full profile must allow the larger tier budget');

// Reinstall is idempotent and must not double-wrap factories.
const beforeFactory=sandbox.createDuelVfxV2;
const second=sandbox.installDuelVfxBudgets();
assert.strictEqual(second.vfx,false);
assert.strictEqual(second.tier,false);
assert.strictEqual(sandbox.createDuelVfxV2,beforeFactory);

const tierPos=bootstrap.indexOf("duel-vfx-tier.js");
const vfxPos=bootstrap.indexOf("duel-vfx-v2.js");
const budgetPos=bootstrap.indexOf("duel-vfx-budget.js?v=018-g6c");
const rendererPos=bootstrap.indexOf("duel-renderer-v2.js");
assert.ok(tierPos>=0&&vfxPos>=0&&budgetPos>=0&&rendererPos>=0,'G6C bootstrap modules missing');
assert.ok(tierPos<budgetPos&&vfxPos<budgetPos&&budgetPos<rendererPos,'budget wrapper must install after VFX factories and before Renderer V2 creates them');

// Renderer V2 must distribute the same semantic list; budgets only trim instance.effects after consume.
assert.match(rendererV2,/const list=events\|\|\[\]/,'Renderer V2 must preserve a shared semantic event list');
assert.match(rendererV2,/fallback\.consume\(legacy\)/,'unowned events must still reach vector/fallback presentation');
assert.match(rendererV2,/vfx\?\.consume\?\.\(list\)/,'full semantic list must reach base VFX consumer');
assert.match(rendererV2,/tierVfx\?\.consume\?\.\(list\)/,'full semantic list must reach tier VFX consumer');
assert.match(rendererV2,/camera\?\.consume\?\.\(list\)/,'full semantic list must reach camera consumer');
assert.ok(!budgetSource.includes("splice(0,events"),'budget layer must not splice semantic event arrays');
assert.ok(!budgetSource.includes("events.splice"),'budget layer must not mutate semantic event arrays');

for(const forbidden of ["updateDuelRound","duelDealDamage","settleDuelRound","resolveDuelTournamentStage","getDuelChoices","getDuelRewardChoices"]){
  assert.ok(!budgetSource.includes(forbidden),`VFX budget must not encode gameplay truth: ${forbidden}`);
}

console.log("V0.18 G6C transient presentation budget smoke: PASS");
