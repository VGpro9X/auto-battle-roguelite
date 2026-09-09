(()=>{
  function syncDuelPrototypeCount(){
    if(typeof DUEL_SKILL_KEYS==="undefined")return;
    const rules=document.querySelectorAll("#duelLobbyMenu .duelRuleList > div");
    for(const rule of rules){
      const small=rule.querySelector("small");
      const strong=rule.querySelector("b");
      if(!small||!strong)continue;
      if(small.textContent.includes("mở rộng dần")||strong.textContent.includes("kỹ năng prototype")){
        strong.textContent=`${DUEL_SKILL_KEYS.length} kỹ năng prototype`;
      }
    }
  }
  syncDuelPrototypeCount();
  window.syncDuelPrototypeCount=syncDuelPrototypeCount;
})();
