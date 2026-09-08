const MOVEMENT_BOUNDS={
  get left(){return 24;},
  get right(){return W-24;},
  get top(){return 54;},
  get bottom(){return H-95;}
};

const movementBrain={
  mode:"patrol",
  goal:null,
  goalScore:-Infinity,
  nextPlanAt:0,
  lockUntil:0,
  orbitSign:1,
  lastModeChange:0,
  patrolGoal:null,
  patrolUntil:0,
  patrolAngle:0
};

function resetMovementAI(){
  player.moveX=1;
  player.moveY=0;
  movementBrain.mode="patrol";
  movementBrain.goal={x:W/2,y:H/2};
  movementBrain.goalScore=-Infinity;
  movementBrain.nextPlanAt=0;
  movementBrain.lockUntil=0;
  movementBrain.orbitSign=Math.random()<.5?-1:1;
  movementBrain.lastModeChange=0;
  movementBrain.patrolGoal=null;
  movementBrain.patrolUntil=0;
  movementBrain.patrolAngle=Math.random()*Math.PI*2;
}

function getEdgeSafety(x,y){
  const b=MOVEMENT_BOUNDS;
  const d=Math.min(x-b.left,b.right-x,y-b.top,b.bottom-y);
  return clamp(d/150,0,1);
}

function getCornerPenalty(x,y){
  const b=MOVEMENT_BOUNDS;
  const left=clamp((115-(x-b.left))/115,0,1);
  const right=clamp((115-(b.right-x))/115,0,1);
  const top=clamp((115-(y-b.top))/115,0,1);
  const bottom=clamp((115-(b.bottom-y))/115,0,1);
  return Math.max(left*top,left*bottom,right*top,right*bottom);
}

function getEnemyDangerAt(x,y){
  let danger=0;
  let nearest=Infinity;
  let closeCount=0;

  for(const enemy of state.enemies){
    if(enemy.dead) continue;
    const d=Math.hypot(x-enemy.x,y-enemy.y);
    nearest=Math.min(nearest,d);

    if(d<85) closeCount++;
    if(d<42) danger+=2.8+(42-d)/14;
    else if(d<82) danger+=1.35*(1-(d-42)/40);
    else if(d<145) danger+=.48*(1-(d-82)/63);
  }

  return{danger,nearest,closeCount};
}

function getLocalThreat(){
  let nearest=Infinity;
  let close80=0;
  let close125=0;
  let cx=0;
  let cy=0;
  let weightSum=0;

  for(const enemy of state.enemies){
    if(enemy.dead) continue;
    const dx=enemy.x-player.x;
    const dy=enemy.y-player.y;
    const d=Math.hypot(dx,dy);
    nearest=Math.min(nearest,d);
    if(d<80) close80++;
    if(d<125) close125++;

    if(d<240){
      const w=1/(35+d);
      cx+=enemy.x*w;
      cy+=enemy.y*w;
      weightSum+=w;
    }
  }

  return{
    nearest,
    close80,
    close125,
    centroid:weightSum?{x:cx/weightSum,y:cy/weightSum}:null
  };
}

function buildStrategicCells(){
  const b=MOVEMENT_BOUNDS;
  const cols=7;
  const rows=5;
  const padX=Math.min(105,Math.max(58,(b.right-b.left)*.09));
  const padY=Math.min(100,Math.max(58,(b.bottom-b.top)*.10));
  const minX=b.left+padX;
  const maxX=b.right-padX;
  const minY=b.top+padY;
  const maxY=b.bottom-padY;
  const cells=[];

  for(let row=0;row<rows;row++){
    for(let col=0;col<cols;col++){
      const x=cols===1?(minX+maxX)/2:minX+(maxX-minX)*(col/(cols-1));
      const y=rows===1?(minY+maxY)/2:minY+(maxY-minY)*(row/(rows-1));
      const threat=getEnemyDangerAt(x,y);
      cells.push({x,y,...threat,xp:0,xpCount:0,xpX:0,xpY:0});
    }
  }

  for(const gem of state.gems){
    let bestCell=null;
    let bestDistance=Infinity;
    for(const cell of cells){
      const d=Math.hypot(gem.x-cell.x,gem.y-cell.y);
      if(d<bestDistance){bestDistance=d;bestCell=cell;}
    }
    if(bestCell){
      const proximity=Math.max(.35,1-bestDistance/260);
      const contribution=gem.xp*proximity;
      bestCell.xp+=contribution;
      bestCell.xpX+=gem.x*contribution;
      bestCell.xpY+=gem.y*contribution;
      bestCell.xpCount++;
    }
  }

  return cells;
}

function scoreStrategicCell(cell,mode){
  const travel=Math.hypot(cell.x-player.x,cell.y-player.y);
  const edgeSafety=getEdgeSafety(cell.x,cell.y);
  const cornerPenalty=getCornerPenalty(cell.x,cell.y);
  const centerDistance=Math.hypot(cell.x-W/2,cell.y-H/2);
  const maxCenterDistance=Math.hypot(W/2,H/2)||1;
  const centerQuality=1-clamp(centerDistance/maxCenterDistance,0,1);
  const clearance=Math.min(cell.nearest,230);

  let score=0;
  score-=cell.danger*720;
  score+=clearance*1.05;
  score+=edgeSafety*340;
  score+=centerQuality*115;
  score-=cornerPenalty*1150;
  score-=travel*.22;

  if(mode==="harvest"){
    score+=cell.xp*205;
    score+=Math.min(cell.xpCount,12)*18;
  }else if(mode==="kite"){
    score+=cell.xp*52;
  }else if(mode==="escape"){
    score+=edgeSafety*180;
    score+=centerQuality*90;
    score+=cell.xp*12;
  }else{
    score+=cell.xp*80;
  }

  return score;
}

function selectStrategicGoal(mode,threat){
  const cells=buildStrategicCells();
  let best=null;
  let bestScore=-Infinity;

  for(const cell of cells){
    let score=scoreStrategicCell(cell,mode);

    if(mode==="kite"&&threat.centroid){
      const awayX=player.x-threat.centroid.x;
      const awayY=player.y-threat.centroid.y;
      const awayMag=Math.hypot(awayX,awayY)||1;
      const tangentX=-awayY/awayMag*movementBrain.orbitSign;
      const tangentY=awayX/awayMag*movementBrain.orbitSign;
      const toCellX=cell.x-player.x;
      const toCellY=cell.y-player.y;
      const toCellMag=Math.hypot(toCellX,toCellY)||1;
      const tangentAlignment=(toCellX/toCellMag)*tangentX+(toCellY/toCellMag)*tangentY;
      score+=tangentAlignment*250;
    }

    if(score>bestScore){
      bestScore=score;
      best=cell;
    }
  }

  if(!best) return null;

  const goal=mode==="harvest"&&best.xp>0
    ?{x:best.xpX/best.xp,y:best.xpY/best.xp}
    :{x:best.x,y:best.y};

  return{goal,score:bestScore};
}

function chooseStrategicMode(threat){
  if(threat.nearest<58||threat.close80>=3) return"escape";
  if(threat.nearest<128||threat.close125>=5) return"kite";
  if(state.gems.length) return"harvest";
  return"patrol";
}

function getPatrolGoal(){
  const b=MOVEMENT_BOUNDS;
  const current=movementBrain.patrolGoal;

  if(current){
    const distance=Math.hypot(current.x-player.x,current.y-player.y);
    const danger=getEnemyDangerAt(current.x,current.y).danger;
    if(distance>62&&state.t<movementBrain.patrolUntil&&danger<.9){
      return current;
    }
  }

  const centerX=(b.left+b.right)/2;
  const centerY=(b.top+b.bottom)/2;
  const radiusX=Math.min(260,(b.right-b.left)*.27);
  const radiusY=Math.min(175,(b.bottom-b.top)*.24);

  let best=null;
  let bestScore=-Infinity;

  // Move around a broad central ellipse. This gives the idle state a stable,
  // readable patrol path instead of repeatedly selecting a nearby center cell.
  for(let step=1;step<=7;step++){
    const angle=movementBrain.patrolAngle+
      movementBrain.orbitSign*(.55+step*.32);
    const x=clamp(centerX+Math.cos(angle)*radiusX,b.left+90,b.right-90);
    const y=clamp(centerY+Math.sin(angle)*radiusY,b.top+85,b.bottom-85);
    const danger=getEnemyDangerAt(x,y).danger;
    const edgeSafety=getEdgeSafety(x,y);
    const cornerPenalty=getCornerPenalty(x,y);
    const travel=Math.hypot(x-player.x,y-player.y);
    const forwardX=x-player.x;
    const forwardY=y-player.y;
    const forwardMag=Math.hypot(forwardX,forwardY)||1;
    const forwardAlignment=(forwardX/forwardMag)*player.moveX+(forwardY/forwardMag)*player.moveY;

    const score=
      -danger*780+
      edgeSafety*260-
      cornerPenalty*1000+
      Math.min(travel,240)*.18+
      forwardAlignment*70;

    if(score>bestScore){
      bestScore=score;
      best={x,y,angle};
    }
  }

  if(!best){
    best={x:centerX,y:centerY,angle:movementBrain.patrolAngle};
  }

  movementBrain.patrolAngle=best.angle;
  movementBrain.patrolGoal={x:best.x,y:best.y};
  movementBrain.patrolUntil=state.t+1.35+Math.random()*.85;
  return movementBrain.patrolGoal;
}

function updateStrategicPlan(){
  const threat=getLocalThreat();
  const desiredMode=chooseStrategicMode(threat);
  const modeChanged=desiredMode!==movementBrain.mode;

  if(modeChanged){
    movementBrain.mode=desiredMode;
    movementBrain.lastModeChange=state.t;
    movementBrain.lockUntil=state.t+(desiredMode==="escape"?.35:.75);

    if(desiredMode==="kite"){
      movementBrain.orbitSign=Math.random()<.5?-1:1;
    }

    if(desiredMode!=="patrol"){
      movementBrain.patrolGoal=null;
      movementBrain.patrolUntil=0;
    }
  }

  const shouldReplan=
    modeChanged||
    !movementBrain.goal||
    state.t>=movementBrain.nextPlanAt||
    desiredMode==="escape";

  if(!shouldReplan) return threat;

  const candidate=desiredMode==="patrol"
    ?{goal:getPatrolGoal(),score:0}
    :selectStrategicGoal(desiredMode,threat);

  movementBrain.nextPlanAt=state.t+(desiredMode==="escape"?.12:desiredMode==="patrol"?.34:.28);

  if(!candidate) return threat;

  const currentGoalDanger=movementBrain.goal
    ?getEnemyDangerAt(movementBrain.goal.x,movementBrain.goal.y).danger
    :Infinity;

  const currentGoalDistance=movementBrain.goal
    ?Math.hypot(movementBrain.goal.x-player.x,movementBrain.goal.y-player.y)
    :0;

  const currentInvalid=
    !movementBrain.goal||
    currentGoalDanger>1.8||
    currentGoalDistance<42;

  const lockExpired=state.t>=movementBrain.lockUntil;
  const clearlyBetter=candidate.score>movementBrain.goalScore+140;

  if(
    desiredMode==="patrol"||
    currentInvalid||
    lockExpired||
    clearlyBetter||
    desiredMode==="escape"
  ){
    movementBrain.goal=candidate.goal;
    movementBrain.goalScore=candidate.score;
    movementBrain.lockUntil=state.t+(
      desiredMode==="escape"?.28:
      desiredMode==="patrol"?.95:
      .70
    );
  }

  return threat;
}

function getWallDangerForDirection(dirX,dirY,lookAhead){
  const b=MOVEMENT_BOUNDS;
  const futureX=player.x+dirX*lookAhead;
  const futureY=player.y+dirY*lookAhead;

  if(futureX<b.left||futureX>b.right||futureY<b.top||futureY>b.bottom) return 5;

  const edgeDistance=Math.min(
    futureX-b.left,
    b.right-futureX,
    futureY-b.top,
    b.bottom-futureY
  );

  let danger=0;
  if(edgeDistance<34) danger=2.6+(34-edgeDistance)/12;
  else if(edgeDistance<78) danger=.95*(1-(edgeDistance-34)/44);
  else if(edgeDistance<125) danger=.20*(1-(edgeDistance-78)/47);

  danger+=getCornerPenalty(futureX,futureY)*2.5;
  return danger;
}

function getEnemyDangerForDirection(dirX,dirY,lookAhead){
  const futureX=player.x+dirX*lookAhead;
  const futureY=player.y+dirY*lookAhead;
  return getEnemyDangerAt(futureX,futureY).danger;
}

function chooseMovementDirection(){
  const threat=updateStrategicPlan();
  const goal=movementBrain.goal||{x:W/2,y:H/2};
  const candidateCount=32;
  const lookAhead=86;
  const b=MOVEMENT_BOUNDS;

  const goalDx=goal.x-player.x;
  const goalDy=goal.y-player.y;
  const goalDistance=Math.hypot(goalDx,goalDy)||1;
  const goalX=goalDx/goalDistance;
  const goalY=goalDy/goalDistance;

  let tangentX=0;
  let tangentY=0;
  if(threat.centroid&&(movementBrain.mode==="kite"||movementBrain.mode==="escape")){
    const awayX=player.x-threat.centroid.x;
    const awayY=player.y-threat.centroid.y;
    const awayMag=Math.hypot(awayX,awayY)||1;
    tangentX=-awayY/awayMag*movementBrain.orbitSign;
    tangentY=awayX/awayMag*movementBrain.orbitSign;
  }

  const candidates=[];
  let minDanger=Infinity;

  for(let i=0;i<candidateCount;i++){
    const angle=i/candidateCount*Math.PI*2;
    const dirX=Math.cos(angle);
    const dirY=Math.sin(angle);

    const enemyDanger=getEnemyDangerForDirection(dirX,dirY,lookAhead);
    const wallDanger=getWallDangerForDirection(dirX,dirY,lookAhead);
    const danger=Math.max(enemyDanger,wallDanger);

    let interest=0;
    const goalAlignment=dirX*goalX+dirY*goalY;
    const goalWeight=
      movementBrain.mode==="harvest"?1.45:
      movementBrain.mode==="patrol"?1.28:
      1.10;
    interest+=goalAlignment*goalWeight;

    if(tangentX||tangentY){
      const tangentAlignment=dirX*tangentX+dirY*tangentY;
      interest+=tangentAlignment*(movementBrain.mode==="kite"?.85:.35);
    }

    const inertia=dirX*player.moveX+dirY*player.moveY;
    interest+=inertia*(movementBrain.mode==="patrol"?.34:.24);

    const edgePushX=
      clamp((b.left+105-player.x)/105,0,1)-
      clamp((player.x-(b.right-105))/105,0,1);
    const edgePushY=
      clamp((b.top+105-player.y)/105,0,1)-
      clamp((player.y-(b.bottom-105))/105,0,1);
    interest+=(dirX*edgePushX+dirY*edgePushY)*1.55;

    candidates.push({dirX,dirY,danger,interest});
    minDanger=Math.min(minDanger,danger);
  }

  const dangerTolerance=minDanger<.35?.28:minDanger<1?.20:.12;
  let best=null;
  let bestInterest=-Infinity;

  for(const candidate of candidates){
    if(candidate.danger>minDanger+dangerTolerance) continue;
    if(candidate.interest>bestInterest){
      bestInterest=candidate.interest;
      best=candidate;
    }
  }

  if(!best){
    best=candidates.reduce((a,c)=>c.danger<a.danger?c:a,candidates[0]);
  }

  const emergency=threat.nearest<62||threat.close80>=3;
  const smoothing=emergency?.78:movementBrain.mode==="patrol"?.30:.42;

  player.moveX=player.moveX*(1-smoothing)+best.dirX*smoothing;
  player.moveY=player.moveY*(1-smoothing)+best.dirY*smoothing;

  if(player.x<=b.left+7&&player.moveX<0) player.moveX=.55;
  if(player.x>=b.right-7&&player.moveX>0) player.moveX=-.55;
  if(player.y<=b.top+7&&player.moveY<0) player.moveY=.55;
  if(player.y>=b.bottom-7&&player.moveY>0) player.moveY=-.55;

  const magnitude=Math.hypot(player.moveX,player.moveY)||1;
  player.moveX/=magnitude;
  player.moveY/=magnitude;

  return{x:player.moveX,y:player.moveY};
}
