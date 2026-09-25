// V0.23 — Survival Core Skill Impact FX.
// Presentation-only: read established combat events; never write simulation positions or damage.
(function(root){"use strict";
if(typeof root.onSkillEvent!=="function"||typeof root.draw!=="function")return;
const TAU=Math.PI*2;
const PALETTE={projectile:"#e6efff",melee:"#cbd8ff",fire:"#ffad59",ice:"#8ddfff",lightning:"#fff4a2",poison:"#9bdd86",control:"#a1bafb",shield:"#83cdff",heal:"#83f5b1",area:"#e8b0ff",arcane:"#c9adff",blood:"#ff849d",summon:"#94f4d5"};
const LIMITS={low:24,balanced:48,full:76},FRAME_LIMITS={low:10,balanced:21,full:33};
const runtime={effects:[],spawned:0,rendered:0,dropped:0,suppressed:0,frameDraws:0,shake:null,counter:0,lastHeal:-100,lastCast:Object.create(null),lastHit:new WeakMap(),quality:"",reduced:false};
function currentTime(){return Number(state.t)||0;}
function quality(){
  let requested="";try{requested=new URLSearchParams(root.location?.search||"").get("visualQuality")||"";}catch{}
  if(requested==="low"||requested==="balanced"||requested==="full")return requested;
  const mem=Number(root.navigator?.deviceMemory)||0;
  return W<650||(mem&&mem<=2)?"low":W<1000?"balanced":"full";
}
function reducedMotion(){try{return!!root.matchMedia?.("(prefers-reduced-motion: reduce)").matches;}catch{return false;}}
function showParticles(){return typeof settings==="undefined"||settings.particles!==false;}
function category(meta){
  const tags=Array.isArray(meta?.tags)?meta.tags:[],source=meta?.source||"";
  if(source==="normal"||source==="echoShot"||tags.includes("PROJECTILE"))return"projectile";
  if(tags.includes("MELEE")||source==="orbit"||source==="thorns")return"melee";
  if(tags.includes("LIGHTNING"))return"lightning";
  if(tags.includes("ICE"))return"ice";
  if(tags.includes("FIRE"))return"fire";
  if(tags.includes("POISON"))return"poison";
  if(tags.includes("SHIELD")||tags.includes("DEFENSE"))return"shield";
  if(tags.includes("HEAL")||tags.includes("SUSTAIN"))return"heal";
  if(tags.includes("CONTROL"))return"control";
  if(tags.includes("BLOOD"))return"blood";
  if(tags.includes("SUMMON"))return"summon";
  if(tags.includes("AREA")||tags.includes("EXPLOSION"))return"area";
  return"arcane";
}
function put(type,x,y,opts={}){
  if(!Number.isFinite(x)||!Number.isFinite(y)||!state.running||state.gameOver)return null;
  const q=quality(),max=LIMITS[q];
  if(runtime.effects.length>=max){runtime.effects.shift();runtime.dropped++;}
  const fx={type,x,y,start:currentTime(),life:opts.life||.38,color:opts.color||PALETTE[opts.family]||PALETTE.arcane,
    family:opts.family||"arcane",size:opts.size||13,angle:opts.angle||0,crit:!!opts.crit,power:opts.power||0,seed:runtime.counter++};
  runtime.effects.push(fx);runtime.spawned++;return fx;
}
function vector(x1,y1,x2,y2){return Math.atan2(y2-y1,x2-x1);}
function hit(payload){
  const e=payload?.enemy,meta=payload?.meta||{},tags=meta.tags||[];
  if(!e||!Number.isFinite(e.x)||!Number.isFinite(e.y)||!(payload.damage>0)||tags.includes("DOT"))return;
  const now=currentTime(),critical=Boolean(meta.crit)||tags.includes("CRITICAL"),previous=runtime.lastHit.get(e)??-100;
  if(now-previous<.075&&!critical){runtime.suppressed++;return;}
  runtime.lastHit.set(e,now);
  const family=category(meta),angle=vector(player.x,player.y,e.x,e.y),power=Math.max(0,Math.min(1,payload.damage/Math.max(16,(e.maxHp||30)*.32)));
  put(family==="melee"?"slash":family==="projectile"?"burst":family==="lightning"?"arc":family==="control"?"bind":family==="ice"?"shard":family==="fire"?"flare":family==="poison"?"mist":"wave",
    e.x,e.y,{family,angle,power,size:(e.r||10)+7+power*7,life:critical?.46:.27+power*.15,crit:critical,color:critical?"#ffeaa0":PALETTE[family]});
  if(critical||power>.85){
    runtime.shake={start:now,life:critical?.19:.12,amplitude:critical?Math.min(2.6,1.4+power):1.1,seed:runtime.counter};
  }
}
function attack(payload){
  const t=payload?.target;if(!t||!Number.isFinite(t.x)||!Number.isFinite(t.y))return;
  put("shot",player.x,player.y,{family:"projectile",angle:vector(player.x,player.y,t.x,t.y),size:player.r+4,life:.24});
}
function cast(payload,echo){
  const key=payload?.skillKey||"",now=currentTime();
  if(!key||(!echo&&now-(runtime.lastCast[key]??-100)<.16))return;
  if(!echo)runtime.lastCast[key]=now;
  const tags=typeof skills!=="undefined"&&skills[key]?.tags||[];
  const family=category({source:key,tags}),radius=player.r+14+(echo?4:0);
  put("cast",player.x,player.y,{family,size:radius,life:echo?.42:.55,angle:(runtime.counter%12)*TAU/12,color:echo?"#c5d3ff":PALETTE[family]});
}
function heal(payload){
  const source=payload?.meta?.source||"",now=currentTime();
  if(!(payload?.amount>0)||source==="regen"&&now-runtime.lastHeal<.9)return;
  runtime.lastHeal=now;
  put("blessing",player.x,player.y,{family:"heal",size:player.r+12,life:.64});
}
function support(family,type,life){
  put(type,player.x,player.y,{family,size:player.r+13,life});
}
function line(g,x1,y1,x2,y2,color,alpha,width){
  g.strokeStyle=color;g.globalAlpha=alpha;g.lineWidth=width;g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();
}
function ring(g,r,color,alpha,width,start=0,end=TAU){
  g.strokeStyle=color;g.globalAlpha=alpha;g.lineWidth=width;g.beginPath();g.arc(0,0,Math.max(0,r),start,end);g.stroke();
}
function sparks(g,fx,progress,fade,q){
  if(!showParticles())return;
  const count=q==="low"?3:fx.crit?11:7,size=fx.size;
  for(let i=0;i<count;i++){
    const a=fx.angle+(i/count)*TAU+fx.seed*.67,r=(size*.25+progress*(size+16))*(.83+(i%3)*.13);
    line(g,Math.cos(a)*r*.58,Math.sin(a)*r*.58,Math.cos(a)*(r+4+fx.power*7),Math.sin(a)*(r+4+fx.power*7),fx.color,fade*(fx.crit?.9:.57),i%3===0?2:1.1);
  }
}
function paint(g,fx,now,q,rm){
  const age=now-fx.start;if(age<0||age>fx.life)return;
  const p=Math.min(1,age/fx.life),fade=(1-p)*(1-p*.25),size=fx.size;
  g.save();g.translate(fx.x,fx.y);g.globalCompositeOperation="lighter";g.lineCap="round";
  if(q!=="low"&&!rm&&fx.crit){g.shadowColor=fx.color;g.shadowBlur=7;}
  if(fx.type==="shot"){
    g.rotate(fx.angle);ring(g,player.r*.8+p*9,fx.color,fade*.47,1.7,-.5,.5);
    line(g,-size*.38,0,size*.65+p*16,0,"#f5f7ff",fade*.85,3.1);
    line(g,-size*.24,-4,size*.45+p*10,-4,fx.color,fade*.55,1.4);
  }else if(fx.type==="slash"){
    g.rotate(fx.angle+.45);
    const r=size*.85+p*size*.48;
    ring(g,r,fx.color,fade*.9,fx.crit?5:3,-1.13,.94);
    ring(g,r*.77,"#ffffff",fade*.68,1.5,-1.02,.79);
    sparks(g,fx,p,fade,q);
  }else if(fx.type==="arc"){
    const arms=q==="low"?2:4;for(let i=0;i<arms;i++){
      const a=fx.angle+i*TAU/arms;
      let prevX=0,prevY=0;
      for(let n=1;n<=5;n++){
        const r=size*(.25+p*.68)*n/5+6*n/5,offset=rm?0:Math.sin(fx.seed*4+n*5+i*3+now*30)*3;
        const x=Math.cos(a)*r-Math.sin(a)*offset,y=Math.sin(a)*r+Math.cos(a)*offset;
        line(g,prevX,prevY,x,y,n%2?"#fff8d4":fx.color,fade*.89,n%2?1.5:2.4);prevX=x;prevY=y;
      }
    }
  }else if(fx.type==="shard"){
    const count=q==="low"?4:8;
    for(let i=0;i<count;i++){
      const a=i*TAU/count+fx.seed*.28,r=6+p*(size+14),x=Math.cos(a)*r,y=Math.sin(a)*r,s=4+(1-p)*6;
      g.fillStyle=i%2?"#dff7ff":fx.color;g.globalAlpha=fade*.82;g.save();g.translate(x,y);g.rotate(a);g.beginPath();g.moveTo(s,0);g.lineTo(-s*.48,-s*.43);g.lineTo(-s*.26,s*.47);g.closePath();g.fill();g.restore();
    }
    ring(g,size*.42+p*size*.85,fx.color,fade*.48,1.5);
  }else if(fx.type==="flare"){
    const count=q==="low"?4:9;
    for(let i=0;i<count;i++){
      const a=fx.angle+i*TAU/count+fx.seed*.29,r=4+p*(size+8),x=Math.cos(a)*r,y=Math.sin(a)*r;
      line(g,x,y,x-Math.cos(a)*(7+size*.55)*fade,y-Math.sin(a)*(7+size*.55)*fade,i%2?"#ffe6a2":fx.color,fade*.87,i%3?2.3:3.6);
    }
    ring(g,5+p*size*1.4,fx.color,fade*.56,3);
  }else if(fx.type==="mist"){
    const count=q==="low"?3:6;
    for(let i=0;i<count;i++){
      const a=i*TAU/count+fx.seed*.43,r=p*(size*.65+7),x=Math.cos(a)*r,y=Math.sin(a)*r;
      ring(g,3+(1-p)*(size*.54+i%2*3),fx.color,fade*.29,3,a,a+TAU*.8);
      g.globalAlpha=fade*.34;g.fillStyle=fx.color;g.beginPath();g.arc(x,y,2.2+(1-p)*3,0,TAU);g.fill();
    }
  }else if(fx.type==="bind"){
    ring(g,size*.42+p*(size+22),fx.color,fade*.7,2.4);
    const n=q==="low"?4:8;for(let i=0;i<n;i++){const a=i*TAU/n+fx.angle,r=size*(.75+p*.85);line(g,Math.cos(a)*r*.56,Math.sin(a)*r*.56,Math.cos(a)*r,Math.sin(a)*r,"#d6eeff",fade*.72,1.7);}
  }else if(fx.type==="cast"){
    const radius=size*(.60+p*.6);
    ring(g,radius,fx.color,fade*.7,2.3,-.1+p*.6,TAU*.8+p*.6);
    ring(g,radius*.58,"#e6ecff",fade*.34,1.1,.6,TAU*.66);
    const n=q==="low"?3:6,rot=rm?fx.angle:fx.angle+now*2.2;
    for(let i=0;i<n;i++){
      const a=rot+i*TAU/n,x=Math.cos(a)*radius,y=Math.sin(a)*radius;
      line(g,x*.85,y*.85,x*1.14,y*1.14,fx.color,fade*.6,1.7);
    }
  }else if(fx.type==="blessing"){
    const r=size*.52+p*(size+15);
    ring(g,r,"#8bf4c3",fade*.69,2);
    const petals=q==="low"?3:5;
    for(let i=0;i<petals;i++){const a=i*TAU/petals-.45,px=Math.cos(a)*r*.7,py=Math.sin(a)*r*.7-p*9;
      line(g,px-3,py,px+3,py,"#d7ffe6",fade*.67,1.3);
      line(g,px,py-3,px,py+3,"#d7ffe6",fade*.67,1.3);
    }
  }else{
    const r=size*.4+p*(size+19);
    ring(g,r,fx.color,fade*.76,fx.crit?3.8:2.4);
    ring(g,r*.7,fx.color,fade*.25,2);
    if(fx.type==="burst"){line(g,-r*.5,0,r*.5,0,"#ffffff",fade*.72,1.6);line(g,0,-r*.5,0,r*.5,"#ffffff",fade*.72,1.6);}
    if(fx.type==="wave"||fx.type==="burst")sparks(g,fx,p,fade,q);
  }
  if(fx.crit){ring(g,size*.5+p*(size+17),"#ffe79e",fade*.73,2.4);
    if(q!=="low")sparks(g,fx,p,fade,q);
  }
  g.restore();runtime.rendered++;
}
function drawAll(g,now,q,rm){
  const max=FRAME_LIMITS[q],list=runtime.effects;let count=0;
  for(let i=list.length-1;i>=0&&count<max;i--){const fx=list[i];if(now-fx.start>fx.life)continue;paint(g,fx,now,q,rm);count++;}
  runtime.effects=list.filter(fx=>now-fx.start<fx.life);
  runtime.frameDraws++;
}
function shake(now,q,rm){
  const s=runtime.shake;if(!s||rm)return null;
  const age=now-s.start;if(age<0||age>=s.life)return null;
  const fade=1-age/s.life,mag=s.amplitude*fade*(q==="low"?.5:1);
  return{x:Math.sin(age*84+s.seed)*mag,y:Math.cos(age*67+s.seed)*mag*.64};
}
root.onSkillEvent("attack",attack);
root.onSkillEvent("hit",hit);
root.onSkillEvent("periodic",event=>cast(event,false));
root.onSkillEvent("periodic_echo",event=>cast(event,true));
root.onSkillEvent("heal",heal);
root.onSkillEvent("shield_gain",()=>support("shield","wave",.46));
root.onSkillEvent("shield_broken",()=>support("shield","shard",.55));
root.onSkillEvent("dodge",()=>support("control","burst",.28));
root.onSkillEvent("revive",()=>support("heal","blessing",.82));
root.onSkillEvent("build_unlock",()=>support("arcane","cast",.76));
const previousDraw=root.draw;
root.draw=function(){
  if(!state.mode||(!state.running&&!state.gameOver))return previousDraw.apply(this,arguments);
  const now=currentTime(),q=quality(),rm=reducedMotion();runtime.quality=q;runtime.reduced=rm;
  const move=shake(now,q,rm),g=ctx;
  if(move)g.clearRect(0,0,W,H);
  g.save();if(move)g.translate(move.x,move.y);
  try{const result=previousDraw.apply(this,arguments);drawAll(g,now,q,rm);return result;}finally{g.restore();}
};
if(typeof root.drawProjectileVisual==="function"){
  const previousProjectile=root.drawProjectileVisual;
  root.drawProjectileVisual=function(g,x,y,r,tags=[],time=0,options={}){
    if(!state.running)return previousProjectile.apply(this,arguments);
    const speed=Math.hypot(options.vx||0,options.vy||0),q=quality(),rm=reducedMotion();
    if(speed>1&&showParticles()){
      const ux=options.vx/speed,uy=options.vy/speed,n=q==="low"?1:3,color=PALETTE[category({source:options.source,tags})]||PALETTE.projectile;
      g.save();g.globalCompositeOperation="lighter";g.strokeStyle=color;g.lineCap="round";
      for(let i=n;i>=1;i--){g.globalAlpha=(.10+(n-i)*.12)*(rm?.65:1);g.lineWidth=Math.max(1,r*(.94-i*.15));g.beginPath();g.moveTo(x-ux*(r+4+i*6),y-uy*(r+4+i*6));g.lineTo(x-ux*r*.45,y-uy*r*.45);g.stroke();}
      g.restore();
    }
    return previousProjectile.apply(this,arguments);
  };
}
if(typeof root.resetSkillEngine==="function"){
  const previousReset=root.resetSkillEngine;
  root.resetSkillEngine=function(){
    const result=previousReset.apply(this,arguments);
    runtime.effects.length=0;runtime.shake=null;runtime.lastCast=Object.create(null);
    runtime.lastHit=new WeakMap();runtime.lastHeal=-100;return result;
  };
}
root.getV023SurvivalFxStatus=()=>({quality:runtime.quality,reducedMotion:runtime.reduced,active:runtime.effects.length,
  limit:LIMITS[quality()],frameLimit:FRAME_LIMITS[quality()],spawned:runtime.spawned,rendered:runtime.rendered,
  dropped:runtime.dropped,suppressed:runtime.suppressed,frameDraws:runtime.frameDraws});
})(typeof window!=="undefined"?window:globalThis);
