// V0.15 — responsive interaction helpers.
// Presentation/UI only: does not alter movement, combat or skill mechanics.

(()=>{
  const tracker=document.getElementById("buildTracker");
  const toggle=document.getElementById("buildTrackerToggle");
  if(!tracker||!toggle)return;

  const compactQuery=matchMedia("(max-width: 700px), (max-height: 520px) and (orientation: landscape)");
  const codexMenu=document.getElementById("skillCodexMenu");
  const codexCatalog=document.getElementById("codexCatalog");
  const codexTabs=document.getElementById("codexTabs");
  const codexDetail=document.getElementById("codexDetail");

  let codexBack=null;
  let layoutRaf=0;
  if(codexDetail){
    codexBack=document.createElement("button");
    codexBack.type="button";
    codexBack.className="codexDetailBack";
    codexBack.textContent="← DANH SÁCH KỸ NĂNG";
    codexDetail.prepend(codexBack);
  }

  function setTrackerOpen(open){
    const active=Boolean(open&&compactQuery.matches);
    tracker.classList.toggle("mobileOpen",active);
    toggle.classList.toggle("active",active);
    toggle.setAttribute("aria-expanded",active?"true":"false");
    toggle.textContent=active?"✕ ĐÓNG LIÊN KẾT":"☰ BỘ KỸ NĂNG";
  }

  function setCodexDetailOpen(open){
    const active=Boolean(open&&compactQuery.matches&&codexMenu);
    codexMenu?.classList.toggle("mobileDetailOpen",active);
    if(active){
      codexDetail?.scrollTo({top:0,behavior:"auto"});
      requestAnimationFrame(()=>codexBack?.focus({preventScroll:true}));
    }
  }

  function syncResponsiveState(){
    if(!compactQuery.matches){
      setTrackerOpen(false);
      setCodexDetailOpen(false);
    }
  }

  function requestLayoutSync(){
    if(layoutRaf)return;
    layoutRaf=requestAnimationFrame(()=>{
      layoutRaf=0;
      syncResponsiveState();
      // Core resize is presentation-only and recalculates Canvas pixel dimensions.
      if(typeof resize==="function")resize();
    });
  }

  toggle.addEventListener("click",()=>setTrackerOpen(!tracker.classList.contains("mobileOpen")));

  // Codex cards already support click; this only changes compact-screen navigation.
  codexCatalog?.addEventListener("click",event=>{
    if(!event.target.closest(".codexSkillCard"))return;
    if(compactQuery.matches)setCodexDetailOpen(true);
  });
  codexTabs?.addEventListener("click",()=>setCodexDetailOpen(false));
  codexBack?.addEventListener("click",()=>setCodexDetailOpen(false));

  // Close temporary panels when a new run/screen action begins so they never obscure a modal.
  for(const button of document.querySelectorAll("[data-mode],[data-screen]")){
    button.addEventListener("click",()=>{
      setTrackerOpen(false);
      if(button.dataset.screen!=="skillCodexMenu")setCodexDetailOpen(false);
    });
  }
  for(const id of ["pauseButton","resumeButton","restartRunButton","retryButton","resultMainMenuButton","pauseMainMenuButton"]){
    document.getElementById(id)?.addEventListener("click",()=>setTrackerOpen(false));
  }

  // Capture Escape before the global pause handler when a compact panel itself is open.
  addEventListener("keydown",event=>{
    if(event.key!=="Escape")return;
    if(codexMenu?.classList.contains("mobileDetailOpen")){
      event.preventDefault();
      event.stopImmediatePropagation();
      setCodexDetailOpen(false);
      return;
    }
    if(tracker.classList.contains("mobileOpen")){
      event.preventDefault();
      event.stopImmediatePropagation();
      setTrackerOpen(false);
    }
  },true);

  // Mobile browsers do not always emit window blur reliably when switching apps/tabs.
  document.addEventListener("visibilitychange",()=>{
    if(!document.hidden)return;
    if(typeof settings!=="undefined"&&settings.autoPause&&state.running&&!state.paused&&typeof openPause==="function")openPause();
  });

  if(typeof compactQuery.addEventListener==="function")compactQuery.addEventListener("change",requestLayoutSync);
  else if(typeof compactQuery.addListener==="function")compactQuery.addListener(requestLayoutSync);
  addEventListener("orientationchange",()=>setTimeout(requestLayoutSync,80));
  addEventListener("resize",requestLayoutSync,{passive:true});
  if(window.visualViewport){
    visualViewport.addEventListener("resize",requestLayoutSync,{passive:true});
    visualViewport.addEventListener("scroll",requestLayoutSync,{passive:true});
  }

  setTrackerOpen(false);
  setCodexDetailOpen(false);
})();
