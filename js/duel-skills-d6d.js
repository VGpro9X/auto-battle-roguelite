(()=>{
  const root=typeof window!=="undefined"?window:globalThis;
  if(typeof DUEL_SKILLS==="undefined"||typeof DUEL_SKILL_KEYS==="undefined"||typeof registerDuelSkillBehavior!=="function")return;

  const additions={
    precision:{maxRank:3,tags:["CRITICAL","DAMAGE"],rangeBias:.25,meleeBias:.55,desc:r=>`Tăng thêm ${[18,34,50][r-1]}% hệ số sát thương bạo kích. Không tăng tỉ lệ bạo kích.`},
    giantSlayer:{maxRank:3,tags:["DAMAGE","KILL","RULE"],rangeBias:.15,meleeBias:.55,desc:r=>`Nếu HP tối đa của đối thủ cao hơn HP tối đa của bạn, mọi sát thương bạn gây tăng ${[10,18,28][r-1]}%. Nếu không cao hơn, kỹ năng không có bonus.`},
    chaosOrb:{maxRank:3,tags:["RANDOM","PROJECTILE","PERIODIC","ELEMENTAL"],rangeBias:1,meleeBias:.05,desc:r=>`Mỗi ${[5,4.1,3.3][r-1].toFixed(1)} giây kích hoạt ngẫu nhiên 1 trong 5 hiệu ứng, mỗi hiệu ứng 20%: Hỏa ${[24,36,50][r-1]} sát thương; Băng ${[14,22,32][r-1]} sát thương + khựng ${[0.15,0.22,0.30][r-1].toFixed(2)} giây; Sét ${[28,42,58][r-1]} sát thương; Độc ${[2.5,4.5,7][r-1]} sát thương/giây trong 3 giây; Nổ ${[22,34,48][r-1]} sát thương + đẩy lùi ${[35,55,75][r-1]}px.`},
    fireWisp:{maxRank:3,tags:["SUMMON","FIRE","ELEMENTAL","PERIODIC"],rangeBias:.85,meleeBias:.15,summonBias:1,desc:r=>`Linh Hỏa tự bắn đối thủ mỗi ${[2.4,1.9,1.4][r-1].toFixed(1)} giây nếu ở trong 520px, gây ${[7,11,16][r-1]} sát thương Hỏa. Ngoài tầm sẽ thử lại sau 0,5 giây.`},
    stormTotem:{maxRank:3,tags:["SUMMON","LIGHTNING","ELEMENTAL","PERIODIC"],rangeBias:.75,meleeBias:.15,summonBias:1,desc:r=>`Lôi Linh đánh sét mỗi ${[4,3.2,2.5][r-1].toFixed(1)} giây nếu đối thủ trong 420px, gây ${[14,23,34][r-1]} sát thương Sét. Ngoài tầm sẽ thử lại sau 0,5 giây.`},
    strideShock:{maxRank:3,tags:["MOVEMENT","AREA","CONTROL"],rangeBias:0,meleeBias:.8,mobilityBias:.9,controlBias:.5,desc:r=>`Sau mỗi ${[220,180,145][r-1]}px thực sự di chuyển, phát chấn sóng bán kính ${[90,115,140][r-1]}px, gây ${[14,24,36][r-1]} sát thương và đẩy lùi ${[25,40,55][r-1]}px nếu đối thủ ở trong vùng. Quãng đường dư được giữ lại.`},
    returnBlade:{maxRank:3,tags:["PROJECTILE","PIERCE","PERIODIC"],rangeBias:.9,meleeBias:.15,desc:r=>`Mỗi ${[5,4.1,3.3][r-1].toFixed(1)} giây ném Hồi Phong Nhận về vị trí đối thủ lúc thi triển rồi quay lại. Mỗi lượt bay ra và bay về có thể trúng đối thủ tối đa 1 lần, mỗi lần gây ${[16,25,36][r-1]} sát thương. Lưỡi đao có vùng va chạm 24px.`},
    frostMirror:{maxRank:3,tags:["ICE","DEFENSE","CONTROL","PERIODIC"],rangeBias:0,meleeBias:.35,defenseBias:1,controlBias:.55,desc:r=>`Sau mỗi ${[9,7.5,6][r-1].toFixed(1)} giây nhận 1 Hàn Kính, tối đa 1. Đòn đánh thường cận chiến tiếp theo tiêu hao Kính, giảm ${[45,60,75][r-1]}% sát thương của đòn đó và làm kẻ tấn công khựng ${[0.25,0.35,0.45][r-1].toFixed(2)} giây. Kính đầu tiên phải chờ đủ hồi chiêu.`},
    timeField:{maxRank:3,tags:["TIME","PERIODIC","RULE"],rangeBias:.3,meleeBias:.25,desc:r=>`Mỗi 14 giây mở Thời Vực trong ${[3,4,5][r-1]} giây. Trong thời gian này, mọi bộ đếm hồi chiêu kỹ năng khác của bạn trôi nhanh thêm ${[35,50,65][r-1]}%; không tăng tốc đòn đánh thường hay lướt.`},
    bloodShield:{maxRank:3,tags:["BLOOD","SHIELD","DEFENSE"],rangeBias:0,meleeBias:.35,defenseBias:.95,desc:r=>`Trong Đấu Trường, bắt đầu mỗi round với ${[8,14,22][r-1]} khiên Huyết Thuẫn. Không có nguồn khiên bổ sung ẩn trong round.`}
  };

  for(const [key,adapter] of Object.entries(additions)){
    if(!DUEL_SKILLS[key])DUEL_SKILLS[key]=adapter;
    if(!DUEL_SKILL_KEYS.includes(key))DUEL_SKILL_KEYS.push(key);
  }

  const VALUES={
    precision:{critDamage:[.18,.34,.50]},
    giantSlayer:{bonus:[.10,.18,.28]},
    chaosOrb:{cooldown:[5,4.1,3.3],fire:[24,36,50],ice:[14,22,32],iceStun:[.15,.22,.30],lightning:[28,42,58],poisonDps:[2.5,4.5,7],explosion:[22,34,48],push:[35,55,75]},
    fireWisp:{cooldown:[2.4,1.9,1.4],damage:[7,11,16],range:520,retry:.5},
    stormTotem:{cooldown:[4,3.2,2.5],damage:[14,23,34],range:420,retry:.5},
    strideShock:{distance:[220,180,145],radius:[90,115,140],damage:[14,24,36],push:[25,40,55]},
    returnBlade:{cooldown:[5,4.1,3.3],damage:[16,25,36],speed:420,hitRadius:24},
    frostMirror:{cooldown:[9,7.5,6],reduction:[.45,.60,.75],stun:[.25,.35,.45]},
    timeField:{cooldown:14,duration:[3,4,5],acceleration:[.35,.50,.65]},
    bloodShield:{shield:[8,14,22]}
  };
  const at=(table,rank)=>table[Math.max(0,Math.min(table.length-1,rank-1))];
  const segmentNear=(a,b,x,radius)=>x>=Math.min(a,b)-radius&&x<=Math.max(a,b)+radius;

  registerDuelSkillBehavior("precision",{
    modifyStats:({stats,rank})=>{stats.critMultiplier+=at(VALUES.precision.critDamage,rank);}
  });

  registerDuelSkillBehavior("giantSlayer",{
    modifyOutgoingDamage:({value,rank,fighter,target})=>target&&target.maxHp>fighter.maxHp?value*(1+at(VALUES.giantSlayer.bonus,rank)):value
  });

  registerDuelSkillBehavior("chaosOrb",{
    onCreate:({fighter,rank})=>{fighter.skillTimers.chaosOrb=at(VALUES.chaosOrb.cooldown,rank);},
    update:({round,fighter,other,dt,rank,dealDamage,knockback,emit})=>{
      const poison=other?.duelEffects?.chaosPoison;
      if(poison&&poison.source===fighter.side){
        if(poison.until<=round.time)delete other.duelEffects.chaosPoison;
        else{
          poison.tick-=dt;
          while(poison.tick<=0&&other.hp>0){poison.tick+=.5;dealDamage(fighter,other,poison.dps*.5,{source:"chaosPoison",elemental:true,canCrit:false,dodgeable:false,reactive:false});}
        }
      }
      if((fighter.skillTimers.chaosOrb??0)>0||!other||other.hp<=0)return;
      fighter.skillTimers.chaosOrb=at(VALUES.chaosOrb.cooldown,rank);
      const roll=(round.matchRng||Math.random)();
      if(roll<.2){dealDamage(fighter,other,at(VALUES.chaosOrb.fire,rank),{source:"chaosFire",elemental:true,projectile:true,canCrit:true,dodgeable:true});emit("cast",{side:fighter.side,skill:"chaosOrb",variant:"fire",x:other.x,y:other.y-82});return;}
      if(roll<.4){dealDamage(fighter,other,at(VALUES.chaosOrb.ice,rank),{source:"chaosIce",elemental:true,projectile:true,canCrit:true,dodgeable:true});other.hitStun=Math.max(other.hitStun,at(VALUES.chaosOrb.iceStun,rank));emit("cast",{side:fighter.side,skill:"chaosOrb",variant:"ice",x:other.x,y:other.y-82});return;}
      if(roll<.6){dealDamage(fighter,other,at(VALUES.chaosOrb.lightning,rank),{source:"chaosLightning",elemental:true,projectile:true,canCrit:true,dodgeable:true});emit("cast",{side:fighter.side,skill:"chaosOrb",variant:"lightning",x:other.x,y:other.y-82});return;}
      if(roll<.8){other.duelEffects.chaosPoison={source:fighter.side,until:round.time+3,dps:at(VALUES.chaosOrb.poisonDps,rank),tick:.5};emit("status",{side:other.side,status:"chaosPoison",x:other.x,y:other.y-72,duration:3});return;}
      dealDamage(fighter,other,at(VALUES.chaosOrb.explosion,rank),{source:"chaosExplosion",elemental:true,projectile:true,area:true,canCrit:true,dodgeable:true});knockback(other,at(VALUES.chaosOrb.push,rank),fighter.facing);emit("area",{side:fighter.side,skill:"chaosOrb",variant:"explosion",x:other.x,y:other.y-30,radius:80});
    }
  });

  registerDuelSkillBehavior("fireWisp",{
    onCreate:({fighter,rank})=>{fighter.skillTimers.fireWisp=at(VALUES.fireWisp.cooldown,rank);},
    update:({fighter,other,rank,dealDamage,emit})=>{
      if((fighter.skillTimers.fireWisp??0)>0||!other||other.hp<=0)return;
      if(Math.abs(other.x-fighter.x)>VALUES.fireWisp.range){fighter.skillTimers.fireWisp=VALUES.fireWisp.retry;return;}
      fighter.skillTimers.fireWisp=at(VALUES.fireWisp.cooldown,rank);
      dealDamage(fighter,other,at(VALUES.fireWisp.damage,rank),{source:"fireWisp",elemental:true,summon:true,canCrit:true,dodgeable:true});
      emit("cast",{side:fighter.side,skill:"fireWisp",x:fighter.x+fighter.facing*36,y:fighter.y-90,target:other.side});
    }
  });

  registerDuelSkillBehavior("stormTotem",{
    onCreate:({fighter,rank})=>{fighter.skillTimers.stormTotem=at(VALUES.stormTotem.cooldown,rank);},
    update:({fighter,other,rank,dealDamage,emit})=>{
      if((fighter.skillTimers.stormTotem??0)>0||!other||other.hp<=0)return;
      if(Math.abs(other.x-fighter.x)>VALUES.stormTotem.range){fighter.skillTimers.stormTotem=VALUES.stormTotem.retry;return;}
      fighter.skillTimers.stormTotem=at(VALUES.stormTotem.cooldown,rank);
      dealDamage(fighter,other,at(VALUES.stormTotem.damage,rank),{source:"stormTotem",elemental:true,summon:true,canCrit:true,dodgeable:true});
      emit("cast",{side:fighter.side,skill:"stormTotem",x:other.x,y:other.y-110,target:other.side});
    }
  });

  registerDuelSkillBehavior("strideShock",{
    onCreate:({fighter})=>{fighter.duelEffects.strideShock={lastX:fighter.x,distance:0};},
    update:({fighter,other,rank,dealDamage,knockback,emit})=>{
      const state=fighter.duelEffects.strideShock;
      const moved=Math.abs(fighter.x-state.lastX);state.lastX=fighter.x;state.distance+=moved;
      const need=at(VALUES.strideShock.distance,rank);
      while(state.distance>=need){
        state.distance-=need;
        const radius=at(VALUES.strideShock.radius,rank);
        emit("area",{side:fighter.side,skill:"strideShock",x:fighter.x,y:fighter.y-22,radius});
        if(other&&other.hp>0&&Math.abs(other.x-fighter.x)<=radius){dealDamage(fighter,other,at(VALUES.strideShock.damage,rank),{source:"strideShock",area:true,canCrit:false,dodgeable:false});knockback(other,at(VALUES.strideShock.push,rank),fighter.facing);}
      }
    }
  });

  registerDuelSkillBehavior("returnBlade",{
    onCreate:({fighter,rank})=>{fighter.skillTimers.returnBlade=at(VALUES.returnBlade.cooldown,rank);fighter.duelEffects.returnBlades=[];},
    update:({round,fighter,other,dt,rank,dealDamage,emit})=>{
      let blades=fighter.duelEffects.returnBlades||[];
      if((fighter.skillTimers.returnBlade??0)<=0&&other?.hp>0){
        fighter.skillTimers.returnBlade=at(VALUES.returnBlade.cooldown,rank);
        blades.push({x:fighter.x,targetX:other.x,phase:"out",outHit:false,returnHit:false,until:round.time+3});
        emit("cast",{side:fighter.side,skill:"returnBlade",x:fighter.x,y:fighter.y-78});
      }
      const kept=[];
      for(const blade of blades){
        if(round.time>=blade.until)continue;
        const oldX=blade.x;
        if(blade.phase==="out"){
          const dir=Math.sign(blade.targetX-blade.x)||fighter.facing;
          const rawNext=blade.x+dir*VALUES.returnBlade.speed*dt;
          const reached=dir>0?rawNext>=blade.targetX:rawNext<=blade.targetX;
          blade.x=reached?blade.targetX:rawNext;
          if(!blade.outHit&&other?.hp>0&&segmentNear(oldX,blade.x,other.x,VALUES.returnBlade.hitRadius)){
            blade.outHit=true;
            dealDamage(fighter,other,at(VALUES.returnBlade.damage,rank),{source:"returnBlade",projectile:true,canCrit:true,dodgeable:true});
          }
          if(reached)blade.phase="return";
        }else{
          const tx=fighter.x;
          const dir=Math.sign(tx-blade.x)||-fighter.facing;
          const rawNext=blade.x+dir*VALUES.returnBlade.speed*dt;
          const reached=dir>0?rawNext>=tx:rawNext<=tx;
          blade.x=reached?tx:rawNext;
          if(!blade.returnHit&&other?.hp>0&&segmentNear(oldX,blade.x,other.x,VALUES.returnBlade.hitRadius)){
            blade.returnHit=true;
            dealDamage(fighter,other,at(VALUES.returnBlade.damage,rank),{source:"returnBlade",projectile:true,canCrit:true,dodgeable:true});
          }
          if(reached)continue;
        }
        kept.push(blade);
      }
      fighter.duelEffects.returnBlades=kept;
    }
  });

  registerDuelSkillBehavior("frostMirror",{
    onCreate:({fighter,rank})=>{fighter.skillTimers.frostMirror=at(VALUES.frostMirror.cooldown,rank);fighter.duelEffects.frostMirrorCharge=0;},
    update:({fighter,rank,emit})=>{
      if(fighter.duelEffects.frostMirrorCharge>0||(fighter.skillTimers.frostMirror??0)>0)return;
      fighter.duelEffects.frostMirrorCharge=1;fighter.skillTimers.frostMirror=0;emit("status",{side:fighter.side,status:"frostMirror",x:fighter.x,y:fighter.y-78});
    },
    modifyIncomingDamage:({value,rank,fighter,attacker,meta})=>{
      if(fighter.duelEffects.frostMirrorCharge<=0||meta?.source!=="basic")return value;
      fighter.duelEffects.frostMirrorCharge=0;fighter.skillTimers.frostMirror=at(VALUES.frostMirror.cooldown,rank);
      if(attacker)attacker.hitStun=Math.max(attacker.hitStun,at(VALUES.frostMirror.stun,rank));
      return value*(1-at(VALUES.frostMirror.reduction,rank));
    }
  });

  registerDuelSkillBehavior("timeField",{
    onCreate:({fighter})=>{fighter.skillTimers.timeField=VALUES.timeField.cooldown;fighter.duelEffects.timeFieldUntil=0;},
    update:({round,fighter,dt,rank,emit})=>{
      if((fighter.skillTimers.timeField??0)<=0){fighter.skillTimers.timeField=VALUES.timeField.cooldown;fighter.duelEffects.timeFieldUntil=round.time+at(VALUES.timeField.duration,rank);emit("status",{side:fighter.side,status:"timeField",x:fighter.x,y:fighter.y-72,duration:at(VALUES.timeField.duration,rank)});}
      if(fighter.duelEffects.timeFieldUntil<=round.time)return;
      const extra=dt*at(VALUES.timeField.acceleration,rank);
      for(const key of Object.keys(fighter.skillTimers)){if(key!=="timeField")fighter.skillTimers[key]-=extra;}
    }
  });

  registerDuelSkillBehavior("bloodShield",{
    onRoundStart:({fighter,rank,emit})=>{
      const shield=at(VALUES.bloodShield.shield,rank);fighter.shield+=shield;fighter.totalShieldGained+=shield;emit("shield_gain",{side:fighter.side,amount:shield,source:"bloodShield",x:fighter.x,y:fighter.y-75});
    }
  });

  root.DUEL_D6D_VALUES=VALUES;
})();