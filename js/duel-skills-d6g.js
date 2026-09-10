(()=>{
  const root=typeof window!=="undefined"?window:globalThis;
  if(typeof DUEL_SKILLS==="undefined"||typeof DUEL_SKILL_KEYS==="undefined"||typeof registerDuelSkillBehavior!=="function")return;

  const additions={
    magnet:{maxRank:3,tags:["XP","MAGNET","CONTROL"],rangeBias:0,meleeBias:.75,controlBias:.75,desc:r=>`Duel không có tinh thể XP nên Linh Hấp chuyển thành hấp lực chiến đấu: mỗi ${[6,5,4][r-1]} giây, nếu đối thủ trong ${[360,420,480][r-1]}px, kéo họ ${[40,65,90][r-1]}px về phía bạn. Ngoài tầm sẽ thử lại sau 0,5 giây.`},
    blood:{maxRank:3,tags:["BLOOD","HEAL","CHARGE"],rangeBias:.1,meleeBias:.65,defenseBias:.45,desc:r=>`Duel không có chuỗi hạ gục trong một round: mỗi ${[80,65,50][r-1]} sát thương thực sự bạn gây lên HP hoặc khiên sẽ hồi ${[4,7,11][r-1]} HP. Sát thương dư được giữ lại; hồi phục vẫn chịu HUYẾT CHIẾN/TỬ CHIẾN.`},
    wisdom:{maxRank:3,tags:["XP","TIME","SCALING"],rangeBias:.35,meleeBias:.25,desc:r=>`Duel không có XP trong trận nên Ngộ Tính đổi thành tăng tốc tiến trình Kỹ Năng: mọi bộ đếm skill timer của bạn trôi nhanh thêm ${[6,10,15][r-1]}%. Không tăng tốc đòn đánh thường hoặc dash.`},
    soulHarvest:{maxRank:3,tags:["SOUL","SCALING","CHARGE"],rangeBias:.1,meleeBias:.75,desc:r=>`Trong mỗi round, cứ mỗi ${[120,90,70][r-1]} sát thương thực sự bạn gây, Thực Hồn tăng sát thương cơ bản thêm ${[1,1.5,2][r-1]} cho phần còn lại của round, tối đa ${[4,6,8][r-1]} tầng. Sát thương dư được giữ khi chưa tối đa.`},
    corpseBurst:{maxRank:3,tags:["EXPLOSION","AREA","RULE"],rangeBias:.2,meleeBias:.65,desc:r=>`Duel không có nhiều xác địch nên Thi Bạo chuyển thành nổ theo mốc HP đối thủ: ${r===1?'khi xuống dưới 50% HP':r===2?'khi xuống dưới 66% và 33% HP':'khi xuống dưới 75%, 50% và 25% HP'}, mỗi mốc chỉ kích 1 lần/round và gây ${[16,22,28][r-1]} sát thương Area.`},
    xpStorm:{maxRank:3,tags:["XP","LIGHTNING","CHARGE","MOVEMENT"],rangeBias:.35,meleeBias:.4,mobilityBias:.75,desc:r=>`Duel không có XP để tích điện nên Linh Triều nạp từ quãng đường thực sự di chuyển: mỗi ${[260,220,180][r-1]}px di chuyển, phóng sét vào đối thủ gây ${[22,34,48][r-1]} sát thương Sét. Quãng đường dư được giữ lại.`},
    markSpread:{maxRank:3,tags:["MARK","TIME","SCALING"],rangeBias:.4,meleeBias:.35,controlBias:.45,desc:r=>`Trong 1v1 không có mục tiêu thứ hai để lan Ấn. Nếu bạn sở hữu Tử Ấn, mỗi lần Tử Ấn mới được đặt sẽ kéo dài thêm ${[1.5,2.5,4][r-1].toFixed(1)} giây đúng 1 lần. Không có Tử Ấn thì Ấn Lan không tạo Ấn riêng.`},
    xpHeal:{maxRank:3,tags:["XP","HEAL","PERIODIC"],rangeBias:.1,meleeBias:.3,defenseBias:.65,desc:r=>`Duel không có nhặt XP nên Linh Dưỡng chuyển thành hồi linh định kỳ: mỗi ${[7,5.5,4][r-1].toFixed(1)} giây hồi ${[3,5,8][r-1]} HP. Lần hồi đầu chờ đủ hồi chiêu; chịu đầy đủ luật giảm hồi phục của HUYẾT CHIẾN/TỬ CHIẾN.`},
    levelBurst:{maxRank:3,tags:["LEVEL_UP","EXPLOSION","AREA","RULE"],rangeBias:.45,meleeBias:.45,desc:r=>`Duel không lên cấp giữa round nên Phá Cảnh chuyển thành một vụ nổ duy nhất sau 1,5 giây đầu mỗi round, đặt tại đối thủ và gây ${[18,30,44][r-1]} sát thương Area. Không lặp lại trong cùng round.`},
    bountyMark:{maxRank:3,tags:["MARK","XP","SHIELD","CHARGE"],rangeBias:.35,meleeBias:.4,defenseBias:.45,desc:r=>`Mỗi ${[9,7.5,6][r-1].toFixed(1)} giây tự đặt Thưởng Ấn lên đối thủ trong 4 giây. Nếu bạn gây ít nhất ${[36,32,28][r-1]} sát thương thực sự trong cửa sổ đó, nhận ${[8,14,22][r-1]} khiên đúng 1 lần cho cửa sổ. Ngoài cửa sổ không tích tiến độ.`}
  };

  for(const [key,adapter] of Object.entries(additions)){
    if(!DUEL_SKILLS[key])DUEL_SKILLS[key]=adapter;
    if(!DUEL_SKILL_KEYS.includes(key))DUEL_SKILL_KEYS.push(key);
  }

  const VALUES={
    magnet:{cooldown:[6,5,4],range:[360,420,480],pull:[40,65,90],retry:.5},
    blood:{threshold:[80,65,50],heal:[4,7,11]},
    wisdom:{speed:[.06,.10,.15]},
    soulHarvest:{threshold:[120,90,70],gain:[1,1.5,2],cap:[4,6,8]},
    corpseBurst:{thresholds:[[.50],[.66,.33],[.75,.50,.25]],damage:[16,22,28]},
    xpStorm:{distance:[260,220,180],damage:[22,34,48]},
    markSpread:{extension:[1.5,2.5,4]},
    xpHeal:{cooldown:[7,5.5,4],heal:[3,5,8]},
    levelBurst:{delay:1.5,damage:[18,30,44]},
    bountyMark:{cooldown:[9,7.5,6],duration:4,goal:[36,32,28],shield:[8,14,22]}
  };
  const at=(table,rank)=>table[Math.max(0,Math.min(table.length-1,rank-1))];

  registerDuelSkillBehavior("magnet",{
    onCreate:({fighter,rank})=>{fighter.skillTimers.magnet=at(VALUES.magnet.cooldown,rank);},
    update:({fighter,other,rank,knockback,emit})=>{
      if((fighter.skillTimers.magnet??0)>0||!other||other.hp<=0)return;
      if(Math.abs(other.x-fighter.x)>at(VALUES.magnet.range,rank)){fighter.skillTimers.magnet=VALUES.magnet.retry;return;}
      fighter.skillTimers.magnet=at(VALUES.magnet.cooldown,rank);
      const direction=fighter.x<other.x?-1:1;
      knockback(other,at(VALUES.magnet.pull,rank),direction);
      emit("status",{side:other.side,status:"magnet",x:other.x,y:other.y-55});
    }
  });

  registerDuelSkillBehavior("blood",{
    onCreate:({fighter})=>{fighter.duelEffects.bloodCharge=0;},
    onDamageDealt:({fighter,rank,totalDamage,heal,meta})=>{
      if(totalDamage<=0||meta?.source==="blood")return;
      fighter.duelEffects.bloodCharge=(fighter.duelEffects.bloodCharge||0)+totalDamage;
      const need=at(VALUES.blood.threshold,rank);
      while(fighter.duelEffects.bloodCharge>=need){fighter.duelEffects.bloodCharge-=need;heal(fighter,at(VALUES.blood.heal,rank),"blood");}
    }
  });

  registerDuelSkillBehavior("wisdom",{
    update:({fighter,dt,rank})=>{
      const extra=dt*at(VALUES.wisdom.speed,rank);
      for(const key of Object.keys(fighter.skillTimers))fighter.skillTimers[key]-=extra;
    }
  });

  registerDuelSkillBehavior("soulHarvest",{
    onCreate:({fighter})=>{fighter.duelEffects.soulHarvest={charge:0,stacks:0};},
    onDamageDealt:({fighter,rank,totalDamage,emit})=>{
      if(totalDamage<=0)return;
      const state=fighter.duelEffects.soulHarvest,need=at(VALUES.soulHarvest.threshold,rank),cap=at(VALUES.soulHarvest.cap,rank);
      if(state.stacks>=cap)return;
      state.charge+=totalDamage;
      while(state.charge>=need&&state.stacks<cap){state.charge-=need;state.stacks++;fighter.stats.baseDamage+=at(VALUES.soulHarvest.gain,rank);emit("status",{side:fighter.side,status:"soulHarvest",x:fighter.x,y:fighter.y-88,stacks:state.stacks});}
      if(state.stacks>=cap)state.charge=0;
    }
  });

  registerDuelSkillBehavior("corpseBurst",{
    onCreate:({fighter})=>{fighter.duelEffects.corpseBurstTriggered=[];},
    onDamageDealt:({fighter,other,rank,totalDamage,meta,dealDamage,emit})=>{
      if(totalDamage<=0||!other||other.maxHp<=0||meta?.source==="corpseBurst")return;
      const ratio=other.hp/other.maxHp,thresholds=VALUES.corpseBurst.thresholds[rank-1];
      const triggered=fighter.duelEffects.corpseBurstTriggered;
      for(let i=0;i<thresholds.length;i++){
        if(triggered[i]||ratio>thresholds[i]||other.hp<=0)continue;
        triggered[i]=true;
        dealDamage(fighter,other,at(VALUES.corpseBurst.damage,rank),{source:"corpseBurst",area:true,canCrit:false,dodgeable:false,reactive:false});
        emit("area",{side:fighter.side,skill:"corpseBurst",x:other.x,y:other.y-38,radius:78,threshold:thresholds[i]});
      }
    }
  });

  registerDuelSkillBehavior("xpStorm",{
    onCreate:({fighter})=>{fighter.duelEffects.xpStorm={lastX:fighter.x,distance:0};},
    update:({fighter,other,rank,dealDamage,emit})=>{
      const state=fighter.duelEffects.xpStorm;
      state.distance+=Math.abs(fighter.x-state.lastX);state.lastX=fighter.x;
      const need=at(VALUES.xpStorm.distance,rank);
      while(state.distance>=need&&other&&other.hp>0){
        state.distance-=need;
        dealDamage(fighter,other,at(VALUES.xpStorm.damage,rank),{source:"xpStorm",elemental:true,canCrit:false,dodgeable:false,reactive:false});
        emit("cast",{side:fighter.side,skill:"xpStorm",x:other.x,y:other.y-105});
      }
    }
  });

  registerDuelSkillBehavior("markSpread",{
    update:({fighter,other,rank})=>{
      const mark=other?.duelEffects?.deathMark;
      if(!mark||mark.source!==fighter.side||mark.spreadExtended)return;
      mark.until+=at(VALUES.markSpread.extension,rank);mark.spreadExtended=true;
    }
  });

  registerDuelSkillBehavior("xpHeal",{
    onCreate:({fighter,rank})=>{fighter.skillTimers.xpHeal=at(VALUES.xpHeal.cooldown,rank);},
    update:({fighter,rank,heal})=>{
      if((fighter.skillTimers.xpHeal??0)>0)return;
      fighter.skillTimers.xpHeal=at(VALUES.xpHeal.cooldown,rank);
      heal(fighter,at(VALUES.xpHeal.heal,rank),"xpHeal");
    }
  });

  registerDuelSkillBehavior("levelBurst",{
    onCreate:({fighter})=>{fighter.duelEffects.levelBurst={impactAt:VALUES.levelBurst.delay,done:false};},
    update:({round,fighter,other,rank,dealDamage,emit})=>{
      const state=fighter.duelEffects.levelBurst;
      if(state.done||round.time<state.impactAt||!other||other.hp<=0)return;
      state.done=true;
      dealDamage(fighter,other,at(VALUES.levelBurst.damage,rank),{source:"levelBurst",area:true,canCrit:false,dodgeable:false,reactive:false});
      emit("area",{side:fighter.side,skill:"levelBurst",x:other.x,y:other.y-34,radius:90});
    }
  });

  registerDuelSkillBehavior("bountyMark",{
    onCreate:({fighter,rank})=>{fighter.skillTimers.bountyMark=at(VALUES.bountyMark.cooldown,rank);fighter.duelEffects.bountyMark={until:0,progress:0,rewarded:false};},
    update:({round,fighter,other,rank,emit})=>{
      const state=fighter.duelEffects.bountyMark;
      if(state.until>0&&round.time>=state.until){state.until=0;state.progress=0;state.rewarded=false;}
      if((fighter.skillTimers.bountyMark??0)>0||state.until>round.time||!other||other.hp<=0)return;
      fighter.skillTimers.bountyMark=at(VALUES.bountyMark.cooldown,rank);state.until=round.time+VALUES.bountyMark.duration;state.progress=0;state.rewarded=false;
      emit("status",{side:other.side,status:"bountyMark",x:other.x,y:other.y-88,duration:VALUES.bountyMark.duration});
    },
    onDamageDealt:({round,fighter,rank,totalDamage,addShield})=>{
      const state=fighter.duelEffects.bountyMark;
      if(!state||state.rewarded||state.until<=round.time||totalDamage<=0)return;
      state.progress+=totalDamage;
      if(state.progress<at(VALUES.bountyMark.goal,rank))return;
      state.rewarded=true;addShield(fighter,at(VALUES.bountyMark.shield,rank),"bountyMark");
    }
  });

  root.DUEL_D6G_VALUES=VALUES;
})();