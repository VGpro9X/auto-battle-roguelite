(()=>{
  const root=typeof window!=="undefined"?window:globalThis;

  const PROFILES=Object.freeze({
    full:Object.freeze({
      id:"full",
      dprCap:2,
      vfxTransientLimit:96,
      tierTransientLimit:48,
      shakeMultiplier:1,
      zoomKickMultiplier:1,
      ambientMultiplier:1
    }),
    constrained:Object.freeze({
      id:"constrained",
      dprCap:1.5,
      vfxTransientLimit:64,
      tierTransientLimit:32,
      shakeMultiplier:.65,
      zoomKickMultiplier:.75,
      ambientMultiplier:.72
    })
  });

  function finite(value,fallback){const number=Number(value);return Number.isFinite(number)?number:fallback;}
  function queryValue(name){
    if(typeof location==="undefined")return null;
    try{return new URLSearchParams(location.search).get(name);}catch(_){return null;}
  }
  function prefersReducedMotion(){
    if(typeof matchMedia!=="function")return false;
    try{return Boolean(matchMedia("(prefers-reduced-motion: reduce)").matches);}catch(_){return false;}
  }

  function resolveDuelVisualQuality(options={}){
    const width=Math.max(1,finite(options.width,typeof innerWidth!=="undefined"?innerWidth:1280));
    const height=Math.max(1,finite(options.height,typeof innerHeight!=="undefined"?innerHeight:720));
    const memory=finite(options.deviceMemory,typeof navigator!=="undefined"?navigator.deviceMemory:NaN);
    const cores=finite(options.hardwareConcurrency,typeof navigator!=="undefined"?navigator.hardwareConcurrency:NaN);
    const requested=options.profile||queryValue("duelQuality");
    const forced=requested==="full"||requested==="constrained"?requested:null;
    const mobile=width<620;
    const shortViewport=height<520;
    const lowMemory=Number.isFinite(memory)&&memory<=4;
    const lowCore=Number.isFinite(cores)&&cores<=4;
    const profileId=forced||(mobile||shortViewport||lowMemory||lowCore?"constrained":"full");
    const base=PROFILES[profileId];
    const requestedMotion=options.reducedMotion;
    const motionQuery=queryValue("duelMotion");
    const reducedMotion=typeof requestedMotion==="boolean"
      ? requestedMotion
      : motionQuery==="reduce"?true:motionQuery==="full"?false:prefersReducedMotion();
    return Object.freeze({
      ...base,
      reducedMotion,
      mobile,
      shortViewport,
      lowMemory,
      lowCore,
      width,
      height,
      deviceMemory:Number.isFinite(memory)?memory:null,
      hardwareConcurrency:Number.isFinite(cores)?cores:null,
      shakeMultiplier:reducedMotion?0:base.shakeMultiplier,
      zoomKickMultiplier:reducedMotion?0:base.zoomKickMultiplier,
      motionMultiplier:reducedMotion?0:1,
      reason:forced?`forced:${forced}`:[mobile&&"mobile",shortViewport&&"short",lowMemory&&"memory",lowCore&&"cores"].filter(Boolean).join("+")||"default"
    });
  }

  let current=resolveDuelVisualQuality();
  function getDuelVisualQuality(){return current;}
  function refreshDuelVisualQuality(options={}){current=resolveDuelVisualQuality(options);return current;}
  function getDuelVisualQualityStatus(){return{...current};}

  root.DUEL_VISUAL_QUALITY_PROFILES=PROFILES;
  root.resolveDuelVisualQuality=resolveDuelVisualQuality;
  root.getDuelVisualQuality=getDuelVisualQuality;
  root.refreshDuelVisualQuality=refreshDuelVisualQuality;
  root.getDuelVisualQualityStatus=getDuelVisualQualityStatus;
})();
