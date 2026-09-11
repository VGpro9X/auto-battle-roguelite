(()=>{
  const root=typeof window!=="undefined"?window:globalThis;
  const CATALOG={
    heavenfire:{base:"fire",name:"Thiên Hỏa",icon:"☀️",requires:{tags:{FIRE:3,EXPLOSION:1}}},
    stormNetwork:{base:"lightning",name:"Thiên Lôi Võng",icon:"⚡",requires:{tags:{LIGHTNING:3,CHAIN:2}}},
    swordDomain:{base:"orbit",name:"Kiếm Vực",icon:"⚔️",requires:{tags:{SUMMON:3}}},
    plagueTide:{base:"poison",name:"Dịch Triều",icon:"🦠",requires:{tags:{DOT:2,KILL:2}}},
    crimsonMoon:{base:"blood",name:"Huyết Nguyệt",icon:"🌙🩸",requires:{tags:{BLOOD:3,HEAL:2,KILL:2}}},
    singularity:{base:"blackHole",name:"Kỳ Điểm",icon:"🌑",requires:{tags:{CONTROL:3,AREA:2}}},
    chaosCrown:{base:"chaosOrb",name:"Hỗn Mang Vương Miện",icon:"👑🌀",requires:{tags:{RANDOM:2,ELEMENTAL:3}}},
    immortalAegis:{base:"barrier",name:"Bất Diệt Thuẫn",icon:"🛡️✨",requires:{tags:{SHIELD:3,DEFENSE:4}}},
    phantomLegion:{base:"afterimage",name:"Vạn Ảnh Phân Thân",icon:"👥",requires:{tags:{TIME:3,SUMMON:3}}},
    heavenNet:{base:"runeMine",name:"Thiên La Địa Võng",icon:"✧⛓",requires:{tags:{AREA:3,EXPLOSION:3,CONTROL:2}}},
    bloodWeb:{base:"bloodLink",name:"Huyết Võng",icon:"🩸⛓",requires:{tags:{BLOOD:3,CHAIN:3}}},
    starfallCataclysm:{base:"meteorSeal",name:"Tinh Hà Trụy Lạc",icon:"☄☄☄",requires:{tags:{FIRE:2,AREA:3,EXPLOSION:3}}}
  };
  const ADAPTERS={};
  const BEHAVIORS={};
  function rank(build,key){return typeof root.getDuelSkillRank==="function"?root.getDuelSkillRank(build,key):Math.max(0,Math.min(3,Number(build?.[key]||0)));}
  function countTags(build){
    const counts={};
    if(typeof root.getDuelSkill!=="function")return counts;
    for(const key of Object.keys(build||{})){
      if(rank(build,key)<=0)continue;
      const meta=root.getDuelSkill(key);
      for(const tag of meta?.tags||[])counts[tag]=(counts[tag]||0)+1;
    }
    return counts;
  }
  function requirementStatus(build,id){
    const base=CATALOG[id];if(!base)return null;
    const baseRank=rank(build,base.base),tags=countTags(build),missingTags=[];
    for(const [tag,need] of Object.entries(base.requires?.tags||{}))if((tags[tag]||0)<need)missingTags.push({tag,need,have:tags[tag]||0});
    const baseMax=baseRank>=3,implemented=Boolean(ADAPTERS[id]),requirementsMet=baseMax&&missingTags.length===0;
    return{id,base:base.base,baseRank,baseMax,implemented,requirementsMet,unlocked:implemented&&requirementsMet,missingBaseRanks:Math.max(0,3-baseRank),missingTags};
  }
  function registerDuelEvolutionAdapter(id,adapter={}){
    if(!CATALOG[id]||!adapter||typeof adapter!=="object")return false;
    ADAPTERS[id]={...adapter};
    if(adapter.behavior&&typeof adapter.behavior==="object")BEHAVIORS[id]=adapter.behavior;
    return true;
  }
  function getDuelEvolution(id){
    const base=CATALOG[id];if(!base)return null;
    const source=typeof root.EVOLUTIONS!=="undefined"?root.EVOLUTIONS[id]:null,adapter=ADAPTERS[id]||null;
    return{id,base:base.base,name:source?.name||base.name,icon:source?.icon||base.icon,requires:{tags:{...(base.requires?.tags||{})}},implemented:Boolean(adapter),desc:adapter?.desc||"Siêu Cấp này chưa được chuyển cơ chế sang Đấu Trường."};
  }
  function getUnlockedDuelEvolutionIds(build){return Object.keys(CATALOG).filter(id=>requirementStatus(build,id)?.unlocked);}
  function hasDuelEvolution(subject,id){
    if(subject?.unlockedEvolutionSet instanceof Set)return subject.unlockedEvolutionSet.has(id);
    return Boolean(requirementStatus(subject?.build||subject,id)?.unlocked);
  }
  function listDuelEvolutions(build,{includeLocked=false,implementedOnly=true}={}){
    const out=[];
    for(const id of Object.keys(CATALOG)){
      const status=requirementStatus(build,id);
      if(implementedOnly&&!status.implemented)continue;
      if(!includeLocked&&!status.unlocked)continue;
      out.push({meta:getDuelEvolution(id),status});
    }
    return out;
  }
  function runEvolutionHook(fighter,hook,context={}){
    if(!fighter)return;
    for(const id of fighter.unlockedEvolutions||[]){const fn=BEHAVIORS[id]?.[hook];if(typeof fn==="function")fn({...context,fighter,id,meta:getDuelEvolution(id)});}
  }
  function syncDuelFighterEvolutions(fighter,round=null){
    if(!fighter)return[];
    const ids=getUnlockedDuelEvolutionIds(fighter.build);
    fighter.unlockedEvolutions=ids;fighter.unlockedEvolutionSet=new Set(ids);fighter.duelEvolutionEffects=fighter.duelEvolutionEffects||{};fighter._duelEvolutionApplied=fighter._duelEvolutionApplied||new Set();
    for(const id of ids){
      if(fighter._duelEvolutionApplied.has(id))continue;
      fighter._duelEvolutionApplied.add(id);
      const behavior=BEHAVIORS[id];if(typeof behavior?.onUnlock==="function")behavior.onUnlock({fighter,round,id,meta:getDuelEvolution(id)});
      if(round?.events)round.events.push({type:"evolution_unlock",t:round.time||0,side:fighter.side,evolution:id});
    }
    return ids;
  }
  function decorateRound(round){
    if(!round?.fighters)return round;
    const player=round.fighters.player,opponent=round.fighters.opponent;
    syncDuelFighterEvolutions(player,round);syncDuelFighterEvolutions(opponent,round);
    round.unlockedEvolutions={player:[...(player?.unlockedEvolutions||[])],opponent:[...(opponent?.unlockedEvolutions||[])]};
    runEvolutionHook(player,"onRoundStart",{round,self:player,other:opponent});runEvolutionHook(opponent,"onRoundStart",{round,self:opponent,other:player});
    return round;
  }
  function getDuelEvolutionChoiceHints(build,key){
    if(!build||!key||typeof root.canRankDuelSkill!=="function"||!root.canRankDuelSkill(build,key))return[];
    const next={...build};next[key]=rank(build,key)+1;
    const hints=[];
    for(const id of Object.keys(CATALOG)){
      const before=requirementStatus(build,id),after=requirementStatus(next,id);
      if(before?.unlocked||!after?.unlocked)continue;
      hints.push(getDuelEvolution(id));
    }
    return hints;
  }
  const baseStart=typeof root.startDuelRound==="function"?root.startDuelRound:null;
  if(baseStart)root.startDuelRound=function(match){return decorateRound(baseStart(match));};
  const baseSettle=typeof root.settleDuelRound==="function"?root.settleDuelRound:null;
  if(baseSettle)root.settleDuelRound=function(match){const result=baseSettle(match);if(match?.currentRound&&!match.over)decorateRound(match.currentRound);return result;};
  root.DUEL_EVOLUTION_CATALOG=CATALOG;root.DUEL_EVOLUTION_ADAPTERS=ADAPTERS;root.DUEL_EVOLUTION_BEHAVIORS=BEHAVIORS;
  root.registerDuelEvolutionAdapter=registerDuelEvolutionAdapter;root.getDuelEvolution=getDuelEvolution;root.getDuelEvolutionRequirementStatus=requirementStatus;root.getUnlockedDuelEvolutionIds=getUnlockedDuelEvolutionIds;root.hasDuelEvolution=hasDuelEvolution;root.listDuelEvolutions=listDuelEvolutions;root.runDuelEvolutionHook=runEvolutionHook;root.syncDuelFighterEvolutions=syncDuelFighterEvolutions;root.decorateDuelRoundEvolutions=decorateRound;root.getDuelEvolutionChoiceHints=getDuelEvolutionChoiceHints;
})();