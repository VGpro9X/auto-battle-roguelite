const fs=require('fs');
const vm=require('vm');
const assert=require('assert');
function load(path){vm.runInThisContext(fs.readFileSync(path,'utf8'),{filename:path});}
function approx(a,b,e=1e-5){assert.ok(Math.abs(a-b)<=e,`expected ${a} ≈ ${b}`);}
function entry(id,build={},rares=[]){return{id,name:id,build:{...build},rares:[...rares],duelRarePersistent:{}};}
function duel(buildA={},raresA=[],buildB={},raresB=[],rng=()=>.99){
  const match=createDuelMatch(entry('player',buildA,raresA),entry('opponent',buildB,raresB),{rng});
  const round=startDuelRound(match);return{match,round,p:round.fighters.player,o:round.fighters.opponent};
}
load('js/skills.js');
for(const file of ['duel-skills','duel-engine','duel-skills-d6a','duel-skills-d6b','duel-skills-d6c','duel-skills-d6d','duel-skills-d6e','duel-skills-d6f','duel-skills-d6g','duel-synergies','duel-synergies-c2a','duel-synergies-c2b','duel-synergies-c2c','duel-synergies-c2d','duel-evolutions','duel-evolutions-c3a','duel-evolutions-c3b','duel-rares','duel-rares-r1','duel-rares-r2','duel-tournament'])load(`js/${file}.js`);

assert.strictEqual(DUEL_RARE_ORDER.length,20);
assert.strictEqual(Object.keys(DUEL_RARE_CATALOG).length,20);
assert.strictEqual(Object.keys(DUEL_RARE_ADAPTERS).length,20,'C4 must finish at 20/20 Duel rare adapters');
assert.strictEqual(DUEL_C4A_RARE_IDS.length,10);assert.strictEqual(DUEL_C4B_RARE_IDS.length,10);
assert.strictEqual(new Set(DUEL_RARE_ORDER).size,20);
for(const id of DUEL_RARE_ORDER){const meta=getDuelRare(id);assert.ok(meta&&meta.implemented,`${id} not implemented`);assert.ok(meta.desc.length>80,`${id} lacks explicit Duel description`);}

// Locked tournament curve: no starter/first-win rare; then 3/6/10/15%, capped at 15%.
assert.deepStrictEqual([0,1,2,3,4,5,6].map(getDuelRareOfferChance),[0,0,.03,.06,.10,.15,.15]);
{
  const e=entry('p',{power:1});
  assert.strictEqual(rollDuelRareOffer(e,1,()=>0),null,'first reward must never roll a rare');
  const forced=rollDuelRareOffer(e,5,()=>0);assert.ok(DUEL_RARE_ORDER.includes(forced));
  assert.strictEqual(grantDuelRare(e,forced),true);assert.strictEqual(grantDuelRare(e,forced),false,'rare must be unique');
  assert.notStrictEqual(rollDuelRareOffer(e,5,()=>0),forced,'owned rare must be excluded from later rolls');
}
{
  const e=entry('p',{power:1});
  const choices=getDuelRewardChoices(e,{count:3,rewardIndex:5,rng:()=>0});
  assert.strictEqual(choices.length,3);assert.strictEqual(choices.filter(x=>x.kind==='rare').length,1,'at most one rare card per reward roll');
  assert.strictEqual(getDuelRewardChoices(e,{count:3,rewardIndex:1,rng:()=>0}).some(x=>x.kind==='rare'),false);
}

// AI uses the same stage-based rare roll.
{
  const ai=entry('ai',{power:1});ai.affinity='hybrid';ai.isPlayer=false;
  const noRare=grantDuelAiReward(ai,()=>0,1);assert.ok(noRare&&noRare.kind==='skill');assert.strictEqual(ai.rares.length,0);
  const rare=grantDuelAiReward(ai,()=>0,5);assert.ok(rare&&rare.kind==='rare');assert.strictEqual(ai.rares.length,1);
}

// Divine Gift is free Rank progress and cannot exceed Rank III.
{
  const e=entry('p',{power:1},['divineGift']);assert.strictEqual(applyDuelDivineGift(e,'power',()=>0),true);assert.strictEqual(e.build.power,2);
  e.build.power=3;assert.strictEqual(applyDuelDivineGift(e,'power',()=>0),false);assert.strictEqual(e.build.power,3);
}

// Periodic rule mechanics.
{
  const {match,p,o,round}=duel({},['bribery']);p.hitStun=10;o.hitStun=10;p.stats.moveSpeed=0;o.stats.moveSpeed=0;getDuelRareState(p).timers.bribery=0;
  updateDuelRound(match,.033);assert.ok(o.hitStun>=1.19);approx(p.shield,6);assert.ok(round.events.some(e=>e.status==='bribery'));
}
{
  const {match,p,o}=duel({},['fateExchange']);p.hitStun=10;o.hitStun=10;p.hp=20;o.hp=80;getDuelRareState(p).timers.fateExchange=0;
  updateDuelRound(match,.033);approx(p.hp,80);approx(o.hp,20);
}
{
  const {match,p,o}=duel({fire:1},['heavenlyMandate']);p.hitStun=10;o.hitStun=10;p.skillTimers.fire=5;getDuelRareState(p).timers.heavenlyMandate=0;
  updateDuelRound(match,.033);assert.ok(p.skillTimers.fire<=0);
}
{
  const {match,p,o}=duel({},['equalPrice']);p.hitStun=10;o.hitStun=10;getDuelRareState(p).timers.equalPrice=0;
  updateDuelRound(match,.033);approx(p.hp,92);approx(p.shield,12);
}
{
  const {match,p,o,round}=duel({},['divineDomain']);p.hitStun=10;o.hitStun=10;p.x=400;o.x=500;getDuelRareState(p).timers.divineDomain=0;
  updateDuelRound(match,.033);assert.ok(getDuelRareState(p).divineDomainUntil>round.time);approx(applyDuelRareModifier(p,'modifyOutgoingDamage',10,{round,target:o}),12);approx(applyDuelRareModifier(p,'modifyIncomingDamage',10,{round,attacker:o}),6);
}
{
  const {match,p,o}=duel({},['timeStop']);p.hitStun=10;o.hitStun=0;o.skillTimers.fake=3;getDuelRareState(p).timers.timeStop=0;
  updateDuelRound(match,.033);assert.ok(o.hitStun>1.9);assert.ok(o.skillTimers.fake>4.9);
}
{
  const {match,p,o}=duel({},['celestialEdict']);p.hitStun=10;o.hitStun=10;getDuelRareState(p).timers.celestialEdict=0;
  updateDuelRound(match,.033);approx(o.hp,82);
}
{
  const {match,p,o}=duel({},['lifeRewind']);p.hitStun=10;o.hitStun=10;p.hp=50;p.shield=0;const s=getDuelRareState(p);s.lifeHistory=[{t:-5,hp:90,shield:10}];s.timers.lifeRewind=0;s.lifeSnapshotTimer=99;
  updateDuelRound(match,.033);approx(p.hp,90);approx(p.shield,10);
}

// Damage rules and deterministic defensive ordering.
{
  const {match,p,o,round}=duel({},['heavenlyPunishment']);p.x=400;o.x=460;o.hitStun=10;p.attackTimer=0;getDuelRareState(p).heavenlyPunishmentCharge=89;
  updateDuelRound(match,.033);approx(o.hp,60);assert.ok(round.events.some(e=>e.source==='heavenlyPunishment'));
}
{
  const {match,p,o}=duel({},['divineJudgment']);p.x=400;o.x=460;o.hitStun=10;o.hp=30;p.attackTimer=0;
  updateDuelRound(match,.033);approx(o.hp,1);assert.strictEqual(getDuelRareState(p).divineJudgmentUsed,true);
}
{
  const {match,p,o}=duel({},['causalInversion']);p.x=400;o.x=460;p.hp=50;p.hitStun=10;o.attackTimer=0;getDuelRareState(p).causalArmed=true;
  updateDuelRound(match,.033);approx(p.hp,62);
}
{
  const {match,p,o}=duel({},['bloodDebt']);p.x=400;o.x=460;p.hitStun=10;o.attackTimer=0;
  updateDuelRound(match,.033);approx(p.hp,94);assert.ok(getDuelRareState(p).bloodDebts.length===1);approx(getDuelRareState(p).bloodDebts[0].remaining,6);
}
{
  const {match,p,o}=duel({},['parasitePact']);p.x=400;o.x=460;p.hitStun=10;o.attackTimer=0;getDuelRareState(p).parasiteUntil=10;
  updateDuelRound(match,.033);approx(p.hp,91.6);approx(o.hp,96.4);
}
{
  const {match,p,o,round}=duel({},['voidReality']);p.hitStun=10;o.hitStun=10;assert.ok(p.stats.dodgeChance>=.30);approx(applyDuelRareModifier(p,'modifyOutgoingDamage',10,{round,target:o}),8);
  round.time=6.01;DUEL_RARE_ADAPTERS.voidReality.behavior.update({round,fighter:p,emit:()=>{}});approx(applyDuelRareModifier(p,'modifyOutgoingDamage',10,{round,target:o}),12.5);approx(applyDuelRareModifier(p,'modifyMoveMultiplier',1,{round}),.85);
}
{
  // 1) Thiên Ấn cancels first lethal hit. 2) Thế Mệnh saves the next lethal hit. 3) Bất Tử Nhất Tức remains unused until a later lethal hit.
  const {match,p,o}=duel({},['heavenSeal','scapegoatFate','immortalBreath']);p.x=400;o.x=460;p.hitStun=10;o.attackTimer=0;p.hp=5;getDuelRareState(p).scapegoatArmed=true;
  updateDuelRound(match,.033);approx(p.hp,5);assert.ok(getDuelRareState(p).heavenSealReadyAt>0);assert.strictEqual(p.entry.duelRarePersistent.immortalBreathUsed,undefined);
  o.attackTimer=0;p.hp=5;updateDuelRound(match,.033);approx(p.hp,1);assert.strictEqual(getDuelRareState(p).scapegoatArmed,false);assert.strictEqual(p.entry.duelRarePersistent.immortalBreathUsed,undefined);
  o.attackTimer=0;p.hp=1;updateDuelRound(match,.033);approx(p.hp,1);assert.strictEqual(p.entry.duelRarePersistent.immortalBreathUsed,true);assert.ok(getDuelRareState(p).immortalUntil>match.currentRound.time);
}

const index=fs.readFileSync('index.html','utf8');
for(const name of ['duel-rares.js','duel-rares-r1.js','duel-rares-r2.js'])assert.ok(index.includes(name),`public artifact missing ${name}`);
assert.ok(index.indexOf('duel-evolutions-c3b.js')<index.indexOf('duel-rares.js'));
assert.ok(index.indexOf('duel-rares.js')<index.indexOf('duel-rares-r1.js'));
assert.ok(index.indexOf('duel-rares-r1.js')<index.indexOf('duel-rares-r2.js'));
assert.ok(index.indexOf('duel-rares-r2.js')<index.indexOf('duel-ui.js'));
console.log('V0.17 C4 all-20 Duel rare mechanics/acquisition smoke: PASS');
