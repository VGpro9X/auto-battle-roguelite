(()=>{
  const root=typeof window!=="undefined"?window:globalThis;
  if(typeof root.registerDuelSkillBehavior!=="function")return;
  const BRIDGE_KEY="__duelRareBridge";
  const ORDER=["bribery","immortalBreath","heavenlyPunishment","fateExchange","heavenlyMandate","divineJudgment","spatialSwap","equalPrice","heavenlyWard","divineDomain","lifeRewind","causalInversion","divineGift","timeStop","celestialEdict","heavenSeal","bloodDebt","parasitePact","voidReality","scapegoatFate"];
  const CATALOG={
    bribery:{tier:"mystic",name:"Mua Chuộc",icon:"🤝"},immortalBreath:{tier:"divine",name:"Bất Tử Nhất Tức",icon:"🕯️"},heavenlyPunishment:{tier:"divine",name:"Thiên Phạt",icon:"⚡"},fateExchange:{tier:"mystic",name:"Đổi Mệnh",icon:"☯️"},
    heavenlyMandate:{tier:"divine",name:"Thiên Mệnh",icon:"✦📜"},divineJudgment:{tier:"divine",name:"Phán Quyết",icon:"⚖✦"},spatialSwap:{tier:"mystic",name:"Hoán Vị",icon:"↔◇"},equalPrice:{tier:"mystic",name:"Đồng Giá",icon:"◆⚖"},
    heavenlyWard:{tier:"divine",name:"Thiên Hộ",icon:"🛡☀"},divineDomain:{tier:"divine",name:"Thần Vực",icon:"◎☀"},lifeRewind:{tier:"mystic",name:"Nghịch Lưu",icon:"⏪♥"},causalInversion:{tier:"mystic",name:"Đảo Nhân Quả",icon:"↻☯"},
    divineGift:{tier:"divine",name:"Thiên Tứ",icon:"✦+"},timeStop:{tier:"divine",name:"Thời Đình",icon:"Ⅱ✦"},celestialEdict:{tier:"divine",name:"Thiên Lệnh",icon:"✦!"},heavenSeal:{tier:"divine",name:"Thiên Ấn",icon:"◎✦"},
    bloodDebt:{tier:"mystic",name:"Nợ Máu",icon:"♥⌛"},parasitePact:{tier:"mystic",name:"Ký Sinh",icon:"◎↔"},voidReality:{tier:"mystic",name:"Hư Thực",icon:"◇◆"},scapegoatFate:{tier:"mystic",name:"Thế Mệnh",icon:"☯✕"}
  };
  const ADAPTERS={};
  const HOOK_ORDER={
    modifyIncomingDamage:["immortalBreath","spatialSwap","heavenlyWard","heavenSeal","causalInversion","divineDomain","parasitePact","bloodDebt","voidReality"],
    onFatalDamage:["scapegoatFate","immortalBreath"]
  };
  function normalizeRareList(subject){
    const entry=subject?.entry||subject;const list=entry?.rares;
    return Array.isArray(list)?list:[];
  }
  function hasDuelRare(subject,id){return normalizeRareList(subject).includes(id);}
  function getDuelRare(id){const base=CATALOG[id],adapter=ADAPTERS[id];return base?{id,...base,implemented:Boolean(adapter),desc:adapter?.desc||"Rare này chưa được chuyển cơ chế sang Đấu Trường."}:null;}
  function listDuelRares(subject){return normalizeRareList(subject).map(getDuelRare).filter(Boolean);}
  function getDuelRareTierLabel(item){return item?.tier==="mystic"?"THẦN BÍ KỸ":"THẦN KỸ";}
  function ensureRareEntry(entry){if(!entry)return entry;if(!Array.isArray(entry.rares))entry.rares=[];entry.duelRarePersistent=entry.duelRarePersistent||{};if(entry.rares.length&&entry.build){try{Object.defineProperty(entry.build,BRIDGE_KEY,{value:1,writable:true,configurable:true,enumerable:false});}catch(_){entry.build[BRIDGE_KEY]=1;}}return entry;}
  function grantDuelRare(subject,id){const entry=subject?.entry||subject,item=CATALOG[id];if(!entry||!item)return false;ensureRareEntry(entry);if(entry.rares.includes(id))return false;entry.rares.push(id);if(entry.build){try{Object.defineProperty(entry.build,BRIDGE_KEY,{value:1,writable:true,configurable:true,enumerable:false});}catch(_){entry.build[BRIDGE_KEY]=1;}}return true;}
  function registerDuelRareAdapter(id,adapter={}){if(!CATALOG[id]||!adapter||typeof adapter!=="object")return false;ADAPTERS[id]={...adapter};return true;}
  function getDuelRareOfferChance(rewardIndex=0){const n=Math.max(0,Number(rewardIndex)||0);if(n<=1)return 0;if(n===2)return .03;if(n===3)return .06;if(n===4)return .10;return .15;}
  function availableRareIds(subject){const owned=new Set(normalizeRareList(subject));return ORDER.filter(id=>ADAPTERS[id]&&!owned.has(id));}
  function rollDuelRareOffer(subject,rewardIndex,rng=Math.random){const available=availableRareIds(subject);if(!available.length||rng()>=getDuelRareOfferChance(rewardIndex))return null;return available[Math.min(available.length-1,Math.floor(rng()*available.length))];}
  function getDuelRewardChoices(subject,{count=3,rewardIndex=0,rng=Math.random}={}){
    const entry=subject?.entry||subject,build=entry?.build||{};
    const choices=(typeof root.getDuelChoices==="function"?root.getDuelChoices(build,{starter:false,count,rng}):[]).map(key=>({kind:"skill",key}));
    const rare=rollDuelRareOffer(entry,rewardIndex,rng);if(rare&&choices.length)choices[choices.length-1]={kind:"rare",key:rare};return choices;
  }
  function applyDuelDivineGift(subject,key,rng=Math.random){const entry=subject?.entry||subject;if(!entry||!hasDuelRare(entry,"divineGift")||typeof root.canRankDuelSkill!=="function"||!root.canRankDuelSkill(entry.build,key)||rng()>=.18)return false;return root.addDuelSkillRank(entry.build,key);}
  function hookIds(hook){return HOOK_ORDER[hook]||ORDER;}
  function runRareHook(subject,hook,context={}){for(const id of hookIds(hook)){if(!hasDuelRare(subject,id))continue;const fn=ADAPTERS[id]?.behavior?.[hook];if(typeof fn==="function")fn({...context,fighter:subject,id,rare:getDuelRare(id)});}}
  function applyRareModifier(subject,hook,value,context={}){let result=value;for(const id of hookIds(hook)){if(!hasDuelRare(subject,id))continue;const fn=ADAPTERS[id]?.behavior?.[hook];if(typeof fn!=="function")continue;const next=fn({...context,fighter:subject,id,rare:getDuelRare(id),value:result});if(Number.isFinite(next))result=next;}return result;}
  function state(fighter){return fighter.duelRareEffects||(fighter.duelRareEffects={timers:{}});}
  root.registerDuelSkillBehavior(BRIDGE_KEY,{
    modifyStats:context=>runRareHook(context.entry,"modifyStats",context),
    onCreate:context=>{const fighter=context.fighter;state(fighter);fighter.duelRarePersistent=fighter.entry.duelRarePersistent||(fighter.entry.duelRarePersistent={});runRareHook(fighter,"onCreate",context);},
    onRoundStart:context=>runRareHook(context.fighter,"onRoundStart",context),
    update:context=>runRareHook(context.fighter,"update",context),
    modifyOutgoingDamage:context=>applyRareModifier(context.fighter,"modifyOutgoingDamage",context.value,context),
    modifyIncomingDamage:context=>applyRareModifier(context.fighter,"modifyIncomingDamage",context.value,context),
    modifyMoveMultiplier:context=>applyRareModifier(context.fighter,"modifyMoveMultiplier",context.value,context),
    modifyBasicAttackCooldown:context=>applyRareModifier(context.fighter,"modifyBasicAttackCooldown",context.value,context),
    modifyTargetArmor:context=>applyRareModifier(context.fighter,"modifyTargetArmor",context.value,context),
    modifyProjectile:context=>runRareHook(context.fighter,"modifyProjectile",context),
    onDamageTaken:context=>runRareHook(context.fighter,"onDamageTaken",context),
    onDamageDealt:context=>runRareHook(context.fighter,"onDamageDealt",context),
    onFatalDamage:context=>runRareHook(context.fighter,"onFatalDamage",context),
    onBasicHit:context=>runRareHook(context.fighter,"onBasicHit",context)
  });
  const baseCreate=typeof root.createDuelMatch==="function"?root.createDuelMatch:null;
  if(baseCreate)root.createDuelMatch=function(playerEntry,opponentEntry,options={}){ensureRareEntry(playerEntry);ensureRareEntry(opponentEntry);return baseCreate(playerEntry,opponentEntry,options);};
  root.DUEL_RARE_ORDER=ORDER;root.DUEL_RARE_CATALOG=CATALOG;root.DUEL_RARE_ADAPTERS=ADAPTERS;root.DUEL_RARE_BRIDGE_KEY=BRIDGE_KEY;
  root.registerDuelRareAdapter=registerDuelRareAdapter;root.getDuelRare=getDuelRare;root.hasDuelRare=hasDuelRare;root.listDuelRares=listDuelRares;root.getDuelRareTierLabel=getDuelRareTierLabel;root.grantDuelRare=grantDuelRare;root.getDuelRareOfferChance=getDuelRareOfferChance;root.rollDuelRareOffer=rollDuelRareOffer;root.getDuelRewardChoices=getDuelRewardChoices;root.applyDuelDivineGift=applyDuelDivineGift;root.ensureDuelRareEntry=ensureRareEntry;root.runDuelRareHook=runRareHook;root.applyDuelRareModifier=applyRareModifier;root.getDuelRareState=state;
})();