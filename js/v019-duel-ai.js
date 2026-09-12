(()=>{
  const root=typeof window!=="undefined"?window:globalThis;
  if(typeof root.updateDuelRound!=="function")return;

  const legacyUpdateDuelRound=root.updateDuelRound;
  const roundBrains=new WeakMap();
  const TACTICS=["ENGAGE","PRESSURE","SPACE","DISENGAGE","CENTER_RESET","CORNER_ESCAPE","FINISH"];
  const OFFENSIVE_TIMERS=new Set([
    "fire","knock","lightning","nova","orbitHit","meteor","poison","blackHole","sacrifice","execution",
    "chainLightning","bladeWave","bloodNova","iceLance","thunderField","chaosOrb","echoShot"
  ]);

  function clampValue(v,a,b){return Math.max(a,Math.min(b,v));}
  function profileOf(fighter){
    if(typeof root.getDuelBuildProfile==="function")return root.getDuelBuildProfile(fighter.build||{});
    const preferred=Number(fighter?.stats?.preferredDistance)||82;
    return{ranged:preferred>=150?2:0,melee:preferred<125?2:0,defense:0,control:0,mobility:0,summon:0,totalRanks:1,preferredDistance:preferred,style:fighter?.stats?.style||"Hỗn hợp"};
  }
  function normalizedProfile(profile){
    const combat=Math.max(1,(profile.ranged||0)+(profile.melee||0));
    const total=Math.max(1,profile.totalRanks||combat);
    return{
      ranged:clampValue((profile.ranged||0)/combat,0,1),
      melee:clampValue((profile.melee||0)/combat,0,1),
      defense:clampValue((profile.defense||0)/total,0,1),
      control:clampValue((profile.control||0)/total,0,1),
      mobility:clampValue((profile.mobility||0)/total,0,1)
    };
  }
  function pseudoRandom01(side,count,roundNumber=1){
    const seed=(side==="player"?17.17:53.53)+count*12.9898+roundNumber*7.233;
    const value=Math.sin(seed)*43758.5453123;
    return value-Math.floor(value);
  }
  function makeFighterBrain(fighter){
    return{
      side:fighter.side,
      tactic:"ENGAGE",
      previousTactic:"ENGAGE",
      targetX:fighter.x,
      nextDecisionAt:0,
      commitUntil:0,
      spaceUntil:0,
      cornerReleaseUntil:0,
      wasOwnCorner:false,
      scores:Object.fromEntries(TACTICS.map(key=>[key,0])),
      perception:null,
      decisions:0,
      tacticTransitions:0,
      spacingCycles:0,
      cornerEscapes:0,
      cornerTime:0,
      opponentCornerPressureTime:0,
      stationaryCloseTime:0,
      movingCloseTime:0,
      lastX:fighter.x,
      lastSampleAt:0,
      recentMove:0,
      dashes:0,
      lastAttackAt:-Infinity
    };
  }
  function brainForRound(round){
    let brain=roundBrains.get(round);
    if(!brain){
      brain={
        player:makeFighterBrain(round.fighters.player),
        opponent:makeFighterBrain(round.fighters.opponent),
        version:"V0.19",
        roundNumber:round.number
      };
      roundBrains.set(round,brain);
    }
    return brain;
  }
  function wallInfo(arena,x){
    const left=x-arena.leftBound,right=arena.rightBound-x;
    return{left,right,distance:Math.min(left,right),side:left<right?"left":"right"};
  }
  function offensiveReadiness(fighter){
    let readySkills=0,soonest=Infinity;
    for(const [key,value] of Object.entries(fighter.skillTimers||{})){
      if(!OFFENSIVE_TIMERS.has(key))continue;
      const timer=Math.max(0,Number(value)||0);
      soonest=Math.min(soonest,timer);
      if(timer<=.08)readySkills++;
    }
    const attackTimer=Math.max(0,Number(fighter.attackTimer)||0);
    const attackReady=attackTimer<=.08;
    return{
      attackTimer,
      attackReady,
      readySkills,
      soonestSkill:Number.isFinite(soonest)?soonest:null,
      offenseReady:attackReady||readySkills>0,
      cooling:attackTimer>.18&&readySkills===0
    };
  }
  function perceive(round,self,other,brain){
    const arena=round.arena;
    const ownWall=wallInfo(arena,self.x),otherWall=wallInfo(arena,other.x);
    const center=(arena.leftBound+arena.rightBound)/2;
    const distance=Math.abs(other.x-self.x);
    const profile=profileOf(self),weights=normalizedProfile(profile);
    const readiness=offensiveReadiness(self);
    const opponentReadiness=offensiveReadiness(other);
    const preferred=clampValue(Number(self.stats.preferredDistance)||profile.preferredDistance||82,68,270);
    const hpRatio=clampValue(self.hp/Math.max(1,self.maxHp),0,1);
    const opponentHpRatio=clampValue(other.hp/Math.max(1,other.maxHp),0,1);
    const ownCorner=ownWall.distance<112;
    const opponentCorner=otherWall.distance<112;
    const postBurst=round.time<brain.spaceUntil;
    const cornerLock=opponentCorner&&distance<Math.max(96,self.stats.attackRange+22);
    return{
      distance,preferred,hpRatio,opponentHpRatio,ownWall,otherWall,center,
      centerDistance:Math.abs(self.x-center),opponentCenterDistance:Math.abs(other.x-center),
      ownCorner,opponentCorner,cornerLock,postBurst,
      attackReady:readiness.attackReady,readySkills:readiness.readySkills,soonestSkill:readiness.soonestSkill,
      offenseReady:readiness.offenseReady,cooling:readiness.cooling,
      opponentOffenseReady:opponentReadiness.offenseReady,
      profile,weights,
      attackRange:Number(self.stats.attackRange)||78,
      moveSpeed:Number(self.stats.moveSpeed)||118,
      sideDirection:self.x<=other.x?-1:1
    };
  }
  function scoreTactics(round,self,other,brain,p){
    const desired=Math.max(p.attackRange*.92,p.preferred);
    const tooFar=clampValue((p.distance-desired)/220,0,1);
    const tooClose=clampValue((desired-p.distance)/Math.max(70,desired),0,1);
    const wallRisk=clampValue((135-p.ownWall.distance)/135,0,1);
    const oppWallPressure=clampValue((145-p.otherWall.distance)/145,0,1);
    const lowHp=clampValue((.48-p.hpRatio)/.38,0,1);
    const opponentLow=clampValue((.34-p.opponentHpRatio)/.30,0,1);
    const cooldownPressure=p.cooling?1:0;
    const centerNeed=clampValue(p.centerDistance/390,0,1);
    const finishReach=clampValue((p.preferred+150-p.distance)/180,0,1);
    const releaseActive=round.time<brain.cornerReleaseUntil;

    const scores={
      ENGAGE:
        .35+tooFar*1.55+(p.offenseReady?.40:0)+p.weights.melee*.30+p.weights.mobility*.18-
        wallRisk*.16-p.postBurst*.95,
      PRESSURE:
        .12+oppWallPressure*1.35+(p.offenseReady?.72:-.25)+p.weights.melee*.46+
        opponentLow*.55-tooClose*.30-cooldownPressure*.68-p.postBurst*.95,
      SPACE:
        .18+tooClose*1.45+p.weights.ranged*.82+cooldownPressure*.72+(p.postBurst?1.75:0)+
        (p.cornerLock&&!p.offenseReady?1.45:0)+wallRisk*.22,
      DISENGAGE:
        .05+lowHp*1.15+tooClose*.58+cooldownPressure*.36+p.weights.ranged*.24,
      CENTER_RESET:
        .10+wallRisk*1.35+centerNeed*.38+cooldownPressure*.42+
        (p.opponentCorner&&!p.offenseReady?.95:0)+(releaseActive?2.2:0),
      CORNER_ESCAPE:
        .02+wallRisk*2.45+(p.ownCorner?2.75:0)+tooClose*.62+
        (p.ownCorner&&p.opponentOffenseReady?.55:0),
      FINISH:
        .02+opponentLow*1.95+finishReach*.45+(p.offenseReady?.85:-.42)+p.weights.melee*.18
    };

    if(p.ownCorner&&p.distance<165)scores.CORNER_ESCAPE+=2.2;
    if(releaseActive){scores.SPACE+=1.1;scores.PRESSURE-=1.4;scores.ENGAGE-=.65;}
    if(round.time>=45){scores.FINISH+=.28;scores.ENGAGE+=.16;scores.DISENGAGE-=.14;}
    if(round.time>=60){scores.FINISH+=.45;scores.PRESSURE+=.28;scores.SPACE-=.12;}
    if(brain.tactic&&round.time<brain.commitUntil)scores[brain.tactic]+=.34;
    return scores;
  }
  function targetForTactic(round,self,other,tactic,p){
    const arena=round.arena;
    const margin=82;
    const minX=arena.leftBound+margin,maxX=arena.rightBound-margin;
    const center=p.center;
    const side=self.x<=other.x?-1:1;
    const desiredRange=clampValue(p.preferred,Math.max(68,p.attackRange*.92),255);
    let target=self.x;
    if(tactic==="CORNER_ESCAPE"||tactic==="CENTER_RESET")target=center;
    else if(tactic==="SPACE"||tactic==="DISENGAGE"){
      target=other.x+side*Math.max(desiredRange,p.weights.ranged>.55?175:128);
      target=clampValue(target,minX,maxX);
      if(p.ownCorner&&Math.abs(target-self.x)<26)target=center;
    }else if(tactic==="PRESSURE"||tactic==="FINISH"){
      target=other.x+side*Math.max(64,p.attackRange*.82);
    }else{
      target=other.x+side*desiredRange;
    }
    return clampValue(target,minX,maxX);
  }
  function chooseTactic(round,self,other,brain,p){
    const scores=scoreTactics(round,self,other,brain,p);
    brain.scores=scores;
    brain.perception=p;
    let best=brain.tactic,bestScore=scores[best]??-Infinity;
    for(const tactic of TACTICS){
      if(scores[tactic]>bestScore+.0001){best=tactic;bestScore=scores[tactic];}
    }
    const emergency=p.ownCorner&&p.distance<165;
    if(!emergency&&round.time<brain.commitUntil&&(scores[brain.tactic]??-Infinity)>=bestScore-.22)best=brain.tactic;
    if(best!==brain.tactic){
      brain.previousTactic=brain.tactic;
      brain.tactic=best;
      brain.tacticTransitions++;
      if(best==="SPACE"&&["ENGAGE","PRESSURE","FINISH"].includes(brain.previousTactic))brain.spacingCycles++;
      if(best==="CORNER_ESCAPE")brain.cornerEscapes++;
    }
    brain.targetX=targetForTactic(round,self,other,best,p);
    brain.decisions++;
    const jitter=pseudoRandom01(self.side,brain.decisions,round.number);
    const cadence=emergency?.08+jitter*.06:.18+jitter*.14;
    const commitment=best==="CORNER_ESCAPE"?.28:best==="FINISH"?.32:best==="SPACE"?.34:best==="CENTER_RESET"?.42:.38;
    brain.nextDecisionAt=round.time+cadence;
    brain.commitUntil=round.time+commitment;
  }
  function updateMetrics(round,self,other,brain,dt){
    const moved=Math.abs(self.x-brain.lastX);
    brain.recentMove=moved;
    const ownWall=wallInfo(round.arena,self.x);
    const otherWall=wallInfo(round.arena,other.x);
    const distance=Math.abs(other.x-self.x);
    if(ownWall.distance<112)brain.cornerTime+=dt;
    if(otherWall.distance<112)brain.opponentCornerPressureTime+=dt;
    if(distance<96){
      if(moved<.30)brain.stationaryCloseTime+=dt;
      else brain.movingCloseTime+=dt;
    }
    brain.lastX=self.x;
    brain.lastSampleAt=round.time;
  }
  function movementDirective(self,other,brain){
    const delta=brain.targetX-self.x;
    if(Math.abs(delta)<7)return 0;
    return delta>0?1:-1;
  }
  function shouldTacticalDash(round,self,other,brain,p,direction){
    if(!direction||self.dashTimer>0||self.hitStun>0)return false;
    const toward=other.x>=self.x?1:-1;
    const distance=p.distance;
    if((brain.tactic==="SPACE"||brain.tactic==="DISENGAGE"||brain.tactic==="CENTER_RESET")&&direction!==toward&&distance<205)return true;
    if(brain.tactic==="CORNER_ESCAPE"&&direction!==toward)return true;
    if((brain.tactic==="ENGAGE"||brain.tactic==="FINISH")&&p.weights.melee>.52&&direction===toward&&distance>190&&distance<350)return true;
    return false;
  }
  function doTacticalDash(round,self,direction,brain){
    const mobility=(typeof root.getDuelSkillRank==="function"?(root.getDuelSkillRank(self.build,"phantomStep")+root.getDuelSkillRank(self.build,"speed")):0);
    const distance=92+Math.min(42,mobility*7);
    self.x=clampValue(self.x+direction*distance,round.arena.leftBound,round.arena.rightBound);
    self.dashTimer=Math.max(2.8,4.2-mobility*.12);
    self.action="dash";self.actionUntil=round.time+.20;
    round.events.push({type:"dash",t:round.time,side:self.side,direction,x:self.x,y:self.y,v019:true});
    brain.dashes++;
  }
  function applyLegacySteeringControl(round,self,other,brain){
    const p=brain.perception||perceive(round,self,other,brain);
    const direction=movementDirective(self,other,brain);
    if(shouldTacticalDash(round,self,other,brain,p,direction))doTacticalDash(round,self,direction,brain);
    const toward=other.x>=self.x?1:-1;
    const distance=Math.abs(other.x-self.x);
    const originalPreferred=self.stats.preferredDistance;
    const originalDash=self.dashTimer;
    const originalDecision=self.decisionTimer;
    let forcedPreferred=distance;
    if(direction===toward)forcedPreferred=0;
    else if(direction===-toward)forcedPreferred=1000;
    self.stats.preferredDistance=forcedPreferred;
    // Disable the legacy random dash. V0.19 owns dash decisions but still lets
    // legacy moveFighter execute walking/running with all existing slow/modifier hooks.
    self.dashTimer=999;
    self.decisionTimer=999;
    return()=>{
      self.stats.preferredDistance=originalPreferred;
      self.dashTimer=Math.max(0,originalDash-Math.max(0,Math.min(.033,round._v019Dt||0)));
      self.decisionTimer=originalDecision;
    };
  }
  function enforceSeparation(round){
    const a=round.fighters.player,b=round.fighters.opponent,min=54;
    if(b.x-a.x>=min)return;
    const mid=(a.x+b.x)/2;
    a.x=clampValue(mid-min/2,round.arena.leftBound,round.arena.rightBound-min);
    b.x=clampValue(mid+min/2,round.arena.leftBound+min,round.arena.rightBound);
  }
  function preTick(round,dt){
    const brains=brainForRound(round);
    const p=round.fighters.player,o=round.fighters.opponent;
    updateMetrics(round,p,o,brains.player,dt);
    updateMetrics(round,o,p,brains.opponent,dt);

    for(const [self,other,brain] of [[p,o,brains.player],[o,p,brains.opponent]]){
      const perception=perceive(round,self,other,brain);
      brain.perception=perception;
      const enteredCorner=perception.ownCorner&&!brain.wasOwnCorner;
      brain.wasOwnCorner=perception.ownCorner;
      if(enteredCorner)brain.nextDecisionAt=Math.min(brain.nextDecisionAt,round.time);
      // Release pressure in bounded windows. Re-arm only after the previous
      // release window expires; otherwise a cornered exchange would force a
      // fresh utility decision every render frame.
      if(perception.cornerLock&&perception.cooling&&round.time>=brain.cornerReleaseUntil){
        brain.cornerReleaseUntil=round.time+.48;
        brain.nextDecisionAt=Math.min(brain.nextDecisionAt,round.time);
      }
      if(round.time>=brain.nextDecisionAt)chooseTactic(round,self,other,brain,perception);
    }
    const restoreP=applyLegacySteeringControl(round,p,o,brains.player);
    const restoreO=applyLegacySteeringControl(round,o,p,brains.opponent);
    return{brains,restoreP,restoreO,eventStart:round.events.length,attackBefore:{player:p.attackTimer,opponent:o.attackTimer}};
  }
  function postTick(round,context){
    context.restoreP();context.restoreO();
    const newEvents=round.events.slice(context.eventStart);
    for(const event of newEvents){
      if(event.type!=="attack_melee"||!event.side)continue;
      const brain=context.brains[event.side];
      const fighter=round.fighters[event.side];
      const profile=normalizedProfile(profileOf(fighter));
      brain.lastAttackAt=round.time;
      brain.spaceUntil=Math.max(brain.spaceUntil,round.time+(profile.ranged>.55?.44:.28));
      brain.nextDecisionAt=Math.min(brain.nextDecisionAt,round.time);
    }
    enforceSeparation(round);
  }

  root.updateDuelRound=function v019UpdateDuelRound(match,dt){
    const round=match?.currentRound;
    if(!round||round.ended||match.over)return legacyUpdateDuelRound(match,dt);
    const safeDt=Math.max(0,Math.min(.033,Number(dt)||0));
    round._v019Dt=safeDt;
    const context=preTick(round,safeDt);
    const result=legacyUpdateDuelRound(match,dt);
    postTick(round,context);
    delete round._v019Dt;
    return result;
  };

  root.getDuelAIDiagnostics=function(input){
    const round=input?.currentRound||input;
    if(!round||!round.fighters)return null;
    const brains=brainForRound(round);
    const view=brain=>({
      tactic:brain.tactic,previousTactic:brain.previousTactic,targetX:brain.targetX,
      scores:{...brain.scores},perception:brain.perception?{
        distance:brain.perception.distance,preferred:brain.perception.preferred,
        hpRatio:brain.perception.hpRatio,opponentHpRatio:brain.perception.opponentHpRatio,
        ownWallDistance:brain.perception.ownWall.distance,opponentWallDistance:brain.perception.otherWall.distance,
        ownCorner:brain.perception.ownCorner,opponentCorner:brain.perception.opponentCorner,
        offenseReady:brain.perception.offenseReady,cooling:brain.perception.cooling,
        style:brain.perception.profile.style,weights:{...brain.perception.weights}
      }:null,
      decisions:brain.decisions,tacticTransitions:brain.tacticTransitions,
      spacingCycles:brain.spacingCycles,cornerEscapes:brain.cornerEscapes,dashes:brain.dashes,
      cornerTime:brain.cornerTime,opponentCornerPressureTime:brain.opponentCornerPressureTime,
      stationaryCloseTime:brain.stationaryCloseTime,movingCloseTime:brain.movingCloseTime,
      nextDecisionIn:Math.max(0,brain.nextDecisionAt-round.time),commitRemaining:Math.max(0,brain.commitUntil-round.time)
    });
    return{version:"V0.19",round:round.number,time:round.time,player:view(brains.player),opponent:view(brains.opponent)};
  };
})();
