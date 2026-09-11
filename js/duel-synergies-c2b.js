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
  function wrapSkillUpdate(key,after){
    const base=(typeof root.getDuelSkillBehavior==="function"&&root.getDuelSkillBehavior(key))||{};
    const previous=base.update;
    root.registerDuelSkillBehavior(key,{...base,update:context=>{
      const beforeOtherX=context.other?.x;
      if(typeof previous==="function")previous(context);
      return after({...context,beforeOtherX});
    }});
  }
  function rank(build,key){return typeof root.getDuelSkillRank==="function"?root.getDuelSkillRank(build,key):Math.max(0,Math.min(3,Number(build?.[key]||0)));}
  function at(values,r){return values[Math.max(0,Math.min(values.length-1,r-1))];}
  function effects(fighter){return fighter.duelSynergyEffects||(fighter.duelSynergyEffects={});}

  root.registerDuelSynergyAdapter("thermalShock",{
    desc:"Sốc Nhiệt tự mở khi có Hỏa Cầu Định Kỳ + Hàn Khí. Hỏa Cầu gây sát thương lên đối thủ đang nằm trong Hàn Khí của bạn có 34% cơ hội nổ thêm 10 / 16 / 24 sát thương Hỏa Area theo Rank Hỏa Cầu. Không có hồi chiêu ẩn."
  });
  chainSkillBehavior("fire",{
    onDamageDealt:({round,fighter,other,rank:fireRank,meta,totalDamage,dealDamage,emit})=>{
      if(!root.hasDuelSynergy(fighter,"thermalShock")||totalDamage<=0||meta?.source!=="fire"||!other||other.hp<=0)return;
      const frostRank=rank(fighter.build,"frost"),radius=root.DUEL_SKILL_VALUES?.frost?.radius?.[frostRank-1]||0;
      if(!frostRank||Math.abs(other.x-fighter.x)>radius||(round.matchRng||Math.random)()>=.34)return;
      dealDamage(fighter,other,at([10,16,24],fireRank),{source:"thermalShock",elemental:true,area:true,canCrit:false,dodgeable:false,reactive:false});
      emit("area",{side:fighter.side,skill:"thermalShock",x:other.x,y:other.y-38,radius:72});
    }
  });

  root.registerDuelSynergyAdapter("bloodConductor",{
    desc:"Huyết Dẫn Lôi tự mở khi có Huyết Khí + Lôi Kích. Mỗi 8 HP thực sự được hồi sẽ tiêu 8 điểm tích điện để phóng một tia Chain gây 10 / 14 / 18 sát thương Sét theo Rank Lôi Kích. Hồi dư được giữ lại; hồi vượt HP tối đa không tính."
  });
  chainSkillBehavior("blood",{
    onCreate:({fighter})=>{effects(fighter).bloodConductor={healingSeen:fighter.totalHealing||0,charge:0};},
    update:({fighter,other,dealDamage,emit})=>{
      const state=effects(fighter).bloodConductor||(effects(fighter).bloodConductor={healingSeen:fighter.totalHealing||0,charge:0});
      const current=fighter.totalHealing||0,delta=Math.max(0,current-state.healingSeen);state.healingSeen=current;
      if(!root.hasDuelSynergy(fighter,"bloodConductor")||delta<=0||!other||other.hp<=0)return;
      state.charge+=delta;
      const lightningRank=rank(fighter.build,"lightning");
      while(state.charge>=8&&other.hp>0){
        state.charge-=8;
        dealDamage(fighter,other,at([10,14,18],lightningRank),{source:"bloodConductor",elemental:true,chain:true,canCrit:false,dodgeable:false,reactive:false});
        emit("cast",{side:fighter.side,skill:"bloodConductor",x:other.x,y:other.y-98});
      }
    }
  });

  root.registerDuelSynergyAdapter("arcCollector",{
    desc:"Thu Lôi tự mở khi có Linh Hấp + Lôi Kích. Mỗi 2 lần Linh Hấp thực sự kéo được đối thủ sẽ phóng thêm một tia Chain gây 12 / 18 / 26 sát thương Sét theo Rank Lôi Kích. Lần thử lại ngoài tầm không được tính."
  });
  wrapSkillUpdate("magnet",({fighter,other,beforeOtherX,dealDamage,emit})=>{
    if(!root.hasDuelSynergy(fighter,"arcCollector")||!other||other.hp<=0||!Number.isFinite(beforeOtherX))return;
    const moved=Math.abs(other.x-beforeOtherX);
    if(moved<1)return;
    const state=effects(fighter).arcCollector||(effects(fighter).arcCollector={pulls:0});
    state.pulls++;
    if(state.pulls<2)return;
    state.pulls-=2;
    const lightningRank=rank(fighter.build,"lightning");
    dealDamage(fighter,other,at([12,18,26],lightningRank),{source:"arcCollector",elemental:true,chain:true,canCrit:false,dodgeable:false,reactive:false});
    emit("cast",{side:fighter.side,skill:"arcCollector",x:other.x,y:other.y-100});
  });

  root.registerDuelSynergyAdapter("explosiveBlades",{
    desc:"Bạo Kiếm tự mở khi có Phi Kiếm Hộ Thể + Đạn Nổ. Mỗi hit Phi Kiếm gây sát thương có 24% cơ hội nổ thêm 10 / 16 / 22 sát thương Summon + Area theo Rank Phi Kiếm. Vụ nổ không thể tự kích hoạt lại Bạo Kiếm."
  });
  chainSkillBehavior("orbit",{
    onDamageDealt:({round,fighter,other,rank:orbitRank,meta,totalDamage,dealDamage,emit})=>{
      if(!root.hasDuelSynergy(fighter,"explosiveBlades")||totalDamage<=0||meta?.source!=="orbit"||!other||other.hp<=0)return;
      if((round.matchRng||Math.random)()>=.24)return;
      dealDamage(fighter,other,at([10,16,22],orbitRank),{source:"explosiveBlades",summon:true,area:true,canCrit:false,dodgeable:false,reactive:false});
      emit("area",{side:fighter.side,skill:"explosiveBlades",x:other.x,y:other.y-36,radius:68});
    }
  });

  root.registerDuelSynergyAdapter("toxicFlame",{
    desc:"Độc Hỏa tự mở khi có Độc Tố + Thiêu Đốt. Khi đối thủ đồng thời mang Độc Tố của bạn và đang cháy bởi bạn, mỗi 1 giây phát nổ Độc-Hỏa gây 7 / 12 / 18 sát thương Hỏa + Độc Area theo Rank Độc Tố."
  });
  chainSkillBehavior("poison",{
    onCreate:({fighter})=>{effects(fighter).toxicFlameTimer=1;},
    update:({round,fighter,other,dt,rank:poisonRank,dealDamage,emit})=>{
      if(!root.hasDuelSynergy(fighter,"toxicFlame")||!other||other.hp<=0)return;
      const poison=other.duelEffects?.poison;
      const poisoned=poison&&poison.source===fighter.side&&poison.until>round.time;
      const burning=other.statuses?.burnUntil>round.time&&other.statuses.burnSource===fighter.side;
      if(!poisoned||!burning){effects(fighter).toxicFlameTimer=1;return;}
      effects(fighter).toxicFlameTimer-=dt;
      if(effects(fighter).toxicFlameTimer>0)return;
      effects(fighter).toxicFlameTimer+=1;
      dealDamage(fighter,other,at([7,12,18],poisonRank),{source:"toxicFlame",elemental:true,area:true,canCrit:false,dodgeable:false,reactive:false});
      emit("area",{side:fighter.side,skill:"toxicFlame",x:other.x,y:other.y-36,radius:64});
    }
  });

  root.registerDuelSynergyAdapter("stormVolley",{
    desc:"Lôi Tiễn tự mở khi có Song Tiễn + Lôi Kích. Mỗi linh tiễn Song Tiễn gây sát thương có 20% cơ hội dẫn thêm một tia Chain gây 8 / 14 / 22 sát thương Sét theo Rank Lôi Kích. Tia dẫn không tự tạo thêm Song Tiễn."
  });
  chainSkillBehavior("multishot",{
    onDamageDealt:({round,fighter,other,meta,totalDamage,dealDamage,emit})=>{
      if(!root.hasDuelSynergy(fighter,"stormVolley")||totalDamage<=0||meta?.source!=="multishot"||!other||other.hp<=0)return;
      if((round.matchRng||Math.random)()>=.20)return;
      const lightningRank=rank(fighter.build,"lightning");
      dealDamage(fighter,other,at([8,14,22],lightningRank),{source:"stormVolley",elemental:true,chain:true,canCrit:false,dodgeable:false,reactive:false});
      emit("cast",{side:fighter.side,skill:"stormVolley",x:other.x,y:other.y-96});
    }
  });

  root.registerDuelSynergyAdapter("timeLoop",{
    desc:"Vòng Lặp Thời Gian tự mở khi có Dội Thời Gian + Quá Tải Thời Gian. Khi một skill tự động hợp lệ vừa bắt đầu lại hồi chiêu nhưng Dội Thời Gian không kích hoạt, Vòng Lặp cho thêm 12 / 18 / 24% cơ hội đặt timer đó về 0 theo Rank Dội Thời Gian."
  });
  const TIME_LOOP_KEYS=new Set(["fire","knock","lightning","nova","barrier","deathMark","sacrifice","blackHole","luckyStar","afterimage","runeMine","meteorSeal","staticField","chaosOrb","fireWisp","stormTotem","returnBlade","timeField","soulBind","bloodLink","guardianIdol","magnet","xpHeal","bountyMark"]);
  chainSkillBehavior("timeEcho",{
    onCreate:({fighter})=>{effects(fighter).timeLoopPrev={...fighter.skillTimers};},
    update:({round,fighter,rank:echoRank,emit})=>{
      const bag=effects(fighter),prev=bag.timeLoopPrev||{},rng=round.matchRng||Math.random;
      if(root.hasDuelSynergy(fighter,"timeLoop")){
        for(const key of TIME_LOOP_KEYS){
          const current=fighter.skillTimers[key],before=prev[key];
          if(!Number.isFinite(current)||!Number.isFinite(before)||before>0||current<=0)continue;
          if(rng()<at([.12,.18,.24],echoRank)){fighter.skillTimers[key]=0;emit("status",{side:fighter.side,status:"timeLoop",skill:key,x:fighter.x,y:fighter.y-92});}
        }
      }
      bag.timeLoopPrev={...fighter.skillTimers};
    }
  });

  root.registerDuelSynergyAdapter("plagueLightning",{
    desc:"Lôi Độc tự mở khi có Độc Dẫn + Lôi Kích. Trong lúc Độc Tố của bạn còn hoạt động, ngoài cơ chế Độc Dẫn gốc còn phát một tia Lôi Độc chắc chắn mỗi 1,5 giây, gây 8 / 14 / 22 sát thương Sét Chain theo Rank Lôi Kích."
  });
  chainSkillBehavior("conductiveVenom",{
    onCreate:({fighter})=>{effects(fighter).plagueLightningTimer=1.5;},
    update:({round,fighter,other,dt,dealDamage,emit})=>{
      if(!root.hasDuelSynergy(fighter,"plagueLightning")||!other||other.hp<=0)return;
      const poison=other.duelEffects?.poison;
      if(!poison||poison.source!==fighter.side||poison.until<=round.time){effects(fighter).plagueLightningTimer=1.5;return;}
      effects(fighter).plagueLightningTimer-=dt;
      if(effects(fighter).plagueLightningTimer>0)return;
      effects(fighter).plagueLightningTimer+=1.5;
      const lightningRank=rank(fighter.build,"lightning");
      dealDamage(fighter,other,at([8,14,22],lightningRank),{source:"plagueLightning",elemental:true,chain:true,canCrit:false,dodgeable:false,reactive:false});
      emit("cast",{side:fighter.side,skill:"plagueLightning",x:other.x,y:other.y-102});
    }
  });

  root.DUEL_C2B_SYNERGY_IDS=["thermalShock","bloodConductor","arcCollector","explosiveBlades","toxicFlame","stormVolley","timeLoop","plagueLightning"];
})();