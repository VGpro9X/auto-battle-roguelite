const fs=require('fs'),vm=require('vm');
function assert(v,m){if(!v)throw new Error(m);}
const source=fs.readFileSync('js/duel-vfx-tier.js','utf8');
const profiles={
  thermalShock:{id:'thermalShock',tier:'synergy',primary:'fire'},
  heavenfire:{id:'heavenfire',tier:'evolution',primary:'fire'}
};
const root={
  DUEL_C2A_SYNERGY_IDS:['thermalShock'],DUEL_C2B_SYNERGY_IDS:[],DUEL_C2C_SYNERGY_IDS:[],DUEL_C2D_SYNERGY_IDS:[],
  DUEL_C3A_EVOLUTION_IDS:['heavenfire'],DUEL_C3B_EVOLUTION_IDS:[],
  DUEL_RENDERER_V3_QUALITY:'balanced',
  getDuelVisualProfileForEventV3(event){return profiles[event?.synergy]||profiles[event?.evolution]||profiles[event?.skill]||null;},
  getDuelVisualQuality(){return{id:'full',reducedMotion:false};}
};
root.globalThis=root;vm.createContext(root);vm.runInContext(source,root);
assert(root.DUEL_VFX_RARE_IDS.length===20,'expected 20 Rare visual IDs');
assert(new Set(root.DUEL_VFX_RARE_IDS).size===20,'Rare visual IDs must be unique');
const rareSignatures=root.DUEL_VFX_RARE_IDS.map(id=>root.getDuelRareVisualSignature(id));
assert(rareSignatures.every(sig=>sig&&sig.tier==='rare'&&sig.id),'Rare signature missing');
assert(new Set(rareSignatures.map(sig=>JSON.stringify(sig))).size===20,'Rare signatures must be deterministic and distinct');
const synEvent={type:'cast',synergy:'thermalShock',side:'player'};
const evoEvent={type:'cast',evolution:'heavenfire',side:'player'};
const rareEvent={type:'status',source:'bribery',side:'player'};
assert(root.getDuelVfxTier(synEvent)==='synergy','synergy tier resolution failed');
assert(root.getDuelVfxTier(evoEvent)==='evolution','evolution tier resolution failed');
assert(root.getDuelVfxTier(rareEvent)==='rare','Rare tier resolution failed');
const synSig=root.getDuelHighTierVisualSignature(synEvent),synSig2=root.getDuelHighTierVisualSignature(synEvent);
assert(synSig?.id==='thermalShock'&&synSig.tier==='synergy'&&synSig.family==='fire','synergy signature identity failed');
assert(JSON.stringify(synSig)===JSON.stringify(synSig2),'same content must resolve same signature');
const evoSig=root.getDuelHighTierVisualSignature(evoEvent);
assert(evoSig?.id==='heavenfire'&&evoSig.tier==='evolution','evolution signature identity failed');
const full=root.createDuelVfxTierOverlay({quality:'full'}),balanced=root.createDuelVfxTierOverlay({quality:'balanced'}),low=root.createDuelVfxTierOverlay({quality:'low',reducedMotion:true});
assert(full.getStatus().limit===48&&full.getStatus().quality==='full','FULL budget changed');
assert(balanced.getStatus().limit===30&&balanced.getStatus().quality==='balanced','BALANCED budget changed');
assert(low.getStatus().limit===16&&low.getStatus().quality==='low'&&low.getStatus().reducedMotion===true,'LOW/reduced-motion budget changed');
low.consume(Array.from({length:60},(_,i)=>({type:'status',source:'bribery',side:i%2?'player':'opponent'})));
assert(low.getStatus().active===16,'LOW transient cap not enforced');
assert(low.getStatus().dropped===44,'LOW dropped count incorrect');
const before=low.getStatus().active;low.consume([{type:'hit',source:'ordinaryAttack'}]);assert(low.getStatus().active===before,'base event entered high-tier overlay');
for(const forbidden of ['dealDamage(','spawnDuelProjectile(','fighter.hp-=','target.hp-=','cooldown='])assert(!source.includes(forbidden),'spectacle layer must remain presentation-only: '+forbidden);
console.log('v020-b9-high-tier-spectacle-smoke: ok');
