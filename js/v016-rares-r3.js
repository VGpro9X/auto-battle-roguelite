// V0.16 Rare Batch R3 — Thiên Tứ, Thời Đình, Thiên Lệnh, Thiên Ấn.
// Four additional Thần Kỹ; level-less and unique.

(()=>{
  const runtime=state.v016RareR3={
    giftGuard:false,
    timeStopUntil:0
  };

  DIVINE_SKILLS.divineGift={
    id:"divineGift",tier:"divine",name:"Thiên Tứ",icon:"✦+",
    desc:"Mỗi lần bạn chọn một Kỹ Năng cơ bản, có 18% cơ hội kỹ năng vừa chọn lập tức tăng thêm 1 cấp miễn phí nếu sau lựa chọn nó vẫn chưa TỐI ĐA. Cấp thưởng không tiêu hao lượt chọn và vẫn có thể mở Hợp Đạo Kỹ hoặc Siêu Cấp bình thường.",
    preview:"divineGift"
  };

  DIVINE_SKILLS.timeStop={
    id:"timeStop",tier:"divine",name:"Thời Đình",icon:"Ⅱ✦",
    desc:"Cứ mỗi 24 giây, thời gian của toàn bộ kẻ địch dừng trong 2 giây: chúng không di chuyển và không gây sát thương tiếp xúc, trong khi bạn, đạn và các bộ đếm kỹ năng của bạn vẫn hoạt động bình thường. Kẻ địch đã bị Mua Chuộc không bị dừng.",
    cooldown:24,preview:"timeStop",
    execute:()=>{
      runtime.timeStopUntil=state.t+2;
      syncTimeStopEnemies();
      emitSkillEvent("divine_trigger",{id:"timeStop",until:runtime.timeStopUntil});
      return true;
    }
  };

  DIVINE_SKILLS.celestialEdict={
    id:"celestialEdict",tier:"divine",name:"Thiên Lệnh",icon:"✦!",
    desc:"Cứ mỗi 36 giây, toàn bộ kẻ địch thường đang tồn tại mất 18% HP hiện tại; Tinh Anh mất 8% HP hiện tại. Thiên Lệnh không thể trực tiếp hạ mục tiêu xuống dưới 1 HP, không tác động lên kẻ địch đã bị Mua Chuộc và không kích hoạt hiệu ứng khi đánh trúng.",
    cooldown:36,preview:"celestialEdict",
    execute:()=>{
      const targets=[];
      for(const enemy of state.enemies){
        if(!isEnemyHostile(enemy)||enemy.hp<=1)continue;
        const ratio=enemy.elite?.08:.18;
        const loss=Math.min(enemy.hp-1,enemy.hp*ratio);
        if(loss<=0)continue;
        enemy.hp-=loss;
        enemy.hit=Math.max(enemy.hit||0,.08);
        targets.push({enemy,loss});
      }
      emitSkillEvent("divine_trigger",{id:"celestialEdict",targets});
      return true;
    }
  };

  DIVINE_SKILLS.heavenSeal={
    id:"heavenSeal",tier:"divine",name:"Thiên Ấn",icon:"◎✦",
    desc:"Đòn tiếp xúc đầu tiên mỗi kẻ địch gây lên bạn bị triệt tiêu hoàn toàn. Sau khi Thiên Ấn chặn một đòn từ kẻ địch đó, cùng kẻ địch phải chờ 12 giây mới có thể bị Thiên Ấn chặn lại. Né tránh được kiểm tra trước và đòn đã né không tiêu hao Thiên Ấn.",
    preview:"heavenSeal"
  };

  onSkillEvent("skill_selected",payload=>{
    if(runtime.giftGuard||!hasDivineSkill("divineGift"))return;
    const key=payload?.key;
    const skill=skills[key];
    if(!skill||skillLevel(key)>=skill.max)return;
    if(Math.random()>=.18)return;
    runtime.giftGuard=true;
    owned[key]=(owned[key]||0)+1;
    skill.apply(owned[key]);
    evaluateBuildUnlocks();
    emitSkillEvent("skill_selected",{key,level:skillLevel(key),free:true,source:"divineGift"});
    emitSkillEvent("divine_trigger",{id:"divineGift",key,level:skillLevel(key)});
    runtime.giftGuard=false;
  });

  function restoreTimeStoppedEnemy(enemy){
    if(enemy&&enemy.__timeStopOriginalSpeed!==undefined){
      enemy.speed=enemy.__timeStopOriginalSpeed;
      delete enemy.__timeStopOriginalSpeed;
    }
  }

  function freezeTimeStoppedEnemy(enemy){
    if(!enemy||enemy.dead||!isEnemyHostile(enemy))return;
    if(enemy.__timeStopOriginalSpeed===undefined)enemy.__timeStopOriginalSpeed=enemy.speed;
    enemy.speed=0;
  }

  function syncTimeStopEnemies(){
    const active=hasDivineSkill("timeStop")&&state.t<runtime.timeStopUntil;
    for(const enemy of state.enemies){
      if(active&&isEnemyHostile(enemy))freezeTimeStoppedEnemy(enemy);
      else restoreTimeStoppedEnemy(enemy);
    }
  }

  const baseSpawnEnemyR3=spawnEnemy;
  spawnEnemy=function(){
    const before=state.enemies.length;
    const result=baseSpawnEnemyR3();
    if(hasDivineSkill("timeStop")&&state.t<runtime.timeStopUntil){
      for(let i=before;i<state.enemies.length;i++)freezeTimeStoppedEnemy(state.enemies[i]);
    }
    return result;
  };

  const baseUpdateR3=update;
  update=function(dt){
    syncTimeStopEnemies();
    const result=baseUpdateR3(dt);
    syncTimeStopEnemies();
    return result;
  };

  const baseDamagePlayerR3=damagePlayer;
  damagePlayer=function(amount,meta={}){
    if(hasDivineSkill("timeStop")&&state.t<runtime.timeStopUntil&&meta?.type==="contact"&&isEnemyHostile(meta?.source))return 0;

    if(hasDivineSkill("heavenSeal")&&meta?.type==="contact"){
      const enemy=meta?.source;
      if(enemy&&isEnemyHostile(enemy)&&state.t>=(enemy.__heavenSealReadyAt||0)){
        if(Math.random()<player.dodgeChance){emitSkillEvent("dodge",{amount,meta});return 0;}
        enemy.__heavenSealReadyAt=state.t+12;
        emitSkillEvent("divine_trigger",{id:"heavenSeal",enemy});
        return 0;
      }
    }
    return baseDamagePlayerR3(amount,meta);
  };

  const baseResetR3=resetSkillEngine;
  resetSkillEngine=function(){
    for(const enemy of state.enemies)restoreTimeStoppedEnemy(enemy);
    const result=baseResetR3();
    runtime.giftGuard=false;
    runtime.timeStopUntil=0;
    return result;
  };
})();
