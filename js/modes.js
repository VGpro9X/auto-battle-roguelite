const MODES={
  "5":{id:"5",label:"5 PHÚT",duration:5*60,starterPicks:3,pressure:.96,endless:false},
  "10":{id:"10",label:"10 PHÚT",duration:10*60,starterPicks:2,pressure:1.00,endless:false},
  "15":{id:"15",label:"15 PHÚT",duration:15*60,starterPicks:1,pressure:1.05,endless:false},
  "20":{id:"20",label:"20 PHÚT",duration:20*60,starterPicks:1,pressure:1.10,endless:false},
  "endless":{id:"endless",label:"VÔ HẠN",duration:null,starterPicks:1,pressure:1.00,endless:true}
};

function getRunProgress(){
  if(!state.mode) return 0;
  if(state.mode.endless) return state.t/(20*60);
  return clamp(state.t/state.mode.duration,0,1);
}

function getDifficultyProfile(){
  if(!state.mode){
    return{hpScale:1,damageScale:1,speedScale:1,spawnCooldown:1.05,eliteChance:.01,extraSpawnChance:0};
  }

  const pressure=state.mode.pressure;

  if(state.mode.endless){
    const minutes=state.t/60;
    const longScale=Math.max(0,minutes-20);
    return{
      hpScale:(1+state.t/165+longScale*.035)*pressure,
      damageScale:(1+state.t/280+longScale*.018)*pressure,
      speedScale:1+Math.min(.38,state.t/1800*.38),
      spawnCooldown:Math.max(.20,1.05-state.t/1050),
      eliteChance:Math.min(.27,.01+state.t/1700*.24),
      extraSpawnChance:Math.min(.72,Math.max(0,(minutes-1.5)/24))
    };
  }

  const p=getRunProgress();
  const late=Math.max(0,(p-.72)/.28);
  return{
    hpScale:(1+p*1.75+late*.55)*pressure,
    damageScale:(1+p*.92+late*.20)*pressure,
    speedScale:1+p*.23,
    spawnCooldown:Math.max(.27,1.08-p*.78-late*.08),
    eliteChance:.01+p*.14+late*.05,
    extraSpawnChance:Math.max(0,(p-.30)*.63)
  };
}

function calculateRunScore(){
  const hpRatio=player.maxHp>0?player.hp/player.maxHp:0;
  return Math.max(0,Math.round(
    state.kills*10+
    state.eliteKills*75+
    Math.max(0,player.level-1)*100+
    hpRatio*500+
    2500
  ));
}
