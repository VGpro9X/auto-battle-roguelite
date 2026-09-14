(()=>{
  const root=typeof window!=="undefined"?window:globalThis;
  if(typeof root.updateDuelRound!=="function")return;

  const tacticalUpdate=root.updateDuelRound;
  const spacingBonusByFighter=new WeakMap();

  function clampValue(v,a,b){return Math.max(a,Math.min(b,v));}
  function spacingBonusFor(fighter){
    if(spacingBonusByFighter.has(fighter))return spacingBonusByFighter.get(fighter);
    const profile=typeof root.getDuelBuildProfile==="function"
      ?root.getDuelBuildProfile(fighter.build||{})
      :null;
    const ranged=Math.max(0,Number(profile?.ranged)||0);
    const melee=Math.max(0,Number(profile?.melee)||0);
    const combat=Math.max(1,ranged+melee);
    const rangedWeight=clampValue(ranged/combat,0,1);
    // Only clearly ranged/hybrid-ranged builds receive extra preferred spacing.
    // Pure ranged builds get about +36 px; mixed builds scale down smoothly.
    const identity=clampValue((rangedWeight-.42)/.58,0,1);
    const bonus=identity<=0?0:14+22*identity;
    spacingBonusByFighter.set(fighter,bonus);
    return bonus;
  }

  root.updateDuelRound=function v019SpacingTunedUpdate(match,dt){
    const round=match?.currentRound;
    if(!round||round.ended||match.over)return tacticalUpdate(match,dt);

    const adjusted=[];
    for(const fighter of Object.values(round.fighters||{})){
      if(!fighter?.stats)continue;
      const bonus=spacingBonusFor(fighter);
      if(bonus<=0)continue;
      const original=Number(fighter.stats.preferredDistance)||82;
      adjusted.push([fighter,original]);
      fighter.stats.preferredDistance=clampValue(original+bonus,68,270);
    }

    try{
      return tacticalUpdate(match,dt);
    }finally{
      for(const [fighter,original] of adjusted)fighter.stats.preferredDistance=original;
    }
  };
})();
