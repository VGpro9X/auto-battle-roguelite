// V0.16 Batch A1 — Dư Ảnh, Địa Lôi Phù, Huyết Liên, Linh Châu.
// Adds mechanics + live/Codex visuals without changing V0.8 movement AI.

(()=>{
  const runtime=state.v016A1={
    afterimages:[],
    mines:[],
    bloodLink:null,
    pearlCharge:0,
    pearls:0,
    pearlFireAt:0,
    transient:[]
  };

  const hostileList=()=>state.enemies.filter(enemy=>typeof isEnemyHostile==="function"?isEnemyHostile(enemy):!enemy.dead);

  function nearestHostileFrom(x,y){
    let best=null,bestD=Infinity;
    for(const enemy of hostileList()){
      const d=Math.hypot(enemy.x-x,enemy.y-y);
      if(d<bestD){bestD=d;best=enemy;}
    }
    return best;
  }

  function createTravelSafeProjectile(x,y,target,damage,speed,radius,type,meta){
    if(!target||target.dead)return null;
    const angle=Math.atan2(target.y-y,target.x-x);
    const actualSpeed=speed*player.projectileSpeedMultiplier;
    const distance=Math.hypot(target.x-x,target.y-y);
    const projectile={
      x,y,
      vx:Math.cos(angle)*actualSpeed,
      vy:Math.sin(angle)*actualSpeed,
      r:radius,
      damage,
      life:Math.max(1.6,distance/Math.max(1,actualSpeed)+.55),
      type,
      hitsRemaining:1,
      ricochetsRemaining:0,
      hitEnemies:new Set(),
      meta:{source:type,tags:["PROJECTILE"],...meta}
    };
    state.projectiles.push(projectile);
    return projectile;
  }

  function afterimageCooldown(level){return 6-.6*(level-1);}
  function afterimageRatio(level){return .45+.10*(level-1);}
  function spawnAfterimage(level){
    runtime.afterimages.push({
      x:player.x,y:player.y,level,
      born:state.t,until:state.t+1.8,
      shots:[state.t+.12,state.t+.47],
      fired:0
    });
    runtime.transient.push({type:"afterimageSpawn",x:player.x,y:player.y,start:state.t,life:.42});
    return true;
  }

  function runeCooldown(level){return 4.8-.45*(level-1);}
  function runeMax(level){return 2+Math.floor((level-1)/2);}
  function placeRune(level){
    runtime.mines=runtime.mines.filter(m=>!m.dead&&m.expiresAt>state.t);
    const max=runeMax(level);
    if(runtime.mines.length>=max){
      runtime.mines.sort((a,b)=>a.createdAt-b.createdAt);
      const oldest=runtime.mines.shift();
      if(oldest)runtime.transient.push({type:"runeFade",x:oldest.x,y:oldest.y,start:state.t,life:.28});
    }
    runtime.mines.push({
      x:player.x,y:player.y,level,
      createdAt:state.t,
      armedAt:state.t+.45,
      expiresAt:state.t+5,
      dead:false
    });
    return true;
  }

  function bloodLinkCooldown(level){return 7-.65*(level-1);}
  function createBloodLink(level){
    const targets=getNearestEnemies(2);
    if(targets.length<2)return false;
    runtime.bloodLink={a:targets[0],b:targets[1],level,startedAt:state.t,until:state.t+4.5,lastPulse:state.t};
    return true;
  }

  function pearlCap(level){return 1+Math.floor((level-1)/2);}
  function pearlDamage(level){return 25+7*(level-1);}

  skills.afterimage={
    name:"Dư Ảnh",icon:"👤",max:5,tags:["TIME","SUMMON","ATTACK","PROJECTILE"],
    desc:level=>`Cứ mỗi ${afterimageCooldown(level).toFixed(1)} giây tạo 1 Dư Ảnh tại vị trí hiện tại trong 1.8 giây. Dư Ảnh bắn 2 phát cách nhau 0.35 giây, mỗi phát gây ${Math.round(afterimageRatio(level)*100)}% sát thương cơ bản của đòn đánh thường và không kích hoạt hiệu ứng đòn đánh thường.`,
    apply:()=>{},
    periodic:{cooldown:afterimageCooldown,execute:spawnAfterimage}
  };

  skills.runeMine={
    name:"Địa Lôi Phù",icon:"🔻",max:5,tags:["AREA","EXPLOSION","PERIODIC","CONTROL"],
    desc:level=>`Cứ mỗi ${runeCooldown(level).toFixed(2)} giây đặt 1 phù tại vị trí hiện tại. Phù lên đạn sau 0.45 giây, tồn tại 5 giây, kích hoạt khi địch vào bán kính ${55+5*(level-1)}, rồi nổ bán kính ${68+8*(level-1)} gây ${28+10*(level-1)} sát thương và đẩy lùi ${40+5*(level-1)}. Tối đa ${runeMax(level)} phù; nếu đã đầy, phù cũ nhất biến mất khi đặt phù mới.`,
    apply:()=>{},
    periodic:{cooldown:runeCooldown,execute:placeRune}
  };

  skills.bloodLink={
    name:"Huyết Liên",icon:"🩸⛓️",max:5,tags:["BLOOD","CHAIN","PERIODIC","DAMAGE"],
    desc:level=>`Cứ mỗi ${bloodLinkCooldown(level).toFixed(2)} giây liên kết 2 kẻ địch gần nhất trong 4.5 giây. ${16+4*(level-1)}% sát thương một mục tiêu nhận được sao chép sang mục tiêu còn lại. Sát thương Huyết Liên không tự lặp và không kích hoạt hiệu ứng khi đánh trúng. Chỉ tồn tại 1 cặp liên kết.`,
    apply:()=>{},
    periodic:{cooldown:bloodLinkCooldown,execute:createBloodLink}
  };

  skills.spiritPearl={
    name:"Linh Châu",icon:"🔮",max:5,tags:["HEAL","SUMMON","CHARGE","PROJECTILE"],
    desc:level=>`Mỗi 8 HP thực sự được hồi sẽ nạp 1 Linh Châu, tối đa ${pearlCap(level)} viên. Cứ mỗi 2.2 giây, nếu có Linh Châu, tiêu hao 1 viên bắn kẻ địch gần nhất gây ${pearlDamage(level)} sát thương. Hồi vượt HP tối đa không nạp Linh Châu; khi đã đầy, hồi thêm không tích điện.`,
    apply:()=>{}
  };

  function resetA1(){
    runtime.afterimages.length=0;
    runtime.mines.length=0;
    runtime.bloodLink=null;
    runtime.pearlCharge=0;
    runtime.pearls=0;
    runtime.pearlFireAt=0;
    runtime.transient.length=0;
  }

  const baseResetA1=resetSkillEngine;
  resetSkillEngine=function(){
    const result=baseResetA1();
    resetA1();
    return result;
  };

  onSkillEvent("heal",payload=>{
    const level=skillLevel("spiritPearl");
    if(!level||!payload?.amount)return;
    const cap=pearlCap(level);
    if(runtime.pearls>=cap){runtime.pearlCharge=0;return;}
    runtime.pearlCharge+=payload.amount;
    while(runtime.pearlCharge>=8&&runtime.pearls<cap){
      runtime.pearlCharge-=8;
      runtime.pearls++;
      runtime.transient.push({type:"pearlCharge",x:player.x,y:player.y,start:state.t,life:.42});
    }
    if(runtime.pearls>=cap)runtime.pearlCharge=0;
  });

  onSkillEvent("skill_selected",payload=>{
    if(payload?.key==="spiritPearl"&&runtime.pearlFireAt<=state.t)runtime.pearlFireAt=state.t+2.2;
  });

  onSkillEvent("hit",payload=>{
    const link=runtime.bloodLink;
    if(!link||state.t>=link.until||!payload?.enemy||payload.damage<=0)return;
    if(payload.meta?.source==="bloodLink")return;
    let partner=null;
    if(payload.enemy===link.a)partner=link.b;
    else if(payload.enemy===link.b)partner=link.a;
    if(!partner||partner.dead)return;

    const desired=payload.damage*(.16+.04*(link.level-1));
    const meta={source:"bloodLink",tags:["BLOOD","CHAIN","DAMAGE"],allowProcs:false};
    const multiplier=Math.max(.0001,getOutgoingDamageMultiplier(partner,meta));
    hitEnemy(partner,desired/multiplier,0,meta);
    link.lastPulse=state.t;
    runtime.transient.push({type:"bloodPulse",x1:payload.enemy.x,y1:payload.enemy.y,x2:partner.x,y2:partner.y,start:state.t,life:.26});
  });

  function updateAfterimages(){
    for(const clone of runtime.afterimages){
      while(clone.fired<clone.shots.length&&state.t>=clone.shots[clone.fired]&&state.t<clone.until){
        const target=nearestHostileFrom(clone.x,clone.y);
        if(target){
          createTravelSafeProjectile(clone.x,clone.y,target,player.damage*afterimageRatio(clone.level),390,4,"afterimage",{
            source:"afterimage",tags:["TIME","SUMMON","ATTACK","PROJECTILE"],allowProcs:false
          });
          runtime.transient.push({type:"afterimageShot",x:clone.x,y:clone.y,start:state.t,life:.22});
        }
        clone.fired++;
      }
    }
    runtime.afterimages=runtime.afterimages.filter(clone=>state.t<clone.until);
  }

  function detonateMine(mine){
    if(mine.dead)return;
    mine.dead=true;
    const level=mine.level;
    const radius=68+8*(level-1);
    const damage=28+10*(level-1);
    const knock=40+5*(level-1);
    for(const enemy of [...hostileList()]){
      const dx=enemy.x-mine.x,dy=enemy.y-mine.y;
      const d=Math.hypot(dx,dy);
      if(d>radius+enemy.r)continue;
      hitEnemy(enemy,damage,0,{source:"runeMine",tags:["AREA","EXPLOSION","CONTROL","PERIODIC"],allowProcs:false});
      if(!enemy.dead&&knock>0){
        const m=d||1;
        enemy.x+=dx/m*knock;
        enemy.y+=dy/m*knock;
      }
    }
    runtime.transient.push({type:"runeBlast",x:mine.x,y:mine.y,radius,start:state.t,life:.48});
  }

  function updateMines(){
    for(const mine of runtime.mines){
      if(mine.dead)continue;
      if(state.t>=mine.expiresAt){mine.dead=true;continue;}
      if(state.t<mine.armedAt)continue;
      const triggerRadius=55+5*(mine.level-1);
      let triggered=false;
      for(const enemy of hostileList()){
        if(Math.hypot(enemy.x-mine.x,enemy.y-mine.y)<=triggerRadius+enemy.r){triggered=true;break;}
      }
      if(triggered)detonateMine(mine);
    }
    runtime.mines=runtime.mines.filter(mine=>!mine.dead&&state.t<mine.expiresAt);
  }

  function updateBloodLink(){
    const link=runtime.bloodLink;
    if(!link)return;
    if(state.t>=link.until||link.a?.dead||link.b?.dead)runtime.bloodLink=null;
  }

  function updatePearls(){
    const level=skillLevel("spiritPearl");
    if(!level){runtime.pearls=0;runtime.pearlCharge=0;runtime.pearlFireAt=0;return;}
    const cap=pearlCap(level);
    runtime.pearls=Math.min(runtime.pearls,cap);
    if(runtime.pearlFireAt<=0)runtime.pearlFireAt=state.t+2.2;
    if(state.t<runtime.pearlFireAt)return;
    runtime.pearlFireAt+=2.2;
    if(runtime.pearls<=0)return;
    const target=nearestHostileFrom(player.x,player.y);
    if(!target)return;
    runtime.pearls--;
    createTravelSafeProjectile(player.x,player.y,target,pearlDamage(level),400,5,"spiritPearl",{
      source:"spiritPearl",tags:["HEAL","SUMMON","CHARGE","PROJECTILE"],allowProcs:false
    });
    runtime.transient.push({type:"pearlShot",x:player.x,y:player.y,start:state.t,life:.3});
  }

  const baseUpdateA1=update;
  update=function(dt){
    const result=baseUpdateA1(dt);
    if(!state.running||state.paused||state.gameOver)return result;
    updateAfterimages();
    updateMines();
    updateBloodLink();
    updatePearls();
    runtime.transient=runtime.transient.filter(fx=>state.t-fx.start<fx.life);
    return result;
  };

  function drawAfterimageActor(clone){
    const age=state.t-clone.born;
    const remain=clamp((clone.until-state.t)/1.8,0,1);
    const pulse=.72+.18*Math.sin(age*9);
    ctx.save();ctx.translate(clone.x,clone.y);ctx.globalAlpha=.25+.42*remain;
    ctx.fillStyle="#b9c9ff";
    ctx.beginPath();ctx.moveTo(0,-14);ctx.lineTo(10,10);ctx.lineTo(0,6);ctx.lineTo(-10,10);ctx.closePath();ctx.fill();
    ctx.fillStyle="#eef3ff";ctx.globalAlpha*=pulse;ctx.beginPath();ctx.arc(0,-8,4.5,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle="#b9c9ff";ctx.lineWidth=1.5;ctx.globalAlpha=.35*remain;ctx.beginPath();ctx.arc(0,0,18+Math.sin(age*7)*2,0,Math.PI*2);ctx.stroke();
    ctx.restore();
  }

  function drawRune(mine){
    const armed=state.t>=mine.armedAt;
    const age=state.t-mine.createdAt;
    const r=15+mine.level*1.2;
    ctx.save();ctx.translate(mine.x,mine.y);ctx.rotate(age*(armed?.8:.35));
    ctx.strokeStyle=armed?"#ff9f73":"#9ca8c9";ctx.lineWidth=armed?2:1.4;ctx.globalAlpha=armed?.82:.48;
    ctx.beginPath();
    for(let i=0;i<6;i++){
      const a=-Math.PI/2+i*Math.PI/3,rr=i%2?r:r*.62;
      const x=Math.cos(a)*rr,y=Math.sin(a)*rr;
      i?ctx.lineTo(x,y):ctx.moveTo(x,y);
    }
    ctx.closePath();ctx.stroke();
    ctx.globalAlpha=armed?(.18+.08*Math.sin(state.t*8)):.08;ctx.fillStyle="#ff8d65";ctx.fill();ctx.restore();
  }

  function drawBloodLink(){
    const link=runtime.bloodLink;
    if(!link||link.a?.dead||link.b?.dead)return;
    const life=clamp((link.until-state.t)/4.5,0,1);
    ctx.save();ctx.strokeStyle="#e55d78";ctx.lineWidth=2.2;ctx.globalAlpha=.45+.25*Math.sin(state.t*7);
    ctx.beginPath();ctx.moveTo(link.a.x,link.a.y);ctx.lineTo(link.b.x,link.b.y);ctx.stroke();
    ctx.fillStyle="#ff9aaa";ctx.globalAlpha=.65*life;
    const t=(state.t*1.3)%1,x=link.a.x+(link.b.x-link.a.x)*t,y=link.a.y+(link.b.y-link.a.y)*t;
    ctx.beginPath();ctx.arc(x,y,2.5,0,Math.PI*2);ctx.fill();ctx.restore();
  }

  function drawPearls(){
    const count=runtime.pearls;
    if(!count)return;
    ctx.save();
    for(let i=0;i<count;i++){
      const a=state.t*2.1+i*Math.PI*2/count;
      const r=27+i*2;
      const x=player.x+Math.cos(a)*r,y=player.y+Math.sin(a)*r*.72;
      ctx.globalAlpha=.22;ctx.fillStyle="#9ee8ff";ctx.beginPath();ctx.arc(x,y,8,0,Math.PI*2);ctx.fill();
      ctx.globalAlpha=.95;ctx.fillStyle="#d6fbff";ctx.beginPath();ctx.arc(x,y,3.3,0,Math.PI*2);ctx.fill();
    }
    ctx.restore();
  }

  function drawTransient(){
    for(const fx of runtime.transient){
      const p=clamp((state.t-fx.start)/fx.life,0,1),fade=1-p;
      ctx.save();
      if(fx.type==="runeBlast"){
        ctx.strokeStyle="#ff9368";ctx.lineWidth=2.5;ctx.globalAlpha=fade*.8;ctx.beginPath();ctx.arc(fx.x,fx.y,12+p*fx.radius,0,Math.PI*2);ctx.stroke();
      }else if(fx.type==="runeFade"){
        ctx.strokeStyle="#8792aa";ctx.lineWidth=1.5;ctx.globalAlpha=fade*.45;ctx.beginPath();ctx.arc(fx.x,fx.y,12+p*12,0,Math.PI*2);ctx.stroke();
      }else if(fx.type==="bloodPulse"){
        ctx.strokeStyle="#ff7c92";ctx.lineWidth=3;ctx.globalAlpha=fade*.82;ctx.beginPath();ctx.moveTo(fx.x1,fx.y1);ctx.lineTo(fx.x2,fx.y2);ctx.stroke();
      }else{
        const color=fx.type.startsWith("pearl")?"#bff7ff":"#cbd7ff";
        ctx.strokeStyle=color;ctx.lineWidth=1.8;ctx.globalAlpha=fade*.65;ctx.beginPath();ctx.arc(fx.x,fx.y,6+p*18,0,Math.PI*2);ctx.stroke();
      }
      ctx.restore();
    }
  }

  const baseDrawA1=draw;
  draw=function(){
    baseDrawA1();
    if(!state.running&&!state.gameOver)return;
    for(const mine of runtime.mines)drawRune(mine);
    for(const clone of runtime.afterimages)drawAfterimageActor(clone);
    drawBloodLink();
    drawPearls();
    drawTransient();
  };

  // Codex identities for the four new base skills.
  if(typeof SKILL_VISUAL_PROFILES!=="undefined"&&typeof SKILL_SCENE_DRAWERS!=="undefined"){
    SKILL_VISUAL_PROFILES.afterimage={scene:"v016Afterimage",tone:"#b9c9ff"};
    SKILL_VISUAL_PROFILES.runeMine={scene:"v016RuneMine",tone:"#ff9f73"};
    SKILL_VISUAL_PROFILES.bloodLink={scene:"v016BloodLink",tone:"#e55d78"};
    SKILL_VISUAL_PROFILES.spiritPearl={scene:"v016SpiritPearl",tone:"#bff7ff"};

    SKILL_SCENE_DRAWERS.v016Afterimage=(g,time,w,h)=>{
      v12Actor(g,w*.33,h*.57,10);
      g.save();g.globalAlpha=.42;v12Actor(g,w*.60,h*.50,9);g.restore();
      const x=w*.60+((time*.55)%1)*w*.22;
      v12Projectile(g,x,h*.46,3,"#d8e2ff",time,18);
      v12Enemy(g,w*.86,h*.46,8);
    };

    SKILL_SCENE_DRAWERS.v016RuneMine=(g,time,w,h)=>{
      v12Actor(g,w*.28,h*.54,9);
      const x=w*.57,y=h*.61,r=13+Math.sin(time*4)*1.5;
      v12Ring(g,x,y,r,"#ff9f73",.85,2);
      g.save();g.translate(x,y);g.rotate(time*.8);g.strokeStyle="#ffb28e";g.globalAlpha=.8;g.beginPath();
      for(let i=0;i<6;i++){const a=i*Math.PI/3,rr=i%2?r:r*.55;const px=Math.cos(a)*rr,py=Math.sin(a)*rr;i?g.lineTo(px,py):g.moveTo(px,py);}g.closePath();g.stroke();g.restore();
      v12Enemy(g,w*.77,h*.58,8);
    };

    SKILL_SCENE_DRAWERS.v016BloodLink=(g,time,w,h)=>{
      const ax=w*.34,ay=h*.52,bx=w*.72,by=h*.48;
      v12Enemy(g,ax,ay,9);v12Enemy(g,bx,by,9);
      v12Line(g,ax,ay,bx,by,"#e55d78",2.4,.7+.2*Math.sin(time*6));
      const t=(time*.7)%1;drawGlowDot(g,ax+(bx-ax)*t,ay+(by-ay)*t,3,"#ff9aaa",.9);
    };

    SKILL_SCENE_DRAWERS.v016SpiritPearl=(g,time,w,h)=>{
      const cx=w*.45,cy=h*.55;v12Actor(g,cx,cy,10);
      for(let i=0;i<3;i++){
        const a=time*2+i*Math.PI*2/3;
        drawGlowDot(g,cx+Math.cos(a)*27,cy+Math.sin(a)*18,4,"#bff7ff",.95);
      }
      const px=w*.67+((time*.5)%1)*w*.18;v12Projectile(g,px,h*.43,3,"#d6fbff",time,15);v12Enemy(g,w*.88,h*.43,8);
    };
  }
})();
