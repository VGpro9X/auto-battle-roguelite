(()=>{
  const root=typeof window!=="undefined"?window:globalThis;

  const CATALOG={
    thermalShock:{name:"Sốc Nhiệt",icon:"🌡️",requires:{skills:["fire","frost"]}},
    bloodConductor:{name:"Huyết Dẫn Lôi",icon:"🩸⚡",requires:{skills:["blood","lightning"]}},
    arcCollector:{name:"Thu Lôi",icon:"🧲⚡",requires:{skills:["magnet","lightning"]}},
    explosiveBlades:{name:"Bạo Kiếm",icon:"🗡️💥",requires:{skills:["orbit","explosive"]}},
    toxicFlame:{name:"Độc Hỏa",icon:"🔥☠️",requires:{skills:["poison","burn"]}},
    stormVolley:{name:"Lôi Tiễn",icon:"🏹⚡",requires:{skills:["multishot","lightning"]}},
    soulFurnace:{name:"Lò Luyện Hồn",icon:"👁️🩸",requires:{skills:["soulHarvest","blood"]}},
    timeLoop:{name:"Vòng Lặp Thời Gian",icon:"♾️",requires:{skills:["timeEcho","overclock"]}},
    frozenExecution:{name:"Hàn Sát",icon:"🥶🗡️",requires:{skills:["frostbite","execution"]}},
    crimsonFortress:{name:"Huyết Thành",icon:"🩸🏰",requires:{skills:["bloodShield","barrier"]}},
    plagueLightning:{name:"Lôi Độc",icon:"☠️🌩️",requires:{skills:["conductiveVenom","lightning"]}},
    combustionChain:{name:"Liên Hoàn Hỏa Táng",icon:"🔥🧨",requires:{skills:["combustion","corpseBurst"]}},
    echoBarrage:{name:"Vạn Ảnh Tiễn",icon:"🏹♾️",requires:{skills:["echoShot","multishot"]}},
    glassBlood:{name:"Huyết Kính",icon:"🔮🩸",requires:{skills:["glassCannon","vampiricTouch"]}},
    gravityNova:{name:"Trọng Lực Bạo",icon:"🕳️💫",requires:{skills:["blackHole","nova"]}},
    markedBounty:{name:"Săn Ấn",icon:"☯️💰",requires:{skills:["deathMark","bountyMark"]}},
    elementalChaos:{name:"Ngũ Hành Hỗn Mang",icon:"🌈🌀",requires:{skills:["chaosOrb","elementalMastery"]}},
    soulAegis:{name:"Hồn Thuẫn",icon:"👁️🛡️",requires:{skills:["soulHarvest","bloodShield"]}},
    criticalStorm:{name:"Bạo Lôi",icon:"🎯⚡",requires:{skills:["crit","lightning"]}},
    lastBreath:{name:"Hồi Quang",icon:"🪽🚨",requires:{skills:["lastStand","secondWind"]}},
    afterimageEcho:{name:"Vạn Ảnh Xạ",icon:"👥↩",requires:{skills:["afterimage","echoShot"]}},
    gravityRune:{name:"Trọng Lực Phù Trận",icon:"🔻◉",requires:{skills:["runeMine","blackHole"]}},
    bloodSymbiosis:{name:"Huyết Mạch Cộng Sinh",icon:"🩸♡",requires:{skills:["bloodLink","vampiricTouch"]}},
    nourishingPearls:{name:"Linh Châu Dưỡng Mệnh",icon:"🔮✚",requires:{skills:["spiritPearl","xpHeal"]}},
    thunderStride:{name:"Phong Lôi Bộ",icon:"👣⚡",requires:{skills:["strideShock","lightning"]}},
    sealedSoul:{name:"Phong Hồn Tử Ấn",icon:"⛓☯",requires:{skills:["soulBind","deathMark"]}},
    heavenfallBurn:{name:"Thiên Hỏa Tinh Vẫn",icon:"☄🔥",requires:{skills:["meteorSeal","burn"]}},
    guardianRetaliation:{name:"Hộ Pháp Phản Chấn",icon:"▣💢",requires:{skills:["guardianIdol","retaliate"]}}
  };

  const ADAPTERS={};
  const BEHAVIORS={};

  function rank(build,key){
    if(typeof root.getDuelSkillRank==="function")return root.getDuelSkillRank(build,key);
    return Math.max(0,Math.min(3,Number(build?.[key]||0)));
  }

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
    const base=CATALOG[id];
    if(!base)return null;
    const requires=base.requires||{};
    const missingSkills=(requires.skills||[]).filter(key=>rank(build,key)<=0);
    const tags=countTags(build);
    const missingTags=[];
    for(const [tag,need] of Object.entries(requires.tags||{}))if((tags[tag]||0)<need)missingTags.push({tag,need,have:tags[tag]||0});
    const implemented=Boolean(ADAPTERS[id]);
    const requirementsMet=missingSkills.length===0&&missingTags.length===0;
    return{id,implemented,requirementsMet,unlocked:implemented&&requirementsMet,missingSkills,missingTags};
  }

  function registerDuelSynergyAdapter(id,adapter={}){
    if(!CATALOG[id]||!adapter||typeof adapter!=="object")return false;
    ADAPTERS[id]={...adapter};
    if(adapter.behavior&&typeof adapter.behavior==="object")BEHAVIORS[id]=adapter.behavior;
    return true;
  }

  function getDuelSynergy(id){
    const base=CATALOG[id];
    if(!base)return null;
    const source=typeof root.SYNERGIES!=="undefined"?root.SYNERGIES[id]:null;
    const adapter=ADAPTERS[id]||null;
    return{
      id,
      name:source?.name||base.name,
      icon:source?.icon||base.icon,
      requires:{skills:[...(base.requires?.skills||[])],tags:{...(base.requires?.tags||{})}},
      implemented:Boolean(adapter),
      desc:adapter?.desc||"Hợp Đạo này chưa được chuyển cơ chế sang Đấu Trường."
    };
  }

  function getUnlockedDuelSynergyIds(build){
    return Object.keys(CATALOG).filter(id=>requirementStatus(build,id)?.unlocked);
  }

  function hasDuelSynergy(subject,id){
    if(subject?.unlockedSynergySet instanceof Set)return subject.unlockedSynergySet.has(id);
    const build=subject?.build||subject;
    return Boolean(requirementStatus(build,id)?.unlocked);
  }

  function listDuelSynergies(build,{includeLocked=false,implementedOnly=true}={}){
    const out=[];
    for(const id of Object.keys(CATALOG)){
      const status=requirementStatus(build,id);
      if(implementedOnly&&!status.implemented)continue;
      if(!includeLocked&&!status.unlocked)continue;
      out.push({meta:getDuelSynergy(id),status});
    }
    return out;
  }

  function runSynergyHook(fighter,hook,context={}){
    if(!fighter)return;
    for(const id of fighter.unlockedSynergies||[]){
      const fn=BEHAVIORS[id]?.[hook];
      if(typeof fn==="function")fn({...context,fighter,id,meta:getDuelSynergy(id)});
    }
  }

  function syncDuelFighterSynergies(fighter,round=null){
    if(!fighter)return[];
    const ids=getUnlockedDuelSynergyIds(fighter.build);
    fighter.unlockedSynergies=ids;
    fighter.unlockedSynergySet=new Set(ids);
    fighter.duelSynergyEffects=fighter.duelSynergyEffects||{};
    fighter._duelSynergyApplied=fighter._duelSynergyApplied||new Set();
    for(const id of ids){
      if(fighter._duelSynergyApplied.has(id))continue;
      fighter._duelSynergyApplied.add(id);
      const behavior=BEHAVIORS[id];
      if(typeof behavior?.onUnlock==="function")behavior.onUnlock({fighter,round,id,meta:getDuelSynergy(id)});
      if(round?.events)round.events.push({type:"synergy_unlock",t:round.time||0,side:fighter.side,synergy:id});
    }
    return ids;
  }

  function decorateRound(round){
    if(!round?.fighters)return round;
    const player=round.fighters.player,opponent=round.fighters.opponent;
    syncDuelFighterSynergies(player,round);
    syncDuelFighterSynergies(opponent,round);
    round.unlockedSynergies={player:[...(player?.unlockedSynergies||[])],opponent:[...(opponent?.unlockedSynergies||[])]};
    runSynergyHook(player,"onRoundStart",{round,self:player,other:opponent});
    runSynergyHook(opponent,"onRoundStart",{round,self:opponent,other:player});
    return round;
  }

  // First end-to-end Duel Hợp Đạo used to validate the C1 foundation.
  registerDuelSynergyAdapter("soulFurnace",{
    desc:"Trong Đấu Trường, sở hữu Thực Hồn + Huyết Khí tự mở Lò Luyện Hồn: +0,45 HP/giây hồi phục nền trong mỗi round. HUYẾT CHIẾN/TỬ CHIẾN vẫn giảm hồi phục theo luật chung.",
    behavior:{
      onUnlock:({fighter})=>{
        fighter.stats.regen+=.45;
        fighter.duelSynergyEffects.soulFurnace={regen:.45};
      }
    }
  });

  const baseStart=typeof root.startDuelRound==="function"?root.startDuelRound:null;
  if(baseStart){
    root.startDuelRound=function(match){return decorateRound(baseStart(match));};
  }

  const baseSettle=typeof root.settleDuelRound==="function"?root.settleDuelRound:null;
  if(baseSettle){
    root.settleDuelRound=function(match){
      const result=baseSettle(match);
      if(match?.currentRound&&!match.over)decorateRound(match.currentRound);
      return result;
    };
  }

  root.DUEL_SYNERGY_CATALOG=CATALOG;
  root.DUEL_SYNERGY_ADAPTERS=ADAPTERS;
  root.DUEL_SYNERGY_BEHAVIORS=BEHAVIORS;
  root.registerDuelSynergyAdapter=registerDuelSynergyAdapter;
  root.getDuelSynergy=getDuelSynergy;
  root.getDuelSynergyRequirementStatus=requirementStatus;
  root.getUnlockedDuelSynergyIds=getUnlockedDuelSynergyIds;
  root.hasDuelSynergy=hasDuelSynergy;
  root.listDuelSynergies=listDuelSynergies;
  root.runDuelSynergyHook=runSynergyHook;
  root.syncDuelFighterSynergies=syncDuelFighterSynergies;
  root.decorateDuelRoundSynergies=decorateRound;
})();