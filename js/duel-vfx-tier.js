(()=>{
  const root=typeof window!=="undefined"?window:globalThis;
  const SYNERGY_ARRAYS=["DUEL_C2A_SYNERGY_IDS","DUEL_C2B_SYNERGY_IDS","DUEL_C2C_SYNERGY_IDS","DUEL_C2D_SYNERGY_IDS"];
  const EVOLUTION_ARRAYS=["DUEL_C3A_EVOLUTION_IDS","DUEL_C3B_EVOLUTION_IDS"];
  const RARE_IDS=Object.freeze([
    "bribery","immortalBreath","heavenlyPunishment","fateExchange","heavenlyMandate",
    "divineJudgment","spatialSwap","equalPrice","heavenlyWard","divineDomain",
    "lifeRewind","causalInversion","divineGift","timeStop","celestialEdict",
    "heavenSeal","bloodDebt","parasitePact","voidReality","scapegoatFate"
  ]);
  const RARE_ALIASES=Object.freeze({
    bribery:["bribery"],immortalBreath:["immortalBreath"],heavenlyPunishment:["heavenlyPunishment"],
    fateExchange:["fateExchange"],heavenlyMandate:["heavenlyMandate"],divineJudgment:["divineJudgment"],
    spatialSwap:["spatialSwap"],equalPrice:["equalPrice"],heavenlyWard:["heavenlyWard"],divineDomain:["divineDomain"],
    lifeRewind:["lifeRewind"],causalInversion:["causalInversion"],divineGift:["divineGift"],timeStop:["timeStop"],
    celestialEdict:["celestialEdict"],heavenSeal:["heavenSeal"],bloodDebt:["bloodDebt"],parasitePact:["parasitePact"],
    voidReality:["voidReality","voidPhase","realPhase"],scapegoatFate:["scapegoatFate","scapegoatSaved"]
  });
  function normalize(value){return String(value||"").toLowerCase().replace(/[^a-z0-9]/g,"");}
  function tokens(event){return [event?.source,event?.skill,event?.status,event?.variant].filter(Boolean).map(normalize);}
  function idsFrom(names){const out=[];for(const name of names){const list=root[name];if(Array.isArray(list))out.push(...list);}return out;}
  function eventMatchesId(event,id){const key=normalize(id);return Boolean(key&&tokens(event).some(token=>token===key||token.includes(key)));}
  function rareIdForDuelEvent(event){for(const id of RARE_IDS){for(const alias of RARE_ALIASES[id]||[id])if(eventMatchesId(event,alias))return id;}return null;}
  function tierForDuelEvent(event){
    const rareId=rareIdForDuelEvent(event);if(rareId)return"rare";
    for(const id of idsFrom(EVOLUTION_ARRAYS))if(eventMatchesId(event,id))return"evolution";
    for(const id of idsFrom(SYNERGY_ARRAYS))if(eventMatchesId(event,id))return"synergy";
    return"base";
  }
  function rareVisualSignature(id){
    const index=RARE_IDS.indexOf(id);if(index<0)return null;
    return{id,index,sides:3+(index%6),satellites:1+(Math.floor(index/6)%4),dash:2+(index%5),spin:index%2===0?1:-1,phase:(index*0.61803398875)%1};
  }
  root.DUEL_VFX_RARE_IDS=RARE_IDS;
  root.getDuelRareVisualId=rareIdForDuelEvent;
  root.getDuelVfxTier=tierForDuelEvent;
  root.getDuelRareVisualSignature=rareVisualSignature;
})();