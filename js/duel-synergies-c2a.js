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
      }else{
        merged[hook]=context=>{
          if(typeof previous==="function")previous(context);
          return fn(context);
        };
      }
    }
    root.registerDuelSkillBehavior(key,merged);
  }

  function rank(build,key){return typeof root.getDuelSkillRank==="function"?root.getDuelSkillRank(build,key):Math.max(0,Math.min(3,Number(build?.[key]||0)));}
  function at(values,r){return values[Math.max(0,Math.min(values.length-1,r-1))];}
  function effects(fighter){return fighter.duelSynergyEffects||(fighter.duelSynergyEffects={});}

  // 1/8 Lò Luyện Hồn is implemented in the C1 foundation.

  root.registerDuelSynergyAdapter("frozenExecution",{
    desc:"Hàn Sát tự mở khi có Hàn Thấu + Đoạt Mệnh. Khi đối thủ vừa nằm trong vùng Hàn Khí của bạn vừa ở ngưỡng thấp máu của Đoạt Mệnh, sát thương sau bonus Đoạt Mệnh tăng thêm 25%. Nếu không có Hàn Khí đang tác dụng, bonus này không kích hoạt."
  });
  chainSkillBehavior("execution",{
    modifyOutgoingDamage:({value,fighter,target})=>{
      if(!root.hasDuelSynergy(fighter,"frozenExecution")||!target?.maxHp)return value;
      const frostRank=rank(fighter.build,"frost"),executionRank=rank(fighter.build,"execution");
      if(!frostRank||!executionRank)return value;
      const radius=root.DUEL_SKILL_VALUES?.frost?.radius?.[frostRank-1]||0;
      const thresholds=root.DUEL_D6A_VALUES?.execution?.threshold||[.30,.35,.40];
      const cold=Math.abs(target.x-fighter.x)<=radius;
      const low=target.hp/target.maxHp<=at(thresholds,executionRank);
      return cold&&low?value*1.25:value;
    }
  });

  root.registerDuelSynergyAdapter("crimsonFortress",{
    desc:"Huyết Thành tự mở khi có Huyết Thuẫn + Hộ Thể Chu Kỳ. Mỗi lượng HP thực sự bạn vừa hồi sẽ tạo thêm khiên bằng 55% lượng hồi đó; lớp khiên mới vẫn chịu hệ số tạo khiên của HUYẾT CHIẾN/TỬ CHIẾN."
  });
  chainSkillBehavior("bloodShield",{
    onCreate:({fighter})=>{effects(fighter).crimsonFortress={healingSeen:fighter.totalHealing||0};},
    update:({fighter,addShield})=>{
      const bag=effects(fighter);
      const state=bag.crimsonFortress||(bag.crimsonFortress={healingSeen:fighter.totalHealing||0});
      const current=fighter.totalHealing||0,delta=Math.max(0,current-state.healingSeen);state.healingSeen=current;
      if(delta>0&&root.hasDuelSynergy(fighter,"crimsonFortress"))addShield(fighter,delta*.55,"crimsonFortress");
    }
  });

  root.registerDuelSynergyAdapter("markedBounty",{
    desc:"Săn Ấn tự mở khi có Tử Ấn + Thưởng Săn. Trong lúc cùng mục tiêu đang có Tử Ấn của bạn và cửa sổ Thưởng Ấn còn hiệu lực, sát thương thực tế được tính 125% vào tiến độ Thưởng Săn. Không tạo thêm XP hay phần thưởng ẩn."
  });
  chainSkillBehavior("bountyMark",{
    onDamageDealt:({round,fighter,other,rank:skillRank,totalDamage,addShield})=>{
      if(!root.hasDuelSynergy(fighter,"markedBounty")||totalDamage<=0||!other)return;
      const bounty=fighter.duelEffects.bountyMark,mark=other.duelEffects?.deathMark;
      if(!bounty||bounty.rewarded||bounty.until<=round.time||!mark||mark.source!==fighter.side||mark.until<=round.time)return;
      bounty.progress+=totalDamage*.25;
      const goal=root.DUEL_D6G_VALUES?.bountyMark?.goal?.[skillRank-1];
      const shield=root.DUEL_D6G_VALUES?.bountyMark?.shield?.[skillRank-1];
      if(Number.isFinite(goal)&&Number.isFinite(shield)&&bounty.progress>=goal){bounty.rewarded=true;addShield(fighter,shield,"markedBounty");}
    }
  });

  root.registerDuelSynergyAdapter("soulAegis",{
    desc:"Hồn Thuẫn tự mở khi có Thực Hồn + Huyết Thuẫn. Mỗi tầng Thực Hồn mới nhận trong round tạo thêm 3 / 4 / 5 khiên theo Rank Thực Hồn. Khiên vẫn chịu luật HUYẾT CHIẾN/TỬ CHIẾN."
  });
  chainSkillBehavior("soulHarvest",{
    onCreate:({fighter})=>{effects(fighter).soulAegis={stacksSeen:fighter.duelEffects.soulHarvest?.stacks||0};},
    onDamageDealt:({fighter,rank:skillRank,addShield})=>{
      const bag=effects(fighter);
      const state=bag.soulAegis||(bag.soulAegis={stacksSeen:0});
      const stacks=fighter.duelEffects.soulHarvest?.stacks||0,gained=Math.max(0,stacks-state.stacksSeen);state.stacksSeen=stacks;
      if(!gained||!root.hasDuelSynergy(fighter,"soulAegis"))return;
      const perStack=at([3,4,5],skillRank);
      for(let i=0;i<gained;i++)addShield(fighter,perStack,"soulAegis");
    }
  });

  root.registerDuelSynergyAdapter("criticalStorm",{
    desc:"Bạo Lôi tự mở khi có Bạo Kích + Lôi Kích. Mỗi Lôi Kích gây sát thương sẽ gọi thêm một tia Chain không thể bạo kích, có sát thương cơ bản bằng sát thương Lôi Kích hiện tại × tỉ lệ bạo kích hiện tại của bạn."
  });
  chainSkillBehavior("crit",{
    onDamageDealt:({fighter,other,meta,totalDamage,dealDamage,emit})=>{
      if(!root.hasDuelSynergy(fighter,"criticalStorm")||totalDamage<=0||meta?.source!=="lightning"||!other||other.hp<=0)return;
      const lightningRank=rank(fighter.build,"lightning");
      const base=root.DUEL_SKILL_VALUES?.lightning?.damage?.[lightningRank-1]||0;
      const damage=base*Math.max(0,fighter.stats.critChance||0);
      if(damage<=0)return;
      dealDamage(fighter,other,damage,{source:"criticalStorm",elemental:true,chain:true,canCrit:false,dodgeable:false,reactive:false});
      emit("cast",{side:fighter.side,skill:"criticalStorm",x:other.x,y:other.y-100});
    }
  });

  root.registerDuelSynergyAdapter("lastBreath",{
    desc:"Hồi Quang tự mở khi có Tuyệt Lộ + Hồi Mệnh. Khi Hồi Mệnh thực sự cứu bạn, nhận khiên bằng 28% HP tối đa và gây vụ nổ bán kính 150px với 30 / 40 / 50 sát thương theo Rank Hồi Mệnh. Khiên vẫn chịu luật HUYẾT CHIẾN/TỬ CHIẾN."
  });
  chainSkillBehavior("secondWind",{
    onFatalDamage:({round,fighter,other,rank:skillRank,addShield,dealDamage,emit})=>{
      if(!root.hasDuelSynergy(fighter,"lastBreath")||fighter.hp<=0)return;
      const bag=effects(fighter),marker=`${round.number}:${fighter.duelEffects.secondWindCharges||0}`;
      if(bag.lastBreathMarker===marker)return;
      bag.lastBreathMarker=marker;
      addShield(fighter,fighter.maxHp*.28,"lastBreath");
      emit("area",{side:fighter.side,skill:"lastBreath",x:fighter.x,y:fighter.y-30,radius:150});
      if(other&&other.hp>0&&Math.abs(other.x-fighter.x)<=150)dealDamage(fighter,other,at([30,40,50],skillRank),{source:"lastBreath",area:true,canCrit:false,dodgeable:false,reactive:false});
    }
  });

  root.registerDuelSynergyAdapter("glassBlood",{
    desc:"Huyết Kính tự mở khi có Pháo Thủy Tinh + Huyết Chạm. Nếu bạn ở dưới 50% HP ngay trước đòn đánh thường, lượng hồi thực tế do Huyết Chạm của đòn đó tạo ra được lặp lại thêm một lần qua luật hồi phục hiện tại."
  });
  chainSkillBehavior("vampiricTouch",{
    onCreate:({fighter})=>{effects(fighter).glassBlood={healingSeen:fighter.totalHealing||0,low:false};},
    update:({fighter})=>{
      const bag=effects(fighter);
      const state=bag.glassBlood||(bag.glassBlood={healingSeen:0,low:false});
      state.healingSeen=fighter.totalHealing||0;state.low=fighter.hp/fighter.maxHp<.5;
    },
    onBasicHit:({fighter,heal})=>{
      const state=effects(fighter).glassBlood;
      if(!state)return;
      const current=fighter.totalHealing||0,gained=Math.max(0,current-state.healingSeen);state.healingSeen=current;
      if(root.hasDuelSynergy(fighter,"glassBlood")&&state.low&&gained>0)heal(fighter,gained,"glassBlood");
    }
  });

  root.DUEL_C2A_SYNERGY_IDS=["soulFurnace","frozenExecution","crimsonFortress","markedBounty","soulAegis","criticalStorm","lastBreath","glassBlood"];
})();