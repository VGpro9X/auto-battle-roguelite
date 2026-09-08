const VFX_COLORS={
  neutral:"#e7e7e7",
  fire:"#ffb05b",
  ice:"#8fd8ff",
  lightning:"#fff58a",
  poison:"#91d36b",
  blood:"#e66b7a",
  shield:"#78beff",
  soul:"#b28cff",
  xp:"#79a7ff",
  mark:"#e7d46b",
  void:"#9a7cff"
};

function vfxColorForTags(tags=[]){
  if(tags.includes("FIRE"))return VFX_COLORS.fire;
  if(tags.includes("ICE"))return VFX_COLORS.ice;
  if(tags.includes("LIGHTNING"))return VFX_COLORS.lightning;
  if(tags.includes("POISON"))return VFX_COLORS.poison;
  if(tags.includes("BLOOD"))return VFX_COLORS.blood;
  if(tags.includes("SHIELD"))return VFX_COLORS.shield;
  if(tags.includes("SOUL"))return VFX_COLORS.soul;
  if(tags.includes("XP"))return VFX_COLORS.xp;
  if(tags.includes("MARK"))return VFX_COLORS.mark;
  return VFX_COLORS.neutral;
}

function drawGlowDot(g,x,y,r,color,alpha=1){
  g.save();
  g.globalAlpha=alpha*.18;
  g.fillStyle=color;
  g.beginPath();g.arc(x,y,r*2.7,0,Math.PI*2);g.fill();
  g.globalAlpha=alpha;
  g.fillStyle=color;
  g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill();
  g.restore();
}

function drawProjectileVisual(g,x,y,r,tags=[],time=0,options={}){
  const color=vfxColorForTags(tags);
  const pulse=1+Math.sin(time*7+(x+y)*.01)*.10;
  drawGlowDot(g,x,y,Math.max(2,r*pulse),color,1);
  if(tags.includes("LIGHTNING")){
    g.save();g.strokeStyle=color;g.lineWidth=1.2;g.globalAlpha=.7;
    g.beginPath();g.moveTo(x-r*2.3,y);g.lineTo(x-r*.8,y-r*.8);g.lineTo(x+r*.3,y+r*.5);g.lineTo(x+r*2.1,y-r*.2);g.stroke();g.restore();
  }
  if(tags.includes("FIRE")){
    g.save();g.globalAlpha=.5;g.fillStyle=color;
    g.beginPath();g.moveTo(x-r*2.4,y);g.lineTo(x-r*.4,y-r*.8);g.lineTo(x-r*.3,y+r*.8);g.closePath();g.fill();g.restore();
  }
}

function drawOrbitBladeVisual(g,x,y,rotation=0,evolved=false,time=0){
  g.save();g.translate(x,y);g.rotate(rotation);
  if(evolved){
    g.globalAlpha=.15;g.fillStyle="#b79cff";g.beginPath();g.arc(0,0,15+Math.sin(time*5)*2,0,Math.PI*2);g.fill();g.globalAlpha=1;
  }
  g.fillStyle=evolved?"#efe9ff":"#d9dde8";g.fillRect(-2.2,-11,4.4,18);
  g.fillStyle=evolved?"#bca8ff":"#a8b0c2";g.fillRect(-5.5,5,11,3.2);
  g.restore();
}

function drawShieldVisual(g,x,y,r,time=0,intensity=1){
  g.save();
  g.strokeStyle=VFX_COLORS.shield;
  g.globalAlpha=.55+.2*Math.sin(time*4);
  g.lineWidth=2.2+intensity;
  g.beginPath();g.arc(x,y,r+Math.sin(time*3)*1.5,0,Math.PI*2);g.stroke();
  g.globalAlpha=.10*intensity;g.fillStyle=VFX_COLORS.shield;g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill();
  g.restore();
}

function drawEnemyStatusVisual(g,x,y,r,enemy,time=0){
  g.save();
  if(enemy?.statuses?.poison){
    g.strokeStyle=VFX_COLORS.poison;g.lineWidth=2;g.globalAlpha=.75+.15*Math.sin(time*6);g.beginPath();g.arc(x,y,r+2,0,Math.PI*2);g.stroke();
  }
  if(enemy?.statuses?.burn){
    g.strokeStyle=VFX_COLORS.fire;g.lineWidth=2;g.globalAlpha=.75+.15*Math.sin(time*8+1);g.beginPath();g.arc(x,y,r+4,0,Math.PI*2);g.stroke();
  }
  if(enemy?.chilled){
    g.strokeStyle=VFX_COLORS.ice;g.lineWidth=1.5;g.globalAlpha=.55;g.setLineDash([3,3]);g.beginPath();g.arc(x,y,r+6,0,Math.PI*2);g.stroke();g.setLineDash([]);
  }
  if(enemy?.markedUntil>time){
    g.strokeStyle=VFX_COLORS.mark;g.lineWidth=2;g.globalAlpha=.85;g.beginPath();g.arc(x,y,r+8,0,Math.PI*2);g.stroke();
  }
  g.restore();
}

function drawLightningArc(g,x1,y1,x2,y2,time=0,segments=6,alpha=1){
  g.save();g.strokeStyle=VFX_COLORS.lightning;g.lineWidth=2;g.globalAlpha=alpha;g.beginPath();g.moveTo(x1,y1);
  for(let i=1;i<segments;i++){
    const t=i/segments;
    const px=x1+(x2-x1)*t;
    const py=y1+(y2-y1)*t;
    const jitter=Math.sin(time*19+i*2.7)*5;
    g.lineTo(px+jitter,py-jitter*.35);
  }
  g.lineTo(x2,y2);g.stroke();g.restore();
}

function drawAreaPulse(g,x,y,maxRadius,time,color=VFX_COLORS.neutral,phase=0){
  const p=((time*.65+phase)%1);
  g.save();g.globalAlpha=(1-p)*.55;g.strokeStyle=color;g.lineWidth=2;g.beginPath();g.arc(x,y,8+p*maxRadius,0,Math.PI*2);g.stroke();g.globalAlpha=(1-p)*.08;g.fillStyle=color;g.beginPath();g.arc(x,y,8+p*maxRadius,0,Math.PI*2);g.fill();g.restore();
}

function drawPreviewActor(g,x,y,r=10){
  g.fillStyle="#d7e2ff";g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill();
  g.fillStyle="#7284ad";g.beginPath();g.arc(x,y,r*.48,0,Math.PI*2);g.fill();
}

function drawPreviewEnemy(g,x,y,r=9){
  g.fillStyle="#cf6f6f";g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.fill();
  g.fillStyle="#17191f";g.beginPath();g.arc(x-r*.28,y-1,1.7,0,Math.PI*2);g.arc(x+r*.28,y-1,1.7,0,Math.PI*2);g.fill();
}

function getPreviewTags(kind,key,data){
  if(kind==="skill")return data?.tags||[];
  if(kind==="evolution")return skills[data?.base]?.tags||[];
  if(kind==="synergy"){
    const tags=[];
    for(const skillKey of data?.requires?.skills||[])for(const tag of skills[skillKey]?.tags||[])if(!tags.includes(tag))tags.push(tag);
    return tags;
  }
  return[];
}

function getPreviewType(kind,key,data){
  const base=kind==="evolution"?data?.base:key;
  const tags=getPreviewTags(kind,key,data);
  const special={
    orbit:"orbit",blackHole:"gravity",barrier:"shield",bloodShield:"shield",shieldPulse:"shield",
    frost:"frost",frostbite:"frost",shatter:"frost",lightning:"lightning",stormTotem:"lightning",conductiveVenom:"lightning",
    fire:"fire",burn:"fire",combustion:"fire",fireWisp:"fire",poison:"poison",deathMark:"mark",bountyMark:"mark",markSpread:"mark",
    nova:"area",retaliate:"area",levelBurst:"area",chaosOrb:"chaos",luckyStar:"chaos",
    timeEcho:"time",overclock:"time",echoShot:"time",magnet:"xp",wisdom:"xp",xpStorm:"xp",xpHeal:"xp",
    blood:"blood",vampiricTouch:"blood",sacrifice:"blood",soulHarvest:"soul",secondWind:"revive",
    speed:"movement",phantomStep:"movement",lastStand:"movement"
  };
  if(kind==="synergy"){
    const map={
      thermalShock:"fireIce",bloodConductor:"bloodLightning",arcCollector:"xpLightning",explosiveBlades:"orbitExplosion",
      toxicFlame:"toxicFlame",stormVolley:"volleyLightning",soulFurnace:"soulBlood",timeLoop:"time",
      frozenExecution:"frost",crimsonFortress:"bloodShield",plagueLightning:"poisonLightning",combustionChain:"fireExplosion",
      echoBarrage:"echoVolley",glassBlood:"blood",gravityNova:"gravityArea",markedBounty:"markXp",elementalChaos:"chaos",
      soulAegis:"soulShield",criticalStorm:"critLightning",lastBreath:"revive"
    };
    return map[key]||"composite";
  }
  if(special[base])return special[base];
  if(tags.includes("SUMMON"))return"summon";
  if(tags.includes("SHIELD")||tags.includes("DEFENSE"))return"shield";
  if(tags.includes("FIRE"))return"fire";
  if(tags.includes("ICE"))return"frost";
  if(tags.includes("LIGHTNING"))return"lightning";
  if(tags.includes("POISON"))return"poison";
  if(tags.includes("XP"))return"xp";
  if(tags.includes("MARK"))return"mark";
  if(tags.includes("TIME"))return"time";
  if(tags.includes("BLOOD"))return"blood";
  if(tags.includes("PROJECTILE")||tags.includes("ATTACK"))return"projectile";
  if(tags.includes("CONTROL")||tags.includes("AREA"))return"area";
  return"pulse";
}

function drawCodexPreview(g,kind,key,data,time,width,height){
  g.clearRect(0,0,width,height);
  const cx=width*.34,cy=height*.53;
  const ex=width*.72,ey=height*.53;
  const type=getPreviewType(kind,key,data);
  const tags=getPreviewTags(kind,key,data);
  const evolved=kind==="evolution";

  g.save();
  const grad=g.createRadialGradient(width*.5,height*.45,2,width*.5,height*.45,Math.max(width,height)*.62);
  grad.addColorStop(0,"rgba(68,78,108,.20)");grad.addColorStop(1,"rgba(12,14,20,0)");
  g.fillStyle=grad;g.fillRect(0,0,width,height);

  const enemyTypes=new Set(["projectile","fire","frost","lightning","poison","mark","chaos","area","fireIce","bloodLightning","xpLightning","orbitExplosion","toxicFlame","volleyLightning","poisonLightning","fireExplosion","echoVolley","gravityArea","critLightning","composite"]);
  drawPreviewActor(g,cx,cy,Math.max(7,height*.09));
  if(enemyTypes.has(type))drawPreviewEnemy(g,ex,ey,Math.max(6,height*.075));

  if(type==="projectile"){
    const p=(time*.55)%1;drawProjectileVisual(g,cx+(ex-cx)*p,cy,4,tags,time);
  }else if(type==="fire"){
    const p=(time*.48)%1;drawProjectileVisual(g,cx+(ex-cx)*p,cy-4*Math.sin(p*Math.PI),5,[...tags,"FIRE"],time);
    if(p>.78)drawAreaPulse(g,ex,ey,22,time,VFX_COLORS.fire,.25);
  }else if(type==="lightning"){
    drawLightningArc(g,cx,cy,ex,ey,time,7,.9);drawGlowDot(g,ex,ey,4,VFX_COLORS.lightning,.8);
  }else if(type==="frost"){
    drawAreaPulse(g,cx,cy,30,time,VFX_COLORS.ice,0);g.strokeStyle=VFX_COLORS.ice;g.globalAlpha=.7;g.beginPath();g.arc(ex,ey,11+Math.sin(time*4)*2,0,Math.PI*2);g.stroke();
  }else if(type==="poison"){
    for(let i=0;i<5;i++){const a=time*.7+i*1.27;drawGlowDot(g,ex+Math.cos(a)*13,ey+Math.sin(a*1.2)*9,2.5,VFX_COLORS.poison,.65);}
  }else if(type==="orbit"){
    const count=evolved?5:3;const radius=evolved?27:22;for(let i=0;i<count;i++){const a=time*1.7+i*Math.PI*2/count;drawOrbitBladeVisual(g,cx+Math.cos(a)*radius,cy+Math.sin(a)*radius,a+Math.PI/2,evolved,time);}
  }else if(type==="shield"){
    drawShieldVisual(g,cx,cy,20,time,evolved?1.7:1);
  }else if(type==="mark"){
    g.strokeStyle=VFX_COLORS.mark;g.lineWidth=2;g.globalAlpha=.65+.3*Math.sin(time*4);g.beginPath();g.arc(ex,ey,15,0,Math.PI*2);g.stroke();g.beginPath();g.moveTo(ex-6,ey);g.lineTo(ex+6,ey);g.moveTo(ex,ey-6);g.lineTo(ex,ey+6);g.stroke();
  }else if(type==="area"){
    drawAreaPulse(g,cx,cy,36,time,vfxColorForTags(tags),0);drawAreaPulse(g,cx,cy,36,time,vfxColorForTags(tags),.5);
  }else if(type==="gravity"){
    for(let i=0;i<4;i++){const a=-time*1.4+i*Math.PI/2;const r=11+i*4;g.strokeStyle=i%2?"#7560be":"#a58bff";g.globalAlpha=.6;g.beginPath();g.arc(cx,cy,r,a,a+Math.PI*1.2);g.stroke();}drawGlowDot(g,cx,cy,5,VFX_COLORS.void,.9);
  }else if(type==="chaos"){
    const cols=[VFX_COLORS.fire,VFX_COLORS.ice,VFX_COLORS.lightning,VFX_COLORS.poison,VFX_COLORS.soul];
    for(let i=0;i<5;i++){const a=time*1.1+i*Math.PI*2/5;drawGlowDot(g,cx+Math.cos(a)*22,cy+Math.sin(a)*16,3,cols[i],.8);}
  }else if(type==="time"){
    g.strokeStyle="#aab9e8";g.lineWidth=2;g.globalAlpha=.8;g.beginPath();g.arc(cx,cy,20,0,Math.PI*2);g.stroke();
    const a=-time*2.2;g.beginPath();g.moveTo(cx,cy);g.lineTo(cx+Math.cos(a)*14,cy+Math.sin(a)*14);g.stroke();
    g.globalAlpha=.25;g.beginPath();g.arc(cx,cy,28+Math.sin(time*3)*4,0,Math.PI*2);g.stroke();
  }else if(type==="xp"){
    for(let i=0;i<4;i++){const p=(time*.45+i*.19)%1;const sx=width*.78+i*3,sy=height*(.28+i*.13);const x=sx+(cx-sx)*p,y=sy+(cy-sy)*p;g.save();g.translate(x,y);g.rotate(time*2+i);g.fillStyle=VFX_COLORS.xp;g.beginPath();g.moveTo(0,-4);g.lineTo(3,0);g.lineTo(0,4);g.lineTo(-3,0);g.closePath();g.fill();g.restore();}
  }else if(type==="blood"){
    drawAreaPulse(g,cx,cy,26,time,VFX_COLORS.blood,0);for(let i=0;i<3;i++){const a=time+i*2.1;drawGlowDot(g,cx+Math.cos(a)*20,cy+Math.sin(a)*12,2.6,VFX_COLORS.blood,.7);}
  }else if(type==="soul"){
    for(let i=0;i<3;i++){const a=-time*.8+i*Math.PI*2/3;drawGlowDot(g,cx+Math.cos(a)*22,cy+Math.sin(a)*16,3,VFX_COLORS.soul,.75);}
  }else if(type==="summon"){
    for(let i=0;i<3;i++){const a=time+i*Math.PI*2/3;drawGlowDot(g,cx+Math.cos(a)*24,cy+Math.sin(a)*18,4,i%2?VFX_COLORS.fire:VFX_COLORS.lightning,.85);}
  }else if(type==="movement"){
    for(let i=0;i<5;i++){const p=(time*.8+i*.18)%1;g.strokeStyle="#d7e2ff";g.globalAlpha=.45*(1-p);g.beginPath();g.moveTo(cx-30-p*12,cy-16+i*8);g.lineTo(cx-8-p*8,cy-16+i*8);g.stroke();}
  }else if(type==="revive"){
    drawAreaPulse(g,cx,cy,38,time,"#f4e6a8",0);drawShieldVisual(g,cx,cy,20,time,1.4);
  }else if(type==="fireIce"){
    g.strokeStyle=VFX_COLORS.ice;g.globalAlpha=.7;g.beginPath();g.arc(ex,ey,13,0,Math.PI*2);g.stroke();const p=(time*.55)%1;drawProjectileVisual(g,cx+(ex-cx)*p,cy,4,["FIRE"],time);if(p>.72)drawAreaPulse(g,ex,ey,25,time,"#f3d4a1",.4);
  }else if(type==="bloodLightning"){
    drawAreaPulse(g,cx,cy,22,time,VFX_COLORS.blood,0);drawLightningArc(g,cx,cy,ex,ey,time,7,.9);
  }else if(type==="xpLightning"){
    drawCodexPreview(g,"skill","magnet",skills.magnet,time,width,height);drawLightningArc(g,cx,cy,ex,ey,time,6,.75);
  }else if(type==="orbitExplosion"){
    for(let i=0;i<3;i++){const a=time*1.8+i*Math.PI*2/3;const x=cx+Math.cos(a)*22,y=cy+Math.sin(a)*22;drawOrbitBladeVisual(g,x,y,a+Math.PI/2,false,time);if(i===0)drawAreaPulse(g,x,y,18,time,VFX_COLORS.fire,.2);}
  }else if(type==="toxicFlame"){
    drawAreaPulse(g,ex,ey,24,time,VFX_COLORS.fire,0);for(let i=0;i<4;i++){const a=time+i*1.5;drawGlowDot(g,ex+Math.cos(a)*13,ey+Math.sin(a)*9,2.5,VFX_COLORS.poison,.7);}
  }else if(type==="volleyLightning"||type==="echoVolley"){
    for(let i=-1;i<=1;i++){const p=(time*.55+i*.08+1)%1;drawProjectileVisual(g,cx+(ex-cx)*p,cy+i*8,3.5,["PROJECTILE"],time);}if(type==="volleyLightning")drawLightningArc(g,width*.56,cy,ex,ey,time,5,.7);
  }else if(type==="soulBlood"){
    for(let i=0;i<3;i++){const a=time+i*2.1;drawGlowDot(g,cx+Math.cos(a)*21,cy+Math.sin(a)*14,3,VFX_COLORS.soul,.7);}drawAreaPulse(g,cx,cy,28,time,VFX_COLORS.blood,.35);
  }else if(type==="bloodShield"||type==="soulShield"){
    drawShieldVisual(g,cx,cy,21,time,1.4);drawAreaPulse(g,cx,cy,27,time,type==="soulShield"?VFX_COLORS.soul:VFX_COLORS.blood,.3);
  }else if(type==="poisonLightning"){
    for(let i=0;i<3;i++){const a=time+i*2.1;drawGlowDot(g,ex+Math.cos(a)*12,ey+Math.sin(a)*8,2.5,VFX_COLORS.poison,.7);}drawLightningArc(g,cx,cy,ex,ey,time,6,.8);
  }else if(type==="fireExplosion"){
    drawAreaPulse(g,ex,ey,30,time,VFX_COLORS.fire,0);drawAreaPulse(g,ex,ey,20,time,"#ffd5a1",.5);
  }else if(type==="gravityArea"){
    for(let i=0;i<3;i++){g.strokeStyle="#8e74dc";g.globalAlpha=.55;g.beginPath();g.arc(cx,cy,10+i*6,-time+i,time+Math.PI);g.stroke();}drawAreaPulse(g,cx,cy,38,time,"#b9a5ff",.55);
  }else if(type==="markXp"){
    g.strokeStyle=VFX_COLORS.mark;g.beginPath();g.arc(ex,ey,14,0,Math.PI*2);g.stroke();const p=(time*.5)%1;drawGlowDot(g,ex+(cx-ex)*p,ey+(cy-ey)*p,3,VFX_COLORS.xp,.8);
  }else if(type==="critLightning"){
    drawLightningArc(g,cx,cy,ex,ey,time,7,.9);g.fillStyle="#fff";g.globalAlpha=.8+.2*Math.sin(time*9);g.font=`${Math.max(12,height*.16)}px sans-serif`;g.fillText("✦",ex-7,ey-12);
  }else if(type==="composite"){
    const p=(time*.5)%1;drawProjectileVisual(g,cx+(ex-cx)*p,cy,4,tags,time);drawAreaPulse(g,ex,ey,22,time,vfxColorForTags(tags),.25);
  }else{
    drawAreaPulse(g,cx,cy,28,time,vfxColorForTags(tags),0);
  }

  if(evolved){
    g.globalAlpha=.65;g.strokeStyle="#b79cff";g.lineWidth=1.4;g.beginPath();g.arc(cx,cy,31+Math.sin(time*3)*2,0,Math.PI*2);g.stroke();
  }
  g.restore();
}
