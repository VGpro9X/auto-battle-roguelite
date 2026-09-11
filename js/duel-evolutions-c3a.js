(()=>{
  const root=typeof window!=="undefined"?window:globalThis;
  if(typeof root.registerDuelEvolutionAdapter!=="function"||typeof root.registerDuelSkillBehavior!=="function")return;
  const VALUE_HOOKS=new Set(["modifyOutgoingDamage","modifyTargetArmor","modifyIncomingDamage","modifyMoveMultiplier","modifyBasicAttackCooldown"]);
  function chainSkillBehavior(key,extension){
    const base=(typeof root.getDuelSkillBehavior==="function"&&root.getDuelSkillBehavior(key))||{},merged={...base};
    for(const [hook,fn] of Object.entries(extension||{})){
      const previous=base[hook];
      if(VALUE_HOOKS.has(hook))merged[hook]=context=>{let value=context.value;if(typeof previous==="function"){const next=previous({...context,value});if(Number.isFinite(next))value=next;}const next=fn({...context,value});return Number.isFinite(next)?next:value;};
      else merged[hook]=context=>{if(typeof previous==="function")previous(context);return fn(context);};
    }
    root.registerDuelSkillBehavior(key,merged);
  }
  function at(values,r){return values[Math.max(0,Math.min(values.length-1,r-1))];}
  function rank(build,key){return typeof root.getDuelSkillRank==="function"?root.getDuelSkillRank(build,key):Math.max(0,Math.min(3,Number(build?.[key]||0)));}
  function evoEffects(fighter){return fighter.duelEvolutionEffects||(fighter.duelEvolutionEffects={});}

  root.registerDuelEvolutionAdapter("heavenfire",{
    desc:"Hỏa Cầu Rank III + đủ điều kiện Hỏa/Nổ tự mở Thiên Hỏa. Mỗi Hỏa Cầu thực sự gây sát thương gọi thêm 2 thiên hỏa phụ, mỗi viên gây 50% sát thương Hỏa Cầu Rank III. Hai viên phụ không tự kích hoạt lại hiệu ứng on-hit.",
  });
  chainSkillBehavior("fire",{
    onDamageDealt:({fighter,other,meta,totalDamage,dealDamage,emit})=>{
      if(!root.hasDuelEvolution(fighter,"heavenfire")||meta?.source!=="fire"||totalDamage<=0||!other||other.hp<=0)return;
      const damage=(root.DUEL_SKILL_VALUES?.fire?.damage?.[2]||38)*.50;
      for(let i=0;i<2&&other.hp>0;i++)dealDamage(fighter,other,damage,{source:"heavenfire",elemental:true,projectile:true,canCrit:false,dodgeable:false,reactive:false});
      emit("cast",{side:fighter.side,skill:"heavenfire",x:other.x,y:other.y-106,count:2});
    }
  });

  root.registerDuelEvolutionAdapter("stormNetwork",{
    desc:"Lôi Kích Rank III + đủ LIGHTNING/CHAIN tự mở Thiên Lôi Võng. Mỗi Lôi Kích thực sự gây sát thương tạo thêm 2 nhánh lôi võng lên cùng đối thủ; mỗi nhánh gây 35% sát thương Lôi Kích Rank III và được tính là Chain.",
  });
  chainSkillBehavior("lightning",{
    onDamageDealt:({fighter,other,meta,totalDamage,dealDamage,emit})=>{
      if(!root.hasDuelEvolution(fighter,"stormNetwork")||meta?.source!=="lightning"||totalDamage<=0||!other||other.hp<=0)return;
      const damage=(root.DUEL_SKILL_VALUES?.lightning?.damage?.[2]||42)*.35;
      for(let i=0;i<2&&other.hp>0;i++)dealDamage(fighter,other,damage,{source:"stormNetwork",elemental:true,chain:true,canCrit:false,dodgeable:false,reactive:false});
      emit("cast",{side:fighter.side,skill:"stormNetwork",x:other.x,y:other.y-112,count:2});
    }
  });

  root.registerDuelEvolutionAdapter("swordDomain",{
    desc:"Phi Kiếm Rank III + đủ SUMMON tự mở Kiếm Vực. Ngoài nhịp Phi Kiếm gốc, Kiếm Vực quét một vùng 150px quanh đấu sĩ mỗi 0,55 giây; nếu đối thủ ở trong vùng sẽ chịu 7 sát thương Summon. Kiếm Vực không hoạt động khi chủ thể đang hit-stun.",
  });
  chainSkillBehavior("orbit",{
    onCreate:({fighter})=>{evoEffects(fighter).swordDomainTimer=.55;},
    update:({fighter,other,dt,dealDamage,emit})=>{
      if(!root.hasDuelEvolution(fighter,"swordDomain")||!other||other.hp<=0||fighter.hitStun>0)return;
      const state=evoEffects(fighter);state.swordDomainTimer=(state.swordDomainTimer??.55)-dt;
      if(state.swordDomainTimer>0)return;state.swordDomainTimer+=.55;
      emit("area",{side:fighter.side,skill:"swordDomain",x:fighter.x,y:fighter.y-35,radius:150});
      if(Math.abs(other.x-fighter.x)<=150)dealDamage(fighter,other,7,{source:"swordDomain",summon:true,area:true,canCrit:false,dodgeable:false,reactive:false});
    }
  });

  root.registerDuelEvolutionAdapter("plagueTide",{
    desc:"Độc Tố Rank III + đủ DOT/KILL tự mở Dịch Triều. Trong 1v1 không có mục tiêu chết để lây lan: khi Độc Tố của bạn còn hoạt động, cứ mỗi 1 giây Dịch Triều gây thêm 7 sát thương Độc Area. Nhịp phụ không tự kích hoạt phản ứng on-hit.",
  });
  chainSkillBehavior("poison",{
    onCreate:({fighter})=>{evoEffects(fighter).plagueTideTimer=1;},
    update:({round,fighter,other,dt,dealDamage,emit})=>{
      if(!root.hasDuelEvolution(fighter,"plagueTide")||!other||other.hp<=0)return;
      const poison=other.duelEffects?.poison;
      if(!poison||poison.source!==fighter.side||poison.until<=round.time){evoEffects(fighter).plagueTideTimer=1;return;}
      const state=evoEffects(fighter);state.plagueTideTimer-=dt;
      if(state.plagueTideTimer>0)return;state.plagueTideTimer+=1;
      dealDamage(fighter,other,7,{source:"plagueTide",elemental:true,area:true,canCrit:false,dodgeable:false,reactive:false});
      emit("area",{side:fighter.side,skill:"plagueTide",x:other.x,y:other.y-34,radius:74});
    }
  });

  root.registerDuelEvolutionAdapter("crimsonMoon",{
    desc:"Huyết Khí Rank III + đủ BLOOD/HEAL/KILL tự mở Huyết Nguyệt. Mỗi lần Huyết Khí thực sự hồi HP, Huyết Nguyệt hồi thêm 50% lượng hồi thực tế đó và tạo 4 khiên. Hồi/khiên vẫn chịu luật HUYẾT CHIẾN/TỬ CHIẾN.",
  });
  {
    const base=root.getDuelSkillBehavior("blood")||{},previous=base.onDamageDealt;
    root.registerDuelSkillBehavior("blood",{...base,onDamageDealt:context=>{
      const {fighter,heal,addShield}=context,before=fighter.totalHealing||0;
      if(typeof previous==="function")previous(context);
      if(!root.hasDuelEvolution(fighter,"crimsonMoon"))return;
      const gained=Math.max(0,(fighter.totalHealing||0)-before);
      if(gained<=0)return;heal(fighter,gained*.50,"crimsonMoon");addShield(fighter,4,"crimsonMoon");
    }});
  }

  root.registerDuelEvolutionAdapter("singularity",{
    desc:"Hắc Vực Rank III + đủ CONTROL/AREA tự mở Kỳ Điểm. Mỗi lần Hắc Vực thật sự kích hoạt, Kỳ Điểm gây thêm 20 sát thương Area và kéo đối thủ thêm 70px về phía bạn sau lực kéo gốc. Không có hồi chiêu ẩn riêng.",
  });
  {
    const base=root.getDuelSkillBehavior("blackHole")||{},previous=base.update;
    root.registerDuelSkillBehavior("blackHole",{...base,update:context=>{
      const {round,fighter,other,dealDamage,knockback,emit}=context,eventStart=round.events.length;
      if(typeof previous==="function")previous(context);
      if(!root.hasDuelEvolution(fighter,"singularity")||!other||other.hp<=0)return;
      const triggered=round.events.slice(eventStart).some(e=>e.type==="area"&&e.skill==="blackHole"&&e.side===fighter.side);if(!triggered)return;
      dealDamage(fighter,other,20,{source:"singularity",area:true,canCrit:false,dodgeable:false,reactive:false});
      const direction=other.x>=fighter.x?-1:1;knockback(other,70,direction);
      emit("area",{side:fighter.side,skill:"singularity",x:fighter.x,y:fighter.y-36,radius:170});
    }});
  }

  root.DUEL_C3A_EVOLUTION_IDS=["heavenfire","stormNetwork","swordDomain","plagueTide","crimsonMoon","singularity"];
})();