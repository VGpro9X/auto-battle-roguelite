// V0.16 Rare Batch R1 — Thiên Mệnh, Phán Quyết, Hoán Vị, Đồng Giá.
// Adds four level-less unique rule skills to the shared DIVINE_SKILLS pool.

(()=>{
  const ruleMeta=(source,tags=[])=>({source,tags:["RULE",...tags],allowProcs:false});

  function exactRuleDamage(enemy,amount,source,tags=[]){
    if(!enemy||enemy.dead||amount<=0)return 0;
    const meta=ruleMeta(source,tags);
    const multiplier=Math.max(1e-9,getOutgoingDamageMultiplier(enemy,meta));
    const before=Math.max(0,enemy.hp);
    hitEnemy(enemy,amount/multiplier,0,meta);
    return Math.min(before,amount);
  }

  DIVINE_SKILLS.heavenlyMandate={
    id:"heavenlyMandate",tier:"divine",name:"Thiên Mệnh",icon:"✦📜",
    desc:"Cứ mỗi 30 giây, toàn bộ Kỹ Năng định kỳ cơ bản bạn đang sở hữu lập tức được kích hoạt thêm đúng 1 lần. Lần kích hoạt thưởng không đặt lại bộ đếm thời gian bình thường; kỹ năng không có mục tiêu hợp lệ sẽ bỏ qua lần đó.",
    cooldown:30,preview:"heavenlyMandate",
    execute:()=>{
      for(const [key,skill] of Object.entries(skills)){
        const level=skillLevel(key);
        if(level<=0||!skill?.periodic||typeof skill.periodic.execute!=="function")continue;
        const fired=skill.periodic.execute(level)!==false;
        if(fired)emitSkillEvent("periodic",{skillKey:key,level,source:"heavenlyMandate"});
      }
      return true;
    }
  };

  DIVINE_SKILLS.divineJudgment={
    id:"divineJudgment",tier:"divine",name:"Phán Quyết",icon:"⚖✦",
    desc:"Mỗi 60 kẻ địch bị hạ, tiêu diệt ngay kẻ địch thường có HP hiện tại cao nhất. Nếu lúc đó chỉ còn Tinh Anh, Tinh Anh có HP hiện tại cao nhất chịu sát thương bằng đúng 20% HP tối đa của nó.",
    preview:"divineJudgment"
  };

  DIVINE_SKILLS.spatialSwap={
    id:"spatialSwap",tier:"mystic",name:"Hoán Vị",icon:"↔◇",
    desc:"Cứ mỗi 12 giây, nếu có ít nhất 3 kẻ địch trong 90px quanh bạn và có một kẻ địch ở khoảng 180–320px, lập tức đổi vị trí với kẻ xa nhất đủ điều kiện. Sau khi đổi vị trí, bạn không nhận sát thương tiếp xúc trong 0.6 giây.",
    cooldown:12,preview:"spatialSwap",
    execute:()=>{
      const hostiles=state.enemies.filter(isEnemyHostile);
      if(hostiles.filter(enemy=>Math.hypot(enemy.x-player.x,enemy.y-player.y)<=90).length<3)return false;
      const distant=hostiles
        .map(enemy=>({enemy,d:Math.hypot(enemy.x-player.x,enemy.y-player.y)}))
        .filter(entry=>entry.d>=180&&entry.d<=320)
        .sort((a,b)=>b.d-a.d);
      const target=distant[0]?.enemy;
      if(!target)return false;
      const px=player.x,py=player.y;
      player.x=target.x;player.y=target.y;
      target.x=px;target.y=py;
      player.spatialSwapImmuneUntil=state.t+.6;
      emitSkillEvent("divine_trigger",{id:"spatialSwap",enemy:target,from:{x:px,y:py},to:{x:player.x,y:player.y}});
      return true;
    }
  };

  DIVINE_SKILLS.equalPrice={
    id:"equalPrice",tier:"mystic",name:"Đồng Giá",icon:"◆⚖",
    desc:"Khi HP đang đầy, mỗi tinh thể XP chỉ cho bạn 70% lượng XP lẽ ra nhận sau mọi hệ số kinh nghiệm; 30% còn lại được đổi thành khiên theo tỷ lệ 2 khiên cho mỗi 1 XP đã đổi. Khi HP không đầy, tinh thể XP hoạt động bình thường. Không có giới hạn khiên ẩn.",
    preview:"equalPrice"
  };

  onSkillEvent("kill",()=>{
    if(!hasDivineSkill("divineJudgment"))return;
    skillRuntime.counters.divineJudgment=(skillRuntime.counters.divineJudgment||0)+1;
    while(skillRuntime.counters.divineJudgment>=60){
      skillRuntime.counters.divineJudgment-=60;
      const hostiles=state.enemies.filter(isEnemyHostile);
      const normals=hostiles.filter(enemy=>!enemy.elite).sort((a,b)=>b.hp-a.hp);
      if(normals.length){
        const target=normals[0];
        exactRuleDamage(target,Math.max(1,target.hp+.0001),"divineJudgment",["KILL"]);
        emitSkillEvent("divine_trigger",{id:"divineJudgment",enemy:target,executed:true});
        continue;
      }
      const elites=hostiles.filter(enemy=>enemy.elite).sort((a,b)=>b.hp-a.hp);
      if(elites.length){
        const target=elites[0];
        exactRuleDamage(target,target.maxHp*.20,"divineJudgment",["DAMAGE"]);
        emitSkillEvent("divine_trigger",{id:"divineJudgment",enemy:target,executed:false});
      }
    }
  });

  const baseDamagePlayerR1=damagePlayer;
  damagePlayer=function(amount,meta={}){
    if(hasDivineSkill("spatialSwap")&&meta?.type==="contact"&&(player.spatialSwapImmuneUntil||0)>state.t)return 0;
    return baseDamagePlayerR1(amount,meta);
  };

  const baseGainXpR1=gainXp;
  gainXp=function(amount){
    if(!hasDivineSkill("equalPrice")||player.hp<player.maxHp-1e-9)return baseGainXpR1(amount);
    const finalAmount=amount*player.xpMultiplier;
    const shieldGain=finalAmount*.30*2;
    const result=baseGainXpR1(amount*.70);
    if(shieldGain>0)addShield(shieldGain);
    return result;
  };
})();
