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

function getSkillDisplayName(key){
  const evolved=typeof EVOLUTIONS!=="undefined"?Object.values(EVOLUTIONS).find(e=>e.base===key&&hasEvolution(e.id)):null;
  return evolved?evolved.name:skills[key].name;
}

function getSkillDisplayIcon(key){
  const evolved=typeof EVOLUTIONS!=="undefined"?Object.values(EVOLUTIONS).find(e=>e.base===key&&hasEvolution(e.id)):null;
  return evolved?.icon||skills[key].icon;
}

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
      }
    }
  }
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
  let available=Object.keys(skills).filter(key=>skillLevel(key)<skills[key].max);
  if(isStarter) available=available.filter(key=>skillLevel(key)===0&&skills[key].starter!==false);
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
    if(blood) healPlayer(.35*blood,{source:"blood"});

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
    if(!storm)return;
    const threshold=Math.max(5,14-storm*2);
    skillRuntime.counters.xpStorm=(skillRuntime.counters.xpStorm||0)+payload.baseAmount;
    if(skillRuntime.counters.xpStorm>=threshold){
      skillRuntime.counters.xpStorm-=threshold;
      const targets=getNearestEnemies(Math.min(6,2+storm));
      for(const enemy of targets) hitEnemy(enemy,5+storm*5,0,{source:"xpStorm",tags:["XP","LIGHTNING","CHAIN"],allowProcs:false});
    }
  });
}

initializeBaseSkillHooks();
