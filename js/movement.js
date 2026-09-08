function getXpTarget(){
  if(state.gems.length===0) return null;

  let totalWeight=0;
  let targetX=0;
  let targetY=0;
  let nearest=null;
  let nearestDistance=Infinity;

  for(const gem of state.gems){
    const d=Math.hypot(gem.x-player.x,gem.y-player.y);
    if(d<nearestDistance){nearestDistance=d;nearest=gem;}

    if(d<420){
      const weight=gem.xp*(1/(40+d));
      targetX+=gem.x*weight;
      targetY+=gem.y*weight;
      totalWeight+=weight;
    }
  }

  if(totalWeight>0){
    return{x:targetX/totalWeight,y:targetY/totalWeight};
  }
  return nearest;
}

function chooseMovementDirection(){
  const[nearest,nearestDistance]=nearestEnemy();
  const xpTarget=getXpTarget();
  const candidateCount=24;
  const lookAhead=82;

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

      if(d<45) score-=(45-d)*42;
      else if(d<90) score-=(90-d)*9;
      else if(d<160) score-=(160-d)*1.6;
    }

    if(minimumEnemyDistance<Infinity){
      score+=Math.min(minimumEnemyDistance,220)*1.7;
    }

    const edgeDistance=Math.min(futureX,W-futureX,futureY-48,H-90-futureY);
    if(edgeDistance<25) score-=850;
    else if(edgeDistance<70) score-=(70-edgeDistance)*8;

    if(xpTarget){
      const currentXpDistance=Math.hypot(xpTarget.x-player.x,xpTarget.y-player.y);
      const futureXpDistance=Math.hypot(xpTarget.x-futureX,xpTarget.y-futureY);
      const progress=currentXpDistance-futureXpDistance;

      let xpWeight;
      if(nearestDistance>170) xpWeight=6.5;
      else if(nearestDistance>120) xpWeight=4;
      else if(nearestDistance>80) xpWeight=1.6;
      else xpWeight=.25;

      score+=progress*xpWeight;
    }

    const inertia=dirX*player.moveX+dirY*player.moveY;
    score+=inertia*18;

    if(nearest&&!xpTarget&&nearestDistance>220){
      const futureDistance=Math.hypot(nearest.x-futureX,nearest.y-futureY);
      score+=(nearestDistance-futureDistance)*.55;
    }

    if(score>bestScore){bestScore=score;bestX=dirX;bestY=dirY;}
  }

  const emergency=nearestDistance<70;
  const smoothing=emergency?.72:.26;

  player.moveX=player.moveX*(1-smoothing)+bestX*smoothing;
  player.moveY=player.moveY*(1-smoothing)+bestY*smoothing;

  const magnitude=Math.hypot(player.moveX,player.moveY)||1;
  player.moveX/=magnitude;
  player.moveY/=magnitude;

  return{x:player.moveX,y:player.moveY};
}
