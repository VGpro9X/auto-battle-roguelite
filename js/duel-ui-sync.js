(()=>{
  function syncDuelReleaseUi(){
    if(typeof DUEL_SKILL_KEYS!=="undefined"){
      const rules=document.querySelectorAll("#duelLobbyMenu .duelRuleList > div");
      for(const rule of rules){
        const small=rule.querySelector("small");
        const strong=rule.querySelector("b");
        if(!small||!strong)continue;
        if(small.textContent.includes("mở rộng dần")||strong.textContent.includes("kỹ năng prototype"))strong.textContent=`${DUEL_SKILL_KEYS.length} kỹ năng`;
      }
    }
    const eyebrow=document.querySelector("#duelLobbyMenu .screenHeader .eyebrow");
    if(eyebrow)eyebrow.textContent="V0.17 · ĐẤU TRƯỜNG 1V1";
  }
  syncDuelReleaseUi();
  window.syncDuelPrototypeCount=syncDuelReleaseUi;
  window.syncDuelReleaseUi=syncDuelReleaseUi;
})();
