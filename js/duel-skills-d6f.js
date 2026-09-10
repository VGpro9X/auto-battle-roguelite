(()=>{
  const root=typeof window!=="undefined"?window:globalThis;
  if(typeof DUEL_SKILLS==="undefined"||typeof DUEL_SKILL_KEYS==="undefined"||typeof registerDuelSkillBehavior!=="function")return;

  const additions={
    multishot:{maxRank:3,tags:["PROJECTILE","ATTACK"],rangeBias:.8,meleeBias:.45,desc:r=>`Mỗi đòn đánh thường trúng tạo thêm ${[1,2,3][r-1]} linh tiễn. Mỗi linh tiễn là projectile riêng gây ${[36,32,30][r-1]}% sát thương cơ bản; linh tiễn không được tính là đòn đánh thường.`},
    pierce:{maxRank:3,tags:["PROJECTILE","PIERCE"],rangeBias:.9,meleeBias:.2,desc:r=>`Trong Duel chỉ có một đối thủ nên Xuyên Phá được chuyển thành xuyên giáp: mọi hit projectile của bạn bỏ qua ${[20,40,60][r-1]}% GIÁ TRỊ giáp hiện tại của mục tiêu. Không ảnh hưởng sát thương không phải projectile.`},
    ricochet:{maxRank:3,tags:["PROJECTILE","CHAIN"],rangeBias:.9,meleeBias:.2,desc:r=>`Trong 1v1, sau mỗi ${[4,3,2][r-1]} projectile của bạn gây sát thương, Nảy Đạn bắn thêm 1 đạn hồi kích gây ${[55,75,95][r-1]}% sát thương cơ bản. Đạn hồi kích là Chain và không tự tăng bộ đếm Nảy Đạn.`},
    explosive:{maxRank:3,tags:["PROJECTILE","EXPLOSION","HIT"],rangeBias:.75,meleeBias:.25,desc:r=>`Mỗi projectile gây sát thương có ${[20,35,50][r-1]}% cơ hội kích Đạn Nổ, gây thêm ${[10,18,28][r-1]} sát thương Area. Vụ nổ không tự kích hoạt Đạn Nổ lần nữa.`},
    areaMastery:{maxRank:3,tags:["AREA","EXPLOSION","SCALING"],rangeBias:.25,meleeBias:.6,desc:r=>`Tăng ${[10,20,32][r-1]}% sát thương của mọi hit được đánh dấu Area trong Duel. Bản Duel không tăng bán kính; card nói rõ để không có hệ số vùng ẩn.`},
    velocity:{maxRank:3,tags:["PROJECTILE","MOVEMENT"],rangeBias:1,meleeBias:.1,mobilityBias:.2,desc:r=>`Mọi projectile của bạn bay nhanh hơn ${[12,25,40][r-1]}% và tồn tại lâu hơn ${[6,12,18][r-1]}%. Đây là cách Duel chuyển bonus tốc đạn/tầm đánh của Lưu Quang; không tăng tầm cận chiến.`},
    chainMastery:{maxRank:3,tags:["CHAIN","LIGHTNING","PROJECTILE"],rangeBias:.7,meleeBias:.25,desc:r=>`Tăng ${[10,20,32][r-1]}% sát thương của hit được đánh dấu Chain, gồm Lôi Kích, Nảy Đạn, Độc Dẫn và Huyết Liên khi chúng dùng nhãn Chain. Không tự tạo thêm mục tiêu.`},
    bloodLink:{maxRank:3,tags:["BLOOD","CHAIN","PERIODIC","DAMAGE"],rangeBias:.2,meleeBias:.65,defenseBias:.35,desc:r=>`Mỗi ${[7,6,5][r-1]} giây mở Huyết Liên trong 4,5 giây. Khi bạn thực sự mất HP trong thời gian này, tạo một đòn Huyết Liên có sức mạnh bằng ${[18,26,36][r-1]}% lượng HP vừa mất lên đối thủ. Đòn phản kích vẫn chịu phòng thủ Duel thông thường và không tự lặp.`},
    guardianIdol:{maxRank:3,tags:["SUMMON","DEFENSE","CONTROL"],rangeBias:0,meleeBias:.25,defenseBias:1.15,summonBias:.55,desc:r=>`Mỗi ${[12,10,8][r-1]} giây triệu hồi Hộ Pháp Mộc Nhân trong 5 giây với ${[24,40,60][r-1]} HP. Hộ Pháp hấp thụ sát thương còn lại sau giáp trước khi sát thương chạm khiên/HP của bạn. Hộ Pháp đầu tiên phải chờ đủ hồi chiêu và không tấn công.`},
    soulLantern:{maxRank:3,tags:["SOUL","SUMMON","CHARGE","AREA"],rangeBias:.45,meleeBias:.35,summonBias:.8,desc:r=>`Duel không có kinh tế nhiều mạng nên Hồn Đăng đổi sang tích sát thương: mỗi ${[100,80,60][r-1]} sát thương thực sự bạn gây nạp 1 hồn hỏa, tối đa 3 hồn đang chờ. Sau 0,6 giây hồn hỏa nổ lên đối thủ gây ${[24,36,50][r-1]} sát thương Summon + Area. Sát thương dư được giữ lại.`}
  };

  for(const [key,adapter] of Object.entries(additions)){
    if(!DUEL_SKILLS[key])DUEL_SKILLS[key]=adapter;
    if(!DUEL_SKILL_KEYS.includes(key))DUEL_SKILL_KEYS.push(key);
  }

  const VALUES={
    multishot:{count:[1,2,3],ratio:[.36,.32,.30],speed:455},
    pierce:{armorIgnore:[.20,.40,.60]},
    ricochet:{hits:[4,3,2],ratio:[.55,.75,.95],speed:470},
    explosive:{chance:[.20,.35,.50],damage:[10,18,28]},
    areaMastery:{bonus:[.10,.20,.32]},
    velocity:{speed:[1.12,1.25,1.40],life:[1.06,1.12,1.18]},
    chainMastery:{bonus:[.10,.20,.32]},
    bloodLink:{cooldown:[7,6,5],duration:4.5,ratio:[.18,.26,.36]},
    guardianIdol:{cooldown:[12,10,8],duration:5,hp:[24,40,60]},
    soulLantern:{threshold:[100,80,60],damage:[24,36,50],delay:.6,cap:3}
  };
  const at=(table,rank)=>table[Math.max(0,Math.min(table.length-1,rank-1))];

  registerDuelSkillBehavior("multishot",{
    onBasicHit:({fighter,rank,spawnProjectile,emit})=>{
      const count=at(VALUES.multishot.count,rank),damage=fighter.stats.baseDamage*at(VALUES.multishot.ratio,rank);
      for(let i=0;i<count;i++)spawnProjectile(fighter,{damage,speed:VALUES.multishot.speed+i*7,radius:5,source:"multishot",colorHint:"arrow",meta:{projectile:true}});
      emit("cast",{side:fighter.side,skill:"multishot",x:fighter.x+fighter.facing*36,y:fighter.y-76,count});
    }
  });

  registerDuelSkillBehavior("pierce",{
    modifyTargetArmor:({value,rank,meta})=>meta?.projectile===true?value*(1-at(VALUES.pierce.armorIgnore,rank)):value
  });

  registerDuelSkillBehavior("ricochet",{
    onCreate:({fighter})=>{fighter.duelEffects.ricochetHits=0;},
    onDamageDealt:({fighter,rank,meta,totalDamage,spawnProjectile,emit})=>{
      if(totalDamage<=0||meta?.projectile!==true||meta?.source==="ricochet")return;
      fighter.duelEffects.ricochetHits=(fighter.duelEffects.ricochetHits||0)+1;
      const need=at(VALUES.ricochet.hits,rank);
      while(fighter.duelEffects.ricochetHits>=need){
        fighter.duelEffects.ricochetHits-=need;
        spawnProjectile(fighter,{damage:fighter.stats.baseDamage*at(VALUES.ricochet.ratio,rank),speed:VALUES.ricochet.speed,radius:5,source:"ricochet",colorHint:"chain",meta:{chain:true,projectile:true}});
        emit("cast",{side:fighter.side,skill:"ricochet",x:fighter.x+fighter.facing*36,y:fighter.y-74});
      }
    }
  });

  registerDuelSkillBehavior("explosive",{
    onDamageDealt:({round,fighter,other,rank,meta,totalDamage,dealDamage,emit})=>{
      if(totalDamage<=0||meta?.projectile!==true||meta?.source==="explosive"||!other||other.hp<=0)return;
      if((round.matchRng||Math.random)()>=at(VALUES.explosive.chance,rank))return;
      dealDamage(fighter,other,at(VALUES.explosive.damage,rank),{source:"explosive",area:true,canCrit:false,dodgeable:false,reactive:false});
      emit("area",{side:fighter.side,skill:"explosive",x:other.x,y:other.y-38,radius:70});
    }
  });

  registerDuelSkillBehavior("areaMastery",{
    modifyOutgoingDamage:({value,rank,meta})=>meta?.area===true?value*(1+at(VALUES.areaMastery.bonus,rank)):value
  });

  registerDuelSkillBehavior("velocity",{
    modifyProjectile:({projectile,rank})=>{
      projectile.vx*=at(VALUES.velocity.speed,rank);
      projectile.life*=at(VALUES.velocity.life,rank);
    }
  });

  registerDuelSkillBehavior("chainMastery",{
    modifyOutgoingDamage:({value,rank,meta})=>meta?.chain===true?value*(1+at(VALUES.chainMastery.bonus,rank)):value
  });

  registerDuelSkillBehavior("bloodLink",{
    onCreate:({fighter,rank})=>{fighter.skillTimers.bloodLink=at(VALUES.bloodLink.cooldown,rank);fighter.duelEffects.bloodLinkUntil=0;},
    update:({round,fighter,rank,emit})=>{
      if((fighter.skillTimers.bloodLink??0)>0)return;
      fighter.skillTimers.bloodLink=at(VALUES.bloodLink.cooldown,rank);
      fighter.duelEffects.bloodLinkUntil=round.time+VALUES.bloodLink.duration;
      emit("status",{side:fighter.side,status:"bloodLink",x:fighter.x,y:fighter.y-82,duration:VALUES.bloodLink.duration});
    },
    onDamageTaken:({round,fighter,other,rank,hpDamage,dealDamage,emit})=>{
      if(hpDamage<=0||!other||other.hp<=0||(fighter.duelEffects.bloodLinkUntil||0)<=round.time)return;
      const power=hpDamage*at(VALUES.bloodLink.ratio,rank);
      dealDamage(fighter,other,power,{source:"bloodLink",chain:true,canCrit:false,dodgeable:false,reactive:false});
      emit("cast",{side:fighter.side,skill:"bloodLink",x:other.x,y:other.y-74,amount:power});
    }
  });

  registerDuelSkillBehavior("guardianIdol",{
    onCreate:({fighter,rank})=>{fighter.skillTimers.guardianIdol=at(VALUES.guardianIdol.cooldown,rank);fighter.duelEffects.guardianIdol=null;},
    update:({round,fighter,rank,emit})=>{
      const guardian=fighter.duelEffects.guardianIdol;
      if(guardian&&guardian.until<=round.time)fighter.duelEffects.guardianIdol=null;
      if((fighter.skillTimers.guardianIdol??0)>0)return;
      const hp=at(VALUES.guardianIdol.hp,rank);
      fighter.skillTimers.guardianIdol=at(VALUES.guardianIdol.cooldown,rank);
      fighter.duelEffects.guardianIdol={hp,maxHp:hp,until:round.time+VALUES.guardianIdol.duration};
      emit("status",{side:fighter.side,status:"guardianIdol",x:fighter.x,y:fighter.y-50,duration:VALUES.guardianIdol.duration,hp});
    },
    modifyIncomingDamage:({value,fighter,emit})=>{
      const guardian=fighter.duelEffects.guardianIdol;
      if(!guardian||guardian.hp<=0)return value;
      const absorbed=Math.min(value,guardian.hp);
      guardian.hp-=absorbed;
      emit("shield_gain",{side:fighter.side,amount:0,source:"guardianBlock",absorbed,x:fighter.x,y:fighter.y-58});
      if(guardian.hp<=0){fighter.duelEffects.guardianIdol=null;emit("status",{side:fighter.side,status:"guardianBreak",x:fighter.x,y:fighter.y-52});}
      return value-absorbed;
    }
  });

  registerDuelSkillBehavior("soulLantern",{
    onCreate:({fighter})=>{fighter.duelEffects.soulLantern={charge:0,flames:[]};},
    onDamageDealt:({round,fighter,rank,meta,totalDamage,emit})=>{
      if(totalDamage<=0||meta?.source==="soulLantern")return;
      const state=fighter.duelEffects.soulLantern;
      state.charge+=totalDamage;
      const threshold=at(VALUES.soulLantern.threshold,rank);
      while(state.charge>=threshold&&state.flames.length<VALUES.soulLantern.cap){
        state.charge-=threshold;state.flames.push({impactAt:round.time+VALUES.soulLantern.delay});
        emit("status",{side:fighter.side,status:"soulLanternCharge",x:fighter.x,y:fighter.y-92,count:state.flames.length});
      }
    },
    update:({round,fighter,other,rank,dealDamage,emit})=>{
      const state=fighter.duelEffects.soulLantern,threshold=at(VALUES.soulLantern.threshold,rank);
      const pending=[];
      for(const flame of state.flames){
        if(flame.impactAt>round.time){pending.push(flame);continue;}
        if(other&&other.hp>0){
          dealDamage(fighter,other,at(VALUES.soulLantern.damage,rank),{source:"soulLantern",summon:true,area:true,canCrit:false,dodgeable:false,reactive:false});
          emit("area",{side:fighter.side,skill:"soulLantern",x:other.x,y:other.y-42,radius:76});
        }
      }
      state.flames=pending;
      while(state.charge>=threshold&&state.flames.length<VALUES.soulLantern.cap){state.charge-=threshold;state.flames.push({impactAt:round.time+VALUES.soulLantern.delay});}
    }
  });

  root.DUEL_D6F_VALUES=VALUES;
})();