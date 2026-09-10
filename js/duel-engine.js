(()=>{
  const root=typeof window!=="undefined"?window:globalThis;

  const DUEL_ARENA_FLAT={
    id:"prototype-flat",
    width:1000,
    height:560,
    floorY:475,
    leftBound:54,
    rightBound:946,
    background:"prototype",
    layers:["sky","distant","floor","foreground"]
  };

  const SKILL_VALUES={
    rapid:{reduction:[.10,.19,.28]},
    power:{bonus:[3,7,12]},
    vitality:{hp:[18,38,65]},
    speed:{move:[.08,.16,.26]},
    fire:{cooldown:[4.2,3.5,2.8],damage:[18,27,38]},
    knock:{cooldown:[4.0,3.3,2.7],damage:[12,20,30],push:[55,75,100]},
    orbit:{damage:[4,6,8],interval:[.78,.67,.56]},
    heal:{regen:[.6,1.0,1.5]},
    armor:{reduction:[.07,.13,.20]},
    crit:{chance:[.08,.15,.24]},
    lightning:{cooldown:[5.0,4.1,3.3],damage:[18,29,42]},
    nova:{cooldown:[6.0,5.0,4.0],radius:[130,150,170],damage:[15,25,38]},
    frost:{radius:[150,180,210],slow:[.15,.25,.35]},
    burn:{chance:[.25,.40,.55],dps:[2,4,7]},
    barrier:{cooldown:[8,7,6],shield:[14,24,38]},
    phantomStep:{dodge:[.05,.10,.16],move:[.04,.08,.12]}
  };

  // Extensible behavior registry for Duel-only skill mechanics. New skill batches
  // register hooks here instead of wrapping the Duel loop or Survival functions.
  const SKILL_BEHAVIORS={};
  function registerDuelSkillBehavior(key,behavior){
    if(!key||!behavior||typeof behavior!=="object")return false;
    SKILL_BEHAVIORS[key]=behavior;
    return true;
  }
  function getDuelSkillBehavior(key){return SKILL_BEHAVIORS[key]||null;}

  function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
  function rankOf(build,key){return typeof getDuelSkillRank==="function"?getDuelSkillRank(build,key):Math.max(0,Math.min(3,Number(build?.[key]||0)));}
  function rankValue(key,field,rank){return rank>0?SKILL_VALUES[key]?.[field]?.[rank-1]:undefined;}
  function forEachBehavior(build,callback){
    if(!build)return;
    for(const [key,behavior] of Object.entries(SKILL_BEHAVIORS)){
      const rank=rankOf(build,key);
      if(rank>0)callback(behavior,rank,key);
    }
  }
  function runBehaviorHook(fighter,hook,context={}){
    if(!fighter)return;
    forEachBehavior(fighter.build,(behavior,rank,key)=>{
      const fn=behavior?.[hook];
      if(typeof fn==="function")fn({...context,fighter,rank,key,clamp,rankOf,rankValue});
    });
  }
  function applyBehaviorModifier(fighter,hook,value,context={}){
    let result=value;
    if(!fighter)return result;
    forEachBehavior(fighter.build,(behavior,rank,key)=>{
      const fn=behavior?.[hook];
      if(typeof fn!=="function")return;
      const next=fn({...context,fighter,rank,key,value:result,clamp,rankOf,rankValue});
      if(Number.isFinite(next))result=next;
    });
    return result;
  }

  function computeDuelStats(entry){
    const build=entry?.build||{};
    const rapid=rankOf(build,"rapid"),power=rankOf(build,"power"),vitality=rankOf(build,"vitality");
    const speed=rankOf(build,"speed"),armor=rankOf(build,"armor"),crit=rankOf(build,"crit");
    const heal=rankOf(build,"heal"),phantom=rankOf(build,"phantomStep");
    const maxHp=100+(rankValue("vitality","hp",vitality)||0);
    const moveMultiplier=1+(rankValue("speed","move",speed)||0)+(rankValue("phantomStep","move",phantom)||0);
    const profile=typeof getDuelBuildProfile==="function"?getDuelBuildProfile(build):{preferredDistance:82,style:"Hỗn hợp"};
    const stats={
      maxHp,
      baseDamage:12+(rankValue("power","bonus",power)||0),
      moveSpeed:118*moveMultiplier,
      attackCooldown:.78*(1-(rankValue("rapid","reduction",rapid)||0)),
      attackRange:78,
      armor:rankValue("armor","reduction",armor)||0,
      critChance:(rankValue("crit","chance",crit)||0),
      critMultiplier:1.6,
      dodgeChance:rankValue("phantomStep","dodge",phantom)||0,
      regen:rankValue("heal","regen",heal)||0,
      preferredDistance:profile.preferredDistance,
      style:profile.style
    };
    forEachBehavior(build,(behavior,rank,key)=>{
      if(typeof behavior.modifyStats==="function")behavior.modifyStats({entry,build,stats,rank,key,clamp,rankOf,rankValue});
    });
    stats.maxHp=Math.max(1,stats.maxHp);
    stats.attackCooldown=Math.max(.12,stats.attackCooldown);
    stats.armor=clamp(stats.armor,0,.80);
    stats.critChance=clamp(stats.critChance,0,.75);
    stats.dodgeChance=clamp(stats.dodgeChance,0,.65);
    return stats;
  }

  function initialSkillTimers(build){
    const timers={};
    for(const key of ["fire","knock","lightning","nova","barrier"]){
      const rank=rankOf(build,key);
      if(rank)timers[key]=rankValue(key,"cooldown",rank);
    }
    const orbit=rankOf(build,"orbit");
    if(orbit)timers.orbitHit=rankValue("orbit","interval",orbit);
    return timers;
  }

  function createRoundFighter(entry,side,arena){
    const stats=computeDuelStats(entry);
    const left=side==="player";
    const fighter={
      side,
      id:entry.id,
      name:entry.name,
      entry,
      build:entry.build,
      stats,
      x:left?220:780,
      y:arena.floorY,
      facing:left?1:-1,
      hp:stats.maxHp,
      maxHp:stats.maxHp,
      shield:0,
      attackTimer:0,
      dashTimer:0,
      decisionTimer:0,
      hitStun:0,
      action:"idle",
      actionUntil:0,
      skillTimers:initialSkillTimers(entry.build),
      statuses:{burnUntil:0,burnDps:0,burnTickTimer:.5},
      duelEffects:{},
      damageDealt:0,
      damageTaken:0,
      totalHealing:0,
      totalShieldGained:0
    };
    runBehaviorHook(fighter,"onCreate",{arena});
    return fighter;
  }

  function createDuelMatch(playerEntry,opponentEntry,{arena=DUEL_ARENA_FLAT,rng=Math.random}={}){
    if(!playerEntry||!opponentEntry)throw new Error("Duel match requires both fighters");
    return{
      arena:{...arena},
      rng,
      entries:{player:playerEntry,opponent:opponentEntry},
      wins:{player:0,opponent:0},
      roundNumber:0,
      currentRound:null,
      over:false,
      winner:null,
      loser:null,
      roundHistory:[]
    };
  }

  function emitDuelEvent(round,type,data={}){round.events.push({type,t:round.time,...data});}
  function drainDuelEvents(round){if(!round)return[];const events=round.events;round.events=[];return events;}

  function startDuelRound(match){
    if(match.over)return null;
    match.roundNumber++;
    const round={
      number:match.roundNumber,
      time:0,
      phase:"NORMAL",
      ended:false,
      result:null,
      events:[],
      projectiles:[],
      fighters:{
        player:createRoundFighter(match.entries.player,"player",match.arena),
        opponent:createRoundFighter(match.entries.opponent,"opponent",match.arena)
      }
    };
    match.currentRound=round;
    round.matchRng=match.rng;round.arena=match.arena;
    runBehaviorHook(round.fighters.player,"onRoundStart",{round,self:round.fighters.player,other:round.fighters.opponent,emit:(type,data)=>emitDuelEvent(round,type,data)});
    runBehaviorHook(round.fighters.opponent,"onRoundStart",{round,self:round.fighters.opponent,other:round.fighters.player,emit:(type,data)=>emitDuelEvent(round,type,data)});
    emitDuelEvent(round,"round_start",{round:round.number});
    return round;
  }

  function duelPressureDamageMultiplier(round){
    if(round.time<45)return 1;
    if(round.time<60)return 1+.75*((round.time-45)/15);
    return 2;
  }
  function duelSustainMultiplier(round){
    if(round.time<45)return 1;
    if(round.time<60)return 1-.50*((round.time-45)/15);
    return 0;
  }

  function refreshRoundPhase(round){
    const next=round.time>=60?"TỬ CHIẾN":round.time>=45?"HUYẾT CHIẾN":"NORMAL";
    if(next!==round.phase){round.phase=next;emitDuelEvent(round,"phase_change",{phase:next});}
  }

  function duelHeal(round,fighter,amount,source="heal"){
    if(!fighter||fighter.hp<=0||amount<=0)return 0;
    const scaled=amount*duelSustainMultiplier(round);
    if(scaled<=0)return 0;
    const before=fighter.hp;fighter.hp=Math.min(fighter.maxHp,fighter.hp+scaled);
    const actual=fighter.hp-before;
    if(actual>0){fighter.totalHealing+=actual;emitDuelEvent(round,"heal",{side:fighter.side,amount:actual,source,x:fighter.x,y:fighter.y-80});}
    return actual;
  }

  function duelAddShield(round,fighter,amount,source="shield"){
    if(!fighter||fighter.hp<=0||amount<=0)return 0;
    const scaled=amount*duelSustainMultiplier(round);
    if(scaled<=0)return 0;
    fighter.shield+=scaled;fighter.totalShieldGained+=scaled;
    emitDuelEvent(round,"shield_gain",{side:fighter.side,amount:scaled,source,x:fighter.x,y:fighter.y-75});
    return scaled;
  }

  function duelApplyKnockback(round,target,distance,direction){
    if(!target||distance<=0)return;
    const arena=round.arena;
    target.x=clamp(target.x+direction*distance,arena.leftBound,arena.rightBound);
    target.hitStun=Math.max(target.hitStun,.12+Math.min(.18,distance/500));
    target.action="knockback";target.actionUntil=round.time+.22;
    emitDuelEvent(round,"knockback",{side:target.side,distance,direction,x:target.x,y:target.y});
  }

  function behaviorHelpers(round){
    return{
      emit:(type,data)=>emitDuelEvent(round,type,data),
      dealDamage:(attacker,target,amount,meta={})=>duelDealDamage(round,attacker,target,amount,meta),
      heal:(fighter,amount,source)=>duelHeal(round,fighter,amount,source),
      addShield:(fighter,amount,source)=>duelAddShield(round,fighter,amount,source),
      knockback:(target,distance,direction)=>duelApplyKnockback(round,target,distance,direction),
      spawnProjectile:(owner,options)=>spawnDuelProjectile(round,owner,options)
    };
  }

  function duelDealDamage(round,attacker,target,amount,meta={}){
    if(!round||!target||target.hp<=0||amount<=0)return 0;
    const rng=round.matchRng||Math.random;
    if(meta.dodgeable!==false&&target.stats.dodgeChance>0&&rng()<target.stats.dodgeChance){
      target.action="dash";target.actionUntil=round.time+.16;
      emitDuelEvent(round,"dodge",{side:target.side,source:meta.source||"damage",x:target.x,y:target.y-65});
      return 0;
    }
    const helpers=behaviorHelpers(round);
    let damage=amount;
    if(attacker)damage=applyBehaviorModifier(attacker,"modifyOutgoingDamage",damage,{round,attacker,target,meta,...helpers});
    if(meta.ignorePressure!==true)damage*=duelPressureDamageMultiplier(round);
    let critical=false;
    if(attacker&&meta.canCrit!==false&&rng()<attacker.stats.critChance){damage*=attacker.stats.critMultiplier;critical=true;}
    if(meta.ignoreArmor!==true){
      let effectiveArmor=target.stats.armor;
      if(attacker)effectiveArmor=applyBehaviorModifier(attacker,"modifyTargetArmor",effectiveArmor,{round,attacker,target,meta,...helpers});
      damage*=Math.max(.1,1-clamp(effectiveArmor,0,.90));
    }
    damage=applyBehaviorModifier(target,"modifyIncomingDamage",damage,{round,attacker,target,meta,...helpers});
    damage=Math.max(0,damage);
    const beforeShield=target.shield;
    if(target.shield>0){const absorbed=Math.min(target.shield,damage);target.shield-=absorbed;damage-=absorbed;}
    const shieldDamage=Math.max(0,beforeShield-target.shield);
    const hpDamage=Math.max(0,Math.min(target.hp,damage));
    target.hp-=hpDamage;
    target.damageTaken+=hpDamage;
    const totalDamage=hpDamage+shieldDamage;
    if(attacker)attacker.damageDealt+=totalDamage;
    if(totalDamage>0&&target.hp<=0){
      runBehaviorHook(target,"onFatalDamage",{round,self:target,other:attacker,attacker,target,meta,hpDamage,shieldDamage,totalDamage,...helpers});
    }
    target.action=target.hp<=0?"ko":"hit";target.actionUntil=round.time+(target.hp<=0?.9:.16);
    emitDuelEvent(round,"hit",{
      source:meta.source||"attack",attacker:attacker?.side||null,target:target.side,
      amount:hpDamage,shieldDamage,critical,x:target.x,y:target.y-72
    });
    if(totalDamage>0&&target.hp>0&&meta.reactive!==false){
      runBehaviorHook(target,"onDamageTaken",{round,self:target,other:attacker,attacker,target,meta,hpDamage,shieldDamage,totalDamage,...helpers});
    }
    if(totalDamage>0&&attacker&&meta.reactive!==false){
      runBehaviorHook(attacker,"onDamageDealt",{round,self:attacker,other:target,attacker,target,meta,hpDamage,shieldDamage,totalDamage,...helpers});
    }
    if(target.hp<=0)emitDuelEvent(round,"ko",{side:target.side,source:meta.source||"attack",x:target.x,y:target.y});
    return hpDamage;
  }

  function spawnDuelProjectile(round,owner,{damage,speed=360,radius=10,source="projectile",effect=null,colorHint=null,meta={}}={}){
    const dir=owner.facing;
    const combatOwner=owner?.build?owner:(owner?.side&&round.fighters?.[owner.side])||owner;
    const projectile={
      id:`p-${round.time}-${round.projectiles.length}-${Math.floor(Math.random()*1e6)}`,
      owner:owner.side,
      x:owner.x+dir*40,
      y:owner.y-82,
      vx:dir*speed,
      radius,
      damage,
      source,
      effect,
      colorHint,
      meta:{...meta,projectile:true},
      life:2.2
    };
    runBehaviorHook(combatOwner,"modifyProjectile",{round,self:combatOwner,projectile,originOwner:owner});
    round.projectiles.push(projectile);
    emitDuelEvent(round,"projectile_spawn",{side:owner.side,source,x:projectile.x,y:projectile.y});
    return projectile;
  }

  function applyBurn(round,attacker,target,rank){
    const dps=rankValue("burn","dps",rank)||0;if(dps<=0)return;
    target.statuses.burnUntil=Math.max(target.statuses.burnUntil,round.time+3);
    target.statuses.burnDps=Math.max(target.statuses.burnDps,dps);
    target.statuses.burnSource=attacker.side;
    target.statuses.burnTickTimer=Math.min(target.statuses.burnTickTimer||.5,.5);
    emitDuelEvent(round,"status",{side:target.side,status:"burn",x:target.x,y:target.y-70});
  }

  function updateStatuses(round,self,other,dt){
    const status=self.statuses;
    if(status.burnUntil>round.time&&status.burnDps>0){
      status.burnTickTimer-=dt;
      if(status.burnTickTimer<=0){
        status.burnTickTimer+=.5;
        const source=status.burnSource==="player"?round.fighters.player:round.fighters.opponent;
        duelDealDamage(round,source,self,status.burnDps*.5,{source:"burn",elemental:true,canCrit:false,dodgeable:false,reactive:false});
      }
    }else{status.burnDps=0;status.burnSource=null;status.burnTickTimer=.5;}
  }

  function skillReady(self,key){return (self.skillTimers[key]??0)<=0;}
  function setSkillCooldown(self,key,rank){self.skillTimers[key]=rankValue(key,"cooldown",rank)||1;}

  function runDuelSkills(round,self,other,dt){
    const build=self.build;
    for(const key of Object.keys(self.skillTimers))self.skillTimers[key]-=dt;
    if(self.stats.regen>0)duelHeal(round,self,self.stats.regen*dt,"heal");
    const helpers=behaviorHelpers(round);
    runBehaviorHook(self,"update",{round,self,other,dt,...helpers});
    const distance=Math.abs(other.x-self.x);
    if(self.hitStun>0)return;

    const fire=rankOf(build,"fire");
    if(fire&&skillReady(self,"fire")&&distance<=560){
      setSkillCooldown(self,"fire",fire);
      self.action="cast";self.actionUntil=round.time+.24;
      spawnDuelProjectile(round,self,{damage:rankValue("fire","damage",fire),speed:355,radius:11,source:"fire",colorHint:"fire",meta:{elemental:true}});
      emitDuelEvent(round,"cast",{side:self.side,skill:"fire",x:self.x,y:self.y-80});
    }

    const lightning=rankOf(build,"lightning");
    if(lightning&&skillReady(self,"lightning")&&distance<=360){
      setSkillCooldown(self,"lightning",lightning);
      self.action="cast";self.actionUntil=round.time+.20;
      duelDealDamage(round,self,other,rankValue("lightning","damage",lightning),{source:"lightning",elemental:true,chain:true,canCrit:true,dodgeable:true});
      emitDuelEvent(round,"cast",{side:self.side,skill:"lightning",target:other.side,x:other.x,y:other.y-90});
    }

    const knock=rankOf(build,"knock");
    if(knock&&skillReady(self,"knock")&&distance<=140){
      setSkillCooldown(self,"knock",knock);
      self.action="cast";self.actionUntil=round.time+.18;
      duelDealDamage(round,self,other,rankValue("knock","damage",knock),{source:"knock",canCrit:false,dodgeable:true});
      duelApplyKnockback(round,other,rankValue("knock","push",knock),self.facing);
      emitDuelEvent(round,"cast",{side:self.side,skill:"knock",x:self.x+self.facing*72,y:self.y-45});
    }

    const nova=rankOf(build,"nova");
    const novaRadius=rankValue("nova","radius",nova)||0;
    if(nova&&skillReady(self,"nova")&&distance<=novaRadius){
      setSkillCooldown(self,"nova",nova);
      self.action="cast";self.actionUntil=round.time+.22;
      duelDealDamage(round,self,other,rankValue("nova","damage",nova),{source:"nova",area:true,canCrit:true,dodgeable:true});
      duelApplyKnockback(round,other,25,self.facing);
      emitDuelEvent(round,"area",{side:self.side,skill:"nova",x:self.x,y:self.y-25,radius:novaRadius});
    }

    const barrier=rankOf(build,"barrier");
    if(barrier&&skillReady(self,"barrier")){
      setSkillCooldown(self,"barrier",barrier);
      duelAddShield(round,self,rankValue("barrier","shield",barrier),"barrier");
    }

    const orbit=rankOf(build,"orbit");
    if(orbit){
      self.skillTimers.orbitHit=(self.skillTimers.orbitHit??0)-dt;
      if(self.skillTimers.orbitHit<=0&&distance<=96+orbit*5){
        self.skillTimers.orbitHit=rankValue("orbit","interval",orbit)||.7;
        duelDealDamage(round,self,other,rankValue("orbit","damage",orbit),{source:"orbit",canCrit:false,dodgeable:true});
        emitDuelEvent(round,"orbit_hit",{side:self.side,target:other.side,x:other.x,y:other.y-70,rank:orbit});
      }
    }
  }

  function getMovementSlow(self,other){
    const frost=rankOf(other.build,"frost");if(!frost)return 1;
    const distance=Math.abs(other.x-self.x);
    return distance<=rankValue("frost","radius",frost)?1-rankValue("frost","slow",frost):1;
  }

  function moveFighter(round,self,other,direction,dt,speedMultiplier=1){
    if(!direction)return;
    let behaviorMove=applyBehaviorModifier(self,"modifyMoveMultiplier",1,{round,self,other});
    behaviorMove=Math.max(.1,behaviorMove);
    const speed=self.stats.moveSpeed*getMovementSlow(self,other)*speedMultiplier*behaviorMove;
    self.x=clamp(self.x+direction*speed*dt,round.arena.leftBound,round.arena.rightBound);
    if(self.action==="idle"||self.action==="walk"||self.action==="run"){
      self.action=Math.abs(speed)>145?"run":"walk";self.actionUntil=round.time+.12;
    }
  }

  function doDash(round,self,other,direction){
    const mobility=rankOf(self.build,"phantomStep")+rankOf(self.build,"speed");
    const distance=92+Math.min(42,mobility*7);
    self.x=clamp(self.x+direction*distance,round.arena.leftBound,round.arena.rightBound);
    self.dashTimer=Math.max(2.8,4.2-mobility*.12);
    self.action="dash";self.actionUntil=round.time+.20;
    emitDuelEvent(round,"dash",{side:self.side,direction,x:self.x,y:self.y});
  }

  function doBasicAttack(round,self,other){
    if(self.attackTimer>0||Math.abs(other.x-self.x)>self.stats.attackRange)return false;
    let cooldown=applyBehaviorModifier(self,"modifyBasicAttackCooldown",self.stats.attackCooldown,{round,self,other});
    self.attackTimer=Math.max(.12,cooldown);
    self.action="melee";self.actionUntil=round.time+.22;
    const dealt=duelDealDamage(round,self,other,self.stats.baseDamage,{source:"basic",canCrit:true,dodgeable:true});
    if(dealt>0){
      const burn=rankOf(self.build,"burn");
      if(burn&&(round.matchRng||Math.random)()<(rankValue("burn","chance",burn)||0))applyBurn(round,self,other,burn);
      const helpers=behaviorHelpers(round);
      runBehaviorHook(self,"onBasicHit",{round,self,other,attacker:self,target:other,damage:dealt,...helpers});
    }
    emitDuelEvent(round,"attack_melee",{side:self.side,target:other.side,x:self.x+self.facing*48,y:self.y-70});
    return true;
  }

  function updateDuelAi(round,self,other,dt){
    self.attackTimer=Math.max(0,self.attackTimer-dt);
    self.dashTimer=Math.max(0,self.dashTimer-dt);
    self.hitStun=Math.max(0,self.hitStun-dt);
    self.decisionTimer=Math.max(0,self.decisionTimer-dt);
    self.facing=other.x>=self.x?1:-1;
    if(self.hp<=0)return;
    if(self.hitStun>0)return;

    const distance=Math.abs(other.x-self.x);
    if(doBasicAttack(round,self,other))return;
    const preferred=self.stats.preferredDistance,toward=self.facing,away=-self.facing,rng=round.matchRng||Math.random;

    if(self.decisionTimer<=0){
      self.decisionTimer=.14+rng()*.08;
      if(self.dashTimer<=0){
        if(preferred>=150&&distance<112){doDash(round,self,other,away);return;}
        if(preferred<125&&distance>175&&distance<330&&rng()<.42){doDash(round,self,other,toward);return;}
      }
    }

    if(distance>preferred+24)moveFighter(round,self,other,toward,dt,1);
    else if(distance<preferred-24)moveFighter(round,self,other,away,dt,.92);
    else if(distance>self.stats.attackRange&&preferred<125)moveFighter(round,self,other,toward,dt,.72);
    else if(round.time>=45&&distance>self.stats.attackRange)moveFighter(round,self,other,toward,dt,.86);
    else if(round.time>=self.actionUntil)self.action="idle";
  }

  function updateProjectiles(round,dt){
    const player=round.fighters.player,opponent=round.fighters.opponent;
    for(const projectile of round.projectiles){
      projectile.x+=projectile.vx*dt;projectile.life-=dt;
      const target=projectile.owner==="player"?opponent:player;
      if(target.hp<=0)continue;
      if(Math.abs(projectile.x-target.x)<=projectile.radius+24&&Math.abs(projectile.y-(target.y-70))<=80){
        const owner=projectile.owner==="player"?player:opponent;
        duelDealDamage(round,owner,target,projectile.damage,{source:projectile.source,canCrit:true,dodgeable:true,...projectile.meta,projectile:true});
        projectile.life=0;
      }
    }
    round.projectiles=round.projectiles.filter(p=>p.life>0&&p.x>round.arena.leftBound-80&&p.x<round.arena.rightBound+80);
  }

  function enforceFighterSeparation(round){
    const a=round.fighters.player,b=round.fighters.opponent,min=54;
    if(b.x-a.x>=min)return;
    const mid=(a.x+b.x)/2;
    a.x=clamp(mid-min/2,round.arena.leftBound,round.arena.rightBound-min);
    b.x=clamp(mid+min/2,round.arena.leftBound+min,round.arena.rightBound);
  }

  function checkRoundEnd(round){
    if(round.ended)return;
    const p=round.fighters.player,o=round.fighters.opponent;
    if(p.hp>0&&o.hp>0)return;
    round.ended=true;
    if(p.hp<=0&&o.hp<=0)round.result={winner:"draw",reason:"DOUBLE_KO"};
    else if(o.hp<=0)round.result={winner:"player",reason:"KO"};
    else round.result={winner:"opponent",reason:"KO"};
    emitDuelEvent(round,"round_end",{...round.result});
  }

  function updateDuelRound(match,dt){
    const round=match?.currentRound;
    if(!round||round.ended||match.over)return round;
    const safeDt=Math.max(0,Math.min(.033,dt));
    round.matchRng=match.rng;round.arena=match.arena;round.time+=safeDt;refreshRoundPhase(round);
    const p=round.fighters.player,o=round.fighters.opponent;
    updateStatuses(round,p,o,safeDt);updateStatuses(round,o,p,safeDt);
    runDuelSkills(round,p,o,safeDt);runDuelSkills(round,o,p,safeDt);
    updateDuelAi(round,p,o,safeDt);updateDuelAi(round,o,p,safeDt);
    enforceFighterSeparation(round);updateProjectiles(round,safeDt);checkRoundEnd(round);
    return round;
  }

  function settleDuelRound(match){
    const round=match?.currentRound;
    if(!round?.ended||match.over)return{status:"noop"};
    match.roundHistory.push({round:round.number,result:{...round.result},time:round.time});
    if(round.result.winner==="draw"){
      match.roundNumber=Math.max(0,match.roundNumber-1);startDuelRound(match);return{status:"replay"};
    }
    match.wins[round.result.winner]++;
    if(match.wins[round.result.winner]>=2){
      match.over=true;match.winner=round.result.winner;match.loser=match.winner==="player"?"opponent":"player";
      return{status:"match_end",winner:match.winner,wins:{...match.wins}};
    }
    startDuelRound(match);return{status:"next_round",wins:{...match.wins},round:match.roundNumber};
  }

  root.DUEL_ARENA_FLAT=DUEL_ARENA_FLAT;
  root.DUEL_SKILL_VALUES=SKILL_VALUES;
  root.DUEL_SKILL_BEHAVIORS=SKILL_BEHAVIORS;
  root.registerDuelSkillBehavior=registerDuelSkillBehavior;
  root.getDuelSkillBehavior=getDuelSkillBehavior;
  root.computeDuelStats=computeDuelStats;
  root.createDuelMatch=createDuelMatch;
  root.startDuelRound=startDuelRound;
  root.updateDuelRound=updateDuelRound;
  root.settleDuelRound=settleDuelRound;
  root.drainDuelEvents=drainDuelEvents;
  root.duelPressureDamageMultiplier=duelPressureDamageMultiplier;
  root.duelSustainMultiplier=duelSustainMultiplier;
})();
