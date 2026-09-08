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

// V0.13 checkpoint 1: combat readability and impact feedback.
// Keep element color and mechanic identity separate: element color comes from tags,
// while projectile shape, impact language and status marks communicate mechanics.
if(!state.combatVfx)state.combatVfx=[];
state.combatFeedbackClock={damage:0,heal:0,shield:0};
state.combatFeedbackPending={damage:0,heal:0,shield:0};

function pushCombatVfx(type,x,y,options={}){
  if(!settings?.particles&&options.particleOnly)return;
  state.combatVfx.push({type,x,y,start:state.t,life:options.life||.5,...options});
}

function combatTagColor(tags=[]){
  if(tags.includes("CRITICAL"))return "#ffd36f";
  return vfxColorForTags(tags);
}

function queuePlayerFeedback(kind,amount,color,label){
  if(amount<=0)return;
  state.combatFeedbackPending[kind]=(state.combatFeedbackPending[kind]||0)+amount;
  const cooldown=kind==="damage"?.28:.34;
  if(state.t-(state.combatFeedbackClock[kind]||0)<cooldown)return;
  const total=state.combatFeedbackPending[kind];
  state.combatFeedbackPending[kind]=0;
  state.combatFeedbackClock[kind]=state.t;
  pushCombatVfx("float",player.x,player.y-player.r-8,{life:.72,color,text:`${label}${Math.max(1,Math.round(total))}`,vy:-22});
}

const baseAddShieldV013=addShield;
addShield=function(amount){
  const gained=baseAddShieldV013(amount);
  if(gained>0)emitSkillEvent("shield_gain",{amount:gained});
  return gained;
};

const baseApplyPoisonV013=applyPoison;
applyPoison=function(enemy,dps,duration){
  if(!enemy||enemy.dead)return baseApplyPoisonV013(enemy,dps,duration);
  const wasActive=Boolean(enemy.statuses?.poison&&enemy.statuses.poison.until>state.t);
  const result=baseApplyPoisonV013(enemy,dps,duration);
  if(!wasActive||state.t-(enemy._poisonVfxAt||-99)>.65){
    enemy._poisonVfxAt=state.t;
    pushCombatVfx("status",enemy.x,enemy.y,{life:.42,color:VFX_COLORS.poison,status:"poison"});
  }
  return result;
};

const baseApplyBurnV013=applyBurn;
applyBurn=function(enemy,dps,duration){
  if(!enemy||enemy.dead)return baseApplyBurnV013(enemy,dps,duration);
  const wasActive=Boolean(enemy.statuses?.burn&&enemy.statuses.burn.until>state.t);
  const result=baseApplyBurnV013(enemy,dps,duration);
  if(!wasActive||state.t-(enemy._burnVfxAt||-99)>.65){
    enemy._burnVfxAt=state.t;
    pushCombatVfx("status",enemy.x,enemy.y,{life:.42,color:VFX_COLORS.fire,status:"burn"});
  }
  return result;
};

onSkillEvent("hit",payload=>{
  const enemy=payload.enemy;
  if(!enemy)return;
  const tags=payload.meta?.tags||[];
  const isDot=tags.includes("DOT");
  const crit=Boolean(payload.meta?.crit)||tags.includes("CRITICAL");
  const heavy=payload.damage>=Math.max(18,(enemy.maxHp||1)*.22);
  if(!isDot||payload.killed){
    pushCombatVfx("impact",enemy.x,enemy.y,{life:crit?.38:(heavy?.32:.22),color:crit?"#ffd36f":combatTagColor(tags),crit,heavy,r:enemy.r||10});
  }
  if((crit||heavy)&&payload.damage>=1){
    pushCombatVfx("float",enemy.x,enemy.y-(enemy.r||10)-5,{life:.68,color:crit?"#ffe58f":"#f3f5ff",text:`${Math.round(payload.damage)}`,vy:crit?-30:-22,scale:crit?1.18:1});
  }
});

onSkillEvent("kill",payload=>{
  const enemy=payload.enemy;if(!enemy)return;
  pushCombatVfx("death",enemy.x,enemy.y,{life:enemy.elite?.62:.42,color:enemy.elite?"#d39cff":"#e98c8c",elite:Boolean(enemy.elite),r:enemy.r||10});
});

onSkillEvent("heal",payload=>{
  const source=payload.meta?.source||"";
  if(source==="regen"&&state.t-(state.combatFeedbackClock.heal||0)<.8){state.combatFeedbackPending.heal+=payload.amount;return;}
  queuePlayerFeedback("heal",payload.amount,"#77e3a0","+");
  pushCombatVfx("playerPulse",player.x,player.y,{life:.45,color:"#77e3a0",radius:player.r+8});
});

onSkillEvent("shield_gain",payload=>{
  queuePlayerFeedback("shield",payload.amount,VFX_COLORS.shield,"+");
  pushCombatVfx("playerPulse",player.x,player.y,{life:.48,color:VFX_COLORS.shield,radius:player.r+11});
});

onSkillEvent("damage_taken",payload=>{
  queuePlayerFeedback("damage",payload.amount,"#ff7b82","−");
  if(state.t-(state._lastDamagePulseV013||-99)>.22){
    state._lastDamagePulseV013=state.t;
    pushCombatVfx("playerPulse",player.x,player.y,{life:.34,color:"#ff6f78",radius:player.r+7});
  }
});

onSkillEvent("dodge",()=>{
  pushCombatVfx("float",player.x,player.y-player.r-10,{life:.55,color:"#a9dcff",text:"NÉ",vy:-25,scale:.92});
  pushCombatVfx("playerPulse",player.x,player.y,{life:.28,color:"#a9dcff",radius:player.r+10});
});

onSkillEvent("shield_broken",()=>{
  pushCombatVfx("shieldBreak",player.x,player.y,{life:.58,color:VFX_COLORS.shield,radius:player.r+12});
});

onSkillEvent("revive",()=>{
  pushCombatVfx("playerPulse",player.x,player.y,{life:1,color:"#fff0a1",radius:player.r+20,strong:true});
  pushCombatVfx("float",player.x,player.y-player.r-14,{life:.9,color:"#fff0a1",text:"HỒI MỆNH",vy:-18,scale:1.05});
});

onSkillEvent("build_unlock",payload=>{
  if(!state.running||state.gameOver)return;
  const evolution=payload.kind==="evolution";
  pushCombatVfx("unlockWave",player.x,player.y,{life:evolution?1.15:.85,color:evolution?"#c9a5ff":"#79e6d0",radius:evolution?150:110,strong:evolution});
});

const baseResetSkillEngineV013=resetSkillEngine;
resetSkillEngine=function(){
  const result=baseResetSkillEngineV013();
  state.combatVfx=[];
  state.combatFeedbackClock={damage:0,heal:0,shield:0};
  state.combatFeedbackPending={damage:0,heal:0,shield:0};
  state._lastDamagePulseV013=-99;
  return result;
};

// Replace stacked status rings with compact, mechanic-specific marks.
drawEnemyStatusVisual=function(g,x,y,r,enemy,time=0){
  if(!enemy)return;
  g.save();
  if(enemy.statuses?.burn){
    g.strokeStyle=VFX_COLORS.fire;g.lineWidth=2;g.globalAlpha=.8;
    for(let i=0;i<2;i++){
      const ox=(i?1:-1)*r*.45,oy=-r*.62-Math.sin(time*9+i)*2;
      g.beginPath();g.moveTo(x+ox,y+oy+5);g.quadraticCurveTo(x+ox+(i?3:-3),y+oy,x+ox,y+oy-5);g.stroke();
    }
  }
  if(enemy.statuses?.poison){
    g.fillStyle=VFX_COLORS.poison;g.globalAlpha=.78;
    for(let i=0;i<3;i++){
      const a=time*1.8+i*2.1,rr=1.6+i*.35;
      g.beginPath();g.arc(x-r*.72+Math.cos(a)*3,y+r*.25+Math.sin(a*1.2)*5,rr,0,Math.PI*2);g.fill();
    }
  }
  if(enemy.chilled){
    g.strokeStyle=VFX_COLORS.ice;g.lineWidth=1.5;g.globalAlpha=.72;
    for(let i=0;i<4;i++){
      const a=i*Math.PI/2+Math.PI/4,rr=r+4;
      const sx=x+Math.cos(a)*rr,sy=y+Math.sin(a)*rr;
      g.beginPath();g.moveTo(sx-Math.cos(a)*3,sy-Math.sin(a)*3);g.lineTo(sx+Math.cos(a)*3,sy+Math.sin(a)*3);g.stroke();
    }
  }
  if(enemy.markedUntil>time){
    const rr=r+7;g.strokeStyle=VFX_COLORS.mark;g.lineWidth=2;g.globalAlpha=.82+.12*Math.sin(time*6);
    const c=5;
    g.beginPath();
    g.moveTo(x-rr,y-rr+c);g.lineTo(x-rr,y-rr);g.lineTo(x-rr+c,y-rr);
    g.moveTo(x+rr-c,y-rr);g.lineTo(x+rr,y-rr);g.lineTo(x+rr,y-rr+c);
    g.moveTo(x+rr,y+rr-c);g.lineTo(x+rr,y+rr);g.lineTo(x+rr-c,y+rr);
    g.moveTo(x-rr+c,y+rr);g.lineTo(x-rr,y+rr);g.lineTo(x-rr,y+rr-c);g.stroke();
  }
  g.restore();
};

function drawNormalProjectileIdentityV013(projectile){
  if(!projectile||projectile.meta?.source!=="normal")return;
  const powerLevel=skillLevel("power");
  const multiLevel=skillLevel("multishot");
  const pierceLevel=skillLevel("pierce");
  const precisionLevel=skillLevel("precision");
  const crit=Boolean(projectile.meta?.crit);
  const speed=Math.hypot(projectile.vx,projectile.vy)||1;
  const ux=projectile.vx/speed,uy=projectile.vy/speed;
  const nx=-uy,ny=ux;
  const color=crit?"#ffd36f":"#edf3ff";
  const body=5+powerLevel*.65;
  const lance=6+pierceLevel*4;

  ctx.save();
  ctx.globalAlpha=.82;
  ctx.strokeStyle=color;
  ctx.lineCap="round";
  ctx.lineWidth=1.4+powerLevel*.16;
  ctx.beginPath();ctx.moveTo(projectile.x-ux*lance,projectile.y-uy*lance);ctx.lineTo(projectile.x+ux*body,projectile.y+uy*body);ctx.stroke();

  if(pierceLevel){
    ctx.globalAlpha=.44+.08*pierceLevel;
    for(let i=1;i<=Math.min(3,pierceLevel);i++){
      const back=6+i*4;
      ctx.beginPath();ctx.moveTo(projectile.x-ux*back+nx*3,projectile.y-uy*back+ny*3);ctx.lineTo(projectile.x-ux*(back+4)-nx*3,projectile.y-uy*(back+4)-ny*3);ctx.stroke();
    }
  }

  if(multiLevel){
    ctx.globalAlpha=.55;
    ctx.lineWidth=1.2;
    ctx.beginPath();
    ctx.moveTo(projectile.x-ux*2+nx*(3+multiLevel),projectile.y-uy*2+ny*(3+multiLevel));
    ctx.lineTo(projectile.x+ux*4,projectile.y+uy*4);
    ctx.lineTo(projectile.x-ux*2-nx*(3+multiLevel),projectile.y-uy*2-ny*(3+multiLevel));
    ctx.stroke();
  }

  if(powerLevel){
    ctx.globalAlpha=.08+powerLevel*.018;
    ctx.fillStyle="#ffad6b";
    ctx.beginPath();ctx.arc(projectile.x,projectile.y,projectile.r*2.2+powerLevel*.55,0,Math.PI*2);ctx.fill();
  }

  if(crit){
    ctx.globalAlpha=.86;
    ctx.strokeStyle="#ffe793";
    ctx.lineWidth=1.5;
    const rr=projectile.r*(2+precisionLevel*.16);
    ctx.beginPath();ctx.arc(projectile.x,projectile.y,rr,0,Math.PI*2);ctx.stroke();
    if(precisionLevel){
      const cr=rr+3+precisionLevel*.5;
      ctx.globalAlpha=.66;
      for(let i=0;i<4;i++){
        const a=i*Math.PI/2;
        ctx.beginPath();ctx.moveTo(projectile.x+Math.cos(a)*cr,projectile.y+Math.sin(a)*cr);ctx.lineTo(projectile.x+Math.cos(a)*(cr+4),projectile.y+Math.sin(a)*(cr+4));ctx.stroke();
      }
    }
  }
  ctx.restore();
}

function drawEchoProjectileIdentityV013(projectile){
  if(projectile?.meta?.source!=="echoShot")return;
  const speed=Math.hypot(projectile.vx,projectile.vy)||1,ux=projectile.vx/speed,uy=projectile.vy/speed;
  ctx.save();ctx.strokeStyle="#bfc9ff";ctx.lineWidth=1.4;ctx.globalAlpha=.38;
  for(let i=1;i<=2;i++){
    ctx.beginPath();ctx.arc(projectile.x-ux*i*7,projectile.y-uy*i*7,Math.max(1.5,projectile.r-i*.7),0,Math.PI*2);ctx.stroke();
  }
  ctx.restore();
}

function drawCombatVfxV013(){
  for(const projectile of state.projectiles){
    drawNormalProjectileIdentityV013(projectile);
    drawEchoProjectileIdentityV013(projectile);
  }

  for(const fx of state.combatVfx){
    const age=state.t-fx.start;
    if(age<0||age>fx.life)continue;
    const p=clamp(age/fx.life,0,1),fade=1-p;
    ctx.save();
    if(fx.type==="impact"){
      const radius=(fx.r||9)*(1+p*(fx.crit?1.8:(fx.heavy?1.35:.75)));
      ctx.strokeStyle=fx.color;ctx.globalAlpha=fade*(fx.crit?.95:.7);ctx.lineWidth=fx.crit?2.4:(fx.heavy?2:1.35);
      ctx.beginPath();ctx.arc(fx.x,fx.y,radius,0,Math.PI*2);ctx.stroke();
      const rays=fx.crit?8:(fx.heavy?6:3);
      for(let i=0;i<rays;i++){
        const a=i*Math.PI*2/rays+age*3,inner=radius*.7,outer=radius+(fx.crit?8:5)*fade;
        ctx.beginPath();ctx.moveTo(fx.x+Math.cos(a)*inner,fx.y+Math.sin(a)*inner);ctx.lineTo(fx.x+Math.cos(a)*outer,fx.y+Math.sin(a)*outer);ctx.stroke();
      }
    }else if(fx.type==="death"){
      const radius=(fx.r||10)+p*(fx.elite?30:20);
      ctx.strokeStyle=fx.color;ctx.globalAlpha=fade*.72;ctx.lineWidth=fx.elite?2.6:1.7;ctx.beginPath();ctx.arc(fx.x,fx.y,radius,0,Math.PI*2);ctx.stroke();
      const shards=fx.elite?8:5;ctx.fillStyle=fx.color;
      for(let i=0;i<shards;i++){
        const a=i*Math.PI*2/shards+.35,rr=radius*(.45+p*.55),sx=fx.x+Math.cos(a)*rr,sy=fx.y+Math.sin(a)*rr;
        ctx.globalAlpha=fade*.55;ctx.beginPath();ctx.arc(sx,sy,fx.elite?2.2:1.6,0,Math.PI*2);ctx.fill();
      }
    }else if(fx.type==="float"){
      ctx.globalAlpha=fade;ctx.fillStyle=fx.color||"#fff";ctx.textAlign="center";ctx.textBaseline="middle";
      ctx.font=`700 ${Math.round(13*(fx.scale||1))}px system-ui, sans-serif`;
      ctx.fillText(fx.text,fx.x,fx.y+(fx.vy||-20)*p);
    }else if(fx.type==="playerPulse"){
      const radius=(fx.radius||player.r+8)+p*(fx.strong?42:20);
      ctx.globalAlpha=fade*(fx.strong?.88:.58);ctx.strokeStyle=fx.color;ctx.lineWidth=fx.strong?3:2;ctx.beginPath();ctx.arc(fx.x,fx.y,radius,0,Math.PI*2);ctx.stroke();
    }else if(fx.type==="shieldBreak"){
      const radius=(fx.radius||player.r+10)+p*28;ctx.strokeStyle=fx.color;ctx.fillStyle=fx.color;ctx.lineWidth=2;ctx.globalAlpha=fade*.82;
      ctx.beginPath();ctx.arc(fx.x,fx.y,radius,0,Math.PI*2);ctx.stroke();
      for(let i=0;i<7;i++){
        const a=i*Math.PI*2/7+.2,rr=radius+6*p,sx=fx.x+Math.cos(a)*rr,sy=fx.y+Math.sin(a)*rr;
        ctx.beginPath();ctx.moveTo(sx,sy-3);ctx.lineTo(sx+3,sy+3);ctx.lineTo(sx-3,sy+2);ctx.closePath();ctx.fill();
      }
    }else if(fx.type==="status"){
      const radius=8+p*16;ctx.strokeStyle=fx.color;ctx.globalAlpha=fade*.65;ctx.lineWidth=1.8;ctx.beginPath();ctx.arc(fx.x,fx.y,radius,0,Math.PI*2);ctx.stroke();
    }else if(fx.type==="unlockWave"){
      const radius=18+p*(fx.radius||110);ctx.strokeStyle=fx.color;ctx.globalAlpha=fade*(fx.strong?.8:.58);ctx.lineWidth=fx.strong?3:2;ctx.beginPath();ctx.arc(fx.x,fx.y,radius,0,Math.PI*2);ctx.stroke();
      if(fx.strong){ctx.globalAlpha=fade*.07;ctx.fillStyle=fx.color;ctx.beginPath();ctx.arc(fx.x,fx.y,radius,0,Math.PI*2);ctx.fill();}
    }
    ctx.restore();
  }
  state.combatVfx=state.combatVfx.filter(fx=>state.t-fx.start<fx.life);
}

const baseDrawV013=draw;
draw=function(){
  baseDrawV013();
  if(!state.running&&!state.gameOver)return;
  drawCombatVfxV013();
};
