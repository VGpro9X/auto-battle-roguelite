(()=>{
  const root=typeof window!=="undefined"?window:globalThis;
  const DEFAULT_MANIFEST="assets/duel/fighters/base/manifest.json";
  const createVectorRenderer=root.createDuelRenderer;

  function getDuelRendererMode(){
    if(root.DUEL_RENDERER_V2_ENABLED===false)return"vector";
    if(typeof location!=="undefined"){
      const requested=new URLSearchParams(location.search).get("duelRenderer");
      if(requested==="vector")return"vector";
      if(requested==="v2")return"v2";
    }
    return"v2";
  }

  function createDuelRendererV2(canvas,{manifestUrl=DEFAULT_MANIFEST}={}){
    if(!canvas)throw new Error("Duel Renderer V2 requires a canvas");
    if(typeof createVectorRenderer!=="function")throw new Error("Vector Duel renderer unavailable");
    const fallback=createVectorRenderer(canvas);
    const ctx=canvas.getContext("2d");
    const animationResolver=typeof createDuelAnimationResolver==="function"?createDuelAnimationResolver():null;
    let manifest=null;
    let manifestError=null;
    let ready=false;
    const images=new Map();
    const lastFrames=new Map();

    const preload=(async()=>{
      try{
        manifest=await loadDuelVisualManifest(manifestUrl);
        const sources=[...new Set(Object.values(manifest.animations||{}).map(item=>item?.src).filter(Boolean))];
        await Promise.all(sources.map(async src=>{images.set(src,await loadDuelVisualImage(src,manifest.__url));}));
        ready=true;
      }catch(error){manifestError=error;ready=false;console.warn("Duel Renderer V2 fallback active:",error);}
    })();

    function getTransform(match){
      const rect=canvas.getBoundingClientRect();
      const width=Math.max(1,rect.width||1),height=Math.max(1,rect.height||1),arena=match.arena;
      const scale=Math.min(width/arena.width,height/arena.height),ox=(width-arena.width*scale)/2,oy=(height-arena.height*scale)/2;
      return{scale,ox,oy,x:v=>ox+v*scale,y:v=>oy+v*scale};
    }

    function getColumns(image,frameWidth){
      const width=Number(image?.naturalWidth||image?.width||frameWidth);
      return Math.max(1,Math.floor(width/frameWidth));
    }

    function resolveVisual(fighter,round){
      if(!ready||!manifest||!animationResolver)return null;
      const state=typeof normalizeDuelVisualState==="function"?normalizeDuelVisualState(fighter?.action):fighter?.action;
      const animation=typeof getDuelVisualAnimation==="function"?getDuelVisualAnimation(manifest,state):manifest.animations?.[state];
      if(!animation?.src||!images.get(animation.src))return null;
      return animationResolver.resolve(fighter,round.time,manifest);
    }

    function drawAssetFighter(fighter,visual,tr){
      if(!visual?.animation?.src)return false;
      const image=images.get(visual.animation.src);if(!image)return false;
      const frameWidth=Number(visual.animation.frameWidth||manifest.frameWidth||256);
      const frameHeight=Number(visual.animation.frameHeight||manifest.frameHeight||256);
      const columns=Math.max(1,Number(visual.animation.columns)||getColumns(image,frameWidth));
      const sx=(visual.frameIndex%columns)*frameWidth,sy=Math.floor(visual.frameIndex/columns)*frameHeight;
      const displayWorldWidth=Math.max(1,Number(visual.animation.displayWorldWidth||manifest.displayWorldWidth||176));
      const worldScale=displayWorldWidth/frameWidth;
      const feet=visual.anchors?.feet||{x:frameWidth/2,y:frameHeight};
      const dw=frameWidth*worldScale*tr.scale,dh=frameHeight*worldScale*tr.scale;
      const x=tr.x(fighter.x),y=tr.y(fighter.y);
      ctx.save();
      ctx.translate(x,y);
      if((fighter.facing||1)<0)ctx.scale(-1,1);
      ctx.globalAlpha=fighter.hp<=0?.72:1;
      ctx.drawImage(image,sx,sy,frameWidth,frameHeight,-feet.x*worldScale*tr.scale,-feet.y*worldScale*tr.scale,dw,dh);
      ctx.restore();
      lastFrames.set(fighter.side,{fighter,visual,worldScale});
      return true;
    }

    function consume(events){fallback.consume(events);}

    function render(match,dt=0){
      const round=match?.currentRound;
      if(!round){fallback.render(match,dt);return;}
      const pVisual=resolveVisual(round.fighters.player,round);
      const oVisual=resolveVisual(round.fighters.opponent,round);
      const covered=[];
      if(pVisual)covered.push("player");else lastFrames.delete("player");
      if(oVisual)covered.push("opponent");else lastFrames.delete("opponent");
      fallback.render(match,dt,{skipFighterSides:covered});
      if(!covered.length)return;
      const tr=getTransform(match);
      if(pVisual)drawAssetFighter(round.fighters.player,pVisual,tr);
      if(oVisual)drawAssetFighter(round.fighters.opponent,oVisual,tr);
    }

    function getAnchor(fighter,name){
      const tracked=lastFrames.get(fighter?.side);
      if(!tracked||tracked.fighter!==fighter)return fallback.getAnchor(fighter,name);
      const anchor=tracked.visual.anchors?.[name],feet=tracked.visual.anchors?.feet;
      if(!anchor||!feet)return fallback.getAnchor(fighter,name);
      const facing=fighter.facing||1,scale=tracked.worldScale;
      return{x:fighter.x+(anchor.x-feet.x)*scale*facing,y:fighter.y+(anchor.y-feet.y)*scale};
    }

    function getStatus(){return{mode:"v2",ready,error:manifestError?.message||null,manifestId:manifest?.id||null,coveredStates:Object.keys(manifest?.animations||{})};}

    canvas.dataset.duelRenderer="v2";
    return{resize:fallback.resize,consume,render,effects:fallback.effects,getAnchor,preload,getStatus,fallback};
  }

  function createConfiguredDuelRenderer(canvas){
    if(getDuelRendererMode()==="vector"){
      const renderer=createVectorRenderer(canvas);canvas.dataset.duelRenderer="vector";return renderer;
    }
    try{return createDuelRendererV2(canvas);}catch(error){
      console.warn("Unable to initialize Duel Renderer V2; using vector fallback.",error);
      const renderer=createVectorRenderer(canvas);canvas.dataset.duelRenderer="vector-fallback";return renderer;
    }
  }

  root.createDuelVectorRenderer=createVectorRenderer;
  root.getDuelRendererMode=getDuelRendererMode;
  root.createDuelRendererV2=createDuelRendererV2;
  root.createConfiguredDuelRenderer=createConfiguredDuelRenderer;
  root.createDuelRenderer=createConfiguredDuelRenderer;
})();