// V0.16 final rare VFX audit layer.
// Gives every one of the 20 Thần Kỹ / Thần Bí Kỹ a distinct Codex preview.
// The original four keep their V0.13 bespoke live feedback; the 16 V0.16 additions
// receive dedicated trigger/persistent feedback here without changing mechanics.

(()=>{
  const runtime=state.v016RareVfx={
    bursts:[],
    lastTriggerAt:{},
    previewIds:new Set([
      "bribery","immortalBreath","heavenlyPunishment","fateExchange",
      "heavenlyMandate","divineJudgment","spatialSwap","equalPrice",
      "heavenlyWard","divineDomain","lifeRewind","causalInversion",
      "divineGift","timeStop","celestialEdict","heavenSeal",
      "bloodDebt","parasitePact","voidReality","scapegoatFate"
    ]),
    liveIds:new Set([
      "bribery","immortalBreath","heavenlyPunishment","fateExchange",
      "heavenlyMandate","divineJudgment","spatialSwap","equalPrice",
      "heavenlyWard","divineDomain","lifeRewind","causalInversion",
      "divineGift","timeStop","celestialEdict","heavenSeal",
      "bloodDebt","parasitePact","voidReality","scapegoatFate"
    ])
  };

  const rareTone=id=>{
    const item=typeof DIVINE_SKILLS!=="undefined"?DIVINE_SKILLS[id]:null;
    return item?.tier==="mystic"?"#c99cff":"#ffe08a";
  };

  function previewFrame(g,time,w,h,tone){
    g.clearRect(0,0,w,h);
    g.save();
    const grad=g.createRadialGradient(w*.5,h*.46,2,w*.5,h*.46,Math.max(w,h)*.62);
    grad.addColorStop(0,`${tone}26`);grad.addColorStop(1,"rgba(10,12,18,0)");
    g.fillStyle=grad;g.fillRect(0,0,w,h);
    g.restore();
  }

  function previewEnemy(g,x,y,r=8,tone="#cf6f6f"){
    g.save();g.fillStyle=tone;g.globalAlpha=.95;g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill();
    g.fillStyle="#161820";g.globalAlpha=.95;g.beginPath();g.arc(x-r*.28,y-1,1.5,0,Math.PI*2);g.arc(x+r*.28,y-1,1.5,0,Math.PI*2);g.fill();g.restore();
  }

  function previewActor(g,x,y,r=9){
    if(typeof drawPreviewActor==="function")return drawPreviewActor(g,x,y,r);
    g.save();g.fillStyle="#d7e2ff";g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill();g.restore();
  }

  function ring(g,x,y,r,tone,alpha=.8,width=2){
    g.save();g.strokeStyle=tone;g.globalAlpha=alpha;g.lineWidth=width;g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.stroke();g.restore();
  }

  function line(g,x1,y1,x2,y2,tone,alpha=.8,width=2){
    g.save();g.strokeStyle=tone;g.globalAlpha=alpha;g.lineWidth=width;g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();g.restore();
  }

  function rarePreview(g,id,time,w,h){
    const tone=rareTone(id),cx=w*.34,cy=h*.54,ex=w*.73,ey=h*.52,p=(time*.55)%1;
    previewFrame(g,time,w,h,tone);
    g.save();

    if(id==="bribery"){
      previewActor(g,cx,cy);previewEnemy(g,ex,ey,9,"#79d7b4");
      ring(g,ex,ey,15+Math.sin(time*4)*2,"#79d7b4",.85,2.2);line(g,cx,cy,ex,ey,"#79d7b4",.45,1.5);
    }else if(id==="immortalBreath"){
      previewActor(g,cx,cy);for(let i=0;i<3;i++)ring(g,cx,cy,17+i*7+Math.sin(time*4+i)*2,"#ffe889",.65-i*.12,2);
    }else if(id==="heavenlyPunishment"){
      previewActor(g,cx*.72,cy);for(let i=0;i<3;i++){const x=w*(.58+i*.13),y=h*(.42+(i%2)*.19);previewEnemy(g,x,y,7);if(typeof drawLightningArc==="function")drawLightningArc(g,x,y-42,x,y,time*4+i,6,.9);}
    }else if(id==="fateExchange"){
      previewActor(g,cx,cy);previewEnemy(g,ex,ey,9);line(g,cx,cy-4,ex,ey+4,"#78caff",.85,2.2);line(g,cx,cy+5,ex,ey-5,"#b58cff",.85,2.2);ring(g,(cx+ex)/2,(cy+ey)/2,5+Math.sin(time*5)*2,"#ffffff",.7,1.5);
    }else if(id==="heavenlyMandate"){
      previewActor(g,cx,cy);ring(g,cx,cy,25,"#ffe08a",.7,2);const a=-time*2.2;line(g,cx,cy,cx+Math.cos(a)*16,cy+Math.sin(a)*16,"#fff4c8",.9,2);for(let i=0;i<3;i++){const aa=i*Math.PI*2/3+time*.7;drawGlowDot(g,ex+Math.cos(aa)*18,ey+Math.sin(aa)*14,3,"#ffe08a",.8);}
    }else if(id==="divineJudgment"){
      previewActor(g,cx*.78,cy);previewEnemy(g,ex,ey,10);ring(g,ex,ey,16,"#ffe08a",.9,2.5);line(g,ex-9,ey-18,ex+9,ey+18,"#ffe08a",.8,2);line(g,ex+9,ey-18,ex-9,ey+18,"#ffe08a",.8,2);
    }else if(id==="spatialSwap"){
      previewActor(g,cx,cy);previewEnemy(g,ex,ey,9);const m=(cx+ex)/2;line(g,cx+10,cy-6,ex-10,ey-6,"#c99cff",.85,2);line(g,ex-10,ey+7,cx+10,cy+7,"#8fb6ff",.85,2);drawGlowDot(g,m,cy,3,"#ffffff",.8);
    }else if(id==="equalPrice"){
      previewActor(g,cx,cy);const gx=cx+(ex-cx)*p,gy=cy-10*Math.sin(p*Math.PI);g.fillStyle="#79a7ff";g.globalAlpha=.9;g.beginPath();g.moveTo(gx,gy-5);g.lineTo(gx+4,gy);g.lineTo(gx,gy+5);g.lineTo(gx-4,gy);g.closePath();g.fill();drawShieldVisual(g,ex,ey,15,time,1.1);line(g,w*.58,h*.34,w*.58,h*.72,"#c99cff",.35,1.5);
    }else if(id==="heavenlyWard"){
      previewActor(g,cx,cy);drawShieldVisual(g,cx,cy,20,time,1.5);for(let i=0;i<5;i++){const a=i*Math.PI*2/5+time;line(g,cx+Math.cos(a)*24,cy+Math.sin(a)*24,cx+Math.cos(a)*34,cy+Math.sin(a)*34,"#ffe08a",.65,2);}
    }else if(id==="divineDomain"){
      previewActor(g,cx,cy);previewEnemy(g,ex,ey,8);ring(g,cx,cy,34+Math.sin(time*3)*2,"#ffe08a",.75,2.4);ring(g,cx,cy,26,"#ffe08a",.22,1);line(g,cx,cy,ex,ey,"#ffe08a",.28,1.5);
    }else if(id==="lifeRewind"){
      previewActor(g,cx,cy);g.save();g.globalAlpha=.28;previewActor(g,ex,ey,9);g.restore();ring(g,(cx+ex)/2,cy,25,"#c99cff",.7,2);const a=Math.PI*.2-time*1.6;line(g,(cx+ex)/2,cy,(cx+ex)/2+Math.cos(a)*18,cy+Math.sin(a)*18,"#d9c8ff",.9,2);
    }else if(id==="causalInversion"){
      previewActor(g,cx,cy);previewEnemy(g,ex,ey,8);const px=ex+(cx-ex)*p;drawGlowDot(g,px,cy,3,"#ff8f8f",.8);ring(g,cx,cy,19,"#c99cff",.85,2);drawGlowDot(g,cx,cy-25,3,"#8ff1cf",.9);
    }else if(id==="divineGift"){
      previewActor(g,cx,cy);for(let i=0;i<2;i++){const x=ex+i*13-7,y=ey+i*5-3;g.fillStyle=i?"#fff4c8":"#ffe08a";g.globalAlpha=.75;g.fillRect(x-8,y-11,16,22);}g.font=`${Math.max(14,h*.18)}px sans-serif`;g.fillStyle="#fff";g.globalAlpha=.9;g.fillText("+1",ex-8,ey-20);
    }else if(id==="timeStop"){
      previewActor(g,cx,cy);for(let i=0;i<3;i++){const x=w*(.58+i*.13),y=h*(.45+(i%2)*.16);previewEnemy(g,x,y,7);ring(g,x,y,11,"#b7dcff",.65,1.5);}g.fillStyle="#ffffff";g.globalAlpha=.9;g.fillRect(w*.48,h*.26,4,25);g.fillRect(w*.54,h*.26,4,25);
    }else if(id==="celestialEdict"){
      previewActor(g,cx*.7,cy);for(let i=0;i<3;i++){const x=w*(.58+i*.13),y=h*(.44+(i%2)*.18);previewEnemy(g,x,y,8);line(g,x-10,y-15,x+10,y-15,"#5e2430",.55,3);line(g,x-10,y-15,x-1,y-15,"#ff8a95",.9,3);}
    }else if(id==="heavenSeal"){
      previewActor(g,cx,cy);previewEnemy(g,ex,ey,9);ring(g,cx,cy,22,"#ffe08a",.9,2.5);const px=ex+(cx-ex)*Math.min(.82,p*1.4);drawGlowDot(g,px,cy,3,"#ff9a9a",.8);g.font=`${Math.max(13,h*.17)}px sans-serif`;g.fillStyle="#fff4c8";g.globalAlpha=.85;g.fillText("◎",cx-7,cy+5);
    }else if(id==="bloodDebt"){
      previewActor(g,cx,cy);line(g,ex,ey,cx,cy,"#e66b7a",.55,2);for(let i=0;i<5;i++){const x=w*(.55+i*.075),y=h*.72;drawGlowDot(g,x,y,2.5,"#e66b7a",.45+.4*((time+i*.16)%1));}ring(g,cx,cy,21,"#e66b7a",.5,2);
    }else if(id==="parasitePact"){
      previewActor(g,cx,cy);previewEnemy(g,ex,ey,10,"#b97bd8");line(g,cx,cy,ex,ey,"#c99cff",.85,2.6);for(let i=0;i<3;i++){const t=(p+i/3)%1;drawGlowDot(g,cx+(ex-cx)*t,cy+(ey-cy)*t,2.4,"#e66b7a",.8);}
    }else if(id==="voidReality"){
      previewActor(g,cx,cy);const phase=Math.floor(time/1.2)%2,t=phase?"#f2f2f2":"#9d78dc";ring(g,cx,cy,23+Math.sin(time*5)*2,t,.85,2.3);ring(g,cx,cy,31,t,.25,1.2);g.fillStyle=t;g.globalAlpha=.8;g.font=`${Math.max(13,h*.16)}px sans-serif`;g.fillText(phase?"THỰC":"HƯ",ex-15,ey+5);
    }else if(id==="scapegoatFate"){
      previewActor(g,cx,cy);previewEnemy(g,ex,ey,9,"#b779a7");ring(g,ex,ey,16,"#c99cff",.9,2.2);line(g,cx,cy,ex,ey,"#c99cff",.6,2);g.strokeStyle="#ffb0c8";g.globalAlpha=.8;g.beginPath();g.moveTo(cx+8,cy-14);g.quadraticCurveTo((cx+ex)/2,cy-30,ex,ey-16);g.stroke();
    }else{
      previewActor(g,cx,cy);ring(g,cx,cy,25,tone,.8,2);
    }
    g.restore();
  }

  const baseDrawCodexPreviewRareV016=drawCodexPreview;
  drawCodexPreview=function(g,kind,key,data,time,width,height){
    if((kind==="divine"||kind==="mystic")&&runtime.previewIds.has(key))return rarePreview(g,key,time,width,height);
    return baseDrawCodexPreviewRareV016(g,kind,key,data,time,width,height);
  };

  function pushBurst(type,data={}){
    runtime.bursts.push({type,start:state.t,life:data.life||.65,...data});
  }

  function oncePerTrigger(id,window=.08){
    const last=runtime.lastTriggerAt[id]??-Infinity;
    if(state.t-last<window)return false;
    runtime.lastTriggerAt[id]=state.t;
    return true;
  }

  onSkillEvent("divine_trigger",payload=>{
    const id=payload?.id;
    if(!id||["bribery","immortalBreath","heavenlyPunishment","fateExchange"].includes(id))return;
    if(!oncePerTrigger(id))return;
    const enemy=payload.enemy;
    if(id==="spatialSwap"&&payload.from&&payload.to)pushBurst("swap",{x1:payload.from.x,y1:payload.from.y,x2:payload.to.x,y2:payload.to.y,life:.7});
    else if(id==="celestialEdict"&&payload.targets?.length)pushBurst("edict",{targets:payload.targets.map(t=>({x:t.enemy.x,y:t.enemy.y,r:t.enemy.r||10})),life:.55});
    else if(id==="divineJudgment"&&enemy)pushBurst("judgment",{x:enemy.x,y:enemy.y,r:enemy.r||10,life:.7});
    else if(id==="heavenSeal"&&enemy)pushBurst("seal",{x:enemy.x,y:enemy.y,r:enemy.r||10,life:.55});
    else if(id==="parasitePact"&&enemy)pushBurst("parasite",{enemy,life:.7});
    else if(id==="scapegoatFate"&&enemy)pushBurst(payload.consumed?"scapegoatConsume":"scapegoatMark",{enemy,life:.75});
    else if(id==="divineGift")pushBurst("gift",{x:player.x,y:player.y,life:.7});
    else if(id==="heavenlyWard")pushBurst("ward",{x:player.x,y:player.y,life:.8});
    else if(id==="lifeRewind")pushBurst("rewind",{x:player.x,y:player.y,life:.85});
    else if(id==="causalInversion")pushBurst(payload.consumed?"causalConsume":"causalArm",{x:player.x,y:player.y,life:.7});
    else if(id==="timeStop")pushBurst("timeStop",{x:player.x,y:player.y,life:.8});
    else pushBurst(id,{x:player.x,y:player.y,life:.65});
  });

  // Đồng Giá does not emit a mechanic event when it converts XP, so observe its existing
  // gainXp result without changing the amount or shield logic.
  const baseGainXpRareVfxV016=gainXp;
  gainXp=function(amount){
    const equalPriceActive=hasDivineSkill("equalPrice")&&player.hp>=player.maxHp-1e-9&&amount>0;
    const result=baseGainXpRareVfxV016(amount);
    if(equalPriceActive)pushBurst("equalPrice",{x:player.x,y:player.y,life:.55});
    return result;
  };

  onSkillEvent("damage_taken",payload=>{
    if(payload?.meta?.source==="bloodDebt"&&oncePerTrigger("bloodDebtTick",.12))pushBurst("bloodDebt",{x:player.x,y:player.y,life:.42});
  });

  function drawPersistentRareVfx(){
    if(hasDivineSkill("divineDomain")&&state.v016RareR2&&state.t<state.v016RareR2.domainUntil){
      ctx.save();ctx.strokeStyle="#ffe08a";ctx.lineWidth=2;ctx.globalAlpha=.22+.10*Math.sin(state.t*4);ctx.beginPath();ctx.arc(player.x,player.y,140,0,Math.PI*2);ctx.stroke();ctx.restore();
    }
    if(hasDivineSkill("timeStop")&&state.v016RareR3&&state.t<state.v016RareR3.timeStopUntil){
      ctx.save();ctx.strokeStyle="#b7dcff";ctx.lineWidth=2;ctx.globalAlpha=.35;ctx.beginPath();ctx.arc(player.x,player.y,44+Math.sin(state.t*8)*2,0,Math.PI*2);ctx.stroke();ctx.fillStyle="#eef8ff";ctx.globalAlpha=.7;ctx.fillRect(player.x-6,player.y-34,4,15);ctx.fillRect(player.x+2,player.y-34,4,15);ctx.restore();
    }
    if(hasDivineSkill("parasitePact")&&state.v016RareR4?.parasiteTarget&&state.t<state.v016RareR4.parasiteUntil&&!state.v016RareR4.parasiteTarget.dead){
      const e=state.v016RareR4.parasiteTarget;ctx.save();ctx.strokeStyle="#c99cff";ctx.lineWidth=2.2;ctx.globalAlpha=.5+.18*Math.sin(state.t*6);ctx.beginPath();ctx.moveTo(player.x,player.y);ctx.lineTo(e.x,e.y);ctx.stroke();ctx.restore();
    }
    if(hasDivineSkill("scapegoatFate")&&state.v016RareR4?.scapegoat&&!state.v016RareR4.scapegoat.dead){
      const e=state.v016RareR4.scapegoat;ctx.save();ctx.strokeStyle="#d9a2d6";ctx.lineWidth=2;ctx.globalAlpha=.72;ctx.beginPath();ctx.arc(e.x,e.y,(e.r||10)+9+Math.sin(state.t*5)*1.5,0,Math.PI*2);ctx.stroke();ctx.restore();
    }
    if(hasDivineSkill("bloodDebt")&&state.v016RareR4?.debts?.length){
      const total=state.v016RareR4.debts.reduce((sum,d)=>sum+Math.max(0,d.remaining||0),0);if(total>0){const ratio=clamp(total/Math.max(1,player.maxHp),0,1);ctx.save();ctx.strokeStyle="#e66b7a";ctx.lineWidth=2.4;ctx.globalAlpha=.7;ctx.beginPath();ctx.arc(player.x,player.y,player.r+12,-Math.PI/2,-Math.PI/2+Math.PI*2*ratio);ctx.stroke();ctx.restore();}
    }
    if(hasDivineSkill("equalPrice")&&player.hp>=player.maxHp-1e-9){
      ctx.save();ctx.strokeStyle="#79a7ff";ctx.lineWidth=1.5;ctx.globalAlpha=.24+.10*Math.sin(state.t*4);ctx.setLineDash([3,4]);ctx.beginPath();ctx.arc(player.x,player.y,player.r+17,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);ctx.restore();
    }
    if(hasDivineSkill("voidReality")&&state.v016RareR4){
      const phase=Math.floor(Math.max(0,state.t-state.v016RareR4.voidStart)/6)%2===0?"void":"real";ctx.save();ctx.strokeStyle=phase==="void"?"#9d78dc":"#f2f2f2";ctx.lineWidth=2;ctx.globalAlpha=.28+.10*Math.sin(state.t*5);ctx.beginPath();ctx.arc(player.x,player.y,player.r+21,0,Math.PI*2);ctx.stroke();ctx.restore();
    }
  }

  function drawBursts(){
    for(const fx of runtime.bursts){
      const age=state.t-fx.start;if(age<0||age>fx.life)continue;const p=clamp(age/fx.life,0,1),fade=1-p;
      ctx.save();
      if(fx.type==="swap"){
        ctx.strokeStyle="#c99cff";ctx.lineWidth=3;ctx.globalAlpha=fade*.85;ctx.beginPath();ctx.moveTo(fx.x1,fx.y1);ctx.lineTo(fx.x2,fx.y2);ctx.stroke();
      }else if(fx.type==="edict"){
        for(const t of fx.targets){ctx.strokeStyle="#ffe08a";ctx.lineWidth=2;ctx.globalAlpha=fade*.8;ctx.beginPath();ctx.arc(t.x,t.y,(t.r||10)+5+p*18,0,Math.PI*2);ctx.stroke();}
      }else if(fx.type==="judgment"||fx.type==="seal"){
        ctx.strokeStyle="#ffe08a";ctx.lineWidth=2.6;ctx.globalAlpha=fade*.9;ctx.beginPath();ctx.arc(fx.x,fx.y,(fx.r||10)+5+p*24,0,Math.PI*2);ctx.stroke();if(fx.type==="judgment"){ctx.beginPath();ctx.moveTo(fx.x-12,fx.y-12);ctx.lineTo(fx.x+12,fx.y+12);ctx.moveTo(fx.x+12,fx.y-12);ctx.lineTo(fx.x-12,fx.y+12);ctx.stroke();}
      }else if(fx.type==="parasite"&&fx.enemy&&!fx.enemy.dead){
        ctx.strokeStyle="#c99cff";ctx.lineWidth=3;ctx.globalAlpha=fade*.8;ctx.beginPath();ctx.moveTo(player.x,player.y);ctx.lineTo(fx.enemy.x,fx.enemy.y);ctx.stroke();
      }else if((fx.type==="scapegoatMark"||fx.type==="scapegoatConsume")&&fx.enemy){
        ctx.strokeStyle=fx.type==="scapegoatConsume"?"#ff9ab7":"#d9a2d6";ctx.lineWidth=2.5;ctx.globalAlpha=fade*.88;ctx.beginPath();ctx.arc(fx.enemy.x,fx.enemy.y,(fx.enemy.r||10)+6+p*22,0,Math.PI*2);ctx.stroke();
      }else{
        const tone=["equalPrice","causalArm","causalConsume"].includes(fx.type)?"#bda6ff":["bloodDebt"].includes(fx.type)?"#e66b7a":"#ffe08a";
        ctx.strokeStyle=tone;ctx.lineWidth=2.4;ctx.globalAlpha=fade*.82;ctx.beginPath();ctx.arc(fx.x??player.x,fx.y??player.y,player.r+8+p*28,0,Math.PI*2);ctx.stroke();
        if(["timeStop","rewind","heavenlyMandate"].includes(fx.type)){ctx.globalAlpha=fade*.36;ctx.beginPath();ctx.arc(fx.x??player.x,fx.y??player.y,player.r+20+p*40,0,Math.PI*2);ctx.stroke();}
      }
      ctx.restore();
    }
    runtime.bursts=runtime.bursts.filter(fx=>state.t-fx.start<fx.life);
  }

  const baseDrawRareVfxV016=draw;
  draw=function(){
    baseDrawRareVfxV016();
    if(!state.running&&!state.gameOver)return;
    drawPersistentRareVfx();
    drawBursts();
  };

  const baseResetRareVfxV016=resetSkillEngine;
  resetSkillEngine=function(){
    const result=baseResetRareVfxV016();
    runtime.bursts.length=0;runtime.lastTriggerAt={};
    return result;
  };
})();
