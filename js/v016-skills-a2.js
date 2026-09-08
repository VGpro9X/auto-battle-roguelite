// V0.16 Batch A2 — Bộ Pháp Chấn, Trói Hồn, Hồi Phong Nhận, Tinh Vẫn.
// Skill-side mechanics only; V0.8 strategic movement decisions remain unchanged.

(()=>{
  const runtime=state.v016A2={
    strideDistance:0,
    blades:[],
    meteors:[],
    transient:[]
  };

  const hostileList=()=>state.enemies.filter(enemy=>typeof isEnemyHostile==="function"?isEnemyHostile(enemy):!enemy.dead);
  const fmtSeconds=value=>Number(value.toFixed(2)).toString();

  function strideNeed(level){return 220-20*(level-1);}
  function strideRadius(level){return 80+10*(level-1);}
  function strideDamage(level){return 14+6*(level-1);}
  function strideKnock(level){return 26+6*(level-1);}

  function soulBindCooldown(level){return 7-.7*(level-1);}
  function soulBindDuration(level,elite=false){
    const duration=1+.25*(level-1);
    return elite?duration*.5:duration;
  }
  function soulBindDamage(level){return 10+5*(level-1);}

  function returnBladeCooldown(level){return 4.6-.5*(level-1);}
  function returnBladeDamage(level){return 18+7*(level-1);}

  function meteorCooldown(level){return 6-.55*(level-1);}
  function meteorRadius(level){return 58+8*(level-1);}
  function meteorDamage(level){return 30+12*(level-1);}
  function meteorBurnDps(level){return 3+level;}

  function fastestHostileWithin(maxDistance){
    let best=null,bestSpeed=-Infinity,bestDistance=Infinity;
    for(const enemy of hostileList()){
      const d=Math.hypot(enemy.x-player.x,enemy.y-player.y);
      if(d>maxDistance)continue;
      const speed=enemy.speed||0;
      if(speed>bestSpeed||(speed===bestSpeed&&d<bestDistance)){
        best=enemy;bestSpeed=speed;bestDistance=d;
      }
    }
    return best;
  }

  function farthestHostileWithin(maxDistance){
    let best=null,bestDistance=-1;
    for(const enemy of hostileList()){
      const d=Math.hypot(enemy.x-player.x,enemy.y-player.y);
      if(d<=maxDistance&&d>bestDistance){best=enemy;bestDistance=d;}
    }
    return best;
  }

  function emitStrideShock(level){
    const radius=strideRadius(level);
    const damage=strideDamage(level);
    const knockback=strideKnock(level);
    let hits=0;
    for(const enemy of [...hostileList()]){
      if(Math.hypot(enemy.x-player.x,enemy.y-player.y)>radius+enemy.r)continue;
      hitEnemy(enemy,damage,knockback,{source:"strideShock",tags:["MOVEMENT","AREA","CONTROL"]});
      hits++;
    }
    runtime.transient.push({type:"strideShock",x:player.x,y:player.y,radius,start:state.t,life:.5,hits});
  }

  function castSoulBind(level){
    const target=fastestHostileWithin(260);
    if(!target)return false;
    const duration=soulBindDuration(level,Boolean(target.elite));
    target.soulBoundUntil=Math.max(target.soulBoundUntil||0,state.t+duration);
    target.soulBoundLevel=level;
    hitEnemy(target,soulBindDamage(level),0,{source:"soulBind",tags:["SOUL","CONTROL","PERIODIC"]});
    runtime.transient.push({type:"soulBind",enemy:target,x:target.x,y:target.y,start:state.t,life:.38});
    return true;
  }

  function castReturnBlade(level){
    const target=farthestHostileWithin(340);
    if(!target)return false;
    runtime.blades.push({
      x:player.x,y:player.y,
      targetX:target.x,targetY:target.y,
      level,phase:"out",speed:360,r:6,
      hitOut:new Set(),hitReturn:new Set(),
      angle:Math.atan2(target.y-player.y,target.x-player.x),
      born:state.t,dead:false
    });
    runtime.transient.push({type:"bladeCast",x:player.x,y:player.y,start:state.t,life:.24});
    return true;
  }

  function markMeteor(level){
    const target=typeof randomEnemy==="function"?randomEnemy():hostileList()[0];
    if(!target)return false;
    runtime.meteors.push({
      x:target.x,y:target.y,level,
      markedAt:state.t,impactAt:state.t+.8,dead:false
    });
    return true;
  }

  skills.strideShock={
    name:"Bộ Pháp Chấn",icon:"👣💥",max:5,tags:["MOVEMENT","AREA","CONTROL"],
    desc:level=>`Sau khi di chuyển đủ ${strideNeed(level)} px, phát một chấn sóng bán kính ${strideRadius(level)}, gây ${strideDamage(level)} sát thương và đẩy lùi ${strideKnock(level)}. Quãng đường được cộng dồn giữa các đoạn di chuyển và chỉ tính quãng đường nhân vật thực sự di chuyển.`,
    apply:()=>{}
  };

  skills.soulBind={
    name:"Trói Hồn",icon:"🪢👻",max:5,tags:["SOUL","CONTROL","PERIODIC"],
    desc:level=>`Cứ mỗi ${fmtSeconds(soulBindCooldown(level))} giây, trói kẻ địch có tốc độ cao nhất trong phạm vi 260. Kẻ địch thường không thể di chuyển trong ${fmtSeconds(soulBindDuration(level,false))} giây; Tinh Anh bị trói bằng nửa thời gian đó. Khi áp dụng, gây ${soulBindDamage(level)} sát thương.`,
    apply:()=>{},
    periodic:{cooldown:soulBindCooldown,execute:castSoulBind}
  };

  skills.returnBlade={
    name:"Hồi Phong Nhận",icon:"🪃",max:5,tags:["PROJECTILE","PIERCE","PERIODIC"],
    desc:level=>`Cứ mỗi ${fmtSeconds(returnBladeCooldown(level))} giây, ném một lưỡi đao về phía kẻ địch xa nhất trong phạm vi 340 rồi quay trở lại người chơi. Mỗi kẻ địch có thể bị trúng 1 lần khi đao bay ra và 1 lần khi đao quay về; mỗi lần trúng gây ${returnBladeDamage(level)} sát thương.`,
    apply:()=>{},
    periodic:{cooldown:returnBladeCooldown,execute:castReturnBlade}
  };

  skills.meteorSeal={
    name:"Tinh Vẫn",icon:"☄️",max:5,tags:["FIRE","AREA","EXPLOSION","PERIODIC"],
    desc:level=>`Cứ mỗi ${fmtSeconds(meteorCooldown(level))} giây, đánh dấu vị trí của một kẻ địch ngẫu nhiên. Sau 0.8 giây, thiên thạch rơi xuống vị trí đã đánh dấu trong bán kính ${meteorRadius(level)}, gây ${meteorDamage(level)} sát thương và thiêu đốt kẻ địch trúng đòn trong 2 giây với ${meteorBurnDps(level)} sát thương mỗi giây.`,
    apply:()=>{},
    periodic:{cooldown:meteorCooldown,execute:markMeteor}
  };

  function resetA2(){
    runtime.strideDistance=0;
    runtime.blades.length=0;
    runtime.meteors.length=0;
    runtime.transient.length=0;
    for(const enemy of state.enemies){
      delete enemy.soulBoundUntil;
      delete enemy.soulBoundLevel;
    }
  }

  const baseResetA2=resetSkillEngine;
  resetSkillEngine=function(){
    const result=baseResetA2();
    resetA2();
    return result;
  };

  function segmentPointDistanceSq(x1,y1,x2,y2,px,py){
    const dx=x2-x1,dy=y2-y1;
    const lenSq=dx*dx+dy*dy;
    if(lenSq<=.0001){const ox=px-x1,oy=py-y1;return ox*ox+oy*oy;}
    const t=clamp(((px-x1)*dx+(py-y1)*dy)/lenSq,0,1);
    const cx=x1+dx*t,cy=y1+dy*t,ox=px-cx,oy=py-cy;
    return ox*ox+oy*oy;
  }

  function hitBladeSegment(blade,x1,y1,x2,y2){
    const hitSet=blade.phase==="out"?blade.hitOut:blade.hitReturn;
    const meta={source:"returnBlade",tags:["PROJECTILE","PIERCE","PERIODIC"]};
    for(const enemy of [...hostileList()]){
      if(hitSet.has(enemy))continue;
      const collision=blade.r+enemy.r;
      if(segmentPointDistanceSq(x1,y1,x2,y2,enemy.x,enemy.y)>collision*collision)continue;
      hitSet.add(enemy);
      hitEnemy(enemy,returnBladeDamage(blade.level),0,meta);
      runtime.transient.push({type:"bladeHit",x:enemy.x,y:enemy.y,start:state.t,life:.2});
    }
  }

  function moveBladeToward(blade,tx,ty,dt){
    const dx=tx-blade.x,dy=ty-blade.y,d=Math.hypot(dx,dy);
    if(d<=.0001)return true;
    const step=blade.speed*dt;
    const travel=Math.min(step,d);
    const ux=dx/d,uy=dy/d;
    const oldX=blade.x,oldY=blade.y;
    blade.x+=ux*travel;blade.y+=uy*travel;
    blade.angle=Math.atan2(uy,ux);
    hitBladeSegment(blade,oldX,oldY,blade.x,blade.y);
    return travel>=d-.0001;
  }

  function updateBlades(dt){
    for(const blade of runtime.blades){
      if(blade.dead)continue;
      if(blade.phase==="out"){
        const reached=moveBladeToward(blade,blade.targetX,blade.targetY,dt);
        if(reached){
          blade.phase="return";
          runtime.transient.push({type:"bladeTurn",x:blade.x,y:blade.y,start:state.t,life:.22});
        }
      }else{
        const reached=moveBladeToward(blade,player.x,player.y,dt);
        if(reached){
          blade.dead=true;
          runtime.transient.push({type:"bladeCatch",x:player.x,y:player.y,start:state.t,life:.2});
        }
      }
    }
    runtime.blades=runtime.blades.filter(blade=>!blade.dead);
  }

  function impactMeteor(meteor){
    if(meteor.dead)return;
    meteor.dead=true;
    const radius=meteorRadius(meteor.level);
    const damage=meteorDamage(meteor.level);
    const burnDps=meteorBurnDps(meteor.level);
    for(const enemy of [...hostileList()]){
      if(Math.hypot(enemy.x-meteor.x,enemy.y-meteor.y)>radius+enemy.r)continue;
      hitEnemy(enemy,damage,0,{source:"meteorSeal",tags:["FIRE","AREA","EXPLOSION","PERIODIC"]});
      if(!enemy.dead)applyBurn(enemy,burnDps,2);
    }
    runtime.transient.push({type:"meteorImpact",x:meteor.x,y:meteor.y,radius,start:state.t,life:.55});
  }

  function updateMeteors(){
    for(const meteor of runtime.meteors){
      if(!meteor.dead&&state.t>=meteor.impactAt)impactMeteor(meteor);
    }
    runtime.meteors=runtime.meteors.filter(meteor=>!meteor.dead);
  }

  function freezeBoundEnemiesBeforeFrame(){
    const frozen=[];
    for(const enemy of state.enemies){
      if(enemy.dead||(enemy.soulBoundUntil||0)<=state.t)continue;
      if(typeof isEnemyHostile==="function"&&!isEnemyHostile(enemy))continue;
      frozen.push({enemy,speed:enemy.speed});
      enemy.speed=0;
    }
    return frozen;
  }

  function restoreBoundEnemySpeeds(frozen){
    for(const entry of frozen)entry.enemy.speed=entry.speed;
  }

  const baseUpdateA2=update;
  update=function(dt){
    const beforeX=player.x,beforeY=player.y;
    const frozen=freezeBoundEnemiesBeforeFrame();
    let result;
    try{
      result=baseUpdateA2(dt);
    }finally{
      restoreBoundEnemySpeeds(frozen);
    }

    if(!state.running||state.paused||state.gameOver)return result;

    const strideLevel=skillLevel("strideShock");
    if(strideLevel){
      const moved=Math.hypot(player.x-beforeX,player.y-beforeY);
      runtime.strideDistance+=moved;
      const need=strideNeed(strideLevel);
      while(runtime.strideDistance>=need){
        runtime.strideDistance-=need;
        emitStrideShock(strideLevel);
      }
    }else runtime.strideDistance=0;

    updateBlades(dt);
    updateMeteors();
    runtime.transient=runtime.transient.filter(fx=>state.t-fx.start<fx.life);
    return result;
  };

  function drawStrideCharge(){
    const level=skillLevel("strideShock");
    if(!level)return;
    const progress=clamp(runtime.strideDistance/strideNeed(level),0,1);
    ctx.save();ctx.translate(player.x,player.y);
    ctx.strokeStyle="#a9e4ff";ctx.lineWidth=1.6;ctx.globalAlpha=.22+.35*progress;
    ctx.beginPath();ctx.arc(0,0,31,-Math.PI/2,-Math.PI/2+Math.PI*2*progress);ctx.stroke();
    for(let i=0;i<4;i++){
      const threshold=(i+1)/4;
      const a=-Math.PI/2+i*Math.PI/2;
      ctx.fillStyle=progress>=threshold?"#d8f5ff":"#6f7c91";ctx.globalAlpha=progress>=threshold?.85:.28;
      ctx.beginPath();ctx.arc(Math.cos(a)*31,Math.sin(a)*31,2.2,0,Math.PI*2);ctx.fill();
    }
    ctx.restore();
  }

  function drawSoulBinds(){
    for(const enemy of state.enemies){
      const until=enemy.soulBoundUntil||0;
      if(enemy.dead||until<=state.t)continue;
      const remaining=Math.max(0,until-state.t);
      const pulse=.55+.25*Math.sin(state.t*9);
      ctx.save();ctx.translate(enemy.x,enemy.y);
      ctx.strokeStyle="#9bc5e8";ctx.lineWidth=1.8;ctx.globalAlpha=pulse;
      ctx.beginPath();ctx.arc(0,0,enemy.r+8+Math.sin(state.t*7)*1.2,0,Math.PI*2);ctx.stroke();
      ctx.beginPath();ctx.moveTo(-enemy.r*.7,-2);ctx.lineTo(-enemy.r-11,enemy.r+12);ctx.moveTo(enemy.r*.7,-2);ctx.lineTo(enemy.r+11,enemy.r+12);ctx.stroke();
      ctx.fillStyle="#cce8ff";ctx.globalAlpha=.65;ctx.beginPath();ctx.arc(-enemy.r-11,enemy.r+12,3,0,Math.PI*2);ctx.arc(enemy.r+11,enemy.r+12,3,0,Math.PI*2);ctx.fill();
      ctx.fillStyle="#d9efff";ctx.globalAlpha=.55;ctx.font="9px system-ui";ctx.textAlign="center";ctx.fillText(`${remaining.toFixed(1)}s`,0,-enemy.r-12);
      ctx.restore();
    }
  }

  function drawReturnBlades(){
    for(const blade of runtime.blades){
      ctx.save();ctx.translate(blade.x,blade.y);ctx.rotate(blade.angle+Math.PI/2);
      ctx.strokeStyle=blade.phase==="out"?"#d8e7ff":"#a8f0df";ctx.lineWidth=2.4;ctx.globalAlpha=.9;
      ctx.beginPath();ctx.arc(0,0,8,-2.5,-.65);ctx.stroke();
      ctx.beginPath();ctx.arc(0,0,8,.65,2.5);ctx.stroke();
      ctx.fillStyle="#f2f6ff";ctx.globalAlpha=.92;ctx.beginPath();ctx.moveTo(0,-10);ctx.lineTo(3,-4);ctx.lineTo(-3,-4);ctx.closePath();ctx.fill();
      ctx.restore();

      const back=blade.phase==="out"?-1:1;
      ctx.save();ctx.strokeStyle=blade.phase==="out"?"#a9c9ff":"#80d7c0";ctx.lineWidth=1.6;ctx.globalAlpha=.3;
      ctx.beginPath();ctx.moveTo(blade.x,blade.y);ctx.lineTo(blade.x+Math.cos(blade.angle)*18*back,blade.y+Math.sin(blade.angle)*18*back);ctx.stroke();ctx.restore();
    }
  }

  function drawMeteors(){
    for(const meteor of runtime.meteors){
      const total=.8;
      const remaining=clamp((meteor.impactAt-state.t)/total,0,1);
      const progress=1-remaining;
      const radius=meteorRadius(meteor.level);
      ctx.save();ctx.translate(meteor.x,meteor.y);
      ctx.strokeStyle="#ff9b68";ctx.lineWidth=2;ctx.globalAlpha=.35+.35*progress;
      ctx.beginPath();ctx.arc(0,0,radius*(.72+.28*progress),0,Math.PI*2);ctx.stroke();
      ctx.strokeStyle="#ffd0a5";ctx.lineWidth=1.4;ctx.globalAlpha=.5;
      ctx.beginPath();ctx.arc(0,0,12+progress*(radius-12),-Math.PI/2,-Math.PI/2+Math.PI*2*progress);ctx.stroke();
      const streakY=-85+progress*76;
      ctx.strokeStyle="#ffd6b4";ctx.lineWidth=3;ctx.globalAlpha=.35+.55*progress;
      ctx.beginPath();ctx.moveTo(22,streakY-28);ctx.lineTo(2,streakY);ctx.stroke();
      ctx.fillStyle="#fff1d5";ctx.beginPath();ctx.arc(2,streakY,3+3*progress,0,Math.PI*2);ctx.fill();
      ctx.restore();
    }
  }

  function drawTransient(){
    for(const fx of runtime.transient){
      const p=clamp((state.t-fx.start)/fx.life,0,1),fade=1-p;
      ctx.save();
      if(fx.type==="strideShock"){
        ctx.strokeStyle="#bcecff";ctx.lineWidth=2.4;ctx.globalAlpha=.72*fade;
        ctx.beginPath();ctx.arc(fx.x,fx.y,12+p*fx.radius,0,Math.PI*2);ctx.stroke();
      }else if(fx.type==="meteorImpact"){
        ctx.fillStyle="#ffb26f";ctx.globalAlpha=.18*fade;ctx.beginPath();ctx.arc(fx.x,fx.y,fx.radius*(.45+.55*p),0,Math.PI*2);ctx.fill();
        ctx.strokeStyle="#ffd0a0";ctx.lineWidth=3;ctx.globalAlpha=.72*fade;ctx.beginPath();ctx.arc(fx.x,fx.y,8+p*fx.radius,0,Math.PI*2);ctx.stroke();
      }else if(fx.type==="soulBind"){
        const x=fx.enemy&&!fx.enemy.dead?fx.enemy.x:fx.x,y=fx.enemy&&!fx.enemy.dead?fx.enemy.y:fx.y;
        ctx.strokeStyle="#b7dcff";ctx.lineWidth=2;ctx.globalAlpha=.7*fade;ctx.beginPath();ctx.arc(x,y,5+p*24,0,Math.PI*2);ctx.stroke();
      }else{
        const color=fx.type==="bladeHit"?"#e6efff":fx.type==="bladeTurn"?"#a8f0df":"#c8d8ff";
        ctx.strokeStyle=color;ctx.lineWidth=1.8;ctx.globalAlpha=.62*fade;ctx.beginPath();ctx.arc(fx.x,fx.y,5+p*16,0,Math.PI*2);ctx.stroke();
      }
      ctx.restore();
    }
  }

  const baseDrawA2=draw;
  draw=function(){
    baseDrawA2();
    if(!state.running&&!state.gameOver)return;
    drawStrideCharge();
    drawSoulBinds();
    drawReturnBlades();
    drawMeteors();
    drawTransient();
  };

  // Dedicated Codex identities for A2.
  if(typeof SKILL_VISUAL_PROFILES!=="undefined"&&typeof SKILL_SCENE_DRAWERS!=="undefined"){
    SKILL_VISUAL_PROFILES.strideShock={scene:"v016StrideShock",tone:"#bcecff"};
    SKILL_VISUAL_PROFILES.soulBind={scene:"v016SoulBind",tone:"#9bc5e8"};
    SKILL_VISUAL_PROFILES.returnBlade={scene:"v016ReturnBlade",tone:"#d8e7ff"};
    SKILL_VISUAL_PROFILES.meteorSeal={scene:"v016MeteorSeal",tone:"#ff9b68"};

    SKILL_SCENE_DRAWERS.v016StrideShock=(g,time,w,h)=>{
      const cx=w*.43,cy=h*.55;v12Actor(g,cx,cy,10);
      const p=(time*.5)%1;
      v12Ring(g,cx,cy,20+p*45,"#bcecff",.72*(1-p),2);
      for(let i=0;i<4;i++)drawGlowDot(g,cx-38+i*12,cy+30,2.6,i<Math.floor(((time*.8)%1)*5)?"#dff7ff":"#66758d",.8);
      v12Enemy(g,w*.78,h*.52,8);
    };

    SKILL_SCENE_DRAWERS.v016SoulBind=(g,time,w,h)=>{
      const x=w*.65,y=h*.51;v12Actor(g,w*.25,h*.58,9);v12Enemy(g,x,y,9);
      v12Line(g,x-7,y,x-22,y+28,"#9bc5e8",2,.75);v12Line(g,x+7,y,x+22,y+28,"#9bc5e8",2,.75);
      v12Ring(g,x,y,17+Math.sin(time*7)*2,"#b7dcff",.65,2);
      drawGlowDot(g,x-22,y+28,3,"#d8efff",.9);drawGlowDot(g,x+22,y+28,3,"#d8efff",.9);
    };

    SKILL_SCENE_DRAWERS.v016ReturnBlade=(g,time,w,h)=>{
      const ax=w*.22,ay=h*.57,bx=w*.80,by=h*.48;v12Actor(g,ax,ay,9);v12Enemy(g,bx,by,8);
      const phase=(time*.42)%2;
      const t=phase<=1?phase:2-phase;
      const x=ax+(bx-ax)*t,y=ay+(by-ay)*t;
      v12Projectile(g,x,y,4,phase<=1?"#d8e7ff":"#a8f0df",time,20);
      v12Line(g,ax,ay,bx,by,"#8fa8c9",1,.2);
    };

    SKILL_SCENE_DRAWERS.v016MeteorSeal=(g,time,w,h)=>{
      const x=w*.68,y=h*.61,r=34;
      v12Actor(g,w*.24,h*.59,9);v12Enemy(g,x,y,8);
      const p=(time%1.6)/1.6;
      if(p<.5){
        const q=p/.5;v12Ring(g,x,y,r*(.72+.28*q),"#ff9b68",.45+.3*q,2);
        v12Line(g,x+18,y-70+q*58,x,y-5,"#ffd0a5",3,.45+.45*q);
      }else{
        const q=(p-.5)/.5;v12Ring(g,x,y,8+q*r,"#ffd0a0",.8*(1-q),3);
        g.save();g.fillStyle="#ff9b68";g.globalAlpha=.18*(1-q);g.beginPath();g.arc(x,y,r*(.5+.5*q),0,Math.PI*2);g.fill();g.restore();
      }
    };
  }
})();