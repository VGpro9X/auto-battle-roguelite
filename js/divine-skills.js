const DIVINE_SKILLS={
  bribery:{
    id:"bribery",tier:"mystic",name:"Mua Chuộc",icon:"🫱🏼‍🫲🏽",
    desc:"Cứ mỗi 8 giây, mua chuộc một kẻ địch ngẫu nhiên. Nó đổi phe và chiến đấu cho bạn trong 5 giây, sau đó trở lại bình thường nếu còn sống.",
    preview:"bribery",
    cooldown:8,
    execute:()=>{
      const enemy=randomEnemy();
      if(!enemy)return false;
      convertEnemyToAlly(enemy,5);
      return true;
    }
  },
  immortalBreath:{
    id:"immortalBreath",tier:"divine",name:"Bất Tử Nhất Tức",icon:"🕯️",
    desc:"Một lần trong mỗi run, sát thương chí tử không thể hạ gục bạn. HP bị giữ ở 1 và bạn bất tử trong 4 giây.",
    preview:"immortalBreath"
  },
  heavenlyPunishment:{
    id:"heavenlyPunishment",tier:"divine",name:"Thiên Phạt",icon:"⚡",
    desc:"Mỗi 75 kẻ địch bị hạ, thiên lôi giáng xuống tối đa 12 kẻ địch đang tồn tại và gây sát thương cực lớn.",
    preview:"heavenlyPunishment"
  },
  fateExchange:{
    id:"fateExchange",tier:"mystic",name:"Đổi Mệnh",icon:"☯️",
    desc:"Khi HP dưới 30%, cứ mỗi 20 giây có thể hoán đổi tỷ lệ HP với một kẻ địch ngẫu nhiên nếu việc hoán đổi có lợi cho bạn.",
    preview:"fateExchange",
    cooldown:20,
    execute:()=>{
      if(player.hp/player.maxHp>=.30)return false;
      const enemy=randomEnemy();
      if(!enemy||enemy.maxHp<=0)return false;
      const playerRatio=clamp(player.hp/player.maxHp,0,1);
      const enemyRatio=clamp(enemy.hp/enemy.maxHp,0,1);
      if(enemyRatio<=playerRatio+.08)return false;
      player.hp=Math.max(1,player.maxHp*enemyRatio);
      enemy.hp=Math.max(1,enemy.maxHp*playerRatio);
      emitSkillEvent("divine_trigger",{id:"fateExchange",enemy});
      return true;
    }
  }
};

const DIVINE_TIER_LABELS={divine:"THẦN KỸ",mystic:"THẦN BÍ KỸ"};

function getOwnedDivineSkillIds(){return[...skillRuntime.divineSkills];}
function hasDivineSkill(id){return skillRuntime.divineSkills.has(id);}
function getOwnedDivineCount(){return skillRuntime.divineSkills.size;}
function getDivineTierLabel(item){return DIVINE_TIER_LABELS[item?.tier]||"THẦN KỸ";}

function grantDivineSkill(id){
  const item=DIVINE_SKILLS[id];
  if(!item||hasDivineSkill(id)||getOwnedDivineCount()>=1)return false;
  skillRuntime.divineSkills.add(id);
  skillRuntime.divineTimers[id]=0;
  if(item.unlock)item.unlock();
  emitSkillEvent("build_unlock",{kind:item.tier==="mystic"?"mystic":"divine",item});
  emitSkillEvent("divine_acquired",{id,item});
  return true;
}

function canOfferDivineSkill(){
  if(getOwnedDivineCount()>=1)return false;
  if(player.level<8)return false;
  if(skillRuntime.divineOffers>=2)return false;
  return true;
}

function rollDivineOffer(){
  if(!canOfferDivineSkill())return null;
  const progress=typeof getRunProgress==="function"?getRunProgress():0;
  const chance=clamp(.025+player.level*.0015+progress*.018,.03,.085);
  if(Math.random()>=chance)return null;
  const candidates=Object.keys(DIVINE_SKILLS).filter(id=>!hasDivineSkill(id));
  if(!candidates.length)return null;
  skillRuntime.divineOffers++;
  return candidates[(Math.random()*candidates.length)|0];
}

function getLevelUpChoices(isStarter=false,count=3){
  const normal=getSkillChoices(isStarter,count).map(key=>({kind:"skill",key}));
  if(isStarter||!normal.length)return normal;
  const divineId=rollDivineOffer();
  if(!divineId)return normal;
  const replaceIndex=Math.max(0,normal.length-1);
  normal[replaceIndex]={kind:"divine",key:divineId};
  return normal;
}

function runDivineSkillEngine(dt){
  for(const id of getOwnedDivineSkillIds()){
    const item=DIVINE_SKILLS[id];
    if(!item?.cooldown||!item.execute)continue;
    if(skillRuntime.divineTimers[id]===undefined)skillRuntime.divineTimers[id]=.25;
    skillRuntime.divineTimers[id]-=dt;
    if(skillRuntime.divineTimers[id]<=0){
      const fired=item.execute()!==false;
      skillRuntime.divineTimers[id]=fired?item.cooldown:Math.min(1.25,item.cooldown*.18);
      if(fired)emitSkillEvent("divine_trigger",{id,item});
    }
  }
}

onSkillEvent("kill",()=>{
  if(!hasDivineSkill("heavenlyPunishment"))return;
  skillRuntime.counters.heavenlyPunishment=(skillRuntime.counters.heavenlyPunishment||0)+1;
  if(skillRuntime.counters.heavenlyPunishment<75)return;
  skillRuntime.counters.heavenlyPunishment-=75;
  const targets=getRandomEnemies(12);
  for(const enemy of targets){
    hitEnemy(enemy,42+player.level*3,0,{source:"heavenlyPunishment",tags:["LIGHTNING","AREA","RULE"],allowProcs:false});
  }
  emitSkillEvent("divine_trigger",{id:"heavenlyPunishment",targets});
});
