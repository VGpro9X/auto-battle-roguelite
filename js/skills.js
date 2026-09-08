const skills={
  rapid:{name:"Nhanh Tay",icon:"⚡",max:6,tags:["ATTACK","TIME"],desc:()=>"Giảm 12% thời gian giữa các đòn đánh thường.",apply:()=>{player.attackCd*=.88;}},
  power:{name:"Cường Kích",icon:"💥",max:6,tags:["ATTACK","DAMAGE"],desc:()=>"Tăng thêm 4 sát thương cơ bản.",apply:()=>{player.damage+=4;}},
  vitality:{name:"Sinh Lực",icon:"❤️",max:6,tags:["DEFENSE","HP"],desc:()=>"Tăng 18 HP tối đa và hồi ngay 18 HP.",apply:()=>{player.maxHp+=18;player.hp=Math.min(player.maxHp,player.hp+18);}},
  speed:{name:"Thân Pháp",icon:"💨",max:5,tags:["MOVEMENT"],desc:()=>"Tăng 8% tốc độ di chuyển.",apply:()=>{player.speed*=1.08;}},

  fire:{
    name:"Hỏa Cầu Định Kỳ",icon:"🔥",max:6,tags:["FIRE","PROJECTILE","PERIODIC"],
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
    name:"Lôi Kích",icon:"🌩️",max:5,tags:["LIGHTNING","CHAIN","PERIODIC"],
    desc:level=>`Mỗi ${Math.max(1.8,4-.35*(level-1)).toFixed(2)} giây sét đánh ${Math.min(5,1+level)} mục tiêu gần nhất.`,apply:()=>{},
    periodic:{cooldown:level=>Math.max(1.8,4-.35*(level-1)),execute:level=>{const bonus=hasEvolution("stormNetwork")?2:0;const targets=getNearestEnemies(Math.min(8,1+level+bonus));if(!targets.length)return false;for(const enemy of targets)hitEnemy(enemy,12+level*8,0,{source:"lightning",tags:["LIGHTNING","CHAIN","PERIODIC"]});return true;}}
  },
  nova:{
    name:"Linh Bạo",icon:"💫",max:5,tags:["EXPLOSION","AREA","PERIODIC"],
    desc:level=>`Mỗi ${Math.max(2.8,5.5-.45*(level-1)).toFixed(2)} giây phát nổ quanh người trong bán kính ${95+level*18}.`,apply:()=>{},
    periodic:{cooldown:level=>Math.max(2.8,5.5-.45*(level-1)),execute:level=>damageAreaAt(player.x,player.y,(95+level*18)*player.areaMultiplier,10+level*8,{source:"nova",tags:["EXPLOSION","AREA","PERIODIC"]},26+level*4)>0}
  },
  frost:{name:"Hàn Khí",icon:"❄️",max:5,tags:["ICE","CONTROL","AURA"],desc:level=>`Làm chậm ${Math.min(40,level*8)}% kẻ địch trong bán kính ${90+level*18}.`,apply:()=>{}},
  blood:{name:"Huyết Khí",icon:"🩸",max:5,tags:["BLOOD","HEAL","KILL"],desc:level=>`Mỗi kẻ địch bị hạ hồi ${(.35*level).toFixed(2)} HP.`,apply:()=>{}},
  wisdom:{name:"Ngộ Tính",icon:"📘",max:5,tags:["XP"],desc:level=>`Nhận thêm ${level*15}% kinh nghiệm từ tinh thể XP.`,apply:()=>{player.xpMultiplier+=.15;}},

  ricochet:{name:"Nảy Đạn",icon:"↗️",max:4,tags:["PROJECTILE","CHAIN"],desc:level=>`Đạn đánh thường có thể nảy sang thêm ${level} mục tiêu.`,apply:()=>{player.projectileRicochet+=1;}},
  explosive:{name:"Đạn Nổ",icon:"💣",max:5,tags:["PROJECTILE","EXPLOSION","HIT"],desc:level=>`Đạn có ${10+level*5}% cơ hội phát nổ khi trúng, gây sát thương vùng.`,apply:()=>{player.explosionChance+=.05;}},
  poison:{name:"Độc Tố",icon:"☠️",max:5,tags:["POISON","DOT","HIT"],desc:level=>`Đòn đánh có ${18+level*6}% cơ hội gây độc trong 4 giây.`,apply:()=>{player.poisonChance+=.06;}},
  burn:{name:"Thiêu Đốt",icon:"♨️",max:5,tags:["FIRE","DOT","HIT"],desc:level=>`Đòn đánh có ${16+level*6}% cơ hội thiêu đốt mục tiêu trong 3 giây.`,apply:()=>{player.burnChance+=.06;}},
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
    periodic:{cooldown:level=>Math.max(4.5,8-level*.55),execute:level=>{addShield(10+level*10);return true;}}
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
    periodic:{cooldown:level=>Math.max(2.2,4.5-level*.4),execute:level=>{const enemy=randomEnemy();if(!enemy)return false;fireChaosOrb(enemy,level);return true;}}
  },
  fireWisp:{
    name:"Linh Hỏa",icon:"🧚",max:5,tags:["SUMMON","FIRE","PERIODIC"],
    desc:level=>`Triệu hồi linh hỏa tự bắn mục tiêu mỗi ${Math.max(.8,2-level*.2).toFixed(1)} giây.`,apply:()=>{},
    periodic:{cooldown:level=>Math.max(.8,2-level*.2),execute:level=>{const enemy=randomEnemy();if(!enemy)return false;shoot(enemy,8+level*6,360,4,"wisp",{source:"fireWisp",tags:["SUMMON","FIRE","PROJECTILE","PERIODIC"]});return true;}}
  },
  stormTotem:{
    name:"Lôi Linh",icon:"🗿",max:5,tags:["SUMMON","LIGHTNING","PERIODIC"],
    desc:level=>`Lôi linh định kỳ đánh ${Math.min(4,1+Math.ceil(level/2))} mục tiêu ngẫu nhiên.`,apply:()=>{},
    periodic:{cooldown:level=>Math.max(1.6,3.4-level*.28),execute:level=>{const targets=getRandomEnemies(Math.min(4,1+Math.ceil(level/2)));if(!targets.length)return false;for(const e of targets)hitEnemy(e,8+level*7,0,{source:"stormTotem",tags:["SUMMON","LIGHTNING","PERIODIC"]});return true;}}
  },
  overclock:{name:"Quá Tải Thời Gian",icon:"⏱️",max:4,tags:["TIME","PERIODIC","RISK"],starter:false,desc:level=>`Giảm ${level*10}% cooldown skill định kỳ nhưng mỗi cấp giảm 4% HP tối đa hiện tại.`,apply:()=>{player.periodicCooldownMultiplier*=.90;player.maxHp=Math.max(25,player.maxHp*.96);player.hp=Math.min(player.hp,player.maxHp);}}
};

const owned={};
function skillLevel(key){return owned[key]||0;}
