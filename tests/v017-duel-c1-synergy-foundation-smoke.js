const fs=require('fs');
const vm=require('vm');
const assert=require('assert');

function load(path){vm.runInThisContext(fs.readFileSync(path,'utf8'),{filename:path});}
function approx(actual,expected,epsilon=1e-6){assert.ok(Math.abs(actual-expected)<=epsilon,`expected ${actual} ≈ ${expected}`);}

load('js/duel-skills.js');
load('js/duel-engine.js');
load('js/duel-skills-d6a.js');
load('js/duel-skills-d6b.js');
load('js/duel-skills-d6c.js');
load('js/duel-skills-d6d.js');
load('js/duel-skills-d6e.js');
load('js/duel-skills-d6f.js');
load('js/duel-skills-d6g.js');
load('js/duel-synergies.js');

assert.strictEqual(Object.keys(DUEL_SYNERGY_CATALOG).length,28,'Duel Hợp Đạo catalog must mirror all 28 existing Hợp Đạo identities');
assert.strictEqual(Object.keys(DUEL_SYNERGY_ADAPTERS).length,1,'C1 should expose exactly one implemented end-to-end Hợp Đạo before C2 batches');
assert.ok(DUEL_SYNERGY_CATALOG.afterimageEcho,'missing V0.16 B1 synergy identity');
assert.ok(DUEL_SYNERGY_CATALOG.guardianRetaliation,'missing V0.16 B2 synergy identity');

// Requirements are evaluated from Duel build ranks, but unported Hợp Đạo cannot silently activate.
{
  const build={fire:1,frost:1};
  const status=getDuelSynergyRequirementStatus(build,'thermalShock');
  assert.strictEqual(status.requirementsMet,true);
  assert.strictEqual(status.implemented,false);
  assert.strictEqual(status.unlocked,false);
  assert.deepStrictEqual(getUnlockedDuelSynergyIds(build),[]);
}

// Lò Luyện Hồn is the C1 end-to-end adapter and requires both source skills.
{
  assert.strictEqual(getDuelSynergyRequirementStatus({soulHarvest:1},'soulFurnace').unlocked,false);
  assert.strictEqual(getDuelSynergyRequirementStatus({blood:1},'soulFurnace').unlocked,false);
  const status=getDuelSynergyRequirementStatus({soulHarvest:1,blood:1},'soulFurnace');
  assert.strictEqual(status.unlocked,true);
  assert.ok(getDuelSynergy('soulFurnace').desc.includes('0,45 HP/giây'));
}

function makeEntry(id,build){return{id,name:id,build:{...build}};}

// Player and AI receive the same automatic unlock/effect and round state records both sides.
{
  const match=createDuelMatch(
    makeEntry('player',{soulHarvest:1,blood:1}),
    makeEntry('opponent',{soulHarvest:2,blood:1}),
    {rng:()=>.99}
  );
  const round=startDuelRound(match);
  const p=round.fighters.player,o=round.fighters.opponent;
  assert.deepStrictEqual(p.unlockedSynergies,['soulFurnace']);
  assert.deepStrictEqual(o.unlockedSynergies,['soulFurnace']);
  assert.deepStrictEqual(round.unlockedSynergies,{player:['soulFurnace'],opponent:['soulFurnace']});
  approx(p.stats.regen,.45);
  approx(o.stats.regen,.45);
  assert.strictEqual(round.events.filter(event=>event.type==='synergy_unlock'&&event.synergy==='soulFurnace').length,2);
}

// Sync after a build change unlocks immediately and is idempotent.
{
  const match=createDuelMatch(makeEntry('player',{soulHarvest:1}),makeEntry('opponent',{}),{rng:()=>.99});
  const round=startDuelRound(match),p=round.fighters.player;
  approx(p.stats.regen,0);
  assert.deepStrictEqual(p.unlockedSynergies,[]);
  p.build.blood=1;
  syncDuelFighterSynergies(p,round);
  assert.deepStrictEqual(p.unlockedSynergies,['soulFurnace']);
  approx(p.stats.regen,.45);
  syncDuelFighterSynergies(p,round);
  approx(p.stats.regen,.45); // no duplicate application.
}

// Internal best-of-3 round creation is decorated again through the wrapped settle path.
{
  const match=createDuelMatch(makeEntry('player',{soulHarvest:1,blood:1}),makeEntry('opponent',{}),{rng:()=>.99});
  const first=startDuelRound(match);
  first.ended=true;first.result={winner:'player',reason:'KO'};
  const result=settleDuelRound(match);
  assert.strictEqual(result.status,'next_round');
  const second=match.currentRound;
  assert.deepStrictEqual(second.fighters.player.unlockedSynergies,['soulFurnace']);
  approx(second.fighters.player.stats.regen,.45);
}

const index=fs.readFileSync('index.html','utf8');
assert.ok(index.includes('js/duel-synergies.js'),'public artifact missing Duel Hợp Đạo foundation');
assert.ok(index.indexOf('js/duel-skills-d6g.js')<index.indexOf('js/duel-synergies.js'),'Hợp Đạo must load after all 80 base adapters');
assert.ok(index.indexOf('js/duel-synergies.js')<index.indexOf('js/duel-ui.js'),'Hợp Đạo registry must load before Duel UI');

console.log('V0.17 C1 Duel Hợp Đạo foundation smoke: PASS');
