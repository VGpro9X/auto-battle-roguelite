function resetGame(){
  state.t=0;
  state.paused=false;
  state.gameOver=false;
  state.kills=0;
  state.spawnTimer=0;
  state.enemies.length=0;
  state.projectiles.length=0;
  state.gems.length=0;
  state.particles.length=0;

  Object.assign(player,createInitialPlayer());

  for(const key of Object.keys(owned)) delete owned[key];
  skills.fire.timer=0;
  skills.knock.timer=0;

  document.getElementById("gameOver").style.display="none";
  document.getElementById("levelModal").style.display="none";
  refreshSkillBar();

  setTimeout(()=>{if(!state.gameOver) showLevelUp();},150);
}

document.getElementById("restartButton").addEventListener("click",resetGame);

function showLevelUp(){
  if(state.gameOver) return;
  state.paused=true;

  const available=Object.keys(skills).filter(key=>skillLevel(key)<skills[key].max);
  if(!available.length){state.paused=false;return;}

  const picks=[];
  while(picks.length<Math.min(3,available.length)){
    const key=available[(Math.random()*available.length)|0];
    if(!picks.includes(key)) picks.push(key);
  }

  const container=document.getElementById("choices");
  container.innerHTML="";

  for(const key of picks){
    const skill=skills[key];
    const next=skillLevel(key)+1;
    const button=document.createElement("button");
    button.className="choice";
    button.innerHTML=`
      <div class="icon">${skill.icon}</div>
      <h3>${skill.name}</h3>
      <div class="lvl">Cấp ${next}/${skill.max}</div>
      <div class="desc">${skill.desc(next)}</div>
    `;
    button.onclick=()=>selectSkill(key);
    container.appendChild(button);
  }

  document.getElementById("levelModal").style.display="flex";
}

function selectSkill(key){
  owned[key]=(owned[key]||0)+1;
  skills[key].apply(owned[key]);
  document.getElementById("levelModal").style.display="none";
  state.paused=false;
  refreshSkillBar();
}

function refreshSkillBar(){
  const bar=document.getElementById("skillBar");
  bar.innerHTML="";
  const keys=Object.keys(owned);

  if(!keys.length){
    bar.innerHTML=`<div class="skillMini"><b>Chưa có kỹ năng</b><small>Chọn kỹ năng khởi đầu</small></div>`;
    return;
  }

  for(const key of keys){
    const skill=skills[key];
    const element=document.createElement("div");
    element.className="skillMini";
    element.innerHTML=`<b>${skill.icon} ${skill.name}</b><small>Lv.${owned[key]}</small>`;
    bar.appendChild(element);
  }
}

function updateHud(){
  document.getElementById("hpBar").style.width=(player.hp/player.maxHp*100)+"%";
  document.getElementById("hpText").textContent=`${Math.ceil(player.hp)}/${Math.ceil(player.maxHp)}`;
  document.getElementById("xpBar").style.width=(player.xp/player.xpNeed*100)+"%";
  document.getElementById("xpText").textContent=`${player.xp}/${player.xpNeed}`;
  document.getElementById("lvText").textContent=player.level;
  document.getElementById("timeText").textContent=fmtTime(state.t);
  document.getElementById("killText").textContent=state.kills;
}

function fmtTime(time){
  const m=Math.floor(time/60);
  const s=Math.floor(time%60);
  return String(m).padStart(2,"0")+":"+String(s).padStart(2,"0");
}

refreshSkillBar();
