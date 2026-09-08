const skills={
  rapid:{name:"Nhanh Tay",icon:"⚡",max:6,tags:["ATTACK","TIME"],desc:()=>"Giảm 12% thời gian giữa các đòn đánh thường.",apply:()=>{player.attackCd*=.88;}},
  power:{name:"Cường Kích",icon:"💥",max:6,tags:["ATTACK","DAMAGE"],desc:()=>"Tăng thêm 4 sát thương cơ bản.",apply:()=>{player.damage+=4;}},
  vitality:{name:"Sinh Lực",icon:"❤️",max:6,tags:["DEFENSE","HP"],desc:()=>"Tăng 18 HP tối đa và hồi ngay 18 HP.",apply:()=>{player.maxHp+=18;player.hp=Math.min(player.maxHp,player.hp+18);}},
  speed:{name:"Thân Pháp",icon:"💨",max:5,tags:["MOVEMENT"],desc:()=>"Tăng 8% tốc độ di chuyển.",apply:()=>{player.speed*=1.08;}},

  fire:{
    name:"Hỏa Cầu Định Kỳ",icon:"🔥",max:6,tags:["FIRE","ELEMENTAL","PROJECTILE","PERIODIC"],
    desc:level=>`Mỗi ${Math.max(1.2,3-.25*(level-1)).toFixed(2)} giây bắn hỏa cầu, gây ${Math.round(22*(1+.28*(level-1)))} sát thương.`,
    apply:()=>{},
    periodic:{
      cooldown:level=>Math.max(1.2,3-.25*(level-1)),
      execute:level=>{
        const enemy=randomEnemy(); if(!enemy)return false;
        const count=hasEvolution("heavenfire")?3:1;
        for(let i=0;i<count;i++){
          const angle=Math.atan2(enemy.y-player.y,enemy.x-player.x)+(i-(count-1)/2)*.20;
          createProjectile(angle,22*(1+.28*(level-1)),300,7,"fire",0,{source:"fire",tags:["FIRE","PROJECTILE","PERIODIC"]});
        }
        return true;
      }
    }
  },
  knock:{
    name:"Chấn Khí",icon:"🌪️",max:6,tags:["CONTROL","PERIODIC"],
    desc:level=>`Mỗi ${Math.max(.45,1.4-.15*(level-1)).toFixed(2)} giây đẩy lùi một kẻ địch và gây ${Math.round(10*(1+.25*(level-1)))} sát thương.`,
    apply:()=>{},
    periodic:{cooldown:level=>Math.max(.45,1.4-.15*(level-1)),execute:level=>{const enemy=randomEnemy();if(!enemy)return false;hitEnemy(enemy,10*(1+.25*(level-1)),60+level*8,{source:"knock",tags:["CONTROL","PERIODIC"]});return true;}}
  },
  orbit:{name:"Phi Kiếm Hộ Thể",icon:"🗡️",max:5,tags:["SUMMON","MELEE","CONTROL"],desc:level=>`Triệu hồi ${level} phi kiếm xoay quanh nhân vật.`,apply:()=>{}},
  heal:{name:"Hồi Linh",icon:"✨",max:5,tags:["HEAL","DEFENSE"],desc:()=>"Hồi thêm 0.6 HP mỗi giây.",apply:()=>{player.regen+=.6;}},
  armor:{name:"Hộ Giáp",icon:"🛡️",max:5,tags:["DEFENSE"],desc:()=>"Giảm thêm 5% sát thương nhận vào.",apply:()=>{player.armor=clamp(player.armor+.05,0,.6);}},
  magnet:{name:"Linh Hấp",icon:"🧲",max:5,tags:["XP","MAGNET"],desc:()=>"Tăng mạnh phạm vi hút XP.",apply:()=>{player.magnet+=28;}},
  multishot:{name:"Song Tiễn",icon:"🏹",max:3,tags:["PROJECTILE","ATTACK"],desc:level=>`Đòn đánh thường bắn ${1+level} viên theo hình quạt. Mỗi viên gây 82% sát thương cơ bản.`,apply:()=>{player.extraProjectiles+=1;}},
  pierce:{name:"Xuyên Phá",icon:"🪡",max:3,tags:["PROJECTILE"],desc:level=>`Đạn đánh thường xuyên thêm ${level} kẻ địch.`,apply:()=>{player.projectilePierce+=1;}},
  crit:{name:"Bạo Kích",icon:"🎯",max:5,tags:["CRITICAL","ATTACK"],desc:level=>`Tăng tỉ lệ chí mạng thêm 7%. Hiện tại khoảng ${Math.round(level*7)}%.`,apply:()=>{player.critChance=clamp(player.critChance+.07,0,.60);}},
  lightning:{
    name:"Lôi Kích",icon:"🌩️",max:5,tags:["LIGHTNING","ELEMENTAL","CHAIN","PERIODIC"],
    desc:level=>`Mỗi ${Math.max(1.8,4-.35*(level-1)).toFixed(2)} giây sét đánh ${Math.min(5,1+level)} mục tiêu gần nhất.`,apply:()=>{},
    periodic:{cooldown:level=>Math.max(1.8,4-.35*(level-1)),execute:level=>{const bonus=hasEvolution("stormNetwork")?2:0;const targets=getNearestEnemies(Math.min(8,1+level+bonus));if(!targets.length)return false;for(const enemy of targets)hitEnemy(enemy,12+level*8,0,{source:"lightning",tags:["LIGHTNING","CHAIN","PERIODIC"]});return true;}}
  },
  nova:{
    name:"Linh Bạo",icon:"💫",max:5,tags:["EXPLOSION","AREA","PERIODIC"],
    desc:level=>`Mỗi ${Math.max(2.8,5.5-.45*(level-1)).toFixed(2)} giây phát nổ quanh người trong bán kính ${95+level*18}.`,apply:()=>{},
    periodic:{cooldown:level=>Math.max(2.8,5.5-.45*(level-1)),execute:level=>damageAreaAt(player.x,player.y,(95+level*18)*player.areaMultiplier,10+level*8,{source:"nova",tags:["EXPLOSION","AREA","PERIODIC"]},26+level*4)>0}
  },
  frost:{name:"Hàn Khí",icon:"❄️",max:5,tags:["ICE","ELEMENTAL","CONTROL","AURA"],desc:level=>`Làm chậm ${Math.min(40,level*8)}% kẻ địch trong bán kính ${90+level*18}.`,apply:()=>{}},
  blood:{name:"Huyết Khí",icon:"🩸",max:5,tags:["BLOOD","HEAL","KILL"],desc:level=>`Mỗi kẻ địch bị hạ hồi ${(.35*level).toFixed(2)} HP.`,apply:()=>{}},
  wisdom:{name:"Ngộ Tính",icon:"📘",max:5,tags:["XP"],desc:level=>`Nhận thêm ${level*15}% kinh nghiệm từ tinh thể XP.`,apply:()=>{player.xpMultiplier+=.15;}},

  ricochet:{name:"Nảy Đạn",icon:"↗️",max:4,tags:["PROJECTILE","CHAIN"],desc:level=>`Đạn đánh thường có thể nảy sang thêm ${level} mục tiêu.`,apply:()=>{player.projectileRicochet+=1;}},
  explosive:{name:"Đạn Nổ",icon:"💣",max:5,tags:["PROJECTILE","EXPLOSION","HIT"],desc:level=>`Đạn có ${10+level*5}% cơ hội phát nổ khi trúng, gây sát thương vùng.`,apply:()=>{player.explosionChance+=.05;}},
  poison:{name:"Độc Tố",icon:"☠️",max:5,tags:["POISON","ELEMENTAL","DOT","HIT"],desc:level=>`Đòn đánh có ${18+level*6}% cơ hội gây độc trong 4 giây.`,apply:()=>{player.poisonChance+=.06;}},
  burn:{name:"Thiêu Đốt",icon:"♨️",max:5,tags:["FIRE","ELEMENTAL","DOT","HIT"],desc:level=>`Đòn đánh có ${16+level*6}% cơ hội thiêu đốt mục tiêu trong 3 giây.`,apply:()=>{player.burnChance+=.06;}},
  execution:{name:"Đoạt Mệnh",icon:"🗡️",max:5,tags:["KILL","DAMAGE","MARK"],desc:level=>`Gây thêm ${12+level*8}% sát thương lên kẻ địch dưới ${25+level*5}% HP.`,apply:()=>{}},
  berserk:{name:"Cuồng Huyết",icon:"😈",max:5,tags:["BLOOD","LOW_HP","ATTACK"],desc:level=>`Khi HP dưới 40%, tăng mạnh tốc đánh và sát thương; hiệu quả tăng theo cấp.`,apply:()=>{}},
  glassCannon:{name:"Pháo Thủy Tinh",icon:"🔮",max:4,tags:["RULE","DAMAGE","RISK"],starter:false,desc:level=>`+${level*30}% sát thương tổng nhưng mỗi cấp giảm khoảng 12% HP tối đa hiện có.`,apply:()=>{player.damageMultiplier*=1.30;player.maxHp=Math.max(25,player.maxHp*.88);player.hp=Math.min(player.hp,player.maxHp);}},
  greed:{name:"Tham Lam",icon:"🪙",max:4,tags:["RULE","XP","RISK"],starter:false,desc:level=>`+${level*20}% XP, nhưng kẻ địch sinh ra có thêm HP theo cấp kỹ năng.`,apply:()=>{player.xpMultiplier+=.20;}},
  timeEcho:{name:"Dội Thời Gian",icon:"⏪",max:5,tags:["TIME","PERIODIC","RANDOM"],desc:level=>`Skill định kỳ có ${8+level*6}% cơ hội kích hoạt thêm một lần.`,apply:()=>{}},
  retaliate:{name:"Phản Chấn",icon:"💢",max:5,tags:["DEFENSE","DAMAGE_TAKEN","EXPLOSION"],desc:level=>`Khi chịu sát thương, định kỳ phát nổ quanh người. Sát thương tăng theo cấp.`,apply:()=>{}},
  thorns:{name:"Gai Máu",icon:"🌹",max:5,tags:["DEFENSE","DAMAGE_TAKEN","BLOOD"],desc:level=>`Kẻ địch chạm vào bạn sẽ nhận phản sát thương, tối đa một lần mỗi khoảng ngắn.`,apply:()=>{}},
  barrier:{
    name:"Hộ Thể Chu Kỳ",icon:"🔵",max:5,tags:["DEFENSE","SHIELD","PERIODIC"],
    desc:level=>`Mỗi ${Math.max(4.5,8-level*.55).toFixed(2)} giây nhận ${10+level*10} khiên.`,apply:()=>{},
    periodic:{cooldown:level=>Math.max(4.5,8-level*.55),execute:level=>{addShield((10+level*10)*(hasEvolution("immortalAegis")?1.8:1));return true;}}
  },
  lastStand:{name:"Tuyệt Lộ",icon:"🚨",max:5,tags:["LOW_HP","MOVEMENT","DEFENSE"],desc:level=>`Khi HP dưới 30%, tăng ${10+level*7}% tốc chạy và giảm sát thương nhận vào.`,apply:()=>{}},
  phantomStep:{name:"Ảnh Bộ",icon:"👻",max:5,tags:["MOVEMENT","TIME","DEFENSE"],desc:level=>`Tăng ${level*4}% né tránh và 3% tốc chạy mỗi cấp.`,apply:()=>{player.dodgeChance=clamp(player.dodgeChance+.04,0,.40);player.speed*=1.03;}},
  deathMark:{
    name:"Tử Ấn",icon:"☯️",max:5,tags:["MARK","KILL","PERIODIC"],
    desc:level=>`Mỗi ${Math.max(5,10-level*.8).toFixed(1)} giây đánh dấu một mục tiêu trong 5 giây; mục tiêu nhận thêm sát thương.`,apply:()=>{},
    periodic:{cooldown:level=>Math.max(5,10-level*.8),execute:level=>{const enemy=randomEnemy();if(!enemy)return false;enemy.markedUntil=state.t+5;enemy.markPower=.12+level*.06;return true;}}
  },
  soulHarvest:{name:"Thực Hồn",icon:"👁️",max:5,tags:["SOUL","KILL","SCALING"],desc:level=>`Cứ mỗi ${Math.max(20,50-level*5)} mạng hạ gục, nhận thêm 1 sát thương cơ bản trong run.`,apply:()=>{}},
  corpseBurst:{name:"Thi Bạo",icon:"🧨",max:5,tags:["KILL","EXPLOSION"],desc:level=>`Kẻ địch chết có ${12+level*7}% cơ hội phát nổ gây sát thương quanh xác.`,apply:()=>{}},
  xpStorm:{name:"Linh Triều",icon:"🌌",max:5,tags:["XP","LIGHTNING","CHARGE"],desc:level=>`Thu thập XP tích điện; đủ điện sẽ phóng sét vào nhiều mục tiêu. Ngưỡng giảm theo cấp.`,apply:()=>{}},
  chaosOrb:{
    name:"Quả Cầu Hỗn Mang",icon:"🌀",max:5,tags:["RANDOM","PROJECTILE","PERIODIC","ELEMENTAL"],
    desc:level=>`Mỗi ${Math.max(2.2,4.5-level*.4).toFixed(1)} giây bắn một quả cầu ngẫu nhiên mang Fire / Ice / Lightning / Poison / Explosion.`,apply:()=>{},
    periodic:{cooldown:level=>Math.max(2.2,4.5-level*.4),execute:level=>{const enemy=randomEnemy();if(!enemy)return false;const count=hasEvolution("chaosCrown")?3:1;for(let i=0;i<count;i++)fireChaosOrb(randomEnemy()||enemy,level);return true;}}
  },
  fireWisp:{
    name:"Linh Hỏa",icon:"🧚",max:5,tags:["SUMMON","FIRE","ELEMENTAL","PERIODIC"],
    desc:level=>`Triệu hồi linh hỏa tự bắn mục tiêu mỗi ${Math.max(.8,2-level*.2).toFixed(1)} giây.`,apply:()=>{},
    periodic:{cooldown:level=>Math.max(.8,2-level*.2),execute:level=>{const enemy=randomEnemy();if(!enemy)return false;shoot(enemy,8+level*6,360,4,"wisp",{source:"fireWisp",tags:["SUMMON","FIRE","PROJECTILE","PERIODIC"]});return true;}}
  },
  stormTotem:{
    name:"Lôi Linh",icon:"🗿",max:5,tags:["SUMMON","LIGHTNING","ELEMENTAL","PERIODIC"],
    desc:level=>`Lôi linh định kỳ đánh ${Math.min(4,1+Math.ceil(level/2))} mục tiêu ngẫu nhiên.`,apply:()=>{},
    periodic:{cooldown:level=>Math.max(1.6,3.4-level*.28),execute:level=>{const targets=getRandomEnemies(Math.min(4,1+Math.ceil(level/2)));if(!targets.length)return false;for(const e of targets)hitEnemy(e,8+level*7,0,{source:"stormTotem",tags:["SUMMON","LIGHTNING","PERIODIC"]});return true;}}
  },
  overclock:{name:"Quá Tải Thời Gian",icon:"⏱️",max:4,tags:["TIME","PERIODIC","RISK"],starter:false,desc:level=>`Giảm ${level*10}% cooldown skill định kỳ nhưng mỗi cấp giảm 4% HP tối đa hiện tại.`,apply:()=>{player.periodicCooldownMultiplier*=.90;player.maxHp=Math.max(25,player.maxHp*.96);player.hp=Math.min(player.hp,player.maxHp);}},

  precision:{name:"Tâm Nhãn",icon:"🧿",max:4,tags:["CRITICAL","DAMAGE"],desc:level=>`Tăng ${level*18}% sát thương chí mạng cộng thêm.`,apply:()=>{player.critMultiplier+=.18;}},
  giantSlayer:{name:"Săn Cự Thú",icon:"🐘",max:5,tags:["ELITE","DAMAGE","KILL"],desc:level=>`Gây thêm ${level*12}% sát thương lên Elite.`,apply:()=>{player.eliteDamageMultiplier*=1.12;}},
  vampiricTouch:{name:"Huyết Chạm",icon:"🧛",max:5,tags:["BLOOD","HEAL","HIT"],desc:level=>`Đòn đánh có ${level*4}% cơ hội hồi ${(level*.18).toFixed(2)} HP.`,apply:()=>{player.healOnHitChance+=.04;player.healOnHitAmount+=.18;}},
  bloodShield:{name:"Huyết Thuẫn",icon:"🩸🛡️",max:5,tags:["BLOOD","SHIELD","KILL"],desc:level=>`Mỗi kill nhận ${Math.round(level*1.5)} khiên.`,apply:()=>{player.shieldOnKill+=1.5;}},
  frostbite:{name:"Hàn Thấu",icon:"🥶",max:5,tags:["ICE","DAMAGE","CONTROL"],desc:level=>`Kẻ địch đang bị lạnh nhận thêm ${level*8}% sát thương.`,apply:()=>{player.chilledDamageMultiplier*=1.08;}},
  shatter:{name:"Băng Toái",icon:"🧊💥",max:5,tags:["ICE","KILL","EXPLOSION"],desc:level=>`Kẻ địch chết khi đang bị lạnh có ${20+level*10}% cơ hội vỡ băng gây nổ.`,apply:()=>{}},
  conductiveVenom:{name:"Độc Dẫn",icon:"☠️⚡",max:5,tags:["POISON","LIGHTNING","ELEMENTAL","DOT","CHAIN"],desc:level=>`Tick độc có ${8+level*5}% cơ hội phóng điện sang mục tiêu khác.`,apply:()=>{}},
  combustion:{name:"Hỏa Táng",icon:"🔥💀",max:5,tags:["FIRE","KILL","EXPLOSION"],desc:level=>`Kẻ địch chết khi đang cháy có ${18+level*8}% cơ hội phát nổ.`,apply:()=>{}},
  echoShot:{name:"Ảnh Xạ",icon:"🏹⏪",max:5,tags:["ATTACK","TIME","PROJECTILE"],desc:level=>`Mỗi ${Math.max(2,7-level)} đòn đánh thường, bắn thêm một phát ảnh xạ.`,apply:()=>{}},
  pointBlank:{name:"Cận Sát",icon:"🎯💢",max:5,tags:["ATTACK","DAMAGE","RISK"],desc:level=>`Gây thêm tối đa ${level*12}% sát thương khi mục tiêu ở gần.`,apply:()=>{}},
  areaMastery:{name:"Khuếch Vực",icon:"⭕",max:5,tags:["AREA","EXPLOSION","SCALING"],desc:level=>`Tăng ${level*8}% bán kính và ${level*6}% sát thương vùng.`,apply:()=>{player.areaMultiplier*=1.08;player.areaDamageMultiplier*=1.06;}},
  summonMastery:{name:"Ngự Linh",icon:"🪄",max:5,tags:["SUMMON","SCALING"],desc:level=>`Tăng ${level*10}% sát thương từ summon.`,apply:()=>{player.summonDamageMultiplier*=1.10;}},
  elementalMastery:{name:"Ngũ Hành",icon:"🌈",max:5,tags:["ELEMENTAL","FIRE","ICE","LIGHTNING","POISON"],desc:level=>`Tăng ${level*8}% sát thương nguyên tố.`,apply:()=>{player.elementalDamageMultiplier*=1.08;}},
  markSpread:{name:"Ấn Lan",icon:"☯️↗️",max:5,tags:["MARK","CHAIN","KILL"],desc:level=>`Khi mục tiêu có ấn chết, ấn có thể lan sang ${Math.min(4,level)} mục tiêu gần.`,apply:()=>{}},
  shieldPulse:{name:"Thuẫn Bạo",icon:"🛡️💥",max:5,tags:["SHIELD","EXPLOSION","DAMAGE_TAKEN"],desc:level=>`Khi khiên bị phá, phát nổ quanh người gây ${8+level*8} sát thương.`,apply:()=>{}},
  xpHeal:{name:"Linh Dưỡng",icon:"💎❤️",max:5,tags:["XP","HEAL"],desc:level=>`Mỗi XP nhặt được hồi ${(level*.08).toFixed(2)} HP.`,apply:()=>{}},
  levelBurst:{name:"Phá Cảnh",icon:"⬆️💥",max:5,tags:["LEVEL_UP","EXPLOSION","AREA"],desc:level=>`Mỗi lần lên cấp, gây ${12+level*10} sát thương diện rộng quanh người.`,apply:()=>{}},
  sacrifice:{
    name:"Huyết Tế",icon:"🩸🔥",max:4,tags:["BLOOD","RISK","PERIODIC","EXPLOSION"],starter:false,
    desc:level=>`Mỗi ${Math.max(4.5,8-level*.7).toFixed(1)} giây mất một ít HP để phát nổ cực mạnh.`,apply:()=>{},
    periodic:{cooldown:level=>Math.max(4.5,8-level*.7),execute:level=>{if(player.hp<=player.maxHp*.12)return false;const cost=player.maxHp*(.018+level*.006);player.hp=Math.max(1,player.hp-cost);damageAreaAt(player.x,player.y,(105+level*22)*player.areaMultiplier,(18+level*14)*player.areaDamageMultiplier,{source:"sacrifice",tags:["BLOOD","EXPLOSION","AREA","PERIODIC"],allowProcs:false},28);return true;}}
  },
  bountyMark:{name:"Thưởng Săn",icon:"🎯💰",max:5,tags:["MARK","XP","KILL"],desc:level=>`Kẻ địch có ấn rơi thêm ${level*20}% XP khi chết.`,apply:()=>{}},
  velocity:{name:"Lưu Quang",icon:"💨🏹",max:5,tags:["PROJECTILE","MOVEMENT"],desc:level=>`Tăng ${level*8}% tốc đạn và ${level*8} tầm đánh.`,apply:()=>{player.projectileSpeedMultiplier*=1.08;player.attackRange+=8;}},
  blackHole:{
    name:"Hắc Vực",icon:"🕳️",max:5,tags:["CONTROL","AREA","PERIODIC"],
    desc:level=>`Mỗi ${Math.max(3,6-level*.45).toFixed(1)} giây kéo kẻ địch xung quanh về phía bạn và gây sát thương.`,apply:()=>{},
    periodic:{cooldown:level=>Math.max(3,6-level*.45),execute:level=>{let hits=0;for(const enemy of state.enemies){if(enemy.dead)continue;const d=dist(player,enemy);if(d<=150+level*22){hitEnemy(enemy,(4+level*4)*(hasEvolution("singularity")?1.8:1),-(22+level*8)*(hasEvolution("singularity")?1.5:1),{source:"blackHole",tags:["CONTROL","AREA","PERIODIC"],allowProcs:false});hits++;}}return hits>0;}}
  },
  chainMastery:{name:"Liên Kết",icon:"⛓️",max:5,tags:["CHAIN","LIGHTNING","PROJECTILE"],desc:level=>`Tăng ${level*10}% sát thương các hiệu ứng Chain.`,apply:()=>{player.chainDamageMultiplier*=1.10;}},
  luckyStar:{
    name:"Thiên Vận",icon:"⭐",max:5,tags:["RANDOM","PERIODIC","HEAL","SHIELD"],
    desc:level=>`Mỗi ${Math.max(3.5,7-level*.55).toFixed(1)} giây nhận ngẫu nhiên hồi máu, khiên hoặc sao rơi gây sát thương.`,apply:()=>{},
    periodic:{cooldown:level=>Math.max(3.5,7-level*.55),execute:level=>{const roll=Math.random();if(roll<.33){healPlayer(3+level*2,{source:"luckyStar"});return true;}if(roll<.66){addShield(5+level*4);return true;}const enemy=randomEnemy();if(!enemy)return false;damageAreaAt(enemy.x,enemy.y,(45+level*7)*player.areaMultiplier,(10+level*7)*player.areaDamageMultiplier,{source:"luckyStar",tags:["RANDOM","EXPLOSION","AREA","PERIODIC"],allowProcs:false},8);return true;}}
  },
  secondWind:{name:"Hồi Mệnh",icon:"🪽",max:2,tags:["DEFENSE","LOW_HP","RULE"],starter:false,desc:level=>`Có ${level} lần hồi sinh trong run khi HP về 0.`,apply:()=>{player.reviveCharges+=1;}}
};

const owned={};
function skillLevel(key){return owned[key]||0;}
