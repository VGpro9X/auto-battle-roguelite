(()=>{
  const root=typeof window!=="undefined"?window:globalThis;
  const FAMILIES=new Set(["physical","projectile","fire","frost","lightning","poison","blood","defense","heal","control","summon","area","chain","time","soul"]);
  const PRIORITY=["fire","frost","lightning","poison","blood","soul","time","chain","summon","control","defense","heal","area","projectile","physical"];
  const TAG_MAP={
    FIRE:"fire",BURN:"fire",ICE:"frost",FROST:"frost",LIGHTNING:"lightning",POISON:"poison",BLOOD:"blood",
    SHIELD:"defense",DEFENSE:"defense",HP:"defense",HEAL:"heal",REGEN:"heal",CONTROL:"control",STUN:"control",SLOW:"control",
    SUMMON:"summon",AREA:"area",EXPLOSION:"area",CHAIN:"chain",TIME:"time",SOUL:"soul",PROJECTILE:"projectile",
    ATTACK:"physical",HIT:"physical",DAMAGE:"physical",CRITICAL:"physical",KILL:"physical",MARK:"control",MOVEMENT:"time",RANDOM:"area"
  };
  const OVERRIDES={
    rapid:"physical",power:"physical",vitality:"defense",speed:"time",fire:"fire",knock:"control",orbit:"summon",heal:"heal",armor:"defense",crit:"physical",lightning:"lightning",nova:"area",frost:"frost",burn:"fire",barrier:"defense",phantomStep:"time",
    execution:"soul",berserk:"blood",glassCannon:"physical",retaliate:"area",thorns:"blood",lastStand:"defense",deathMark:"soul",poison:"poison",
    echoShot:"time",pointBlank:"physical",elementalMastery:"area",shieldPulse:"defense",sacrifice:"blood",blackHole:"control",luckyStar:"area",secondWind:"heal",
    afterimage:"time",runeMine:"area",meteorSeal:"fire",focusMind:"time",sevenStarStrike:"physical",staticField:"lightning",armorBreak:"control",vampiricTouch:"blood"
  };
  function uniq(list){return[...new Set(list.filter(Boolean))];}
  function tagFamilies(tags){return uniq((tags||[]).map(tag=>TAG_MAP[String(tag).toUpperCase()]));}
  function choose(families,fallback="physical"){for(const id of PRIORITY)if(families.includes(id))return id;return fallback;}
  function secondary(families,primary){return PRIORITY.find(id=>id!==primary&&families.includes(id))||null;}
  function profileFromMeta(id,meta={},tier="base"){
    const byTags=tagFamilies(meta.tags),override=OVERRIDES[id],name=String(meta.name||id||"").toLowerCase();
    const lexical=[];
    if(/hỏa|fire|flame|burn|meteor/.test(name))lexical.push("fire");if(/băng|hàn|frost|ice/.test(name))lexical.push("frost");if(/lôi|sét|lightning|thunder|storm/.test(name))lexical.push("lightning");if(/độc|poison|venom/.test(name))lexical.push("poison");if(/huyết|blood|vamp/.test(name))lexical.push("blood");if(/hồn|soul|death/.test(name))lexical.push("soul");if(/thời|time|echo|ảnh/.test(name))lexical.push("time");if(/thuẫn|giáp|shield|armor|barrier/.test(name))lexical.push("defense");if(/hồi|heal|regen/.test(name))lexical.push("heal");
    const candidates=uniq([override,...lexical,...byTags]);const primary=override||choose(candidates),second=secondary(candidates,primary);
    return{id,tier,primary,secondary:second,families:uniq([primary,second,...candidates]).filter(f=>FAMILIES.has(f)),tags:[...(meta.tags||[])],name:meta.name||id,signature:tier!=="base"};
  }
  function build(){
    const skills={},synergies={},evolutions={};
    for(const id of root.DUEL_SKILL_KEYS||[]){const meta=typeof root.getDuelSkill==="function"?root.getDuelSkill(id):{key:id,tags:[]};skills[id]=profileFromMeta(id,meta||{},"base");}
    const synergyCatalog=root.DUEL_SYNERGY_CATALOG||{};
    for(const id of Object.keys(synergyCatalog)){
      const meta=typeof root.getDuelSynergy==="function"?root.getDuelSynergy(id):synergyCatalog[id];const req=synergyCatalog[id]?.requires?.skills||[];const inherited=uniq(req.flatMap(key=>skills[key]?.families||[]));const primary=choose(inherited,"area"),second=secondary(inherited,primary);
      synergies[id]={id,tier:"synergy",primary,secondary:second,families:uniq([primary,second,...inherited]),name:meta?.name||id,ingredients:[...req],signature:true};
    }
    const evolutionCatalog=root.DUEL_EVOLUTION_CATALOG||{};
    for(const id of Object.keys(evolutionCatalog)){
      const meta=typeof root.getDuelEvolution==="function"?root.getDuelEvolution(id):evolutionCatalog[id],base=evolutionCatalog[id]?.base,baseProfile=skills[base]||profileFromMeta(base||id,{},"base"),requiredFamilies=tagFamilies(Object.keys(evolutionCatalog[id]?.requires?.tags||{})),all=uniq([...requiredFamilies,...baseProfile.families]),primary=choose(all,baseProfile.primary),second=secondary(all,primary);
      evolutions[id]={id,tier:"evolution",primary,secondary:second,families:uniq([primary,second,...all]),name:meta?.name||id,base,signature:true};
    }
    return{skills,synergies,evolutions,counts:{skills:Object.keys(skills).length,synergies:Object.keys(synergies).length,evolutions:Object.keys(evolutions).length}};
  }
  let map=build();
  function refresh(){map=build();root.DUEL_VISUAL_MAP_V3=map;return map;}
  function get(id){return map.skills[id]||map.synergies[id]||map.evolutions[id]||null;}
  function getForEvent(event){if(!event)return null;const ids=[event.skill,event.synergy,event.evolution,event.source,event.status].filter(v=>typeof v==="string");for(const id of ids){const p=get(id);if(p)return p;}return null;}
  root.DUEL_VISUAL_FAMILIES_V3=[...FAMILIES];root.DUEL_VISUAL_MAP_V3=map;root.refreshDuelVisualMapV3=refresh;root.getDuelVisualProfileV3=get;root.getDuelVisualProfileForEventV3=getForEvent;root.buildDuelVisualMapV3=build;
})();