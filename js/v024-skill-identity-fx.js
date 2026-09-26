// V0.24 — unique, original Canvas2D glyphs tied to individual Survival skills.
// No simulation writes. Runs AFTER the existing V0.23 generic event VFX so each
// ID-specific animation is an additive readable signature rather than a replacement.
(function(root){"use strict";
if(typeof root.getV024SkillSignature!=="function"||typeof root.onSkillEvent!=="function")return;
const TWO_PI=Math.PI*2;
const MAX={low:12,balanced:24,full:38},PER_FRAME={low:5,balanced:10,full:18};
const FX={list:[],rendered:0,spawned:0,dropped:0,suppressed:0,frame:0,quality:"",reduced:false,last:Object.create(null),hits:new WeakMap(),seed:0,drawnIds:Object.create(null)};
function time(){return Number(state.t)||0;}
function quality(){
 let override="";try{override=new URLSearchParams(root.location?.search||"").get("visualQuality")||"";}catch{}
 if(["low","balanced","full"].includes(override))return override;
 const mem=Number(root.navigator?.deviceMemory)||0;return W<650||(mem&&mem<=2)?"low":W<980?"balanced":"full";
}
function reduced(){try{return!!root.matchMedia?.("(prefers-reduced-motion: reduce)").matches;}catch{return false;}}
function known(id){return!!root.V024_SKILL_SIGNATURES[id]||(typeof skills!=="undefined"&&!!skills[id]);}
function add(id,x,y,kind,opts={}){
 if(!state.running||state.gameOver||!state.mode||!known(id)||!Number.isFinite(x)||!Number.isFinite(y))return;
 const spec=root.getV024SkillSignature(id),q=quality();
 if(!spec)return;
 // While one skill can strike many mobs on one frame, reserve slots for other skills.
 const stamp=time(),group=kind+":"+id,previous=FX.last[group]??-100;
 const minimum=kind==="hit"?.08:kind==="cast"?.18:kind==="heal"?.18:.09;
 if(stamp-previous<minimum&&!opts.multi){FX.suppressed++;return;}
 FX.last[group]=stamp;
 while(FX.list.length>=MAX[q]){FX.list.shift();FX.dropped++;}
 const fx={id,spec,x,y,kind,start:stamp,life:kind==="select"?.85:kind==="cast"?.64:kind==="heal"?.58:.42,
   size:Math.min(52,Math.max(10,opts.size||18)),angle:opts.angle||0,echo:!!opts.echo,seed:FX.seed++,
   level:opts.level||1,crit:!!opts.crit};
 FX.list.push(fx);FX.spawned++;
}
function enqueueHit(payload){
 const enemy=payload?.enemy,meta=payload?.meta||{},id=meta.source,tags=meta.tags||[];
 if(!enemy||!id||!known(id)||!(payload.damage>0)||tags.includes("DOT"))return;
 let hits=FX.hits.get(enemy);
 if(!hits){hits=Object.create(null);FX.hits.set(enemy,hits);}
 const previous=hits[id]??-100,now=time();
 if(now-previous<.085&&!meta.crit){FX.suppressed++;return;}hits[id]=now;
 const dx=enemy.x-player.x,dy=enemy.y-player.y;
 add(id,enemy.x,enemy.y,"hit",{size:(enemy.r||10)+14,angle:Math.atan2(dy,dx),crit:!!meta.crit});
}
root.onSkillEvent("hit",enqueueHit);
root.onSkillEvent("periodic",e=>{
 const id=e?.skillKey;if(!id||!known(id))return;
 add(id,player.x,player.y,"cast",{size:player.r+25,level:e.level||1});
});
root.onSkillEvent("periodic_echo",e=>{
 const id=e?.skillKey;if(!id||!known(id))return;
 add(id,player.x,player.y,"cast",{size:player.r+29,echo:true,multi:true,level:e.level||1});
});
root.onSkillEvent("skill_selected",e=>{
 const id=e?.key;if(!id||!known(id))return;
 // Passive skills also get an ID-specific awakening stamp the instant acquired.
 add(id,player.x,player.y,"select",{size:player.r+36,multi:true,level:e.level||1});
});
root.onSkillEvent("heal",e=>{
 const id=e?.meta?.source;
 if(!id||id==="regen"||!known(id)||!(e.amount>0))return;
 add(id,player.x,player.y,"heal",{size:player.r+25});
});
root.onSkillEvent("attack",()=>{
 // Gameplay still determines how many shots/crit; this only advertises the active arrow build.
 const id=typeof owned!=="undefined"&&owned.multishot>0?"multishot":typeof owned!=="undefined"&&owned.echoShot>0?"echoShot":"";
 if(id)add(id,player.x,player.y,"cast",{size:player.r+14});
});
function stroke(g,x1,y1,x2,y2,c,a,w=1.7){
 g.globalAlpha=a;g.strokeStyle=c;g.lineWidth=w;g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();
}
function ring(g,r,c,a,w=1.8,a1=0,a2=TWO_PI){
 g.globalAlpha=a;g.strokeStyle=c;g.lineWidth=w;g.beginPath();g.arc(0,0,Math.max(1,r),a1,a2);g.stroke();
}
function polygon(g,n,r,offset,c,alpha,w=1.7){
 g.strokeStyle=c;g.globalAlpha=alpha;g.lineWidth=w;g.beginPath();
 for(let i=0;i<=n;i++){const a=offset+i*TWO_PI/n,x=Math.cos(a)*r,y=Math.sin(a)*r;if(i)g.lineTo(x,y);else g.moveTo(x,y);}g.stroke();
}
function diamond(g,x,y,r,c,a,fill=false){
 g.globalAlpha=a;g.strokeStyle=c;g.fillStyle=c;g.lineWidth=1.4;g.beginPath();g.moveTo(x,y-r);g.lineTo(x+r*.65,y);g.lineTo(x,y+r);g.lineTo(x-r*.65,y);g.closePath();if(fill)g.fill();else g.stroke();
}
function burst(g,n,r,off,c,alpha){
 for(let i=0;i<n;i++){const a=i*TWO_PI/n+off,ux=Math.cos(a),uy=Math.sin(a);
   stroke(g,ux*r*.55,uy*r*.55,ux*r,uy*r,c,alpha,i%3===0?2.7:1.4);
 }
}
function curved(g,r,start,length,c,a,w=2){
 ring(g,r,c,a,w,start,start+length);
}
function spark(g,x,y,s,c,alpha){stroke(g,x-s,y,x+s,y,c,alpha,1.2);stroke(g,x,y-s,x,y+s,c,alpha,1.2);}
function star(g,points,r,rot,c,a){
 g.strokeStyle=c;g.lineWidth=1.7;g.globalAlpha=a;g.beginPath();
 for(let i=0;i<=points*2;i++){const angle=rot+i*Math.PI/points,rad=i%2?r*.44:r;
   const x=Math.cos(angle)*rad,y=Math.sin(angle)*rad;if(i)g.lineTo(x,y);else g.moveTo(x,y);}g.stroke();
}
function logo(g,fx,p,q,rm){
 const {spec}=fx,{motif,color:c,accent:a,variant:v}=spec,t=rm?0:time(),f=(1-p),r=fx.size*(.56+p*.66),spin=(rm?0:p*.74)+(v*.17);
 g.save();g.translate(fx.x,fx.y);g.rotate(fx.angle*.17+spin*.17);
 // Tiny bloom only on desktop, never obscure targets on mobile.
 if(q==="full"&&!rm){g.shadowColor=c;g.shadowBlur=4;}
 g.globalCompositeOperation=motif==="singularity"?"source-over":"lighter";
 const rotateCount=rm?0:t*.45;
 switch(motif){
 case "comet":case "bloodFlame":case "pyre":{
   const hot=motif==="comet"?"#ffe0a0":motif==="pyre"?"#ffe298":"#ffadc1";
   ring(g,r*.43,c,f*.66,3);
   for(let i=0;i<3+(v%2);i++){const angle=fx.angle+i*TWO_PI/(3+v%2),start=angle+.32;
     curved(g,r*(.45+i*.17),start,1.0+p*.44,i%2?hot:c,f*.84,2.4);
     const tip=start+1.0+p*.44;stroke(g,Math.cos(tip)*r*.56,Math.sin(tip)*r*.56,Math.cos(tip)*r*1.2,Math.sin(tip)*r*1.2,hot,f*.65,1.5);
   }break;
 }
 case "wisp":case "lantern":case "pearl":case "dew":{
   const n=motif==="wisp"?3:motif==="lantern"?4:6;
   for(let i=0;i<n;i++){const ang=i*TWO_PI/n+rotateCount*(motif==="wisp"?1:.3),rr=r*(.43+(i%2)*.3);
     diamond(g,Math.cos(ang)*rr,Math.sin(ang)*rr,3+f*4,i%2?a:c,f*.68,true);}
   ring(g,r*(motif==="pearl"?.52:.44),a,f*.66,1.6);
   if(motif==="lantern"){polygon(g,4,r*.59,Math.PI/4,c,f*.75);stroke(g,0,-r*.7,0,-r*.95,a,f*.8,1.3);}
   if(motif==="dew")diamond(g,0,r*.12,r*.35,c,f*.62,true);
   break;
 }
 case "thunder":case "totem":case "toxicBolt":case "xpThunder":{
   const n=motif==="totem"?3:motif==="xpThunder"?5:motif==="thunder"?4:2;
   for(let i=0;i<n;i++){const ang=i*TWO_PI/n+v*.1,ux=Math.cos(ang),uy=Math.sin(ang),nx=-uy,ny=ux;
     const tweak=rm?0:Math.sin(t*12+i*2.7+v)*r*.09;
     g.globalAlpha=f*.83;g.lineWidth=i===0?2.8:1.6;g.strokeStyle=i%2?a:c;g.beginPath();g.moveTo(0,0);
     g.lineTo(ux*r*.28+nx*(r*.19+tweak),uy*r*.28+ny*(r*.19+tweak));
     g.lineTo(ux*r*.58-nx*r*.09,uy*r*.58-ny*r*.09);g.lineTo(ux*r*.96,uy*r*.96);g.stroke();
   }
   if(motif==="totem"){polygon(g,4,r*.39,Math.PI/4,a,f*.62);diamond(g,0,0,r*.19,c,f*.86,true);}
   if(motif==="toxicBolt"){for(let i=0;i<3;i++)ring(g,r*(.2+i*.25),i%2?a:c,f*.35,1.2,.2,1.7);}
   if(motif==="xpThunder")star(g,4,r*.46,v*.4,a,f*.8);break;
 }
 case "snowflake":case "mirror":case "shatter":{
   if(motif==="mirror"){polygon(g,4,r*.72,Math.PI/4,a,f*.73,2.2);polygon(g,4,r*.44,Math.PI/4+spin*.2,c,f*.81);ring(g,r*.91,c,f*.27,1.2);}
   else {const count=motif==="shatter"?9:6;
     for(let i=0;i<count;i++){const ang=i*TWO_PI/count+v*.1,ux=Math.cos(ang),uy=Math.sin(ang),nx=-uy,ny=ux,rr=r*(motif==="shatter"?.6+.4*p:1);
       stroke(g,0,0,ux*rr,uy*rr,i%2?a:c,f*.78,1.5);
       const end=rr*.65;stroke(g,ux*end+nx*rr*.18,uy*end+ny*rr*.18,ux*rr,uy*rr,c,f*.66,1.1);
       if(motif==="shatter")diamond(g,ux*rr,uy*rr,2.5+v*.4,a,f*.64);
     }
     if(motif==="snowflake")polygon(g,6,r*.28,Math.PI/6,c,f*.87);
   }break;
 }
 case "spores":case "ash":case "bomb":{
   const n=motif==="ash"?7:motif==="spores"?6:5;
   for(let i=0;i<n;i++){const angle=(i*TWO_PI/n)+v*.4,rr=r*(.3+p*.65)*(0.72+i%3*.13);
     const x=Math.cos(angle)*rr,y=Math.sin(angle)*rr;
     if(motif==="ash")spark(g,x,y,1.7+i%2,c,f*.48);
     else {g.globalAlpha=f*(motif==="bomb"?.56:.44);g.strokeStyle=i%2?a:c;g.lineWidth=1.4;g.beginPath();g.arc(x,y,3+(i%3)*2+p*5,0,TWO_PI);g.stroke();}
   }
   if(motif==="bomb")burst(g,6,r,spin,a,f*.58);
   break;
 }
 case "singularity":{
   g.globalCompositeOperation="source-over";
   ring(g,r*.85,a,f*.37,3,-.6,2.55);
   ring(g,r*.65,c,f*.82,2,1.45,5.35);
   ring(g,r*.49,a,f*.56,1.7,2.85,6.45);
   g.fillStyle="#060918";g.globalAlpha=f*.86;g.beginPath();g.arc(0,0,r*.36,0,TWO_PI);g.fill();
   burst(g,7,r*.96,v*.35,c,f*.35);break;
 }
 case "mandala":case "chaos":case "ascension":{
   const n=motif==="chaos"?5:motif==="ascension"?8:6;
   for(let i=0;i<n;i++){const ang=i*TWO_PI/n+spin*.42,col=motif==="chaos"?["#ff9f8b","#8fddff","#fff29b","#c7a1ff","#93ffce"][i]:i%2?a:c;
     curved(g,r*(.52+(i%2)*.23),ang,.65,col,f*.76,2);
     diamond(g,Math.cos(ang)*r*.85,Math.sin(ang)*r*.85,2.4+v*.4,col,f*.69,motif==="ascension");
   }
   star(g,motif==="chaos"?5:6,r*.46,spin,a,f*.59);break;
 }
 case "echo":case "phantom":case "focus":case "timeSpiral":{
   for(let i=0;i<3;i++){
     const off=i*.21,rr=r*(.48+i*.24),rot=fx.angle+spin+i*.45;
     curved(g,rr,rot+off,1.5,c,f*(.8-i*.15),2.4-i*.3);
     if(motif==="phantom"||motif==="echo")diamond(g,Math.cos(rot)*rr,Math.sin(rot)*rr,3.5+v*.5,a,f*(.55-i*.12));
   }
   if(motif==="focus")burst(g,4,r,Math.PI/4,c,f*.8);
   if(motif==="timeSpiral")polygon(g,6,r*.36,rotateCount,a,f*.67);
   break;
 }
 case "meteor":{
   ring(g,r*.63,c,f*.8,2.4);ring(g,r*.9,a,f*.5,1.4,.2,5);
   for(let i=0;i<5;i++){const ang=(i*TWO_PI/5)+v*.16,ux=Math.cos(ang),uy=Math.sin(ang);
     stroke(g,ux*r*.2,uy*r*.2,ux*r*(.8+p*.24),uy*r*(.8+p*.24),i%2?a:c,f*.88,i%2?1.8:2.9);}
   diamond(g,0,0,r*.35,a,f*.8,true);break;
 }
 case "rune":case "seal":case "fracture":{
   polygon(g,motif==="rune"?3:motif==="seal"?6:5,r*.78,spin,a,f*.85,2.3);
   polygon(g,motif==="rune"?3:motif==="seal"?6:5,r*.54,-spin,c,f*.53,1.2);
   if(motif==="fracture"){for(let i=0;i<3;i++){const ang=i*TWO_PI/3;stroke(g,0,0,Math.cos(ang)*r*.91,Math.sin(ang)*r*.91,c,f*.77,1.7);}}
   else diamond(g,0,0,r*.23,a,f*.66,motif==="seal");
   break;
 }
 case "bloodChain":case "soulChain":{
   const n=4+v%3;
   for(let i=0;i<n;i++){const ang=i*TWO_PI/n+spin,rr=r*.56,x=Math.cos(ang)*rr,y=Math.sin(ang)*rr;
     ring(g,rr*.42,i%2?a:c,f*.62,1.7,ang,ang+2.8);
     diamond(g,x,y,r*.18,c,f*.74);
   }
   polygon(g,n,r*.82,spin,c,f*.35);break;
 }
 case "footfall":case "windCut":case "boomerang":case "swordDance":{
   const count=motif==="swordDance"?5:3;
   for(let i=0;i<count;i++){const ang=fx.angle+i*TWO_PI/count+spin*.25;
     curved(g,r*(.49+i*.21),ang,1.09,i%2?a:c,f*.85,motif==="swordDance"?2.8:2);
     const x=Math.cos(ang+1.0)*r,y=Math.sin(ang+1.0)*r;stroke(g,x*.57,y*.57,x,y,c,f*.7,1.3);
   }
   if(motif==="footfall"){stroke(g,-r*.23,-r*.39,-r*.11,r*.2,a,f*.64,2.5);stroke(g,r*.17,-r*.19,r*.22,r*.49,c,f*.67,2.5);}
   break;
 }
 case "sevenStar":case "lucky":{
   const n=motif==="sevenStar"?7:5;star(g,n,r*.52,spin,a,f*.72);
   for(let i=0;i<n;i++){const ang=i*TWO_PI/n+spin,rr=r*(.63+.12*p);spark(g,Math.cos(ang)*rr,Math.sin(ang)*rr,2.8,i%2?a:c,f*.69);}
   break;
 }
 case "capacitor":case "clock":{
   ring(g,r*.81,c,f*.76,2);ring(g,r*.47,a,f*.56,1.3);
   for(let i=0;i<12;i++){const ang=i*TWO_PI/12;stroke(g,Math.cos(ang)*r*.66,Math.sin(ang)*r*.66,Math.cos(ang)*r*.83,Math.sin(ang)*r*.83,i%3?a:c,f*.72,1.5);}
   if(motif==="clock"){const hand=spin+rotateCount*1.4;stroke(g,0,0,Math.cos(hand)*r*.58,Math.sin(hand)*r*.58,a,f*.87,2.3);}
   else burst(g,4,r*.62,Math.PI/4,a,f*.68);break;
 }
 case "guardian":case "aegis":case "crimsonWard":case "aegisBreak":{
   if(motif==="aegisBreak"){for(let i=0;i<6;i++){const a1=i*TWO_PI/6+spin,rr=r*.76;
      stroke(g,Math.cos(a1)*rr,Math.sin(a1)*rr,Math.cos(a1+.8)*rr,Math.sin(a1+.8)*rr,c,f*.75,2.7);
   }}else polygon(g,motif==="guardian"?5:6,r*.76,Math.PI/6,c,f*.82,2.7);
   polygon(g,4,r*.43,Math.PI/4,a,f*.71,2.1);stroke(g,0,-r*.28,0,r*.28,a,f*.79,2.1);break;
 }
 case "thorn":case "shock":{
   ring(g,r*.48,c,f*.7,2);
   for(let i=0;i<8;i++){const ang=i*TWO_PI/8+spin,ux=Math.cos(ang),uy=Math.sin(ang);
     stroke(g,ux*r*.5,uy*r*.5,ux*r,uy*r,i%2?a:c,f*.7,2.2);
     if(motif==="thorn")diamond(g,ux*r*.91,uy*r*.91,r*.15,a,f*.65,true);
   }break;
 }
 case "soulEye":{
   curved(g,r*.72,-2.57,2.0,c,f*.81,2.5);curved(g,r*.72,.54,2.0,a,f*.73,2.5);
   ring(g,r*.26,a,f*.86,2.1);diamond(g,0,0,r*.19,c,f*.8,true);break;
 }
 default:{
   // Unknown/passive IDs get an individually seeded inscription, not one shared glyph.
   const hash=root.getV024SkillSeed(fx.id),sides=5+hash%5,offset=((hash>>>8)%36)*Math.PI/18;
   polygon(g,sides,r*.75,offset+spin,c,f*.7,1.9);
   polygon(g,3+(hash>>>12)%5,r*.49,-offset-spin,a,f*.6,1.3);
   burst(g,3+hash%4,r*.63,offset,c,f*.49);
   break;
 }
 }
 // The ID-stable runic notch breaks visual repetition between skills sharing a motif.
 const notch=(root.getV024SkillSeed(fx.id)%13)*TWO_PI/13,notchR=r*(.67+.15*(v%3));
 diamond(g,Math.cos(notch)*notchR,Math.sin(notch)*notchR,2.3+v*.4,a,f*.76);
 if(fx.echo)ring(g,r*.96,"#dbe7ff",f*.39,1.1);
 if(fx.crit)star(g,4,r*.35,spin,"#ffefac",f*.72);
 g.restore();
 FX.drawnIds[fx.id]=(FX.drawnIds[fx.id]||0)+1;FX.rendered++;
}
function paint(g,now){
 const q=quality(),rm=reduced(),max=PER_FRAME[q];FX.quality=q;FX.reduced=rm;
 let drawn=0;
 // First draw newest signatures so burst-heavy Endless runs remain responsive.
 for(let i=FX.list.length-1;i>=0&&drawn<max;i--){
   const fx=FX.list[i],age=now-fx.start;if(age<0||age>fx.life)continue;
   logo(g,fx,Math.min(1,age/fx.life),q,rm);drawn++;
 }
 FX.list=FX.list.filter(fx=>now-fx.start<=fx.life);
 FX.frame++;
}
function projectile(g,x,y,r,tags,time,opts){
 const id=opts?.source;if(!id||!root.V024_SKILL_SIGNATURES[id]||!state.mode||!state.running)return;
 // Original per-projectile silhouettes. Draw only when the source is a real, visible projectile.
 if(!["fire","fireWisp","chaosOrb","echoShot","afterimage","spiritPearl","returnBlade"].includes(id))return;
 const s=root.getV024SkillSignature(id),vx=opts.vx||0,vy=opts.vy||0,angle=Math.atan2(vy,vx),q=quality(),rm=reduced();
 g.save();g.translate(x,y);g.rotate(angle);g.globalCompositeOperation="lighter";g.lineCap="round";
 const n=q==="low"?2:4,phase=rm?0:time*9,radius=Math.max(3,r);
 if(id==="fire"||id==="fireWisp"){
   const count=id==="fireWisp"?3:4,col=id==="fireWisp"?"#97f7cb":"#ffbb68";
   for(let i=0;i<count;i++){const back=radius+i*5+5,offset=Math.sin(phase*.5+i*2.1)*(id==="fireWisp"?3:2);
     stroke(g,-back,offset,-back-radius*1.1-i*2,offset*1.5,i%2?col:s.color,.72-i*.11,id==="fire"?2.4:1.6);
   }
   ring(g,radius*1.12,col,.71,1.6);
 }else if(id==="chaosOrb"){
   const colors=["#ffaf83","#8ee6ff","#ffedac","#b5a0ff","#a6ffc9"];
   for(let i=0;i<5;i++){const a=i*TWO_PI/5+phase*.16,rr=radius*(1.2+i*.1);
     diamond(g,Math.cos(a)*rr,Math.sin(a)*rr,2+i%3,colors[i],.67,true);
     curved(g,rr*1.1,a,.68,colors[i],.57,1.7);
   }
 }else if(id==="spiritPearl"){
   ring(g,radius*1.35,s.color,.75,2);
   for(let i=0;i<4;i++){const a=i*TWO_PI/4+phase*.12;diamond(g,Math.cos(a)*radius*1.4,Math.sin(a)*radius*1.4,3,s.accent,.72,true);}
 }else if(id==="afterimage"||id==="echoShot"){
   for(let i=1;i<=n;i++){const back=i*(4+radius*.85),alpha=.48-i*.075;
     diamond(g,-back,i%2?2:-2,radius*(id==="afterimage"?.76:.58),i%2?s.color:s.accent,alpha);
   }
 }else if(id==="returnBlade"){
   curved(g,radius*2,-2.6,2.15,s.color,.9,2.7);
   curved(g,radius*1.25,.3,2.2,s.accent,.64,1.5);
 }
 g.restore();
}
const prevProjectile=root.drawProjectileVisual;
if(typeof prevProjectile==="function"){
 root.drawProjectileVisual=function(g,x,y,r,tags=[],t=0,opts={}){
   const result=prevProjectile.apply(this,arguments);
   projectile(g,x,y,r,tags,t,opts);return result;
 };
}
const prevDraw=root.draw;
root.draw=function(){
 const result=prevDraw.apply(this,arguments);
 if(state.mode&&(state.running||state.gameOver))paint(ctx,time());
 return result;
};
const prevReset=root.resetSkillEngine;
if(typeof prevReset==="function"){
 root.resetSkillEngine=function(){
   const result=prevReset.apply(this,arguments);
   FX.list.length=0;FX.hits=new WeakMap();FX.last=Object.create(null);return result;
 };
}
root.getV024SkillIdentityStatus=()=>{
 const q=quality();return{active:FX.list.length,limit:MAX[q],frameLimit:PER_FRAME[q],quality:FX.quality,
  reducedMotion:FX.reduced,spawned:FX.spawned,rendered:FX.rendered,dropped:FX.dropped,
  suppressed:FX.suppressed,frameDraws:FX.frame,drawnIds:{...FX.drawnIds},coverage:root.getV024SkillSignatureCoverage()};
};
})(typeof window!=="undefined"?window:globalThis);
