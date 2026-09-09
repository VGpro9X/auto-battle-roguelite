(()=>{
  const root=typeof window!=="undefined"?window:globalThis;
  if(typeof DUEL_SKILLS==="undefined"||typeof DUEL_SKILL_KEYS==="undefined"||typeof registerDuelSkillBehavior!=="function")return;

  const additions={
    afterimage:{maxRank:3,tags:["TIME","SUMMON","ATTACK","PROJECTILE"],rangeBias:.7,meleeBias:.35,summonBias:.8,desc:r=>`Mỗi ${[6,4.8,3.6][r-1].toFixed(1)} giây tạo một Dư Ảnh trong 1,8 giây. Dư Ảnh bắn 2 phát cách nhau 0,35 giây; mỗi phát gây ${[45,65,85][r-1]}% sát thương cơ bản và không kích hoạt hiệu ứng đòn đánh thường.`},
    runeMine:{maxRank:3,tags:["AREA","EXPLOSION","PERIODIC","CONTROL"],rangeBias:.2,meleeBias:.65,controlBias:1,desc:r=>`Mỗi ${[4.8,3.8,2.9][r-1].toFixed(1)} giây đặt một Địa Lôi tại vị trí hiện tại. Sau 0,45 giây, đối thủ vào bán kính ${[55,65,75][r-1]}px làm mìn nổ gây ${[28,48,68][r-1]} sát thương và đẩy lùi ${[40,50,60][r-1]}px. Tối đa ${[2,3,4][r-1]} mìn, tồn tại 5 giây.`},
    meteorSeal:{maxRank:3,tags:["FIRE","AREA","EXPLOSION","PERIODIC"],rangeBias:.8,meleeBias:.15,desc:r=>`Mỗi ${[6,4.9,3.8][r-1].toFixed(1)} giây đánh dấu vị trí hiện tại của đối thủ. Sau 0,8 giây, Tinh Vẫn rơi xuống bán kính ${[58,74,90][r-1]}px, gây ${[30,54,78][r-1]} sát thương và thiêu đốt trong 2 giây với ${[4,6,8][r-1]} sát thương/giây.`},
    focusMind:{maxRank:3,tags:["TIME","CRITICAL","RULE"],rangeBias:.25,meleeBias:.55,desc:r=>`Nếu không nhận sát thương trong 4 giây, vào Tĩnh Tâm: +${[8,14,20][r-1]} điểm % bạo kích và +${[18,34,50][r-1]}% sát thương chí mạng. Nhận sát thương lập tức phá Tĩnh Tâm; tránh sát thương thêm 4 giây sẽ kích hoạt lại.`},
    sevenStarStrike:{maxRank:3,tags:["ATTACK","HIT","AREA","CHARGE"],rangeBias:.1,meleeBias:.95,desc:r=>`Cứ mỗi ${[7,5,3][r-1]} đòn đánh thường trúng, gọi Thất Tinh Kích lên đối thủ gây ${[18,34,50][r-1]} sát thương. Tinh kích không được tính là đòn đánh thường và không tự tăng bộ đếm.`},
    staticField:{maxRank:3,tags:["LIGHTNING","AREA","PERIODIC"],rangeBias:.3,meleeBias:.65,controlBias:.45,desc:r=>`Mỗi ${[8,6.6,5.2][r-1].toFixed(1)} giây tạo Lôi Trường tại vị trí hiện tại trong 3 giây, bán kính ${[72,88,104][r-1]}px. Lôi Trường phát đúng 6 nhịp, mỗi 0,5 giây gây ${[5,11,17][r-1]} sát thương nếu đối thủ đang đứng trong vùng.`},
    armorBreak:{maxRank:3,tags:["ATTACK","HIT","MARK","DAMAGE"],rangeBias:0,meleeBias:1,desc:r=>`Đòn đánh thường đặt 1 tầng Phá Giáp trong 4 giây. Mỗi tầng khiến mục tiêu nhận thêm ${[2,3,4][r-1]}% sát thương từ bạn, tối đa ${[4,6,8][r-1]} tầng. Đánh trúng lại thêm tầng và làm mới toàn bộ thời gian.`},
    vampiricTouch:{maxRank:3,tags:["BLOOD","HEAL","HIT"],rangeBias:0,meleeBias:.9,defenseBias:.35,desc:r=>`Đòn đánh thường có ${[10,18,28][r-1]}% cơ hội hồi ${[2,4,7][r-1]} HP. Hồi phục vẫn bị giảm bởi HUYẾT CHIẾN và bị vô hiệu trong TỬ CHIẾN.`}
  };

  for(const [key,adapter] of Object.entries(additions)){
    if(!DUEL_SKILLS[key])DUEL_SKILLS[key]=adapter;
    if(!DUEL_SKILL_KEYS.includes(key))DUEL_SKILL_KEYS.push(key);
  }

  const VALUES={
    afterimage:{cooldown:[6,4.8,3.6],ratio:[.45,.65,.85]},
    runeMine:{cooldown:[4.8,3.8,2.9],trigger:[55,65,75],damage:[28,48,68],push:[40,50,60],cap:[2,3,4]},
    meteorSeal:{cooldown:[6,4.9,3.8],radius:[58,74,90],damage:[30,54,78],burnDps:[4,6,8]},
    focusMind:{chance:[.08,.14,.20],critDamage:[.18,.34,.50],delay:4},
    sevenStarStrike:{hits:[7,5,3],damage:[18,34,50]},
    staticField:{cooldown:[8,6.6,5.2],radius:[72,88,104],damage:[5,11,17]},
    armorBreak:{perStack:[.02,.03,.04],max:[4,6,8],duration:4},
    vampiricTouch:{chance:[.10,.18,.28],heal:[2,4,7]}
  };
  const at=(table,rank)=>table[Math.max(0,Math.min(table.length-1,rank-1))];

  registerDuelSkillBehavior("afterimage",{
    onCreate:({fighter,rank})=>{fighter.skillTimers.afterimage=at(VALUES.afterimage.cooldown,rank);fighter.duelEffects.afterimages=[];},
    update:({round,fighter,other,rank,spawnProjectile,emit})=>{
      const clones=fighter.duelEffects.afterimages||[];
      if((fighter.skillTimers.afterimage??0)<=0){
        fighter.skillTimers.afterimage=at(VALUES.afterimage.cooldown,rank);
        clones.push({until:round.time+1.8,shots:[round.time+.12,round.time+.47],fired:0,x:fighter.x});
        emit("status",{side:fighter.side,status:"afterimage",x:fighter.x,y:fighter.y-70,duration:1.8});
      }
      for(const clone of clones){
        while(clone.fired<2&&round.time>=clone.shots[clone.fired]&&round.time<clone.until&&other?.hp>0){
          const cloneOwner={side:fighter.side,facing:fighter.facing,x:clone.x,y:fighter.y};
          spawnProjectile(cloneOwner,{damage:fighter.stats.baseDamage*at(VALUES.afterimage.ratio,rank),speed:410,radius:5,source:"afterimage",colorHint:"echo"});
          clone.fired++;
        }
      }
      fighter.duelEffects.afterimages=clones.filter(clone=>round.time<clone.until&&clone.fired<2);
    }
  });

  registerDuelSkillBehavior("runeMine",{
    onCreate:({fighter,rank})=>{fighter.skillTimers.runeMine=at(VALUES.runeMine.cooldown,rank);fighter.duelEffects.runeMines=[];},
    update:({round,fighter,other,rank,dealDamage,knockback,emit})=>{
      let mines=fighter.duelEffects.runeMines||[];
      if((fighter.skillTimers.runeMine??0)<=0){
        fighter.skillTimers.runeMine=at(VALUES.runeMine.cooldown,rank);
        const cap=at(VALUES.runeMine.cap,rank);
        while(mines.length>=cap)mines.shift();
        mines.push({x:fighter.x,armedAt:round.time+.45,until:round.time+5});
        emit("status",{side:fighter.side,status:"runeMine",x:fighter.x,y:fighter.y,duration:5});
      }
      const kept=[];
      for(const mine of mines){
        if(round.time>=mine.until)continue;
        if(round.time>=mine.armedAt&&other?.hp>0&&Math.abs(other.x-mine.x)<=at(VALUES.runeMine.trigger,rank)){
          dealDamage(fighter,other,at(VALUES.runeMine.damage,rank),{source:"runeMine",canCrit:false,dodgeable:false,reactive:false});
          const direction=other.x>=mine.x?1:-1;
          knockback(other,at(VALUES.runeMine.push,rank),direction);
          emit("area",{side:fighter.side,skill:"runeMine",x:mine.x,y:fighter.y-12,radius:at(VALUES.runeMine.trigger,rank)});
          continue;
        }
        kept.push(mine);
      }
      fighter.duelEffects.runeMines=kept;
    }
  });

  registerDuelSkillBehavior("meteorSeal",{
    onCreate:({fighter,rank})=>{fighter.skillTimers.meteorSeal=at(VALUES.meteorSeal.cooldown,rank);fighter.duelEffects.meteors=[];},
    update:({round,fighter,other,dt,rank,dealDamage,emit})=>{
      let meteors=fighter.duelEffects.meteors||[];
      if((fighter.skillTimers.meteorSeal??0)<=0&&other?.hp>0){
        fighter.skillTimers.meteorSeal=at(VALUES.meteorSeal.cooldown,rank);
        meteors.push({x:other.x,impactAt:round.time+.8});
        emit("status",{side:other.side,status:"meteorMark",x:other.x,y:other.y,duration:.8});
      }
      const kept=[];
      for(const meteor of meteors){
        if(round.time<meteor.impactAt){kept.push(meteor);continue;}
        const radius=at(VALUES.meteorSeal.radius,rank);
        emit("area",{side:fighter.side,skill:"meteorSeal",x:meteor.x,y:fighter.y-18,radius});
        if(other?.hp>0&&Math.abs(other.x-meteor.x)<=radius){
          dealDamage(fighter,other,at(VALUES.meteorSeal.damage,rank),{source:"meteorSeal",elemental:true,canCrit:false,dodgeable:false,reactive:false});
          other.duelEffects.meteorBurn={source:fighter.side,until:round.time+2,dps:at(VALUES.meteorSeal.burnDps,rank),tick:.5};
        }
      }
      fighter.duelEffects.meteors=kept;
      const burn=other?.duelEffects?.meteorBurn;
      if(burn&&burn.source===fighter.side){
        if(burn.until<=round.time)delete other.duelEffects.meteorBurn;
        else{
          burn.tick-=dt;
          while(burn.tick<=0&&other.hp>0){burn.tick+=.5;dealDamage(fighter,other,burn.dps*.5,{source:"meteorBurn",elemental:true,canCrit:false,dodgeable:false,reactive:false});}
        }
      }
    }
  });

  registerDuelSkillBehavior("focusMind",{
    onCreate:({fighter})=>{fighter.duelEffects.focusMind={lastDamageAt:0,active:false};},
    update:({round,fighter,rank,emit})=>{
      const focus=fighter.duelEffects.focusMind;
      if(!focus.active&&round.time-focus.lastDamageAt>=VALUES.focusMind.delay){
        focus.active=true;focus.chance=at(VALUES.focusMind.chance,rank);focus.damage=at(VALUES.focusMind.critDamage,rank);
        fighter.stats.critChance=Math.min(.75,fighter.stats.critChance+focus.chance);
        fighter.stats.critMultiplier+=focus.damage;
        emit("status",{side:fighter.side,status:"focusMind",x:fighter.x,y:fighter.y-92});
      }
    },
    onDamageTaken:({round,fighter})=>{
      const focus=fighter.duelEffects.focusMind;if(!focus)return;
      focus.lastDamageAt=round.time;
      if(focus.active){fighter.stats.critChance=Math.max(0,fighter.stats.critChance-(focus.chance||0));fighter.stats.critMultiplier=Math.max(1,fighter.stats.critMultiplier-(focus.damage||0));focus.active=false;}
    }
  });

  registerDuelSkillBehavior("sevenStarStrike",{
    onCreate:({fighter})=>{fighter.duelEffects.sevenStarHits=0;},
    onBasicHit:({fighter,other,rank,dealDamage,emit})=>{
      fighter.duelEffects.sevenStarHits=(fighter.duelEffects.sevenStarHits||0)+1;
      if(fighter.duelEffects.sevenStarHits<at(VALUES.sevenStarStrike.hits,rank))return;
      fighter.duelEffects.sevenStarHits=0;
      dealDamage(fighter,other,at(VALUES.sevenStarStrike.damage,rank),{source:"sevenStarStrike",canCrit:false,dodgeable:false,reactive:false});
      emit("area",{side:fighter.side,skill:"sevenStarStrike",x:other.x,y:other.y-35,radius:60});
    }
  });

  registerDuelSkillBehavior("staticField",{
    onCreate:({fighter,rank})=>{fighter.skillTimers.staticField=at(VALUES.staticField.cooldown,rank);fighter.duelEffects.staticFields=[];},
    update:({round,fighter,other,rank,dealDamage,emit})=>{
      let fields=fighter.duelEffects.staticFields||[];
      if((fighter.skillTimers.staticField??0)<=0){
        fighter.skillTimers.staticField=at(VALUES.staticField.cooldown,rank);
        fields.push({x:fighter.x,nextTick:round.time+.5,until:round.time+3,pulses:0});
        emit("status",{side:fighter.side,status:"staticField",x:fighter.x,y:fighter.y,duration:3});
      }
      const kept=[];
      for(const field of fields){
        while(field.pulses<6&&round.time>=field.nextTick){
          const radius=at(VALUES.staticField.radius,rank);
          if(other?.hp>0&&Math.abs(other.x-field.x)<=radius)dealDamage(fighter,other,at(VALUES.staticField.damage,rank),{source:"staticField",elemental:true,canCrit:false,dodgeable:false,reactive:false});
          emit("area",{side:fighter.side,skill:"staticField",x:field.x,y:fighter.y-16,radius});
          field.nextTick+=.5;field.pulses++;
        }
        if(field.pulses<6&&round.time<field.until+.51)kept.push(field);
      }
      fighter.duelEffects.staticFields=kept;
    }
  });

  registerDuelSkillBehavior("armorBreak",{
    onBasicHit:({round,fighter,other,rank,emit})=>{
      const max=at(VALUES.armorBreak.max,rank),perStack=at(VALUES.armorBreak.perStack,rank);
      const current=other.duelEffects.armorBreak;
      const stacks=current&&current.source===fighter.side&&current.until>round.time?current.stacks:0;
      other.duelEffects.armorBreak={source:fighter.side,until:round.time+VALUES.armorBreak.duration,stacks:Math.min(max,stacks+1),perStack};
      emit("status",{side:other.side,status:"armorBreak",x:other.x,y:other.y-70,stacks:other.duelEffects.armorBreak.stacks});
    },
    modifyOutgoingDamage:({round,value,fighter,target})=>{
      const effect=target?.duelEffects?.armorBreak;
      return effect&&effect.source===fighter.side&&effect.until>round.time?value*(1+effect.stacks*effect.perStack):value;
    }
  });

  registerDuelSkillBehavior("vampiricTouch",{
    onBasicHit:({round,fighter,rank,heal})=>{
      const rng=round.matchRng||Math.random;
      if(rng()<at(VALUES.vampiricTouch.chance,rank))heal(fighter,at(VALUES.vampiricTouch.heal,rank),"vampiricTouch");
    }
  });

  root.DUEL_D6C_VALUES=VALUES;
})();