(function(root){
'use strict';
function query(){try{return typeof location!=='undefined'?new URLSearchParams(location.search):null;}catch(_){return null;}}
function requestedMode(){const q=query(),value=q&&q.get('duelRenderer');if(value==='vector'||value==='v2'||value==='v3')return value;return root.DUEL_RENDERER_V3_DEFAULT===true?'v3':'v2';}
function requestedQuality(){const q=query(),value=(q&&q.get('visualQuality'))||root.DUEL_RENDERER_V3_QUALITY||'balanced';return ['full','balanced','low'].includes(String(value).toLowerCase())?String(value).toLowerCase():'balanced';}
function loadImage(src,label='asset'){return new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(new Error('Failed to load V3 '+label+': '+src));image.src=src;});}
function normalizeState(fighter){return typeof root.normalizeDuelVisualState==='function'?root.normalizeDuelVisualState(fighter&&fighter.action):(fighter&&fighter.action)||'idle';}
function createTransform(canvas,match){const rect=canvas.getBoundingClientRect(),width=Math.max(1,rect.width||canvas.width||1),height=Math.max(1,rect.height||canvas.height||1),arena=match.arena,scale=Math.min(width/arena.width,height/arena.height),ox=(width-arena.width*scale)/2,oy=(height-arena.height*scale)/2;return{scale,ox,oy,width,height,centerX:arena.width/2,zoom:1,mobile:width<620,shakeX:0,shakeY:0,x:v=>ox+v*scale,y:v=>oy+v*scale};}
function createBridge(canvas){
  if(typeof root.createDuelRendererV2!=='function')throw new Error('Renderer V2 unavailable');
  const fallback=root.createDuelRendererV2(canvas),api=root.AutoBattleRendererV3,ctx=canvas.getContext('2d'),images=new Map(),arenaImages=new Map(),lastV3Frames=new Map(),stateClocks=new Map();
  if(!api||typeof api.create!=='function'){canvas.dataset.duelRenderer='v2-v3-api-missing';return fallback;}
  const meta=api.create({enabled:true,quality:requestedQuality()});let status={enabled:true,ready:false,arenaReady:false,quality:requestedQuality(),reason:'initializing'},activeStates=[],arenaActive=false,arenaLoadError=null;
  async function preloadProductionStates(){
    activeStates=[];
    for(const stateId of api.REQUIRED_STATES||[]){
      const resolved=meta.resolveFighterState(stateId);
      if(resolved.renderer!=='v3'||!resolved.entry||!resolved.entry.src)continue;
      const image=await loadImage(resolved.entry.src,'fighter asset');
      images.set(resolved.entry.src,image);activeStates.push(stateId);
    }
  }
  async function preloadProductionArena(){
    arenaActive=false;arenaLoadError=null;arenaImages.clear();
    const resolved=typeof meta.resolveArena==='function'?meta.resolveArena():{renderer:'v2',reason:'arena resolver unavailable'};
    if(resolved.renderer!=='v3'||!Array.isArray(resolved.layers))return false;
    try{
      const loaded=await Promise.all(resolved.layers.map(async layer=>[layer.src,await loadImage(layer.src,'arena asset')]));
      for(const [src,image] of loaded)arenaImages.set(src,image);
      arenaActive=resolved.layers.every(layer=>arenaImages.has(layer.src));
      if(!arenaActive){arenaImages.clear();return false;}
      return true;
    }catch(error){arenaLoadError=error&&error.message||'arena preload failed';arenaImages.clear();arenaActive=false;return false;}
  }
  const preload=Promise.resolve(fallback.preload).then(()=>meta.initialize()).then(async next=>{
    status=next;
    if(!next.ready){canvas.dataset.duelRenderer='v2-v3-fallback';return next;}
    await preloadProductionStates();
    await preloadProductionArena();
    canvas.dataset.duelRenderer=arenaActive||activeStates.length?'v3-partial':'v3-foundation';
    return next;
  }).catch(error=>{status={enabled:true,ready:false,arenaReady:false,quality:requestedQuality(),reason:error&&error.message||'bridge-failed'};arenaActive=false;arenaImages.clear();canvas.dataset.duelRenderer='v2-v3-fallback';return status;});

  function touchState(fighter,round){
    if(!fighter)return'idle';const stateId=normalizeState(fighter),side=fighter.side||'unknown',now=Math.max(0,Number(round&&round.time)||0),prev=stateClocks.get(side);
    if(!prev||prev.fighter!==fighter||prev.stateId!==stateId||now<prev.enteredAt)stateClocks.set(side,{fighter,stateId,enteredAt:now});
    return stateId;
  }
  function resolveV3(fighter,stateId){if(!status.ready)return null;const resolved=meta.resolveFighterState(stateId);if(resolved.renderer!=='v3'||!resolved.entry)return null;const image=images.get(resolved.entry.src);return image?{stateId,entry:resolved.entry,image}:null;}
  function frameIndex(entry,round,fighter,stateId){const count=Math.max(1,Number(entry.frameCount)||1),fps=Math.max(1,Number(entry.fps)||1),clock=stateClocks.get(fighter&&fighter.side),now=Math.max(0,Number(round&&round.time)||0),elapsed=Math.max(0,now-Number(clock&&clock.stateId===stateId?clock.enteredAt:now));return entry.loop===false?Math.min(count-1,Math.floor(elapsed*fps)):Math.floor(elapsed*fps)%count;}
  function drawV3Arena(match,tr,foreground=false){
    if(!arenaActive||!status.ready||!match||!match.arena)return false;
    const resolved=meta.resolveArena();if(resolved.renderer!=='v3'||!Array.isArray(resolved.layers))return false;
    for(const layer of resolved.layers){
      if(Boolean(layer.foreground)!==foreground)continue;
      const image=arenaImages.get(layer.src);if(!image)return false;
      const lt=fallback.camera&&typeof fallback.camera.layerTransform==='function'?fallback.camera.layerTransform(tr,match.arena,layer.parallax):tr;
      const x=Number(layer.x||0),y=Number(layer.y||0),w=Number(layer.width||match.arena.width),h=Number(layer.height||match.arena.height);
      ctx.save();ctx.globalAlpha=Math.max(0,Math.min(1,Number(layer.opacity??1)));ctx.drawImage(image,lt.x(x),lt.y(y),w*lt.scale,h*lt.scale);ctx.restore();
    }
    return true;
  }
  function drawV3ShadowIdentity(fighter,tr){const x=tr.x(fighter.x),y=tr.y(fighter.y),s=tr.scale;ctx.save();ctx.fillStyle='rgba(0,0,0,.34)';ctx.beginPath();ctx.ellipse(x,y-2*s,34*s,8*s,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=.55;ctx.strokeStyle=fighter.side==='player'?'#38bdf8':'#fb7185';ctx.lineWidth=Math.max(1,2*s);ctx.beginPath();ctx.ellipse(x,y-3*s,40*s,10*s,0,0,Math.PI*2);ctx.stroke();ctx.restore();}
  function drawV3Fighter(fighter,round,tr,visual){
    const entry=visual.entry,index=frameIndex(entry,round,fighter,visual.stateId),fw=Number(entry.frameWidth||256),fh=Number(entry.frameHeight||256),columns=Math.max(1,Number(entry.columns||entry.frameCount||1)),sx=(index%columns)*fw,sy=Math.floor(index/columns)*fh,displayWorldWidth=Math.max(1,Number(entry.displayWorldWidth||176)),worldScale=displayWorldWidth/fw,anchors=entry.anchors&&entry.anchors[index],feet=anchors&&anchors.feet?anchors.feet:{x:fw/2,y:fh},dw=fw*worldScale*tr.scale,dh=fh*worldScale*tr.scale,x=tr.x(fighter.x),y=tr.y(fighter.y);
    drawV3ShadowIdentity(fighter,tr);
    ctx.save();ctx.translate(x,y);if((fighter.facing||1)<0)ctx.scale(-1,1);ctx.globalAlpha=fighter.hp<=0?.72:1;ctx.drawImage(visual.image,sx,sy,fw,fh,-feet.x*worldScale*tr.scale,-feet.y*worldScale*tr.scale,dw,dh);ctx.restore();
    lastV3Frames.set(fighter.side,{fighter,entry,index,worldScale});
  }
  function drawV3Attachments(fighter,round,tr){
    const chest=getAnchor(fighter,'chest'),feet=getAnchor(fighter,'feet'),cx=tr.x(chest.x),cy=tr.y(chest.y),fx=tr.x(feet.x),fy=tr.y(feet.y),s=tr.scale;
    if(fighter.shield>0){ctx.save();ctx.strokeStyle='rgba(125,211,252,.78)';ctx.lineWidth=Math.max(1,3*s);ctx.beginPath();ctx.arc(cx,cy,43*s,0,Math.PI*2);ctx.stroke();ctx.restore();}
    const rank=typeof root.getDuelSkillRank==='function'?root.getDuelSkillRank:null,frost=rank?rank(fighter.build,'frost'):0;if(frost){ctx.save();ctx.strokeStyle='rgba(147,197,253,.24)';ctx.lineWidth=Math.max(1,2*s);ctx.beginPath();ctx.arc(fx,fy-48*s,(52+frost*6)*s,0,Math.PI*2);ctx.stroke();ctx.restore();}
    const orbit=rank?rank(fighter.build,'orbit'):0;if(orbit){for(let i=0;i<orbit;i++){const a=round.time*3.1+i*Math.PI*2/orbit,bx=cx+Math.cos(a)*48*s,by=cy+10*s+Math.sin(a)*18*s;ctx.save();ctx.translate(bx,by);ctx.rotate(a);ctx.fillStyle='#e2e8f0';ctx.fillRect(-2*s,-11*s,4*s,22*s);ctx.restore();}}
  }
  function render(match,dt){
    lastV3Frames.clear();
    const round=match&&match.currentRound,player=round&&round.fighters&&round.fighters.player,opponent=round&&round.fighters&&round.fighters.opponent,pState=touchState(player,round),oState=touchState(opponent,round),pVisual=player&&resolveV3(player,pState),oVisual=opponent&&resolveV3(opponent,oState),v3Sides=[];
    if(pVisual)v3Sides.push('player');if(oVisual)v3Sides.push('opponent');
    if(!round){fallback.render(match,dt);return;}
    const tr=typeof fallback.prepareFrameTransform==='function'?fallback.prepareFrameTransform(match,dt):(typeof fallback.getLastTransform==='function'&&fallback.getLastTransform())||createTransform(canvas,match);
    if(arenaActive){const rect=canvas.getBoundingClientRect(),width=Math.max(1,rect.width||canvas.width||1),height=Math.max(1,rect.height||canvas.height||1);fallback.resize();ctx.clearRect(0,0,width,height);drawV3Arena(match,tr,false);fallback.render(match,dt,{skipFighterSides:v3Sides,skipArena:true,preserveCanvas:true,transformOverride:tr});}
    else fallback.render(match,dt,{skipFighterSides:v3Sides,transformOverride:tr});
    if(pVisual){drawV3Fighter(player,round,tr,pVisual);drawV3Attachments(player,round,tr);}
    if(oVisual){drawV3Fighter(opponent,round,tr,oVisual);drawV3Attachments(opponent,round,tr);}
    if(arenaActive)drawV3Arena(match,tr,true);
  }
  function getAnchor(fighter,name){
    const tracked=lastV3Frames.get(fighter&&fighter.side);if(!tracked||tracked.fighter!==fighter)return fallback.getAnchor(fighter,name);
    const anchors=tracked.entry.anchors&&tracked.entry.anchors[tracked.index],anchor=anchors&&anchors[name],feet=anchors&&anchors.feet;if(!anchor||!feet)return fallback.getAnchor(fighter,name);
    const facing=fighter.facing||1,scale=tracked.worldScale;return{x:fighter.x+(anchor.x-feet.x)*scale*facing,y:fighter.y+(anchor.y-feet.y)*scale};
  }
  function getStatus(){const base=typeof fallback.getStatus==='function'?fallback.getStatus():{};return{mode:status.ready?(arenaActive||activeStates.length?'v3-partial':'v3-foundation'):'v2',v3:status,activeStates:activeStates.slice(),arena:{active:arenaActive,id:arenaActive?'ashen-sanctum-v3':null,error:arenaLoadError,loaded:[...arenaImages.keys()]},fallback:base};}
  return Object.assign({},fallback,{preload,render,getAnchor,getStatus,v3:meta,fallback});
}
function createConfigured(canvas){const mode=requestedMode();if(mode==='vector'&&typeof root.createDuelVectorRenderer==='function'){const r=root.createDuelVectorRenderer(canvas);canvas.dataset.duelRenderer='vector';return r;}if(mode!=='v3')return root.createDuelRendererV2(canvas);try{return createBridge(canvas);}catch(error){console.warn('Renderer V3 bridge unavailable; Renderer V2 fallback active.',error);return root.createDuelRendererV2(canvas);}}
root.getDuelRendererV3Mode=requestedMode;root.createDuelRendererV3Bridge=createBridge;root.createConfiguredDuelRendererV3=createConfigured;
})(typeof window!=='undefined'?window:globalThis);