// V0.13 checkpoint 2: summon actors and Hợp Đạo Kỹ / Siêu Cấp usage feedback.
if(!state.summonCastVfx)state.summonCastVfx=[];
if(!state.powerSignatureVfx)state.powerSignatureVfx=[];

function getFireWispPositionV013(){
  const a=state.t*2.15;
  const radius=42+Math.min(10,skillLevel("fireWisp")*2);
  return{x:player.x+Math.cos(a)*radius,y:player.y+Math.sin(a)*radius*.72};
}

function getStormTotemPositionV013(){
  const a=-state.t*.65+2.2;
  const radius=54;
  return{x:player.x+Math.cos(a)*radius,y:player.y+Math.sin(a)*radius*.58};
}

function pushSummonCastV013(type,data={}){
  state.summonCastVfx.push({type,start:state.t,life:data.life||.45,...data});
}

function pushPowerSignatureV013(kind,x,y,colors,options={}){
  state.powerSignatureVfx.push({kind,x,y,colors,start:state.t,life:options.life||.5,r:options.r||18,strong:Boolean(options.strong)});
}

if(skills.fireWisp?.periodic){
  skills.fireWisp.periodic.execute=level=>{
    const enemy=randomEnemy();if(!enemy)return false;
    const pos=getFireWispPositionV013();
    createProjectileFrom(pos.x,pos.y,enemy,8+level*6,360,4,"wisp",0,{source:"fireWisp",tags:["SUMMON","FIRE","PROJECTILE","PERIODIC"]});
    pushSummonCastV013("wispCast",{x:pos.x,y:pos.y,color:VFX_COLORS.fire,life:.32});
    return true;
  };
}

if(skills.stormTotem?.periodic){
  skills.stormTotem.periodic.execute=level=>{
    const targets=getRandomEnemies(Math.min(4,1+Math.ceil(level/2)));if(!targets.length)return false;
    const pos=getStormTotemPositionV013();
    for(const enemy of targets){
      hitEnemy(enemy,8+level*7,0,{source:"stormTotem",tags:["SUMMON","LIGHTNING","PERIODIC"]});
      pushSummonCastV013("totemArc",{x1:pos.x,y1:pos.y,x2:enemy.x,y2:enemy.y,color:VFX_COLORS.lightning,life:.24});
    }
    pushSummonCastV013("totemCast",{x:pos.x,y:pos.y,color:VFX_COLORS.lightning,life:.38});
    return true;
  };
}

const SYNERGY_SIGNATURES_V013={
  thermalShock:[VFX_COLORS.fire,VFX_COLORS.ice],
  explosiveBlades:["#d7dfff","#ff8a65"],
  toxicFlame:[VFX_COLORS.fire,VFX_COLORS.poison],
  stormVolley:["#e8efff",VFX_COLORS.lightning],
  bloodConductor:[VFX_COLORS.blood,VFX_COLORS.lightning],
  arcCollector:[VFX_COLORS.xp,VFX_COLORS.lightning],
  plagueLightning:[VFX_COLORS.poison,VFX_COLORS.lightning],
  combustion:[VFX_COLORS.fire,"#ff7f4f"],
  criticalStorm:["#ffd36f",VFX_COLORS.lightning],
  lastBreath:["#fff0a1","#d7a2ff"]
};

onSkillEvent("hit",payload=>{
  const source=payload.meta?.source||"";
  const colors=SYNERGY_SIGNATURES_V013[source];
  if(!colors||!payload.enemy)return;
  const key=`sig_${source}`;
  if(state.t-(skillRuntime.cooldowns[key]||-99)<.12)return;
  skillRuntime.cooldowns[key]=state.t;
  pushPowerSignatureV013("synergy",payload.enemy.x,payload.enemy.y,colors,{life:.42,r:payload.enemy.r+7});
});

onSkillEvent("periodic",payload=>{
  const key=payload.skillKey;
  let colors=null;
  if(key==="fire"&&hasEvolution("heavenfire"))colors=[VFX_COLORS.fire,"#fff0a0"];
  else if(key==="lightning"&&hasEvolution("stormNetwork"))colors=[VFX_COLORS.lightning,"#9ddcff"];
  else if(key==="blackHole"&&hasEvolution("singularity"))colors=[VFX_COLORS.void,"#d8c8ff"];
  else if(key==="barrier"&&hasEvolution("immortalAegis"))colors=[VFX_COLORS.shield,"#fff0a1"];
  else if(key==="chaosOrb"&&hasEvolution("chaosCrown"))colors=["#c987ff","#fff0a1"];
  if(colors)pushPowerSignatureV013("evolution",player.x,player.y,colors,{life:.72,r:player.r+24,strong:true});
});

onSkillEvent("kill",payload=>{
  if(hasEvolution("crimsonMoon")&&skillLevel("blood")){
    pushPowerSignatureV013("evolution",payload.enemy.x,payload.enemy.y,[VFX_COLORS.blood,"#f3b4cf"],{life:.55,r:(payload.enemy.r||10)+12,strong:true});
  }
});

function drawFireWispActorV013(){
  const level=skillLevel("fireWisp");if(!level)return;
  const p=getFireWispPositionV013();
  const mastery=skillLevel("summonMastery");
  ctx.save();
  ctx.globalAlpha=.16+.018*mastery;ctx.fillStyle=VFX_COLORS.fire;ctx.beginPath();ctx.arc(p.x,p.y,10+mastery*.7,0,Math.PI*2);ctx.fill();
  ctx.globalAlpha=.95;ctx.fillStyle="#ffd49a";ctx.beginPath();ctx.moveTo(p.x,p.y-8);ctx.quadraticCurveTo(p.x+7,p.y-1,p.x,p.y+7);ctx.quadraticCurveTo(p.x-6,p.y,p.x,p.y-8);ctx.fill();
  ctx.fillStyle="#ff8d4b";ctx.globalAlpha=.9;ctx.beginPath();ctx.arc(p.x,p.y+1,3.2,0,Math.PI*2);ctx.fill();
  if(mastery){ctx.strokeStyle="#d7dfff";ctx.globalAlpha=.35;ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(p.x,p.y,13+Math.sin(state.t*4)*1.5,0,Math.PI*2);ctx.stroke();}
  ctx.restore();
}

function drawStormTotemActorV013(){
  const level=skillLevel("stormTotem");if(!level)return;
  const p=getStormTotemPositionV013();
  const mastery=skillLevel("summonMastery");
  ctx.save();ctx.translate(p.x,p.y);
  ctx.globalAlpha=.14+.018*mastery;ctx.fillStyle=VFX_COLORS.lightning;ctx.beginPath();ctx.arc(0,0,12+mastery*.8,0,Math.PI*2);ctx.fill();
  ctx.globalAlpha=.95;ctx.fillStyle="#aab6d4";ctx.beginPath();ctx.moveTo(0,-9);ctx.lineTo(7,-3);ctx.lineTo(5,8);ctx.lineTo(-5,8);ctx.lineTo(-7,-3);ctx.closePath();ctx.fill();
  ctx.strokeStyle=VFX_COLORS.lightning;ctx.lineWidth=1.6;ctx.globalAlpha=.9;ctx.beginPath();ctx.moveTo(-2,-5);ctx.lineTo(2,-1);ctx.lineTo(-1,2);ctx.lineTo(3,5);ctx.stroke();
  if(mastery){ctx.strokeStyle="#d7dfff";ctx.globalAlpha=.35;ctx.beginPath();ctx.arc(0,0,15+Math.sin(state.t*4.5)*1.5,0,Math.PI*2);ctx.stroke();}
  ctx.restore();
}

function drawSummonCastsV013(){
  for(const fx of state.summonCastVfx){
    const age=state.t-fx.start;if(age<0||age>fx.life)continue;
    const p=clamp(age/fx.life,0,1),fade=1-p;
    if(fx.type==="totemArc"){
      drawLightningArc(ctx,fx.x1,fx.y1,fx.x2,fx.y2,state.t*2,7,fade*.95);
    }else{
      ctx.save();ctx.strokeStyle=fx.color;ctx.globalAlpha=fade*.75;ctx.lineWidth=2;
      ctx.beginPath();ctx.arc(fx.x,fx.y,5+p*18,0,Math.PI*2);ctx.stroke();ctx.restore();
    }
  }
  state.summonCastVfx=state.summonCastVfx.filter(fx=>state.t-fx.start<fx.life);
}

function drawPowerSignaturesV013(){
  for(const fx of state.powerSignatureVfx){
    const age=state.t-fx.start;if(age<0||age>fx.life)continue;
    const p=clamp(age/fx.life,0,1),fade=1-p;
    const c1=fx.colors?.[0]||"#fff",c2=fx.colors?.[1]||c1;
    ctx.save();ctx.translate(fx.x,fx.y);ctx.rotate(age*(fx.kind==="evolution"?2.4:3.8));
    ctx.globalAlpha=fade*(fx.strong?.8:.62);ctx.strokeStyle=c1;ctx.lineWidth=fx.strong?2.8:1.8;
    ctx.beginPath();ctx.arc(0,0,fx.r+p*(fx.strong?34:20),0,Math.PI*2);ctx.stroke();
    ctx.strokeStyle=c2;ctx.globalAlpha=fade*(fx.strong?.68:.5);
    const rr=fx.r*.7+p*(fx.strong?24:14);
    ctx.beginPath();for(let i=0;i<8;i++){const a=i*Math.PI/4,r=i%2?rr*.72:rr;const x=Math.cos(a)*r,y=Math.sin(a)*r;i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.closePath();ctx.stroke();
    if(fx.kind==="evolution"){
      ctx.globalAlpha=fade*.08;ctx.fillStyle=c2;ctx.beginPath();ctx.arc(0,0,fx.r+p*28,0,Math.PI*2);ctx.fill();
    }
    ctx.restore();
  }
  state.powerSignatureVfx=state.powerSignatureVfx.filter(fx=>state.t-fx.start<fx.life);
}

const baseResetSkillEngineSummonsV013=resetSkillEngine;
resetSkillEngine=function(){
  const result=baseResetSkillEngineSummonsV013();
  state.summonCastVfx=[];state.powerSignatureVfx=[];
  return result;
};

const baseDrawSummonsV013=draw;
draw=function(){
  baseDrawSummonsV013();
  if(!state.running&&!state.gameOver)return;
  drawFireWispActorV013();
  drawStormTotemActorV013();
  drawSummonCastsV013();
  drawPowerSignaturesV013();
};
