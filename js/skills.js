const skills={
  rapid:{
    name:"Nhanh Tay",icon:"⚡",max:6,
    desc:()=>"Giảm 12% thời gian giữa các đòn đánh thường.",
    apply:()=>{player.attackCd*=.88;}
  },
  power:{
    name:"Cường Kích",icon:"💥",max:6,
    desc:()=>"Tăng thêm 4 sát thương cơ bản.",
    apply:()=>{player.damage+=4;}
  },
  vitality:{
    name:"Sinh Lực",icon:"❤️",max:6,
    desc:()=>"Tăng 18 HP tối đa và hồi ngay 18 HP.",
    apply:()=>{player.maxHp+=18;player.hp=Math.min(player.maxHp,player.hp+18);}
  },
  speed:{
    name:"Thân Pháp",icon:"💨",max:5,
    desc:()=>"Tăng 8% tốc độ di chuyển.",
    apply:()=>{player.speed*=1.08;}
  },
  fire:{
    name:"Hỏa Cầu Định Kỳ",icon:"🔥",max:6,timer:0,
    desc:level=>{
      const cd=Math.max(1.2,3-.25*(level-1));
      const damage=Math.round(22*(1+.28*(level-1)));
      return `Mỗi ${cd.toFixed(2)} giây bắn hỏa cầu ngẫu nhiên, gây ${damage} sát thương.`;
    },
    apply:()=>{}
  },
  knock:{
    name:"Chấn Khí",icon:"🌪️",max:6,timer:0,
    desc:level=>{
      const cd=Math.max(.45,1.4-.15*(level-1));
      const damage=Math.round(10*(1+.25*(level-1)));
      return `Mỗi ${cd.toFixed(2)} giây đẩy lùi một kẻ địch và gây ${damage} sát thương.`;
    },
    apply:()=>{}
  },
  orbit:{
    name:"Phi Kiếm Hộ Thể",icon:"🗡️",max:5,
    desc:level=>`Triệu hồi ${level} phi kiếm xoay quanh nhân vật.`,
    apply:()=>{}
  },
  heal:{
    name:"Hồi Linh",icon:"✨",max:5,
    desc:()=>"Hồi thêm 0.6 HP mỗi giây.",
    apply:()=>{player.regen+=.6;}
  },
  armor:{
    name:"Hộ Giáp",icon:"🛡️",max:5,
    desc:()=>"Giảm thêm 5% sát thương nhận vào.",
    apply:()=>{player.armor=clamp(player.armor+.05,0,.6);}
  },
  magnet:{
    name:"Linh Hấp",icon:"🧲",max:5,
    desc:()=>"Tăng mạnh phạm vi hút XP.",
    apply:()=>{player.magnet+=28;}
  },
  multishot:{
    name:"Song Tiễn",icon:"🏹",max:3,
    desc:level=>`Đòn đánh thường bắn ${1+level} viên theo hình quạt. Mỗi viên gây 82% sát thương đòn thường.`,
    apply:()=>{player.extraProjectiles+=1;}
  },
  pierce:{
    name:"Xuyên Phá",icon:"🪡",max:3,
    desc:level=>`Đạn đánh thường xuyên thêm ${level} kẻ địch.`,
    apply:()=>{player.projectilePierce+=1;}
  },
  crit:{
    name:"Bạo Kích",icon:"🎯",max:5,
    desc:level=>`Tăng tỉ lệ chí mạng thêm 7%. Hiện tại: ${Math.round(level*7)}%. Chí mạng gây ${Math.round(player.critMultiplier*100)}% sát thương.`,
    apply:()=>{player.critChance=clamp(player.critChance+.07,0,.55);}
  },
  lightning:{
    name:"Lôi Kích",icon:"🌩️",max:5,timer:0,
    desc:level=>{
      const cd=Math.max(1.8,4-.35*(level-1));
      const targets=Math.min(5,1+level);
      const damage=12+level*8;
      return `Mỗi ${cd.toFixed(2)} giây sét đánh ${targets} mục tiêu gần nhất, gây ${damage} sát thương mỗi mục tiêu.`;
    },
    apply:()=>{}
  },
  nova:{
    name:"Linh Bạo",icon:"💫",max:5,timer:0,
    desc:level=>{
      const cd=Math.max(2.8,5.5-.45*(level-1));
      const radius=95+level*18;
      const damage=10+level*8;
      return `Mỗi ${cd.toFixed(2)} giây phát nổ quanh người trong bán kính ${radius}, gây ${damage} sát thương và đẩy lùi.`;
    },
    apply:()=>{}
  },
  frost:{
    name:"Hàn Khí",icon:"❄️",max:5,
    desc:level=>`Làm chậm ${Math.min(40,level*8)}% kẻ địch trong bán kính ${90+level*18}.`,
    apply:()=>{}
  },
  blood:{
    name:"Huyết Khí",icon:"🩸",max:5,
    desc:level=>`Mỗi kẻ địch bị hạ hồi ${(.35*level).toFixed(2)} HP.`,
    apply:()=>{player.healOnKill+=.35;}
  },
  wisdom:{
    name:"Ngộ Tính",icon:"📘",max:5,
    desc:level=>`Nhận thêm ${level*15}% kinh nghiệm từ tinh thể XP.`,
    apply:()=>{player.xpMultiplier+=.15;}
  }
};

const owned={};
function skillLevel(key){return owned[key]||0;}
