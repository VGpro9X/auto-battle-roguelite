(()=>{
  const root=typeof window!=="undefined"?window:globalThis;
  const REQUIRED_STATES=["idle","walk","run","dash","melee","ranged","cast","hit","block","knockback","knockdown","recover","ko"];
  const REQUIRED_ANCHORS=["head","chest","leftHand","rightHand","feet","front","back","target"];

  function clamp(v,a,b){return Math.max(a,Math.min(b,v));}

  function normalizeDuelVisualState(action){
    return REQUIRED_STATES.includes(action)?action:"idle";
  }

  function getFrameCount(animation){return Math.max(1,Number(animation?.frames)||1);}

  function resolveDuelAnimationFrame(animation,elapsed=0){
    if(!animation)return 0;
    const frames=getFrameCount(animation),fps=Math.max(.001,Number(animation.fps)||1);
    const raw=Math.floor(Math.max(0,elapsed)*fps);
    return animation.loop===false?clamp(raw,0,frames-1):raw%frames;
  }

  function normalizeAnchor(value,fallback={x:0,y:0}){
    if(Array.isArray(value))return{x:Number(value[0])||0,y:Number(value[1])||0};
    if(value&&typeof value==="object")return{x:Number(value.x)||0,y:Number(value.y)||0};
    return{x:fallback.x||0,y:fallback.y||0};
  }

  function resolveDuelFrameAnchors(animation,frameIndex){
    const list=animation?.anchors;
    const frame=Array.isArray(list)?(list[frameIndex]||list[list.length-1]||{}):{};
    const result={};
    for(const name of REQUIRED_ANCHORS)result[name]=normalizeAnchor(frame?.[name]);
    return result;
  }

  function createDuelAnimationResolver(){
    const states=new Map();
    return{
      resolve(fighter,roundTime,manifest){
        const id=`${fighter?.side||"fighter"}:${fighter?.id||"unknown"}`;
        const state=normalizeDuelVisualState(fighter?.action);
        const animation=typeof getDuelVisualAnimation==="function"?getDuelVisualAnimation(manifest,state):manifest?.animations?.[state];
        if(!animation)return null;
        const token=`${state}:${Number(fighter?.actionUntil||0).toFixed(4)}`;
        let tracked=states.get(id);
        if(!tracked||tracked.token!==token){tracked={token,state,startedAt:Number(roundTime)||0};states.set(id,tracked);}
        const elapsed=Math.max(0,(Number(roundTime)||0)-tracked.startedAt);
        const frameIndex=resolveDuelAnimationFrame(animation,elapsed);
        return{state,animation,frameIndex,elapsed,anchors:resolveDuelFrameAnchors(animation,frameIndex)};
      },
      reset(){states.clear();}
    };
  }

  root.DUEL_VISUAL_STATES=Object.freeze([...REQUIRED_STATES]);
  root.DUEL_VISUAL_ANCHORS=Object.freeze([...REQUIRED_ANCHORS]);
  root.normalizeDuelVisualState=normalizeDuelVisualState;
  root.resolveDuelAnimationFrame=resolveDuelAnimationFrame;
  root.resolveDuelFrameAnchors=resolveDuelFrameAnchors;
  root.createDuelAnimationResolver=createDuelAnimationResolver;
})();