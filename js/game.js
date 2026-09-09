function update(dt){
  if(!state.running||state.paused||state.gameOver)return;
  state.t+=dt;

  if(state.mode&&!state.mode.endless&&state.t>=state.mode.duration){finishRun("victory");return;}

  player.orbitAngle+=dt*2.2;
  if(player.regen>0)healPlayer(player.regen*dt,{source:"regen"});
  runSkillEngine(dt);

  const movement=chooseMovementDirection();
  const moveSpeed=getEffectiveMoveSpeed();
  player.x=clamp(player.x+movement.x*moveSpeed*dt,24,W-24);
  player.y=clamp(player.y+movement.y*moveSpeed*dt,54,H-95);

  player.attackTimer-=dt;
  if(player.attackTimer<=0){
    const[enemy,distance]=nearestEnemy();
    if(enemy&&distance<=player.attackRange){
      fireNormalAttack(enemy);
      player.attackTimer=getEffectiveAttackCooldown();
    }
  }

  state.spawnTimer-=dt;
  if(state.spawnTimer<=0){
    const difficulty=getDifficultyProfile();
    spawnEnemy();
    if(Math.random()<difficulty.extraSpawnChance)spawnEnemy();
    if(getRunProgress()>.78&&Math.random()<difficulty.extraSpawnChance*.42)spawnEnemy();
    state.spawnTimer=getSpawnCooldown();
  }

  const frostLevel=skillLevel("frost");
  const frostRadius=90+frostLevel*18;
  const frostSpeedFactor=1-Math.min(.40,frostLevel*.08);

  for(const enemy of state.enemies){
    if(enemy.dead)continue;
    enemy.hit=Math.max(0,enemy.hit-dt);

    if(isEnemyAllied(enemy)){
      enemy.allyAttackTimer-=dt;
      const[target,targetDistance]=getNearestHostileFromEnemy(enemy,260);
      if(target){
        const dx=target.x-enemy.x,dy=target.y-enemy.y,magnitude=Math.hypot(dx,dy)||1;
        if(targetDistance>72){
          enemy.x+=dx/magnitude*enemy.speed*.9*dt;
          enemy.y+=dy/magnitude*enemy.speed*.9*dt;
        }
        if(enemy.allyAttackTimer<=0&&targetDistance<=210){
          enemy.allyAttackTimer=.72;
          hitEnemy(target,Math.max(6,enemy.dmg*1.8),0,{source:"bribedAlly",tags:["SUMMON","RULE"],allowProcs:false});
        }
      }else{
        const angle=state.t*.9+(enemy.x+enemy.y)*.01;
        const tx=player.x+Math.cos(angle)*58,ty=player.y+Math.sin(angle)*58;
        const dx=tx-enemy.x,dy=ty-enemy.y,magnitude=Math.hypot(dx,dy)||1;
        enemy.x+=dx/magnitude*enemy.speed*.55*dt;
        enemy.y+=dy/magnitude*enemy.speed*.55*dt;
      }
      continue;
    }

    const combatTarget=typeof getEnemyCombatTarget==="function"?(getEnemyCombatTarget(enemy)||player):player;
    const dx=combatTarget.x-enemy.x,dy=combatTarget.y-enemy.y,magnitude=Math.hypot(dx,dy)||1;
    const playerDistance=Math.hypot(player.x-enemy.x,player.y-enemy.y);
    const auraChilled=frostLevel&&playerDistance<=frostRadius;
    enemy.chilled=Boolean(auraChilled||enemy.chillUntil>state.t);
    const speedFactor=enemy.chilled?frostSpeedFactor:1;
    enemy.x+=dx/magnitude*enemy.speed*speedFactor*dt;
    enemy.y+=dy/magnitude*enemy.speed*speedFactor*dt;
    const targetRadius=combatTarget.r||player.r;
    if(magnitude<targetRadius+enemy.r+3){
      if(combatTarget!==player&&typeof damageEnemyCombatTarget==="function")damageEnemyCombatTarget(combatTarget,enemy.dmg*dt,{source:enemy,type:"contact"});
      else damagePlayer(enemy.dmg*dt,{source:enemy,type:"contact"});
    }
  }

  const orbitBase=skillLevel("orbit");
  if(orbitBase){
    const orbitLevel=orbitBase+(hasEvolution("swordDomain")?2:0);
    const orbitRadius=hasEvolution("swordDomain")?62:48;
    const orbitDamage=(6+orbitBase*2)*(hasEvolution("swordDomain")?1.45:1);
    for(let i=0;i<orbitLevel;i++){
      const angle=player.orbitAngle+i*Math.PI*2/orbitLevel;
      const bladeX=player.x+Math.cos(angle)*orbitRadius;
      const bladeY=player.y+Math.sin(angle)*orbitRadius;
      for(const enemy of state.enemies){
        if(!isEnemyHostile(enemy))continue;
        if(Math.hypot(enemy.x-bladeX,enemy.y-bladeY)<enemy.r+7){
          if(!enemy.orbitHit||state.t-enemy.orbitHit>.32){
            enemy.orbitHit=state.t;
            hitEnemy(enemy,orbitDamage,4,{source:"orbit",tags:["SUMMON","MELEE","CONTROL"]});
          }
        }
      }
    }
  }

  updateEnemyStatuses(dt);

  for(const projectile of state.projectiles){
    projectile.x+=projectile.vx*dt;projectile.y+=projectile.vy*dt;projectile.life-=dt;
    for(const enemy of state.enemies){
      if(projectile.life<=0||projectile.hitsRemaining<=0)break;
      if(!isEnemyHostile(enemy)||projectile.hitEnemies.has(enemy))continue;
      if(Math.hypot(projectile.x-enemy.x,projectile.y-enemy.y)<projectile.r+enemy.r){
        hitEnemy(enemy,projectile.damage,projectile.type==="fire"?18:0,projectile.meta);
        if(projectile.meta?.chaosVariant==="poison")applyPoison(enemy,4+skillLevel("chaosOrb")*2,4);
        if(projectile.meta?.chaosVariant==="fire")applyBurn(enemy,4+skillLevel("chaosOrb")*2,3);
        if(projectile.meta?.chaosVariant==="ice")enemy.chillUntil=state.t+2.5;

        projectile.hitEnemies.add(enemy);
        projectile.hitsRemaining--;

        if(projectile.hitsRemaining<=0&&projectile.ricochetsRemaining>0){
          const target=findNearestEnemyFrom(projectile.x,projectile.y,projectile.hitEnemies,220);
          if(target){
            const angle=Math.atan2(target.y-projectile.y,target.x-projectile.x);
            const speed=Math.hypot(projectile.vx,projectile.vy)||430;
            projectile.vx=Math.cos(angle)*speed;projectile.vy=Math.sin(angle)*speed;
            projectile.ricochetsRemaining--;projectile.hitsRemaining=1;projectile.life=Math.max(projectile.life,.75);
          }else projectile.life=0;
        }else if(projectile.hitsRemaining<=0)projectile.life=0;
      }
    }
  }

  state.projectiles=state.projectiles.filter(p=>p.life>0&&p.hitsRemaining>0&&p.x>-60&&p.x<W+60&&p.y>-60&&p.y<H+60);
  state.enemies=state.enemies.filter(enemy=>!enemy.dead);

  for(const gem of state.gems){
    const dx=player.x-gem.x,dy=player.y-gem.y,magnitude=Math.hypot(dx,dy)||1;
    if(magnitude<player.magnet){
      const speed=190+(player.magnet-magnitude)*2.2;
      gem.x+=dx/magnitude*speed*dt;gem.y+=dy/magnitude*speed*dt;
    }
    if(magnitude<player.r+gem.r+6){gem.dead=true;gainXp(gem.xp);}
  }
  state.gems=state.gems.filter(gem=>!gem.dead);

  for(const particle of state.particles){particle.x+=particle.vx*dt;particle.y+=particle.vy*dt;particle.life-=dt;}
  state.particles=state.particles.filter(particle=>particle.life>0);

  if(player.hp<=0){player.hp=0;finishRun("defeat");}
}

function draw(){
  ctx.clearRect(0,0,W,H);
  ctx.globalAlpha=.10;ctx.strokeStyle="#7f8aa3";ctx.lineWidth=1;
  const grid=42,gridOffset=state.running?(state.t*8)%grid:0;
  for(let x=gridOffset-grid;x<W;x+=grid){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
  for(let y=0;y<H;y+=grid){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
  ctx.globalAlpha=1;

  for(const gem of state.gems){ctx.save();ctx.translate(gem.x,gem.y);ctx.rotate(state.t*2);ctx.fillStyle="#79a7ff";ctx.beginPath();ctx.moveTo(0,-6);ctx.lineTo(5,0);ctx.lineTo(0,6);ctx.lineTo(-5,0);ctx.closePath();ctx.fill();ctx.restore();}

  for(const enemy of state.enemies){
    ctx.save();ctx.translate(enemy.x,enemy.y);
    const allied=isEnemyAllied(enemy);
    ctx.fillStyle=enemy.hit>0?"#ffffff":allied?"#73d6b2":(enemy.elite?"#b66ac8":"#cf6f6f");ctx.beginPath();ctx.arc(0,0,enemy.r,0,Math.PI*2);ctx.fill();
    if(allied){ctx.strokeStyle="rgba(111,255,203,.8)";ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,enemy.r+5+Math.sin(state.t*5)*1.5,0,Math.PI*2);ctx.stroke();}
    if(typeof drawEnemyStatusVisual==="function")drawEnemyStatusVisual(ctx,0,0,enemy.r,enemy,state.t);
    ctx.fillStyle="#17191f";ctx.beginPath();ctx.arc(-enemy.r*.3,-2,2.2,0,Math.PI*2);ctx.arc(enemy.r*.3,-2,2.2,0,Math.PI*2);ctx.fill();
    if(enemy.elite){ctx.strokeStyle="rgba(255,255,255,.55)";ctx.lineWidth=2;ctx.stroke();}
    if(enemy.hp<enemy.maxHp){ctx.fillStyle="rgba(0,0,0,.5)";ctx.fillRect(-enemy.r,-enemy.r-8,enemy.r*2,3);ctx.fillStyle="#fff";ctx.fillRect(-enemy.r,-enemy.r-8,enemy.r*2*(enemy.hp/enemy.maxHp),3);}
    ctx.restore();
  }

  for(const projectile of state.projectiles){
    const tags=projectile.meta?.tags||[];
    if(typeof drawProjectileVisual==="function")drawProjectileVisual(ctx,projectile.x,projectile.y,projectile.r,tags,state.t,{type:projectile.type,source:projectile.meta?.source});
    else{ctx.fillStyle="#e7e7e7";ctx.beginPath();ctx.arc(projectile.x,projectile.y,projectile.r,0,Math.PI*2);ctx.fill();}
  }

  const orbitBase=skillLevel("orbit");
  if(orbitBase){
    const orbitLevel=orbitBase+(hasEvolution("swordDomain")?2:0),radius=hasEvolution("swordDomain")?62:48;
    for(let i=0;i<orbitLevel;i++){
      const angle=player.orbitAngle+i*Math.PI*2/orbitLevel,x=player.x+Math.cos(angle)*radius,y=player.y+Math.sin(angle)*radius;
      if(typeof drawOrbitBladeVisual==="function")drawOrbitBladeVisual(ctx,x,y,angle+Math.PI/2,hasEvolution("swordDomain"),state.t);
      else{ctx.save();ctx.translate(x,y);ctx.rotate(angle+Math.PI/2);ctx.fillStyle="#d9dde8";ctx.fillRect(-2,-10,4,17);ctx.fillStyle="#a8b0c2";ctx.fillRect(-5,5,10,3);ctx.restore();}
    }
  }

  if(state.running||state.gameOver){
    ctx.save();ctx.translate(player.x,player.y);ctx.fillStyle="#d7e2ff";ctx.beginPath();ctx.arc(0,0,player.r,0,Math.PI*2);ctx.fill();ctx.fillStyle="#7284ad";ctx.beginPath();ctx.arc(0,0,8,0,Math.PI*2);ctx.fill();
    if(player.shield>0){if(typeof drawShieldVisual==="function")drawShieldVisual(ctx,0,0,player.r+8,state.t,1);else{ctx.strokeStyle="rgba(120,190,255,.8)";ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,player.r+8,0,Math.PI*2);ctx.stroke();}}
    if((player.invulnerableUntil||0)>state.t){ctx.strokeStyle="rgba(255,230,120,.92)";ctx.lineWidth=3;ctx.globalAlpha=.65+.25*Math.sin(state.t*10);ctx.beginPath();ctx.arc(0,0,player.r+12,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;}
    ctx.strokeStyle="rgba(255,255,255,.25)";ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,player.r+5,0,Math.PI*2);ctx.stroke();ctx.restore();
  }

  for(const particle of state.particles){ctx.globalAlpha=Math.max(0,particle.life/.35);ctx.fillStyle="#fff";ctx.beginPath();ctx.arc(particle.x,particle.y,particle.r,0,Math.PI*2);ctx.fill();}
  ctx.globalAlpha=1;if(state.mode)updateHud();
}

let last=performance.now();
function loop(now){const dt=Math.min(.033,(now-last)/1000);last=now;update(dt);draw();requestAnimationFrame(loop);}
requestAnimationFrame(loop);
