const skillRuntime={
  timers:{},
  counters:{},
  cooldowns:{},
  unlockedSynergies:new Set(),
  evolutions:new Set(),
  listeners:{}
};

function onSkillEvent(eventName,handler){
  if(!skillRuntime.listeners[eventName]) skillRuntime.listeners[eventName]=[];
  skillRuntime.listeners[eventName].push(handler);
}

function emitSkillEvent(eventName,payload={}){
  const handlers=skillRuntime.listeners[eventName]||[];
  for(const handler of handlers) handler(payload);
}

function resetSkillEngine(){
  skillRuntime.timers={};
  skillRuntime.counters={};
  skillRuntime.cooldowns={};
  skillRuntime.unlockedSynergies.clear();
  skillRuntime.evolutions.clear();
}

function getOwnedSkillKeys(){return Object.keys(owned).filter(key=>owned[key]>0);}

function getTagCount(tag){
  let count=0;
  for(const key of getOwnedSkillKeys()){
    const tags=skills[key]?.tags||[];
    if(tags.includes(tag)) count++;
  }
  return count;
}

function hasEvolution(id){return skillRuntime.evolutions.has(id);}
function hasSynergy(id){return skillRuntime.unlockedSynergies.has(id);}
function getEvolutionForBase(key){
  if(typeof EVOLUTIONS==="undefined")return null;
  return Object.values(EVOLUTIONS).find(e=>e.base===key)||null;
}
function isBaseEvolved(key){const evolution=getEvolutionForBase(key);return Boolean(evolution&&hasEvolution(evolution.id));}
function isSkillSelectable(key,isStarter=false){
  const skill=skills[key];
  if(!skill)return false;
  if(skillLevel(key)>=skill.max)return false;
  if(isBaseEvolved(key))return false;
  if(isStarter&&(skillLevel(key)>0||skill.starter===false))return false;
  return true;
}

function getSkillDisplayName(key){const evolved=getEvolutionForBase(key);return evolved&&hasEvolution(evolved.id)?evolved.name:skills[key].name;}
function getSkillDisplayIcon(key){const evolved=getEvolutionForBase(key);return evolved&&hasEvolution(evolved.id)?evolved.icon:skills[key].icon;}

function requirementMet(requirement){
  if(!requirement) return true;
  if(requirement.skills){
    for(const key of requirement.skills){if(skillLevel(key)<=0)return false;}
  }
  if(requirement.levels){
    for(const [key,level] of Object.entries(requirement.levels)){if(skillLevel(key)<level)return false;}
  }
  if(requirement.tags){
    for(const [tag,count] of Object.entries(requirement.tags)){if(getTagCount(tag)<count)return false;}
  }
  return true;
}

function evaluateBuildUnlocks(){
  if(typeof SYNERGIES!=="undefined"){
    for(const synergy of Object.values(SYNERGIES)){
      if(skillRuntime.unlockedSynergies.has(synergy.id)) continue;
      if(requirementMet(synergy.requires)){
        skillRuntime.unlockedSynergies.add(synergy.id);
        if(synergy.unlock) synergy.unlock();
        emitSkillEvent("build_unlock",{kind:"synergy",item:synergy});
      }
    }
  }

  if(typeof EVOLUTIONS!=="undefined"){
    for(const evolution of Object.values(EVOLUTIONS)){
      if(skillRuntime.evolutions.has(evolution.id)) continue;
      if(skillLevel(evolution.base)<skills[evolution.base].max) continue;
      if(requirementMet(evolution.requires)){
        skillRuntime.evolutions.add(evolution.id);
        if(evolution.unlock) evolution.unlock();
        emitSkillEvent("build_unlock",{kind:"evolution",item:evolution});
      }
    }
  }
}

function getRequirementProgress(requirement,candidateKey=null){
  const parts=[];
  let met=0,total=0;
  const candidateIsNew=candidateKey&&skillLevel(candidateKey)<=0;

  if(requirement?.skills){
    for(const key of requirement.skills){
      total++;
      const ok=skillLevel(key)>0||key===candidateKey;
      if(ok)met++;
      parts.push({type:"skill",key,ok,label:skills[key]?.name||key});
    }
  }
  if(requirement?.levels){
    for(const [key,level] of Object.entries(requirement.levels)){
      total++;
      const future=skillLevel(key)+(key===candidateKey?1:0);
      const ok=future>=level;
      if(ok)met++;
      parts.push({type:"level",key,ok,label:`${skills[key]?.name||key} Lv.${level}`});
    }
  }
  if(requirement?.tags){
    for(const [tag,count] of Object.entries(requirement.tags)){
      total++;
      let current=getTagCount(tag);
      if(candidateIsNew&&(skills[candidateKey]?.tags||[]).includes(tag))current++;
      const ok=current>=count;
      if(ok)met++;
      parts.push({type:"tag",tag,ok,label:`${tag} ${current}/${count}`});
    }
  }
  return{met,total,missing:parts.filter(p=>!p.ok),parts};
}

function getSkillRelationHints(key){
  const hints=[];
  if(typeof SYNERGIES!=="undefined"){
    for(const synergy of Object.values(SYNERGIES)){
      if(hasSynergy(synergy.id))continue;
      const involvesSkill=synergy.requires?.skills?.includes(key);
      if(!involvesSkill)continue;
      const progress=getRequirementProgress(synergy.requires,key);
      if(progress.met===progress.total)hints.push({type:"complete",text:`MỞ SYNERGY → ${synergy.name}`});
      else if(progress.total-progress.met<=1)hints.push({type:"near",text:`KẾT HỢP → ${synergy.name}`});
    }
  }
  if(typeof EVOLUTIONS!=="undefined"){
    for(const evolution of Object.values(EVOLUTIONS)){
      if(hasEvolution(evolution.id))continue;
      if(skillLevel(evolution.base)<=0&&evolution.base!==key)continue;
      const levelReady=skillLevel(evolution.base)+(evolution.base===key?1:0)>=skills[evolution.base].max;
      const progress=getRequirementProgress(evolution.requires,key);
      if(levelReady&&progress.met===progress.total)hints.push({type:"evolution",text:`TIẾN HÓA → ${evolution.name}`});
      else if(progress.total-progress.met<=1)hints.push({type:"evolution-near",text:`HỖ TRỢ EVOLVE → ${evolution.name}`});
    }
  }
  return hints.slice(0,2);
}

function getNearBuildUnlocks(limit=4){
  const results=[];
  if(typeof SYNERGIES!=="undefined"){
    for(const synergy of Object.values(SYNERGIES)){
      if(hasSynergy(synergy.id))continue;
      const progress=getRequirementProgress(synergy.requires);
      const missing=progress.total-progress.met;
      if(progress.met>0&&missing<=1)results.push({kind:"synergy",item:synergy,progress,priority:progress.met/progress.total});
    }
  }
  if(typeof EVOLUTIONS!=="undefined"){
    for(const evolution of Object.values(EVOLUTIONS)){
      if(hasEvolution(evolution.id)||skillLevel(evolution.base)<=0)continue;
      const progress=getRequirementProgress(evolution.requires);
      const levelRatio=skillLevel(evolution.base)/skills[evolution.base].max;
      const missing=progress.total-progress.met;
      if(levelRatio>=.5&&missing<=2)results.push({kind:"evolution",item:evolution,progress,priority:1+levelRatio});
    }
  }
  return results.sort((a,b)=>b.priority-a.priority).slice(0,limit);
}

function getPeriodicEchoChance(){
  let chance=skillLevel("timeEcho")*(.06)+.08*(skillLevel("timeEcho")>0?1:0);
  if(hasSynergy("timeLoop")) chance+=.14;
  return clamp(chance,0,.55);
}

function runSkillEngine(dt){
  for(const [key,skill] of Object.entries(skills)){
    const level=skillLevel(key);
    if(level<=0||!skill.periodic) continue;

    const cooldown=Math.max(.12,skill.periodic.cooldown(level)*player.periodicCooldownMultiplier);
    if(skillRuntime.timers[key]===undefined) skillRuntime.timers[key]=Math.min(.25,cooldown);
    skillRuntime.timers[key]-=dt;

    if(skillRuntime.timers[key]<=0){
      const didFire=skill.periodic.execute(level)!==false;
      if(didFire){
        emitSkillEvent("periodic",{skillKey:key,level});
        if(Math.random()<getPeriodicEchoChance()){
          skill.periodic.execute(level);
          emitSkillEvent("periodic_echo",{skillKey:key,level});
        }
      }
      skillRuntime.timers[key]=cooldown;
    }
  }
}

function getEffectiveAttackCooldown(){
  let multiplier=1;
  const hpRatio=player.maxHp>0?player.hp/player.maxHp:1;
  const berserk=skillLevel("berserk");
  if(berserk&&hpRatio<.40) multiplier*=Math.max(.52,1-berserk*.08);
  return Math.max(.08,player.attackCd*multiplier);
}

function getEffectiveMoveSpeed(){
  let multiplier=1;
  const hpRatio=player.maxHp>0?player.hp/player.maxHp:1;
  const lastStand=skillLevel("lastStand");
  if(lastStand&&hpRatio<.30) multiplier*=1+.10+lastStand*.07;
  return player.speed*multiplier;
}

function getOutgoingDamageMultiplier(enemy,meta={}){
  let multiplier=player.damageMultiplier;
  const hpRatio=player.maxHp>0?player.hp/player.maxHp:1;
  const berserk=skillLevel("berserk");
  if(berserk&&hpRatio<.40) multiplier*=1+.08+berserk*.08;

  const execution=skillLevel("execution");
  if(execution&&enemy&&enemy.maxHp>0){
    const threshold=.25+execution*.05;
    if(enemy.hp/enemy.maxHp<=threshold) multiplier*=1+.12+execution*.08;
  }

  if(enemy&&enemy.markedUntil>state.t){
    multiplier*=1+(enemy.markPower||.18);
  }

  const tags=meta?.tags||[];
  if(enemy?.elite)multiplier*=player.eliteDamageMultiplier;
  if(enemy?.chilled)multiplier*=player.chilledDamageMultiplier;
  if(tags.includes("SUMMON"))multiplier*=player.summonDamageMultiplier;
  if(tags.includes("CHAIN"))multiplier*=player.chainDamageMultiplier;
  if(tags.includes("AREA")||tags.includes("EXPLOSION"))multiplier*=player.areaDamageMultiplier;
  if(tags.some(tag=>["FIRE","ICE","LIGHTNING","POISON","ELEMENTAL"].includes(tag)))multiplier*=player.elementalDamageMultiplier;

  const pointBlank=skillLevel("pointBlank");
  if(pointBlank&&enemy){
    const d=dist(player,enemy);
    if(d<145)multiplier*=1+(1-d/145)*pointBlank*.12;
  }

  if(hasSynergy("frozenExecution")&&enemy?.chilled&&enemy.maxHp>0&&enemy.hp/enemy.maxHp<.45)multiplier*=1.25;
  return multiplier;
}

function getIncomingDamageMultiplier(){
  let multiplier=1-player.armor;
  const hpRatio=player.maxHp>0?player.hp/player.maxHp:1;
  const lastStand=skillLevel("lastStand");
  if(lastStand&&hpRatio<.30) multiplier*=Math.max(.50,1-(.08+lastStand*.06));
  return Math.max(.10,multiplier);
}

function getEnemyRuleModifiers(){
  const greed=skillLevel("greed");
  return{
    hp:1+greed*.12,
    damage:1+greed*.03
  };
}

function candidateSynergyWeight(key){
  const skill=skills[key];
  if(!skill) return 1;
  let weight=1;
  const ownedTags=new Set();
  for(const ownedKey of getOwnedSkillKeys()) for(const tag of skills[ownedKey].tags||[]) ownedTags.add(tag);
  for(const tag of skill.tags||[]) if(ownedTags.has(tag)) weight+=.45;

  if(typeof SYNERGIES!=="undefined"){
    for(const synergy of Object.values(SYNERGIES)){
      if(hasSynergy(synergy.id)) continue;
      if(synergy.requires?.skills?.includes(key)){
        const other=synergy.requires.skills.filter(k=>k!==key);
        if(other.every(k=>skillLevel(k)>0)) weight+=2.4;
      }
    }
  }
  return weight;
}

function weightedPick(keys){
  if(!keys.length)return null;
  const weights=keys.map(candidateSynergyWeight);
  let roll=Math.random()*weights.reduce((a,b)=>a+b,0);
  for(let i=0;i<keys.length;i++){
    roll-=weights[i];
    if(roll<=0)return keys[i];
  }
  return keys[keys.length-1];
}

function getSkillChoices(isStarter=false,count=3){
  let available=Object.keys(skills).filter(key=>isSkillSelectable(key,isStarter));
  if(!available.length)return[];

  const picks=[];
  const take=(key)=>{if(key&&!picks.includes(key)){picks.push(key);available=available.filter(k=>k!==key);}};

  if(isStarter){
    while(picks.length<Math.min(count,available.length+picks.length)) take(weightedPick(available));
    return picks;
  }

  const ownedUpgrades=available.filter(key=>skillLevel(key)>0);
  const newSkills=available.filter(key=>skillLevel(key)===0);
  if(ownedUpgrades.length) take(weightedPick(ownedUpgrades));
  if(newSkills.length&&picks.length<count) take(weightedPick(newSkills));
  while(picks.length<count&&available.length) take(weightedPick(available));
  return picks;
}

function onSkillSelectedEngine(key){
  evaluateBuildUnlocks();
  emitSkillEvent("skill_selected",{key,level:skillLevel(key)});
}

function initializeBaseSkillHooks(){
  onSkillEvent("hit",payload=>{
    if(payload.meta?.allowProcs===false||!payload.enemy)return;
    const {enemy,meta}=payload;

    const poison=skillLevel("poison");
    if(!payload.killed&&poison&&Math.random()<clamp(.18+poison*.06+player.poisonChance,0,.78)){
      applyPoison(enemy,2+poison*2.3,4.2);
    }

    const burn=skillLevel("burn");
    const fireTagged=(meta?.tags||[]).includes("FIRE");
    const burnChance=clamp(.16+burn*.06+player.burnChance+(fireTagged?.18:0),0,.85);
    if(!payload.killed&&burn&&Math.random()<burnChance){
      applyBurn(enemy,2.5+burn*2.6,3.2);
    }

    const explosive=skillLevel("explosive");
    const projectileTagged=(meta?.tags||[]).includes("PROJECTILE");
    if(explosive&&projectileTagged&&Math.random()<clamp(.10+explosive*.05+player.explosionChance,0,.65)){
      damageAreaAt(enemy.x,enemy.y,(42+explosive*7)*player.areaMultiplier,5+explosive*4,{source:"explosive",tags:["EXPLOSION","AREA"],allowProcs:false},8);
    }
  });

  onSkillEvent("kill",payload=>{
    const blood=skillLevel("blood");
    if(blood){
      const mult=hasEvolution("crimsonMoon")?2.2:1;
      healPlayer(.35*blood*mult,{source:"blood"});
      if(hasEvolution("crimsonMoon"))addShield(.6+blood*.35);
    }

    const corpse=skillLevel("corpseBurst");
    if(corpse&&Math.random()<.12+corpse*.07){
      damageAreaAt(payload.enemy.x,payload.enemy.y,(48+corpse*8)*player.areaMultiplier,6+corpse*5,{source:"corpseBurst",tags:["KILL","EXPLOSION"],allowProcs:false},12);
    }

    const soul=skillLevel("soulHarvest");
    if(soul){
      const need=Math.max(20,50-soul*5);
      skillRuntime.counters.soulKills=(skillRuntime.counters.soulKills||0)+1;
      if(skillRuntime.counters.soulKills>=need){
        skillRuntime.counters.soulKills-=need;
        player.damage+=1;
        skillRuntime.counters.soulStacks=(skillRuntime.counters.soulStacks||0)+1;
      }
    }
  });

  onSkillEvent("damage_taken",payload=>{
    const source=payload.source;
    const thorns=skillLevel("thorns");
    if(thorns&&source&&!source.dead&&(source.lastThornsAt===undefined||state.t-source.lastThornsAt>.38)){
      source.lastThornsAt=state.t;
      hitEnemy(source,3+thorns*4,10,{source:"thorns",tags:["DEFENSE","BLOOD"],allowProcs:false});
    }

    const retaliate=skillLevel("retaliate");
    if(retaliate&&(skillRuntime.cooldowns.retaliate||0)<=state.t){
      skillRuntime.cooldowns.retaliate=state.t+Math.max(.65,1.8-retaliate*.18);
      damageAreaAt(player.x,player.y,(72+retaliate*10)*player.areaMultiplier,4+retaliate*5,{source:"retaliate",tags:["DAMAGE_TAKEN","EXPLOSION"],allowProcs:false},18);
    }
  });

  onSkillEvent("xp_collected",payload=>{
    const storm=skillLevel("xpStorm");
    if(storm){
      const threshold=Math.max(5,14-storm*2);
      skillRuntime.counters.xpStorm=(skillRuntime.counters.xpStorm||0)+payload.baseAmount;
      if(skillRuntime.counters.xpStorm>=threshold){
        skillRuntime.counters.xpStorm-=threshold;
        const targets=getNearestEnemies(Math.min(6,2+storm));
        for(const enemy of targets) hitEnemy(enemy,5+storm*5,0,{source:"xpStorm",tags:["XP","LIGHTNING","CHAIN"],allowProcs:false});
      }
    }
    const nourish=skillLevel("xpHeal");
    if(nourish)healPlayer(payload.baseAmount*nourish*.08,{source:"xpHeal"});
  });

  onSkillEvent("hit",payload=>{
    const {enemy,meta}=payload;
    if(!enemy)return;
    const vamp=skillLevel("vampiricTouch");
    if(meta?.allowProcs!==false&&vamp&&!payload.killed&&Math.random()<player.healOnHitChance){
      const factor=hasSynergy("glassBlood")&&player.hp/player.maxHp<.5?2:1;
      healPlayer(player.healOnHitAmount*factor,{source:"vampiricTouch"});
    }
    const venom=skillLevel("conductiveVenom");
    if(venom&&meta?.source==="poisonDot"&&Math.random()<.08+venom*.05){
      const count=hasSynergy("plagueLightning")?2:1;
      const targets=getNearestEnemiesFrom(enemy.x,enemy.y,count,new Set([enemy]),190);
      for(const target of targets)hitEnemy(target,(4+venom*3)*(hasSynergy("plagueLightning")?1.35:1),0,{source:"conductiveVenom",tags:["POISON","LIGHTNING","DOT","CHAIN"],allowProcs:false});
    }
    if(hasSynergy("criticalStorm")&&(meta?.tags||[]).includes("LIGHTNING")&&meta?.source!=="criticalStorm"&&Math.random()<player.critChance){
      hitEnemy(enemy,payload.damage*(player.critMultiplier-1)*.55,0,{source:"criticalStorm",tags:["LIGHTNING","CRITICAL"],allowProcs:false});
    }
  });

  onSkillEvent("attack",payload=>{
    const echo=skillLevel("echoShot");
    if(!echo||!payload.target||payload.target.dead)return;
    const threshold=Math.max(2,7-echo);
    skillRuntime.counters.echoShot=(skillRuntime.counters.echoShot||0)+1;
    if(skillRuntime.counters.echoShot<threshold)return;
    skillRuntime.counters.echoShot=0;
    const baseAngle=Math.atan2(payload.target.y-player.y,payload.target.x-player.x);
    const count=hasSynergy("echoBarrage")?1+player.extraProjectiles:1;
    for(let i=0;i<count;i++){
      const offset=(i-(count-1)/2)*.13;
      createProjectile(baseAngle+offset,player.damage*.62,430,4,"echo",player.projectilePierce,{source:"echoShot",tags:["PROJECTILE","ATTACK","TIME"],allowProcs:true});
    }
  });

  onSkillEvent("kill",payload=>{
    const enemy=payload.enemy;
    const bloodShield=skillLevel("bloodShield");
    if(bloodShield)addShield(player.shieldOnKill*(hasSynergy("crimsonFortress")?1.5:1));

    const shatter=skillLevel("shatter");
    if(shatter&&enemy?.chilled&&Math.random()<.20+shatter*.10){
      damageAreaAt(enemy.x,enemy.y,(48+shatter*9)*player.areaMultiplier,(7+shatter*6)*player.areaDamageMultiplier,{source:"shatter",tags:["ICE","KILL","EXPLOSION","AREA"],allowProcs:false},10);
    }

    const combustion=skillLevel("combustion");
    if(combustion&&enemy?.statuses?.burn&&Math.random()<.18+combustion*.08){
      const scale=hasSynergy("combustionChain")?1.5:1;
      damageAreaAt(enemy.x,enemy.y,(50+combustion*8)*player.areaMultiplier,(8+combustion*6)*scale*player.areaDamageMultiplier,{source:"combustion",tags:["FIRE","KILL","EXPLOSION","AREA"],allowProcs:false},12);
    }

    const spread=skillLevel("markSpread");
    if(spread&&enemy?.markedUntil>state.t){
      const targets=getNearestEnemiesFrom(enemy.x,enemy.y,Math.min(4,spread),new Set([enemy]),190);
      for(const target of targets){target.markedUntil=state.t+4;target.markPower=Math.max(target.markPower||0,.10+spread*.04);}
    }
  });

  onSkillEvent("shield_broken",()=>{
    const pulse=skillLevel("shieldPulse");
    if(pulse)damageAreaAt(player.x,player.y,(78+pulse*12)*player.areaMultiplier,(8+pulse*8)*player.areaDamageMultiplier,{source:"shieldPulse",tags:["SHIELD","EXPLOSION","AREA","DAMAGE_TAKEN"],allowProcs:false},20);
  });

  onSkillEvent("level_up",()=>{
    const burst=skillLevel("levelBurst");
    if(burst)damageAreaAt(player.x,player.y,(100+burst*18)*player.areaMultiplier,(12+burst*10)*player.areaDamageMultiplier,{source:"levelBurst",tags:["LEVEL_UP","EXPLOSION","AREA"],allowProcs:false},24);
  });
}

initializeBaseSkillHooks();
