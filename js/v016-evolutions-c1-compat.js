// V0.16 C1 compatibility bridge.
// Existing A1 mines can still be alive on the exact level-up that unlocks Thiên La Địa Võng.
// Normalize those pre-evolution objects so they participate in the documented chain system too.

(()=>{
  function normalizeExistingHeavenNetMines(){
    const mines=state.v016A1?.mines;
    if(!mines)return;
    for(const mine of mines){
      if(mine.chainAt===undefined)mine.chainAt=null;
      if(mine.chainScale===undefined)mine.chainScale=1;
    }
  }

  onSkillEvent("build_unlock",payload=>{
    if(payload?.kind==="evolution"&&payload.item?.id==="heavenNet")normalizeExistingHeavenNetMines();
  });

  // Also covers hot-loaded development builds where the evolution state was already set.
  if(typeof hasEvolution==="function"&&hasEvolution("heavenNet"))normalizeExistingHeavenNetMines();
})();
