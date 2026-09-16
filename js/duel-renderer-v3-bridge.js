(function(root){
'use strict';
function query(){try{return typeof location!=='undefined'?new URLSearchParams(location.search):null;}catch(_){return null;}}
function requestedMode(){const q=query(),value=q&&q.get('duelRenderer');if(value==='vector'||value==='v2'||value==='v3')return value;return root.DUEL_RENDERER_V3_DEFAULT===true?'v3':'v2';}
function requestedQuality(){const q=query(),value=(q&&q.get('visualQuality'))||root.DUEL_RENDERER_V3_QUALITY||'balanced';return ['full','balanced','low'].includes(String(value).toLowerCase())?String(value).toLowerCase():'balanced';}
function createBridge(canvas){
  if(typeof root.createDuelRendererV2!=='function')throw new Error('Renderer V2 unavailable');
  const fallback=root.createDuelRendererV2(canvas),api=root.AutoBattleRendererV3;
  if(!api||typeof api.create!=='function'){canvas.dataset.duelRenderer='v2-v3-api-missing';return fallback;}
  const meta=api.create({enabled:true,quality:requestedQuality()});let status={enabled:true,ready:false,quality:requestedQuality(),reason:'initializing'};
  const preload=Promise.resolve(fallback.preload).then(()=>meta.initialize()).then(next=>{status=next;if(!next.ready)canvas.dataset.duelRenderer='v2-v3-fallback';else canvas.dataset.duelRenderer='v3-foundation';return next;}).catch(error=>{status={enabled:true,ready:false,quality:requestedQuality(),reason:error&&error.message||'bridge-failed'};canvas.dataset.duelRenderer='v2-v3-fallback';return status;});
  function getStatus(){const base=typeof fallback.getStatus==='function'?fallback.getStatus():{};return{mode:status.ready?'v3-foundation':'v2',v3:status,fallback:base};}
  return Object.assign({},fallback,{preload,getStatus,v3:meta,fallback});
}
function createConfigured(canvas){const mode=requestedMode();if(mode==='vector'&&typeof root.createDuelVectorRenderer==='function'){const r=root.createDuelVectorRenderer(canvas);canvas.dataset.duelRenderer='vector';return r;}if(mode!=='v3')return root.createDuelRendererV2(canvas);try{return createBridge(canvas);}catch(error){console.warn('Renderer V3 bridge unavailable; Renderer V2 fallback active.',error);return root.createDuelRendererV2(canvas);}}
root.getDuelRendererV3Mode=requestedMode;root.createDuelRendererV3Bridge=createBridge;root.createConfiguredDuelRendererV3=createConfigured;
})(typeof window!=='undefined'?window:globalThis);
