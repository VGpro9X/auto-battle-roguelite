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

  root.registerDuelSynergyAdapter("bloodSymbiosis",{
    desc:"Huyết Mạch Cộng Sinh tự mở khi có Huyết Liên + Huyết Chạm. Mỗi phản kích Huyết Liên thực sự gây mất HP cho đối thủ sẽ hồi cho bạn 25 / 35 / 50% lượng HP đối thủ thực sự mất theo Rank Huyết Chạm. Sát thương chỉ chạm khiên không tạo hồi phục."
  });
  {
    const base=root.getDuelSkillBehavior("bloodLink")||{};
    const previous=base.onDamageTaken;
    root.registerDuelSkillBehavior("bloodLink",{...base,onDamageTaken:context=>{
      const {fighter,other,heal}=context;
      const beforeHp=other?.hp;
      if(typeof previous==="function")previous(context);
      if(!root.hasDuelSynergy(fighter,"bloodSymbiosis")||!other||!Number.isFinite(beforeHp))return;
      const hpLost=Math.max(0,beforeHp-other.hp);
      if(hpLost<=0)return;
      const vampRank=rank(fighter.build,"vampiricTouch");
      heal(fighter,hpLost*at([.25,.35,.50],vampRank),"bloodSymbiosis");
    }});
  }

  root.registerDuelSynergyAdapter("nourishingPearls",{
    desc:"Linh Châu Dưỡng Mệnh tự mở khi có Linh Châu + Linh Dưỡng. Mỗi projectile Linh Châu thực sự gây sát thương sẽ hồi 1 / 2 / 3 HP theo Rank Linh Dưỡng. Đây là hồi phục thật nên có thể nạp cho Linh Châu ở các nhịp sau và vẫn chịu HUYẾT CHIẾN/TỬ CHIẾN."
  });
  chainSkillBehavior("spiritPearl",{
    onDamageDealt:({fighter,meta,totalDamage,heal})=>{
      if(!root.hasDuelSynergy(fighter,"nourishingPearls")||totalDamage<=0||meta?.source!=="spiritPearl")return;
      const healRank=rank(fighter.build,"xpHeal");
      heal(fighter,at([1,2,3],healRank),"nourishingPearls");
    }
  });

  root.registerDuelSynergyAdapter("thunderStride",{
    desc:"Phong Lôi Bộ tự mở khi có Bộ Pháp Chấn + Lôi Kích. Mỗi Chấn Sóng Bộ Pháp thực sự gây sát thương sẽ gọi thêm một tia Sét Chain gây 8 / 14 / 22 sát thương theo Rank Lôi Kích. Tia phụ không tự tính thêm quãng đường và không bạo kích."
  });
  chainSkillBehavior("strideShock",{
    onDamageDealt:({fighter,other,meta,totalDamage,dealDamage,emit})=>{
      if(!root.hasDuelSynergy(fighter,"thunderStride")||totalDamage<=0||meta?.source!=="strideShock"||!other||other.hp<=0)return;
      const lightningRank=rank(fighter.build,"lightning");
      dealDamage(fighter,other,at([8,14,22],lightningRank),{source:"thunderStride",elemental:true,chain:true,canCrit:false,dodgeable:false,reactive:false});
      emit("cast",{side:fighter.side,skill:"thunderStride",x:other.x,y:other.y-100});
    }
  });

  root.registerDuelSynergyAdapter("sealedSoul",{
    desc:"Phong Hồn Tử Ấn tự mở khi có Trói Hồn + Tử Ấn. Mỗi Trói Hồn thực sự gây sát thương sẽ đặt một Tử Ấn rút gọn 3 giây nếu mục tiêu chưa có Ấn của bạn; nếu Ấn của bạn đang hoạt động, kéo dài Ấn thêm 1,5 giây. Bonus sát thương của Ấn dùng đúng Rank Tử Ấn hiện tại."
  });
  chainSkillBehavior("soulBind",{
    onDamageDealt:({round,fighter,other,meta,totalDamage,emit})=>{
      if(!root.hasDuelSynergy(fighter,"sealedSoul")||totalDamage<=0||meta?.source!=="soulBind"||!other||other.hp<=0)return;
      const markRank=rank(fighter.build,"deathMark"),bonus=root.DUEL_D6A_VALUES?.deathMark?.bonus?.[markRank-1]||0;
      const current=other.duelEffects?.deathMark;
      if(current&&current.source===fighter.side&&current.until>round.time)current.until+=1.5;
      else other.duelEffects.deathMark={source:fighter.side,until:round.time+3,bonus};
      const mark=other.duelEffects.deathMark;
      emit("status",{side:other.side,status:"sealedSoul",x:other.x,y:other.y-82,duration:Math.max(0,mark.until-round.time)});
    }
  });

  root.registerDuelSynergyAdapter("heavenfallBurn",{
    desc:"Thiên Hỏa Tinh Vẫn tự mở khi có Tinh Vẫn + Thiêu Đốt. Mỗi Tinh Vẫn thực sự gây sát thương sẽ đồng thời đặt Thiêu Đốt chuẩn của Rank hiện tại trong 3 giây, ngoài burn riêng 2 giây của Tinh Vẫn. Tái áp dụng làm mới thời gian; DPS lấy đúng giá trị Thiêu Đốt Duel."
  });
  {
    const base=root.getDuelSkillBehavior("meteorSeal")||{};
    const previous=base.update;
    root.registerDuelSkillBehavior("meteorSeal",{...base,update:context=>{
      const {round,fighter,other}=context;
      const eventStart=round.events.length;
      if(typeof previous==="function")previous(context);
      if(!root.hasDuelSynergy(fighter,"heavenfallBurn")||!other||other.hp<=0)return;
      const hit=round.events.slice(eventStart).some(event=>event.type==="hit"&&event.source==="meteorSeal"&&event.target===other.side&&(event.amount>0||event.shieldDamage>0));
      if(!hit)return;
      const burnRank=rank(fighter.build,"burn"),dps=root.DUEL_SKILL_VALUES?.burn?.dps?.[burnRank-1]||0;
      if(dps<=0)return;
      other.statuses.burnUntil=Math.max(other.statuses.burnUntil||0,round.time+3);
      other.statuses.burnDps=Math.max(other.statuses.burnDps||0,dps);
      other.statuses.burnSource=fighter.side;
      other.statuses.burnTickTimer=Math.min(other.statuses.burnTickTimer||.5,.5);
      round.events.push({type:"status",t:round.time,side:other.side,status:"heavenfallBurn",x:other.x,y:other.y-76,duration:3,dps});
    }});
  }

  root.registerDuelSynergyAdapter("guardianRetaliation",{
    desc:"Hộ Pháp Phản Chấn tự mở khi có Hộ Pháp Mộc Nhân + Phản Chấn. Khi Hộ Pháp thực sự hấp thụ sát thương và đối thủ ở trong 150px, nếu Phản Chấn đang sẵn sàng thì gây ngay 10 / 16 / 24 sát thương theo Rank Phản Chấn và bắt đầu hồi chiêu Phản Chấn bình thường. Mỗi đòn chỉ kích tối đa một lần."
  });
  {
    const base=root.getDuelSkillBehavior("guardianIdol")||{};
    const previous=base.modifyIncomingDamage;
    root.registerDuelSkillBehavior("guardianIdol",{...base,modifyIncomingDamage:context=>{
      const {fighter,attacker,dealDamage,emit}=context;
      const guardian=fighter.duelEffects.guardianIdol;
      const beforeHp=guardian?.hp||0;
      let value=context.value;
      if(typeof previous==="function"){
        const next=previous({...context,value});
        if(Number.isFinite(next))value=next;
      }
      const afterHp=fighter.duelEffects.guardianIdol?.hp||0,absorbed=Math.max(0,beforeHp-afterHp);
      if(!root.hasDuelSynergy(fighter,"guardianRetaliation")||absorbed<=0||!attacker||attacker.hp<=0||Math.abs(attacker.x-fighter.x)>150)return value;
      if((fighter.skillTimers.retaliate??0)>0)return value;
      const retaliationRank=rank(fighter.build,"retaliate"),cooldown=root.DUEL_D6A_VALUES?.retaliate?.cooldown?.[retaliationRank-1]||1,damage=root.DUEL_D6A_VALUES?.retaliate?.damage?.[retaliationRank-1]||0;
      fighter.skillTimers.retaliate=cooldown;
      if(damage>0)dealDamage(fighter,attacker,damage,{source:"guardianRetaliation",area:true,canCrit:false,dodgeable:false,reactive:false});
      emit("area",{side:fighter.side,skill:"guardianRetaliation",x:fighter.x,y:fighter.y-34,radius:150,absorbed});
      return value;
    }});
  }

  root.DUEL_C2D_SYNERGY_IDS=["bloodSymbiosis","nourishingPearls","thunderStride","sealedSoul","heavenfallBurn","guardianRetaliation"];
})();