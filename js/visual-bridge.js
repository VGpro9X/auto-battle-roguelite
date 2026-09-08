// V0.12 Codex/gameplay visual bridge.
function drawDivinePreviewV12(g,kind,key,data,time,w,h){
  v12PreviewFrame(g,w,h);const cx=w*.28,cy=h*.55;
  if(key==="bribery"){
    v12Actor(g,cx,cy);v12Enemy(g,w*.55,cy,9);v12Enemy(g,w*.8,cy,9);const active=((time*.35)%1)>.35;g.save();g.globalAlpha=active?1:.35;g.strokeStyle="#73d6b2";g.lineWidth=3;g.beginPath();g.arc(w*.55,cy,16,0,Math.PI*2);g.stroke();g.restore();v12Arrow(g,w*.61,cy,0,26,"#73d6b2",.8);v12Star(g,w*.8,cy,8,"#73d6b2",time,.7);return;
  }
  if(key==="immortalBreath"){
    v12Actor(g,w*.5,cy);v12Ring(g,w*.5,cy,26,"#ffe889",.8,3);v12Ring(g,w*.5,cy,34,"#fff2aa",.25+.25*Math.sin(time*6),2);g.fillStyle="#ff6d77";g.fillRect(w*.34,h*.76,w*.32,5);g.fillStyle="#ffe889";g.fillRect(w*.34,h*.76,4,5);g.font=`bold ${Math.max(11,h*.15)}px sans-serif`;g.fillText("1 HP",w*.43,h*.34);return;
  }
  if(key==="heavenlyPunishment"){
    const pts=[[w*.38,h*.67],[w*.58,h*.6],[w*.78,h*.69]];for(const pt of pts)v12Enemy(g,...pt,8);for(let i=0;i<pts.length;i++){drawLightningArc(g,pts[i][0],h*.08,pts[i][0],pts[i][1],time+i*.2,7,.9);v12Star(g,pts[i][0],pts[i][1],8,VFX_COLORS.lightning,time+i,.75);}return;
  }
  if(key==="fateExchange"){
    v12Actor(g,w*.32,cy);v12Enemy(g,w*.72,cy,10);v12Heart(g,w*.32,cy-24,.28,"#ff6f7d",.8);v12Heart(g,w*.72,cy-24,.5,"#ff6f7d",.8);const q=(time*.45)%1;const x=w*.32+(w*.4)*q;v12Arrow(g,x,cy,0,18,"#b58cff",.7);v12Arrow(g,w-x+w*.04,cy+14,Math.PI,18,"#78caff",.7);return;
  }
  v12Star(g,w*.5,cy,16,kind==="mystic"?"#bb7dff":"#ffc55b",time,.8);
}

const baseDrawCodexPreviewV011=drawCodexPreview;
drawCodexPreview=function(g,kind,key,data,time,w,h){
  if(kind==="skill"&&SKILL_VISUAL_PROFILES[key])return drawSkillVisualProfile(g,key,time,w,h);
  if(kind==="divine"||kind==="mystic")return drawDivinePreviewV12(g,kind,key,data,time,w,h);
  return baseDrawCodexPreviewV011(g,kind,key,data,time,w,h);
};

const baseDrawProjectileVisualV011=drawProjectileVisual;
drawProjectileVisual=function(g,x,y,r,tags=[],time=0,options={}){
  const source=options?.source||"";
  if(source==="normal"){
    const crit=Boolean(options?.crit);
    const powerLevel=typeof skillLevel==="function"?skillLevel("power"):0;
    const pierceLevel=typeof skillLevel==="function"?skillLevel("pierce"):0;
    const velocityLevel=typeof skillLevel==="function"?skillLevel("velocity"):0;
    const rr=r*(1+powerLevel*.08);
    const trail=8+pierceLevel*5+velocityLevel*4;
    v12Projectile(g,x,y,rr,crit?"#ffd36f":"#e7efff",time,trail);
    if(crit)v12Star(g,x,y,rr*2.1,"#ffd36f",time*2,.7);
    return;
  }
  if(source==="fire"||source==="fireWisp"){
    baseDrawProjectileVisualV011(g,x,y,r,[...new Set([...tags,"FIRE"])],time,options);return;
  }
  if(source==="chaosOrb"){
    const cols=[VFX_COLORS.fire,VFX_COLORS.ice,VFX_COLORS.lightning,VFX_COLORS.poison,VFX_COLORS.soul];
    const idx=Math.floor(time*7)%cols.length;v12Projectile(g,x,y,r,cols[idx],time,12);return;
  }
  baseDrawProjectileVisualV011(g,x,y,r,tags,time,options);
};

if(!state.ruleVfx)state.ruleVfx=[];
onSkillEvent("divine_trigger",payload=>{
  state.ruleVfx.push({id:payload.id,start:state.t,life:1.1});
});
const baseDrawV012=draw;
draw=function(){
  baseDrawV012();
  if(!state.ruleVfx?.length)return;
  for(const fx of state.ruleVfx){
    const age=state.t-fx.start,p=clamp(age/fx.life,0,1);
    if(fx.id==="heavenlyPunishment"){
      ctx.save();ctx.globalAlpha=(1-p)*.22;ctx.fillStyle="#fff7b0";ctx.fillRect(0,0,W,H);ctx.restore();
    }else if(fx.id==="immortalBreath"){
      v12Ring(ctx,player.x,player.y,player.r+18+p*30,"#ffe889",(1-p)*.8,3);
    }else if(fx.id==="fateExchange"){
      v12Ring(ctx,player.x,player.y,player.r+12+p*34,"#b58cff",(1-p)*.65,2);
    }
  }
  state.ruleVfx=state.ruleVfx.filter(fx=>state.t-fx.start<fx.life);
};

// Safety guard: build-unlock toasts belong to an active run only.
// This also prevents development/test events from leaking onto the main menu.
if(typeof showNextBuildUnlockToast==="function"){
  const baseShowNextBuildUnlockToastV012=showNextBuildUnlockToast;
  showNextBuildUnlockToast=function(){
    if(!state.running||state.gameOver){
      if(typeof unlockToastQueue!=="undefined")unlockToastQueue.length=0;
      if(typeof unlockToastActive!=="undefined")unlockToastActive=false;
      const toast=document.getElementById("unlockToast");
      if(toast)toast.classList.add("hidden");
      return;
    }
    return baseShowNextBuildUnlockToastV012();
  };
}
