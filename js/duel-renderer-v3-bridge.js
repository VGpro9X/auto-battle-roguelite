(function(root){
'use strict';
function query(){try{return typeof location!=='undefined'?new URLSearchParams(location.search):null;}catch(_){return null;}}
function requestedMode(){const q=query(),value=q&&q.get('duelRenderer');if(value==='vector'||value==='v2'||value==='v3')return value;return root.DUEL_RENDERER_V3_DEFAULT===true?'v3':'v2';}
function requestedQuality(){const q=query(),value=(q&&q.get('visualQuality'))||root.DUEL_RENDERER_V3_QUALITY||'balanced';return ['full','balanced','low'].includes(String(value).toLowerCase())?String(value).toLowerCase():'balanced';}
function loadImage(src){return new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(new Error('Failed to load V3 fighter asset: '+src));image.src=src;});}
function normalizeState(fighter){return typeof root.normalizeDuelVisualState==='function'?root.normalizeDuelVisualState(fighter&&fighter.action):(fighter&&fighter.action)||'idle';}
function createTransform(canvas,match){const rect=canvas.getBoundingClientRect(),width=Math.max(1,rect.width||canvas.width||1),height=Math.max(1,rect.height||canvas.height||1),arena=match.arena,scale=Math.min(width/arena.width,height/arena.height),ox=(width-arena.width*scale)/2,oy=(height-arena.height*scale)/2;return{scale,ox,oy,x:v=>ox+v*scale,y:v=>oy+v*scale};}
function createBridge(canvas){
  if(typeof root.createDuelRendererV2!=='function')throw new Error('Renderer V2 unavailable');
  const fallback=root.createDuelRendererV2(canvas),api=root.AutoBattleRendererV3,ctx=canvas.getContext('2d'),images=new Map(),lastV3Frames=new Map();
  if(!api||typeof api.create!=='function'){canvas.dataset.duelRenderer='v2-v3-api-missing';return fallback;}
  const meta=api.create({enabled:true,quality:requestedQuality()});let status={enabled:true,ready:false,quality:requestedQuality(),reason:'initializing'},activeStates=[];
  async function preloadProductionStates(){
    activeStates=[];
    for(const stateId of api.REQUIRED_STATES||[]){
      const resolved=meta.resolveFighterState(stateId);
      if(resolved.renderer!=='v3'||!resolved.entry||!resolved.entry.src)continue;
      const image=await loadImage(resolved.entry.src);
      images.set(resolved.entry.src,image);activeStates.push(stateId);
    }
  }
  const preload=Promise.resolve(fallback.preload).then(()=>meta.initialize()).then(async next=>{
    status=next;
    if(!next.ready){canvas.dataset.duelRenderer='v2-v3-fallback';return next;}
    await preloadProductionStates();
    canvas.dataset.duelRenderer=activeStates.length?'v3-partial':'v3-foundation';
    return next;
  }).catch(error=>{status={enabled:true,ready:false,quality:requestedQuality(),reason:error&&error.message||'bridge-failed'};canvas.dataset.duelRenderer='v2-v3-fallback';return status;});

  function resolveV3(fighter){if(!status.ready)return null;const stateId=normalizeState(fighter),resolved=meta.resolveFighterState(stateId);if(resolved.renderer!=='v3'||!resolved.entry)return null;const image=images.get(resolved.entry.src);return image?{stateId,entry:resolved.entry,image}:null;}
  function frameIndex(entry,round){const count=Math.max(1,Number(entry.frameCount)||1),fps=Math.max(1,Number(entry.fps)||1),time=Math.max(0,Number(round&&round.time)||0);return entry.loop===false?Math.min(count-1,Math.floor(time*fps)):Math.floor(time*fps)%count;}
  function drawV3Fighter(fighter,round,tr,visual){
    const entry=visual.entry,index=frameIndex(entry,round),fw=Number(entry.frameWidth||256),fh=Number(entry.frameHeight||256),columns=Math.max(1,Number(entry.columns||entry.frameCount||1)),sx=(index%columns)*fw,sy=Math.floor(index/columns)*fh,displayWorldWidth=Math.max(1,Number(entry.displayWorldWidth||176)),worldScale=displayWorldWidth/fw,anchors=entry.anchors&&entry.anchors[index],feet=anchors&&anchors.feet?anchors.feet:{x:fw/2,y:fh},dw=fw*worldScale*tr.scale,dh=fh*worldScale*tr.scale,x=tr.x(fighter.x),y=tr.y(fighter.y);
    ctx.save();ctx.translate(x,y);if((fighter.facing||1)<0)ctx.scale(-1,1);ctx.globalAlpha=fighter.hp<=0?.72:1;ctx.drawImage(visual.image,sx,sy,fw,fh,-feet.x*worldScale*tr.scale,-feet.y*worldScale*tr.scale,dw,dh);ctx.restore();
    lastV3Frames.set(fighter.side,{fighter,entry,index,worldScale});
  }
  function render(match,dt){
    fallback.render(match,dt);lastV3Frames.clear();
    const round=match&&match.currentRound;if(!round||!status.ready||!activeStates.length)return;
    const tr=createTransform(canvas,match),player=round.fighters&&round.fighters.player,opponent=round.fighters&&round.fighters.opponent,pVisual=player&&resolveV3(player),oVisual=opponent&&resolveV3(opponent);
    if(pVisual)drawV3Fighter(player,round,tr,pVisual);
    if(oVisual)drawV3Fighter(opponent,round,tr,oVisual);
  }
  function getAnchor(fighter,name){
    const tracked=lastV3Frames.get(fighter&&fighter.side);if(!tracked||tracked.fighter!==fighter)return fallback.getAnchor(fighter,name);
    const anchors=tracked.entry.anchors&&tracked.entry.anchors[tracked.index],anchor=anchors&&anchors[name],feet=anchors&&anchors.feet;if(!anchor||!feet)return fallback.getAnchor(fighter,name);
    const facing=fighter.facing||1,scale=tracked.worldScale;return{x:fighter.x+(anchor.x-feet.x)*scale*facing,y:fighter.y+(anchor.y-feet.y)*scale};
  }
  function getStatus(){const base=typeof fallback.getStatus==='function'?fallback.getStatus():{};return{mode:status.ready?(activeStates.length?'v3-partial':'v3-foundation'):'v2',v3:status,activeStates:activeStates.slice(),fallback:base};}
  return Object.assign({},fallback,{preload,render,getAnchor,getStatus,v3:meta,fallback});
}
function createConfigured(canvas){const mode=requestedMode();if(mode==='vector'&&typeof root.createDuelVectorRenderer==='function'){const r=root.createDuelVectorRenderer(canvas);canvas.dataset.duelRenderer='vector';return r;}if(mode!=='v3')return root.createDuelRendererV2(canvas);try{return createBridge(canvas);}catch(error){console.warn('Renderer V3 bridge unavailable; Renderer V2 fallback active.',error);return root.createDuelRendererV2(canvas);}}
root.getDuelRendererV3Mode=requestedMode;root.createDuelRendererV3Bridge=createBridge;root.createConfiguredDuelRendererV3=createConfigured;
})(typeof window!=='undefined'?window:globalThis);
