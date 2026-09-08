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
  const picks=typeof getLevelUpChoices==="function"?getLevelUpChoices(isStarter,3):getSkillChoices(isStarter,3).map(key=>({kind:"skill",key}));
  if(!picks.length){state.starterSelectionsRemaining=0;state.paused=false;return;}

  document.getElementById("skillPickEyebrow").textContent=isStarter?"KHỞI ĐẦU":"LÊN CẤP";
  document.getElementById("skillPickTitle").textContent=isStarter?"Chọn kỹ năng khởi đầu":"Lên cấp!";
  document.getElementById("skillPickDescription").textContent=isStarter
    ?`Còn ${state.starterSelectionsRemaining} lượt chọn khởi đầu trong ${state.mode.label}.`
    :`Kỹ năng TỐI ĐA/Siêu Cấp đã rời khỏi pool. Thần Kỹ và Thần Bí Kỹ có thể xuất hiện cực hiếm.`;

  const container=document.getElementById("choices");container.innerHTML="";
  for(const pick of picks){
    const button=document.createElement("button");
    if(pick.kind==="divine"){
      const item=DIVINE_SKILLS[pick.key];
      button.className=`choice divineChoice ${item.tier}`;
      button.innerHTML=`
        <div class="icon">${item.icon}</div>
        <h3>${item.name}</h3>
        <div class="lvl">${getDivineTierLabel(item)} · DUY NHẤT · KHÔNG CÓ CẤP</div>
        <div class="tags"><span class="tagChip">QUY TẮC</span><span class="tagChip">HIẾM</span></div>
        <div class="desc">${item.desc}</div>
        <div class="relationHints"><div class="relationHint divine">Chọn một lần để thay đổi luật của run này.</div></div>
      `;
      button.onclick=()=>selectLevelUpChoice(pick,isStarter);
      container.appendChild(button);
      continue;
    }

    const key=pick.key,skill=skills[key],next=skillLevel(key)+1;
    const tags=(skill.tags||[]).slice(0,5);
    const hints=getSkillRelationHints(key);
    button.className="choice"+(next>=skill.max?" maxNext":"");
    button.innerHTML=`
      <div class="icon">${skill.icon}</div>
      <h3>${skill.name}</h3>
      <div class="lvl">Cấp ${next}/${skill.max}${next>=skill.max?" · TỐI ĐA":""}</div>
      <div class="tags">${tags.map(tag=>`<span class="tagChip">${typeof getTagLabel==="function"?getTagLabel(tag):tag}</span>`).join("")}</div>
      <div class="desc">${skill.desc(next)}</div>
      ${hints.length?`<div class="relationHints">${hints.map(h=>`<div class="relationHint ${h.type}">${h.text}</div>`).join("")}</div>`:""}
    `;
    button.onclick=()=>selectLevelUpChoice(pick,isStarter);container.appendChild(button);
  }
  hideAllOverlays();document.getElementById("levelModal").classList.add("visible");
}

function selectLevelUpChoice(pick,isStarter=false){
  if(pick.kind==="divine"){
    if(!grantDivineSkill(pick.key))return;
    refreshSkillBar();refreshBuildTracker();
    hideAllOverlays();state.paused=false;
    return;
  }
  selectSkill(pick.key,isStarter);
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
  if(!keys.length){bar.innerHTML=`<div class="skillMini"><b>Chưa có kỹ năng</b><small>Chọn kỹ năng khởi đầu</small></div>`;return;}
  for(const key of keys){
    const evolved=isBaseEvolved(key);
    const element=document.createElement("div");element.className="skillMini"+(evolved?" evolved":"");
    const levelText=evolved?"SIÊU CẤP":skillLevel(key)>=skills[key].max?"TỐI ĐA":`Cấp ${owned[key]}`;
    const tagText=(skills[key].tags||[]).slice(0,2).map(tag=>typeof getTagLabel==="function"?getTagLabel(tag):tag).join("/");
    element.innerHTML=`<b>${getSkillDisplayIcon(key)} ${getSkillDisplayName(key)}</b><small>${levelText}${tagText?` · ${tagText}`:""}</small>`;bar.appendChild(element);
  }
  if(typeof DIVINE_SKILLS!=="undefined"){
    for(const id of getOwnedDivineSkillIds()){
      const item=DIVINE_SKILLS[id];
      const element=document.createElement("div");
      element.className=`skillMini ${item.tier==="mystic"?"mysticSkill":"divineSkill"}`;
      element.innerHTML=`<b>${item.icon} ${item.name}</b><small>${getDivineTierLabel(item)} · DUY NHẤT</small>`;
      bar.appendChild(element);
    }
  }
  for(const synergy of Object.values(SYNERGIES)){
    if(!hasSynergy(synergy.id))continue;
    const element=document.createElement("div");element.className="skillMini synergy";element.innerHTML=`<b>${synergy.icon} ${synergy.name}</b><small>HỢP ĐẠO KỸ</small>`;bar.appendChild(element);
  }
}

function refreshBuildTracker(){
  const content=document.getElementById("buildTrackerContent");
  if(!content)return;
  const lines=[];
  for(const synergy of Object.values(SYNERGIES)){
    if(!hasSynergy(synergy.id))continue;
    lines.push(`<div class="buildLine unlocked"><span class="buildIcon">${synergy.icon}</span><div><b>${synergy.name}</b><small>HỢP ĐẠO KỸ · ${synergy.desc}</small></div></div>`);
  }
  for(const evolution of Object.values(EVOLUTIONS)){
    if(!hasEvolution(evolution.id))continue;
    lines.push(`<div class="buildLine evolution"><span class="buildIcon">${evolution.icon}</span><div><b>${evolution.name}</b><small>SIÊU CẤP · ${evolution.desc}</small></div></div>`);
  }
  const near=getNearBuildUnlocks(Math.max(0,4-lines.length));
  for(const entry of near){
    const missing=entry.progress.missing.map(p=>p.label).join(" + ")||"Sẵn sàng";
    lines.push(`<div class="buildLine near ${entry.kind==="evolution"?"evolution":""}"><span class="buildIcon">${entry.item.icon}</span><div><b>${entry.item.name}</b><small>${entry.kind==="evolution"?"GẦN SIÊU CẤP":"GẦN HỢP ĐẠO"} · thiếu ${missing}</small></div></div>`);
  }
  content.innerHTML=lines.length?lines.slice(0,5).join(""):`<div class="buildEmpty">Chưa có liên kết. Chọn các kỹ năng có tag hoặc gợi ý liên quan để hình thành Hợp Đạo Kỹ.</div>`;
}

const unlockToastQueue=[];
let unlockToastActive=false;
function showNextBuildUnlockToast(){
  if(unlockToastActive||!unlockToastQueue.length)return;
  const payload=unlockToastQueue.shift(),toast=document.getElementById("unlockToast");
  if(!toast||!payload?.item)return;
  unlockToastActive=true;
  const evolution=payload.kind==="evolution";
  const divine=payload.kind==="divine";
  const mystic=payload.kind==="mystic";
  toast.classList.toggle("evolution",evolution);
  toast.classList.toggle("divine",divine);
  toast.classList.toggle("mystic",mystic);
  document.getElementById("unlockToastIcon").textContent=payload.item.icon||"✨";
  document.getElementById("unlockToastType").textContent=mystic?"THẦN BÍ KỸ XUẤT HIỆN":divine?"THẦN KỸ XUẤT HIỆN":evolution?"SIÊU CẤP KÍCH HOẠT":"HỢP ĐẠO KỸ KÍCH HOẠT";
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
  document.getElementById("resultBadge").textContent=outcome==="victory"?"CHIẾN THẮNG":"THẤT BẠI";
  document.getElementById("resultTitle").textContent=outcome==="victory"?"Chiến thắng!":"Run kết thúc";
  document.getElementById("resultSubtitle").textContent=state.mode.endless?`Bạn đã sống sót ${fmtTime(state.t)} trong Vô Hạn.`:outcome==="victory"?`Bạn đã sống sót trọn vẹn ${state.mode.label.toLowerCase()}.`:`Bạn chưa sống sót hết ${state.mode.label.toLowerCase()}.`;
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
  if(!board.length){content.innerHTML=`<div class="emptyState">${mode.endless?"Chưa có run Vô Hạn nào.":"Chưa có lần hoàn thành chế độ này."}</div>`;return;}
  const header=mode.endless?`<div class="leaderRow leaderHeader"><span>#</span><span>THỜI GIAN</span><span>HẠ GỤC</span><span>TINH ANH</span><span>CẤP</span></div>`:`<div class="leaderRow leaderHeader"><span>#</span><span>ĐIỂM</span><span>HẠ GỤC</span><span>TINH ANH</span><span>CẤP</span></div>`;
  content.innerHTML=header+board.map((entry,index)=>`<div class="leaderRow"><span class="leaderRank">${index+1}</span><strong>${mode.endless?fmtTime(entry.time):entry.score.toLocaleString("vi-VN")}</strong><span>${entry.kills}</span><span>${entry.eliteKills||0}</span><span>Cấp ${entry.level}</span></div>`).join("");
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
