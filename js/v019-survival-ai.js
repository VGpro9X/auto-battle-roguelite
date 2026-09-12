(()=>{
  const root=typeof window!=="undefined"?window:globalThis;
  const V019_SECTOR_COUNT=32;
  const V019_ESCAPE_CANDIDATES=64;
  const V019_PROGRESS_WINDOW=.34;
  const legacyResetMovementAI=resetMovementAI;

  function hostileEnemies(){
    return state.enemies.filter(enemy=>{
      if(!enemy||enemy.dead)return false;
      return typeof isEnemyHostile!=="function"||isEnemyHostile(enemy);
    });
  }

  function effectiveMoveSpeed(){
    if(typeof getEffectiveMoveSpeed==="function"){
      const value=Number(getEffectiveMoveSpeed());
      if(Number.isFinite(value)&&value>0)return value;
    }
    return 160;
  }

  function makeRuntimeState(){
    return{
      sectorAnalysis:null,
      lastThreat:null,
      lastDecisionAt:0,
      escapeScore:-Infinity,
      escapeMaxDanger:Infinity,
      escapeWidth:0,
      escapeReason:"none",
      hardCommitUntil:0,
      softCommitUntil:0,
      escapeReplans:0,
      progressWindowAt:state?.t||0,
      progressWindowX:player?.x||0,
      progressWindowY:player?.y||0,
      recentDisplacement:0,
      expectedDisplacement:0,
      stuckFor:0,
      breakoutUntil:0,
      headingReversals:0,
      lastOutputX:player?.moveX||1,
      lastOutputY:player?.moveY||0,
      lastOutputAt:state?.t||0,
      lastMode:"patrol",
      modeChanges:0
    };
  }

  function runtime(){
    if(!movementBrain.v019)movementBrain.v019=makeRuntimeState();
    return movementBrain.v019;
  }

  function resetV019MovementAI(){
    legacyResetMovementAI();
    movementBrain.v019=makeRuntimeState();
  }

  function predictedEnemyPosition(enemy,targetX,targetY,horizon){
    if(!horizon||horizon<=0)return{x:enemy.x,y:enemy.y};
    const dx=targetX-enemy.x,dy=targetY-enemy.y;
    const distance=Math.hypot(dx,dy)||1;
    const speed=Math.max(0,Number(enemy.speed)||72);
    const travel=Math.min(distance,speed*horizon*.92);
    return{x:enemy.x+dx/distance*travel,y:enemy.y+dy/distance*travel};
  }

  function predictedDangerAt(x,y,horizon=0){
    let danger=0,nearest=Infinity,closeCount=0;
    for(const enemy of hostileEnemies()){
      const predicted=predictedEnemyPosition(enemy,x,y,horizon);
      const d=Math.hypot(x-predicted.x,y-predicted.y);
      nearest=Math.min(nearest,d);
      if(d<85)closeCount++;
      if(d<42)danger+=2.8+(42-d)/14;
      else if(d<82)danger+=1.35*(1-(d-42)/40);
      else if(d<145)danger+=.48*(1-(d-82)/63);
    }
    return{danger,nearest,closeCount};
  }

  function angleDifference(a,b){
    let diff=(a-b)%(Math.PI*2);
    if(diff>Math.PI)diff-=Math.PI*2;
    if(diff<-Math.PI)diff+=Math.PI*2;
    return diff;
  }

  function analyzeEncirclement(){
    const enemies=hostileEnemies();
    const sectors=[];
    const sampleDistance=98;
    const horizon=.28;
    for(let i=0;i<V019_SECTOR_COUNT;i++){
      const angle=i/V019_SECTOR_COUNT*Math.PI*2;
      const dirX=Math.cos(angle),dirY=Math.sin(angle);
      let pressure=0,nearest=Infinity;
      const sampleX=player.x+dirX*sampleDistance;
      const sampleY=player.y+dirY*sampleDistance;
      for(const enemy of enemies){
        const predicted=predictedEnemyPosition(enemy,sampleX,sampleY,horizon);
        const dx=predicted.x-player.x,dy=predicted.y-player.y;
        const d=Math.hypot(dx,dy)||1;
        if(d>235)continue;
        nearest=Math.min(nearest,d);
        const enemyAngle=Math.atan2(dy,dx);
        const diff=angleDifference(angle,enemyAngle);
        const forward=Math.cos(diff)*d;
        if(forward<=0||forward>235)continue;
        const lateral=Math.abs(Math.sin(diff)*d);
        const body=(Number(enemy.r)||12)+(Number(player.r)||14)+24;
        const influence=body+Math.max(12,forward*.10);
        if(lateral<influence){
          const lateralFactor=1-lateral/influence;
          const distanceFactor=1-clamp(forward/245,0,1);
          pressure+=lateralFactor*(.45+distanceFactor*1.45);
        }
      }
      const predicted=predictedDangerAt(sampleX,sampleY,horizon);
      const wallDanger=getWallDangerForDirection(dirX,dirY,sampleDistance);
      const danger=pressure+predicted.danger*.72+wallDanger*.52;
      // "Open" answers a geometric question: is there a usable angular lane?
      // Future danger remains in `danger` and the corridor scorer below. Keeping
      // these signals separate prevents enemies on both lips of a real gap from
      // making the entire opening disappear before route scoring can compare it.
      const open=pressure<.90&&wallDanger<1.75;
      sectors.push({i,angle,dirX,dirY,pressure,predictedDanger:predicted.danger,wallDanger,danger,open,nearest});
    }

    let longest=0,longestStart=0,current=0,currentStart=0;
    for(let i=0;i<V019_SECTOR_COUNT*2;i++){
      const open=sectors[i%V019_SECTOR_COUNT].open;
      if(open){
        if(current===0)currentStart=i;
        current++;
        if(current>V019_SECTOR_COUNT)current=V019_SECTOR_COUNT;
        if(current>longest){longest=current;longestStart=currentStart;}
      }else current=0;
      if(i>=V019_SECTOR_COUNT&&longest>=V019_SECTOR_COUNT)break;
    }
    longest=Math.min(longest,V019_SECTOR_COUNT);
    const centerIndex=(longestStart+(longest-1)/2)%V019_SECTOR_COUNT;
    const gapAngle=longest>0?centerIndex/V019_SECTOR_COUNT*Math.PI*2:Math.atan2(H/2-player.y,W/2-player.x);
    const gapWidth=longest/V019_SECTOR_COUNT*Math.PI*2;
    const blocked=sectors.filter(sector=>!sector.open).length;
    const encirclement=blocked/V019_SECTOR_COUNT;
    const result={sectors,longestOpenSectors:longest,gapAngle,gapWidth,blockedSectors:blocked,encirclement};
    runtime().sectorAnalysis=result;
    return result;
  }

  function chooseV019Mode(threat,analysis){
    const rt=runtime();
    const edgeSafety=getEdgeSafety(player.x,player.y);
    const hpRatio=Number.isFinite(player.hp)&&Number.isFinite(player.maxHp)&&player.maxHp>0?player.hp/player.maxHp:1;
    const compressed=
      threat.nearest<68||
      threat.close80>=2||
      threat.close125>=6||
      (analysis.encirclement>=.69&&threat.close125>=3)||
      (analysis.gapWidth<=Math.PI*.34&&threat.close125>=4)||
      (edgeSafety<.36&&threat.close125>=2);

    if(movementBrain.mode==="escape"&&state.t<movementBrain.escapeModeUntil&&(
      threat.nearest<160||threat.close125>=2||analysis.encirclement>.34||edgeSafety<.44
    ))return"escape";

    if(compressed||state.t<rt.breakoutUntil)return"escape";

    if(state.t<movementBrain.lockUntil&&movementBrain.mode!=="escape"){
      if(movementBrain.mode==="kite"&&(threat.nearest<175||threat.close125>=2))return"kite";
      if(movementBrain.mode==="harvest"&&threat.nearest>=118&&analysis.encirclement<.40)return"harvest";
      if(movementBrain.mode==="patrol"&&threat.nearest>=150&&analysis.encirclement<.30)return"patrol";
    }

    const lowHpPressure=hpRatio<.42&&(threat.nearest<170||threat.close125>=2);
    if(lowHpPressure||threat.nearest<136||threat.close125>=4||analysis.encirclement>=.48)return"kite";
    if(state.gems.length)return"harvest";
    return"patrol";
  }

  function updateV019StrategicPlan(){
    const rt=runtime();
    const threat=getLocalThreat();
    const analysis=analyzeEncirclement();
    rt.lastThreat={nearest:threat.nearest,close80:threat.close80,close125:threat.close125};
    const desiredMode=chooseV019Mode(threat,analysis);
    const modeChanged=desiredMode!==movementBrain.mode;

    if(modeChanged){
      const previous=movementBrain.mode;
      movementBrain.mode=desiredMode;
      movementBrain.lastModeChange=state.t;
      movementBrain.lockUntil=state.t+(desiredMode==="escape"?.55:desiredMode==="kite"?.58:.78);
      rt.lastMode=desiredMode;
      rt.modeChanges++;
      if(desiredMode==="kite")movementBrain.orbitSign=Math.random()<.5?-1:1;
      if(desiredMode==="escape"){
        movementBrain.escapeModeUntil=state.t+1.05;
        movementBrain.escapeRouteUntil=0;
        movementBrain.nextEscapeCheckAt=0;
        rt.hardCommitUntil=0;
        rt.softCommitUntil=0;
        rt.escapeReason=previous==="escape"?"continue":"pressure";
      }else if(previous==="escape"){
        movementBrain.escapeRouteUntil=0;
        movementBrain.escapeDirX=0;
        movementBrain.escapeDirY=0;
        rt.hardCommitUntil=0;
        rt.softCommitUntil=0;
      }
      if(desiredMode!=="patrol"){
        movementBrain.patrolGoal=null;
        movementBrain.patrolUntil=0;
      }
    }

    if(desiredMode==="escape")movementBrain.escapeModeUntil=Math.max(movementBrain.escapeModeUntil,state.t+.70);

    if(desiredMode!=="escape"){
      const shouldReplan=modeChanged||!movementBrain.goal||state.t>=movementBrain.nextPlanAt;
      if(shouldReplan){
        const candidate=desiredMode==="patrol"?{goal:getPatrolGoal(),score:0}:selectStrategicGoal(desiredMode,threat);
        movementBrain.nextPlanAt=state.t+(desiredMode==="patrol"?.34:.28);
        if(candidate){
          const currentDanger=movementBrain.goal?getEnemyDangerAt(movementBrain.goal.x,movementBrain.goal.y).danger:Infinity;
          const currentDistance=movementBrain.goal?Math.hypot(movementBrain.goal.x-player.x,movementBrain.goal.y-player.y):0;
          const invalid=!movementBrain.goal||currentDanger>1.8||currentDistance<42;
          if(desiredMode==="patrol"||invalid||state.t>=movementBrain.lockUntil||candidate.score>movementBrain.goalScore+140){
            movementBrain.goal=candidate.goal;
            movementBrain.goalScore=candidate.score;
          }
        }
      }
    }

    rt.lastDecisionAt=state.t;
    return{threat,analysis};
  }

  function insideBounds(x,y,margin=10){
    const b=MOVEMENT_BOUNDS;
    return x>=b.left+margin&&x<=b.right-margin&&y>=b.top+margin&&y<=b.bottom-margin;
  }

  function evaluateEscapeCorridor(angle,analysis,{breakout=false}={}){
    const dirX=Math.cos(angle),dirY=Math.sin(angle);
    const perpX=-dirY,perpY=dirX;
    const speed=effectiveMoveSpeed();
    const distances=[44,86,138,205];
    const riskWeights=[1.45,1.15,.82,.58];
    let totalRisk=0,maxDanger=0,clearanceScore=0,finalNearest=0,finalX=player.x,finalY=player.y;

    for(let i=0;i<distances.length;i++){
      const distance=distances[i];
      const x=player.x+dirX*distance,y=player.y+dirY*distance;
      if(!insideBounds(x,y,9))return{valid:false,score:-Infinity,maxDanger:Infinity,dirX,dirY,angle};
      const horizon=Math.min(.95,distance/Math.max(90,speed)*.82+.06);
      const lateral=Math.min(34,12+distance*.10);
      const samples=[0,-lateral,lateral];
      let laneDanger=0,laneNearest=Infinity;
      for(const offset of samples){
        const sx=x+perpX*offset,sy=y+perpY*offset;
        if(!insideBounds(sx,sy,4)){
          laneDanger=Math.max(laneDanger,2.4);
          continue;
        }
        const predicted=predictedDangerAt(sx,sy,horizon);
        laneDanger=Math.max(laneDanger,predicted.danger);
        laneNearest=Math.min(laneNearest,predicted.nearest);
      }
      const wallSafety=getEdgeSafety(x,y);
      const cornerPenalty=getCornerPenalty(x,y);
      const wallRisk=(1-wallSafety)*.62+cornerPenalty*1.7;
      const danger=laneDanger+wallRisk;
      totalRisk+=danger*riskWeights[i];
      maxDanger=Math.max(maxDanger,danger);
      clearanceScore+=Math.min(laneNearest,240)*(i+1);
      finalNearest=laneNearest;
      finalX=x;finalY=y;
    }

    const edgeSafety=getEdgeSafety(finalX,finalY);
    const cornerPenalty=getCornerPenalty(finalX,finalY);
    const centerDistance=Math.hypot(finalX-W/2,finalY-H/2);
    const centerQuality=1-clamp(centerDistance/(Math.hypot(W/2,H/2)||1),0,1);
    const inertia=dirX*player.moveX+dirY*player.moveY;
    const gapAlignment=Math.cos(angleDifference(angle,analysis.gapAngle));
    const gapStrength=clamp(analysis.encirclement*1.25,0,1);
    const immediate=predictedDangerAt(player.x+dirX*58,player.y+dirY*58,.18);
    const score=
      -maxDanger*(breakout?920:1060)-
      totalRisk*(breakout?300:350)+
      clearanceScore*(breakout?.88:.73)+
      Math.min(finalNearest,250)*(breakout?2.05:1.65)+
      edgeSafety*330+
      centerQuality*105-
      cornerPenalty*1020+
      inertia*(breakout?35:72)+
      gapAlignment*gapStrength*(breakout?420:320)-
      immediate.danger*(breakout?520:260);

    return{valid:true,score,maxDanger,totalRisk,dirX,dirY,angle,finalNearest,gapAlignment};
  }

  function scanBestEscapeCorridor(analysis,{breakout=false}={}){
    const rt=runtime();
    let best=null;
    const committedAngle=(movementBrain.escapeDirX||movementBrain.escapeDirY)?Math.atan2(movementBrain.escapeDirY,movementBrain.escapeDirX):null;
    for(let i=0;i<V019_ESCAPE_CANDIDATES;i++){
      const angle=i/V019_ESCAPE_CANDIDATES*Math.PI*2;
      const route=evaluateEscapeCorridor(angle,analysis,{breakout});
      if(!route.valid)continue;
      if(!best||route.score>best.score+1e-6){best=route;continue;}
      if(Math.abs(route.score-best.score)<=24){
        const reference=committedAngle??Math.atan2(player.moveY,player.moveX);
        const routeTurn=Math.abs(angleDifference(route.angle,reference));
        const bestTurn=Math.abs(angleDifference(best.angle,reference));
        if(routeTurn<bestTurn)best=route;
      }
    }
    if(best)return best;
    const fallbackAngle=Math.atan2(H/2-player.y,W/2-player.x);
    const fallback=evaluateEscapeCorridor(fallbackAngle,analysis,{breakout});
    if(fallback.valid)return fallback;
    const dx=W/2-player.x,dy=H/2-player.y,mag=Math.hypot(dx,dy)||1;
    return{valid:true,score:-1e9,maxDanger:999,totalRisk:999,dirX:dx/mag,dirY:dy/mag,angle:fallbackAngle,finalNearest:0,gapAlignment:0};
  }

  function commitEscape(route,{breakout=false,reason="route"}={}){
    const rt=runtime();
    movementBrain.escapeDirX=route.dirX;
    movementBrain.escapeDirY=route.dirY;
    const hard=breakout?.72:.52;
    const soft=breakout?1.12:.92;
    rt.hardCommitUntil=state.t+hard;
    rt.softCommitUntil=state.t+soft;
    movementBrain.escapeRouteUntil=rt.softCommitUntil;
    movementBrain.nextEscapeCheckAt=state.t+.16;
    rt.escapeScore=route.score;
    rt.escapeMaxDanger=route.maxDanger;
    rt.escapeWidth=rt.sectorAnalysis?.gapWidth||0;
    rt.escapeReason=reason;
    rt.escapeReplans++;
    return{x:route.dirX,y:route.dirY};
  }

  function committedEscapeDirection(analysis){
    const rt=runtime();
    const hasRoute=(movementBrain.escapeDirX||movementBrain.escapeDirY)&&state.t<rt.softCommitUntil;
    const breakout=state.t<rt.breakoutUntil;
    if(hasRoute&&state.t<rt.hardCommitUntil)return{x:movementBrain.escapeDirX,y:movementBrain.escapeDirY};
    if(hasRoute&&state.t<movementBrain.nextEscapeCheckAt)return{x:movementBrain.escapeDirX,y:movementBrain.escapeDirY};

    const current=hasRoute?evaluateEscapeCorridor(Math.atan2(movementBrain.escapeDirY,movementBrain.escapeDirX),analysis,{breakout}):null;
    const best=scanBestEscapeCorridor(analysis,{breakout});
    movementBrain.nextEscapeCheckAt=state.t+.16;

    if(current?.valid&&state.t<rt.softCommitUntil){
      const collapse=current.maxDanger>4.4||current.score<-3600;
      const materiallyBetter=best.valid&&best.score>current.score+(breakout?160:320);
      if(!collapse&&!materiallyBetter){
        rt.escapeScore=current.score;
        rt.escapeMaxDanger=current.maxDanger;
        return{x:movementBrain.escapeDirX,y:movementBrain.escapeDirY};
      }
    }

    return commitEscape(best,{breakout,reason:breakout?"stuck-breakout":hasRoute?"corridor-collapse":"new-corridor"});
  }

  function sampleProgress(){
    const rt=runtime();
    if(!Number.isFinite(rt.progressWindowAt)){
      rt.progressWindowAt=state.t;rt.progressWindowX=player.x;rt.progressWindowY=player.y;return;
    }
    const elapsed=state.t-rt.progressWindowAt;
    if(elapsed<V019_PROGRESS_WINDOW)return;
    const displacement=Math.hypot(player.x-rt.progressWindowX,player.y-rt.progressWindowY);
    const expected=effectiveMoveSpeed()*elapsed;
    rt.recentDisplacement=displacement;
    rt.expectedDisplacement=expected;
    if(movementBrain.mode==="escape"){
      const ratio=expected>1?displacement/expected:1;
      if(ratio<.24)rt.stuckFor+=elapsed;
      else rt.stuckFor=Math.max(0,rt.stuckFor-elapsed*1.7);
      if(rt.stuckFor>=.34){
        rt.breakoutUntil=Math.max(rt.breakoutUntil,state.t+.82);
        rt.softCommitUntil=0;
        movementBrain.escapeRouteUntil=0;
        movementBrain.nextEscapeCheckAt=0;
        rt.stuckFor=0;
      }
    }else rt.stuckFor=0;
    rt.progressWindowAt=state.t;rt.progressWindowX=player.x;rt.progressWindowY=player.y;
  }

  function finalizeDirection(x,y){
    const rt=runtime();
    const b=MOVEMENT_BOUNDS;
    if(player.x<=b.left+7&&x<0)x=.62;
    if(player.x>=b.right-7&&x>0)x=-.62;
    if(player.y<=b.top+7&&y<0)y=.62;
    if(player.y>=b.bottom-7&&y>0)y=-.62;
    const magnitude=Math.hypot(x,y)||1;
    x/=magnitude;y/=magnitude;
    const previousMag=Math.hypot(rt.lastOutputX,rt.lastOutputY)||1;
    const dot=x*(rt.lastOutputX/previousMag)+y*(rt.lastOutputY/previousMag);
    if(dot<-.20)rt.headingReversals++;
    rt.lastOutputX=x;rt.lastOutputY=y;rt.lastOutputAt=state.t;
    player.moveX=x;player.moveY=y;
    return{x,y};
  }

  function chooseV019MovementDirection(){
    sampleProgress();
    const {threat,analysis}=updateV019StrategicPlan();
    const rt=runtime();

    if(movementBrain.mode==="escape"){
      const escape=committedEscapeDirection(analysis);
      const smoothing=state.t<rt.breakoutUntil?.96:.91;
      const x=player.moveX*(1-smoothing)+escape.x*smoothing;
      const y=player.moveY*(1-smoothing)+escape.y*smoothing;
      return finalizeDirection(x,y);
    }

    const goal=movementBrain.goal||{x:W/2,y:H/2};
    const goalDx=goal.x-player.x,goalDy=goal.y-player.y,goalDistance=Math.hypot(goalDx,goalDy)||1;
    const goalX=goalDx/goalDistance,goalY=goalDy/goalDistance;
    let tangentX=0,tangentY=0;
    if(threat.centroid&&movementBrain.mode==="kite"){
      const awayX=player.x-threat.centroid.x,awayY=player.y-threat.centroid.y,awayMag=Math.hypot(awayX,awayY)||1;
      tangentX=-awayY/awayMag*movementBrain.orbitSign;
      tangentY=awayX/awayMag*movementBrain.orbitSign;
    }

    const candidateCount=32,lookAhead=86,b=MOVEMENT_BOUNDS,candidates=[];
    let minDanger=Infinity;
    for(let i=0;i<candidateCount;i++){
      const angle=i/candidateCount*Math.PI*2,dirX=Math.cos(angle),dirY=Math.sin(angle);
      const enemyDanger=getEnemyDangerForDirection(dirX,dirY,lookAhead);
      const wallDanger=getWallDangerForDirection(dirX,dirY,lookAhead);
      const danger=Math.max(enemyDanger,wallDanger);
      let interest=(dirX*goalX+dirY*goalY)*(movementBrain.mode==="harvest"?1.45:movementBrain.mode==="patrol"?1.28:1.10);
      if(tangentX||tangentY)interest+=(dirX*tangentX+dirY*tangentY)*.88;
      interest+=(dirX*player.moveX+dirY*player.moveY)*(movementBrain.mode==="patrol"?.34:.25);
      const edgePushX=clamp((b.left+105-player.x)/105,0,1)-clamp((player.x-(b.right-105))/105,0,1);
      const edgePushY=clamp((b.top+105-player.y)/105,0,1)-clamp((player.y-(b.bottom-105))/105,0,1);
      interest+=(dirX*edgePushX+dirY*edgePushY)*1.55;
      candidates.push({dirX,dirY,danger,interest});
      minDanger=Math.min(minDanger,danger);
    }
    const tolerance=minDanger<.35?.28:minDanger<1?.20:.12;
    let best=null,bestInterest=-Infinity;
    for(const candidate of candidates){
      if(candidate.danger>minDanger+tolerance)continue;
      if(candidate.interest>bestInterest){bestInterest=candidate.interest;best=candidate;}
    }
    if(!best)best=candidates.reduce((a,c)=>c.danger<a.danger?c:a,candidates[0]);
    const emergency=threat.nearest<62||threat.close80>=3;
    const smoothing=emergency?.78:movementBrain.mode==="patrol"?.30:.42;
    return finalizeDirection(player.moveX*(1-smoothing)+best.dirX*smoothing,player.moveY*(1-smoothing)+best.dirY*smoothing);
  }

  function publicDiagnostics(){
    const rt=runtime(),analysis=rt.sectorAnalysis;
    return{
      version:"V0.19",
      mode:movementBrain.mode,
      modeChanges:rt.modeChanges,
      goal:movementBrain.goal?{x:movementBrain.goal.x,y:movementBrain.goal.y}:null,
      threat:rt.lastThreat?{...rt.lastThreat}:null,
      encirclement:analysis?analysis.encirclement:0,
      gapWidth:analysis?analysis.gapWidth:Math.PI*2,
      longestOpenSectors:analysis?analysis.longestOpenSectors:V019_SECTOR_COUNT,
      escape:{
        x:movementBrain.escapeDirX||0,
        y:movementBrain.escapeDirY||0,
        score:rt.escapeScore,
        maxDanger:rt.escapeMaxDanger,
        reason:rt.escapeReason,
        replans:rt.escapeReplans,
        hardCommitRemaining:Math.max(0,rt.hardCommitUntil-state.t),
        softCommitRemaining:Math.max(0,rt.softCommitUntil-state.t)
      },
      progress:{
        recentDisplacement:rt.recentDisplacement,
        expectedDisplacement:rt.expectedDisplacement,
        stuckFor:rt.stuckFor,
        breakoutRemaining:Math.max(0,rt.breakoutUntil-state.t),
        headingReversals:rt.headingReversals
      }
    };
  }

  resetMovementAI=resetV019MovementAI;
  chooseMovementDirection=chooseV019MovementDirection;
  root.getMovementAIDiagnostics=publicDiagnostics;
  root.getV019EncirclementAnalysis=()=>analyzeEncirclement();
  root.evaluateV019EscapeCorridor=(angle,options)=>evaluateEscapeCorridor(angle,analyzeEncirclement(),options||{});
})();
