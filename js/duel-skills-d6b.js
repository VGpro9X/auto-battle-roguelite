(()=>{
  const root=typeof window!=="undefined"?window:globalThis;
  if(typeof DUEL_SKILLS==="undefined"||typeof DUEL_SKILL_KEYS==="undefined"||typeof registerDuelSkillBehavior!=="function")return;

  const additions={
    echoShot:{maxRank:3,tags:["ATTACK","TIME","PROJECTILE"],rangeBias:.25,meleeBias:.8,desc:r=>`Mỗi ${[5,4,3][r-1]} đòn đánh thường trúng mục tiêu, bắn một Ảnh Xạ gây ${[55,75,95][r-1]}% sát thương cơ bản. Ảnh Xạ không kích hoạt hiệu ứng đòn đánh thường.`},
    pointBlank:{maxRank:3,tags:["ATTACK","DAMAGE","RISK"],rangeBias:0,meleeBias:1.05,desc:r=>`Mọi sát thương gây thêm tối đa ${[12,24,36][r-1]}% khi cách đối thủ không quá 80px; bonus giảm tuyến tính về 0 ở 180px.`},
    elementalMastery:{maxRank:3,tags:["ELEMENTAL","FIRE","ICE","LIGHTNING","POISON"],rangeBias:.45,meleeBias:.35,desc:r=>`Tăng ${[8,16,26][r-1]}% sát thương nguyên tố trong Đấu Trường, gồm Hỏa, Sét, Độc và các kỹ năng được đánh dấu nguyên tố như Tinh Vẫn hoặc Lôi Trường.`},
    shieldPulse:{maxRank:3,tags:["SHIELD","EXPLOSION","DAMAGE_TAKEN"],rangeBias:0,meleeBias:.65,defenseBias:.8,desc:r=>`Khi một đòn phá hết khiên hiện có, Thuẫn Bạo gây ${[16,28,42][r-1]} sát thương trong bán kính ${[130,150,170][r-1]}px. Không có hồi chiêu ẩn.`},
    sacrifice:{maxRank:3,tags:["BLOOD","RISK","PERIODIC","EXPLOSION"],rangeBias:0,meleeBias:.85,desc:r=>`Mỗi ${[7.5,6.2,5.0][r-1].toFixed(1)} giây, nếu đối thủ trong ${[155,180,205][r-1]}px và bạn còn đủ HP, mất ${[4,5,6][r-1]}% HP tối đa để gây ${[26,42,62][r-1]} sát thương. Ngoài tầm sẽ thử lại sau 0,5 giây.`},
    blackHole:{maxRank:3,tags:["CONTROL","AREA","PERIODIC"],rangeBias:.35,meleeBias:.45,controlBias:1.2,desc:r=>`Mỗi ${[6,5,4][r-1].toFixed(1)} giây, nếu đối thủ trong ${[260,300,340][r-1]}px, gây ${[8,14,22][r-1]} sát thương và kéo họ ${[70,95,125][r-1]}px về phía bạn. Ngoài tầm sẽ thử lại sau 0,5 giây.`},
    luckyStar:{maxRank:3,tags:["RANDOM","PERIODIC","HEAL","SHIELD"],rangeBias:.2,meleeBias:.25,defenseBias:.55,desc:r=>`Mỗi ${[7,5.8,4.6][r-1].toFixed(1)} giây nhận ngẫu nhiên: hồi ${[8,12,18][r-1]} HP, nhận ${[10,16,24][r-1]} khiên, hoặc sao rơi gây ${[14,24,36][r-1]} sát thương.`},
    secondWind:{maxRank:3,tags:["DEFENSE","LOW_HP","RULE"],rangeBias:0,meleeBias:.2,defenseBias:1.25,desc:r=>`Một lần mỗi round, sát thương chí tử hồi sinh bạn với ${[20,35,50][r-1]}% HP tối đa. Lượt hồi sinh được làm mới ở round kế tiếp.`}
  };

  for(const [key,adapter] of Object.entries(additions)){
    if(!DUEL_SKILLS[key])DUEL_SKILLS[key]=adapter;
    if(!DUEL_SKILL_KEYS.includes(key))DUEL_SKILL_KEYS.push(key);
  }

  const VALUES={
    echoShot:{hits:[5,4,3],damage:[.55,.75,.95]},
    pointBlank:{near:80,far:180,bonus:[.12,.24,.36]},
    elementalMastery:{bonus:[.08,.16,.26]},
    shieldPulse:{damage:[16,28,42],radius:[130,150,170]},
    sacrifice:{cooldown:[7.5,6.2,5.0],cost:[.04,.05,.06],radius:[155,180,205],damage:[26,42,62],retry:.5},
    blackHole:{cooldown:[6,5,4],range:[260,300,340],damage:[8,14,22],pull:[70,95,125],retry:.5},
    luckyStar:{cooldown:[7,5.8,4.6],heal:[8,12,18],shield:[10,16,24],damage:[14,24,36]},
    secondWind:{hp:[.20,.35,.50]}
  };
  const at=(table,rank)=>table[Math.max(0,Math.min(table.length-1,rank-1))];
  const ELEMENTAL_SOURCES=new Set(["fire","lightning","burn","poison"]);

  registerDuelSkillBehavior("echoShot",{
    onCreate:({fighter})=>{fighter.duelEffects.echoShotHits=0;},
    onBasicHit:({fighter,rank,spawnProjectile,emit})=>{
      fighter.duelEffects.echoShotHits=(fighter.duelEffects.echoShotHits||0)+1;
      const need=at(VALUES.echoShot.hits,rank);
      if(fighter.duelEffects.echoShotHits<need)return;
      fighter.duelEffects.echoShotHits=0;
      spawnProjectile(fighter,{damage:fighter.stats.baseDamage*at(VALUES.echoShot.damage,rank),speed:440,radius:6,source:"echoShot",colorHint:"echo"});
      emit("cast",{side:fighter.side,skill:"echoShot",x:fighter.x+fighter.facing*36,y:fighter.y-78});
    }
  });

  registerDuelSkillBehavior("pointBlank",{
    modifyOutgoingDamage:({value,rank,fighter,target})=>{
      if(!target)return value;
      const distance=Math.abs(target.x-fighter.x);
      if(distance>=VALUES.pointBlank.far)return value;
      const ratio=distance<=VALUES.pointBlank.near?1:1-(distance-VALUES.pointBlank.near)/(VALUES.pointBlank.far-VALUES.pointBlank.near);
      return value*(1+at(VALUES.pointBlank.bonus,rank)*ratio);
    }
  });

  registerDuelSkillBehavior("elementalMastery",{
    modifyOutgoingDamage:({value,rank,meta})=>(meta?.elemental===true||ELEMENTAL_SOURCES.has(meta?.source))?value*(1+at(VALUES.elementalMastery.bonus,rank)):value
  });

  registerDuelSkillBehavior("shieldPulse",{
    onDamageTaken:({fighter,other,rank,shieldDamage,dealDamage,emit})=>{
      if(shieldDamage<=0||fighter.shield>0||!other||other.hp<=0)return;
      const radius=at(VALUES.shieldPulse.radius,rank);
      emit("area",{side:fighter.side,skill:"shieldPulse",x:fighter.x,y:fighter.y-28,radius});
      if(Math.abs(other.x-fighter.x)<=radius){
        dealDamage(fighter,other,at(VALUES.shieldPulse.damage,rank),{source:"shieldPulse",canCrit:false,dodgeable:false,reactive:false});
      }
    }
  });

  registerDuelSkillBehavior("sacrifice",{
    onCreate:({fighter,rank})=>{fighter.skillTimers.sacrifice=at(VALUES.sacrifice.cooldown,rank);},
    update:({fighter,other,rank,dealDamage,emit})=>{
      if((fighter.skillTimers.sacrifice??0)>0||!other||other.hp<=0)return;
      const radius=at(VALUES.sacrifice.radius,rank);
      const cost=fighter.maxHp*at(VALUES.sacrifice.cost,rank);
      if(Math.abs(other.x-fighter.x)>radius||fighter.hp<=cost+1){fighter.skillTimers.sacrifice=VALUES.sacrifice.retry;return;}
      fighter.skillTimers.sacrifice=at(VALUES.sacrifice.cooldown,rank);
      fighter.hp=Math.max(1,fighter.hp-cost);
      fighter.damageTaken+=cost;
      emit("status",{side:fighter.side,status:"sacrifice",x:fighter.x,y:fighter.y-65,amount:cost});
      emit("area",{side:fighter.side,skill:"sacrifice",x:fighter.x,y:fighter.y-25,radius});
      dealDamage(fighter,other,at(VALUES.sacrifice.damage,rank),{source:"sacrifice",canCrit:false,dodgeable:false,reactive:false});
    }
  });

  registerDuelSkillBehavior("blackHole",{
    onCreate:({fighter,rank})=>{fighter.skillTimers.blackHole=at(VALUES.blackHole.cooldown,rank);},
    update:({fighter,other,rank,dealDamage,knockback,emit})=>{
      if((fighter.skillTimers.blackHole??0)>0||!other||other.hp<=0)return;
      const range=at(VALUES.blackHole.range,rank);
      if(Math.abs(other.x-fighter.x)>range){fighter.skillTimers.blackHole=VALUES.blackHole.retry;return;}
      fighter.skillTimers.blackHole=at(VALUES.blackHole.cooldown,rank);
      dealDamage(fighter,other,at(VALUES.blackHole.damage,rank),{source:"blackHole",canCrit:false,dodgeable:false,reactive:false});
      knockback(other,at(VALUES.blackHole.pull,rank),-fighter.facing);
      emit("area",{side:fighter.side,skill:"blackHole",x:fighter.x,y:fighter.y-35,radius:range});
    }
  });

  registerDuelSkillBehavior("luckyStar",{
    onCreate:({fighter,rank})=>{fighter.skillTimers.luckyStar=at(VALUES.luckyStar.cooldown,rank);},
    update:({round,fighter,other,rank,heal,addShield,dealDamage,emit})=>{
      if((fighter.skillTimers.luckyStar??0)>0)return;
      fighter.skillTimers.luckyStar=at(VALUES.luckyStar.cooldown,rank);
      const roll=(round.matchRng||Math.random)();
      if(roll<1/3){heal(fighter,at(VALUES.luckyStar.heal,rank),"luckyStar");emit("status",{side:fighter.side,status:"luckyHeal",x:fighter.x,y:fighter.y-82});return;}
      if(roll<2/3){addShield(fighter,at(VALUES.luckyStar.shield,rank),"luckyStar");emit("status",{side:fighter.side,status:"luckyShield",x:fighter.x,y:fighter.y-82});return;}
      if(other&&other.hp>0){dealDamage(fighter,other,at(VALUES.luckyStar.damage,rank),{source:"luckyStar",canCrit:false,dodgeable:false,reactive:false});emit("cast",{side:fighter.side,skill:"luckyStar",x:other.x,y:other.y-110});}
    }
  });

  registerDuelSkillBehavior("secondWind",{
    onCreate:({fighter})=>{fighter.duelEffects.secondWindCharges=1;},
    onFatalDamage:({round,fighter,rank,emit})=>{
      if((fighter.duelEffects.secondWindCharges||0)<=0)return;
      fighter.duelEffects.secondWindCharges--;
      fighter.hp=Math.max(1,fighter.maxHp*at(VALUES.secondWind.hp,rank));
      fighter.action="recover";fighter.actionUntil=round.time+.45;
      emit("revive",{side:fighter.side,skill:"secondWind",x:fighter.x,y:fighter.y-70,hp:fighter.hp});
    }
  });

  root.DUEL_D6B_VALUES=VALUES;
})();