// V0.16 Hợp Đạo Batch B1 — Vạn Ảnh Xạ, Trọng Lực Phù Trận,
// Huyết Mạch Cộng Sinh, Linh Châu Dưỡng Mệnh.
// Extends the live registries after A1-A4 load; no V0.8 movement decisions are changed.

(()=>{
  Object.assign(SYNERGIES,{
    afterimageEcho:{
      id:"afterimageEcho",name:"Vạn Ảnh Xạ",icon:"👥↩",
      requires:{skills:["afterimage","echoShot"]},
      desc:"Khi Ảnh Xạ kích hoạt, mọi Dư Ảnh đang tồn tại bắn thêm 1 phát vào cùng mục tiêu với sát thương Dư Ảnh hiện tại và không kích hoạt hiệu ứng đòn đánh thường. Nếu không có Dư Ảnh, tạo 1 vi ảnh trong 0.8 giây chỉ để bắn phát đó."
    },
    gravityRune:{
      id:"gravityRune",name:"Trọng Lực Phù Trận",icon:"🔻◉",
      requires:{skills:["runeMine","blackHole"]},
      desc:"Ngay trước khi Địa Lôi Phù nổ, mọi kẻ địch có tâm nằm trong 105px bị kéo 36px về tâm phù, hoặc tới tâm nếu đang gần hơn. Lực kéo không gây sát thương."
    },
    bloodSymbiosis:{
      id:"bloodSymbiosis",name:"Huyết Mạch Cộng Sinh",icon:"🩸♡",
      requires:{skills:["bloodLink","vampiricTouch"]},
      desc:"Mỗi lần Huyết Liên sao chép sát thương sang mục tiêu còn lại, hồi HP bằng 10% lượng sát thương sao chép thực tế sau các hệ số sát thương của mục tiêu."
    },
    nourishingPearls:{
      id:"nourishingPearls",name:"Linh Châu Dưỡng Mệnh",icon:"🔮✚",
      requires:{skills:["spiritPearl","xpHeal"]},
      desc:"Lượng HP thực sự hồi bởi Linh Dưỡng được tính gấp đôi khi nạp Linh Châu. Mỗi Linh Châu đánh trúng mục tiêu còn hồi đúng 0.5 HP."
    }
  });

  const runtime=state.v016B1={
    microImages:[],
    transient:[]
  };

  const hostileList=()=>state.enemies.filter(enemy=>typeof isEnemyHostile==="function"?isEnemyHostile(enemy):!enemy.dead);
  const afterimageRatio=level=>.45+.10*(level-1);
  const pearlCap=level=>1+Math.floor((level-1)/2);

  function fireAfterimageEcho(target){
    if(!hasSynergy("afterimageEcho")||!target||target.dead)return;
    const currentLevel=skillLevel("afterimage");
    if(!currentLevel)return;

    const active=(state.v016A1?.afterimages||[]).filter(clone=>state.t<clone.until);
    if(active.length){
      for(const clone of active){
        createProjectileFrom(clone.x,clone.y,target,player.damage*afterimageRatio(clone.level||currentLevel),390,4,"afterimageEcho",0,{
          source:"afterimageEcho",tags:["TIME","SUMMON","ATTACK","PROJECTILE"],allowProcs:false
        });
        runtime.transient.push({type:"afterimageEcho",x:clone.x,y:clone.y,start:state.t,life:.28});
      }
      return;
    }

    const dx=target.x-player.x,dy=target.y-player.y,d=Math.hypot(dx,dy)||1;
    const micro={
      x:player.x-dx/d*18,
      y:player.y-dy/d*18,
      born:state.t,
      until:state.t+.8
    };
    runtime.microImages.push(micro);
    createProjectileFrom(micro.x,micro.y,target,player.damage*afterimageRatio(currentLevel),390,4,"afterimageEcho",0,{
      source:"afterimageEcho",tags:["TIME","SUMMON","ATTACK","PROJECTILE"],allowProcs:false
    });
    runtime.transient.push({type:"microEcho",x:micro.x,y:micro.y,start:state.t,life:.34});
  }

  // The base echoShot attack listener runs before this B1 listener. Its counter is
  // reset to zero only on the attack that actually fired Ảnh Xạ, so B1 can attach
  // to the real activation without maintaining a second hidden counter.
  onSkillEvent("attack",payload=>{
    if(!hasSynergy("afterimageEcho")||!payload?.target||payload.target.dead)return;
    const echo=skillLevel("echoShot");
    if(!echo)return;
    if((skillRuntime.counters.echoShot||0)!==0)return;
    fireAfterimageEcho(payload.target);
  });

  function manuallyDetonateGravityRune(mine){
    if(!mine||mine.dead)return;
    mine.dead=true;

    // Hợp Đạo stage: one deterministic 36px inward impulse before the normal blast.
    const pulled=[];
    for(const enemy of hostileList()){
      const dx=mine.x-enemy.x,dy=mine.y-enemy.y,d=Math.hypot(dx,dy);
      if(d>105||d<=.0001)continue;
      const travel=Math.min(36,d);
      enemy.x+=dx/d*travel;
      enemy.y+=dy/d*travel;
      pulled.push(enemy);
    }
    runtime.transient.push({type:"gravityRune",x:mine.x,y:mine.y,start:state.t,life:.42,pulled});

    // Replicate A1's documented Địa Lôi Phù blast exactly after the pull.
    const level=mine.level;
    const radius=68+8*(level-1);
    const damage=28+10*(level-1);
    const knock=40+5*(level-1);
    for(const enemy of [...hostileList()]){
      const dx=enemy.x-mine.x,dy=enemy.y-mine.y,d=Math.hypot(dx,dy);
      if(d>radius+enemy.r)continue;
      hitEnemy(enemy,damage,0,{source:"runeMine",tags:["AREA","EXPLOSION","CONTROL","PERIODIC"],allowProcs:false});
      if(!enemy.dead&&knock>0){
        const m=d||1;
        enemy.x+=dx/m*knock;
        enemy.y+=dy/m*knock;
      }
    }
    state.v016A1?.transient?.push({type:"runeBlast",x:mine.x,y:mine.y,radius,start:state.t,life:.48});
  }

  // When Trọng Lực Phù Trận is active, temporarily prevent A1's private mine updater
  // from detonating. Core movement/status updates still run normally. After the frame
  // has advanced, B1 evaluates the exact same trigger condition, performs the pull,
  // then executes the original documented blast.
  const baseUpdateB1=update;
  update=function(dt){
    const mines=state.v016A1?.mines||[];
    const intercept=Boolean(hasSynergy("gravityRune")&&state.running&&!state.paused&&!state.gameOver&&mines.length);
    const armedTimes=intercept?mines.map(mine=>[mine,mine.armedAt]):[];
    if(intercept)for(const [mine] of armedTimes)mine.armedAt=Infinity;

    let result;
    try{
      result=baseUpdateB1(dt);
    }finally{
      for(const [mine,armedAt] of armedTimes)mine.armedAt=armedAt;
    }

    if(!state.running||state.paused||state.gameOver)return result;

    if(hasSynergy("gravityRune")&&state.v016A1?.mines?.length){
      for(const mine of [...state.v016A1.mines]){
        if(mine.dead||state.t>=mine.expiresAt||state.t<mine.armedAt)continue;
        const triggerRadius=55+5*(mine.level-1);
        const triggered=hostileList().some(enemy=>Math.hypot(enemy.x-mine.x,enemy.y-mine.y)<=triggerRadius+enemy.r);
        if(triggered)manuallyDetonateGravityRune(mine);
      }
      state.v016A1.mines=state.v016A1.mines.filter(mine=>!mine.dead&&state.t<mine.expiresAt);
    }

    runtime.microImages=runtime.microImages.filter(image=>state.t<image.until);
    runtime.transient=runtime.transient.filter(fx=>state.t-fx.start<fx.life);
    return result;
  };

  onSkillEvent("hit",payload=>{
    if(!payload?.enemy||payload.damage<=0)return;

    if(hasSynergy("bloodSymbiosis")&&payload.meta?.source==="bloodLink"){
      const healed=healPlayer(payload.damage*.10,{source:"bloodSymbiosis"});
      if(healed>0)runtime.transient.push({type:"bloodReturn",x:payload.enemy.x,y:payload.enemy.y,start:state.t,life:.38});
    }

    if(hasSynergy("nourishingPearls")&&payload.meta?.source==="spiritPearl"){
      const healed=healPlayer(.5,{source:"nourishingPearls"});
      if(healed>0)runtime.transient.push({type:"pearlReturn",x:payload.enemy.x,y:payload.enemy.y,start:state.t,life:.38});
    }
  });

  // A1 already counts the actual xpHeal amount once. Add one more identical contribution
  // after that listener to make Linh Dưỡng count exactly x2 toward Linh Châu.
  onSkillEvent("heal",payload=>{
    if(!hasSynergy("nourishingPearls")||payload?.meta?.source!=="xpHeal"||!payload.amount)return;
    const level=skillLevel("spiritPearl");
    const a1=state.v016A1;
    if(!level||!a1)return;
    const cap=pearlCap(level);
    if(a1.pearls>=cap)return;

    a1.pearlCharge+=payload.amount;
    while(a1.pearlCharge>=8&&a1.pearls<cap){
      a1.pearlCharge-=8;
      a1.pearls++;
      a1.transient?.push({type:"pearlCharge",x:player.x,y:player.y,start:state.t,life:.42});
    }
    if(a1.pearls>=cap)a1.pearlCharge=0;
    runtime.transient.push({type:"xpPearlFeed",x:player.x,y:player.y,start:state.t,life:.42});
  });

  function resetB1(){
    runtime.microImages.length=0;
    runtime.transient.length=0;
  }
  const baseResetB1=resetSkillEngine;
  resetSkillEngine=function(){const result=baseResetB1();resetB1();return result;};

  function drawMicroImage(image){
    const remain=clamp((image.until-state.t)/.8,0,1);
    ctx.save();ctx.translate(image.x,image.y);ctx.globalAlpha=.18+.42*remain;
    ctx.fillStyle="#d9e3ff";ctx.beginPath();ctx.moveTo(0,-12);ctx.lineTo(8,8);ctx.lineTo(0,5);ctx.lineTo(-8,8);ctx.closePath();ctx.fill();
    ctx.strokeStyle="#b9c9ff";ctx.lineWidth=1.5;ctx.globalAlpha=.35*remain;ctx.beginPath();ctx.arc(0,0,15,0,Math.PI*2);ctx.stroke();ctx.restore();
  }

  function drawB1Transient(){
    for(const fx of runtime.transient){
      const p=clamp((state.t-fx.start)/fx.life,0,1),fade=1-p;
      ctx.save();
      if(fx.type==="gravityRune"){
        ctx.strokeStyle="#b58cff";ctx.lineWidth=2.2;ctx.globalAlpha=fade*.85;
        for(let i=0;i<3;i++){ctx.beginPath();ctx.arc(fx.x,fx.y,88-p*22-i*12,0,Math.PI*2);ctx.stroke();}
        ctx.fillStyle="#d8c4ff";ctx.globalAlpha=fade*.8;ctx.beginPath();ctx.arc(fx.x,fx.y,3+p*4,0,Math.PI*2);ctx.fill();
      }else if(fx.type==="bloodReturn"){
        ctx.strokeStyle="#ff738c";ctx.lineWidth=2.4;ctx.globalAlpha=fade*.8;ctx.beginPath();ctx.moveTo(fx.x,fx.y);ctx.lineTo(player.x,player.y);ctx.stroke();
      }else if(fx.type==="pearlReturn"){
        const x=fx.x+(player.x-fx.x)*p,y=fx.y+(player.y-fx.y)*p;
        ctx.fillStyle="#8df0b0";ctx.globalAlpha=fade;ctx.beginPath();ctx.arc(x,y,3.2,0,Math.PI*2);ctx.fill();
      }else if(fx.type==="xpPearlFeed"){
        ctx.strokeStyle="#79a7ff";ctx.lineWidth=2;ctx.globalAlpha=fade*.7;ctx.beginPath();ctx.arc(fx.x,fx.y,10+p*20,0,Math.PI*2);ctx.stroke();
      }else{
        ctx.strokeStyle="#d5e0ff";ctx.lineWidth=1.8;ctx.globalAlpha=fade*.7;ctx.beginPath();ctx.arc(fx.x,fx.y,5+p*16,0,Math.PI*2);ctx.stroke();
      }
      ctx.restore();
    }
  }

  const baseDrawB1=draw;
  draw=function(){
    baseDrawB1();
    if(!state.running&&!state.gameOver)return;
    for(const image of runtime.microImages)drawMicroImage(image);
    drawB1Transient();
  };

  // Dedicated Codex identities for B1. visual-bridge.js loads later and keeps this
  // wrapper as its base, so these scenes remain active in the final public chain.
  if(typeof drawCodexPreview==="function"){
    const baseCodexB1=drawCodexPreview;
    drawCodexPreview=function(g,kind,key,data,time,w,h){
      if(kind!=="synergy"||!["afterimageEcho","gravityRune","bloodSymbiosis","nourishingPearls"].includes(key))return baseCodexB1(g,kind,key,data,time,w,h);
      v12PreviewFrame(g,w,h);
      const cx=w*.24,cy=h*.58,ex=w*.82,ey=h*.48;
      if(key==="afterimageEcho"){
        v12Actor(g,cx,cy,9);g.save();g.globalAlpha=.42;v12Actor(g,w*.50,cy-8,8);g.restore();v12Enemy(g,ex,ey,8);
        const p=(time*.72)%1;v12Projectile(g,cx+(ex-cx)*p,cy+(ey-cy)*p,3,"#e5ebff",time,12);v12Projectile(g,w*.50+(ex-w*.50)*p,cy-8+(ey-cy+8)*p,3,"#b9c9ff",time,12);return;
      }
      if(key==="gravityRune"){
        const mx=w*.52,my=h*.58;v12Ring(g,mx,my,15,"#ff9f73",.8,2);v12Enemy(g,w*.78,my-16,8);v12Enemy(g,w*.80,my+18,8);
        for(let i=0;i<3;i++)v12Ring(g,mx,my,54-((time*22+i*14)%42),"#b58cff",.55,1.6);return;
      }
      if(key==="bloodSymbiosis"){
        const ax=w*.48,ay=h*.45,bx=w*.79,by=h*.55;v12Actor(g,cx,cy,9);v12Enemy(g,ax,ay,8);v12Enemy(g,bx,by,8);v12Line(g,ax,ay,bx,by,"#e55d78",2.3,.8);
        const p=(time*.65)%1;drawGlowDot(g,bx+(cx-bx)*p,by+(cy-by)*p,3,"#ff8298",.9);return;
      }
      const px=w*.48,py=h*.50;v12Actor(g,cx,cy,9);drawGlowDot(g,px,py,5,"#bff7ff",.95);v12Enemy(g,ex,ey,8);
      const p=(time*.65)%1;v12Projectile(g,px+(ex-px)*p,py+(ey-py)*p,3,"#d6fbff",time,10);drawGlowDot(g,cx+Math.sin(time*3)*8,cy-18,2.5,"#79a7ff",.8);
    };
  }
})();
