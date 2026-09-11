(()=>{
  const root=typeof window!=="undefined"?window:globalThis;
  if(typeof root.registerDuelRareAdapter!=="function")return;
  const S=root.getDuelRareState;
  const timer=(fighter,key,value)=>{const s=S(fighter);if(!Number.isFinite(s.timers[key]))s.timers[key]=value;return s;};
  const tick=(fighter,key,dt,reset)=>{const s=timer(fighter,key,reset);s.timers[key]-=dt;if(s.timers[key]>0)return false;s.timers[key]+=reset;return true;};

  root.registerDuelRareAdapter("lifeRewind",{
    desc:"Mỗi 25 giây, Nghịch Lưu nhìn lại trạng thái của chính bạn 5 giây trước trong round hiện tại. Nếu tổng HP + khiên lúc đó cao hơn hiện tại, HP và khiên được khôi phục đúng snapshot; đây là hoàn tác trạng thái nên không chịu giảm hồi phục HUYẾT CHIẾN.",
    behavior:{onCreate:({fighter})=>{const s=timer(fighter,"lifeRewind",25);s.lifeHistory=[];s.lifeSnapshotTimer=0;},update:({round,fighter,dt,emit})=>{const s=S(fighter);s.lifeSnapshotTimer-=dt;if(s.lifeSnapshotTimer<=0){s.lifeSnapshotTimer=.20;s.lifeHistory.push({t:round.time,hp:fighter.hp,shield:fighter.shield});while(s.lifeHistory.length&&s.lifeHistory[0].t<round.time-6.2)s.lifeHistory.shift();}if(!tick(fighter,"lifeRewind",dt,25))return;const targetTime=round.time-5;let snap=null;for(const item of s.lifeHistory){if(item.t<=targetTime)snap=item;else break;}if(!snap||snap.hp+snap.shield<=fighter.hp+fighter.shield+1e-6)return;fighter.hp=Math.min(fighter.maxHp,snap.hp);fighter.shield=snap.shield;emit("status",{side:fighter.side,status:"lifeRewind",x:fighter.x,y:fighter.y-94,hp:fighter.hp,shield:fighter.shield});}}
  });

  root.registerDuelRareAdapter("causalInversion",{
    desc:"Mỗi 15 giây tích tối đa 1 Đảo Nhân Quả. Đòn sát thương tiếp theo sau các modifier bị triệt tiêu; bạn được hồi lượng HP bằng chính lượng sát thương bị đảo qua hệ số hồi phục hiện tại. Khi đã tích sẵn, bộ đếm 15 giây không tạo tầng thứ hai.",
    behavior:{onCreate:({fighter})=>{timer(fighter,"causalInversion",15);S(fighter).causalArmed=false;},update:({fighter,dt,emit})=>{const s=S(fighter);if(s.causalArmed)return;if(!tick(fighter,"causalInversion",dt,15))return;s.causalArmed=true;emit("status",{side:fighter.side,status:"causalInversion",x:fighter.x,y:fighter.y-94});},modifyIncomingDamage:({fighter,value,heal})=>{const s=S(fighter);if(!s.causalArmed||value<=0)return value;s.causalArmed=false;heal(fighter,value,"causalInversion");return 0;}}
  });

  root.registerDuelRareAdapter("divineGift",{
    desc:"Sau khi bạn chọn một Kỹ Năng cơ bản trong phần thưởng giữa các match, có 18% cơ hội kỹ năng đó tăng thêm 1 Rank miễn phí nếu vẫn chưa Rank III. Rank thưởng không tiêu lượt chọn và dùng cùng luật cho AI.",
    behavior:{}
  });

  root.registerDuelRareAdapter("timeStop",{
    desc:"Mỗi 24 giây, Thời Đình khóa hành động AI của đối thủ trong 2 giây và bù ngược 2 giây tiến trình các skill timer của họ. Projectile/zone đã được tạo trước khi dừng vẫn tồn tại; không có bất tử cho người dùng Thời Đình.",
    behavior:{onCreate:({fighter})=>{timer(fighter,"timeStop",24);S(fighter).timeStopUntil=0;},update:({round,fighter,other,dt,emit})=>{const s=S(fighter);if(tick(fighter,"timeStop",dt,24)){s.timeStopUntil=round.time+2;if(other){other.hitStun=Math.max(other.hitStun,2);for(const key of Object.keys(other.skillTimers||{}))other.skillTimers[key]+=2;}emit("status",{side:other?.side,status:"timeStop",x:other?.x,y:(other?.y||0)-92,duration:2});}if(s.timeStopUntil>round.time&&other)other.hitStun=Math.max(other.hitStun,Math.min(.20,s.timeStopUntil-round.time));}}
  });

  root.registerDuelRareAdapter("celestialEdict",{
    desc:"Mỗi 36 giây, Thiên Lệnh buộc đối thủ mất 18% HP hiện tại nhưng không thể trực tiếp hạ họ xuống dưới 1 HP. Đây là rule loss, không bạo kích, không kích hoạt on-hit và không bị nhân bởi HUYẾT CHIẾN.",
    behavior:{onCreate:({fighter})=>timer(fighter,"celestialEdict",36),update:({fighter,other,dt,emit})=>{if(!other||other.hp<=1||!tick(fighter,"celestialEdict",dt,36))return;const loss=Math.min(other.hp-1,other.hp*.18);if(loss<=0)return;other.hp-=loss;fighter.damageDealt+=loss;emit("hit",{source:"celestialEdict",attacker:fighter.side,target:other.side,amount:loss,shieldDamage:0,critical:false,x:other.x,y:other.y-72});}}
  });

  root.registerDuelRareAdapter("heavenSeal",{
    desc:"Thiên Ấn triệt tiêu hoàn toàn đòn sát thương hợp lệ đầu tiên đánh vào bạn, sau đó hồi lại sau đúng 12 giây. Đòn đã bị nguồn bất tử khác triệt tiêu trước đó không tiêu Thiên Ấn.",
    behavior:{onCreate:({fighter})=>{S(fighter).heavenSealReadyAt=0;},modifyIncomingDamage:({round,fighter,value,emit})=>{const s=S(fighter);if(value<=0||round.time<s.heavenSealReadyAt)return value;s.heavenSealReadyAt=round.time+12;emit("status",{side:fighter.side,status:"heavenSeal",x:fighter.x,y:fighter.y-94,duration:.55});return 0;}}
  });

  root.registerDuelRareAdapter("bloodDebt",{
    desc:"Sau mọi modifier sát thương, Nợ Máu chỉ nhận ngay 50% sát thương; 50% còn lại thành nợ trả đều trong 5 giây. Các tick nợ là sát thương mới có thể bị khiên chặn nhưng không thể tiếp tục bị trì hoãn bởi Nợ Máu lần nữa.",
    behavior:{onCreate:({fighter})=>{S(fighter).bloodDebts=[];},modifyIncomingDamage:({fighter,value,meta})=>{if(value<=0||meta?.source==="bloodDebt")return value;S(fighter).bloodDebts.push({remaining:value*.5,rate:value*.1});return value*.5;},update:({fighter,other,dt,dealDamage})=>{const s=S(fighter);if(!s.bloodDebts.length||fighter.hp<=0)return;for(const debt of s.bloodDebts){if(debt.remaining<=0)continue;const amount=Math.min(debt.remaining,debt.rate*dt);debt.remaining-=amount;if(amount>0&&other)dealDamage(other,fighter,amount,{source:"bloodDebt",canCrit:false,dodgeable:false,reactive:false});}s.bloodDebts=s.bloodDebts.filter(d=>d.remaining>1e-5);}}
  });

  root.registerDuelRareAdapter("parasitePact",{
    desc:"Mỗi 18 giây, Ký Sinh nối bạn với đối thủ trong 6 giây. Trong thời gian đó, 30% sát thương còn lại trước khi chạm khiên/HP của bạn được chuyển ngược sang đối thủ; bạn nhận 70%. Sát thương chuyển không kích hoạt on-hit.",
    behavior:{onCreate:({fighter})=>{timer(fighter,"parasitePact",18);S(fighter).parasiteUntil=0;},update:({round,fighter,other,dt,emit})=>{if(!other||other.hp<=0||!tick(fighter,"parasitePact",dt,18))return;S(fighter).parasiteUntil=round.time+6;emit("status",{side:other.side,status:"parasitePact",x:other.x,y:other.y-88,duration:6});},modifyIncomingDamage:({round,fighter,attacker,value,dealDamage})=>{if(value<=0||S(fighter).parasiteUntil<=round.time||!attacker||attacker.hp<=0)return value;const redirected=value*.30;dealDamage(fighter,attacker,redirected,{source:"parasitePact",canCrit:false,dodgeable:false,reactive:false});return value*.70;}}
  });

  root.registerDuelRareAdapter("voidReality",{
    desc:"Hư Thực luân phiên mỗi 6 giây và bắt đầu ở HƯ. HƯ: +30 điểm % né tránh nhưng sát thương gây ra ×0,80. THỰC: sát thương ×1,25 nhưng tốc độ di chuyển ×0,85. Các hệ số đều hiển thị cố định, không có pha ẩn.",
    behavior:{onCreate:({fighter})=>{const s=S(fighter);s.voidBaseDodge=fighter.stats.dodgeChance;s.voidPhase="void";fighter.stats.dodgeChance=Math.min(.65,s.voidBaseDodge+.30);},update:({round,fighter,emit})=>{const s=S(fighter),phase=Math.floor(round.time/6)%2===0?"void":"real";if(phase!==s.voidPhase){s.voidPhase=phase;emit("status",{side:fighter.side,status:phase==="void"?"voidPhase":"realPhase",x:fighter.x,y:fighter.y-92});}fighter.stats.dodgeChance=phase==="void"?Math.min(.65,s.voidBaseDodge+.30):s.voidBaseDodge;},modifyOutgoingDamage:({round,value})=>Math.floor(round.time/6)%2===0?value*.80:value*1.25,modifyMoveMultiplier:({round,value})=>Math.floor(round.time/6)%2===0?value:value*.85}
  });

  root.registerDuelRareAdapter("scapegoatFate",{
    desc:"Mỗi 28 giây, Thế Mệnh đánh dấu đối thủ cho tới khi bị tiêu hao hoặc hết round. Nếu sau các phòng thủ khác bạn vẫn nhận sát thương chí tử, dấu bị tiêu: HP bạn giữ ở 1 và đối thủ mất tối đa 35% HP tối đa nhưng không thể bị rule này hạ xuống dưới 1 HP.",
    behavior:{onCreate:({fighter})=>{timer(fighter,"scapegoatFate",28);S(fighter).scapegoatArmed=false;},update:({fighter,other,dt,emit})=>{if(!other||other.hp<=0||S(fighter).scapegoatArmed||!tick(fighter,"scapegoatFate",dt,28))return;S(fighter).scapegoatArmed=true;emit("status",{side:other.side,status:"scapegoatFate",x:other.x,y:other.y-90});},onFatalDamage:({fighter,other,emit})=>{const s=S(fighter);if(fighter.hp>0||!s.scapegoatArmed||!other||other.hp<=1)return;s.scapegoatArmed=false;fighter.hp=1;const loss=Math.min(other.hp-1,other.maxHp*.35);if(loss>0){other.hp-=loss;fighter.damageDealt+=loss;emit("hit",{source:"scapegoatFate",attacker:fighter.side,target:other.side,amount:loss,shieldDamage:0,critical:false,x:other.x,y:other.y-72});}emit("status",{side:fighter.side,status:"scapegoatSaved",x:fighter.x,y:fighter.y-94});}}
  });

  root.DUEL_C4B_RARE_IDS=["lifeRewind","causalInversion","divineGift","timeStop","celestialEdict","heavenSeal","bloodDebt","parasitePact","voidReality","scapegoatFate"];
})();