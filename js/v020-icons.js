// V0.20 B11A — deterministic runtime icon system.
// Presentation only: keeps legacy metadata icons as compatibility fallback.
(()=>{
  const root=typeof window!=="undefined"?window:globalThis;

  const familyOrder=[
    ["fire",["FIRE","BURN"]],
    ["frost",["ICE","FROST"]],
    ["lightning",["LIGHTNING"]],
    ["poison",["POISON","DOT"]],
    ["blood",["BLOOD"]],
    ["heal",["HEAL","HP"]],
    ["defense",["SHIELD","DEFENSE"]],
    ["summon",["SUMMON"]],
    ["soul",["SOUL"]],
    ["time",["TIME","PERIODIC"]],
    ["control",["CONTROL","MOVEMENT","AURA"]],
    ["area",["AREA","EXPLOSION"]],
    ["mark",["MARK","CHAIN","CHARGE"]],
    ["growth",["XP","SCALING","LEVEL_UP"]],
    ["projectile",["PROJECTILE"]],
    ["physical",["ATTACK","CRITICAL","DAMAGE","HIT","KILL"]]
  ];

  const b8FamilyToIcon=Object.freeze({
    physical:"physical",projectile:"projectile",fire:"fire",frost:"frost",lightning:"lightning",poison:"poison",
    blood:"blood",defense:"defense",heal:"heal",control:"control",summon:"summon",area:"area",chain:"mark",time:"time",soul:"soul"
  });
  const highTierFamily=Object.freeze({
    bribery:"control",immortalBreath:"heal",heavenlyPunishment:"lightning",fateExchange:"mark",
    heavenlyMandate:"time",divineJudgment:"mark",spatialSwap:"time",equalPrice:"blood",
    heavenlyWard:"defense",divineDomain:"area",lifeRewind:"time",causalInversion:"time",
    divineGift:"growth",timeStop:"time",celestialEdict:"mark",heavenSeal:"defense",
    bloodDebt:"blood",parasitePact:"soul",voidReality:"soul",scapegoatFate:"soul"
  });

  function tagsOf(item){
    return new Set((Array.isArray(item?.tags)?item.tags:[]).map(tag=>String(tag).toUpperCase()));
  }
  function inferFamily(id,item={}){
    if(highTierFamily[id])return highTierFamily[id];
    try{
      const profile=typeof root.getDuelVisualProfileV3==="function"?root.getDuelVisualProfileV3(id):null;
      const mapped=b8FamilyToIcon[profile?.primary];
      if(mapped)return mapped;
    }catch{}
    const tags=tagsOf(item);
    for(const [family,list] of familyOrder)if(list.some(tag=>tags.has(tag)))return family;
    const hay=(String(id||"")+" "+String(item?.name||"")).toLowerCase();
    if(/hỏa|fire|burn|meteor|flame/.test(hay))return"fire";
    if(/băng|hàn|frost|ice/.test(hay))return"frost";
    if(/lôi|sét|lightning|storm|thunder/.test(hay))return"lightning";
    if(/độc|poison|venom/.test(hay))return"poison";
    if(/huyết|blood/.test(hay))return"blood";
    if(/hồi|heal|life|sinh lực|immortal/.test(hay))return"heal";
    if(/thuẫn|giáp|shield|armor|barrier|guard/.test(hay))return"defense";
    if(/triệu|summon|linh|totem|idol|phantom/.test(hay))return"summon";
    if(/hồn|soul|spirit/.test(hay))return"soul";
    if(/thời|time|echo|nhịp/.test(hay))return"time";
    if(/ấn|mark|seal|chain|liên/.test(hay))return"mark";
    if(/xp|kinh nghiệm|ngộ|growth|level/.test(hay))return"growth";
    if(/vực|nổ|nova|burst|area|shockwave/.test(hay))return"area";
    if(/bộ|step|knock|control|slow/.test(hay))return"control";
    return"projectile";
  }

  function hashString(value){
    let h=2166136261;
    for(const ch of String(value||"")){h^=ch.codePointAt(0);h=Math.imul(h,16777619);}
    return h>>>0;
  }
  function resolveTier(kind,item={}){
    if(kind==="mystic"||item?.tier==="mystic")return"mystic";
    if(kind==="divine"||item?.tier==="divine")return"divine";
    if(kind==="rare")return"rare";
    if(kind==="evolution")return"evolution";
    if(kind==="synergy")return"synergy";
    return"base";
  }

  const motif={
    fire:'<path d="M34 12c3 10-8 12-3 20 2-6 8-8 10-14 7 8 10 17 6 25-3 7-9 11-16 11-10 0-17-7-17-17 0-9 6-15 13-21-1 8 2 10 7 13z"/><path d="M32 32c5 5 6 9 3 14-2 3-7 4-10 1-4-5-1-10 7-15z"/>',
    frost:'<path d="M32 11v42M14 21l36 22M14 43l36-22M24 15l8 7 8-7M24 49l8-7 8 7M15 31l10 1-3 10M49 31l-10 1 3 10"/>',
    lightning:'<path d="M37 10 19 35h11l-4 19 19-27H34z"/>',
    poison:'<path d="M32 13c11 0 18 8 18 18 0 8-5 13-11 15v6H25v-6c-6-2-11-7-11-15 0-10 7-18 18-18z"/><circle cx="25" cy="31" r="3"/><circle cx="39" cy="31" r="3"/><path d="m27 42 5-4 5 4"/>',
    blood:'<path d="M32 10c7 11 16 20 16 30 0 9-7 15-16 15s-16-6-16-15c0-10 9-19 16-30z"/><path d="M25 42c1 5 4 7 9 7"/>',
    heal:'<circle cx="32" cy="32" r="18"/><path d="M32 20v24M20 32h24"/>',
    defense:'<path d="M32 10 49 17v13c0 11-6 19-17 24-11-5-17-13-17-24V17z"/><path d="M24 32h16"/>',
    summon:'<path d="M32 11 38 25l15 1-11 10 4 15-14-8-14 8 4-15-11-10 15-1z"/><circle cx="32" cy="32" r="6"/>',
    soul:'<path d="M32 10c12 6 18 15 16 25-2 11-10 18-16 20-6-2-14-9-16-20-2-10 4-19 16-25z"/><path d="M25 34c4-7 10-10 18-11M22 42c6-3 12-3 20 0"/>',
    time:'<circle cx="32" cy="32" r="20"/><path d="M32 19v14l9 6M17 16l5 1-1 5"/>',
    control:'<path d="M13 35c8-12 15-12 22 0s14 12 18 0"/><path d="M13 24c8-8 15-8 22 0s14 8 18 0"/>',
    area:'<circle cx="32" cy="32" r="7"/><circle cx="32" cy="32" r="16"/><path d="M32 8v8M32 48v8M8 32h8M48 32h8"/>',
    mark:'<path d="M32 10 49 20v24L32 54 15 44V20z"/><circle cx="32" cy="32" r="8"/><path d="M32 20v24M20 32h24"/>',
    growth:'<path d="M32 53V24M32 24c-10 0-16-5-18-13 10 0 16 5 18 13zM32 30c10 0 16-5 18-13-10 0-16 5-18 13z"/><path d="M22 53h20"/>',
    projectile:'<path d="M12 42 48 16l-9 33-8-11-12 8 7-13z"/><path d="M31 38 48 16"/>',
    physical:'<path d="M18 48 46 16M38 14l10 2-2 10M14 38l12 12M21 31l12 12"/><path d="M15 50h16"/>'
  };

  function frameMarkup(tier,seed){
    const angle=(seed%8)*45;
    if(tier==="mystic")return '<path class="v20IconFrame" d="M32 7 51 18 48 42 32 56 16 42 13 18z"/><path class="v20IconAccent" d="M11 32h8M45 32h8M32 5v8M32 51v8"/>';
    if(tier==="divine")return '<path class="v20IconFrame" d="M32 6 54 32 32 58 10 32z"/><circle class="v20IconAccent" cx="32" cy="32" r="23"/>';
    if(tier==="rare")return '<circle class="v20IconFrame" cx="32" cy="32" r="25"/><path class="v20IconAccent" d="M32 5v7M32 52v7M5 32h7M52 32h7"/>';
    if(tier==="evolution")return '<path class="v20IconFrame" d="M11 47 17 17l15 10 15-10 6 30z"/><path class="v20IconAccent" d="M18 48h28"/>';
    if(tier==="synergy")return '<path class="v20IconFrame" d="M21 13 40 13 51 32 40 51 21 51 10 32z"/><path class="v20IconAccent" d="M14 32h36"/>';
    return '<circle class="v20IconFrame" cx="32" cy="32" r="25"/><path class="v20IconAccent" d="M32 7v5M32 52v5"/>';
  }

  function getV020IconDescriptor(kind,id,item={}){
    const family=inferFamily(id,item),tier=resolveTier(kind,item),seed=hashString(kind+":"+id);
    return{family,tier,seed,angle:(seed%8)*45};
  }

  function getV020IconMarkup(kind,id,item={},options={}){
    const d=getV020IconDescriptor(kind,id,item);
    const size=options.size||"md";
    const title=String(options.title||item?.name||id||"").replace(/[<>&"]/g,"");
    const body=motif[d.family]||motif.projectile;
    return '<span class="v20Icon v20Icon--'+d.family+' v20Icon--'+d.tier+' v20Icon--'+size+'" data-v20-icon="'+String(id||"")+'" title="'+title+'" aria-hidden="true"><svg viewBox="0 0 64 64" focusable="false" role="img"><g class="v20IconFrameLayer">'+frameMarkup(d.tier,d.seed)+'</g><g class="v20IconGlyph" transform="rotate('+d.angle+' 32 32)">'+body+'</g></svg></span>';
  }

  root.getV020IconDescriptor=getV020IconDescriptor;
  root.getV020IconMarkup=getV020IconMarkup;
  root.V020_ICON_FAMILIES=Object.freeze(Object.keys(motif));
})();