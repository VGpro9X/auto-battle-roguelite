(()=>{
  const root=typeof window!=="undefined"?window:globalThis;
  const SYNERGY_ARRAYS=["DUEL_C2A_SYNERGY_IDS","DUEL_C2B_SYNERGY_IDS","DUEL_C2C_SYNERGY_IDS","DUEL_C2D_SYNERGY_IDS"];
  const EVOLUTION_ARRAYS=["DUEL_C3A_EVOLUTION_IDS","DUEL_C3B_EVOLUTION_IDS"];
  const RARE_IDS=Object.freeze([
    "bribery","immortalBreath","heavenlyPunishment","fateExchange","heavenlyMandate",
    "divineJudgment","spatialSwap","equalPrice","heavenlyWard","divineDomain",
    "lifeRewind","causalInversion","divineGift","timeStop","celestialEdict",
    "heavenSeal","bloodDebt","parasitePact","voidReality","scapegoatFate"
  ]);
  const RARE_ALIASES=Object.freeze({
    bribery:["bribery"],immortalBreath:["immortalBreath"],heavenlyPunishment:["heavenlyPunishment"],
    fateExchange:["fateExchange"],heavenlyMandate:["heavenlyMandate"],divineJudgment:["divineJudgment"],
    spatialSwap:["spatialSwap"],equalPrice:["equalPrice"],heavenlyWard:["heavenlyWard"],divineDomain:["divineDomain"],
    lifeRewind:["lifeRewind"],causalInversion:["causalInversion"],divineGift:["divineGift"],timeStop:["timeStop"],
    celestialEdict:["celestialEdict"],heavenSeal:["heavenSeal"],bloodDebt:["bloodDebt"],parasitePact:["parasitePact"],
    voidReality:["voidReality","voidPhase","realPhase"],scapegoatFate:["scapegoatFate","scapegoatSaved"]
  });
  const PALETTES=Object.freeze({
    physical:[245,238,220],projectile:[190,220,255],fire:[255,120,55],frost:[145,220,255],lightning:[230,235,255],
    poison:[120,220,130],blood:[245,82,105],defense:[100,205,255],heal:[110,245,175],control:[190,165,255],
    summon:[245,205,100],area:[205,145,255],chain:[235,145,245],time:[120,225,230],soul:[185,115,235]
  });
  function normalize(value){return String(value||"").toLowerCase().replace(/[^a-z0-9]/g,"");}
  function tokens(event){return [event?.source,event?.skill,event?.synergy,event?.evolution,event?.status,event?.variant].filter(Boolean).map(normalize);}
  function idsFrom(names){const out=[];for(const name of names){const list=root[name];if(Array.isArray(list))out.push(...list);}return out;}
  function eventMatchesId(event,id){const key=normalize(id);return Boolean(key&&tokens(event).some(token=>token===key||token.includes(key)));}
  function rareIdForDuelEvent(event){for(const id of RARE_IDS){for(const alias of RARE_ALIASES[id]||[id])if(eventMatchesId(event,alias))return id;}return null;}
  function tierForDuelEvent(event){const rareId=rareIdForDuelEvent(event);if(rareId)return"rare";const mapped=typeof root.getDuelVisualProfileForEventV3==="function"?root.getDuelVisualProfileForEventV3(event):null;if(mapped?.tier==="evolution")return"evolution";if(mapped?.tier==="synergy")return"synergy";for(const id of idsFrom(EVOLUTION_ARRAYS))if(eventMatchesId(event,id))return"evolution";for(const id of idsFrom(SYNERGY_ARRAYS))if(eventMatchesId(event,id))return"synergy";return"base";}
  function hash(text){let h=2166136261;for(const ch of String(text||"")){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;}
  function contentIdForEvent(event,tier){if(tier==="rare")return rareIdForDuelEvent(event);const mapped=typeof root.getDuelVisualProfileForEventV3==="function"?root.getDuelVisualProfileForEventV3(event):null;if(mapped?.tier===tier&&mapped.id)return mapped.id;const pool=tier==="evolution"?idsFrom(EVOLUTION_ARRAYS):idsFrom(SYNERGY_ARRAYS);return pool.find(id=>eventMatchesId(event,id))||null;}
  function familyForEvent(event){const mapped=typeof root.getDuelVisualProfileForEventV3==="function"?root.getDuelVisualProfileForEventV3(event):null;return mapped?.primary||"area";}
  function signatureFor(id,tier="rare",family="area"){
    if(!id)return null;const rareIndex=RARE_IDS.indexOf(id),seed=hash(`${tier}:${id}:${family}`),index=rareIndex>=0?rareIndex:seed%997;
    return Object.freeze({id,tier,family,index,sides:3+(seed%6),satellites:1+((seed>>>3)%4),dash:2+((seed>>>6)%5),spin:(seed&1)?1:-1,phase:((seed%1009)/1009),rays:3+((seed>>>9)%7),pulse:.82+((seed>>>13)%24)/100});
  }
  function rareVisualSignature(id){return signatureFor(id,"rare","soul");}
  function queryValue(name){try{return typeof location!=="undefined"?new URLSearchParams(location.search).get(name):null;}catch(_){return null;}}
  function runtimeQuality(){const direct=queryValue("visualQuality");if(direct==="full"||direct==="balanced"||direct==="low")return direct;const legacy=queryValue("duelQuality");if(legacy==="full")return"full";if(legacy==="constrained")return"low";return null;}
  function qualityProfile(options={}){const legacy=typeof root.getDuelVisualQuality==="function"?root.getDuelVisualQuality():null,requested=String(options.quality||runtimeQuality()||root.DUEL_RENDERER_V3_QUALITY||(legacy?.id==="full"?"full":"balanced")).toLowerCase(),quality=requested==="low"?"low":requested==="full"?"full":"balanced",reduced=typeof options.reducedMotion==="boolean"?options.reducedMotion:Boolean(legacy?.reducedMotion);return quality==="full"?{quality,reduced,limit:48,detail:1,alpha:1}:quality==="low"?{quality,reduced,limit:16,detail:.48,alpha:.66}:{quality,reduced,limit:30,detail:.72,alpha:.84};}
  function rgba(rgb,a){return`rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a})`;}
  function polygon(ctx,x,y,r,sides,rotation){ctx.beginPath();for(let i=0;i<sides;i++){const a=rotation+i*Math.PI*2/sides,px=x+Math.cos(a)*r,py=y+Math.sin(a)*r;if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);}ctx.closePath();}

  function createDuelVfxTierOverlay(options={}){
    const config=qualityProfile(options),effects=[];let serial=0,dropped=0,peak=0;
    function consume(events){for(const event of events||[]){const tier=tierForDuelEvent(event);if(tier==="base")continue;const id=contentIdForEvent(event,tier),family=familyForEvent(event),signature=signatureFor(id||`${event.type||"event"}:${event.source||event.skill||serial}`,tier,family),life=tier==="rare"?.86:tier==="evolution"?.70:.56;effects.push({...event,tier,contentId:id,family,signature,life,maxLife:life,serial:serial++});}peak=Math.max(peak,effects.length);if(effects.length>config.limit){const n=effects.length-config.limit;effects.splice(0,n);dropped+=n;}}
    function update(dt){const delta=Math.max(0,Number(dt)||0);for(const effect of effects)effect.life-=delta;for(let i=effects.length-1;i>=0;i--)if(effects[i].life<=0)effects.splice(i,1);}
    function fighterFor(round,side){return side&&round?.fighters?.[side]||null;}
    function pointFor(effect,round,getAnchor){if(Number.isFinite(effect.x)&&Number.isFinite(effect.y))return{x:effect.x,y:effect.y};const side=effect.target||effect.side||effect.attacker,fighter=fighterFor(round,side);if(fighter&&typeof getAnchor==="function")return getAnchor(fighter,"chest");return{x:500,y:300};}
    function drawSatellites(ctx,x,y,r,s,alpha,sig,rgb,countScale=1){const count=Math.max(1,Math.round(sig.satellites*config.detail*countScale));for(let i=0;i<count;i++){const a=sig.phase*Math.PI*2+i*Math.PI*2/count+(config.reduced?0:(1-alpha)*sig.spin*.7),bx=x+Math.cos(a)*r,by=y+Math.sin(a)*r*.68;ctx.beginPath();ctx.arc(bx,by,(2.1+(sig.index%3)*.45)*s,0,Math.PI*2);ctx.fillStyle=rgba(rgb,alpha*.88);ctx.fill();}}
    function drawSynergy(ctx,x,y,s,alpha,e,rgb){const sig=e.signature,r=(27+(1-alpha)*8)*s,rotation=sig.phase*Math.PI*2+(config.reduced?0:(1-alpha)*sig.spin*.35);ctx.save();ctx.globalAlpha=config.alpha;ctx.strokeStyle=rgba(rgb,alpha*.82);ctx.lineWidth=Math.max(1,1.8*s);ctx.setLineDash([sig.dash*s,(sig.dash+2)*s]);ctx.beginPath();ctx.arc(x,y,r,rotation,rotation+Math.PI*1.72);ctx.stroke();ctx.setLineDash([]);polygon(ctx,x,y,r*.66,sig.sides,rotation);ctx.globalAlpha=alpha*.42*config.alpha;ctx.stroke();drawSatellites(ctx,x,y,r*1.08,s,alpha*.78,sig,rgb,.7);ctx.restore();}
    function drawEvolution(ctx,x,y,s,alpha,e,rgb){const sig=e.signature,r=(33+(1-alpha)*11)*s,rotation=sig.phase*Math.PI*2+(config.reduced?0:(1-alpha)*sig.spin*.52);ctx.save();ctx.globalAlpha=config.alpha;ctx.strokeStyle=rgba(rgb,alpha*.92);ctx.lineWidth=Math.max(1.4,2.4*s);polygon(ctx,x,y,r,sig.sides,rotation);ctx.stroke();ctx.globalAlpha=alpha*.58*config.alpha;polygon(ctx,x,y,r*.62,Math.max(3,sig.sides-1),-rotation*.72);ctx.stroke();const rays=Math.max(2,Math.round(sig.rays*config.detail));for(let i=0;i<rays;i++){const a=rotation+i*Math.PI*2/rays;ctx.beginPath();ctx.moveTo(x+Math.cos(a)*r*.28,y+Math.sin(a)*r*.28);ctx.lineTo(x+Math.cos(a)*r*.82,y+Math.sin(a)*r*.82);ctx.stroke();}drawSatellites(ctx,x,y,r*1.13,s,alpha*.84,sig,rgb);ctx.restore();}
    function drawRare(ctx,x,y,s,alpha,e,rgb){const sig=e.signature;if(!sig)return;const r=(38+(1-alpha)*13)*s,rotation=sig.phase*Math.PI*2+(config.reduced?0:(1-alpha)*sig.spin*.72);ctx.save();ctx.globalAlpha=config.alpha;ctx.strokeStyle=rgba(rgb,alpha*.95);ctx.fillStyle=rgba(rgb,alpha*.075);ctx.lineWidth=Math.max(1.5,2.7*s);ctx.setLineDash([sig.dash*s,(sig.dash+2)*s]);polygon(ctx,x,y,r,sig.sides,rotation);ctx.fill();ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha=alpha*.60*config.alpha;polygon(ctx,x,y,r*.68,3+((sig.sides+sig.index)%5),-rotation*.78);ctx.stroke();const rays=Math.max(3,Math.round(sig.rays*config.detail));for(let i=0;i<rays;i++){const a=rotation+i*Math.PI*2/rays;ctx.beginPath();ctx.moveTo(x+Math.cos(a)*r*.18,y+Math.sin(a)*r*.18);ctx.lineTo(x+Math.cos(a)*r*.76,y+Math.sin(a)*r*.76);ctx.stroke();}drawSatellites(ctx,x,y,r*1.18,s,alpha*.92,sig,rgb,1.15);ctx.globalAlpha=alpha*.34*config.alpha;ctx.beginPath();ctx.arc(x,y,r*.46*sig.pulse,0,Math.PI*2);ctx.stroke();ctx.restore();}
    function render(ctx,tr,match,getAnchor){const round=match?.currentRound;if(!ctx||!tr||!round)return;for(const e of effects){const alpha=Math.max(0,Math.min(1,e.life/e.maxLife)),p=pointFor(e,round,getAnchor),x=tr.x(p.x),y=tr.y(p.y),s=tr.scale,rgb=PALETTES[e.family]||PALETTES.area;if(e.tier==="synergy")drawSynergy(ctx,x,y,s,alpha,e,rgb);else if(e.tier==="evolution")drawEvolution(ctx,x,y,s,alpha,e,rgb);else if(e.tier==="rare")drawRare(ctx,x,y,s,alpha,e,rgb);}}
    function getStatus(){const tiers={synergy:0,evolution:0,rare:0};for(const e of effects)tiers[e.tier]=(tiers[e.tier]||0)+1;return{active:effects.length,tiers,quality:config.quality,reducedMotion:config.reduced,limit:config.limit,dropped,peak};}
    return{consume,update,render,getStatus,effects};
  }

  root.DUEL_VFX_RARE_IDS=RARE_IDS;
  root.getDuelRareVisualId=rareIdForDuelEvent;
  root.getDuelVfxTier=tierForDuelEvent;
  root.getDuelRareVisualSignature=rareVisualSignature;
  root.getDuelHighTierVisualSignature=(event)=>{const tier=tierForDuelEvent(event);return tier==="base"?null:signatureFor(contentIdForEvent(event,tier)||event?.source||event?.skill,tier,familyForEvent(event));};
  root.createDuelVfxTierOverlay=createDuelVfxTierOverlay;
})();