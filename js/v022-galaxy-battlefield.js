// V0.22: deterministic, cached and strictly visual Galaxy battlefield for Survival/Endless.
(function(root){"use strict";
const TAU=2*Math.PI,sky={texture:null,w:0,h:0,quality:"",stars:[],draws:0,builds:0,reduced:false};
function rng(seed){let x=seed>>>0;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;};}
function makeGalaxyStarsV022(n){const random=rng(0xA57A2022),stars=[];for(let i=0;i<n;i++){const d=i%3,rare=random();stars.push({x:random(),y:random(),depth:d,r:.34+d*.15+random()*.38+(rare>.965?.8:0),phase:random()*TAU,brightness:.33+random()*.52,cross:rare>.965});}return stars;}
function quality(w){let choice="";try{choice=new URLSearchParams(root.location?.search||"").get("visualQuality")||"";}catch{}if(["full","balanced","low"].includes(choice))return choice;const mem=Number(root.navigator?.deviceMemory)||0;return w<650||(mem&&mem<=2)?"low":w<980?"balanced":"full";}
function reduced(){try{return!!root.matchMedia?.("(prefers-reduced-motion: reduce)").matches;}catch{return false;}}
function cloud(g,x,y,rx,ry,color,alpha,angle){g.save();g.translate(x,y);g.rotate(angle);g.scale(rx,ry);const rad=g.createRadialGradient(0,0,.03,0,0,1);rad.addColorStop(0,color);rad.addColorStop(.33,color);rad.addColorStop(1,"rgba(0,0,0,0)");g.fillStyle=rad;g.globalAlpha=alpha;g.beginPath();g.arc(0,0,1,0,TAU);g.fill();g.restore();}
function nebula(g,w,h){
  const bg=g.createLinearGradient(0,0,w,h);bg.addColorStop(0,"#030717");bg.addColorStop(.54,"#12112d");bg.addColorStop(1,"#03101e");g.fillStyle=bg;g.fillRect(0,0,w,h);
  const s=Math.max(w,h);
  cloud(g,w*.28,h*.38,s*.56,s*.15,"#55509e",.38,-.48);
  cloud(g,w*.47,h*.55,s*.53,s*.13,"#854ca7",.27,-.50);
  cloud(g,w*.67,h*.37,s*.42,s*.11,"#2977ad",.22,-.52);
  cloud(g,w*.78,h*.26,s*.34,s*.13,"#2da7a4",.24,-.50);
  cloud(g,w*.19,h*.72,s*.32,s*.12,"#a34b88",.15,-.49);
  cloud(g,w*.49,h*.48,s*.24,s*.09,"#d6abf0",.10,-.50);
  const random=rng(0x06A1A227),n=Math.min(370,Math.floor(w*h/1300));for(let i=0;i<n;i++){const t=random(),x=w*(.1+t*.85),y=h*(.77-t*.6)+(random()-.5)*h*.34,sz=.3+random()*.7;g.fillStyle=i%3?"rgba(159,145,218,.16)":"rgba(110,207,226,.19)";g.fillRect(x,y,sz,sz);}
  const edge=g.createRadialGradient(w*.49,h*.52,Math.min(w,h)*.22,w*.49,h*.5,Math.max(w,h)*.72);edge.addColorStop(0,"rgba(0,0,0,0)");edge.addColorStop(1,"rgba(0,2,12,.65)");g.fillStyle=edge;g.fillRect(0,0,w,h);
}
function ensure(w,h,q){const scale=q==="low"?.47:q==="balanced"?.61:.78,tw=Math.max(1,Math.min(1250,Math.round(w*scale))),th=Math.max(1,Math.min(850,Math.round(h*scale)));if(sky.quality===q&&sky.w===tw&&sky.h===th)return;sky.quality=q;sky.w=tw;sky.h=th;sky.texture=null;sky.stars=makeGalaxyStarsV022(q==="low"?65:q==="balanced"?120:195);
  if(typeof document!=="undefined"&&typeof document.createElement==="function"){try{const c=document.createElement("canvas");c.width=tw;c.height=th;const g=c.getContext("2d",{alpha:false});if(g){nebula(g,tw,th);sky.texture=c;}}catch{ /* flat-space fallback on restricted devices */ }}
  sky.builds++;
}
function guides(g,w,h,t,rm){const cx=w*.52,cy=h*.53,r=Math.min(w,h)*.31,drift=rm?0:Math.sin(t*.06)*3;g.save();g.strokeStyle="#abc4f6";g.lineWidth=1;for(let i=0;i<3;i++){const rr=r*(.56+i*.34)+drift;g.globalAlpha=.027-i*.005;g.beginPath();g.ellipse(cx,cy,rr,rr*.57,-.47,0,TAU);g.stroke();}const step=Math.max(84,Math.min(w,h)*.145);g.globalAlpha=.020;g.setLineDash([1,step*.4]);for(let x=step*.5;x<w;x+=step){g.beginPath();g.moveTo(x,0);g.lineTo(x,h);g.stroke();}for(let y=step*.5;y<h;y+=step){g.beginPath();g.moveTo(0,y);g.lineTo(w,y);g.stroke();}g.restore();}
function drawGalaxySurvivalV022(g,w,h,time){if(!g||!Number.isFinite(w)||!Number.isFinite(h)||w<=0||h<=0)return;const q=quality(w),rm=reduced();ensure(w,h,q);sky.reduced=rm;g.save();g.globalAlpha=1;g.globalCompositeOperation="source-over";if(sky.texture)g.drawImage(sky.texture,0,0,w,h);else{g.fillStyle="#050919";g.fillRect(0,0,w,h);}const t=rm?0:Number.isFinite(time)?time:0;g.fillStyle="#d4eaff";
  for(const star of sky.stars){const move=rm?0:t*(.5+star.depth*.6),x=(star.x*w+move)%w,y=(star.y*h+move*.23)%h,p=rm?1:.84+.16*Math.sin(t*(.8+star.depth*.25)+star.phase),a=star.brightness*p;
    g.globalAlpha=a;g.fillRect(x-star.r*.5,y-star.r*.5,star.r,star.r);
    if(star.cross&&q!=="low"){g.globalAlpha=a*.21;g.fillRect(x-3*star.r,y-.38,6*star.r,.76);g.fillRect(x-.38,y-3*star.r,.76,6*star.r);}
  }
  g.globalAlpha=1;guides(g,w,h,t,rm);g.restore();sky.draws++;
}
root.drawGalaxySurvivalV022=drawGalaxySurvivalV022;
root.makeGalaxyStarsV022=makeGalaxyStarsV022;
root.getGalaxyBattlefieldStatusV022=()=>({quality:sky.quality,reducedMotion:sky.reduced,stars:sky.stars.length,cached:!!sky.texture,cacheBuilds:sky.builds,draws:sky.draws,width:sky.w,height:sky.h});
})(typeof window!=="undefined"?window:globalThis);
