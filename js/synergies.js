const SYNERGIES={
  thermalShock:{id:"thermalShock",name:"Sốc Nhiệt",icon:"🌡️",requires:{skills:["fire","frost"]},desc:"Sát thương Fire lên mục tiêu đang bị Hàn Khí có thể gây nổ phụ."},
  bloodConductor:{id:"bloodConductor",name:"Huyết Dẫn Lôi",icon:"🩸⚡",requires:{skills:["blood","lightning"]},desc:"Hồi máu tích điện; đủ điện sẽ phóng sét."},
  arcCollector:{id:"arcCollector",name:"Thu Lôi",icon:"🧲⚡",requires:{skills:["magnet","lightning"]},desc:"Thu thập XP tích điện thêm cho các hiệu ứng Lightning."},
  explosiveBlades:{id:"explosiveBlades",name:"Bạo Kiếm",icon:"🗡️💥",requires:{skills:["orbit","explosive"]},desc:"Phi kiếm có cơ hội phát nổ khi chạm mục tiêu."},
  toxicFlame:{id:"toxicFlame",name:"Độc Hỏa",icon:"🔥☠️",requires:{skills:["poison","burn"]},desc:"Mục tiêu vừa cháy vừa độc nhận các vụ nổ độc-hỏa nhỏ."},
  stormVolley:{id:"stormVolley",name:"Lôi Tiễn",icon:"🏹⚡",requires:{skills:["multishot","lightning"]},desc:"Đạn thường có cơ hội dẫn một tia sét sang mục tiêu khác."},
  soulFurnace:{id:"soulFurnace",name:"Lò Luyện Hồn",icon:"👁️🩸",requires:{skills:["soulHarvest","blood"]},desc:"Thực Hồn đồng thời tăng hồi phục khi tích đủ hồn.",unlock:()=>{player.regen+=.45;}},
  timeLoop:{id:"timeLoop",name:"Vòng Lặp Thời Gian",icon:"♾️",requires:{skills:["timeEcho","overclock"]},desc:"Tăng mạnh cơ hội skill định kỳ kích hoạt thêm lần nữa."}
};

const EVOLUTIONS={
  heavenfire:{id:"heavenfire",base:"fire",name:"Thiên Hỏa",icon:"☀️",requires:{tags:{FIRE:3,EXPLOSION:1}},desc:"Hỏa Cầu Lv tối đa tách thành ba thiên hỏa cùng lúc."},
  stormNetwork:{id:"stormNetwork",base:"lightning",name:"Thiên Lôi Võng",icon:"⚡",requires:{tags:{LIGHTNING:3,CHAIN:2}},desc:"Lôi Kích đánh thêm mục tiêu và tạo mạng sét dày hơn."},
  swordDomain:{id:"swordDomain",base:"orbit",name:"Kiếm Vực",icon:"⚔️",requires:{tags:{SUMMON:3}},desc:"Phi kiếm tăng số lượng, bán kính và sát thương."},
  plagueTide:{id:"plagueTide",base:"poison",name:"Dịch Triều",icon:"🦠",requires:{tags:{DOT:2,KILL:2}},desc:"Kẻ địch chết khi đang nhiễm độc sẽ phát tán độc sang mục tiêu gần."}
};

function setupSynergyHooks(){
  onSkillEvent("hit",payload=>{
    const {enemy,meta}=payload;
    if(!enemy||enemy.dead||meta?.allowProcs===false)return;
    const tags=meta?.tags||[];

    if(hasSynergy("thermalShock")&&enemy.chilled&&tags.includes("FIRE")&&Math.random()<.34){
      damageAreaAt(enemy.x,enemy.y,48*player.areaMultiplier,8+skillLevel("fire")*3,{source:"thermalShock",tags:["FIRE","ICE","EXPLOSION"],allowProcs:false},10);
    }

    if(hasSynergy("explosiveBlades")&&meta?.source==="orbit"&&Math.random()<.24){
      damageAreaAt(enemy.x,enemy.y,44*player.areaMultiplier,7+skillLevel("orbit")*3,{source:"explosiveBlades",tags:["SUMMON","EXPLOSION"],allowProcs:false},8);
    }

    if(hasSynergy("toxicFlame")&&enemy.statuses?.poison&&enemy.statuses?.burn&&(enemy.toxicFlameAt===undefined||state.t-enemy.toxicFlameAt>.65)){
      enemy.toxicFlameAt=state.t;
      damageAreaAt(enemy.x,enemy.y,38*player.areaMultiplier,5+skillLevel("poison")+skillLevel("burn"),{source:"toxicFlame",tags:["FIRE","POISON","EXPLOSION"],allowProcs:false},5);
    }

    if(hasSynergy("stormVolley")&&meta?.source==="normal"&&Math.random()<.16){
      const target=findNearestEnemyFrom(enemy.x,enemy.y,new Set([enemy]),180);
      if(target)hitEnemy(target,5+skillLevel("lightning")*4,0,{source:"stormVolley",tags:["PROJECTILE","LIGHTNING","CHAIN"],allowProcs:false});
    }
  });

  onSkillEvent("heal",payload=>{
    if(!hasSynergy("bloodConductor"))return;
    skillRuntime.counters.bloodConduct=(skillRuntime.counters.bloodConduct||0)+payload.amount;
    if(skillRuntime.counters.bloodConduct>=8&&(skillRuntime.cooldowns.bloodConduct||0)<=state.t){
      skillRuntime.counters.bloodConduct-=8;
      skillRuntime.cooldowns.bloodConduct=state.t+.45;
      const targets=getNearestEnemies(Math.min(4,1+skillLevel("lightning")));
      for(const enemy of targets)hitEnemy(enemy,6+skillLevel("lightning")*4,0,{source:"bloodConductor",tags:["BLOOD","LIGHTNING","CHAIN"],allowProcs:false});
    }
  });

  onSkillEvent("xp_collected",payload=>{
    if(!hasSynergy("arcCollector"))return;
    skillRuntime.counters.arcCollector=(skillRuntime.counters.arcCollector||0)+payload.baseAmount;
    if(skillRuntime.counters.arcCollector>=10){
      skillRuntime.counters.arcCollector-=10;
      const targets=getNearestEnemies(3+Math.min(2,skillLevel("lightning")));
      for(const enemy of targets)hitEnemy(enemy,5+skillLevel("lightning")*3,0,{source:"arcCollector",tags:["XP","LIGHTNING","CHAIN"],allowProcs:false});
    }
  });

  onSkillEvent("kill",payload=>{
    if(hasEvolution("plagueTide")&&payload.enemy?.statuses?.poison){
      const targets=getNearestEnemiesFrom(payload.enemy.x,payload.enemy.y,3,new Set([payload.enemy]),150);
      for(const target of targets)applyPoison(target,5+skillLevel("poison")*2.2,4.5);
    }
  });
}

setupSynergyHooks();
