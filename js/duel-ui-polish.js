(()=>{
  const root=typeof window!=="undefined"?window:globalThis;
  function bindDuelResultPresentation(){
    if(typeof document==="undefined")return;
    const card=document.querySelector("#duelResultMenu .duelResultCard"),badge=document.getElementById("duelResultBadge");
    if(!card||!badge)return;
    const sync=()=>{
      const label=String(badge.textContent||"").trim();
      card.classList.toggle("champion",label==="NHÀ VÔ ĐỊCH");
      card.classList.toggle("eliminated",label==="BỊ LOẠI");
    };
    sync();
    if(typeof MutationObserver==="function")new MutationObserver(sync).observe(badge,{childList:true,characterData:true,subtree:true});
  }
  if(typeof document!=="undefined"){
    if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",bindDuelResultPresentation,{once:true});
    else queueMicrotask(bindDuelResultPresentation);
  }
  root.bindDuelResultPresentation=bindDuelResultPresentation;
})();