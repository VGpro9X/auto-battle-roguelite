// V0.16 Hợp Đạo Batch B2 — Phong Lôi Bộ, Phong Hồn Tử Ấn,
// Thiên Hỏa Tinh Vẫn, Hộ Pháp Phản Chấn.
// No strategic player-movement logic is modified.

(()=>{
  Object.assign(SYNERGIES,{
    thunderStride:{
      id:"thunderStride",name:"Phong Lôi Bộ",icon:"👣⚡",
      requires:{skills:["strideShock","lightning"]},
      desc:"Mỗi Bộ Pháp Chấn đánh trúng ít nhất 1 kẻ địch sẽ gọi thêm sét vào tối đa 2 mục tiêu còn sống vừa bị chấn sóng đánh trúng. Mỗi tia gây 50% sát thương cơ bản hiện tại của Lôi Kích, dùng cùng hệ số Lightning/Chain và không tự tạo thêm Phong Lôi Bộ."
    },
    sealedSoul:{
      id:"sealedSoul",name:"Phong Hồn Tử Ấn",icon:"⛓☯",
      requires:{skills:["soulBind","deathMark"]},
      desc:"Trói Hồn ưu tiên kẻ địch đang có Tử Ấn. Trong thời gian mục tiêu đồng thời bị trói và còn Tử Ấn, nó nhận thêm 20% sát thương từ bạn và thời gian trói được cộng thêm 1 giây; Tinh Anh vẫn chỉ nhận một nửa thời gian trói cuối cùng."
    },
    heavenfallBurn:{
      id:"heavenfallBurn",name:"Thiên Hỏa Tinh Vẫn",icon:"☄🔥",
      requires:{skills:["meteorSeal","burn"]},
      desc:"Nếu mục tiêu được Tinh Vẫn chọn vẫn còn sống và đang cháy ngay trước lúc thiên thạch rơi, sau 0.25 giây vị trí va chạm nổ lần hai trong cùng bán kính, gây 55% sát thương cơ bản của Tinh Vẫn. Vụ nổ phụ không gây burn và không kích hoạt hiệu ứng khi đánh trúng."
    },
    guardianRetaliation:{
      id:"guardianRetaliation",name:"Hộ Pháp Phản Chấn",icon:"▣💢",
      requires:{skills:["guardianIdol","retaliate"]},
      desc:"Khi Hộ Pháp Mộc Nhân thực sự chịu sát thương, nó phát Phản Chấn quanh chính nó bằng sát thương và bán kính Phản Chấn hiện tại. Mỗi Hộ Pháp chỉ có thể phát hiệu ứng này tối đa 1 lần mỗi 0.6 giây."
    }
  });

  const runtime=state.v016B2={
    stridePulseAt:-Infinity,
    strideTargets:new Set(),
    secondaryBlasts:[],
    transient:[]
  };

  const hostileList=()=>state.enemies.filter(enemy=>typeof isEnemyHostile==="function"?isEnemyHostile(enemy):!enemy.dead);
  const lightningBaseDamage=level=>12+level*8;
  const soulBindBaseDuration=level=>1+.25*(level-1);
  const soulBindDamage=level=>10+5*(level-1);
  const meteorRadius=level=>58+8*(level-1);
  const meteorDamage=level=>30+12*(level-1);
  const meteorBurnDps=level=>3+level;

  // Phong Lôi Bộ attaches to the real strideShock hit source. Under the game's movement
  // speeds one shock can occur per simulation frame; the Set prevents duplicate targets
  // inside that pulse and caps the follow-up at two living targets.
  const baseHitEnemyB2=hitEnemy;
  hitEnemy=function(enemy,damage,knockback=0,meta={}){
    const result=baseHitEnemyB2(enemy,damage,knockback,meta);
    if(hasSynergy("thunderStride")&&meta?.source==="strideShock"){
      if(runtime.stridePulseAt!==state.t){runtime.stridePulseAt=state.t;runtime.strideTargets.clear();}
      if(enemy&&!enemy.dead&&!runtime.strideTargets.has(enemy)&&runtime.strideTargets.size<2){
        runtime.strideTargets.add(enemy);
        const level=skillLevel("lightning");
        if(level){
          hitEnemy(enemy,lightningBaseDamage(level)*.5,0,{source:"thunderStride",tags:["LIGHTNING","CHAIN"],allowProcs:false});
          runtime.transient.push({type:"thunderStride",x:enemy.x,y:enemy.y,start:state.t,life:.34});
        }
      }
    }
    return result;
  };

  // Replace only Trói Hồn's periodic execute while the Hợp Đạo is unlocked. The original
  // execute remains the path for runs that do not own Phong Hồn Tử Ấn.
  const baseSoulBindExecute=skills.soulBind?.periodic?.execute;
  if(baseSoulBindExecute){
    skills.soulBind.periodic.execute=function(level){
      if(!hasSynergy("sealedSoul"))return baseSoulBindExecute(level);
      const candidates=hostileList().map(enemy=>({
        enemy,
        distance:Math.hypot(enemy.x-player.x,enemy.y-player.y),
        speed:enemy.speed||0,
        marked:(enemy.markedUntil||0)>state.t
      })).filter(item=>item.distance<=260);
      if(!candidates.length)return false;
      const marked=candidates.filter(item=>item.marked);
      const pool=marked.length?marked:candidates;
      pool.sort((a,b)=>b.speed-a.speed||a.distance-b.distance);
      const target=pool[0].enemy;
      const markedNow=(target.markedUntil||0)>state.t;
      const extended=soulBindBaseDuration(level)+(markedNow?1:0);
      const duration=target.elite?extended*.5:extended;
      target.soulBoundUntil=Math.max(target.soulBoundUntil||0,state.t+duration);
      target.soulBoundLevel=level;
      hitEnemy(target,soulBindDamage(level),0,{source:"soulBind",tags:["SOUL","CONTROL","PERIODIC"]});
      state.v016A2?.transient?.push({type:"soulBind",enemy:target,x:target.x,y:target.y,start:state.t,life:.38});
      if(markedNow)runtime.transient.push({type:"sealedSoul",enemy:target,x:target.x,y:target.y,start:state.t,life:.5});
      return true;
    };
  }

  const baseOutgoingDamageB2=getOutgoingDamageMultiplier;
  getOutgoingDamageMultiplier=function(enemy,meta={}){
    let multiplier=baseOutgoingDamageB2(enemy,meta);
    if(hasSynergy("sealedSoul")&&enemy&&(enemy.soulBoundUntil||0)>state.t&&(enemy.markedUntil||0)>state.t)multiplier*=1.20;
    return multiplier;
  };

  // Capture the exact enemy selected by the original Tinh Vẫn execute without changing
  // its random-selection rule. Every meteor is annotated even before the synergy unlocks,
  // so a meteor already in flight remains mechanically truthful if the player unlocks B2
  // during a level-up pause before impact.
  const baseMeteorExecute=skills.meteorSeal?.periodic?.execute;
  if(baseMeteorExecute){
    skills.meteorSeal.periodic.execute=function(level){
      const originalRandomEnemy=randomEnemy;
      let selected=null;
      randomEnemy=function(){const enemy=originalRandomEnemy();if(!selected)selected=enemy;return enemy;};
      const before=state.v016A2?.meteors?.length||0;
      try{
        const result=baseMeteorExecute(level);
        if(result&&state.v016A2?.meteors?.length>before){
          const meteor=state.v016A2.meteors[state.v016A2.meteors.length-1];
          meteor.synergyTarget=selected;
        }
        return result;
      }finally{
        randomEnemy=originalRandomEnemy;
      }
    };
  }

  function manuallyImpactMeteor(meteor){
    if(!meteor||meteor.dead)return;
    const target=meteor.synergyTarget;
    const burningBefore=Boolean(target&&!target.dead&&target.statuses?.burn&&target.statuses.burn.until>state.t);
    meteor.dead=true;
    const radius=meteorRadius(meteor.level);
    const damage=meteorDamage(meteor.level);
    const burnDps=meteorBurnDps(meteor.level);

    for(const enemy of [...hostileList()]){
      if(Math.hypot(enemy.x-meteor.x,enemy.y-meteor.y)>radius+enemy.r)continue;
      hitEnemy(enemy,damage,0,{source:"meteorSeal",tags:["FIRE","AREA","EXPLOSION","PERIODIC"]});
      if(!enemy.dead)applyBurn(enemy,burnDps,2);
    }
    state.v016A2?.transient?.push({type:"meteorImpact",x:meteor.x,y:meteor.y,radius,start:state.t,life:.55});

    if(burningBefore){
      runtime.secondaryBlasts.push({x:meteor.x,y:meteor.y,radius,damage:damage*.55,at:state.t+.25,dead:false});
      runtime.transient.push({type:"heavenfallPrime",x:meteor.x,y:meteor.y,radius,start:state.t,life:.32});
    }
  }

  function updateSecondaryBlasts(){
    for(const blast of runtime.secondaryBlasts){
      if(blast.dead||state.t<blast.at)continue;
      blast.dead=true;
      damageAreaAt(blast.x,blast.y,blast.radius,blast.damage,{source:"heavenfallBurn",tags:["FIRE","AREA","EXPLOSION","PERIODIC"],allowProcs:false},0);
      runtime.transient.push({type:"heavenfallBurst",x:blast.x,y:blast.y,radius:blast.radius,start:state.t,life:.48});
    }
    runtime.secondaryBlasts=runtime.secondaryBlasts.filter(blast=>!blast.dead);
  }

  // Intercept only due Tinh Vẫn impacts while the synergy is active. A2 still owns
  // meteor creation/telegraphing; B2 performs the same primary impact then schedules
  // the documented second blast if the captured target was already burning.
  const baseUpdateB2=update;
  update=function(dt){
    const meteors=state.v016A2?.meteors||[];
    const intercept=Boolean(hasSynergy("heavenfallBurn")&&state.running&&!state.paused&&!state.gameOver&&meteors.length);
    const impactTimes=intercept?meteors.map(meteor=>[meteor,meteor.impactAt]):[];
    if(intercept)for(const [meteor] of impactTimes)meteor.impactAt=Infinity;

    let result;
    try{
      result=baseUpdateB2(dt);
    }finally{
      for(const [meteor,impactAt] of impactTimes)meteor.impactAt=impactAt;
    }

    if(!state.running||state.paused||state.gameOver)return result;

    if(hasSynergy("heavenfallBurn")&&state.v016A2?.meteors?.length){
      for(const meteor of [...state.v016A2.meteors])if(!meteor.dead&&state.t>=meteor.impactAt)manuallyImpactMeteor(meteor);
      state.v016A2.meteors=state.v016A2.meteors.filter(meteor=>!meteor.dead);
    }
    updateSecondaryBlasts();
    runtime.transient=runtime.transient.filter(fx=>state.t-fx.start<fx.life);
    return result;
  };

  // Hộ Pháp Phản Chấn wraps the combat-target hook created by A3. Capture whether the
  // target was the live guardian before A3 may null its runtime reference on a lethal hit.
  const baseDamageEnemyCombatTargetB2=typeof damageEnemyCombatTarget==="function"?damageEnemyCombatTarget:null;
  if(baseDamageEnemyCombatTargetB2){
    damageEnemyCombatTarget=function(target,amount,meta={}){
      const wasGuardian=Boolean(target&&target===state.v016A3?.guardian);
      const dealt=baseDamageEnemyCombatTargetB2(target,amount,meta);
      const level=skillLevel("retaliate");
      if(wasGuardian&&dealt>0&&level&&hasSynergy("guardianRetaliation")){
        const last=target._guardianRetaliationAt??-Infinity;
        if(state.t-last>=.6-1e-9){
          target._guardianRetaliationAt=state.t;
          const radius=(72+level*10)*player.areaMultiplier;
          const damage=4+level*5;
          damageAreaAt(target.x,target.y,radius,damage,{source:"guardianRetaliation",tags:["DAMAGE_TAKEN","EXPLOSION","AREA"],allowProcs:false},18);
          runtime.transient.push({type:"guardianRetaliation",x:target.x,y:target.y,radius,start:state.t,life:.46});
        }
      }
      return dealt;
    };
  }

  function resetB2(){
    runtime.stridePulseAt=-Infinity;
    runtime.strideTargets.clear();
    runtime.secondaryBlasts.length=0;
    runtime.transient.length=0;
  }
  const baseResetB2=resetSkillEngine;
  resetSkillEngine=function(){const result=baseResetB2();resetB2();return result;};

  function drawB2Transient(){
    for(const fx of runtime.transient){
      const p=clamp((state.t-fx.start)/fx.life,0,1),fade=1-p;
      ctx.save();
      if(fx.type==="thunderStride"){
        ctx.globalAlpha=fade*.9;drawLightningArc(ctx,fx.x,state.t%2<1?-20:0,fx.x,fx.y,state.t,6,fade*.9);
      }else if(fx.type==="sealedSoul"){
        ctx.strokeStyle="#f0d76f";ctx.lineWidth=2.2;ctx.globalAlpha=fade*.85;ctx.beginPath();ctx.arc(fx.x,fx.y,13+p*12,0,Math.PI*2);ctx.stroke();
        ctx.strokeStyle="#9bc5e8";ctx.beginPath();ctx.moveTo(fx.x-10,fx.y-8);ctx.lineTo(fx.x+10,fx.y+8);ctx.moveTo(fx.x+10,fx.y-8);ctx.lineTo(fx.x-10,fx.y+8);ctx.stroke();
      }else if(fx.type==="heavenfallPrime"){
        ctx.strokeStyle="#ffb05b";ctx.lineWidth=2;ctx.globalAlpha=fade*.5;ctx.beginPath();ctx.arc(fx.x,fx.y,fx.radius*.35+p*fx.radius*.25,0,Math.PI*2);ctx.stroke();
      }else if(fx.type==="heavenfallBurst"){
        ctx.strokeStyle="#fff0ae";ctx.lineWidth=3;ctx.globalAlpha=fade*.9;ctx.beginPath();ctx.arc(fx.x,fx.y,8+p*fx.radius,0,Math.PI*2);ctx.stroke();
        ctx.fillStyle="#ff9d60";ctx.globalAlpha=fade*.12;ctx.beginPath();ctx.arc(fx.x,fx.y,fx.radius*(.35+.65*p),0,Math.PI*2);ctx.fill();
      }else if(fx.type==="guardianRetaliation"){
        ctx.strokeStyle="#ff9d8f";ctx.lineWidth=2.6;ctx.globalAlpha=fade*.85;ctx.beginPath();ctx.arc(fx.x,fx.y,10+p*fx.radius,0,Math.PI*2);ctx.stroke();
      }
      ctx.restore();
    }
  }

  const baseDrawB2=draw;
  draw=function(){baseDrawB2();if(state.running||state.gameOver)drawB2Transient();};

  if(typeof drawCodexPreview==="function"){
    const baseCodexB2=drawCodexPreview;
    drawCodexPreview=function(g,kind,key,data,time,w,h){
      if(kind!=="synergy"||!["thunderStride","sealedSoul","heavenfallBurn","guardianRetaliation"].includes(key))return baseCodexB2(g,kind,key,data,time,w,h);
      v12PreviewFrame(g,w,h);
      const cx=w*.27,cy=h*.58,ex=w*.76,ey=h*.52;
      if(key==="thunderStride"){
        v12Actor(g,cx,cy,9);v12Enemy(g,ex,ey,8);drawAreaPulse(g,cx,cy,34,time,"#a9e4ff",0);drawLightningArc(g,ex,h*.08,ex,ey,time,6,.9);return;
      }
      if(key==="sealedSoul"){
        v12Actor(g,cx,cy,9);v12Enemy(g,ex,ey,8);v12Ring(g,ex,ey,15,"#e7d46b",.8,2);v12Line(g,ex-10,ey-8,ex+10,ey+8,"#9bc5e8",2,.8);v12Line(g,ex+10,ey-8,ex-10,ey+8,"#9bc5e8",2,.8);return;
      }
      if(key==="heavenfallBurn"){
        v12Enemy(g,ex,ey,8);drawAreaPulse(g,ex,ey,30,time,"#ffb05b",0);drawAreaPulse(g,ex,ey,30,time,"#fff0ae",.35);drawGlowDot(g,ex,ey-18,4,"#ff8f53",.8);return;
      }
      const gx=w*.50,gy=h*.57;v12Actor(g,cx,cy,9);g.save();g.fillStyle="#9a7249";g.fillRect(gx-7,gy-13,14,24);g.restore();v12Enemy(g,ex,ey,8);drawAreaPulse(g,gx,gy,34,time,"#ff9d8f",0);
    };
  }
})();
