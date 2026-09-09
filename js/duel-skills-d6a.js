(()=>{
  const root=typeof window!=="undefined"?window:globalThis;
  if(typeof DUEL_SKILLS==="undefined"||typeof DUEL_SKILL_KEYS==="undefined"||typeof registerDuelSkillBehavior!=="function")return;

  const additions={
    execution:{maxRank:3,tags:["KILL","DAMAGE","MARK"],rangeBias:.15,meleeBias:.65,desc:r=>`Khi đối thủ còn không quá ${[30,35,40][r-1]}% HP, mọi sát thương bạn gây tăng ${[18,30,45][r-1]}%.`},
    berserk:{maxRank:3,tags:["BLOOD","LOW_HP","ATTACK"],rangeBias:0,meleeBias:1.05,desc:r=>`Khi HP dưới 40%, tăng ${[10,18,28][r-1]}% mọi sát thương gây ra và giảm ${[8,14,22][r-1]}% hồi chiêu đòn đánh thường.`},
    glassCannon:{maxRank:3,tags:["RULE","DAMAGE","RISK"],rangeBias:.35,meleeBias:.45,desc:r=>`Tăng toàn bộ sát thương gây ra ×${[1.15,1.30,1.45][r-1].toFixed(2)}, nhưng HP tối đa chỉ còn ${[92,84,76][r-1]}% giá trị lẽ ra có.`},
    retaliate:{maxRank:3,tags:["DEFENSE","DAMAGE_TAKEN","EXPLOSION"],rangeBias:0,meleeBias:.55,defenseBias:.75,controlBias:.35,desc:r=>`Khi chịu sát thương và đối thủ trong 150px, Phản Chấn gây ${[10,16,24][r-1]} sát thương. Hồi chiêu ${[3.8,3.1,2.5][r-1].toFixed(1)} giây, bắt đầu sẵn sàng.`},
    thorns:{maxRank:3,tags:["DEFENSE","DAMAGE_TAKEN","BLOOD"],rangeBias:0,meleeBias:.65,defenseBias:1,desc:r=>`Mỗi đòn đánh thường cận chiến gây sát thương lên bạn phản lại ${[3,5,8][r-1]} sát thương. Phản sát thương không thể kích hoạt phản ứng khác.`},
    lastStand:{maxRank:3,tags:["LOW_HP","MOVEMENT","DEFENSE"],rangeBias:0,meleeBias:.35,defenseBias:.9,mobilityBias:.75,desc:r=>`Khi HP dưới 30%, giảm ${[8,14,20][r-1]}% sát thương nhận vào và tăng ${[10,18,28][r-1]}% tốc độ di chuyển.`},
    deathMark:{maxRank:3,tags:["MARK","KILL","PERIODIC"],rangeBias:.45,meleeBias:.35,controlBias:.75,desc:r=>`Mỗi ${[9,7.5,6][r-1].toFixed(1)} giây đánh dấu đối thủ trong 5 giây; trong thời gian đó sát thương của bạn lên mục tiêu tăng ${[12,20,30][r-1]}%. Lần đánh dấu đầu chờ đủ hồi chiêu.`},
    poison:{maxRank:3,tags:["POISON","ELEMENTAL","DOT","HIT"],rangeBias:0,meleeBias:.85,desc:r=>`Đòn đánh thường có ${[20,35,50][r-1]}% cơ hội gây Độc trong 4 giây, gây ${[1.5,3,5.5][r-1].toFixed(1)} sát thương/giây. Tái áp dụng làm mới thời gian, không cộng dồn.`}
  };

  for(const [key,adapter] of Object.entries(additions)){
    if(!DUEL_SKILLS[key])DUEL_SKILLS[key]=adapter;
    if(!DUEL_SKILL_KEYS.includes(key))DUEL_SKILL_KEYS.push(key);
  }

  const VALUES={
    execution:{threshold:[.30,.35,.40],bonus:[.18,.30,.45]},
    berserk:{threshold:.40,damage:[.10,.18,.28],attackReduction:[.08,.14,.22]},
    glassCannon:{damage:[1.15,1.30,1.45],hp:[.92,.84,.76]},
    retaliate:{cooldown:[3.8,3.1,2.5],damage:[10,16,24],range:150},
    thorns:{damage:[3,5,8]},
    lastStand:{threshold:.30,reduction:[.08,.14,.20],move:[.10,.18,.28]},
    deathMark:{cooldown:[9,7.5,6],duration:5,bonus:[.12,.20,.30]},
    poison:{chance:[.20,.35,.50],duration:4,dps:[1.5,3,5.5]}
  };
  const at=(table,rank)=>table[Math.max(0,Math.min(table.length-1,rank-1))];

  registerDuelSkillBehavior("execution",{
    modifyOutgoingDamage:({value,rank,target})=>{
      if(!target||target.maxHp<=0)return value;
      return target.hp/target.maxHp<=at(VALUES.execution.threshold,rank)?value*(1+at(VALUES.execution.bonus,rank)):value;
    }
  });

  registerDuelSkillBehavior("berserk",{
    modifyOutgoingDamage:({value,rank,fighter})=>fighter.hp/fighter.maxHp<VALUES.berserk.threshold?value*(1+at(VALUES.berserk.damage,rank)):value,
    modifyBasicAttackCooldown:({value,rank,fighter})=>fighter.hp/fighter.maxHp<VALUES.berserk.threshold?value*(1-at(VALUES.berserk.attackReduction,rank)):value
  });

  registerDuelSkillBehavior("glassCannon",{
    modifyStats:({stats,rank})=>{stats.maxHp*=at(VALUES.glassCannon.hp,rank);},
    modifyOutgoingDamage:({value,rank})=>value*at(VALUES.glassCannon.damage,rank)
  });

  registerDuelSkillBehavior("retaliate",{
    onCreate:({fighter,rank})=>{fighter.skillTimers.retaliate=0;fighter.duelEffects.retaliateRank=rank;},
    onDamageTaken:({fighter,other,rank,totalDamage,dealDamage,emit})=>{
      if(totalDamage<=0||!other||other.hp<=0||(fighter.skillTimers.retaliate??0)>0)return;
      if(Math.abs(other.x-fighter.x)>VALUES.retaliate.range)return;
      fighter.skillTimers.retaliate=at(VALUES.retaliate.cooldown,rank);
      dealDamage(fighter,other,at(VALUES.retaliate.damage,rank),{source:"retaliate",canCrit:false,dodgeable:false,reactive:false});
      emit("area",{side:fighter.side,skill:"retaliate",x:fighter.x,y:fighter.y-25,radius:VALUES.retaliate.range});
    }
  });

  registerDuelSkillBehavior("thorns",{
    onDamageTaken:({fighter,other,rank,totalDamage,meta,dealDamage})=>{
      if(totalDamage<=0||meta?.source!=="basic"||!other||other.hp<=0)return;
      dealDamage(fighter,other,at(VALUES.thorns.damage,rank),{source:"thorns",canCrit:false,dodgeable:false,reactive:false});
    }
  });

  registerDuelSkillBehavior("lastStand",{
    modifyIncomingDamage:({value,rank,fighter})=>fighter.hp/fighter.maxHp<VALUES.lastStand.threshold?value*(1-at(VALUES.lastStand.reduction,rank)):value,
    modifyMoveMultiplier:({value,rank,fighter})=>fighter.hp/fighter.maxHp<VALUES.lastStand.threshold?value*(1+at(VALUES.lastStand.move,rank)):value
  });

  registerDuelSkillBehavior("deathMark",{
    onCreate:({fighter,rank})=>{fighter.skillTimers.deathMark=at(VALUES.deathMark.cooldown,rank);},
    update:({round,fighter,other,rank,emit})=>{
      if((fighter.skillTimers.deathMark??0)>0||!other||other.hp<=0)return;
      fighter.skillTimers.deathMark=at(VALUES.deathMark.cooldown,rank);
      other.duelEffects.deathMark={source:fighter.side,until:round.time+VALUES.deathMark.duration,bonus:at(VALUES.deathMark.bonus,rank)};
      emit("status",{side:other.side,status:"deathMark",x:other.x,y:other.y-82,duration:VALUES.deathMark.duration});
    },
    modifyOutgoingDamage:({round,value,fighter,target})=>{
      const mark=target?.duelEffects?.deathMark;
      return mark&&mark.source===fighter.side&&mark.until>round.time?value*(1+mark.bonus):value;
    }
  });

  registerDuelSkillBehavior("poison",{
    onBasicHit:({round,fighter,other,rank,emit})=>{
      const rng=round.matchRng||Math.random;
      if(rng()>=at(VALUES.poison.chance,rank))return;
      other.duelEffects.poison={source:fighter.side,until:round.time+VALUES.poison.duration,dps:at(VALUES.poison.dps,rank),tick:.5};
      emit("status",{side:other.side,status:"poison",x:other.x,y:other.y-72,duration:VALUES.poison.duration});
    },
    update:({round,fighter,other,dt,dealDamage})=>{
      const poison=other?.duelEffects?.poison;
      if(!poison||poison.source!==fighter.side)return;
      if(poison.until<=round.time){delete other.duelEffects.poison;return;}
      poison.tick-=dt;
      while(poison.tick<=0&&other.hp>0){
        poison.tick+=.5;
        dealDamage(fighter,other,poison.dps*.5,{source:"poison",canCrit:false,dodgeable:false,reactive:false});
      }
    }
  });

  root.DUEL_D6A_VALUES=VALUES;
})();
