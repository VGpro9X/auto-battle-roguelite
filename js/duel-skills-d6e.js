(()=>{
  const root=typeof window!=="undefined"?window:globalThis;
  if(typeof DUEL_SKILLS==="undefined"||typeof DUEL_SKILL_KEYS==="undefined"||typeof registerDuelSkillBehavior!=="function")return;

  const additions={
    overclock:{maxRank:3,tags:["TIME","PERIODIC","RISK"],rangeBias:.35,meleeBias:.25,desc:r=>`Mọi bộ đếm hồi chiêu Kỹ Năng tự động trôi nhanh thêm ${[10,20,30][r-1]}%, nhưng HP tối đa của bạn giảm ${[4,8,12][r-1]}%. Không tăng tốc đòn đánh thường hoặc lướt.`},
    summonMastery:{maxRank:3,tags:["SUMMON","SCALING"],rangeBias:.55,meleeBias:.2,summonBias:1.1,desc:r=>`Tăng ${[10,20,32][r-1]}% sát thương từ kỹ năng được đánh dấu Triệu Hồi trong Duel, hiện gồm Linh Hỏa và Lôi Linh.`},
    soulBind:{maxRank:3,tags:["SOUL","CONTROL","PERIODIC"],rangeBias:.35,meleeBias:.4,controlBias:1.1,desc:r=>`Mỗi ${[7,5.8,4.6][r-1].toFixed(1)} giây, nếu đối thủ trong 320px, Trói Hồn gây ${[10,20,32][r-1]} sát thương và làm họ khựng ${[0.4,0.65,0.9][r-1].toFixed(2)} giây. Ngoài tầm sẽ thử lại sau 0,5 giây.`},
    spiritPearl:{maxRank:3,tags:["HEAL","SUMMON","CHARGE","PROJECTILE"],rangeBias:.75,meleeBias:.2,summonBias:.55,defenseBias:.3,desc:r=>`Mỗi 8 HP thực sự được hồi nạp 1 Linh Châu, tối đa ${[1,2,3][r-1]} viên. Cứ mỗi 2,2 giây, nếu có Châu, tiêu hao 1 viên bắn đối thủ gây ${[25,38,52][r-1]} sát thương. Hồi vượt HP tối đa không tích điện.`},
    frostbite:{maxRank:3,tags:["ICE","DAMAGE","CONTROL"],rangeBias:0,meleeBias:.65,controlBias:.45,desc:r=>`Khi đối thủ đang đứng trong Hàn Khí của bạn, mọi sát thương bạn gây tăng ${[10,20,32][r-1]}%. Nếu không sở hữu Hàn Khí hoặc mục tiêu ở ngoài vùng, Hàn Thấu không có bonus.`},
    shatter:{maxRank:3,tags:["ICE","HIT","EXPLOSION"],rangeBias:0,meleeBias:.8,controlBias:.35,desc:r=>`Khi đối thủ đang trong Hàn Khí của bạn, cứ mỗi ${[5,4,3][r-1]} đòn đánh thường trúng sẽ kích Băng Toái gây thêm ${[12,22,34][r-1]} sát thương Băng. Bộ đếm chỉ tăng khi mục tiêu thực sự ở trong vùng Hàn Khí.`},
    conductiveVenom:{maxRank:3,tags:["POISON","LIGHTNING","ELEMENTAL","DOT"],rangeBias:.25,meleeBias:.55,desc:r=>`Mỗi 1 giây khi Độc Tố của bạn còn hoạt động trên đối thủ, có ${[15,25,40][r-1]}% cơ hội phóng điện gây ${[8,14,22][r-1]} sát thương Sét. Không tự nối chuỗi từ chính tia điện này.`},
    combustion:{maxRank:3,tags:["FIRE","EXPLOSION","PERIODIC"],rangeBias:.2,meleeBias:.65,desc:r=>`Khi đối thủ đang cháy bởi bạn, cứ mỗi ${[3.5,3.0,2.5][r-1].toFixed(1)} giây Hỏa Táng có thể nổ nếu mục tiêu trong 220px, gây ${[12,22,34][r-1]} sát thương Hỏa. Ngoài tầm không nổ và chờ lần kiểm tra kế tiếp.`},
    timeEcho:{maxRank:3,tags:["TIME","PERIODIC","RANDOM"],rangeBias:.4,meleeBias:.25,desc:r=>`Mỗi khi một Kỹ Năng tự động hợp lệ vừa bắt đầu lại hồi chiêu, có ${[12,22,34][r-1]}% cơ hội Dội Thời Gian đặt bộ đếm đó về 0 để nó có thể kích hoạt thêm một lần. Không áp dụng cho phản đòn, Hàn Kính hoặc chính Dội Thời Gian.`},
    greed:{maxRank:3,tags:["RULE","DAMAGE","RISK"],rangeBias:.2,meleeBias:.45,desc:r=>`Trong Duel, Tham Lam đổi phần thưởng XP thành sức mạnh trực tiếp: bạn gây thêm ${[8,14,22][r-1]}% mọi sát thương, nhưng đối thủ bắt đầu mỗi round với thêm ${[10,18,28][r-1]}% HP tối đa. Cả lợi và hại đều áp dụng ngay từ đầu round.`}
  };

  for(const [key,adapter] of Object.entries(additions)){
    if(!DUEL_SKILLS[key])DUEL_SKILLS[key]=adapter;
    if(!DUEL_SKILL_KEYS.includes(key))DUEL_SKILL_KEYS.push(key);
  }

  const VALUES={
    overclock:{speed:[.10,.20,.30],hp:[.96,.92,.88]},
    summonMastery:{bonus:[.10,.20,.32]},
    soulBind:{cooldown:[7,5.8,4.6],damage:[10,20,32],stun:[.40,.65,.90],range:320,retry:.5},
    spiritPearl:{threshold:8,cap:[1,2,3],damage:[25,38,52],interval:2.2},
    frostbite:{bonus:[.10,.20,.32]},
    shatter:{hits:[5,4,3],damage:[12,22,34]},
    conductiveVenom:{chance:[.15,.25,.40],damage:[8,14,22],interval:1},
    combustion:{interval:[3.5,3,2.5],damage:[12,22,34],range:220},
    timeEcho:{chance:[.12,.22,.34]},
    greed:{bonus:[.08,.14,.22],enemyHp:[.10,.18,.28]}
  };
  const at=(table,rank)=>table[Math.max(0,Math.min(table.length-1,rank-1))];
  const ECHOABLE=new Set([
    "fire","knock","lightning","nova","barrier","deathMark","sacrifice","blackHole","luckyStar",
    "afterimage","runeMine","meteorSeal","staticField","chaosOrb","fireWisp","stormTotem","returnBlade",
    "timeField","soulBind"
  ]);

  function frostRadius(fighter){
    const rank=typeof getDuelSkillRank==="function"?getDuelSkillRank(fighter.build,"frost"):Number(fighter.build?.frost||0);
    return rank>0?(DUEL_SKILL_VALUES.frost?.radius?.[rank-1]||0):0;
  }
  function insideOwnFrost(fighter,target){
    const radius=frostRadius(fighter);
    return radius>0&&target&&Math.abs(target.x-fighter.x)<=radius;
  }
  function ownedBurnActive(round,fighter,other){
    const normal=other?.statuses?.burnUntil>round.time&&other.statuses.burnSource===fighter.side;
    const meteor=other?.duelEffects?.meteorBurn;
    return Boolean(normal||(meteor&&meteor.source===fighter.side&&meteor.until>round.time));
  }

  registerDuelSkillBehavior("overclock",{
    modifyStats:({stats,rank})=>{stats.maxHp*=at(VALUES.overclock.hp,rank);},
    update:({fighter,dt,rank})=>{
      const extra=dt*at(VALUES.overclock.speed,rank);
      for(const key of Object.keys(fighter.skillTimers))fighter.skillTimers[key]-=extra;
    }
  });

  registerDuelSkillBehavior("summonMastery",{
    modifyOutgoingDamage:({value,rank,meta})=>meta?.summon===true?value*(1+at(VALUES.summonMastery.bonus,rank)):value
  });

  registerDuelSkillBehavior("soulBind",{
    onCreate:({fighter,rank})=>{fighter.skillTimers.soulBind=at(VALUES.soulBind.cooldown,rank);},
    update:({fighter,other,rank,dealDamage,emit})=>{
      if((fighter.skillTimers.soulBind??0)>0||!other||other.hp<=0)return;
      if(Math.abs(other.x-fighter.x)>VALUES.soulBind.range){fighter.skillTimers.soulBind=VALUES.soulBind.retry;return;}
      fighter.skillTimers.soulBind=at(VALUES.soulBind.cooldown,rank);
      dealDamage(fighter,other,at(VALUES.soulBind.damage,rank),{source:"soulBind",canCrit:false,dodgeable:true});
      other.hitStun=Math.max(other.hitStun,at(VALUES.soulBind.stun,rank));
      emit("status",{side:other.side,status:"soulBind",x:other.x,y:other.y-76,duration:at(VALUES.soulBind.stun,rank)});
    }
  });

  registerDuelSkillBehavior("spiritPearl",{
    onCreate:({fighter})=>{fighter.duelEffects.spiritPearl={lastHealing:0,charge:0,pearls:0,fireTimer:VALUES.spiritPearl.interval};},
    update:({fighter,other,dt,rank,spawnProjectile,emit})=>{
      const state=fighter.duelEffects.spiritPearl;
      const gained=Math.max(0,fighter.totalHealing-state.lastHealing);state.lastHealing=fighter.totalHealing;
      const cap=at(VALUES.spiritPearl.cap,rank);
      if(state.pearls<cap&&gained>0){
        state.charge+=gained;
        while(state.charge>=VALUES.spiritPearl.threshold&&state.pearls<cap){state.charge-=VALUES.spiritPearl.threshold;state.pearls++;emit("status",{side:fighter.side,status:"spiritPearlCharge",x:fighter.x,y:fighter.y-90,pearls:state.pearls});}
        if(state.pearls>=cap)state.charge=0;
      }
      state.fireTimer-=dt;
      if(state.fireTimer>0||state.pearls<=0||!other||other.hp<=0)return;
      state.fireTimer=VALUES.spiritPearl.interval;state.pearls--;
      spawnProjectile(fighter,{damage:at(VALUES.spiritPearl.damage,rank),speed:430,radius:7,source:"spiritPearl",colorHint:"spirit"});
      emit("cast",{side:fighter.side,skill:"spiritPearl",x:fighter.x,y:fighter.y-88,pearls:state.pearls});
    }
  });

  registerDuelSkillBehavior("frostbite",{
    modifyOutgoingDamage:({value,rank,fighter,target})=>insideOwnFrost(fighter,target)?value*(1+at(VALUES.frostbite.bonus,rank)):value
  });

  registerDuelSkillBehavior("shatter",{
    onCreate:({fighter})=>{fighter.duelEffects.shatterHits=0;},
    onBasicHit:({fighter,other,rank,dealDamage,emit})=>{
      if(!insideOwnFrost(fighter,other)){fighter.duelEffects.shatterHits=0;return;}
      fighter.duelEffects.shatterHits=(fighter.duelEffects.shatterHits||0)+1;
      if(fighter.duelEffects.shatterHits<at(VALUES.shatter.hits,rank))return;
      fighter.duelEffects.shatterHits=0;
      dealDamage(fighter,other,at(VALUES.shatter.damage,rank),{source:"shatter",elemental:true,area:true,canCrit:false,dodgeable:false,reactive:false});
      emit("area",{side:fighter.side,skill:"shatter",x:other.x,y:other.y-34,radius:72});
    }
  });

  registerDuelSkillBehavior("conductiveVenom",{
    onCreate:({fighter})=>{fighter.duelEffects.conductiveTimer=VALUES.conductiveVenom.interval;},
    update:({round,fighter,other,dt,rank,dealDamage,emit})=>{
      fighter.duelEffects.conductiveTimer-=dt;
      if(fighter.duelEffects.conductiveTimer>0)return;
      fighter.duelEffects.conductiveTimer+=VALUES.conductiveVenom.interval;
      const poison=other?.duelEffects?.poison;
      if(!poison||poison.source!==fighter.side||poison.until<=round.time)return;
      if((round.matchRng||Math.random)()>=at(VALUES.conductiveVenom.chance,rank))return;
      dealDamage(fighter,other,at(VALUES.conductiveVenom.damage,rank),{source:"conductiveVenom",elemental:true,canCrit:false,dodgeable:false,reactive:false});
      emit("cast",{side:fighter.side,skill:"conductiveVenom",x:other.x,y:other.y-92});
    }
  });

  registerDuelSkillBehavior("combustion",{
    onCreate:({fighter,rank})=>{fighter.duelEffects.combustionTimer=at(VALUES.combustion.interval,rank);},
    update:({round,fighter,other,dt,rank,dealDamage,emit})=>{
      fighter.duelEffects.combustionTimer-=dt;
      if(fighter.duelEffects.combustionTimer>0)return;
      fighter.duelEffects.combustionTimer+=at(VALUES.combustion.interval,rank);
      if(!ownedBurnActive(round,fighter,other)||Math.abs(other.x-fighter.x)>VALUES.combustion.range)return;
      dealDamage(fighter,other,at(VALUES.combustion.damage,rank),{source:"combustion",elemental:true,area:true,canCrit:false,dodgeable:false,reactive:false});
      emit("area",{side:fighter.side,skill:"combustion",x:other.x,y:other.y-30,radius:82});
    }
  });

  registerDuelSkillBehavior("timeEcho",{
    onCreate:({fighter})=>{fighter.duelEffects.timeEchoPrev={...fighter.skillTimers};},
    update:({round,fighter,rank,emit})=>{
      const prev=fighter.duelEffects.timeEchoPrev||{};
      const rng=round.matchRng||Math.random;
      for(const key of ECHOABLE){
        const current=fighter.skillTimers[key];
        if(!Number.isFinite(current))continue;
        const before=prev[key];
        if(Number.isFinite(before)&&before<=0&&current>0&&rng()<at(VALUES.timeEcho.chance,rank)){
          fighter.skillTimers[key]=0;
          emit("status",{side:fighter.side,status:"timeEcho",skill:key,x:fighter.x,y:fighter.y-92});
        }
      }
      fighter.duelEffects.timeEchoPrev={...fighter.skillTimers};
    }
  });

  registerDuelSkillBehavior("greed",{
    modifyOutgoingDamage:({value,rank})=>value*(1+at(VALUES.greed.bonus,rank)),
    onRoundStart:({other,rank,emit})=>{
      if(!other)return;
      const factor=1+at(VALUES.greed.enemyHp,rank);
      other.maxHp*=factor;other.hp*=factor;other.stats.maxHp*=factor;
      emit("status",{side:other.side,status:"greedRisk",x:other.x,y:other.y-94,hp:other.maxHp});
    }
  });

  root.DUEL_D6E_VALUES=VALUES;
})();