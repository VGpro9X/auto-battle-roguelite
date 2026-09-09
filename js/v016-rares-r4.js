// V0.16 Rare Batch R4 — Nợ Máu, Ký Sinh, Hư Thực, Thế Mệnh.
// Final four Thần Bí Kỹ for the 10+10 V0.16 target.

(()=>{
  const runtime=state.v016RareR4={
    debts:[],
    parasiteTarget:null,
    parasiteUntil:0,
    voidStart:0,
    scapegoat:null
  };

  DIVINE_SKILLS.bloodDebt={
    id:"bloodDebt",tier:"mystic",name:"Nợ Máu",icon:"♥⌛",
    desc:"Sau khi khiên và giảm sát thương đã xử lý, 50% sát thương còn lại lẽ ra đi vào HP được nhận ngay, 50% trở thành Nợ Máu và trả đều trong 5 giây. Mỗi kẻ địch bị hạ xóa 15% tổng Nợ Máu còn lại. Sát thương vào khiên không tạo Nợ Máu; Nợ Máu không thể tự trì hoãn lần nữa.",
    preview:"bloodDebt"
  };

  DIVINE_SKILLS.parasitePact={
    id:"parasitePact",tier:"mystic",name:"Ký Sinh",icon:"◎↔",
    desc:"Cứ mỗi 18 giây, ký sinh lên kẻ địch có HP hiện tại cao nhất trong 6 giây. Trong thời gian đó, sau khi khiên và giảm sát thương đã xử lý, 30% sát thương lẽ ra đi vào HP của bạn được chuyển sang mục tiêu ký sinh; 70% còn lại do bạn chịu. Sát thương chuyển không kích hoạt hiệu ứng khi đánh trúng. Nếu mục tiêu chết, liên kết kết thúc và không đổi mục tiêu cho tới lần kích hoạt tiếp theo.",
    cooldown:18,preview:"parasitePact",
    execute:()=>{
      const targets=state.enemies.filter(isEnemyHostile).sort((a,b)=>b.hp-a.hp);
      const target=targets[0];
      if(!target)return false;
      runtime.parasiteTarget=target;
      runtime.parasiteUntil=state.t+6;
      emitSkillEvent("divine_trigger",{id:"parasitePact",enemy:target,until:runtime.parasiteUntil});
      return true;
    }
  };

  DIVINE_SKILLS.voidReality={
    id:"voidReality",tier:"mystic",name:"Hư Thực",icon:"◇◆",
    desc:"Luân phiên hai trạng thái, mỗi trạng thái kéo dài đúng 6 giây. HƯ: tăng thêm 30 điểm % né tránh nhưng sát thương bạn gây chỉ còn 80%. THỰC: sát thương bạn gây tăng 25% nhưng tốc độ di chuyển chỉ còn 85%. Khi nhận Hư Thực, bắt đầu ngay ở trạng thái HƯ.",
    preview:"voidReality"
  };

  DIVINE_SKILLS.scapegoatFate={
    id:"scapegoatFate",tier:"mystic",name:"Thế Mệnh",icon:"☯✕",
    desc:"Cứ mỗi 28 giây, đánh dấu một kẻ địch thường ngẫu nhiên làm Thế Mệnh. Nếu phần sát thương tức thời còn lại sau các phòng thủ khác đủ hạ bạn khi Thế Mệnh còn sống, kẻ đó chết thay và HP của bạn được giữ ở 1. Nếu Thế Mệnh chết trước, dấu mất và phải chờ lần đánh dấu tiếp theo. Tinh Anh không thể làm Thế Mệnh. Nếu lúc kích hoạt không có mục tiêu hợp lệ, kỹ năng thử lại sau tối đa 1.25 giây.",
    cooldown:28,retryCooldown:1.25,preview:"scapegoatFate",
    execute:()=>{
      const candidates=state.enemies.filter(enemy=>isEnemyHostile(enemy)&&!enemy.elite);
      if(!candidates.length)return false;
      runtime.scapegoat=candidates[(Math.random()*candidates.length)|0];
      emitSkillEvent("divine_trigger",{id:"scapegoatFate",enemy:runtime.scapegoat});
      return true;
    }
  };

  function isVoidPhase(){
    if(!hasDivineSkill("voidReality"))return null;
    return Math.floor(Math.max(0,state.t-runtime.voidStart)/6)%2===0?"void":"real";
  }

  onSkillEvent("divine_acquired",payload=>{
    if(payload?.id==="voidReality")runtime.voidStart=state.t;
  });

  const baseOutgoingR4=getOutgoingDamageMultiplier;
  getOutgoingDamageMultiplier=function(enemy,meta={}){
    let multiplier=baseOutgoingR4(enemy,meta);
    const phase=isVoidPhase();
    if(phase==="void")multiplier*=.80;
    else if(phase==="real")multiplier*=1.25;
    return multiplier;
  };

  const baseMoveSpeedR4=getEffectiveMoveSpeed;
  getEffectiveMoveSpeed=function(){
    const speed=baseMoveSpeedR4();
    return isVoidPhase()==="real"?speed*.85:speed;
  };

  function parasiteActive(){
    return hasDivineSkill("parasitePact")&&runtime.parasiteTarget&&isEnemyHostile(runtime.parasiteTarget)&&state.t<runtime.parasiteUntil;
  }

  function exactRuleDamage(enemy,amount,source){
    if(!enemy||enemy.dead||amount<=0)return 0;
    const meta={source,tags:["RULE","DAMAGE"],allowProcs:false};
    const multiplier=Math.max(1e-9,getOutgoingDamageMultiplier(enemy,meta));
    const before=Math.max(0,enemy.hp);
    hitEnemy(enemy,amount/multiplier,0,meta);
    return Math.min(before,amount);
  }

  function consumeScapegoat(){
    const proxy=runtime.scapegoat;
    if(!proxy||!isEnemyHostile(proxy)||proxy.elite)return false;
    runtime.scapegoat=null;
    exactRuleDamage(proxy,Math.max(1,proxy.hp+.0001),"scapegoatFate");
    emitSkillEvent("divine_trigger",{id:"scapegoatFate",enemy:proxy,consumed:true});
    return true;
  }

  function scheduleDebt(amount){
    if(amount<=0)return;
    runtime.debts.push({remaining:amount,rate:amount/5});
  }

  function resolveHpDamage(amount,meta={}){
    if(amount<=0)return 0;
    let hpDamage=amount;

    if(parasiteActive()){
      const redirected=hpDamage*.30;
      hpDamage-=redirected;
      exactRuleDamage(runtime.parasiteTarget,redirected,"parasitePact");
      if(!runtime.parasiteTarget||runtime.parasiteTarget.dead){runtime.parasiteTarget=null;runtime.parasiteUntil=0;}
    }

    if(hasDivineSkill("bloodDebt")&&meta?.source!=="bloodDebt"){
      const debt=hpDamage*.50;
      hpDamage-=debt;
      scheduleDebt(debt);
    }

    if(hpDamage>=player.hp&&runtime.scapegoat&&hasDivineSkill("scapegoatFate")&&consumeScapegoat()){
      const dealt=Math.max(0,player.hp-1);
      player.hp=1;
      if(dealt>0)emitSkillEvent("damage_taken",{amount:dealt,source:meta.source||null,meta:{...meta,source:"scapegoatFate"}});
      return 0;
    }

    if(hpDamage<=0)return 0;
    player.hp-=hpDamage;
    emitSkillEvent("damage_taken",{amount:hpDamage,source:meta.source||null,meta});

    if(player.hp<=0&&player.reviveCharges>0){
      player.reviveCharges--;
      player.hp=Math.max(1,player.maxHp*(.24+.06*skillLevel("secondWind")));
      emitSkillEvent("revive",{chargesLeft:player.reviveCharges});
    }
    if(player.hp<=0&&hasDivineSkill("immortalBreath")&&!skillRuntime.counters.immortalBreathUsed){
      skillRuntime.counters.immortalBreathUsed=1;
      player.hp=1;
      player.invulnerableUntil=state.t+4;
      emitSkillEvent("divine_trigger",{id:"immortalBreath"});
    }
    return hpDamage;
  }

  const baseDamagePlayerR4=damagePlayer;
  damagePlayer=function(amount,meta={}){
    const phase=isVoidPhase();
    const oldDodge=player.dodgeChance;
    if(phase==="void")player.dodgeChance=oldDodge+.30;

    try{
      // Let earlier defensive rules keep priority: invulnerability, Thời Đình,
      // Hoán Vị, Thiên Ấn and an armed Đảo Nhân Quả resolve before this layer.
      const source=meta?.source;
      const heavenSealReady=hasDivineSkill("heavenSeal")&&meta?.type==="contact"&&source&&isEnemyHostile(source)&&state.t>=(source.__heavenSealReadyAt||0);
      const earlierBlocks=(player.invulnerableUntil||0)>state.t
        ||(meta?.type==="contact"&&(player.spatialSwapImmuneUntil||0)>state.t)
        ||(hasDivineSkill("timeStop")&&state.v016RareR3&&state.t<state.v016RareR3.timeStopUntil&&meta?.type==="contact")
        ||heavenSealReady
        ||Boolean(state.v016RareR2?.causalArmed&&hasDivineSkill("causalInversion"));
      if(earlierBlocks)return baseDamagePlayerR4(amount,meta);

      const specialHpRules=hasDivineSkill("bloodDebt")||parasiteActive()||(runtime.scapegoat&&hasDivineSkill("scapegoatFate"));
      if(!specialHpRules)return baseDamagePlayerR4(amount,meta);
      if(amount<=0||player.hp<=0)return 0;

      if(Math.random()<player.dodgeChance){emitSkillEvent("dodge",{amount,meta});return 0;}

      let adjusted=amount;
      if(hasDivineSkill("divineDomain")&&state.v016RareR2&&state.t<state.v016RareR2.domainUntil&&meta?.type==="contact"&&source&&isEnemyHostile(source)&&Math.hypot(source.x-player.x,source.y-player.y)<=140)adjusted*=.60;
      let remaining=adjusted*getIncomingDamageMultiplier(meta);

      const hadShield=player.shield>0;
      if(player.shield>0){
        const absorbed=Math.min(player.shield,remaining);
        player.shield-=absorbed;
        remaining-=absorbed;
        if(hadShield&&player.shield<=0)emitSkillEvent("shield_broken",{absorbed,meta});
      }
      if(remaining<=0)return 0;
      return resolveHpDamage(remaining,meta);
    }finally{
      player.dodgeChance=oldDodge;
    }
  };

  function applyDebtTick(amount){
    if(amount<=0||player.hp<=0)return 0;
    if(amount>=player.hp&&runtime.scapegoat&&hasDivineSkill("scapegoatFate")&&consumeScapegoat()){
      const dealt=Math.max(0,player.hp-1);player.hp=1;
      if(dealt>0)emitSkillEvent("damage_taken",{amount:dealt,source:"bloodDebt",meta:{source:"bloodDebt",type:"debt"}});
      return 0;
    }
    player.hp-=amount;
    emitSkillEvent("damage_taken",{amount,source:"bloodDebt",meta:{source:"bloodDebt",type:"debt"}});
    if(player.hp<=0&&player.reviveCharges>0){player.reviveCharges--;player.hp=Math.max(1,player.maxHp*(.24+.06*skillLevel("secondWind")));emitSkillEvent("revive",{chargesLeft:player.reviveCharges});}
    if(player.hp<=0&&hasDivineSkill("immortalBreath")&&!skillRuntime.counters.immortalBreathUsed){skillRuntime.counters.immortalBreathUsed=1;player.hp=1;player.invulnerableUntil=state.t+4;emitSkillEvent("divine_trigger",{id:"immortalBreath"});}
    if(player.hp<=0&&!state.gameOver){player.hp=0;finishRun("defeat");}
    return amount;
  }

  onSkillEvent("kill",payload=>{
    if(runtime.scapegoat&&payload?.enemy===runtime.scapegoat)runtime.scapegoat=null;
    if(runtime.parasiteTarget&&payload?.enemy===runtime.parasiteTarget){runtime.parasiteTarget=null;runtime.parasiteUntil=0;}
    if(hasDivineSkill("bloodDebt")&&runtime.debts.length){for(const debt of runtime.debts)debt.remaining*=.85;}
  });

  const baseUpdateR4=update;
  update=function(dt){
    const result=baseUpdateR4(dt);
    if(!state.running||state.gameOver)return result;
    for(const debt of runtime.debts){
      if(debt.remaining<=0)continue;
      const paid=Math.min(debt.remaining,debt.rate*dt);
      debt.remaining-=paid;
      applyDebtTick(paid);
      if(state.gameOver)break;
    }
    runtime.debts=runtime.debts.filter(debt=>debt.remaining>1e-6);
    if(runtime.parasiteTarget&&(!isEnemyHostile(runtime.parasiteTarget)||state.t>=runtime.parasiteUntil)){runtime.parasiteTarget=null;runtime.parasiteUntil=0;}
    if(runtime.scapegoat&&(!isEnemyHostile(runtime.scapegoat)||runtime.scapegoat.elite))runtime.scapegoat=null;
    return result;
  };

  const baseResetR4=resetSkillEngine;
  resetSkillEngine=function(){
    const result=baseResetR4();
    runtime.debts.length=0;
    runtime.parasiteTarget=null;runtime.parasiteUntil=0;
    runtime.voidStart=0;runtime.scapegoat=null;
    return result;
  };
})();
