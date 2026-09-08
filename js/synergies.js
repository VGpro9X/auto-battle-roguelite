const SYNERGIES={
  thermalShock:{id:"thermalShock",name:"Sốc Nhiệt",icon:"🌡️",requires:{skills:["fire","frost"]},desc:"Fire đánh vào mục tiêu đang lạnh có thể gây nổ phụ."},
  bloodConductor:{id:"bloodConductor",name:"Huyết Dẫn Lôi",icon:"🩸⚡",requires:{skills:["blood","lightning"]},desc:"Hồi máu tích điện; đủ điện sẽ phóng sét."},
  arcCollector:{id:"arcCollector",name:"Thu Lôi",icon:"🧲⚡",requires:{skills:["magnet","lightning"]},desc:"Thu XP tích điện để phóng thêm Lightning."},
  explosiveBlades:{id:"explosiveBlades",name:"Bạo Kiếm",icon:"🗡️💥",requires:{skills:["orbit","explosive"]},desc:"Phi kiếm có cơ hội phát nổ khi chạm mục tiêu."},
  toxicFlame:{id:"toxicFlame",name:"Độc Hỏa",icon:"🔥☠️",requires:{skills:["poison","burn"]},desc:"Mục tiêu vừa cháy vừa độc phát nổ độc-hỏa theo nhịp."},
  stormVolley:{id:"stormVolley",name:"Lôi Tiễn",icon:"🏹⚡",requires:{skills:["multishot","lightning"]},desc:"Đạn thường có cơ hội dẫn sét sang mục tiêu khác."},
  soulFurnace:{id:"soulFurnace",name:"Lò Luyện Hồn",icon:"👁️🩸",requires:{skills:["soulHarvest","blood"]},desc:"Thực Hồn đồng thời tăng hồi phục nền.",unlock:()=>{player.regen+=.45;}},
  timeLoop:{id:"timeLoop",name:"Vòng Lặp Thời Gian",icon:"♾️",requires:{skills:["timeEcho","overclock"]},desc:"Tăng mạnh cơ hội skill định kỳ kích hoạt thêm lần nữa."},

  frozenExecution:{id:"frozenExecution",name:"Hàn Sát",icon:"🥶🗡️",requires:{skills:["frostbite","execution"]},desc:"Mục tiêu đang lạnh và thấp máu nhận thêm 25% sát thương."},
  crimsonFortress:{id:"crimsonFortress",name:"Huyết Thành",icon:"🩸🏰",requires:{skills:["bloodShield","barrier"]},desc:"Hồi máu tạo thêm khiên; khiên từ kill cũng mạnh hơn."},
  plagueLightning:{id:"plagueLightning",name:"Lôi Độc",icon:"☠️🌩️",requires:{skills:["conductiveVenom","lightning"]},desc:"Tick độc dẫn sét mạnh hơn và có thể đánh hai mục tiêu."},
  combustionChain:{id:"combustionChain",name:"Liên Hoàn Hỏa Táng",icon:"🔥🧨",requires:{skills:["combustion","corpseBurst"]},desc:"Xác đang cháy nổ mạnh hơn, dễ tạo chuỗi nổ."},
  echoBarrage:{id:"echoBarrage",name:"Vạn Ảnh Tiễn",icon:"🏹♾️",requires:{skills:["echoShot","multishot"]},desc:"Ảnh Xạ sao chép cả loạt multishot thay vì chỉ một viên."},
  glassBlood:{id:"glassBlood",name:"Huyết Kính",icon:"🔮🩸",requires:{skills:["glassCannon","vampiricTouch"]},desc:"Dưới nửa HP, Huyết Chạm hồi gấp đôi."},
  gravityNova:{id:"gravityNova",name:"Trọng Lực Bạo",icon:"🕳️💫",requires:{skills:["blackHole","nova"]},desc:"Linh Bạo kéo mục tiêu về tâm trước khi nổ."},
  markedBounty:{id:"markedBounty",name:"Săn Ấn",icon:"☯️💰",requires:{skills:["deathMark","bountyMark"]},desc:"Mục tiêu có ấn rơi nhiều XP hơn và ấn lan ổn định hơn."},
  elementalChaos:{id:"elementalChaos",name:"Ngũ Hành Hỗn Mang",icon:"🌈🌀",requires:{skills:["chaosOrb","elementalMastery"]},desc:"Mỗi lần Hỗn Mang kích hoạt sẽ tung thêm một biến thể nguyên tố."},
  soulAegis:{id:"soulAegis",name:"Hồn Thuẫn",icon:"👁️🛡️",requires:{skills:["soulHarvest","bloodShield"]},desc:"Mỗi kill nuôi hồn đồng thời bồi thêm một lớp khiên nhỏ."},
  criticalStorm:{id:"criticalStorm",name:"Bạo Lôi",icon:"🎯⚡",requires:{skills:["crit","lightning"]},desc:"Lightning có thể tạo thêm phần sát thương chí mạng theo Crit Chance."},
  lastBreath:{id:"lastBreath",name:"Hồi Quang",icon:"🪽🚨",requires:{skills:["lastStand","secondWind"]},desc:"Khi hồi sinh, phát nổ và nhận một lớp khiên lớn."}
};

const EVOLUTIONS={
  heavenfire:{id:"heavenfire",base:"fire",name:"Thiên Hỏa",icon:"☀️",requires:{tags:{FIRE:3,EXPLOSION:1}},desc:"Hỏa Cầu max tách thành ba thiên hỏa cùng lúc."},
  stormNetwork:{id:"stormNetwork",base:"lightning",name:"Thiên Lôi Võng",icon:"⚡",requires:{tags:{LIGHTNING:3,CHAIN:2}},desc:"Lôi Kích max đánh thêm mục tiêu và tạo mạng sét dày hơn."},
  swordDomain:{id:"swordDomain",base:"orbit",name:"Kiếm Vực",icon:"⚔️",requires:{tags:{SUMMON:3}},desc:"Phi kiếm max tăng số lượng, bán kính và sát thương."},
  plagueTide:{id:"plagueTide",base:"poison",name:"Dịch Triều",icon:"🦠",requires:{tags:{DOT:2,KILL:2}},desc:"Kẻ địch chết khi nhiễm độc sẽ phát tán độc sang mục tiêu gần."},
  crimsonMoon:{id:"crimsonMoon",base:"blood",name:"Huyết Nguyệt",icon:"🌙🩸",requires:{tags:{BLOOD:3,HEAL:2,KILL:2}},desc:"Huyết Khí max hồi mạnh hơn nhiều và mỗi kill còn tạo chút khiên."},
  singularity:{id:"singularity",base:"blackHole",name:"Kỳ Điểm",icon:"🌑",requires:{tags:{CONTROL:3,AREA:2}},desc:"Hắc Vực max kéo mạnh hơn, rộng hơn và gây nhiều sát thương."},
  chaosCrown:{id:"chaosCrown",base:"chaosOrb",name:"Hỗn Mang Vương Miện",icon:"👑🌀",requires:{tags:{RANDOM:2,ELEMENTAL:3}},desc:"Quả Cầu Hỗn Mang max tung ba biến thể mỗi lần kích hoạt."},
  immortalAegis:{id:"immortalAegis",base:"barrier",name:"Bất Diệt Thuẫn",icon:"🛡️✨",requires:{tags:{SHIELD:3,DEFENSE:4}},desc:"Hộ Thể max tạo lượng khiên gần gấp đôi mỗi chu kỳ."}
};

function setupSynergyHooks(){
  onSkillEvent("hit",payload=>{
    const {enemy,meta}=payload;
    if(!enemy||enemy.dead||meta?.allowProcs===false)return;
    const tags=meta?.tags||[];

    if(hasSynergy("thermalShock")&&enemy.chilled&&tags.includes("FIRE")&&Math.random()<.34){
      damageAreaAt(enemy.x,enemy.y,48*player.areaMultiplier,8+skillLevel("fire")*3,{source:"thermalShock",tags:["FIRE","ICE","EXPLOSION","AREA"],allowProcs:false},10);
    }
    if(hasSynergy("explosiveBlades")&&meta?.source==="orbit"&&Math.random()<.24){
      damageAreaAt(enemy.x,enemy.y,44*player.areaMultiplier,7+skillLevel("orbit")*3,{source:"explosiveBlades",tags:["SUMMON","EXPLOSION","AREA"],allowProcs:false},8);
    }
    if(hasSynergy("toxicFlame")&&enemy.statuses?.poison&&enemy.statuses?.burn&&(enemy.toxicFlameAt===undefined||state.t-enemy.toxicFlameAt>.65)){
      enemy.toxicFlameAt=state.t;
      damageAreaAt(enemy.x,enemy.y,38*player.areaMultiplier,5+skillLevel("poison")+skillLevel("burn"),{source:"toxicFlame",tags:["FIRE","POISON","EXPLOSION","AREA"],allowProcs:false},5);
    }
    if(hasSynergy("stormVolley")&&meta?.source==="normal"&&Math.random()<.16){
      const target=findNearestEnemyFrom(enemy.x,enemy.y,new Set([enemy]),180);
      if(target)hitEnemy(target,5+skillLevel("lightning")*4,0,{source:"stormVolley",tags:["PROJECTILE","LIGHTNING","CHAIN"],allowProcs:false});
    }
    if(hasSynergy("gravityNova")&&meta?.source==="nova"){
      const dx=player.x-enemy.x,dy=player.y-enemy.y,m=Math.hypot(dx,dy)||1;
      enemy.x+=dx/m*22;enemy.y+=dy/m*22;
    }
  });

  onSkillEvent("heal",payload=>{
    if(hasSynergy("bloodConductor")){
      skillRuntime.counters.bloodConduct=(skillRuntime.counters.bloodConduct||0)+payload.amount;
      if(skillRuntime.counters.bloodConduct>=8&&(skillRuntime.cooldowns.bloodConduct||0)<=state.t){
        skillRuntime.counters.bloodConduct-=8;skillRuntime.cooldowns.bloodConduct=state.t+.45;
        const targets=getNearestEnemies(Math.min(4,1+skillLevel("lightning")));
        for(const enemy of targets)hitEnemy(enemy,6+skillLevel("lightning")*4,0,{source:"bloodConductor",tags:["BLOOD","LIGHTNING","CHAIN"],allowProcs:false});
      }
    }
    if(hasSynergy("crimsonFortress"))addShield(payload.amount*.55);
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

  onSkillEvent("periodic",payload=>{
    if(hasSynergy("elementalChaos")&&payload.skillKey==="chaosOrb"){
      const enemy=randomEnemy();if(enemy)fireChaosOrb(enemy,skillLevel("chaosOrb"));
    }
  });

  onSkillEvent("kill",payload=>{
    if(hasEvolution("plagueTide")&&payload.enemy?.statuses?.poison){
      const targets=getNearestEnemiesFrom(payload.enemy.x,payload.enemy.y,3,new Set([payload.enemy]),150);
      for(const target of targets)applyPoison(target,5+skillLevel("poison")*2.2,4.5);
    }
    if(hasSynergy("soulAegis")&&skillLevel("soulHarvest"))addShield(.55+skillLevel("soulHarvest")*.25);
  });

  onSkillEvent("revive",()=>{
    if(!hasSynergy("lastBreath"))return;
    addShield(player.maxHp*.28);
    damageAreaAt(player.x,player.y,150*player.areaMultiplier,35+player.level*2,{source:"lastBreath",tags:["LOW_HP","EXPLOSION","AREA"],allowProcs:false},40);
  });
}

setupSynergyHooks();
