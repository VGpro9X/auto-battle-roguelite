// V0.16 Batch A3 — Hộ Pháp Mộc Nhân, Hàn Kính, Tĩnh Tâm, Thất Tinh Kích.
// Uses the narrow enemy-combat-target hook in game.js; V0.8 player movement logic is unchanged.

(()=>{
  const runtime=state.v016A3={
    guardian:null,
    guardianNextAt:0,
    frostMirrorCharge:0,
    lastDamageAt:0,
    focusActive:false,
    focusChanceBonus:0,
    focusDamageBonus:0,
    starHits:0,
    transient:[]
  };

  const fmt=value=>Number(value.toFixed(2)).toString();
  const guardianCooldown=level=>12-(level-1);
  const guardianDuration=level=>4+.5*(level-1);
  const guardianHp=level=>22+12*(level-1);
  const frostMirrorCooldown=level=>9-level;
  const frostMirrorReduction=level=>.35+.10*level;
  const focusChance=level=>.08+.03*(level-1);
  const focusDamage=level=>.18+.08*(level-1);
  const starNeed=level=>8-level;
  const starRadius=level=>42+6*(level-1);
  const starDamage=level=>18+8*(level-1);

  function guardianAlive(){
    const guardian=runtime.guardian;
    return Boolean(guardian&&guardian.hp>0&&state.t<guardian.until);
  }

  function summonGuardian(level){
    const maxHp=guardianHp(level);
    runtime.guardian={
      x:player.x,y:player.y,r:16,
      hp:maxHp,maxHp,level,
      born:state.t,until:state.t+guardianDuration(level),
      lastHitFxAt:-Infinity
    };
    runtime.transient.push({type:"guardianSpawn",x:player.x,y:player.y,start:state.t,life:.5});
  }

  skills.guardianIdol={
    name:"Hộ Pháp Mộc Nhân",icon:"🪵🛡️",max:5,tags:["SUMMON","DEFENSE","CONTROL"],
    desc:level=>`Cứ mỗi ${fmt(guardianCooldown(level))} giây, triệu hồi 1 Hộ Pháp đứng yên tại vị trí hiện tại trong ${fmt(guardianDuration(level))} giây với ${guardianHp(level)} HP. Kẻ địch trong phạm vi 150 của Hộ Pháp ưu tiên tấn công nó thay vì người chơi. Chỉ tồn tại 1 Hộ Pháp; lần triệu hồi mới thay Hộ Pháp cũ. Hộ Pháp không tấn công.`,
    apply:()=>{}
  };

  skills.frostMirror={
    name:"Hàn Kính",icon:"🪞❄️",max:4,tags:["ICE","DEFENSE","CONTROL","PERIODIC"],
    desc:level=>`Cứ mỗi ${fmt(frostMirrorCooldown(level))} giây nhận 1 Hàn Kính, tối đa 1. Đòn tiếp xúc tiếp theo từ kẻ địch tiêu hao Hàn Kính và giảm ${Math.round(frostMirrorReduction(level)*100)}% sát thương của đòn đó; kẻ địch tiếp xúc bị làm lạnh trong 3 giây.`,
    apply:()=>{},
    periodic:{
      cooldown:frostMirrorCooldown,
      execute:()=>{
        if(runtime.frostMirrorCharge<1){
          runtime.frostMirrorCharge=1;
          runtime.transient.push({type:"mirrorCharge",x:player.x,y:player.y,start:state.t,life:.42});
        }
        return true;
      }
    }
  };

  skills.focusMind={
    name:"Tĩnh Tâm",icon:"🧘",max:5,tags:["TIME","CRITICAL","RULE"],
    desc:level=>`Nếu không nhận sát thương trong 4 giây, vào Tĩnh Tâm cho đến lần nhận sát thương tiếp theo. Khi Tĩnh Tâm, nhận thêm ${Math.round(focusChance(level)*100)}% tỷ lệ chí mạng và ${Math.round(focusDamage(level)*100)}% sát thương chí mạng. Nhận sát thương lập tức mất hiệu ứng; tránh sát thương thêm 4 giây sẽ khôi phục hiệu ứng.`,
    apply:()=>{}
  };

  skills.sevenStarStrike={
    name:"Thất Tinh Kích",icon:"✴️",max:5,tags:["ATTACK","HIT","AREA","CHARGE"],
    desc:level=>`Cứ mỗi ${starNeed(level)} lần đòn đánh thường đánh trúng, gọi một tinh kích tại mục tiêu vừa trúng. Tinh kích có bán kính ${starRadius(level)} và gây ${starDamage(level)} sát thương. Sát thương tinh kích không được tính là đòn đánh thường và không thể tự tăng bộ đếm của chính nó.`,
    apply:()=>{}
  };

  const baseGetEnemyCombatTarget=typeof getEnemyCombatTarget==="function"?getEnemyCombatTarget:null;
  getEnemyCombatTarget=function(enemy){
    if(guardianAlive()&&enemy&&!enemy.dead){
      const guardian=runtime.guardian;
      const hostile=typeof isEnemyHostile==="function"?isEnemyHostile(enemy):true;
      if(hostile&&Math.hypot(enemy.x-guardian.x,enemy.y-guardian.y)<=150)return guardian;
    }
    return baseGetEnemyCombatTarget?baseGetEnemyCombatTarget(enemy):player;
  };

  const baseDamageEnemyCombatTarget=typeof damageEnemyCombatTarget==="function"?damageEnemyCombatTarget:null;
  damageEnemyCombatTarget=function(target,amount,meta={}){
    if(target===runtime.guardian&&guardianAlive()){
      const dealt=Math.max(0,amount);
      target.hp=Math.max(0,target.hp-dealt);
      if(state.t-target.lastHitFxAt>.12){
        target.lastHitFxAt=state.t;
        runtime.transient.push({type:"guardianHit",x:target.x,y:target.y,start:state.t,life:.24});
      }
      if(target.hp<=0){
        runtime.transient.push({type:"guardianBreak",x:target.x,y:target.y,start:state.t,life:.5});
        runtime.guardian=null;
      }
      return dealt;
    }
    return baseDamageEnemyCombatTarget?baseDamageEnemyCombatTarget(target,amount,meta):0;
  };

  function deactivateFocus(){
    if(!runtime.focusActive)return;
    player.critChance-=runtime.focusChanceBonus;
    player.critMultiplier-=runtime.focusDamageBonus;
    runtime.focusActive=false;
    runtime.transient.push({type:"focusBreak",x:player.x,y:player.y,start:state.t,life:.36});
    runtime.focusChanceBonus=0;
    runtime.focusDamageBonus=0;
  }

  function activateFocus(level){
    if(!level)return;
    if(runtime.focusActive)deactivateFocus();
    runtime.focusChanceBonus=focusChance(level);
    runtime.focusDamageBonus=focusDamage(level);
    player.critChance+=runtime.focusChanceBonus;
    player.critMultiplier+=runtime.focusDamageBonus;
    runtime.focusActive=true;
    runtime.transient.push({type:"focusOn",x:player.x,y:player.y,start:state.t,life:.45});
  }

  onSkillEvent("damage_taken",payload=>{
    if(!payload?.amount||payload.amount<=0)return;
    runtime.lastDamageAt=state.t;
    if(runtime.focusActive)deactivateFocus();
  });

  onSkillEvent("skill_selected",payload=>{
    const key=payload?.key;
    if(key==="guardianIdol"&&runtime.guardianNextAt<=0){
      runtime.guardianNextAt=state.t+guardianCooldown(skillLevel("guardianIdol"));
    }
    if(key==="frostMirror"&&skillRuntime.timers.frostMirror===undefined){
      const level=skillLevel("frostMirror");
      skillRuntime.timers.frostMirror=frostMirrorCooldown(level)*player.periodicCooldownMultiplier;
    }
    if(key==="focusMind"){
      const level=skillLevel("focusMind");
      if(runtime.focusActive)activateFocus(level);
      else if(state.t-runtime.lastDamageAt>=4-1e-9)activateFocus(level);
    }
  });

  const baseDamagePlayerA3=damagePlayer;
  damagePlayer=function(amount,meta={}){
    const level=skillLevel("frostMirror");
    const source=meta?.source;
    const contact=meta?.type==="contact"&&source;
    const hostile=contact&&(typeof isEnemyHostile==="function"?isEnemyHostile(source):!source.dead);
    if(level&&runtime.frostMirrorCharge>0&&hostile){
      if((player.invulnerableUntil||0)>state.t)return baseDamagePlayerA3(amount,meta);

      if(player.dodgeChance>0&&Math.random()<player.dodgeChance){
        emitSkillEvent("dodge",{amount,meta});
        return 0;
      }

      runtime.frostMirrorCharge=0;
      source.chillUntil=Math.max(source.chillUntil||0,state.t+3);
      runtime.transient.push({type:"mirrorBreak",x:player.x,y:player.y,enemy:source,start:state.t,life:.45});
      const oldDodge=player.dodgeChance;
      player.dodgeChance=0;
      try{
        return baseDamagePlayerA3(amount*(1-frostMirrorReduction(level)),meta);
      }finally{
        player.dodgeChance=oldDodge;
      }
    }
    return baseDamagePlayerA3(amount,meta);
  };

  onSkillEvent("hit",payload=>{
    const level=skillLevel("sevenStarStrike");
    if(!level||!payload?.enemy||payload.meta?.source!=="normal")return;
    runtime.starHits++;
    const need=starNeed(level);
    while(runtime.starHits>=need){
      runtime.starHits-=need;
      const x=payload.enemy.x,y=payload.enemy.y;
      damageAreaAt(x,y,starRadius(level),starDamage(level),{source:"sevenStarStrike",tags:["ATTACK","HIT","AREA","CHARGE"]});
      runtime.transient.push({type:"starStrike",x,y,radius:starRadius(level),start:state.t,life:.42});
    }
  });

  function resetA3(){
    // resetRunState restores the player before resetSkillEngine and clears owned.
    // Only subtract a live focus bonus if resetSkillEngine is ever invoked mid-run while the skill is still owned.
    if(runtime.focusActive&&skillLevel("focusMind")>0){
      player.critChance-=runtime.focusChanceBonus;
      player.critMultiplier-=runtime.focusDamageBonus;
    }
    runtime.guardian=null;
    runtime.guardianNextAt=0;
    runtime.frostMirrorCharge=0;
    runtime.lastDamageAt=0;
    runtime.focusActive=false;
    runtime.focusChanceBonus=0;
    runtime.focusDamageBonus=0;
    runtime.starHits=0;
    runtime.transient.length=0;
  }

  const baseResetA3=resetSkillEngine;
  resetSkillEngine=function(){
    const result=baseResetA3();
    resetA3();
    return result;
  };

  function updateGuardian(){
    const level=skillLevel("guardianIdol");
    if(!level){runtime.guardian=null;runtime.guardianNextAt=0;return;}
    if(runtime.guardian&&(!guardianAlive())){
      if(runtime.guardian.hp>0)runtime.transient.push({type:"guardianFade",x:runtime.guardian.x,y:runtime.guardian.y,start:state.t,life:.35});
      runtime.guardian=null;
    }
    if(runtime.guardianNextAt<=0)runtime.guardianNextAt=state.t+guardianCooldown(level);
    if(state.t>=runtime.guardianNextAt){
      summonGuardian(level);
      runtime.guardianNextAt+=guardianCooldown(level);
    }
  }

  function updateFocus(){
    const level=skillLevel("focusMind");
    if(!level){
      if(runtime.focusActive)deactivateFocus();
      return;
    }
    if(!runtime.focusActive&&state.t-runtime.lastDamageAt>=4-1e-9)activateFocus(level);
  }

  const baseUpdateA3=update;
  update=function(dt){
    const result=baseUpdateA3(dt);
    if(!state.running||state.paused||state.gameOver)return result;
    updateGuardian();
    updateFocus();
    runtime.transient=runtime.transient.filter(fx=>state.t-fx.start<fx.life);
    return result;
  };

  function drawGuardian(){
    if(!guardianAlive())return;
    const g=runtime.guardian;
    const hpRatio=clamp(g.hp/g.maxHp,0,1);
    const pulse=.5+.5*Math.sin(state.t*5);
    ctx.save();ctx.translate(g.x,g.y);
    ctx.globalAlpha=.25;ctx.fillStyle="#070a0c";ctx.beginPath();ctx.ellipse(0,13,18,7,0,0,Math.PI*2);ctx.fill();
    ctx.globalAlpha=1;ctx.fillStyle="#9a7249";ctx.fillRect(-8,-14,16,25);
    ctx.fillStyle="#c59a63";ctx.fillRect(-5,-19,10,9);
    ctx.strokeStyle="#8fe0b8";ctx.lineWidth=2;ctx.globalAlpha=.55+.25*pulse;ctx.beginPath();ctx.arc(0,0,21,0,Math.PI*2);ctx.stroke();
    ctx.strokeStyle="#d9efe1";ctx.lineWidth=2.4;ctx.globalAlpha=.9;ctx.beginPath();ctx.arc(0,0,25,-Math.PI/2,-Math.PI/2+Math.PI*2*hpRatio);ctx.stroke();
    ctx.fillStyle="#e9ffd9";ctx.globalAlpha=.9;ctx.beginPath();ctx.arc(0,-8,2.5,0,Math.PI*2);ctx.fill();
    ctx.restore();
  }

  function drawFrostMirror(){
    if(runtime.frostMirrorCharge<1)return;
    const a=state.t*1.7;
    const x=player.x+Math.cos(a)*29,y=player.y+Math.sin(a)*20;
    ctx.save();ctx.translate(x,y);ctx.rotate(a*.35);
    ctx.fillStyle="#d9f4ff";ctx.globalAlpha=.9;ctx.beginPath();ctx.moveTo(0,-9);ctx.lineTo(6,0);ctx.lineTo(0,9);ctx.lineTo(-6,0);ctx.closePath();ctx.fill();
    ctx.strokeStyle="#86cbe8";ctx.lineWidth=1.5;ctx.globalAlpha=.8;ctx.stroke();ctx.restore();
  }

  function drawFocus(){
    const level=skillLevel("focusMind");
    if(!level)return;
    const waiting=clamp((state.t-runtime.lastDamageAt)/4,0,1);
    ctx.save();ctx.translate(player.x,player.y);
    ctx.strokeStyle=runtime.focusActive?"#ffe5a3":"#8190a8";ctx.lineWidth=1.8;ctx.globalAlpha=runtime.focusActive?.7:.2+.25*waiting;
    ctx.beginPath();ctx.arc(0,0,36,-Math.PI/2,-Math.PI/2+Math.PI*2*(runtime.focusActive?1:waiting));ctx.stroke();
    if(runtime.focusActive){
      for(let i=0;i<4;i++){
        const a=state.t*.3+i*Math.PI/2;
        ctx.fillStyle="#fff0b8";ctx.globalAlpha=.65;ctx.beginPath();ctx.arc(Math.cos(a)*36,Math.sin(a)*36,2.2,0,Math.PI*2);ctx.fill();
      }
    }
    ctx.restore();
  }

  function drawStarCounter(){
    const level=skillLevel("sevenStarStrike");
    if(!level)return;
    const need=starNeed(level);
    ctx.save();
    for(let i=0;i<need;i++){
      const a=-Math.PI/2+i*Math.PI*2/need;
      const x=player.x+Math.cos(a)*42,y=player.y+Math.sin(a)*29;
      ctx.fillStyle=i<runtime.starHits?"#ffe785":"#586273";ctx.globalAlpha=i<runtime.starHits?.85:.3;
      ctx.beginPath();ctx.arc(x,y,2.4,0,Math.PI*2);ctx.fill();
    }
    ctx.restore();
  }

  function drawTransient(){
    for(const fx of runtime.transient){
      const p=clamp((state.t-fx.start)/fx.life,0,1),fade=1-p;
      ctx.save();
      if(fx.type==="starStrike"){
        ctx.strokeStyle="#ffe78c";ctx.lineWidth=3;ctx.globalAlpha=.75*fade;ctx.beginPath();ctx.moveTo(fx.x,fx.y-80*(1-p));ctx.lineTo(fx.x,fx.y);ctx.stroke();
        ctx.beginPath();ctx.arc(fx.x,fx.y,8+p*fx.radius,0,Math.PI*2);ctx.stroke();
      }else if(fx.type==="mirrorBreak"){
        ctx.strokeStyle="#c9f1ff";ctx.lineWidth=2;ctx.globalAlpha=.75*fade;
        for(let i=0;i<5;i++){const a=i*Math.PI*2/5+p*.4;ctx.beginPath();ctx.moveTo(fx.x,fx.y);ctx.lineTo(fx.x+Math.cos(a)*(10+p*25),fx.y+Math.sin(a)*(10+p*25));ctx.stroke();}
      }else if(fx.type.startsWith("guardian")){
        const color=fx.type==="guardianBreak"?"#d3a36c":"#9ee0b9";
        ctx.strokeStyle=color;ctx.lineWidth=2;ctx.globalAlpha=.65*fade;ctx.beginPath();ctx.arc(fx.x,fx.y,8+p*28,0,Math.PI*2);ctx.stroke();
      }else{
        ctx.strokeStyle=fx.type==="focusBreak"?"#8d96aa":"#ffe5a3";ctx.lineWidth=1.8;ctx.globalAlpha=.6*fade;ctx.beginPath();ctx.arc(fx.x,fx.y,8+p*24,0,Math.PI*2);ctx.stroke();
      }
      ctx.restore();
    }
  }

  const baseDrawA3=draw;
  draw=function(){
    baseDrawA3();
    if(!state.running&&!state.gameOver)return;
    drawGuardian();
    drawFrostMirror();
    drawFocus();
    drawStarCounter();
    drawTransient();
  };

  if(typeof SKILL_VISUAL_PROFILES!=="undefined"&&typeof SKILL_SCENE_DRAWERS!=="undefined"){
    SKILL_VISUAL_PROFILES.guardianIdol={scene:"v016GuardianIdol",tone:"#9ee0b9"};
    SKILL_VISUAL_PROFILES.frostMirror={scene:"v016FrostMirror",tone:"#c9f1ff"};
    SKILL_VISUAL_PROFILES.focusMind={scene:"v016FocusMind",tone:"#ffe5a3"};
    SKILL_VISUAL_PROFILES.sevenStarStrike={scene:"v016SevenStar",tone:"#ffe785"};

    SKILL_SCENE_DRAWERS.v016GuardianIdol=(g,time,w,h)=>{
      v12Actor(g,w*.25,h*.58,9);
      const x=w*.57,y=h*.58;g.save();g.fillStyle="#a27a50";g.fillRect(x-7,y-15,14,24);g.fillStyle="#c79d69";g.fillRect(x-4,y-20,8,8);g.restore();
      v12Ring(g,x,y,21,"#9ee0b9",.55+.2*Math.sin(time*5),2);v12Enemy(g,w*.82,h*.53,8);
      v12Line(g,w*.82,h*.53,x,y,"#9ee0b9",1.4,.35);
    };

    SKILL_SCENE_DRAWERS.v016FrostMirror=(g,time,w,h)=>{
      const cx=w*.42,cy=h*.56;v12Actor(g,cx,cy,10);
      const a=time*1.8,x=cx+Math.cos(a)*30,y=cy+Math.sin(a)*19;
      g.save();g.translate(x,y);g.rotate(a*.4);g.fillStyle="#d9f4ff";g.beginPath();g.moveTo(0,-9);g.lineTo(6,0);g.lineTo(0,9);g.lineTo(-6,0);g.closePath();g.fill();g.restore();
      v12Enemy(g,w*.78,h*.53,8);
    };

    SKILL_SCENE_DRAWERS.v016FocusMind=(g,time,w,h)=>{
      const cx=w*.5,cy=h*.56;v12Actor(g,cx,cy,10);v12Ring(g,cx,cy,30,"#ffe5a3",.65+.15*Math.sin(time*4),2);
      for(let i=0;i<4;i++){const a=time*.35+i*Math.PI/2;drawGlowDot(g,cx+Math.cos(a)*30,cy+Math.sin(a)*30,2.5,"#fff0b8",.85);}
    };

    SKILL_SCENE_DRAWERS.v016SevenStar=(g,time,w,h)=>{
      const cx=w*.28,cy=h*.6;v12Actor(g,cx,cy,9);const ex=w*.74,ey=h*.54;v12Enemy(g,ex,ey,8);
      for(let i=0;i<7;i++){const a=-Math.PI/2+i*Math.PI*2/7;drawGlowDot(g,cx+Math.cos(a)*26,cy+Math.sin(a)*18,2.2,"#ffe785",i<Math.floor((time*.9)%8)?.9:.25);}
      const p=(time%1.2)/1.2;if(p>.72){v12Line(g,ex,ey-55,ex,ey,"#ffe9a0",3,(1-p)*3.5);v12Ring(g,ex,ey,10+(p-.72)*65,"#ffe785",(1-p)*3,2);}
    };
  }
})();