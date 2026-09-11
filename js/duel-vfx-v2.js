(()=>{
  const root=typeof window!=="undefined"?window:globalThis;
  const FIRST_FAMILIES=Object.freeze(["physical","projectile","fire","frost","lightning"]);
  const OWNED_TYPES=new Set(["hit","attack_melee","projectile_spawn","cast","status"]);

  function textOf(event){
    return [event?.type,event?.source,event?.skill,event?.status,event?.colorHint,event?.element]
      .filter(Boolean).join(" ").toLowerCase();
  }

  function familyForDuelEvent(event){
    if(!event||typeof event!=="object")return null;
    const text=textOf(event);
    if(/lightning|thunder|electric|chain/.test(text))return"lightning";
    if(/frost|ice|freeze|cold/.test(text))return"frost";
    if(/fire|burn|flame|ember|inferno/.test(text))return"fire";
    if(event.type==="projectile_spawn")return"projectile";
    if(event.type==="attack_melee")return"physical";
    if(event.type==="hit")return"physical";
    return null;
  }

  function ownsDuelVfxEvent(event){
    const family=familyForDuelEvent(event);
    return Boolean(family&&FIRST_FAMILIES.includes(family)&&OWNED_TYPES.has(event?.type));
  }

  function createDuelVfxV2(){
    const effects=[];
    let serial=0;

    function lifeFor(family,type){
      if(type==="projectile_spawn")return .22;
      if(family==="fire")return .48;
      if(family==="frost")return .46;
      if(family==="lightning")return .26;
      return .24;
    }

    function consume(events){
      for(const event of events||[]){
        const family=familyForDuelEvent(event);
        if(!family||!FIRST_FAMILIES.includes(family)||!OWNED_TYPES.has(event.type))continue;
        const life=lifeFor(family,event.type);
        effects.push({...event,family,life,maxLife:life,serial:serial++});
      }
    }

    function update(dt){
      const delta=Math.max(0,Number(dt)||0);
      for(const effect of effects)effect.life-=delta;
      for(let i=effects.length-1;i>=0;i--)if(effects[i].life<=0)effects.splice(i,1);
    }

    function fighterFor(round,side){return side&&round?.fighters?.[side]||null;}
    function eventPoint(effect,round,getAnchor){
      if(Number.isFinite(effect.x)&&Number.isFinite(effect.y))return{x:effect.x,y:effect.y};
      const side=effect.target||effect.side||effect.attacker;
      const fighter=fighterFor(round,side);
      if(fighter&&typeof getAnchor==="function")return getAnchor(fighter,effect.type==="projectile_spawn"?"rightHand":"chest");
      return{x:500,y:300};
    }
    function originPoint(effect,round,getAnchor){
      const side=effect.attacker||effect.side;
      const fighter=fighterFor(round,side);
      if(fighter&&typeof getAnchor==="function")return getAnchor(fighter,"rightHand");
      return eventPoint(effect,round,getAnchor);
    }

    function drawPhysical(ctx,e,p,tr,alpha){
      const x=tr.x(p.x),y=tr.y(p.y),s=tr.scale,spread=(1-alpha)*12*s;
      ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle=e.critical?"#fde68a":"#f8fafc";ctx.lineWidth=Math.max(1.5,3*s);ctx.lineCap="round";
      for(let i=0;i<4;i++){const a=-.85+i*.56,dx=Math.cos(a)*(18*s+spread),dy=Math.sin(a)*(18*s+spread);ctx.beginPath();ctx.moveTo(x-dx*.18,y-dy*.18);ctx.lineTo(x+dx,y+dy);ctx.stroke();}
      ctx.restore();
    }

    function drawProjectile(ctx,e,p,origin,tr,alpha){
      const x=tr.x(p.x),y=tr.y(p.y),ox=tr.x(origin.x),oy=tr.y(origin.y),s=tr.scale;
      let dx=x-ox,dy=y-oy,len=Math.hypot(dx,dy);if(len<1){dx=e.side==="opponent"?-1:1;dy=0;len=1;}dx/=len;dy/=len;
      ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle="#dbeafe";ctx.lineWidth=Math.max(1.2,2.4*s);ctx.beginPath();ctx.moveTo(x-dx*34*s,y-dy*34*s);ctx.lineTo(x+dx*10*s,y+dy*10*s);ctx.stroke();ctx.fillStyle="#f8fafc";ctx.beginPath();ctx.arc(x,y,3.5*s,0,Math.PI*2);ctx.fill();ctx.restore();
    }

    function drawFire(ctx,e,p,tr,alpha){
      const x=tr.x(p.x),y=tr.y(p.y),s=tr.scale,r=(10+(1-alpha)*22)*s;
      ctx.save();ctx.globalAlpha=alpha;const g=ctx.createRadialGradient(x,y,1,x,y,Math.max(2,r));g.addColorStop(0,"rgba(255,247,237,.95)");g.addColorStop(.34,"rgba(251,146,60,.82)");g.addColorStop(1,"rgba(239,68,68,0)");ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.strokeStyle="rgba(253,186,116,.78)";ctx.lineWidth=Math.max(1,2*s);for(let i=0;i<3;i++){const a=e.serial*1.73+i*2.09+(1-alpha)*1.4,rr=(10+i*5)*s;ctx.beginPath();ctx.moveTo(x+Math.cos(a)*rr*.35,y+Math.sin(a)*rr*.35);ctx.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr-8*s);ctx.stroke();}ctx.restore();
    }

    function drawFrost(ctx,e,p,tr,alpha){
      const x=tr.x(p.x),y=tr.y(p.y),s=tr.scale,r=(12+(1-alpha)*22)*s;
      ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle="#bfdbfe";ctx.lineWidth=Math.max(1,2*s);ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.stroke();for(let i=0;i<6;i++){const a=i*Math.PI/3,dx=Math.cos(a)*r,dy=Math.sin(a)*r;ctx.beginPath();ctx.moveTo(x+dx*.25,y+dy*.25);ctx.lineTo(x+dx,y+dy);ctx.stroke();}ctx.restore();
    }

    function drawLightning(ctx,e,p,origin,tr,alpha){
      const x=tr.x(p.x),y=tr.y(p.y),ox=tr.x(origin.x),oy=tr.y(origin.y),s=tr.scale;
      const startX=Math.abs(ox-x)>20*s?ox:x-8*s,startY=Math.abs(oy-y)>20*s?oy:y-110*s;
      ctx.save();ctx.globalAlpha=alpha;ctx.strokeStyle="#dbeafe";ctx.shadowBlur=12*s;ctx.shadowColor="#60a5fa";ctx.lineWidth=Math.max(1.5,3*s);ctx.beginPath();ctx.moveTo(startX,startY);for(let i=1;i<=5;i++){const t=i/5,jitter=(i===5?0:Math.sin((e.serial+1)*17+i*9)*10*s);ctx.lineTo(startX+(x-startX)*t+jitter,startY+(y-startY)*t);}ctx.stroke();ctx.restore();
    }

    function render(ctx,tr,match,getAnchor){
      const round=match?.currentRound;if(!ctx||!tr||!round)return;
      for(const e of effects){
        const alpha=Math.max(0,Math.min(1,e.life/e.maxLife)),p=eventPoint(e,round,getAnchor),origin=originPoint(e,round,getAnchor);
        if(e.family==="physical")drawPhysical(ctx,e,p,tr,alpha);
        else if(e.family==="projectile")drawProjectile(ctx,e,p,origin,tr,alpha);
        else if(e.family==="fire")drawFire(ctx,e,p,tr,alpha);
        else if(e.family==="frost")drawFrost(ctx,e,p,tr,alpha);
        else if(e.family==="lightning")drawLightning(ctx,e,p,origin,tr,alpha);
      }
    }

    function getStatus(){
      const counts={};for(const family of FIRST_FAMILIES)counts[family]=0;
      for(const effect of effects)counts[effect.family]=(counts[effect.family]||0)+1;
      return{families:[...FIRST_FAMILIES],active:effects.length,counts};
    }

    return{consume,update,render,getStatus,ownsEvent:ownsDuelVfxEvent,familyForEvent:familyForDuelEvent,effects};
  }

  root.DUEL_VFX_V2_FAMILIES=FIRST_FAMILIES;
  root.getDuelVfxFamily=familyForDuelEvent;
  root.isDuelVfxV2OwnedEvent=ownsDuelVfxEvent;
  root.createDuelVfxV2=createDuelVfxV2;
})();