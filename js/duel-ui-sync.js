(()=>{
  function restoreDuelCardScrolling(){
    const selectors=[
      "#duelLobbyMenu .duelLobbyCard",
      "#duelPreMatchMenu .duelPreCard",
      "#duelSkillModal .duelSkillCard",
      "#duelResultMenu .duelResultCard"
    ];
    for(const selector of selectors){
      const card=document.querySelector(selector);
      if(!card)continue;
      card.style.overflowX="hidden";
      card.style.overflowY="auto";
      card.style.overscrollBehavior="contain";
      card.style.webkitOverflowScrolling="touch";
      card.style.scrollPaddingBottom="max(18px, calc(env(safe-area-inset-bottom) + 12px))";
    }
  }

  function syncDuelReleaseUi(){
    restoreDuelCardScrolling();
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
    if(eyebrow)eyebrow.textContent="V0.19 · ĐẤU TRƯỜNG 1V1";
  }

  function bootstrapV020EnemyPresentation(){
    if(typeof document==="undefined"||typeof window.drawEnemySilhouetteV014!=="function")return;
    if(document.querySelector('script[data-v020-enemy-presentation]'))return;
    const script=document.createElement('script');
    script.src='js/v020-enemy-presentation.js?v=020-b4-runtime1';
    script.async=false;
    script.dataset.v020EnemyPresentation='true';
    script.onerror=()=>console.warn('V0.20 enemy presentation unavailable; V0.14 fallback remains active.');
    document.head.appendChild(script);
  }

  syncDuelReleaseUi();
  bootstrapV020EnemyPresentation();
  window.syncDuelPrototypeCount=syncDuelReleaseUi;
  window.syncDuelReleaseUi=syncDuelReleaseUi;
})();
