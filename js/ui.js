const overlayIds=["mainMenu","modeMenu","skillCodexMenu","leaderboardMenu","settingsMenu","howToMenu","pauseMenu","levelModal","resultModal"];
let leaderboardMode="5";

function hideAllOverlays(){for(const id of overlayIds)document.getElementById(id).classList.remove("visible");}
function showScreen(id){hideAllOverlays();const screen=document.getElementById(id);if(screen)screen.classList.add("visible");state.currentScreen=id;if(typeof setSkillCodexActive==="function")setSkillCodexActive(id==="skillCodexMenu");if(id==="leaderboardMenu")renderLeaderboard();if(id==="settingsMenu")renderSettings();}
function setGameUiVisible(visible){document.getElementById("gameUi").classList.toggle("hidden",!visible);}
function clearRunObjects(){state.enemies.length=0;state.projectiles.length=0;state.gems.length=0;state.particles.length=0;}

function resetRunState(){
  state.t=0;state.running=true;state.paused=true;state.gameOver=false;state.kills=0;state.eliteKills=0;state.spawnTimer=.35;state.result=null;
  clearRunObjects();Object.assign(player,createInitialPlayer());for(const key of Object.keys(owned))delete owned[key];resetSkillEngine();resetMovementAI();refreshSkillBar();refreshBuildTracker();
}

function startRun(modeId){const mode=MODES[modeId];if(!mode)return;state.mode=mode;resetRunState();state.starterSelectionsRemaining=mode.starterPicks;hideAllOverlays();setGameUiVisible(true);updateHud();setTimeout(()=>showLevelUp(true),120);}
function abandonRunToMenu(){state.running=false;state.paused=true;state.gameOver=false;clearRunObjects();setGameUiVisible(false);showScreen("mainMenu");}
function openPause(){if(!state.running||state.gameOver||document.getElementById("levelModal").classList.contains("visible"))return;state.paused=true;showScreen("pauseMenu");}
function resumeRun(){if(!state.running)return;hideAllOverlays();state.paused=false;}

function showLevelUp(isStarter=false){
  if(state.gameOver||!state.running)return;state.paused=true;
  const picks=getSkillChoices(isStarter,3);
  if(!picks.length){state.starterSelectionsRemaining=0;state.paused=false;return;}

  document.getElementById("skillPickEyebrow").textContent=isStarter?"STARTER BUILD":"LEVEL UP";
  document.getElementById("skillPickTitle").textContent=isStarter?"Chọn skill khởi đầu":"Lên cấp!";
  document.getElementById("skillPickDescription").textContent=isStarter
    ?`Còn ${state.starterSelectionsRemaining} lượt chọn khởi đầu trong ${state.mode.label}.`
    :`Skill MAX/Evolved đã bị loại khỏi pool. Ưu tiên combo nhưng vẫn giữ randomness.`;

  const container=document.getElementById("choices");container.innerHTML="";
  for(const key of picks){
    const skill=skills[key],next=skillLevel(key)+1,button=document.createElement("button");
    const tags=(skill.tags||[]).slice(0,5);
    const hints=getSkillRelationHints(key);
    button.className="choice"+(next>=skill.max?" maxNext":"");
    button.innerHTML=`
      <div class="icon">${skill.icon}</div>
      <h3>${skill.name}</h3>
      <div class="lvl">Cấp ${next}/${skill.max}${next>=skill.max?" · MAX":""}</div>
      <div class="tags">${tags.map(tag=>`<span class="tagChip">${tag}</span>`).join("")}</div>
      <div class="desc">${skill.desc(next)}</div>
      ${hints.length?`<div class="relationHints">${hints.map(h=>`<div class="relationHint ${h.type}">${h.text}</div>`).join("")}</div>`:""}
    `;
    button.onclick=()=>selectSkill(key,isStarter);container.appendChild(button);
  }
  hideAllOverlays();document.getElementById("levelModal").classList.add("visible");
}

function selectSkill(key,isStarter=false){
  if(!isSkillSelectable(key,isStarter))return;
  owned[key]=(owned[key]||0)+1;
  skills[key].apply(owned[key]);
  onSkillSelectedEngine(key);
  refreshSkillBar();
  refreshBuildTracker();
  if(isStarter){state.starterSelectionsRemaining--;if(state.starterSelectionsRemaining>0){setTimeout(()=>showLevelUp(true),70);return;}}
  hideAllOverlays();state.paused=false;
}

function refreshSkillBar(){
  const bar=document.getElementById("skillBar");bar.innerHTML="";const keys=getOwnedSkillKeys();
  if(!keys.length){bar.innerHTML=`<div class="skillMini"><b>Chưa có kỹ năng</b><small>Chọn starter build</small></div>`;return;}
  for(const key of keys){
    const evolved=isBaseEvolved(key);
    const element=document.createElement("div");element.className="skillMini"+(evolved?" evolved":"");
    const levelText=evolved?"EVOLVED":skillLevel(key)>=skills[key].max?"MAX":`Lv.${owned[key]}`;
    element.innerHTML=`<b>${getSkillDisplayIcon(key)} ${getSkillDisplayName(key)}</b><small>${levelText} · ${(skills[key].tags||[]).slice(0,2).join("/")}</small>`;bar.appendChild(element);
  }
  for(const synergy of Object.values(SYNERGIES)){
    if(!hasSynergy(synergy.id))continue;
    const element=document.createElement("div");element.className="skillMini synergy";element.innerHTML=`<b>${synergy.icon} ${synergy.name}</b><small>SYNERGY</small>`;bar.appendChild(element);
  }
}

function refreshBuildTracker(){
  const content=document.getElementById("buildTrackerContent");
  if(!content)return;
  const lines=[];
  for(const synergy of Object.values(SYNERGIES)){
    if(!hasSynergy(synergy.id))continue;
    lines.push(`<div class="buildLine unlocked"><span class="buildIcon">${synergy.icon}</span><div><b>${synergy.name}</b><small>SYNERGY · ${synergy.desc}</small></div></div>`);
  }
  for(const evolution of Object.values(EVOLUTIONS)){
    if(!hasEvolution(evolution.id))continue;
    lines.push(`<div class="buildLine evolution"><span class="buildIcon">${evolution.icon}</span><div><b>${evolution.name}</b><small>EVOLUTION · ${evolution.desc}</small></div></div>`);
  }
  const near=getNearBuildUnlocks(Math.max(0,4-lines.length));
  for(const entry of near){
    const missing=entry.progress.missing.map(p=>p.label).join(" + ")||"Sẵn sàng";
    lines.push(`<div class="buildLine near ${entry.kind==="evolution"?"evolution":""}"><span class="buildIcon">${entry.item.icon}</span><div><b>${entry.item.name}</b><small>${entry.kind==="evolution"?"EVOLVE GẦN":"COMBO GẦN"} · thiếu ${missing}</small></div></div>`);
  }
  content.innerHTML=lines.length?lines.slice(0,5).join(""):`<div class="buildEmpty">Chưa có combo. Chọn các skill có tag hoặc gợi ý liên kết trùng nhau để hình thành synergy.</div>`;
}

const unlockToastQueue=[];
let unlockToastActive=false;
function showNextBuildUnlockToast(){
  if(unlockToastActive||!unlockToastQueue.length)return;
  const payload=unlockToastQueue.shift(),toast=document.getElementById("unlockToast");
  if(!toast||!payload?.item)return;
  unlockToastActive=true;
  const evolution=payload.kind==="evolution";
  toast.classList.toggle("evolution",evolution);
  document.getElementById("unlockToastIcon").textContent=payload.item.icon||"✨";
  document.getElementById("unlockToastType").textContent=evolution?"EVOLUTION UNLOCKED":"SYNERGY UNLOCKED";
  document.getElementById("unlockToastTitle").textContent=payload.item.name;
  document.getElementById("unlockToastDesc").textContent=payload.item.desc||"Build của bạn vừa mở một liên kết mới.";
  toast.classList.remove("hidden");
  setTimeout(()=>{
    toast.classList.add("hidden");
    unlockToastActive=false;
    setTimeout(showNextBuildUnlockToast,180);
  },2600);
  refreshSkillBar();refreshBuildTracker();
}
function queueBuildUnlockToast(payload){unlockToastQueue.push(payload);showNextBuildUnlockToast();}
onSkillEvent("build_unlock",queueBuildUnlockToast);

function finishRun(outcome){
  if(state.gameOver)return;state.gameOver=true;state.running=false;state.paused=true;if(outcome==="victory"&&!state.mode.endless)state.t=state.mode.duration;
  const score=state.mode.endless?0:calculateRunScore(),newRecord=recordRun(outcome);state.result={outcome,score,newRecord};
  document.getElementById("resultBadge").textContent=outcome==="victory"?"VICTORY":"DEFEAT";
  document.getElementById("resultTitle").textContent=outcome==="victory"?"Chiến thắng!":"Run kết thúc";
  document.getElementById("resultSubtitle").textContent=state.mode.endless?`Bạn đã sống sót ${fmtTime(state.t)} trong Endless.`:outcome==="victory"?`Bạn đã sống sót trọn vẹn ${state.mode.label.toLowerCase()}.`:`Bạn chưa sống sót hết ${state.mode.label.toLowerCase()}.`;
  document.getElementById("resultTime").textContent=fmtTime(state.t);document.getElementById("resultKills").textContent=state.kills;document.getElementById("resultElites").textContent=state.eliteKills;document.getElementById("resultLevel").textContent=player.level;document.getElementById("resultScore").textContent=state.mode.endless?"—":score.toLocaleString("vi-VN");document.getElementById("recordNotice").classList.toggle("hidden",!newRecord);showScreen("resultModal");
}

function updateHud(){
  document.getElementById("hpBar").style.width=(player.hp/player.maxHp*100)+"%";document.getElementById("hpText").textContent=`${Math.ceil(player.hp)}/${Math.ceil(player.maxHp)}${player.shield>0?` +${Math.ceil(player.shield)}🛡`:""}`;
  document.getElementById("xpBar").style.width=(player.xp/player.xpNeed*100)+"%";document.getElementById("xpText").textContent=`${Math.floor(player.xp)}/${player.xpNeed}`;document.getElementById("lvText").textContent=player.level;document.getElementById("killText").textContent=state.kills;
  if(state.mode){document.getElementById("modeHud").textContent=state.mode.label;document.getElementById("timeIcon").textContent=state.mode.endless?"⏱":"⏳";const displayTime=state.mode.endless?state.t:Math.max(0,state.mode.duration-state.t);document.getElementById("timeText").textContent=fmtTime(displayTime);}
}
function fmtTime(time){const total=Math.max(0,Math.floor(time)),m=Math.floor(total/60),s=total%60;return String(m).padStart(2,"0")+":"+String(s).padStart(2,"0");}

function renderLeaderboardTabs(){const container=document.getElementById("leaderboardTabs");container.innerHTML="";for(const mode of Object.values(MODES)){const button=document.createElement("button");button.className="tabButton"+(leaderboardMode===mode.id?" active":"");button.textContent=mode.label;button.onclick=()=>{leaderboardMode=mode.id;renderLeaderboard();};container.appendChild(button);}}
function renderLeaderboard(){
  renderLeaderboardTabs();const mode=MODES[leaderboardMode],board=leaderboards[leaderboardMode]||[],content=document.getElementById("leaderboardContent");
  if(!board.length){content.innerHTML=`<div class="emptyState">${mode.endless?"Chưa có run Endless nào.":"Chưa có lần hoàn thành mode này."}</div>`;return;}
  const header=mode.endless?`<div class="leaderRow leaderHeader"><span>#</span><span>THỜI GIAN</span><span>KILLS</span><span>ELITE</span><span>LEVEL</span></div>`:`<div class="leaderRow leaderHeader"><span>#</span><span>SCORE</span><span>KILLS</span><span>ELITE</span><span>LEVEL</span></div>`;
  content.innerHTML=header+board.map((entry,index)=>`<div class="leaderRow"><span class="leaderRank">${index+1}</span><strong>${mode.endless?fmtTime(entry.time):entry.score.toLocaleString("vi-VN")}</strong><span>${entry.kills}</span><span>${entry.eliteKills||0}</span><span>Lv.${entry.level}</span></div>`).join("");
}
function renderSettings(){const particles=document.getElementById("particlesToggle"),autoPause=document.getElementById("autoPauseToggle");particles.textContent=settings.particles?"BẬT":"TẮT";particles.classList.toggle("on",settings.particles);autoPause.textContent=settings.autoPause?"BẬT":"TẮT";autoPause.classList.toggle("on",settings.autoPause);}
function openSettings(returnScreen){state.settingsReturnScreen=returnScreen;showScreen("settingsMenu");}

for(const button of document.querySelectorAll("[data-screen]"))button.addEventListener("click",()=>showScreen(button.dataset.screen));
for(const button of document.querySelectorAll("[data-mode]"))button.addEventListener("click",()=>startRun(button.dataset.mode));
document.querySelector(".settingsBack").addEventListener("click",()=>{if(state.settingsReturnScreen==="pauseMenu"&&state.running)showScreen("pauseMenu");else showScreen(state.settingsReturnScreen||"mainMenu");});
document.getElementById("pauseButton").addEventListener("click",openPause);document.getElementById("resumeButton").addEventListener("click",resumeRun);document.getElementById("restartRunButton").addEventListener("click",()=>startRun(state.mode.id));document.getElementById("pauseSettingsButton").addEventListener("click",()=>openSettings("pauseMenu"));document.getElementById("pauseMainMenuButton").addEventListener("click",abandonRunToMenu);document.getElementById("retryButton").addEventListener("click",()=>startRun(state.mode.id));document.getElementById("resultMainMenuButton").addEventListener("click",abandonRunToMenu);
document.getElementById("particlesToggle").addEventListener("click",()=>{settings.particles=!settings.particles;saveSettings();renderSettings();});document.getElementById("autoPauseToggle").addEventListener("click",()=>{settings.autoPause=!settings.autoPause;saveSettings();renderSettings();});document.querySelector('#mainMenu [data-screen="settingsMenu"]').addEventListener("click",()=>{state.settingsReturnScreen="mainMenu";});
addEventListener("keydown",event=>{if(event.key!=="Escape")return;if(document.getElementById("pauseMenu").classList.contains("visible"))resumeRun();else if(state.running&&!state.paused)openPause();});
addEventListener("blur",()=>{if(settings.autoPause&&state.running&&!state.paused)openPause();});

refreshSkillBar();refreshBuildTracker();renderSettings();showScreen("mainMenu");setGameUiVisible(false);document.title=`Auto Battle Roguelite ${GAME_VERSION}`;document.getElementById("version").textContent=`Auto Battle Roguelite ${GAME_VERSION}`;
