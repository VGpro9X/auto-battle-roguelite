(()=>{
  const root=typeof window!=="undefined"?window:globalThis;
  if(typeof root.registerDuelRareAdapter!=="function")return;
  const S=root.getDuelRareState;
  const timer=(fighter,key,value)=>{const s=S(fighter);if(!Number.isFinite(s.timers[key]))s.timers[key]=value;return s;};
  const tick=(fighter,key,dt,reset)=>{const s=timer(fighter,key,reset);s.timers[key]-=dt;if(s.timers[key]>0)return false;s.timers[key]+=reset;return true;};

  root.registerDuelRareAdapter("bribery",{
    desc:"Đấu Trường 1v1 không có lính để đổi phe. Mỗi 8 giây, Mua Chuộc làm đối thủ ngừng hành động 1,2 giây, đẩy lùi mọi bộ đếm kỹ năng của họ thêm đúng 1,2 giây và cho bạn 6 khiên. Lần đầu phải chờ đủ 8 giây.",
    behavior:{onCreate:({fighter})=>timer(fighter,"bribery",8),update:({fighter,other,dt,addShield,emit})=>{if(!other||other.hp<=0||!tick(fighter,"bribery",dt,8))return;other.hitStun=Math.max(other.hitStun,1.2);for(const key of Object.keys(other.skillTimers||{}))other.skillTimers[key]+=1.2;addShield(fighter,6,"bribery");emit("status",{side:other.side,status:"bribery",x:other.x,y:other.y-88,duration:1.2});}}
  });

  root.registerDuelRareAdapter("immortalBreath",{
    desc:"Một lần trong toàn bộ giải đấu, sau khi các hồi sinh Kỹ Năng khác đã xử lý, sát thương chí tử còn lại giữ bạn ở 1 HP và cho 2,5 giây bất tử. Lượt cứu này không làm mới giữa các round hay match.",
    behavior:{modifyIncomingDamage:({round,fighter,value})=>S(fighter).immortalUntil>round.time?0:value,onFatalDamage:({round,fighter,emit})=>{const persistent=fighter.duelRarePersistent||(fighter.entry.duelRarePersistent={});if(fighter.hp>0||persistent.immortalBreathUsed)return;persistent.immortalBreathUsed=true;fighter.hp=1;S(fighter).immortalUntil=round.time+2.5;emit("status",{side:fighter.side,status:"immortalBreath",x:fighter.x,y:fighter.y-96,duration:2.5});}}
  });

  root.registerDuelRareAdapter("heavenlyPunishment",{
    desc:"Thiên Phạt đổi bộ đếm hạ gục thành tiến độ 1v1: cứ mỗi 90 sát thương thực tế bạn gây lên HP hoặc khiên, thiên lôi giáng thêm 28 sát thương Sét. Sát thương dư được giữ và tia Thiên Phạt không tự nạp lại tiến độ.",
    behavior:{onCreate:({fighter})=>{S(fighter).heavenlyPunishmentCharge=0;},onDamageDealt:({fighter,other,totalDamage,meta,dealDamage,emit})=>{if(totalDamage<=0||meta?.source==="heavenlyPunishment"||!other||other.hp<=0)return;const s=S(fighter);s.heavenlyPunishmentCharge+=totalDamage;while(s.heavenlyPunishmentCharge>=90&&other.hp>0){s.heavenlyPunishmentCharge-=90;dealDamage(fighter,other,28,{source:"heavenlyPunishment",elemental:true,canCrit:false,dodgeable:false,reactive:false});emit("cast",{side:fighter.side,skill:"heavenlyPunishment",x:other.x,y:other.y-112});}}}
  });

  root.registerDuelRareAdapter("fateExchange",{
    desc:"Mỗi 20 giây, nếu bạn dưới 30% HP và tỷ lệ HP của đối thủ cao hơn bạn ít nhất 8 điểm %, Đổi Mệnh hoán đổi tỷ lệ HP của hai bên. Nếu điều kiện không đạt, lần kiểm tra đó bỏ qua và chờ lại đủ 20 giây.",
    behavior:{onCreate:({fighter})=>timer(fighter,"fateExchange",20),update:({fighter,other,dt,emit})=>{if(!other||other.hp<=0||!tick(fighter,"fateExchange",dt,20))return;const a=fighter.hp/fighter.maxHp,b=other.hp/other.maxHp;if(a>=.30||b<=a+.08)return;fighter.hp=Math.max(1,fighter.maxHp*b);other.hp=Math.max(1,other.maxHp*a);emit("status",{side:fighter.side,status:"fateExchange",x:fighter.x,y:fighter.y-90});emit("status",{side:other.side,status:"fateExchange",x:other.x,y:other.y-90});}}
  });

  root.registerDuelRareAdapter("heavenlyMandate",{
    desc:"Mỗi 30 giây, Thiên Mệnh đặt mọi bộ đếm hồi chiêu Kỹ Năng Duel đang sở hữu về 0 đúng một lần. Không đặt lại đòn đánh thường, dash hoặc các bộ đếm rare khác; lần đầu phải chờ đủ 30 giây.",
    behavior:{onCreate:({fighter})=>timer(fighter,"heavenlyMandate",30),update:({fighter,dt,emit})=>{if(!tick(fighter,"heavenlyMandate",dt,30))return;for(const key of Object.keys(fighter.skillTimers||{}))fighter.skillTimers[key]=Math.min(0,fighter.skillTimers[key]);emit("status",{side:fighter.side,status:"heavenlyMandate",x:fighter.x,y:fighter.y-96});}}
  });

  root.registerDuelRareAdapter("divineJudgment",{
    desc:"Phán Quyết kích đúng một lần mỗi round khi sát thương của bạn làm đối thủ xuống không quá 25% HP. Mục tiêu mất thêm lượng HP bằng tối đa 20% HP tối đa nhưng Phán Quyết không thể trực tiếp hạ mục tiêu xuống dưới 1 HP.",
    behavior:{onCreate:({fighter})=>{S(fighter).divineJudgmentUsed=false;},onDamageDealt:({fighter,other,totalDamage,meta,emit})=>{const s=S(fighter);if(s.divineJudgmentUsed||totalDamage<=0||meta?.source==="divineJudgment"||!other||other.hp<=1||other.hp/other.maxHp>.25)return;s.divineJudgmentUsed=true;const loss=Math.min(other.hp-1,other.maxHp*.20);if(loss<=0)return;other.hp-=loss;fighter.damageDealt+=loss;emit("hit",{source:"divineJudgment",attacker:fighter.side,target:other.side,amount:loss,shieldDamage:0,critical:false,x:other.x,y:other.y-72});}}
  });

  root.registerDuelRareAdapter("spatialSwap",{
    desc:"Mỗi 12 giây, nếu đối thủ ở gần hơn 110px, Hoán Vị đổi vị trí ngang của hai đấu sĩ và cho bạn 0,6 giây miễn sát thương. Nếu đối thủ không đủ gần, lần kiểm tra đó bỏ qua và chờ lại đủ 12 giây.",
    behavior:{onCreate:({fighter})=>{timer(fighter,"spatialSwap",12);S(fighter).spatialImmuneUntil=0;},modifyIncomingDamage:({round,fighter,value})=>S(fighter).spatialImmuneUntil>round.time?0:value,update:({round,fighter,other,dt,emit})=>{if(!other||other.hp<=0||!tick(fighter,"spatialSwap",dt,12)||Math.abs(other.x-fighter.x)>=110)return;const x=fighter.x;fighter.x=other.x;other.x=x;S(fighter).spatialImmuneUntil=round.time+.6;emit("status",{side:fighter.side,status:"spatialSwap",x:fighter.x,y:fighter.y-84,duration:.6});}}
  });

  root.registerDuelRareAdapter("equalPrice",{
    desc:"Mỗi 10 giây, nếu bạn còn trên 40% HP, Đồng Giá trả 8% HP tối đa (không thể tự hạ dưới 1 HP) để tạo khiên bằng 150% lượng HP đã trả. Khiên mới vẫn chịu hệ số HUYẾT CHIẾN/TỬ CHIẾN.",
    behavior:{onCreate:({fighter})=>timer(fighter,"equalPrice",10),update:({fighter,dt,addShield,emit})=>{if(!tick(fighter,"equalPrice",dt,10)||fighter.hp/fighter.maxHp<=.40)return;const cost=Math.min(fighter.hp-1,fighter.maxHp*.08);if(cost<=0)return;fighter.hp-=cost;fighter.damageTaken+=cost;addShield(fighter,cost*1.5,"equalPrice");emit("status",{side:fighter.side,status:"equalPrice",x:fighter.x,y:fighter.y-82,amount:cost});}}
  });

  root.registerDuelRareAdapter("heavenlyWard",{
    desc:"Khi một đòn phá hết khiên hiện có, Thiên Hộ cho 1,5 giây bất tử đối với các đòn tiếp theo. Hồi chiêu 12 giây tính từ lần kích hoạt thành công; sát thương tràn của chính đòn phá khiên vẫn được xử lý bình thường.",
    behavior:{onCreate:({fighter})=>{const s=S(fighter);s.heavenlyWardReadyAt=0;s.heavenlyWardUntil=0;},modifyIncomingDamage:({round,fighter,value})=>S(fighter).heavenlyWardUntil>round.time?0:value,onDamageTaken:({round,fighter,shieldDamage,emit})=>{const s=S(fighter);if(shieldDamage<=0||fighter.shield>0||round.time<s.heavenlyWardReadyAt)return;s.heavenlyWardReadyAt=round.time+12;s.heavenlyWardUntil=round.time+1.5;emit("status",{side:fighter.side,status:"heavenlyWard",x:fighter.x,y:fighter.y-94,duration:1.5});}}
  });

  root.registerDuelRareAdapter("divineDomain",{
    desc:"Mỗi 24 giây mở Thần Vực trong 5 giây. Khi hai đấu sĩ cách nhau không quá 140px trong Thần Vực, bạn gây thêm 20% sát thương và nhận ít hơn 40% sát thương. Bản Duel không có hệ số làm chậm ẩn.",
    behavior:{onCreate:({fighter})=>{timer(fighter,"divineDomain",24);S(fighter).divineDomainUntil=0;},update:({round,fighter,dt,emit})=>{if(!tick(fighter,"divineDomain",dt,24))return;S(fighter).divineDomainUntil=round.time+5;emit("area",{side:fighter.side,skill:"divineDomain",x:fighter.x,y:fighter.y-24,radius:140,duration:5});},modifyOutgoingDamage:({round,fighter,target,value})=>S(fighter).divineDomainUntil>round.time&&target&&Math.abs(target.x-fighter.x)<=140?value*1.20:value,modifyIncomingDamage:({round,fighter,attacker,value})=>S(fighter).divineDomainUntil>round.time&&attacker&&Math.abs(attacker.x-fighter.x)<=140?value*.60:value}
  });

  root.DUEL_C4A_RARE_IDS=["bribery","immortalBreath","heavenlyPunishment","fateExchange","heavenlyMandate","divineJudgment","spatialSwap","equalPrice","heavenlyWard","divineDomain"];
})();