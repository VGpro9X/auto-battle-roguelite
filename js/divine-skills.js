// V0.12: Unique rule skills. They have no levels and at most one can be owned per run.

if(!skillRuntime.divineSkills)skillRuntime.divineSkills=new Set();
if(!skillRuntime.divineTimers)skillRuntime.divineTimers={};
if(skillRuntime.divineOffers===undefined)skillRuntime.divineOffers=0;

const DIVINE_SKILLS={
  bribery:{
    id:"bribery",tier:"mystic",name:"Mua Chuộc",icon:"🤝",
    desc:"Cứ mỗi 8 giây, mua chuộc một kẻ địch ngẫu nhiên. Nó đổi phe và chiến đấu cho bạn trong 5 giây, sau đó trở lại bình thường nếu còn sống.",
    preview:"bribery",cooldown:8,
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
    preview:"fateExchange",cooldown:20,
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
  emitSkillEvent("build_unlock",{kind:item.tier==="mystic"?"mystic":"divine",item});
  emitSkillEvent("divine_acquired",{id,item});
  return true;
}

function canOfferDivineSkill(){
  return getOwnedDivineCount()<1&&player.level>=8&&skillRuntime.divineOffers<2;
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
  if(divineId)normal[Math.max(0,normal.length-1)]={kind:"divine",key:divineId};
  return normal;
}

function isEnemyAllied(enemy){return Boolean(enemy&&!enemy.dead&&(enemy.alliedUntil||0)>state.t);}
function isEnemyHostile(enemy){return Boolean(enemy&&!enemy.dead&&!isEnemyAllied(enemy));}

function convertEnemyToAlly(enemy,duration=5){
  if(!enemy||enemy.dead)return false;
  enemy.alliedUntil=Math.max(enemy.alliedUntil||0,state.t+duration);
  enemy.allyAttackTimer=0;
  enemy.markedUntil=0;
  return true;
}

function getNearestHostileFromEnemy(source,maxDistance=Infinity){
  let best=null,bestDistance=maxDistance;
  for(const enemy of state.enemies){
    if(enemy===source||!isEnemyHostile(enemy))continue;
    const d=Math.hypot(enemy.x-source.x,enemy.y-source.y);
    if(d<bestDistance){bestDistance=d;best=enemy;}
  }
  return[best,bestDistance];
}

// Targeting is replaced globally so allies stop being treated as enemies by attacks and skills.
nearestEnemy=function(){
  let best=null,bestDistance=Infinity;
  for(const enemy of state.enemies){if(!isEnemyHostile(enemy))continue;const d=dist(player,enemy);if(d<bestDistance){bestDistance=d;best=enemy;}}
  return[best,bestDistance];
};
getNearestEnemies=function(limit){return state.enemies.filter(isEnemyHostile).map(enemy=>({enemy,d:dist(player,enemy)})).sort((a,b)=>a.d-b.d).slice(0,limit).map(e=>e.enemy);};
getNearestEnemiesFrom=function(x,y,limit,exclude=new Set(),maxDistance=Infinity){return state.enemies.filter(e=>isEnemyHostile(e)&&!exclude.has(e)).map(enemy=>({enemy,d:Math.hypot(enemy.x-x,enemy.y-y)})).filter(e=>e.d<=maxDistance).sort((a,b)=>a.d-b.d).slice(0,limit).map(e=>e.enemy);};
findNearestEnemyFrom=function(x,y,exclude=new Set(),maxDistance=Infinity){return getNearestEnemiesFrom(x,y,1,exclude,maxDistance)[0]||null;};
getRandomEnemies=function(limit){const living=state.enemies.filter(isEnemyHostile);for(let i=living.length-1;i>0;i--){const j=(Math.random()*(i+1))|0;[living[i],living[j]]=[living[j],living[i]];}return living.slice(0,limit);};
randomEnemy=function(){const living=state.enemies.filter(isEnemyHostile);return living.length?living[(Math.random()*living.length)|0]:null;};

const baseHitEnemyForDivine=hitEnemy;
hitEnemy=function(enemy,damage,knockback=0,meta={}){
  if(isEnemyAllied(enemy)&&meta?.source!=="bribedAlly")return false;
  return baseHitEnemyForDivine(enemy,damage,knockback,meta);
};

const baseDamagePlayerForDivine=damagePlayer;
damagePlayer=function(amount,meta={}){
  if((player.invulnerableUntil||0)>state.t)return 0;
  const dealt=baseDamagePlayerForDivine(amount,meta);
  if(player.hp<=0&&hasDivineSkill("immortalBreath")&&!skillRuntime.counters.immortalBreathUsed){
    skillRuntime.counters.immortalBreathUsed=1;
    player.hp=1;
    player.invulnerableUntil=state.t+4;
    emitSkillEvent("divine_trigger",{id:"immortalBreath"});
  }
  return dealt;
};

// Movement uses the same threat math as V0.8, but ignores temporarily allied enemies.
getEnemyDangerAt=function(x,y){
  let danger=0,nearest=Infinity,closeCount=0;
  for(const enemy of state.enemies){
    if(!isEnemyHostile(enemy))continue;
    const d=Math.hypot(x-enemy.x,y-enemy.y);nearest=Math.min(nearest,d);
    if(d<85)closeCount++;
    if(d<42)danger+=2.8+(42-d)/14;
    else if(d<82)danger+=1.35*(1-(d-42)/40);
    else if(d<145)danger+=.48*(1-(d-82)/63);
  }
  return{danger,nearest,closeCount};
};
getLocalThreat=function(){
  let nearest=Infinity,close80=0,close125=0,cx=0,cy=0,weightSum=0;
  for(const enemy of state.enemies){
    if(!isEnemyHostile(enemy))continue;
    const dx=enemy.x-player.x,dy=enemy.y-player.y,d=Math.hypot(dx,dy);nearest=Math.min(nearest,d);
    if(d<80)close80++;if(d<125)close125++;
    if(d<240){const w=1/(35+d);cx+=enemy.x*w;cy+=enemy.y*w;weightSum+=w;}
  }
  return{nearest,close80,close125,centroid:weightSum?{x:cx/weightSum,y:cy/weightSum}:null};
};

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

const baseRunSkillEngineForDivine=runSkillEngine;
runSkillEngine=function(dt){baseRunSkillEngineForDivine(dt);runDivineSkillEngine(dt);};
const baseResetSkillEngineForDivine=resetSkillEngine;
resetSkillEngine=function(){
  baseResetSkillEngineForDivine();
  skillRuntime.divineSkills=new Set();
  skillRuntime.divineTimers={};
  skillRuntime.divineOffers=0;
};

onSkillEvent("kill",()=>{
  if(!hasDivineSkill("heavenlyPunishment"))return;
  skillRuntime.counters.heavenlyPunishment=(skillRuntime.counters.heavenlyPunishment||0)+1;
  if(skillRuntime.counters.heavenlyPunishment<75)return;
  skillRuntime.counters.heavenlyPunishment-=75;
  const targets=getRandomEnemies(12);
  for(const enemy of targets)hitEnemy(enemy,42+player.level*3,0,{source:"heavenlyPunishment",tags:["LIGHTNING","AREA","RULE"],allowProcs:false});
  emitSkillEvent("divine_trigger",{id:"heavenlyPunishment",targets});
});
