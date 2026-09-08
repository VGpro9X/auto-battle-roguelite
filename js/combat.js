function spawnEnemy(){
  const side=Math.floor(Math.random()*4);
  let x,y;
  if(side===0){x=rand(-30,W+30);y=-25;}
  if(side===1){x=W+25;y=rand(-30,H+30);}
  if(side===2){x=rand(-30,W+30);y=H+25;}
  if(side===3){x=-25;y=rand(-30,H+30);}

  const difficulty=getDifficultyProfile();
  const rule=getEnemyRuleModifiers();
  const elite=Math.random()<difficulty.eliteChance;
  const hp=(elite?54:25)*difficulty.hpScale*rule.hp;

  state.enemies.push({
    x,y,r:elite?18:12,
    hp,maxHp:hp,
    speed:(elite?34:48)*rand(.85,1.15)*difficulty.speedScale,
    dmg:(elite?15:8)*difficulty.damageScale*rule.damage,
    hit:0,elite,dead:false,statuses:{},markedUntil:0,markPower:0
  });
}

function getSpawnCooldown(){return getDifficultyProfile().spawnCooldown;}

function nearestEnemy(){
  let best=null,bestDistance=Infinity;
  for(const enemy of state.enemies){
    if(enemy.dead)continue;
    const d=dist(player,enemy);
    if(d<bestDistance){bestDistance=d;best=enemy;}
  }
  return[best,bestDistance];
}

function getNearestEnemies(limit){
  return state.enemies.filter(e=>!e.dead).map(enemy=>({enemy,d:dist(player,enemy)})).sort((a,b)=>a.d-b.d).slice(0,limit).map(e=>e.enemy);
}

function getNearestEnemiesFrom(x,y,limit,exclude=new Set(),maxDistance=Infinity){
  return state.enemies.filter(e=>!e.dead&&!exclude.has(e)).map(enemy=>({enemy,d:Math.hypot(enemy.x-x,enemy.y-y)})).filter(e=>e.d<=maxDistance).sort((a,b)=>a.d-b.d).slice(0,limit).map(e=>e.enemy);
}

function findNearestEnemyFrom(x,y,exclude=new Set(),maxDistance=Infinity){
  return getNearestEnemiesFrom(x,y,1,exclude,maxDistance)[0]||null;
}

function getRandomEnemies(limit){
  const living=state.enemies.filter(e=>!e.dead);
  for(let i=living.length-1;i>0;i--){const j=(Math.random()*(i+1))|0;[living[i],living[j]]=[living[j],living[i]];}
  return living.slice(0,limit);
}

function randomEnemy(){const living=state.enemies.filter(enemy=>!enemy.dead);return living.length?living[(Math.random()*living.length)|0]:null;}

function createProjectile(angle,damage,speed=430,radius=4,type="normal",pierce=0,meta={}){
  const actualSpeed=speed*player.projectileSpeedMultiplier;
  state.projectiles.push({
    x:player.x,y:player.y,
    vx:Math.cos(angle)*actualSpeed,vy:Math.sin(angle)*actualSpeed,
    r:radius,damage,life:2,type,
    hitsRemaining:1+Math.max(0,pierce),
    ricochetsRemaining:type==="normal"?player.projectileRicochet:0,
    hitEnemies:new Set(),
    meta:{source:type,tags:["PROJECTILE"],...meta}
  });
}

function createProjectileFrom(x,y,target,damage,speed=430,radius=4,type="normal",pierce=0,meta={}){
  const angle=Math.atan2(target.y-y,target.x-x);
  const actualSpeed=speed*player.projectileSpeedMultiplier;
  state.projectiles.push({
    x,y,vx:Math.cos(angle)*actualSpeed,vy:Math.sin(angle)*actualSpeed,
    r:radius,damage,life:1.6,type,hitsRemaining:1+Math.max(0,pierce),ricochetsRemaining:0,hitEnemies:new Set(),
    meta:{source:type,tags:["PROJECTILE"],...meta}
  });
}

function shoot(target,damage,speed=430,radius=4,type="normal",meta={}){
  const angle=Math.atan2(target.y-player.y,target.x-player.x);
  const pierce=type==="normal"?player.projectilePierce:0;
  createProjectile(angle,damage,speed,radius,type,pierce,meta);
}

function rollAttackDamage(baseDamage){
  const crit=Math.random()<player.critChance;
  return{damage:crit?baseDamage*player.critMultiplier:baseDamage,crit};
}

function fireNormalAttack(target){
  const baseAngle=Math.atan2(target.y-player.y,target.x-player.x);
  const count=1+player.extraProjectiles;
  const spread=.15;
  const damageFactor=count>1?.82:1;
  for(let i=0;i<count;i++){
    const offset=(i-(count-1)/2)*spread;
    const roll=rollAttackDamage(player.damage*damageFactor);
    createProjectile(baseAngle+offset,roll.damage,430,4,"normal",player.projectilePierce,{source:"normal",tags:["PROJECTILE","ATTACK"],crit:roll.crit});
  }
  emitSkillEvent("attack",{target,count});
}

function healPlayer(amount,meta={}){
  if(amount<=0||player.hp<=0)return 0;
  const before=player.hp;
  player.hp=Math.min(player.maxHp,player.hp+amount);
  const healed=player.hp-before;
  if(healed>0)emitSkillEvent("heal",{amount:healed,meta});
  return healed;
}

function addShield(amount){
  player.shield=Math.min(player.maxHp*.85,player.shield+Math.max(0,amount));
}

function damagePlayer(amount,meta={}){
  if(amount<=0||player.hp<=0)return 0;
  if(Math.random()<player.dodgeChance){emitSkillEvent("dodge",{amount,meta});return 0;}

  let remaining=amount*getIncomingDamageMultiplier(meta);
  const hadShield=player.shield>0;
  if(player.shield>0){
    const absorbed=Math.min(player.shield,remaining);
    player.shield-=absorbed;
    remaining-=absorbed;
    if(hadShield&&player.shield<=0)emitSkillEvent("shield_broken",{absorbed,meta});
  }
  if(remaining<=0)return 0;
  player.hp-=remaining;
  emitSkillEvent("damage_taken",{amount:remaining,source:meta.source||null,meta});

  if(player.hp<=0&&player.reviveCharges>0){
    player.reviveCharges--;
    player.hp=Math.max(1,player.maxHp*(.24+.06*skillLevel("secondWind")));
    emitSkillEvent("revive",{chargesLeft:player.reviveCharges});
  }
  return remaining;
}
function applyPoison(enemy,dps,duration){
  if(!enemy||enemy.dead)return;
  const current=enemy.statuses.poison;
  enemy.statuses.poison={dps:Math.max(dps,current?.dps||0),until:Math.max(state.t+duration,current?.until||0)};
}

function applyBurn(enemy,dps,duration){
  if(!enemy||enemy.dead)return;
  const current=enemy.statuses.burn;
  enemy.statuses.burn={dps:Math.max(dps,current?.dps||0),until:Math.max(state.t+duration,current?.until||0)};
}

function updateEnemyStatuses(dt){
  for(const enemy of state.enemies){
    if(enemy.dead)continue;
    const poison=enemy.statuses?.poison;
    if(poison){
      if(poison.until<=state.t)delete enemy.statuses.poison;
      else hitEnemy(enemy,poison.dps*dt,0,{source:"poisonDot",tags:["POISON","DOT"],allowProcs:false});
    }
    if(enemy.dead)continue;
    const burn=enemy.statuses?.burn;
    if(burn){
      if(burn.until<=state.t)delete enemy.statuses.burn;
      else hitEnemy(enemy,burn.dps*dt,0,{source:"burnDot",tags:["FIRE","DOT"],allowProcs:false});
    }
  }
}

function damageAreaAt(x,y,radius,damage,meta={},knockback=0){
  let hits=0;
  for(const enemy of [...state.enemies]){
    if(enemy.dead)continue;
    if(Math.hypot(enemy.x-x,enemy.y-y)<=radius+enemy.r){
      hitEnemy(enemy,damage,knockback,meta);hits++;
    }
  }
  return hits;
}

function hitEnemy(enemy,damage,knockback=0,meta={}){
  if(!enemy||enemy.dead)return false;
  const dealt=Math.max(0,damage*getOutgoingDamageMultiplier(enemy,meta));
  enemy.hp-=dealt;
  enemy.hit=.08;

  if(knockback){
    const dx=enemy.x-player.x,dy=enemy.y-player.y,m=Math.hypot(dx,dy)||1;
    enemy.x+=dx/m*knockback;enemy.y+=dy/m*knockback;
  }

  if(settings.particles){
    for(let i=0;i<4;i++)state.particles.push({x:enemy.x,y:enemy.y,vx:rand(-55,55),vy:rand(-55,55),life:.35,r:2});
  }

  const killed=enemy.hp<=0;
  if(killed) enemy.dead=true;
  emitSkillEvent("hit",{enemy,damage:dealt,meta,killed});

  if(killed){
    state.kills++;
    if(enemy.elite)state.eliteKills++;
    emitSkillEvent("kill",{enemy,meta});
    let gemXp=enemy.elite?4:1;
    const bounty=skillLevel("bountyMark");
    if(bounty&&enemy.markedUntil>state.t)gemXp*=1+bounty*.20+(hasSynergy("markedBounty")?.25:0);
    state.gems.push({x:enemy.x,y:enemy.y,r:5,xp:gemXp});
    return true;
  }
  return false;
}

function gainXp(amount){
  const gained=amount*player.xpMultiplier;
  player.xp+=gained;
  emitSkillEvent("xp_collected",{baseAmount:amount,amount:gained});
  while(player.xp>=player.xpNeed&&!state.gameOver){
    player.xp-=player.xpNeed;
    player.level++;
    player.xpNeed=getXpNeed(player.level);
    emitSkillEvent("level_up",{level:player.level});
    showLevelUp(false);
    break;
  }
}

function fireChaosOrb(enemy,level){
  const variants=["fire","ice","lightning","poison","explosion"];
  const variant=variants[(Math.random()*variants.length)|0];
  if(variant==="lightning"){
    const targets=getNearestEnemies(Math.min(4,1+level));
    for(const target of targets)hitEnemy(target,7+level*6,0,{source:"chaosOrb",tags:["RANDOM","LIGHTNING","CHAIN","PERIODIC"]});
    return;
  }
  if(variant==="explosion"){
    damageAreaAt(enemy.x,enemy.y,(55+level*7)*player.areaMultiplier,9+level*5,{source:"chaosOrb",tags:["RANDOM","EXPLOSION","AREA","PERIODIC"]},10);
    return;
  }
  const angle=Math.atan2(enemy.y-player.y,enemy.x-player.x);
  createProjectile(angle,9+level*5,330,6,"chaos",0,{source:"chaosOrb",tags:["RANDOM","PROJECTILE","PERIODIC",variant.toUpperCase()],chaosVariant:variant});
}
