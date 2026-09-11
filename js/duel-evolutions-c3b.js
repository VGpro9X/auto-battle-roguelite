(()=>{
  const root=typeof window!=="undefined"?window:globalThis;
  if(typeof root.registerDuelEvolutionAdapter!=="function"||typeof root.registerDuelSkillBehavior!=="function")return;
  function rank(build,key){return typeof root.getDuelSkillRank==="function"?root.getDuelSkillRank(build,key):Math.max(0,Math.min(3,Number(build?.[key]||0)));}
  function evoEffects(fighter){return fighter.duelEvolutionEffects||(fighter.duelEvolutionEffects={});}

  root.registerDuelEvolutionAdapter("chaosCrown",{
    desc:"Quả Cầu Hỗn Mang Rank III + đủ RANDOM/ELEMENTAL tự mở Hỗn Mang Vương Miện. Mỗi lần Hỗn Mang gốc kích hoạt, Vương Miện tung thêm 2 biến thể ngẫu nhiên độc lập ở 60% sức mạnh Rank III; biến thể phụ không tự kích hoạt lại Vương Miện."
  });
  {
    const base=root.getDuelSkillBehavior("chaosOrb")||{},previous=base.update;
    root.registerDuelSkillBehavior("chaosOrb",{...base,update:context=>{
      const {round,fighter,other,rank:skillRank,dealDamage,knockback,emit}=context,eventStart=round.events.length;
      if(typeof previous==="function")previous(context);
      if(!root.hasDuelEvolution(fighter,"chaosCrown")||!other||other.hp<=0)return;
      const fresh=round.events.slice(eventStart),triggered=fresh.some(e=>(e.skill==="chaosOrb")||e.status==="chaosPoison");if(!triggered)return;
      const values=root.DUEL_D6D_VALUES?.chaosOrb;if(!values)return;const rng=round.matchRng||Math.random;
      const applyVariant=roll=>{
        if(other.hp<=0)return;
        if(roll<.2){dealDamage(fighter,other,(values.fire?.[skillRank-1]||50)*.6,{source:"chaosCrownFire",elemental:true,projectile:true,canCrit:false,dodgeable:false,reactive:false});emit("cast",{side:fighter.side,skill:"chaosCrown",variant:"fire",x:other.x,y:other.y-104});return;}
        if(roll<.4){dealDamage(fighter,other,(values.ice?.[skillRank-1]||32)*.6,{source:"chaosCrownIce",elemental:true,projectile:true,canCrit:false,dodgeable:false,reactive:false});other.hitStun=Math.max(other.hitStun,(values.iceStun?.[skillRank-1]||.3)*.6);emit("cast",{side:fighter.side,skill:"chaosCrown",variant:"ice",x:other.x,y:other.y-104});return;}
        if(roll<.6){dealDamage(fighter,other,(values.lightning?.[skillRank-1]||58)*.6,{source:"chaosCrownLightning",elemental:true,chain:true,canCrit:false,dodgeable:false,reactive:false});emit("cast",{side:fighter.side,skill:"chaosCrown",variant:"lightning",x:other.x,y:other.y-104});return;}
        if(roll<.8){other.duelEffects.chaosPoison={source:fighter.side,until:round.time+3,dps:(values.poisonDps?.[skillRank-1]||7)*.6,tick:.5};emit("status",{side:other.side,status:"chaosCrownPoison",x:other.x,y:other.y-76,duration:3});return;}
        dealDamage(fighter,other,(values.explosion?.[skillRank-1]||48)*.6,{source:"chaosCrownExplosion",elemental:true,projectile:true,area:true,canCrit:false,dodgeable:false,reactive:false});knockback(other,(values.push?.[skillRank-1]||75)*.6,fighter.facing);emit("area",{side:fighter.side,skill:"chaosCrown",variant:"explosion",x:other.x,y:other.y-32,radius:80});
      };
      applyVariant(rng());applyVariant(rng());
    }});
  }

  root.registerDuelEvolutionAdapter("immortalAegis",{
    desc:"Hộ Thể Chu Kỳ Rank III + đủ SHIELD/DEFENSE tự mở Bất Diệt Thuẫn. Ngay trước mỗi lần Hộ Thể Rank III sẵn sàng tạo 38 khiên gốc, Bất Diệt Thuẫn tạo thêm 32 khiên, tổng 70 trước hệ số HUYẾT CHIẾN/TỬ CHIẾN."
  });
  {
    const base=root.getDuelSkillBehavior("barrier")||{},previous=base.update;
    root.registerDuelSkillBehavior("barrier",{...base,update:context=>{
      if(typeof previous==="function")previous(context);
      const {fighter,addShield}=context;
      if(!root.hasDuelEvolution(fighter,"immortalAegis")||fighter.hitStun>0||(fighter.skillTimers.barrier??1)>0)return;
      addShield(fighter,32,"immortalAegis");
    }});
  }

  root.registerDuelEvolutionAdapter("phantomLegion",{
    desc:"Dư Ảnh Rank III + đủ TIME/SUMMON tự mở Vạn Ảnh Phân Thân. Mỗi chu kỳ Dư Ảnh tạo tổng cộng 3 phân thân; hai phân thân phụ dùng đúng 2 phát bắn và sát thương Dư Ảnh Rank III, xuất hiện lệch ±18px so với phân thân gốc."
  });
  {
    const base=root.getDuelSkillBehavior("afterimage")||{},previous=base.update;
    root.registerDuelSkillBehavior("afterimage",{...base,update:context=>{
      const {fighter}=context,clones=fighter.duelEffects.afterimages||[],before=clones.length;
      if(typeof previous==="function")previous(context);
      if(!root.hasDuelEvolution(fighter,"phantomLegion"))return;
      const current=fighter.duelEffects.afterimages||[];
      if(current.length<=before)return;
      const source=current[current.length-1];if(!source||source.phantomLegionExtra)return;
      for(const offset of [-18,18])current.push({...source,x:source.x+offset,shots:[...source.shots],fired:0,phantomLegionExtra:true});
    }});
  }

  root.registerDuelEvolutionAdapter("heavenNet",{
    desc:"Địa Lôi Phù Rank III + đủ AREA/EXPLOSION/CONTROL tự mở Thiên La Địa Võng. Giới hạn mìn tăng từ 4 lên 8. Mìn nổ sẽ đánh thức mọi mìn đã lên đạn trong 120px sau 0,12 giây; mìn chuỗi gây 75% sát thương và vẫn có thể truyền chuỗi."
  });
  {
    const base=root.getDuelSkillBehavior("runeMine")||{},previous=base.update;
    root.registerDuelSkillBehavior("runeMine",{...base,update:context=>{
      const {round,fighter,other,rank:skillRank,dealDamage,knockback,emit}=context;
      if(!root.hasDuelEvolution(fighter,"heavenNet")){if(typeof previous==="function")previous(context);return;}
      const values=root.DUEL_D6C_VALUES?.runeMine;if(!values)return;
      let mines=fighter.duelEffects.runeMines||[];
      if((fighter.skillTimers.runeMine??0)<=0){
        fighter.skillTimers.runeMine=values.cooldown[skillRank-1];while(mines.length>=8)mines.shift();
        mines.push({x:fighter.x,armedAt:round.time+.45,until:round.time+5,chainAt:null,chainScale:1,dead:false});emit("status",{side:fighter.side,status:"heavenNetMine",x:fighter.x,y:fighter.y,duration:5});
      }
      const scheduleNeighbours=mine=>{for(const otherMine of mines){if(otherMine===mine||otherMine.dead||round.time<otherMine.armedAt||otherMine.chainAt!==null)continue;if(Math.abs(otherMine.x-mine.x)>120)continue;otherMine.chainAt=round.time+.12;otherMine.chainScale=.75;}};
      const detonate=(mine,scale=1)=>{
        if(mine.dead)return;mine.dead=true;const trigger=values.trigger[skillRank-1],damage=values.damage[skillRank-1]*scale,push=values.push[skillRank-1];
        if(other?.hp>0&&Math.abs(other.x-mine.x)<=trigger){dealDamage(fighter,other,damage,{source:scale<1?"heavenNet":"runeMine",area:true,canCrit:false,dodgeable:false,reactive:false});const direction=other.x>=mine.x?1:-1;knockback(other,push*scale,direction);}
        emit("area",{side:fighter.side,skill:"heavenNet",x:mine.x,y:fighter.y-12,radius:trigger,chain:scale<1});scheduleNeighbours(mine);
      };
      for(const mine of mines){
        if(mine.dead||round.time>=mine.until){mine.dead=true;continue;}
        if(mine.chainAt!==null&&round.time>=mine.chainAt){detonate(mine,mine.chainScale||.75);continue;}
        if(round.time>=mine.armedAt&&other?.hp>0&&Math.abs(other.x-mine.x)<=values.trigger[skillRank-1])detonate(mine,1);
      }
      fighter.duelEffects.runeMines=mines.filter(m=>!m.dead&&round.time<m.until);
    }});
  }

  root.registerDuelEvolutionAdapter("bloodWeb",{
    desc:"Huyết Liên Rank III + đủ BLOOD/CHAIN tự mở Huyết Võng. Trong cửa sổ Huyết Liên 4,5 giây, mỗi lần bạn thực sự gây sát thương lên đối thủ còn sao chép thêm 25% lượng sát thương thực tế thành một hit Blood + Chain. Hit sao chép không tự lặp."
  });
  {
    const base=root.getDuelSkillBehavior("bloodLink")||{},previous=base.onDamageDealt;
    root.registerDuelSkillBehavior("bloodLink",{...base,onDamageDealt:context=>{
      if(typeof previous==="function")previous(context);
      const {round,fighter,other,meta,totalDamage,dealDamage,emit}=context;
      if(!root.hasDuelEvolution(fighter,"bloodWeb")||!other||other.hp<=0||totalDamage<=0||meta?.source==="bloodWeb"||(fighter.duelEffects.bloodLinkUntil||0)<=round.time)return;
      const damage=totalDamage*.25;dealDamage(fighter,other,damage,{source:"bloodWeb",chain:true,canCrit:false,dodgeable:false,reactive:false});emit("cast",{side:fighter.side,skill:"bloodWeb",x:other.x,y:other.y-80,amount:damage});
    }});
  }

  root.registerDuelEvolutionAdapter("starfallCataclysm",{
    desc:"Tinh Vẫn Rank III + đủ FIRE/AREA/EXPLOSION tự mở Tinh Hà Trụy Lạc. Mỗi lần đặt Tinh Vẫn, tạo thêm 2 thiên thạch lệch ±38px, rơi sau viên gốc 0,18 và 0,36 giây; mỗi viên phụ gây 70% sát thương Rank III và giữ burn 2 giây của Tinh Vẫn."
  });
  {
    const base=root.getDuelSkillBehavior("meteorSeal")||{},previous=base.update;
    root.registerDuelSkillBehavior("meteorSeal",{...base,update:context=>{
      const {round,fighter,other,rank:skillRank,dealDamage,emit}=context,state=evoEffects(fighter);state.starfallSecondaries=state.starfallSecondaries||[];
      const before=(fighter.duelEffects.meteors||[]).length;
      if(typeof previous==="function")previous(context);
      if(root.hasDuelEvolution(fighter,"starfallCataclysm")){
        const meteors=fighter.duelEffects.meteors||[];
        if(meteors.length>before){const primary=meteors[meteors.length-1];for(const [offset,delay] of [[-38,.18],[38,.36]])state.starfallSecondaries.push({x:primary.x+offset,impactAt:primary.impactAt+delay});}
      }
      const values=root.DUEL_D6C_VALUES?.meteorSeal;if(!values)return;
      const kept=[];
      for(const meteor of state.starfallSecondaries){
        if(round.time<meteor.impactAt){kept.push(meteor);continue;}
        const radius=values.radius[skillRank-1],damage=values.damage[skillRank-1]*.70;emit("area",{side:fighter.side,skill:"starfallCataclysm",x:meteor.x,y:fighter.y-18,radius});
        if(other?.hp>0&&Math.abs(other.x-meteor.x)<=radius){dealDamage(fighter,other,damage,{source:"starfallCataclysm",elemental:true,area:true,canCrit:false,dodgeable:false,reactive:false});other.duelEffects.meteorBurn={source:fighter.side,until:round.time+2,dps:values.burnDps[skillRank-1],tick:.5};}
      }
      state.starfallSecondaries=kept;
    }});
  }

  root.DUEL_C3B_EVOLUTION_IDS=["chaosCrown","immortalAegis","phantomLegion","heavenNet","bloodWeb","starfallCataclysm"];
})();