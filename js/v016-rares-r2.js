// V0.16 Rare Batch R2 — Thiên Hộ, Thần Vực, Nghịch Lưu, Đảo Nhân Quả.

(()=>{
  const runtime=state.v016RareR2={
    domainUntil:0,
    history:[],
    causalArmed:false
  };

  DIVINE_SKILLS.heavenlyWard={
    id:"heavenlyWard",tier:"divine",name:"Thiên Hộ",icon:"🛡☀",
    desc:"Mỗi khi khiên của bạn bị phá, nhận 1.5 giây bất tử. Thiên Hộ có hồi chiêu 12 giây tính từ lần kích hoạt thành công.",
    preview:"heavenlyWard"
  };

  DIVINE_SKILLS.divineDomain={
    id:"divineDomain",tier:"divine",name:"Thần Vực",icon:"◎☀",
    desc:"Cứ mỗi 24 giây, mở Thần Vực bán kính 140 quanh bạn trong 5 giây. Kẻ địch trong Thần Vực di chuyển chậm 40%, gây ít hơn 40% sát thương tiếp xúc và nhận thêm 20% sát thương từ bạn.",
    cooldown:24,preview:"divineDomain",
    execute:()=>{runtime.domainUntil=state.t+5;return true;}
  };

  DIVINE_SKILLS.lifeRewind={
    id:"lifeRewind",tier:"mystic",name:"Nghịch Lưu",icon:"⏪♥",
    desc:"Cứ mỗi 25 giây, nhìn lại trạng thái của bạn 5 giây trước. Nếu tổng HP + khiên khi đó cao hơn hiện tại, khôi phục HP và khiên về các giá trị đã ghi lại; HP không vượt HP tối đa hiện tại. Nếu trạng thái cũ không tốt hơn thì không có gì xảy ra.",
    cooldown:25,preview:"lifeRewind",
    execute:()=>{
      const targetTime=state.t-5;
      let snapshot=null;
      for(const entry of runtime.history){if(entry.t<=targetTime)snapshot=entry;else break;}
      if(!snapshot)return false;
      if(snapshot.hp+snapshot.shield>player.hp+player.shield+1e-9){
        player.hp=Math.min(player.maxHp,snapshot.hp);
        player.shield=snapshot.shield;
        emitSkillEvent("divine_trigger",{id:"lifeRewind",snapshot});
      }
      return true;
    }
  };

  DIVINE_SKILLS.causalInversion={
    id:"causalInversion",tier:"mystic",name:"Đảo Nhân Quả",icon:"↻☯",
    desc:"Cứ mỗi 15 giây tích một lần Đảo Nhân Quả. Đòn sát thương tiếp theo lẽ ra bạn phải nhận sau giảm sát thương sẽ bị triệt tiêu và thay vào đó hồi HP bằng đúng lượng sát thương đó. Đòn bị đảo không làm mất khiên. Chỉ tích tối đa 1 lần.",
    cooldown:15,preview:"causalInversion",
    execute:()=>{
      if(runtime.causalArmed)return false;
      runtime.causalArmed=true;
      emitSkillEvent("divine_trigger",{id:"causalInversion",armed:true});
      return true;
    }
  };

  onSkillEvent("shield_broken",()=>{
    if(!hasDivineSkill("heavenlyWard"))return;
    const readyAt=skillRuntime.cooldowns.heavenlyWard||0;
    if(state.t<readyAt)return;
    skillRuntime.cooldowns.heavenlyWard=state.t+12;
    player.invulnerableUntil=Math.max(player.invulnerableUntil||0,state.t+1.5);
    emitSkillEvent("divine_trigger",{id:"heavenlyWard"});
  });

  const baseOutgoingR2=getOutgoingDamageMultiplier;
  getOutgoingDamageMultiplier=function(enemy,meta={}){
    let multiplier=baseOutgoingR2(enemy,meta);
    if(hasDivineSkill("divineDomain")&&state.t<runtime.domainUntil&&enemy&&isEnemyHostile(enemy)&&Math.hypot(enemy.x-player.x,enemy.y-player.y)<=140)multiplier*=1.20;
    return multiplier;
  };

  const baseDamagePlayerR2=damagePlayer;
  damagePlayer=function(amount,meta={}){
    if(runtime.causalArmed&&hasDivineSkill("causalInversion")){
      if((player.invulnerableUntil||0)>state.t)return baseDamagePlayerR2(amount,meta);
      if(meta?.type==="contact"&&(player.spatialSwapImmuneUntil||0)>state.t)return baseDamagePlayerR2(amount,meta);
      if(Math.random()<player.dodgeChance){emitSkillEvent("dodge",{amount,meta});return 0;}
      const inverted=Math.max(0,amount*getIncomingDamageMultiplier(meta));
      runtime.causalArmed=false;
      if(inverted>0)healPlayer(inverted,{source:"causalInversion"});
      emitSkillEvent("divine_trigger",{id:"causalInversion",amount:inverted,consumed:true});
      return 0;
    }
    let adjusted=amount;
    const source=meta?.source;
    if(hasDivineSkill("divineDomain")&&state.t<runtime.domainUntil&&meta?.type==="contact"&&source&&isEnemyHostile(source)&&Math.hypot(source.x-player.x,source.y-player.y)<=140)adjusted*=.60;
    return baseDamagePlayerR2(adjusted,meta);
  };

  const baseUpdateR2=update;
  update=function(dt){
    const slowed=[];
    if(hasDivineSkill("divineDomain")&&state.t<runtime.domainUntil){
      for(const enemy of state.enemies){
        if(!isEnemyHostile(enemy)||Math.hypot(enemy.x-player.x,enemy.y-player.y)>140)continue;
        slowed.push([enemy,enemy.speed]);
        enemy.speed*=.60;
      }
    }
    const result=baseUpdateR2(dt);
    for(const [enemy,speed] of slowed)enemy.speed=speed;

    if(state.running&&!state.gameOver){
      runtime.history.push({t:state.t,hp:player.hp,shield:player.shield});
      const cutoff=state.t-6.2;
      while(runtime.history.length&&runtime.history[0].t<cutoff)runtime.history.shift();
    }
    return result;
  };

  const baseResetR2=resetSkillEngine;
  resetSkillEngine=function(){
    const result=baseResetR2();
    runtime.domainUntil=0;
    runtime.history.length=0;
    runtime.causalArmed=false;
    return result;
  };
})();
