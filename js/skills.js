const skills={
  rapid:{name:"Nhanh Tay",icon:"⚡",max:6,desc:()=>"Giảm 12% thời gian giữa các đòn đánh thường.",apply:()=>{player.attackCd*=.88;}},
  power:{name:"Cường Kích",icon:"💥",max:6,desc:()=>"Tăng thêm 4 sát thương cơ bản.",apply:()=>{player.damage+=4;}},
  vitality:{name:"Sinh Lực",icon:"❤️",max:6,desc:()=>"Tăng 18 HP tối đa và hồi ngay 18 HP.",apply:()=>{player.maxHp+=18;player.hp=Math.min(player.maxHp,player.hp+18);}},
  speed:{name:"Thân Pháp",icon:"💨",max:5,desc:()=>"Tăng 8% tốc độ di chuyển.",apply:()=>{player.speed*=1.08;}},
  fire:{name:"Hỏa Cầu Định Kỳ",icon:"🔥",max:6,timer:0,desc:level=>{const cd=Math.max(1.2,3-.25*(level-1));const damage=Math.round(22*(1+.28*(level-1)));return `Mỗi ${cd.toFixed(2)} giây bắn hỏa cầu ngẫu nhiên, gây ${damage} sát thương.`;},apply:()=>{}},
  knock:{name:"Chấn Khí",icon:"🌪️",max:6,timer:0,desc:level=>{const cd=Math.max(.45,1.4-.15*(level-1));const damage=Math.round(10*(1+.25*(level-1)));return `Mỗi ${cd.toFixed(2)} giây đẩy lùi một kẻ địch và gây ${damage} sát thương.`;},apply:()=>{}},
  orbit:{name:"Phi Kiếm Hộ Thể",icon:"🗡️",max:5,desc:level=>`Triệu hồi ${level} phi kiếm xoay quanh nhân vật.`,apply:()=>{}},
  heal:{name:"Hồi Linh",icon:"✨",max:5,desc:()=>"Hồi thêm 0.6 HP mỗi giây.",apply:()=>{player.regen+=.6;}},
  armor:{name:"Hộ Giáp",icon:"🛡️",max:5,desc:()=>"Giảm thêm 5% sát thương nhận vào.",apply:()=>{player.armor=clamp(player.armor+.05,0,.6);}},
  magnet:{name:"Linh Hấp",icon:"🧲",max:5,desc:()=>"Tăng mạnh phạm vi hút XP.",apply:()=>{player.magnet+=28;}}
};

const owned={};
function skillLevel(key){return owned[key]||0;}
