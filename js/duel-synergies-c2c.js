(()=>{
  const root=typeof window!=="undefined"?window:globalThis;
  if(typeof root.registerDuelSynergyAdapter!=="function"||typeof root.registerDuelSkillBehavior!=="function")return;

  const VALUE_HOOKS=new Set(["modifyOutgoingDamage","modifyTargetArmor","modifyIncomingDamage","modifyMoveMultiplier","modifyBasicAttackCooldown"]);
  function chainSkillBehavior(key,extension){
    const base=(typeof root.getDuelSkillBehavior==="function"&&root.getDuelSkillBehavior(key))||{};
    const merged={...base};
    for(const [hook,fn] of Object.entries(extension||{})){
      const previous=base[hook];
      if(VALUE_HOOKS.has(hook)){
        merged[hook]=context=>{
          let value=context.value;
          if(typeof previous==="function"){
            const next=previous({...context,value});
            if(Number.isFinite(next))value=next;
          }
          const next=fn({...context,value});
          return Number.isFinite(next)?next:value;
        };
      }else merged[hook]=context=>{if(typeof previous==="function")previous(context);return fn(context);};
    }
    root.registerDuelSkillBehavior(key,merged);
  }
  function rank(build,key){return typeof root.getDuelSkillRank==="function"?root.getDuelSkillRank(build,key):Math.max(0,Math.min(3,Number(build?.[key]||0)));}
  function at(values,r){return values[Math.max(0,Math.min(values.length-1,r-1))];}
  function effects(fighter){return fighter.duelSynergyEffects||(fighter.duelSynergyEffects={});}
  function ownBurnActive(round,fighter,other){
    const normal=other?.statuses?.burnUntil>round.time&&other.statuses.burnSource===fighter.side;
    const meteor=other?.duelEffects?.meteorBurn;
    return Boolean(normal||(meteor&&meteor.source===fighter.side&&meteor.until>round.time));
  }

  root.registerDuelSynergyAdapter("combustionChain",{
    desc:"Liên Hoàn Hỏa Táng tự mở khi có Hỏa Táng + Thi Bạo. Mỗi khi một mốc Thi Bạo mới thực sự nổ trong lúc đối thủ đang cháy bởi bạn, tạo thêm một vụ nổ Hỏa bằng 50% sát thương Thi Bạo của Rank hiện tại. Nếu một hit vượt nhiều mốc, mỗi mốc mới tạo đúng một vụ nổ phụ."
  });
  {
    const base=root.getDuelSkillBehavior("corpseBurst")||{};
    const previous=base.onDamageDealt;
    root.registerDuelSkillBehavior("corpseBurst",{...base,onDamageDealt:context=>{
      const {round,fighter,other,rank:burstRank,dealDamage,emit}=context;
      const before=(fighter.duelEffects.corpseBurstTriggered||[]).filter(Boolean).length;
      if(typeof previous==="function")previous(context);
      if(!root.hasDuelSynergy(fighter,"combustionChain")||!other||other.hp<=0||!ownBurnActive(round,fighter,other))return;
      const after=(fighter.duelEffects.corpseBurstTriggered||[]).filter(Boolean).length,newBursts=Math.max(0,after-before);
      if(!newBursts)return;
      const baseDamage=root.DUEL_D6G_VALUES?.corpseBurst?.damage?.[burstRank-1]||0;
      for(let i=0;i<newBursts&&other.hp>0;i++){
        dealDamage(fighter,other,baseDamage*.5,{source:"combustionChain",elemental:true,area:true,canCrit:false,dodgeable:false,reactive:false});
        emit("area",{side:fighter.side,skill:"combustionChain",x:other.x,y:other.y-38,radius:82});
      }
    }});
  }

  root.registerDuelSynergyAdapter("echoBarrage",{
    desc:"Vạn Ảnh Tiễn tự mở khi có Ảnh Xạ + Song Tiễn. Mỗi lần bộ đếm Ảnh Xạ thực sự hoàn tất, ngoài viên Ảnh Xạ gốc còn bắn thêm 1 / 2 / 3 linh tiễn theo Rank Song Tiễn; mỗi linh tiễn phụ gây 60% sát thương của viên Ảnh Xạ gốc và không tính là đòn đánh thường."
  });
  {
    const base=root.getDuelSkillBehavior("echoShot")||{};
    const previous=base.onBasicHit;
    root.registerDuelSkillBehavior("echoShot",{...base,onBasicHit:context=>{
      const {fighter,rank:echoRank,spawnProjectile,emit}=context;
      const before=fighter.duelEffects.echoShotHits||0;
      const need=root.DUEL_D6B_VALUES?.echoShot?.hits?.[echoRank-1]||999;
      if(typeof previous==="function")previous(context);
      if(!root.hasDuelSynergy(fighter,"echoBarrage")||before+1<need)return;
      const multiRank=rank(fighter.build,"multishot"),count=multiRank;
      const ratio=(root.DUEL_D6B_VALUES?.echoShot?.damage?.[echoRank-1]||0)*.60;
      for(let i=0;i<count;i++)spawnProjectile(fighter,{damage:fighter.stats.baseDamage*ratio,speed:452+i*8,radius:5,source:"echoBarrage",colorHint:"echo",meta:{projectile:true}});
      emit("cast",{side:fighter.side,skill:"echoBarrage",x:fighter.x+fighter.facing*38,y:fighter.y-78,count});
    }});
  }

  root.registerDuelSynergyAdapter("gravityNova",{
    desc:"Trọng Lực Bạo tự mở khi có Hắc Vực + Linh Bạo. Mỗi Linh Bạo gây sát thương sẽ kéo mục tiêu 55 / 80 / 110px về phía bạn theo Rank Hắc Vực ngay trong cú nổ; sau đó lực đẩy 25px gốc của Linh Bạo vẫn được áp dụng, nên hiệu ứng ròng vẫn nghiêng về kéo vào."
  });
  chainSkillBehavior("blackHole",{
    onDamageDealt:({fighter,other,meta,totalDamage,knockback,emit})=>{
      if(!root.hasDuelSynergy(fighter,"gravityNova")||totalDamage<=0||meta?.source!=="nova"||!other||other.hp<=0)return;
      const blackRank=rank(fighter.build,"blackHole"),pull=at([55,80,110],blackRank);
      const direction=fighter.x<other.x?-1:1;
      knockback(other,pull,direction);
      emit("status",{side:other.side,status:"gravityNova",x:other.x,y:other.y-62,amount:pull});
    }
  });

  root.registerDuelSynergyAdapter("elementalChaos",{
    desc:"Ngũ Hành Hỗn Mang tự mở khi có Quả Cầu Hỗn Mang + Ngũ Hành. Mỗi lần Hỗn Mang thực sự kích hoạt, tung thêm đúng 1 biến thể ngẫu nhiên 20% Hỏa / Băng / Sét / Độc / Nổ với sức mạnh phụ thấp hơn bản gốc. Biến thể phụ không thể tự kích hoạt thêm Hỗn Mang."
  });
  {
    const base=root.getDuelSkillBehavior("chaosOrb")||{};
    const previous=base.update;
    root.registerDuelSkillBehavior("chaosOrb",{...base,update:context=>{
      const {round,fighter,other,dt,rank:chaosRank,dealDamage,knockback,emit}=context;
      const poison=other?.duelEffects?.elementalChaosPoison;
      if(poison&&poison.source===fighter.side){
        if(poison.until<=round.time)delete other.duelEffects.elementalChaosPoison;
        else{
          poison.tick-=dt;
          while(poison.tick<=0&&other.hp>0){poison.tick+=.5;dealDamage(fighter,other,poison.dps*.5,{source:"elementalChaosPoison",elemental:true,canCrit:false,dodgeable:false,reactive:false});}
        }
      }
      const before=fighter.skillTimers.chaosOrb??0;
      if(typeof previous==="function")previous(context);
      if(!root.hasDuelSynergy(fighter,"elementalChaos")||before>0||(fighter.skillTimers.chaosOrb??0)<=0||!other||other.hp<=0)return;
      const roll=(round.matchRng||Math.random)();
      const fire=at([12,18,25],chaosRank),ice=at([8,12,16],chaosRank),lightning=at([14,21,29],chaosRank),explosion=at([12,18,24],chaosRank);
      if(roll<.2){dealDamage(fighter,other,fire,{source:"elementalChaosFire",elemental:true,canCrit:false,dodgeable:false,reactive:false});emit("cast",{side:fighter.side,skill:"elementalChaos",variant:"fire",x:other.x,y:other.y-84});return;}
      if(roll<.4){dealDamage(fighter,other,ice,{source:"elementalChaosIce",elemental:true,canCrit:false,dodgeable:false,reactive:false});other.hitStun=Math.max(other.hitStun,at([.10,.15,.20],chaosRank));emit("cast",{side:fighter.side,skill:"elementalChaos",variant:"ice",x:other.x,y:other.y-84});return;}
      if(roll<.6){dealDamage(fighter,other,lightning,{source:"elementalChaosLightning",elemental:true,chain:true,canCrit:false,dodgeable:false,reactive:false});emit("cast",{side:fighter.side,skill:"elementalChaos",variant:"lightning",x:other.x,y:other.y-96});return;}
      if(roll<.8){other.duelEffects.elementalChaosPoison={source:fighter.side,until:round.time+2,dps:at([1.5,2.5,4],chaosRank),tick:.5};emit("status",{side:other.side,status:"elementalChaosPoison",x:other.x,y:other.y-72,duration:2});return;}
      dealDamage(fighter,other,explosion,{source:"elementalChaosExplosion",elemental:true,area:true,canCrit:false,dodgeable:false,reactive:false});knockback(other,at([20,30,40],chaosRank),fighter.facing);emit("area",{side:fighter.side,skill:"elementalChaos",variant:"explosion",x:other.x,y:other.y-34,radius:72});
    }});
  }

  root.registerDuelSynergyAdapter("afterimageEcho",{
    desc:"Vạn Ảnh Xạ tự mở khi có Dư Ảnh + Ảnh Xạ. Mỗi projectile Dư Ảnh thực sự gây sát thương sẽ cộng 1 lần vào chính bộ đếm Ảnh Xạ đang dùng cho đòn đánh thường. Nếu nhờ đó đủ mốc, bộ đếm trở về 0 và bắn viên Ảnh Xạ chuẩn theo Rank Ảnh Xạ."
  });
  chainSkillBehavior("afterimage",{
    onDamageDealt:({fighter,other,meta,totalDamage,spawnProjectile,emit})=>{
      if(!root.hasDuelSynergy(fighter,"afterimageEcho")||totalDamage<=0||meta?.source!=="afterimage"||!other||other.hp<=0)return;
      const echoRank=rank(fighter.build,"echoShot"),need=root.DUEL_D6B_VALUES?.echoShot?.hits?.[echoRank-1]||999;
      fighter.duelEffects.echoShotHits=(fighter.duelEffects.echoShotHits||0)+1;
      if(fighter.duelEffects.echoShotHits<need)return;
      fighter.duelEffects.echoShotHits-=need;
      const ratio=root.DUEL_D6B_VALUES?.echoShot?.damage?.[echoRank-1]||0;
      spawnProjectile(fighter,{damage:fighter.stats.baseDamage*ratio,speed:440,radius:6,source:"echoShot",colorHint:"echo",meta:{projectile:true}});
      emit("cast",{side:fighter.side,skill:"afterimageEcho",x:fighter.x+fighter.facing*36,y:fighter.y-78});
    }
  });

  root.registerDuelSynergyAdapter("gravityRune",{
    desc:"Trọng Lực Phù Trận tự mở khi có Địa Lôi Phù + Hắc Vực. Sau khi một Địa Lôi thực sự nổ và áp dụng lực đẩy gốc, phù lập tức kéo đối thủ 45 / 70 / 100px trở lại phía bạn theo Rank Hắc Vực. Nếu vụ nổ hạ gục mục tiêu thì không có lực kéo phụ."
  });
  {
    const base=root.getDuelSkillBehavior("runeMine")||{};
    const previous=base.update;
    root.registerDuelSkillBehavior("runeMine",{...base,update:context=>{
      const {round,fighter,other,knockback,emit}=context;
      const eventStart=round.events.length;
      if(typeof previous==="function")previous(context);
      if(!root.hasDuelSynergy(fighter,"gravityRune")||!other||other.hp<=0)return;
      const detonated=round.events.slice(eventStart).some(event=>event.type==="area"&&event.skill==="runeMine"&&event.side===fighter.side);
      if(!detonated)return;
      const blackRank=rank(fighter.build,"blackHole"),pull=at([45,70,100],blackRank),direction=fighter.x<other.x?-1:1;
      knockback(other,pull,direction);
      emit("status",{side:other.side,status:"gravityRune",x:other.x,y:other.y-58,amount:pull});
    }});
  }

  root.DUEL_C2C_SYNERGY_IDS=["combustionChain","echoBarrage","gravityNova","elementalChaos","afterimageEcho","gravityRune"];
})();