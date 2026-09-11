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
  function normalize(value){return String(value||"").toLowerCase().replace(/[^a-z0-9]/g,"");}
  function tokens(event){return [event?.source,event?.skill,event?.status,event?.variant].filter(Boolean).map(normalize);}
  function idsFrom(names){const out=[];for(const name of names){const list=root[name];if(Array.isArray(list))out.push(...list);}return out;}
  function eventMatchesId(event,id){const key=normalize(id);return Boolean(key&&tokens(event).some(token=>token===key||token.includes(key)));}
  function rareIdForDuelEvent(event){for(const id of RARE_IDS){for(const alias of RARE_ALIASES[id]||[id])if(eventMatchesId(event,alias))return id;}return null;}
  function tierForDuelEvent(event){const rareId=rareIdForDuelEvent(event);if(rareId)return"rare";for(const id of idsFrom(EVOLUTION_ARRAYS))if(eventMatchesId(event,id))return"evolution";for(const id of idsFrom(SYNERGY_ARRAYS))if(eventMatchesId(event,id))return"synergy";return"base";}
  function rareVisualSignature(id){const index=RARE_IDS.indexOf(id);if(index<0)return null;return{id,index,sides:3+(index%6),satellites:1+(Math.floor(index/6)%4),dash:2+(index%5),spin:index%2===0?1:-1,phase:(index*0.61803398875)%1};}

  function createDuelVfxTierOverlay(){
    const effects=[];let serial=0;
    function consume(events){for(const event of events||[]){const tier=tierForDuelEvent(event);if(tier==="base")continue;const rareId=tier==="rare"?rareIdForDuelEvent(event):null,life=tier==="rare"?.78:tier==="evolution"?.64:.50;effects.push({...event,tier,rareId,life,maxLife:life,serial:serial++});}}
    function update(dt){const delta=Math.max(0,Number(dt)||0);for(const effect of effects)effect.life-=delta;for(let i=effects.length-1;i>=0;i--)if(effects[i].life<=0)effects.splice(i,1);}
    function fighterFor(round,side){return side&&round?.fighters?.[side]||null;}
    function pointFor(effect,round,getAnchor){if(Number.isFinite(effect.x)&&Number.isFinite(effect.y))return{x:effect.x,y:effect.y};const side=effect.target||effect.side||effect.attacker,fighter=fighterFor(round,side);if(fighter&&typeof getAnchor==="function")return getAnchor(fighter,"chest");return{x:500,y:300};}
    function polygon(ctx,x,y,r,sides,rotation){ctx.beginPath();for(let i=0;i<sides;i++){const a=rotation+i*Math.PI*2/sides,px=x+Math.cos(a)*r,py=y+Math.sin(a)*r;if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);}ctx.closePath();}
    function drawSynergy(ctx,x,y,s,alpha,e){const r=(26+(1-alpha)*9)*s;ctx.save();ctx.globalAlpha=alpha*.72;ctx.strokeStyle="#67e8f9";ctx.lineWidth=Math.max(1,1.8*s);ctx.setLineDash([6*s,5*s]);ctx.beginPath();ctx.arc(x,y,r,e.serial*.4,e.serial*.4+Math.PI*1.55);ctx.stroke();ctx.setLineDash([]);ctx.restore();}
    function drawEvolution(ctx,x,y,s,alpha,e){const r=(31+(1-alpha)*11)*s;ctx.save();ctx.globalAlpha=alpha*.78;ctx.strokeStyle="#fbbf24";ctx.lineWidth=Math.max(1.4,2.4*s);polygon(ctx,x,y,r,4,Math.PI/4+(1-alpha)*.45);ctx.stroke();ctx.beginPath();ctx.arc(x,y,r*.68,0,Math.PI*2);ctx.stroke();ctx.restore();}
    function drawRare(ctx,x,y,s,alpha,e){const sig=rareVisualSignature(e.rareId);if(!sig)return;const r=(34+(1-alpha)*13)*s,rotation=(sig.phase*Math.PI*2)+(1-alpha)*sig.spin*.8;ctx.save();ctx.globalAlpha=alpha*.88;ctx.strokeStyle="#f5d0fe";ctx.fillStyle="rgba(217,70,239,.08)";ctx.lineWidth=Math.max(1.5,2.6*s);ctx.setLineDash([sig.dash*s,(sig.dash+2)*s]);polygon(ctx,x,y,r,sig.sides,rotation);ctx.fill();ctx.stroke();ctx.setLineDash([]);for(let i=0;i<sig.satellites;i++){const a=rotation+i*Math.PI*2/sig.satellites,bx=x+Math.cos(a)*r*1.18,by=y+Math.sin(a)*r*.72;ctx.beginPath();ctx.arc(bx,by,(2.4+(sig.index%3)*.5)*s,0,Math.PI*2);ctx.fillStyle="#f0abfc";ctx.fill();}ctx.globalAlpha=alpha*.62;ctx.beginPath();ctx.arc(x,y,r*.52,0,Math.PI*2);ctx.stroke();ctx.restore();}
    function render(ctx,tr,match,getAnchor){const round=match?.currentRound;if(!ctx||!tr||!round)return;for(const e of effects){const alpha=Math.max(0,Math.min(1,e.life/e.maxLife)),p=pointFor(e,round,getAnchor),x=tr.x(p.x),y=tr.y(p.y),s=tr.scale;if(e.tier==="synergy")drawSynergy(ctx,x,y,s,alpha,e);else if(e.tier==="evolution")drawEvolution(ctx,x,y,s,alpha,e);else if(e.tier==="rare")drawRare(ctx,x,y,s,alpha,e);}}
    function getStatus(){const tiers={synergy:0,evolution:0,rare:0};for(const e of effects)tiers[e.tier]=(tiers[e.tier]||0)+1;return{active:effects.length,tiers};}
    return{consume,update,render,getStatus,effects};
  }

  root.DUEL_VFX_RARE_IDS=RARE_IDS;
  root.getDuelRareVisualId=rareIdForDuelEvent;
  root.getDuelVfxTier=tierForDuelEvent;
  root.getDuelRareVisualSignature=rareVisualSignature;
  root.createDuelVfxTierOverlay=createDuelVfxTierOverlay;
})();