const MOVEMENT_BOUNDS={
  get left(){return 24;},
  get right(){return W-24;},
  get top(){return 54;},
  get bottom(){return H-95;}
};

function resetMovementAI(){
  player.moveX=1;
  player.moveY=0;
}

function getXpTarget(){
  if(state.gems.length===0) return null;

  let best=null;
  let bestScore=-Infinity;

  for(const gem of state.gems){
    const d=Math.hypot(gem.x-player.x,gem.y-player.y);
    const valueBonus=gem.xp*95;
    const score=valueBonus-d;

    if(score>bestScore){
      bestScore=score;
      best=gem;
    }
  }

  return best;
}

function getCornerEscapeVector(){
  const b=MOVEMENT_BOUNDS;
  const zone=62;

  const nearLeft=player.x<b.left+zone;
  const nearRight=player.x>b.right-zone;
  const nearTop=player.y<b.top+zone;
  const nearBottom=player.y>b.bottom-zone;

  if(!(nearLeft||nearRight) || !(nearTop||nearBottom)) return null;

  let x=0;
  let y=0;

  if(nearLeft) x+=1;
  if(nearRight) x-=1;
  if(nearTop) y+=1;
  if(nearBottom) y-=1;

  const magnitude=Math.hypot(x,y)||1;
  return{x:x/magnitude,y:y/magnitude};
}

function chooseMovementDirection(){
  const[nearest,nearestDistance]=nearestEnemy();
  const xpTarget=getXpTarget();
  const cornerEscape=getCornerEscapeVector();

  const candidateCount=32;
  const lookAhead=92;
  const b=MOVEMENT_BOUNDS;

  let bestScore=-Infinity;
  let bestX=player.moveX;
  let bestY=player.moveY;

  for(let i=0;i<candidateCount;i++){
    const angle=i/candidateCount*Math.PI*2;
    const dirX=Math.cos(angle);
    const dirY=Math.sin(angle);
    const futureX=player.x+dirX*lookAhead;
    const futureY=player.y+dirY*lookAhead;

    let score=0;
    let minimumEnemyDistance=Infinity;

    for(const enemy of state.enemies){
      if(enemy.dead) continue;
      const d=Math.hypot(futureX-enemy.x,futureY-enemy.y);
      minimumEnemyDistance=Math.min(minimumEnemyDistance,d);

      if(d<45) score-=(45-d)*48;
      else if(d<90) score-=(90-d)*11;
      else if(d<165) score-=(165-d)*1.8;
    }

    if(minimumEnemyDistance<Infinity){
      score+=Math.min(minimumEnemyDistance,230)*1.9;
    }

    const outsideLeft=Math.max(0,b.left-futureX);
    const outsideRight=Math.max(0,futureX-b.right);
    const outsideTop=Math.max(0,b.top-futureY);
    const outsideBottom=Math.max(0,futureY-b.bottom);
    const outside=outsideLeft+outsideRight+outsideTop+outsideBottom;
    if(outside>0) score-=3200+outside*90;

    const edgeZone=92;
    const leftPressure=clamp((b.left+edgeZone-player.x)/edgeZone,0,1);
    const rightPressure=clamp((player.x-(b.right-edgeZone))/edgeZone,0,1);
    const topPressure=clamp((b.top+edgeZone-player.y)/edgeZone,0,1);
    const bottomPressure=clamp((player.y-(b.bottom-edgeZone))/edgeZone,0,1);

    score+=dirX*(leftPressure-rightPressure)*640;
    score+=dirY*(topPressure-bottomPressure)*640;

    if(cornerEscape){
      const alignment=dirX*cornerEscape.x+dirY*cornerEscape.y;
      score+=alignment*1500;
      if(alignment<0) score-=1400;
    }

    if(xpTarget){
      const currentXpDistance=Math.hypot(xpTarget.x-player.x,xpTarget.y-player.y);
      const futureXpDistance=Math.hypot(xpTarget.x-futureX,xpTarget.y-futureY);
      const progress=currentXpDistance-futureXpDistance;

      let xpWeight;
      if(nearestDistance>190) xpWeight=13;
      else if(nearestDistance>140) xpWeight=9;
      else if(nearestDistance>95) xpWeight=4.5;
      else if(nearestDistance>70) xpWeight=1.5;
      else xpWeight=.35;

      score+=progress*xpWeight;

      if(currentXpDistance>player.magnet&&futureXpDistance<=player.magnet){
        score+=260;
      }
    }

    const inertia=dirX*player.moveX+dirY*player.moveY;
    const inertiaWeight=xpTarget&&nearestDistance>130?8:18;
    score+=inertia*inertiaWeight;

    if(nearest&&!xpTarget&&nearestDistance>230){
      const futureDistance=Math.hypot(nearest.x-futureX,nearest.y-futureY);
      score+=(nearestDistance-futureDistance)*.55;
    }

    if(score>bestScore){
      bestScore=score;
      bestX=dirX;
      bestY=dirY;
    }
  }

  const emergency=nearestDistance<72;
  let smoothing=emergency?.78:.34;
  if(cornerEscape) smoothing=.92;

  player.moveX=player.moveX*(1-smoothing)+bestX*smoothing;
  player.moveY=player.moveY*(1-smoothing)+bestY*smoothing;

  if(player.x<=b.left+3&&player.moveX<0) player.moveX=Math.abs(player.moveX)+.45;
  if(player.x>=b.right-3&&player.moveX>0) player.moveX=-Math.abs(player.moveX)-.45;
  if(player.y<=b.top+3&&player.moveY<0) player.moveY=Math.abs(player.moveY)+.45;
  if(player.y>=b.bottom-3&&player.moveY>0) player.moveY=-Math.abs(player.moveY)-.45;

  const magnitude=Math.hypot(player.moveX,player.moveY)||1;
  player.moveX/=magnitude;
  player.moveY/=magnitude;

  return{x:player.moveX,y:player.moveY};
}
