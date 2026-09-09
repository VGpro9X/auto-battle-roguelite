// V0.16 Siêu Cấp Batch C1 — Vạn Ảnh Phân Thân, Thiên La Địa Võng,
// Huyết Võng, Tinh Hà Trụy Lạc.
// All mechanics compose with the already-shipped B1/B2 Hợp Đạo layer.

(()=>{
  Object.assign(EVOLUTIONS,{
    phantomLegion:{
      id:"phantomLegion",base:"afterimage",name:"Vạn Ảnh Phân Thân",icon:"👥",
      requires:{tags:{TIME:3,SUMMON:3}},
      desc:"Dư Ảnh TỐI ĐA mỗi chu kỳ tạo 3 phân thân theo đội hình tam giác quanh người trong 1.8 giây. Mỗi phân thân bắn 2 phát; mỗi phát gây 70% sát thương một phát Dư Ảnh hiện tại và không kích hoạt hiệu ứng đòn đánh thường."
    },
    heavenNet:{
      id:"heavenNet",base:"runeMine",name:"Thiên La Địa Võng",icon:"✧⛓",
      requires:{tags:{AREA:3,EXPLOSION:3,CONTROL:2}},
      desc:"Địa Lôi Phù TỐI ĐA tăng giới hạn phù đang tồn tại lên 8. Một phù phát nổ sẽ kích hoạt mọi phù đã lên đạn trong 120px sau 0.12 giây; phù bị kích chuỗi gây 75% sát thương Địa Lôi Phù bình thường. Mỗi phù chỉ nổ một lần và phù kích chuỗi tiếp tục có thể truyền chuỗi."
    },
    bloodWeb:{
      id:"bloodWeb",base:"bloodLink",name:"Huyết Võng",icon:"🩸⛓",
      requires:{tags:{BLOOD:3,CHAIN:3}},
      desc:"Huyết Liên TỐI ĐA mỗi chu kỳ liên kết 4 kẻ địch gần nhất thành Huyết Võng trong 5 giây. Khi một mục tiêu trong võng nhận sát thương, 25% lượng sát thương thực tế đó được sao chép sang từng mục tiêu còn sống khác trong võng. Sát thương sao chép không tự lặp và không kích hoạt hiệu ứng khi đánh trúng."
    },
    starfallCataclysm:{
      id:"starfallCataclysm",base:"meteorSeal",name:"Tinh Hà Trụy Lạc",icon:"☄☄☄",
      requires:{tags:{FIRE:2,AREA:3,EXPLOSION:3}},
      desc:"Tinh Vẫn TỐI ĐA mỗi chu kỳ gọi 3 thiên thạch: viên đầu rơi vào vị trí mục tiêu đã chọn, viên hai và ba lệch 38px sang hai phía, cách nhau 0.18 giây. Viên hai và ba gây 70% sát thương viên đầu; cả ba giữ cùng bán kính và hiệu ứng thiêu đốt của Tinh Vẫn."
    }
  });

  const runtime=state.v016C1={
    netLinks:[],
    bloodWeb:null,
    starMeteors:[],
    starSecondaries:[],
    transient:[]
  };

  const hostileList=()=>state.enemies.filter(enemy=>typeof isEnemyHostile==="function"?isEnemyHostile(enemy):!enemy.dead);
  const afterimageRatio=level=>.45+.10*(level-1);
  const runeRadius=level=>68+8*(level-1);
  const runeDamage=level=>28+10*(level-1);
  const runeKnock=level=>40+5*(level-1);
  const runeTriggerRadius=level=>55+5*(level-1);
  const meteorRadius=level=>58+8*(level-1);
  const meteorDamage=level=>30+12*(level-1);
  const meteorBurnDps=level=>3+level;

  // ----- Vạn Ảnh Phân Thân -----
  const baseAfterimageExecuteC1=skills.afterimage?.periodic?.execute;
  if(baseAfterimageExecuteC1){
    skills.afterimage.periodic.execute=function(level){
      if(!hasEvolution("phantomLegion"))return baseAfterimageExecuteC1(level);
      const a1=state.v016A1;
      if(!a1)return false;
      const formationRadius=24;
      for(let i=0;i<3;i++){
        const angle=-Math.PI/2+i*Math.PI*2/3;
        const clone={
          x:player.x+Math.cos(angle)*formationRadius,
          y:player.y+Math.sin(angle)*formationRadius,
          level,born:state.t,until:state.t+1.8,
          // Keep A1's ordinary shot list empty. A1 still draws/owns these clone objects,
          // and Vạn Ảnh Xạ can still discover them as active Dư Ảnh.
          shots:[],fired:0,
          phantomLegion:true,
          evoShots:[state.t+.12,state.t+.47],evoFired:0
        };
        a1.afterimages.push(clone);
      }
      runtime.transient.push({type:"phantomSpawn",x:player.x,y:player.y,start:state.t,life:.52});
      return true;
    };
  }

  function updatePhantomLegion(){
    const a1=state.v016A1;
    if(!a1)return;
    for(const clone of a1.afterimages){
      if(!clone.phantomLegion||state.t>=clone.until)continue;
      while(clone.evoFired<clone.evoShots.length&&state.t>=clone.evoShots[clone.evoFired]){
        let target=null,best=Infinity;
        for(const enemy of hostileList()){
          const d=Math.hypot(enemy.x-clone.x,enemy.y-clone.y);
          if(d<best){best=d;target=enemy;}
        }
        if(target){
          createProjectileFrom(clone.x,clone.y,target,player.damage*afterimageRatio(clone.level)*.70,390,4,"phantomLegion",0,{
            source:"phantomLegion",tags:["TIME","SUMMON","ATTACK","PROJECTILE"],allowProcs:false
          });
          runtime.transient.push({type:"phantomShot",x:clone.x,y:clone.y,start:state.t,life:.24});
        }
        clone.evoFired++;
      }
    }
  }

  // ----- Thiên La Địa Võng -----
  const baseRuneExecuteC1=skills.runeMine?.periodic?.execute;
  if(baseRuneExecuteC1){
    skills.runeMine.periodic.execute=function(level){
      if(!hasEvolution("heavenNet"))return baseRuneExecuteC1(level);
      const a1=state.v016A1;
      if(!a1)return false;
      a1.mines=a1.mines.filter(m=>!m.dead&&m.expiresAt>state.t);
      if(a1.mines.length>=8){
        a1.mines.sort((a,b)=>a.createdAt-b.createdAt);
        const oldest=a1.mines.shift();
        if(oldest)a1.transient?.push({type:"runeFade",x:oldest.x,y:oldest.y,start:state.t,life:.28});
      }
      a1.mines.push({
        x:player.x,y:player.y,level,
        createdAt:state.t,armedAt:state.t+.45,expiresAt:state.t+5,
        dead:false,heavenNet:true,chainAt:null,chainScale:1
      });
      return true;
    };
  }

  function gravityPullForNet(mine){
    if(!hasSynergy("gravityRune"))return;
    const pulled=[];
    for(const enemy of hostileList()){
      const dx=mine.x-enemy.x,dy=mine.y-enemy.y,d=Math.hypot(dx,dy);
      if(d>105||d<=.0001)continue;
      const travel=Math.min(36,d);
      enemy.x+=dx/d*travel;enemy.y+=dy/d*travel;pulled.push(enemy);
    }
    state.v016B1?.transient?.push({type:"gravityRune",x:mine.x,y:mine.y,start:state.t,life:.42,pulled});
  }

  function scheduleNetNeighbours(mine){
    const a1=state.v016A1;
    if(!a1)return;
    for(const other of a1.mines){
      if(other===mine||other.dead||state.t<other.armedAt||other.chainAt!==null)continue;
      if(Math.hypot(other.x-mine.x,other.y-mine.y)>120)continue;
      other.chainAt=state.t+.12;
      other.chainScale=.75;
      runtime.netLinks.push({x1:mine.x,y1:mine.y,x2:other.x,y2:other.y,start:state.t,life:.24});
    }
  }

  function detonateNetMine(mine,scale=1){
    if(!mine||mine.dead)return;
    mine.dead=true;
    gravityPullForNet(mine);
    const radius=runeRadius(mine.level),damage=runeDamage(mine.level)*scale,knock=runeKnock(mine.level);
    for(const enemy of [...hostileList()]){
      const dx=enemy.x-mine.x,dy=enemy.y-mine.y,d=Math.hypot(dx,dy);
      if(d>radius+enemy.r)continue;
      hitEnemy(enemy,damage,0,{source:scale<1?"heavenNet":"runeMine",tags:["AREA","EXPLOSION","CONTROL","PERIODIC"],allowProcs:false});
      if(!enemy.dead&&knock>0){const m=d||1;enemy.x+=dx/m*knock;enemy.y+=dy/m*knock;}
    }
    state.v016A1?.transient?.push({type:"runeBlast",x:mine.x,y:mine.y,radius,start:state.t,life:.48});
    runtime.transient.push({type:"netBurst",x:mine.x,y:mine.y,radius,start:state.t,life:.46,chain:scale<1});
    scheduleNetNeighbours(mine);
  }

  function updateHeavenNet(){
    const a1=state.v016A1;
    if(!a1)return;
    for(const mine of [...a1.mines]){
      if(mine.dead||state.t>=mine.expiresAt)continue;
      if(mine.chainAt!==null&&state.t>=mine.chainAt){detonateNetMine(mine,mine.chainScale||.75);continue;}
      if(state.t<mine.armedAt)continue;
      const trigger=runeTriggerRadius(mine.level);
      if(hostileList().some(enemy=>Math.hypot(enemy.x-mine.x,enemy.y-mine.y)<=trigger+enemy.r))detonateNetMine(mine,1);
    }
    a1.mines=a1.mines.filter(mine=>!mine.dead&&state.t<mine.expiresAt);
  }

  // ----- Huyết Võng -----
  const baseBloodLinkExecuteC1=skills.bloodLink?.periodic?.execute;
  if(baseBloodLinkExecuteC1){
    skills.bloodLink.periodic.execute=function(level){
      if(!hasEvolution("bloodWeb"))return baseBloodLinkExecuteC1(level);
      const targets=hostileList().map(enemy=>({enemy,d:Math.hypot(enemy.x-player.x,enemy.y-player.y)})).sort((a,b)=>a.d-b.d).slice(0,4).map(item=>item.enemy);
      if(targets.length<4)return false;
      if(state.v016A1)state.v016A1.bloodLink=null;
      runtime.bloodWeb={targets,level,startedAt:state.t,until:state.t+5};
      runtime.transient.push({type:"webSpawn",start:state.t,life:.5});
      return true;
    };
  }

  onSkillEvent("build_unlock",payload=>{
    if(payload?.kind==="evolution"&&payload.item?.id==="bloodWeb"&&state.v016A1)state.v016A1.bloodLink=null;
  });

  onSkillEvent("hit",payload=>{
    const web=runtime.bloodWeb;
    if(!hasEvolution("bloodWeb")||!web||state.t>=web.until||!payload?.enemy||payload.damage<=0)return;
    if(payload.meta?.source==="bloodWeb")return;
    if(!web.targets.includes(payload.enemy))return;

    for(const target of web.targets){
      if(target===payload.enemy||target.dead)continue;
      const desired=payload.damage*.25;
      const meta={source:"bloodWeb",tags:["BLOOD","CHAIN","DAMAGE"],allowProcs:false};
      const multiplier=Math.max(.0001,getOutgoingDamageMultiplier(target,meta));
      hitEnemy(target,desired/multiplier,0,meta);
      if(hasSynergy("bloodSymbiosis"))healPlayer(desired*.10,{source:"bloodSymbiosis"});
      runtime.transient.push({type:"webPulse",x1:payload.enemy.x,y1:payload.enemy.y,x2:target.x,y2:target.y,start:state.t,life:.28});
    }
  });

  function updateBloodWeb(){
    const web=runtime.bloodWeb;
    if(!web)return;
    if(state.t>=web.until)runtime.bloodWeb=null;
  }

  // ----- Tinh Hà Trụy Lạc -----
  const baseMeteorExecuteC1=skills.meteorSeal?.periodic?.execute;
  if(baseMeteorExecuteC1){
    skills.meteorSeal.periodic.execute=function(level){
      if(!hasEvolution("starfallCataclysm"))return baseMeteorExecuteC1(level);
      const target=typeof randomEnemy==="function"?randomEnemy():hostileList()[0];
      if(!target)return false;
      const baseAngle=Math.atan2(target.y-player.y,target.x-player.x)+Math.PI/2;
      const offsets=[0,-38,38],scales=[1,.70,.70];
      for(let i=0;i<3;i++){
        runtime.starMeteors.push({
          x:target.x+Math.cos(baseAngle)*offsets[i],
          y:target.y+Math.sin(baseAngle)*offsets[i],
          level,scale:scales[i],selectedTarget:target,
          markedAt:state.t,impactAt:state.t+.8+i*.18,dead:false,index:i
        });
      }
      runtime.transient.push({type:"starfallMark",x:target.x,y:target.y,start:state.t,life:.8});
      return true;
    };
  }

  function impactStarMeteor(meteor){
    if(meteor.dead)return;
    const target=meteor.selectedTarget;
    const burningBefore=Boolean(target&&!target.dead&&target.statuses?.burn&&target.statuses.burn.until>state.t);
    meteor.dead=true;
    const radius=meteorRadius(meteor.level);
    const damage=meteorDamage(meteor.level)*meteor.scale;
    const burnDps=meteorBurnDps(meteor.level);
    for(const enemy of [...hostileList()]){
      if(Math.hypot(enemy.x-meteor.x,enemy.y-meteor.y)>radius+enemy.r)continue;
      hitEnemy(enemy,damage,0,{source:"starfallCataclysm",tags:["FIRE","AREA","EXPLOSION","PERIODIC"]});
      if(!enemy.dead)applyBurn(enemy,burnDps,2);
    }
    runtime.transient.push({type:"starfallImpact",x:meteor.x,y:meteor.y,radius,start:state.t,life:.55,index:meteor.index});

    if(hasSynergy("heavenfallBurn")&&burningBefore){
      runtime.starSecondaries.push({x:meteor.x,y:meteor.y,radius,damage:damage*.55,at:state.t+.25,dead:false});
    }
  }

  function updateStarfall(){
    for(const meteor of runtime.starMeteors)if(!meteor.dead&&state.t>=meteor.impactAt)impactStarMeteor(meteor);
    runtime.starMeteors=runtime.starMeteors.filter(meteor=>!meteor.dead);
    for(const blast of runtime.starSecondaries){
      if(blast.dead||state.t<blast.at)continue;
      blast.dead=true;
      damageAreaAt(blast.x,blast.y,blast.radius,blast.damage,{source:"heavenfallBurn",tags:["FIRE","AREA","EXPLOSION","PERIODIC"],allowProcs:false},0);
      runtime.transient.push({type:"starfallSecondary",x:blast.x,y:blast.y,radius:blast.radius,start:state.t,life:.48});
    }
    runtime.starSecondaries=runtime.starSecondaries.filter(blast=>!blast.dead);
  }

  // Once C1 is loaded after B1/B2, temporarily disarm A1 mines while HeavenNet is
  // active so the evolution owns every detonation/chain. This also prevents B1's
  // gravity-rune wrapper from firing first; C1 explicitly preserves that pull above.
  const baseUpdateC1=update;
  update=function(dt){
    const mines=state.v016A1?.mines||[];
    const intercept=Boolean(hasEvolution("heavenNet")&&state.running&&!state.paused&&!state.gameOver&&mines.length);
    const armedTimes=intercept?mines.map(mine=>[mine,mine.armedAt]):[];
    if(intercept)for(const [mine] of armedTimes)mine.armedAt=Infinity;

    let result;
    try{result=baseUpdateC1(dt);}finally{for(const [mine,armedAt] of armedTimes)mine.armedAt=armedAt;}
    if(!state.running||state.paused||state.gameOver)return result;

    updatePhantomLegion();
    if(hasEvolution("heavenNet"))updateHeavenNet();
    updateBloodWeb();
    updateStarfall();
    runtime.netLinks=runtime.netLinks.filter(fx=>state.t-fx.start<fx.life);
    runtime.transient=runtime.transient.filter(fx=>state.t-fx.start<fx.life);
    return result;
  };

  function resetC1(){
    runtime.netLinks.length=0;
    runtime.bloodWeb=null;
    runtime.starMeteors.length=0;
    runtime.starSecondaries.length=0;
    runtime.transient.length=0;
  }
  const baseResetC1=resetSkillEngine;
  resetSkillEngine=function(){const result=baseResetC1();resetC1();return result;};

  // Clarify already-unlocked Hợp Đạo behavior once the associated Siêu Cấp exists.
  if(SYNERGIES.bloodSymbiosis)SYNERGIES.bloodSymbiosis.desc+=" Khi đạt Huyết Võng, quy tắc hồi 10% áp dụng cho từng bản sao sát thương của Huyết Võng.";
  if(SYNERGIES.heavenfallBurn)SYNERGIES.heavenfallBurn.desc+=" Khi đạt Tinh Hà Trụy Lạc, mỗi thiên thạch kiểm tra điều kiện riêng và vụ nổ phụ gây 55% sát thương của chính thiên thạch đó.";

  function drawBloodWeb(){
    const web=runtime.bloodWeb;
    if(!web)return;
    const living=web.targets.filter(target=>!target.dead);
    if(living.length<2)return;
    ctx.save();ctx.strokeStyle="#e45a77";ctx.lineWidth=1.8;ctx.globalAlpha=.38+.15*Math.sin(state.t*6);
    for(let i=0;i<living.length;i++)for(let j=i+1;j<living.length;j++){ctx.beginPath();ctx.moveTo(living[i].x,living[i].y);ctx.lineTo(living[j].x,living[j].y);ctx.stroke();}
    ctx.restore();
  }

  function drawStarTelegraphs(){
    for(const meteor of runtime.starMeteors){
      const total=Math.max(.001,meteor.impactAt-meteor.markedAt),p=clamp((state.t-meteor.markedAt)/total,0,1);
      ctx.save();ctx.strokeStyle=meteor.index===0?"#fff0ae":"#ffb05b";ctx.lineWidth=2;ctx.globalAlpha=.25+.55*p;ctx.beginPath();ctx.arc(meteor.x,meteor.y,meteorRadius(meteor.level)*(1-.45*p),0,Math.PI*2);ctx.stroke();ctx.restore();
    }
  }

  function drawC1Effects(){
    for(const link of runtime.netLinks){const p=clamp((state.t-link.start)/link.life,0,1);ctx.save();ctx.strokeStyle="#d6b9ff";ctx.lineWidth=2;ctx.globalAlpha=(1-p)*.85;ctx.beginPath();ctx.moveTo(link.x1,link.y1);ctx.lineTo(link.x2,link.y2);ctx.stroke();ctx.restore();}
    for(const fx of runtime.transient){
      const p=clamp((state.t-fx.start)/fx.life,0,1),fade=1-p;ctx.save();
      if(fx.type==="phantomSpawn"){ctx.strokeStyle="#c9d4ff";ctx.lineWidth=2;ctx.globalAlpha=fade*.8;for(let i=0;i<3;i++){const a=-Math.PI/2+i*Math.PI*2/3;ctx.beginPath();ctx.arc(fx.x+Math.cos(a)*24,fx.y+Math.sin(a)*24,7+p*12,0,Math.PI*2);ctx.stroke();}}
      else if(fx.type==="phantomShot"){ctx.strokeStyle="#e6ebff";ctx.globalAlpha=fade*.7;ctx.beginPath();ctx.arc(fx.x,fx.y,5+p*12,0,Math.PI*2);ctx.stroke();}
      else if(fx.type==="netBurst"){ctx.strokeStyle=fx.chain?"#d6b9ff":"#ffb18e";ctx.lineWidth=fx.chain?2.3:2.8;ctx.globalAlpha=fade*.85;ctx.beginPath();ctx.arc(fx.x,fx.y,10+p*fx.radius,0,Math.PI*2);ctx.stroke();}
      else if(fx.type==="webPulse"){ctx.strokeStyle="#ff7790";ctx.lineWidth=2.4;ctx.globalAlpha=fade*.8;ctx.beginPath();ctx.moveTo(fx.x1,fx.y1);ctx.lineTo(fx.x2,fx.y2);ctx.stroke();}
      else if(fx.type==="starfallImpact"||fx.type==="starfallSecondary"){ctx.strokeStyle=fx.type==="starfallSecondary"?"#fff2b6":"#ff9f62";ctx.lineWidth=fx.type==="starfallSecondary"?3:2.5;ctx.globalAlpha=fade*.85;ctx.beginPath();ctx.arc(fx.x,fx.y,8+p*fx.radius,0,Math.PI*2);ctx.stroke();}
      ctx.restore();
    }
  }

  const baseDrawC1=draw;
  draw=function(){baseDrawC1();if(!state.running&&!state.gameOver)return;drawStarTelegraphs();drawBloodWeb();drawC1Effects();};

  // Dedicated Siêu Cấp Codex scenes.
  if(typeof drawCodexPreview==="function"){
    const baseCodexC1=drawCodexPreview;
    drawCodexPreview=function(g,kind,key,data,time,w,h){
      if(kind!=="evolution"||!["phantomLegion","heavenNet","bloodWeb","starfallCataclysm"].includes(key))return baseCodexC1(g,kind,key,data,time,w,h);
      v12PreviewFrame(g,w,h);
      if(key==="phantomLegion"){
        const cx=w*.34,cy=h*.58;v12Actor(g,cx,cy,9);v12Enemy(g,w*.84,h*.48,8);
        for(let i=0;i<3;i++){const a=-Math.PI/2+i*Math.PI*2/3;g.save();g.globalAlpha=.5;v12Actor(g,cx+Math.cos(a)*25,cy+Math.sin(a)*20,7);g.restore();}
        return;
      }
      if(key==="heavenNet"){
        const pts=[[w*.32,h*.62],[w*.52,h*.43],[w*.72,h*.62]];for(const [x,y] of pts){v12Ring(g,x,y,12,"#ff9f73",.8,2);}for(let i=0;i<pts.length-1;i++)v12Line(g,pts[i][0],pts[i][1],pts[i+1][0],pts[i+1][1],"#d6b9ff",2,.75);v12Enemy(g,w*.52,h*.67,8);return;
      }
      if(key==="bloodWeb"){
        const pts=[[w*.32,h*.40],[w*.70,h*.38],[w*.78,h*.68],[w*.38,h*.70]];for(const [x,y] of pts)v12Enemy(g,x,y,7);for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++)v12Line(g,pts[i][0],pts[i][1],pts[j][0],pts[j][1],"#e55d78",1.6,.55);return;
      }
      const pts=[[w*.42,h*.58],[w*.62,h*.50],[w*.78,h*.62]];for(let i=0;i<3;i++){drawAreaPulse(g,pts[i][0],pts[i][1],23,time,"#ffb05b",i*.22);drawGlowDot(g,pts[i][0],h*.12,3,"#fff0ae",.8);}v12Enemy(g,w*.60,h*.68,8);
    };
  }
})();
