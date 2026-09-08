function update(dt){
  if(!state.running||state.paused||state.gameOver) return;

  state.t+=dt;

  if(state.mode&&!state.mode.endless&&state.t>=state.mode.duration){
    finishRun("victory");
    return;
  }

  player.orbitAngle+=dt*2.2;
  player.hp=Math.min(player.maxHp,player.hp+player.regen*dt);

  const movement=chooseMovementDirection();
  player.x=clamp(player.x+movement.x*player.speed*dt,24,W-24);
  player.y=clamp(player.y+movement.y*player.speed*dt,54,H-95);

  player.attackTimer-=dt;
  if(player.attackTimer<=0){
    const[enemy,distance]=nearestEnemy();
    if(enemy&&distance<=player.attackRange){
      fireNormalAttack(enemy);
      player.attackTimer=player.attackCd;
    }
  }

  if(skillLevel("fire")){
    skills.fire.timer-=dt;
    const level=skillLevel("fire");
    const cooldown=Math.max(1.2,3-.25*(level-1));
    if(skills.fire.timer<=0){
      const enemy=randomEnemy();
      if(enemy){
        shoot(enemy,22*(1+.28*(level-1)),300,7,"fire");
        skills.fire.timer=cooldown;
      }
    }
  }

  if(skillLevel("knock")){
    skills.knock.timer-=dt;
    const level=skillLevel("knock");
    const cooldown=Math.max(.45,1.4-.15*(level-1));
    if(skills.knock.timer<=0){
      const enemy=randomEnemy();
      if(enemy){
        hitEnemy(enemy,10*(1+.25*(level-1)),60+level*8);
        skills.knock.timer=cooldown;
      }
    }
  }

  if(skillLevel("lightning")){
    skills.lightning.timer-=dt;
    const level=skillLevel("lightning");
    const cooldown=Math.max(1.8,4-.35*(level-1));

    if(skills.lightning.timer<=0){
      const targets=getNearestEnemies(Math.min(5,1+level));
      for(const enemy of targets){
        hitEnemy(enemy,12+level*8);
      }
      if(targets.length) skills.lightning.timer=cooldown;
    }
  }

  if(skillLevel("nova")){
    skills.nova.timer-=dt;
    const level=skillLevel("nova");
    const cooldown=Math.max(2.8,5.5-.45*(level-1));
    const radius=95+level*18;
    const damage=10+level*8;

    if(skills.nova.timer<=0){
      let hitAny=false;
      for(const enemy of state.enemies){
        if(enemy.dead) continue;
        if(dist(player,enemy)<=radius){
          hitEnemy(enemy,damage,26+level*4);
          hitAny=true;
        }
      }
      if(hitAny) skills.nova.timer=cooldown;
    }
  }

  state.spawnTimer-=dt;
  if(state.spawnTimer<=0){
    const difficulty=getDifficultyProfile();
    spawnEnemy();
    if(Math.random()<difficulty.extraSpawnChance) spawnEnemy();
    if(getRunProgress()>.78&&Math.random()<difficulty.extraSpawnChance*.42) spawnEnemy();
    state.spawnTimer=getSpawnCooldown();
  }

  const frostLevel=skillLevel("frost");
  const frostRadius=90+frostLevel*18;
  const frostSpeedFactor=1-Math.min(.40,frostLevel*.08);

  for(const enemy of state.enemies){
    if(enemy.dead) continue;

    const dx=player.x-enemy.x;
    const dy=player.y-enemy.y;
    const magnitude=Math.hypot(dx,dy)||1;
    const speedFactor=frostLevel&&magnitude<=frostRadius?frostSpeedFactor:1;

    enemy.x+=dx/magnitude*enemy.speed*speedFactor*dt;
    enemy.y+=dy/magnitude*enemy.speed*speedFactor*dt;
    enemy.hit=Math.max(0,enemy.hit-dt);

    if(magnitude<player.r+enemy.r+3){
      player.hp-=enemy.dmg*(1-player.armor)*dt;
    }
  }

  const orbitLevel=skillLevel("orbit");
  if(orbitLevel){
    for(let i=0;i<orbitLevel;i++){
      const angle=player.orbitAngle+i*Math.PI*2/orbitLevel;
      const bladeX=player.x+Math.cos(angle)*48;
      const bladeY=player.y+Math.sin(angle)*48;

      for(const enemy of state.enemies){
        if(enemy.dead) continue;
        if(Math.hypot(enemy.x-bladeX,enemy.y-bladeY)<enemy.r+7){
          if(!enemy.orbitHit||state.t-enemy.orbitHit>.32){
            enemy.orbitHit=state.t;
            hitEnemy(enemy,6+orbitLevel*2,4);
          }
        }
      }
    }
  }

  for(const projectile of state.projectiles){
    projectile.x+=projectile.vx*dt;
    projectile.y+=projectile.vy*dt;
    projectile.life-=dt;

    for(const enemy of state.enemies){
      if(projectile.life<=0||projectile.hitsRemaining<=0) break;
      if(enemy.dead||projectile.hitEnemies.has(enemy)) continue;

      if(Math.hypot(projectile.x-enemy.x,projectile.y-enemy.y)<projectile.r+enemy.r){
        hitEnemy(enemy,projectile.damage,projectile.type==="fire"?18:0);
        projectile.hitEnemies.add(enemy);
        projectile.hitsRemaining--;

        if(projectile.hitsRemaining<=0){
          projectile.life=0;
        }
      }
    }
  }

  state.projectiles=state.projectiles.filter(
    p=>p.life>0&&p.hitsRemaining>0&&p.x>-60&&p.x<W+60&&p.y>-60&&p.y<H+60
  );
  state.enemies=state.enemies.filter(enemy=>!enemy.dead);

  for(const gem of state.gems){
    const dx=player.x-gem.x;
    const dy=player.y-gem.y;
    const magnitude=Math.hypot(dx,dy)||1;

    if(magnitude<player.magnet){
      const speed=190+(player.magnet-magnitude)*2.2;
      gem.x+=dx/magnitude*speed*dt;
      gem.y+=dy/magnitude*speed*dt;
    }

    if(magnitude<player.r+gem.r+6){
      gem.dead=true;
      gainXp(gem.xp);
    }
  }

  state.gems=state.gems.filter(gem=>!gem.dead);

  for(const particle of state.particles){
    particle.x+=particle.vx*dt;
    particle.y+=particle.vy*dt;
    particle.life-=dt;
  }
  state.particles=state.particles.filter(particle=>particle.life>0);

  if(player.hp<=0){
    player.hp=0;
    finishRun("defeat");
  }
}

function draw(){
  ctx.clearRect(0,0,W,H);

  ctx.globalAlpha=.10;
  ctx.strokeStyle="#7f8aa3";
  ctx.lineWidth=1;
  const grid=42;
  const gridOffset=state.running?(state.t*8)%grid:0;
  for(let x=gridOffset-grid;x<W;x+=grid){
    ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();
  }
  for(let y=0;y<H;y+=grid){
    ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();
  }
  ctx.globalAlpha=1;

  for(const gem of state.gems){
    ctx.save();
    ctx.translate(gem.x,gem.y);
    ctx.rotate(state.t*2);
    ctx.fillStyle="#79a7ff";
    ctx.beginPath();ctx.moveTo(0,-6);ctx.lineTo(5,0);ctx.lineTo(0,6);ctx.lineTo(-5,0);ctx.closePath();ctx.fill();
    ctx.restore();
  }

  for(const enemy of state.enemies){
    ctx.save();
    ctx.translate(enemy.x,enemy.y);
    ctx.fillStyle=enemy.hit>0?"#ffffff":(enemy.elite?"#b66ac8":"#cf6f6f");
    ctx.beginPath();ctx.arc(0,0,enemy.r,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#17191f";
    ctx.beginPath();ctx.arc(-enemy.r*.3,-2,2.2,0,Math.PI*2);ctx.arc(enemy.r*.3,-2,2.2,0,Math.PI*2);ctx.fill();

    if(enemy.elite){
      ctx.strokeStyle="rgba(255,255,255,.55)";
      ctx.lineWidth=2;
      ctx.stroke();
    }

    if(enemy.hp<enemy.maxHp){
      ctx.fillStyle="rgba(0,0,0,.5)";
      ctx.fillRect(-enemy.r,-enemy.r-8,enemy.r*2,3);
      ctx.fillStyle="#fff";
      ctx.fillRect(-enemy.r,-enemy.r-8,enemy.r*2*(enemy.hp/enemy.maxHp),3);
    }
    ctx.restore();
  }

  for(const projectile of state.projectiles){
    ctx.fillStyle=projectile.type==="fire"?"#ffb05b":"#e7e7e7";
    ctx.beginPath();ctx.arc(projectile.x,projectile.y,projectile.r,0,Math.PI*2);ctx.fill();

    if(projectile.type==="fire"){
      ctx.globalAlpha=.18;
      ctx.beginPath();ctx.arc(projectile.x,projectile.y,projectile.r*2.6,0,Math.PI*2);ctx.fill();
      ctx.globalAlpha=1;
    }
  }

  const orbitLevel=skillLevel("orbit");
  if(orbitLevel){
    for(let i=0;i<orbitLevel;i++){
      const angle=player.orbitAngle+i*Math.PI*2/orbitLevel;
      const x=player.x+Math.cos(angle)*48;
      const y=player.y+Math.sin(angle)*48;
      ctx.save();
      ctx.translate(x,y);
      ctx.rotate(angle+Math.PI/2);
      ctx.fillStyle="#d9dde8";ctx.fillRect(-2,-10,4,17);
      ctx.fillStyle="#a8b0c2";ctx.fillRect(-5,5,10,3);
      ctx.restore();
    }
  }

  if(state.running||state.gameOver){
    ctx.save();
    ctx.translate(player.x,player.y);
    ctx.fillStyle="#d7e2ff";
    ctx.beginPath();ctx.arc(0,0,player.r,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#7284ad";
    ctx.beginPath();ctx.arc(0,0,8,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle="rgba(255,255,255,.25)";
    ctx.lineWidth=2;
    ctx.beginPath();ctx.arc(0,0,player.r+5,0,Math.PI*2);ctx.stroke();
    ctx.restore();
  }

  for(const particle of state.particles){
    ctx.globalAlpha=Math.max(0,particle.life/.35);
    ctx.fillStyle="#fff";
    ctx.beginPath();ctx.arc(particle.x,particle.y,particle.r,0,Math.PI*2);ctx.fill();
  }
  ctx.globalAlpha=1;

  if(state.mode) updateHud();
}

let last=performance.now();
function loop(now){
  const dt=Math.min(.033,(now-last)/1000);
  last=now;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
