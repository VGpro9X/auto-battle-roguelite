(()=>{
  const root=typeof window!=="undefined"?window:globalThis;
  const FOUNDATION_FAMILIES=Object.freeze(["physical","projectile","fire","frost","lightning"]);
  const SUPPORT_FAMILIES=Object.freeze(["poison","blood","defense","heal","control"]);
  const VFX_FAMILIES=Object.freeze([...FOUNDATION_FAMILIES,...SUPPORT_FAMILIES]);
  const OWNED_TYPES=new Set(["hit","attack_melee","projectile_spawn","cast","status","heal","shield_gain"]);

  function textOf(event){return [event?.type,event?.source,event?.skill,event?.status,event?.variant,event?.colorHint,event?.element].filter(Boolean).join(" ").toLowerCase();}
  function familyForDuelEvent(event){
    if(!event||typeof event!=="object")return null;
    const text=textOf(event);
    if(/lightning|thunder|electric|xpstorm|stormtotem|conductive|chaoslightning/.test(text))return"lightning";
    if(/frost|ice|freeze|cold|shatter|chaosice/.test(text))return"frost";
    if(/fire|burn|flame|ember|inferno|combustion|chaosfire/.test(text))return"fire";
    if(/poison|venom|toxin|toxic|acid/.test(text))return"poison";
    if(/blood|lifesteal|life.?steal|vamp|hemorrhage/.test(text))return"blood";
    if(event.type==="shield_gain"||/shield|barrier|guard|armor|guardian|block/.test(text))return"defense";
    if(event.type==="heal"||/heal|recover|regen|restore|mend/.test(text))return"heal";
    if(/stun|slow|bind|magnet|control|root|silence|snare|lock/.test(text))return"control";
    if(event.type==="projectile_spawn")return"projectile";
    if(event.type==="attack_melee")return"physical";
    if(event.type==="hit")return"physical";
    return null;
  }
  function ownsDuelVfxEvent(event){const family=familyForDuelEvent(event);return Boolean(family&&VFX_FAMILIES.includes(family)&&OWNED_TYPES.has(event?.type));}

  function createDuelVfxV2(){
    const effects=[];let serial=0;
    function lifeFor(family,type){
      if(type==="projectile_spawn")return .22;
      if(family==="fire")return .48;
      if(family==="frost")return .46;
      if(family==="lightning")return .26;
      if(family==="poison")return .58;
      if(family==="blood")return .52;
      if(family==="defense")return .56;
      if(family==="heal")return .62;
      if(family==="control")return .54;
      return .24;
    }
    function consume(events){for(const event of events||[]){const family=familyForDuelEvent(event);if(!family||!VFX_FAMILIES.includes(family)||!OWNED_TYPES.has(event.type))continue;const life=lifeFor(family,event.type);effects.push({...event,family,life,maxLife:life,serial:serial++});}}
    function update(dt){const delta=Math.max(0,Number(dt)||0);for(const effect of effects)effect.life-=delta;for(let i=effects.length-1;i>=0;i--)if(effects[i].life<=0)effects.splice(i,1);}
    function fighterFor(round,side){return side&&round?.fighters?.[side]||null;}
    function eventPoint(effect,round,getAnchor){if(Number.isFinite(effect.x)&&Number.isFinite(effect.y))return{x:effect.x,y:effect.y};const side=effect.target||effect.side||effect.attacker,fighter=fighterFor(round,side);if(fighter&&typeof getAnchor==="function")return getAnchor(fighter,effect.type==="projectile_spawn"?"rightHand":"chest");return{x:500,y:300};}
    function originPoint(effect,round,getAnchor){const side=effect.attacker||effect.side,fighter=fighterFor(round,side);if(fighter&&typeof getAnchor==="function")return getAnchor(fighter,"rightHand");return eventPoint(effect,round,getAnchor);}
    function drawDamageText(ctx,e,p,tr,alpha){if(e.type!=="hit"||!(Number(e.amount)>0||Number(e.shieldDamage)>0))return;const x=tr.x(p.x),y=tr.y(p.y),total=Math.max(1,Math.round(Number(e.amount||0)+Number(e.shieldDamage||0)));ctx.save();ctx.globalAlpha=Math.min(1,alpha+.18);ctx.fillStyle=e.critical?"#fde68a":"#ffffff";ctx.font=`700 ${Math.max(12,14*tr.scale)}px system-ui`;ctx.textAlign="center";ctx.fillText(`${e.critical?"✦ ":""}${total}`,x,y-22*tr.scale-(1-alpha)*14*tr.scale);ctx.restore();}
    function drawPhysical(ctx,e,p,tr,alpha){const x=tr.x(p.x),y=tr.y(p.y),s=tr.scale,spread=(1-alpha)*12*s;ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle=e.critical?"#fde68a":"#f8fafc";ctx.lineWidth=Math.max(1.5,3*s);ctx.lineCap="round";for(let i=0;i<4;i++){const a=-.85+i*.56,dx=Math.cos(a)*(18*s+spread),dy=Math.sin(a)*(18*s+spread);ctx.beginPath();ctx.moveTo(x-dx*.18,y-dy*.18);ctx.lineTo(x+dx,y+dy);ctx.stroke();}ctx.restore();}
    function drawProjectile(ctx,e,p,origin,tr,alpha){const x=tr.x(p.x),y=tr.y(p.y),ox=tr.x(origin.x),oy=tr.y(origin.y),s=tr.scale;let dx=x-ox,dy=y-oy,len=Math.hypot(dx,dy);if(len<1){dx=e.side==="opponent"?-1:1;dy=0;len=1;}dx/=len;dy/=len;ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle="#dbeafe";ctx.lineWidth=Math.max(1.2,2.4*s);ctx.beginPath();ctx.moveTo(x-dx*34*s,y-dy*34*s);ctx.lineTo(x+dx*10*s,y+dy*10*s);ctx.stroke();ctx.fillStyle="#f8fafc";ctx.beginPath();ctx.arc(x,y,3.5*s,0,Math.PI*2);ctx.fill();ctx.restore();}
    function drawFire(ctx,e,p,tr,alpha){const x=tr.x(p.x),y=tr.y(p.y),s=tr.scale,r=(10+(1-alpha)*22)*s;ctx.save();ctx.globalAlpha=alpha;const g=ctx.createRadialGradient(x,y,1,x,y,Math.max(2,r));g.addColorStop(0,"rgba(255,247,237,.95)");g.addColorStop(.34,"rgba(251,146,60,.82)");g.addColorStop(1,"rgba(239,68,68,0)");ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.strokeStyle="rgba(253,186,116,.78)";ctx.lineWidth=Math.max(1,2*s);for(let i=0;i<3;i++){const a=e.serial*1.73+i*2.09+(1-alpha)*1.4,rr=(10+i*5)*s;ctx.beginPath();ctx.moveTo(x+Math.cos(a)*rr*.35,y+Math.sin(a)*rr*.35);ctx.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr-8*s);ctx.stroke();}ctx.restore();}
    function drawFrost(ctx,e,p,tr,alpha){const x=tr.x(p.x),y=tr.y(p.y),s=tr.scale,r=(12+(1-alpha)*22)*s;ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle="#bfdbfe";ctx.lineWidth=Math.max(1,2*s);ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.stroke();for(let i=0;i<6;i++){const a=i*Math.PI/3,dx=Math.cos(a)*r,dy=Math.sin(a)*r;ctx.beginPath();ctx.moveTo(x+dx*.25,y+dy*.25);ctx.lineTo(x+dx,y+dy);ctx.stroke();}ctx.restore();}
    function drawLightning(ctx,e,p,origin,tr,alpha){const x=tr.x(p.x),y=tr.y(p.y),ox=tr.x(origin.x),oy=tr.y(origin.y),s=tr.scale,startX=Math.abs(ox-x)>20*s?ox:x-8*s,startY=Math.abs(oy-y)>20*s?oy:y-110*s;ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle="#dbeafe";ctx.shadowBlur=12*s;ctx.shadowColor="#60a5fa";ctx.lineWidth=Math.max(1.5,3*s);ctx.beginPath();ctx.moveTo(startX,startY);for(let i=1;i<=5;i++){const t=i/5,jitter=(i===5?0:Math.sin((e.serial+1)*17+i*9)*10*s);ctx.lineTo(startX+(x-startX)*t+jitter,startY+(y-startY)*t);}ctx.stroke();ctx.restore();}
    function drawPoison(ctx,e,p,tr,alpha){const x=tr.x(p.x),y=tr.y(p.y),s=tr.scale;ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle="#86efac";ctx.fillStyle="rgba(34,197,94,.22)";ctx.lineWidth=Math.max(1,2*s);for(let i=0;i<4;i++){const phase=e.serial*.91+i*1.57+(1-alpha)*1.5,r=(8+i*4+(1-alpha)*10)*s,bx=x+Math.cos(phase)*r*.75,by=y+Math.sin(phase)*r*.45-i*3*s;ctx.beginPath();ctx.arc(bx,by,(3+i*.7)*s,0,Math.PI*2);ctx.fill();ctx.stroke();}ctx.restore();}
    function drawBlood(ctx,e,p,tr,alpha){const x=tr.x(p.x),y=tr.y(p.y),s=tr.scale;ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle="#fb7185";ctx.fillStyle="rgba(190,18,60,.34)";ctx.lineWidth=Math.max(1.2,2.5*s);for(let i=0;i<3;i++){const a=-1.95+i*.48+(e.serial%3)*.08,r=(15+i*7+(1-alpha)*10)*s;ctx.beginPath();ctx.moveTo(x,y);ctx.quadraticCurveTo(x+Math.cos(a)*r*.5,y+Math.sin(a)*r*.25,x+Math.cos(a)*r,y+Math.sin(a)*r);ctx.stroke();}ctx.beginPath();ctx.arc(x,y-4*s,(5+(1-alpha)*4)*s,0,Math.PI*2);ctx.fill();ctx.restore();}
    function drawDefense(ctx,e,p,tr,alpha){const x=tr.x(p.x),y=tr.y(p.y),s=tr.scale,r=(24+(1-alpha)*16)*s;ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle="#7dd3fc";ctx.lineWidth=Math.max(1.5,3*s);ctx.beginPath();for(let i=0;i<6;i++){const a=-Math.PI/2+i*Math.PI/3,px=x+Math.cos(a)*r,py=y+Math.sin(a)*r;if(i===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);}ctx.closePath();ctx.stroke();ctx.globalAlpha=alpha*.42;ctx.fillStyle="#38bdf8";ctx.fill();ctx.restore();}
    function drawHeal(ctx,e,p,tr,alpha){const x=tr.x(p.x),y=tr.y(p.y),s=tr.scale,r=(8+(1-alpha)*16)*s;ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle="#86efac";ctx.lineWidth=Math.max(2,4*s);ctx.beginPath();ctx.moveTo(x-r,y);ctx.lineTo(x+r,y);ctx.moveTo(x,y-r);ctx.lineTo(x,y+r);ctx.stroke();for(let i=0;i<3;i++){const a=e.serial+i*2.094+(1-alpha),rr=(17+i*4)*s;ctx.fillStyle="#bbf7d0";ctx.beginPath();ctx.arc(x+Math.cos(a)*rr,y+Math.sin(a)*rr,2.2*s,0,Math.PI*2);ctx.fill();}if(Number(e.amount)>0){ctx.fillStyle="#bbf7d0";ctx.font=`700 ${Math.max(11,13*s)}px system-ui`;ctx.textAlign="center";ctx.fillText(`+${Math.max(1,Math.round(e.amount))}`,x,y-24*s-(1-alpha)*10*s);}ctx.restore();}
    function drawControl(ctx,e,p,tr,alpha){const x=tr.x(p.x),y=tr.y(p.y),s=tr.scale,r=(22+(1-alpha)*10)*s;ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle="#c4b5fd";ctx.lineWidth=Math.max(1,2*s);ctx.setLineDash([5*s,4*s]);ctx.beginPath();ctx.ellipse(x,y,r,r*.46,0,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);for(let i=0;i<3;i++){const offset=(i-1)*11*s;ctx.beginPath();ctx.moveTo(x-22*s,y-24*s+offset);ctx.lineTo(x+22*s,y-8*s+offset);ctx.stroke();}ctx.restore();}
    function render(ctx,tr,match,getAnchor){const round=match?.currentRound;if(!ctx||!tr||!round)return;for(const e of effects){const alpha=Math.max(0,Math.min(1,e.life/e.maxLife)),p=eventPoint(e,round,getAnchor),origin=originPoint(e,round,getAnchor);if(e.family==="physical")drawPhysical(ctx,e,p,tr,alpha);else if(e.family==="projectile")drawProjectile(ctx,e,p,origin,tr,alpha);else if(e.family==="fire")drawFire(ctx,e,p,tr,alpha);else if(e.family==="frost")drawFrost(ctx,e,p,tr,alpha);else if(e.family==="lightning")drawLightning(ctx,e,p,origin,tr,alpha);else if(e.family==="poison")drawPoison(ctx,e,p,tr,alpha);else if(e.family==="blood")drawBlood(ctx,e,p,tr,alpha);else if(e.family==="defense")drawDefense(ctx,e,p,tr,alpha);else if(e.family==="heal")drawHeal(ctx,e,p,tr,alpha);else if(e.family==="control")drawControl(ctx,e,p,tr,alpha);drawDamageText(ctx,e,p,tr,alpha);}}
    function getStatus(){const counts={};for(const family of VFX_FAMILIES)counts[family]=0;for(const effect of effects)counts[effect.family]=(counts[effect.family]||0)+1;return{families:[...VFX_FAMILIES],active:effects.length,counts};}
    return{consume,update,render,getStatus,ownsEvent:ownsDuelVfxEvent,familyForEvent:familyForDuelEvent,effects};
  }
  root.DUEL_VFX_V2_FOUNDATION_FAMILIES=FOUNDATION_FAMILIES;root.DUEL_VFX_V2_FAMILIES=VFX_FAMILIES;root.getDuelVfxFamily=familyForDuelEvent;root.isDuelVfxV2OwnedEvent=ownsDuelVfxEvent;root.createDuelVfxV2=createDuelVfxV2;
})();