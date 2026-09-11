(()=>{
  const root=typeof window!=="undefined"?window:globalThis;
  const WRAPPED=Symbol.for("v018.duel.vfx.budget.wrapped");

  function quality(){
    const value=typeof root.getDuelVisualQuality==="function"?root.getDuelVisualQuality():null;
    return value&&typeof value==="object"?value:{id:"fallback",vfxTransientLimit:96,tierTransientLimit:48};
  }
  function positiveLimit(value,fallback){
    const number=Math.floor(Number(value));
    return Number.isFinite(number)&&number>0?number:fallback;
  }
  function trimOldest(effects,limit){
    if(!Array.isArray(effects)||effects.length<=limit)return 0;
    const excess=effects.length-limit;
    effects.splice(0,excess);
    return excess;
  }

  function wrapFactory(name,limitKey,fallbackLimit){
    const original=root[name];
    if(typeof original!=="function"||original[WRAPPED])return false;
    function wrappedFactory(...args){
      const instance=original(...args);
      if(!instance||!Array.isArray(instance.effects)||typeof instance.consume!=="function")return instance;
      let droppedPresentation=0;
      let peakActive=instance.effects.length;
      const originalConsume=instance.consume.bind(instance);
      const originalStatus=typeof instance.getStatus==="function"?instance.getStatus.bind(instance):()=>({active:instance.effects.length});
      instance.consume=function(events){
        originalConsume(events);
        peakActive=Math.max(peakActive,instance.effects.length);
        const profile=quality();
        const limit=positiveLimit(profile[limitKey],fallbackLimit);
        droppedPresentation+=trimOldest(instance.effects,limit);
        peakActive=Math.max(peakActive,instance.effects.length);
      };
      instance.getStatus=function(){
        const base=originalStatus()||{};
        const profile=quality();
        return{
          ...base,
          budget:{
            profile:profile.id||"unknown",
            limit:positiveLimit(profile[limitKey],fallbackLimit),
            droppedPresentation,
            peakActive
          }
        };
      };
      return instance;
    }
    wrappedFactory[WRAPPED]=true;
    wrappedFactory.__v018Original=original;
    root[name]=wrappedFactory;
    return true;
  }

  function installDuelVfxBudgets(){
    return{
      vfx:wrapFactory("createDuelVfxV2","vfxTransientLimit",96),
      tier:wrapFactory("createDuelVfxTierOverlay","tierTransientLimit",48)
    };
  }

  const installed=installDuelVfxBudgets();
  root.installDuelVfxBudgets=installDuelVfxBudgets;
  root.getDuelVfxBudgetInstallStatus=()=>({...installed});
})();
