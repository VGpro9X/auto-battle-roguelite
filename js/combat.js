function spawnEnemy(){
  const side=Math.floor(Math.random()*4);
  let x,y;
  if(side===0){x=rand(-30,W+30);y=-25;}
  if(side===1){x=W+25;y=rand(-30,H+30);}
  if(side===2){x=rand(-30,W+30);y=H+25;}
  if(side===3){x=-25;y=rand(-30,H+30);}

  const difficulty=getDifficultyProfile();
  const elite=Math.random()<difficulty.eliteChance;
  const hp=(elite?54:25)*difficulty.hpScale;

  state.enemies.push({
    x,y,
    r:elite?18:12,
    hp,maxHp:hp,
    speed:(elite?34:48)*rand(.85,1.15)*difficulty.speedScale,
    dmg:(elite?15:8)*difficulty.damageScale,
    hit:0,
    elite,
    dead:false
  });
}

function getSpawnCooldown(){
  return getDifficultyProfile().spawnCooldown;
}

function nearestEnemy(){
  let best=null;
  let bestDistance=Infinity;
  for(const enemy of state.enemies){
    if(enemy.dead) continue;
    const d=dist(player,enemy);
    if(d<bestDistance){bestDistance=d;best=enemy;}
  }
  return[best,bestDistance];
}

function randomEnemy(){
  const living=state.enemies.filter(enemy=>!enemy.dead);
  if(!living.length) return null;
  return living[(Math.random()*living.length)|0];
}

function shoot(target,damage,speed=430,radius=4,type="normal"){
  const dx=target.x-player.x;
  const dy=target.y-player.y;
  const magnitude=Math.hypot(dx,dy)||1;
  state.projectiles.push({
    x:player.x,y:player.y,
    vx:dx/magnitude*speed,
    vy:dy/magnitude*speed,
    r:radius,damage,life:2,type
  });
}

function hitEnemy(enemy,damage,knockback=0){
  if(enemy.dead) return false;
  enemy.hp-=damage;
  enemy.hit=.08;

  if(knockback){
    const dx=enemy.x-player.x;
    const dy=enemy.y-player.y;
    const magnitude=Math.hypot(dx,dy)||1;
    enemy.x+=dx/magnitude*knockback;
    enemy.y+=dy/magnitude*knockback;
  }

  if(settings.particles){
    for(let i=0;i<4;i++){
      state.particles.push({
        x:enemy.x,y:enemy.y,
        vx:rand(-55,55),vy:rand(-55,55),
        life:.35,r:2
      });
    }
  }

  if(enemy.hp<=0){
    enemy.dead=true;
    state.kills++;
    if(enemy.elite) state.eliteKills++;
    state.gems.push({x:enemy.x,y:enemy.y,r:5,xp:enemy.elite?4:1});
    return true;
  }
  return false;
}

function gainXp(amount){
  player.xp+=amount;
  while(player.xp>=player.xpNeed&&!state.gameOver){
    player.xp-=player.xpNeed;
    player.level++;
    player.xpNeed=getXpNeed(player.level);
    showLevelUp(false);
    break;
  }
}
