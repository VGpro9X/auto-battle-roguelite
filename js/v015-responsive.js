// V0.15 — responsive interaction helpers.
// Presentation/UI only: does not alter movement, combat or skill mechanics.

(()=>{
  const tracker=document.getElementById("buildTracker");
  const toggle=document.getElementById("buildTrackerToggle");
  if(!tracker||!toggle)return;

  const compactQuery=matchMedia("(max-width: 700px), (max-height: 520px) and (orientation: landscape)");

  function setTrackerOpen(open){
    const active=Boolean(open&&compactQuery.matches);
    tracker.classList.toggle("mobileOpen",active);
    toggle.classList.toggle("active",active);
    toggle.setAttribute("aria-expanded",active?"true":"false");
    toggle.textContent=active?"✕ ĐÓNG LIÊN KẾT":"☰ BỘ KỸ NĂNG";
  }

  function syncResponsiveState(){
    if(!compactQuery.matches)setTrackerOpen(false);
  }

  toggle.addEventListener("click",()=>setTrackerOpen(!tracker.classList.contains("mobileOpen")));

  // Close the drawer when a new run/screen action begins so it never obscures a modal.
  for(const button of document.querySelectorAll("[data-mode],[data-screen]")){
    button.addEventListener("click",()=>setTrackerOpen(false));
  }
  for(const id of ["pauseButton","resumeButton","restartRunButton","retryButton","resultMainMenuButton","pauseMainMenuButton"]){
    document.getElementById(id)?.addEventListener("click",()=>setTrackerOpen(false));
  }

  // Capture Escape before the global pause handler when the drawer itself is open.
  addEventListener("keydown",event=>{
    if(event.key!=="Escape"||!tracker.classList.contains("mobileOpen"))return;
    event.preventDefault();
    event.stopImmediatePropagation();
    setTrackerOpen(false);
  },true);

  if(typeof compactQuery.addEventListener==="function")compactQuery.addEventListener("change",syncResponsiveState);
  else if(typeof compactQuery.addListener==="function")compactQuery.addListener(syncResponsiveState);
  addEventListener("orientationchange",()=>setTimeout(syncResponsiveState,80));
  addEventListener("resize",syncResponsiveState,{passive:true});

  setTrackerOpen(false);
})();
