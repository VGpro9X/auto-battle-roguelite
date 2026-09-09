(()=>{
  const root=typeof window!=="undefined"?window:globalThis;
  const DUEL_MAX_RANK=3;

  const adapters={
    rapid:{
      maxRank:DUEL_MAX_RANK,rangeBias:0,meleeBias:1,
      desc:r=>`Giảm ${[10,19,28][r-1]}% hồi chiêu đòn đánh thường cận chiến.`
    },
    power:{
      maxRank:DUEL_MAX_RANK,rangeBias:0,meleeBias:1,
      desc:r=>`Tăng ${[3,7,12][r-1]} sát thương cơ bản của đòn đánh thường cận chiến.`
    },
    vitality:{
      maxRank:DUEL_MAX_RANK,rangeBias:0,meleeBias:.25,defenseBias:1,
      desc:r=>`Tăng ${[18,38,65][r-1]} HP tối đa trong mỗi round.`
    },
    speed:{
      maxRank:DUEL_MAX_RANK,rangeBias:0,meleeBias:.45,mobilityBias:1,
      desc:r=>`Tăng ${[8,16,26][r-1]}% tốc độ di chuyển.`
    },
    fire:{
      maxRank:DUEL_MAX_RANK,rangeBias:1.2,meleeBias:0,
      desc:r=>`Mỗi ${[4.2,3.5,2.8][r-1].toFixed(1)} giây bắn Hỏa Cầu gây ${[18,27,38][r-1]} sát thương.`
    },
    knock:{
      maxRank:DUEL_MAX_RANK,rangeBias:.2,meleeBias:1,controlBias:1,
      desc:r=>`Mỗi ${[4.0,3.3,2.7][r-1].toFixed(1)} giây, nếu đối thủ trong 140px, Chấn Khí gây ${[12,20,30][r-1]} sát thương và đẩy lùi ${[55,75,100][r-1]}px.`
    },
    orbit:{
      maxRank:DUEL_MAX_RANK,rangeBias:0,meleeBias:1.15,summonBias:1,
      desc:r=>`Có ${r} Phi Kiếm xoay quanh cơ thể. Khi áp sát, hệ Phi Kiếm gây ${[4,6,8][r-1]} sát thương mỗi nhịp va chạm.`
    },
    heal:{
      maxRank:DUEL_MAX_RANK,rangeBias:0,meleeBias:.1,defenseBias:1,
      desc:r=>`Hồi ${[0.6,1.0,1.5][r-1].toFixed(1)} HP mỗi giây. HUYẾT CHIẾN/TỬ CHIẾN giảm hiệu quả đúng theo luật round.`
    },
    armor:{
      maxRank:DUEL_MAX_RANK,rangeBias:0,meleeBias:.35,defenseBias:1,
      desc:r=>`Giảm ${[7,13,20][r-1]}% sát thương nhận vào.`
    },
    crit:{
      maxRank:DUEL_MAX_RANK,rangeBias:.15,meleeBias:.65,
      desc:r=>`Tăng ${[8,15,24][r-1]} điểm % tỉ lệ bạo kích. Bạo kích gây ×1,6 sát thương.`
    },
    lightning:{
      maxRank:DUEL_MAX_RANK,rangeBias:1,meleeBias:0,
      desc:r=>`Mỗi ${[5.0,4.1,3.3][r-1].toFixed(1)} giây, nếu đối thủ trong 360px, Lôi Kích gây ${[18,29,42][r-1]} sát thương trực tiếp.`
    },
    nova:{
      maxRank:DUEL_MAX_RANK,rangeBias:0,meleeBias:1,controlBias:.5,
      desc:r=>`Mỗi ${[6.0,5.0,4.0][r-1].toFixed(1)} giây, nếu đối thủ trong ${[130,150,170][r-1]}px, Linh Bạo gây ${[15,25,38][r-1]} sát thương và đẩy lùi 25px.`
    },
    frost:{
      maxRank:DUEL_MAX_RANK,rangeBias:.25,meleeBias:.65,controlBias:1,
      desc:r=>`Đối thủ trong ${[150,180,210][r-1]}px bị giảm ${[15,25,35][r-1]}% tốc độ di chuyển.`
    },
    burn:{
      maxRank:DUEL_MAX_RANK,rangeBias:0,meleeBias:1,
      desc:r=>`Đòn đánh thường có ${[25,40,55][r-1]}% cơ hội Thiêu Đốt trong 3 giây, gây ${[2,4,7][r-1]} sát thương mỗi giây.`
    },
    barrier:{
      maxRank:DUEL_MAX_RANK,rangeBias:0,meleeBias:.1,defenseBias:1,
      desc:r=>`Mỗi ${[8,7,6][r-1]} giây nhận ${[14,24,38][r-1]} khiên mới.`
    },
    phantomStep:{
      maxRank:DUEL_MAX_RANK,rangeBias:0,meleeBias:.35,mobilityBias:1,defenseBias:.6,
      desc:r=>`Tăng ${[5,10,16][r-1]} điểm % né tránh và ${[4,8,12][r-1]}% tốc độ di chuyển.`
    }
  };

  const keys=Object.keys(adapters);

  function baseMeta(key){
    const source=typeof skills!=="undefined"?skills[key]:null;
    return{
      key,
      name:source?.name||key,
      icon:source?.icon||"◆",
      tags:Array.isArray(source?.tags)?[...source.tags]:[],
      ...adapters[key]
    };
  }

  function getDuelSkill(key){return adapters[key]?baseMeta(key):null;}
  function getDuelSkillRank(build,key){return Math.max(0,Math.min(DUEL_MAX_RANK,Number(build?.[key]||0)));}
  function canRankDuelSkill(build,key){return Boolean(adapters[key]&&getDuelSkillRank(build,key)<DUEL_MAX_RANK);}
  function addDuelSkillRank(build,key){
    if(!build||!canRankDuelSkill(build,key))return false;
    build[key]=getDuelSkillRank(build,key)+1;
    return true;
  }

  function shuffled(input,rng=Math.random){
    const out=[...input];
    for(let i=out.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[out[i],out[j]]=[out[j],out[i]];}
    return out;
  }

  function getDuelChoices(build,{starter=false,count=3,rng=Math.random}={}){
    let available=keys.filter(key=>canRankDuelSkill(build,key));
    if(starter)available=available.filter(key=>getDuelSkillRank(build,key)===0);
    if(!available.length)return[];
    const picks=[];
    const take=key=>{if(key&&!picks.includes(key)){picks.push(key);available=available.filter(item=>item!==key);}};
    if(!starter){
      const upgrades=available.filter(key=>getDuelSkillRank(build,key)>0);
      const fresh=available.filter(key=>getDuelSkillRank(build,key)===0);
      if(upgrades.length)take(shuffled(upgrades,rng)[0]);
      if(fresh.length&&picks.length<count)take(shuffled(fresh,rng)[0]);
    }
    for(const key of shuffled(available,rng)){if(picks.length>=count)break;take(key);}
    return picks;
  }

  function getDuelBuildProfile(build){
    let ranged=0,melee=0,defense=0,control=0,mobility=0,summon=0,totalRanks=0;
    for(const key of keys){
      const rank=getDuelSkillRank(build,key);if(!rank)continue;
      const a=adapters[key];totalRanks+=rank;
      ranged+=(a.rangeBias||0)*rank;melee+=(a.meleeBias||0)*rank;defense+=(a.defenseBias||0)*rank;
      control+=(a.controlBias||0)*rank;mobility+=(a.mobilityBias||0)*rank;summon+=(a.summonBias||0)*rank;
    }
    const combatMass=Math.max(1,ranged+melee);
    const rangedRatio=ranged/combatMass;
    const preferredDistance=Math.round(76+rangedRatio*165+Math.min(28,control*5)-Math.min(18,melee*2));
    let style="Hỗn hợp";
    if(ranged>melee*1.45)style=control>ranged*.55?"Tầm xa / Khống chế":"Tầm xa";
    else if(melee>ranged*1.55)style=defense>melee*.65?"Áp sát / Phòng thủ":"Áp sát";
    else if(defense>combatMass*.75)style="Phòng thủ";
    else if(control>combatMass*.6)style="Khống chế";
    return{ranged,melee,defense,control,mobility,summon,totalRanks,preferredDistance:Math.max(68,Math.min(270,preferredDistance)),style};
  }

  function affinityMultiplier(meta,affinity){
    if(!affinity||affinity==="hybrid")return 1;
    const tags=new Set(meta.tags||[]);
    const groups={
      melee:["MELEE","ATTACK","BLOOD"],
      projectile:["PROJECTILE","FIRE","LIGHTNING"],
      elemental:["ELEMENTAL","FIRE","ICE","LIGHTNING","POISON"],
      control:["CONTROL","ICE"],
      summon:["SUMMON"],
      defense:["DEFENSE","SHIELD","HP"],
      mobility:["MOVEMENT","TIME"]
    };
    return (groups[affinity]||[]).some(tag=>tags.has(tag))?2.1:1;
  }

  function chooseDuelAiSkill(build,affinity="hybrid",rng=Math.random){
    const available=keys.filter(key=>canRankDuelSkill(build,key));
    if(!available.length)return null;
    const weighted=[];
    let total=0;
    for(const key of available){
      const meta=baseMeta(key);
      const rank=getDuelSkillRank(build,key);
      let weight=affinityMultiplier(meta,affinity);
      if(rank>0)weight*=1.4;
      if(rank===2)weight*=1.25;
      total+=weight;weighted.push({key,weight});
    }
    let roll=rng()*total;
    for(const item of weighted){roll-=item.weight;if(roll<=0)return item.key;}
    return weighted[weighted.length-1].key;
  }

  function listDuelBuild(build){
    return keys.filter(key=>getDuelSkillRank(build,key)>0)
      .map(key=>({meta:baseMeta(key),rank:getDuelSkillRank(build,key)}))
      .sort((a,b)=>b.rank-a.rank||a.meta.name.localeCompare(b.meta.name,"vi"));
  }

  root.DUEL_MAX_RANK=DUEL_MAX_RANK;
  root.DUEL_SKILLS=adapters;
  root.DUEL_SKILL_KEYS=keys;
  root.getDuelSkill=getDuelSkill;
  root.getDuelSkillRank=getDuelSkillRank;
  root.canRankDuelSkill=canRankDuelSkill;
  root.addDuelSkillRank=addDuelSkillRank;
  root.getDuelChoices=getDuelChoices;
  root.getDuelBuildProfile=getDuelBuildProfile;
  root.chooseDuelAiSkill=chooseDuelAiSkill;
  root.listDuelBuild=listDuelBuild;
})();