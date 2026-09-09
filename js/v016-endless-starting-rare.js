// V0.16 Vô Hạn starting rare flow.
// Every Endless run gets exactly one uniformly random rare from the full current pool
// before the normal starter Kỹ Năng screen. Later level-up rare offers remain enabled.

(()=>{
  const runtime=state.v016EndlessRare={startingRareId:null,revealActive:false};

  function ensureRevealUi(){
    let overlay=document.getElementById("endlessRareReveal");
    if(overlay)return overlay;

    const style=document.createElement("style");
    style.textContent=`
      #endlessRareReveal{position:absolute;inset:0;z-index:60;display:none;align-items:center;justify-content:center;padding:max(16px,env(safe-area-inset-top)) max(16px,env(safe-area-inset-right)) max(16px,env(safe-area-inset-bottom)) max(16px,env(safe-area-inset-left));background:radial-gradient(circle at 50% 38%,rgba(109,86,177,.22),rgba(5,7,11,.90) 62%);backdrop-filter:blur(9px);pointer-events:auto}
      #endlessRareReveal.visible{display:flex}
      .endlessRareCard{width:min(520px,calc(100vw - 28px));max-height:min(720px,calc(100dvh - 28px));overflow:auto;text-align:center;background:rgba(20,22,31,.97);border:1px solid rgba(205,183,255,.28);border-radius:22px;padding:28px 24px;box-shadow:0 28px 100px rgba(0,0,0,.60)}
      .endlessRareIcon{font-size:58px;line-height:1;margin:10px 0 12px}.endlessRareTier{font-size:11px;letter-spacing:.18em;font-weight:900;color:#c8b5ff}.endlessRareCard.mystic .endlessRareTier{color:#d5a6ff}.endlessRareCard.divine .endlessRareTier{color:#ffd786}
      .endlessRareCard h2{font-size:34px;margin:7px 0 12px}.endlessRareDesc{color:#d0d4df;line-height:1.55;font-size:14px;margin:0 auto 16px}.endlessRareRule{font-size:11px;line-height:1.5;color:#8f98aa;margin:0 auto 22px;max-width:420px}
      #endlessRareContinue{width:100%;min-height:50px;border:0;border-radius:13px;background:#f0f0f0;color:#111;font-weight:900;cursor:pointer}
      @media(max-width:520px){.endlessRareCard{padding:22px 18px}.endlessRareIcon{font-size:48px}.endlessRareCard h2{font-size:28px}}
    `;
    document.head.appendChild(style);

    overlay=document.createElement("div");
    overlay.id="endlessRareReveal";
    overlay.setAttribute("role","dialog");
    overlay.setAttribute("aria-modal","true");
    overlay.innerHTML=`
      <div id="endlessRareCard" class="endlessRareCard">
        <div class="eyebrow">VÔ HẠN · QUY TẮC KHỞI ĐẦU</div>
        <div id="endlessRareIcon" class="endlessRareIcon">✦</div>
        <div id="endlessRareTier" class="endlessRareTier">THẦN KỸ</div>
        <h2 id="endlessRareName"></h2>
        <p id="endlessRareDesc" class="endlessRareDesc"></p>
        <p class="endlessRareRule">Kỹ năng này đã được nhận ngay khi bắt đầu. Các lần lên cấp sau vẫn có thể xuất hiện Thần Kỹ/Thần Bí Kỹ khác theo tỉ lệ cấp hiện tại; kỹ năng đã sở hữu không thể xuất hiện lại.</p>
        <button id="endlessRareContinue" type="button">TIẾP TỤC · CHỌN KỸ NĂNG</button>
      </div>
    `;
    document.getElementById("gameWrap").appendChild(overlay);
    document.getElementById("endlessRareContinue").addEventListener("click",acknowledgeStartingRare);
    return overlay;
  }

  function clearGenericUnlockToast(){
    // Starting rare has its own dedicated reveal. Suppress only the redundant generic
    // unlock toast generated synchronously by grantDivineSkill; ordinary later rares keep it.
    try{if(typeof unlockToastQueue!=="undefined")unlockToastQueue.length=0;}catch{}
    try{if(typeof unlockToastActive!=="undefined")unlockToastActive=false;}catch{}
    const toast=document.getElementById("unlockToast");
    if(toast)toast.classList.add("hidden");
  }

  function getStartingRareCandidates(){
    return Object.keys(DIVINE_SKILLS).filter(id=>!hasDivineSkill(id));
  }

  function chooseUniformStartingRare(){
    const candidates=getStartingRareCandidates();
    if(!candidates.length)return null;
    return candidates[Math.floor(Math.random()*candidates.length)];
  }

  function showStartingRareReveal(id){
    const item=DIVINE_SKILLS[id];
    if(!item)return false;
    const overlay=ensureRevealUi();
    const card=document.getElementById("endlessRareCard");
    card.classList.toggle("mystic",item.tier==="mystic");
    card.classList.toggle("divine",item.tier!=="mystic");
    document.getElementById("endlessRareIcon").textContent=item.icon||"✦";
    document.getElementById("endlessRareTier").textContent=getDivineTierLabel(item);
    document.getElementById("endlessRareName").textContent=item.name;
    document.getElementById("endlessRareDesc").textContent=typeof localizeGameText==="function"?localizeGameText(item.desc):item.desc;
    runtime.revealActive=true;
    overlay.classList.add("visible");
    return true;
  }

  function acknowledgeStartingRare(){
    if(!runtime.revealActive||!state.running||state.gameOver)return;
    runtime.revealActive=false;
    const overlay=document.getElementById("endlessRareReveal");
    if(overlay)overlay.classList.remove("visible");
    // Exactly one normal starter flow begins after acknowledgement. The existing starter
    // system handles the configured starterSelectionsRemaining value (1 for Endless).
    setTimeout(()=>showLevelUp(true),60);
  }

  function startEndlessWithRare(mode){
    state.mode=mode;
    resetRunState();
    state.starterSelectionsRemaining=mode.starterPicks;
    hideAllOverlays();
    setGameUiVisible(true);
    updateHud();

    const id=chooseUniformStartingRare();
    if(!id||!grantDivineSkill(id)){
      // Defensive fallback: never trap a playable run if the pool is unexpectedly empty.
      runtime.startingRareId=null;
      setTimeout(()=>showLevelUp(true),120);
      return;
    }

    runtime.startingRareId=id;
    refreshSkillBar();
    refreshBuildTracker();
    clearGenericUnlockToast();
    setTimeout(()=>showStartingRareReveal(id),120);
  }

  const baseStartRunV016=startRun;
  startRun=function(modeId){
    const mode=MODES[modeId];
    if(!mode?.endless)return baseStartRunV016(modeId);
    return startEndlessWithRare(mode);
  };

  const baseResetSkillEngineEndless=resetSkillEngine;
  resetSkillEngine=function(){
    const result=baseResetSkillEngineEndless();
    runtime.startingRareId=null;
    runtime.revealActive=false;
    const overlay=document.getElementById("endlessRareReveal");
    if(overlay)overlay.classList.remove("visible");
    return result;
  };

  // Development/test introspection only; this is state, not an executable harness.
  runtime.getStartingRareCandidates=getStartingRareCandidates;
})();
