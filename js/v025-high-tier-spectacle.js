// V0.25: high-tier spectacle for Survival/Endless only.
// Rendering subscribes to simulation-owned events. Never changes RNG, damage, cooldowns,
// AI, enemy selection, rare acquisition, skills, or Duel.
(function(root){"use strict";
if(typeof root.onSkillEvent!=="function"||typeof root.draw!=="function")return;
const TAU=Math.PI*2;
const divine={
  bribery:["mystic","pact","#a3f1d4","#e9ffdf"],immortalBreath:["divine","phoenix","#ffdd87","#fff8cb"],
  heavenlyPunishment:["divine","skybolt","#ffe68a","#d8efff"],fateExchange:["mystic","balance","#caa5ff","#f0e3ff"],
  heavenlyMandate:["divine","sunwheel","#ffe58b","#fff6c8"],divineJudgment:["divine","judgment","#ffe4a7","#ffffff"],
  spatialSwap:["mystic","portals","#a2ceff","#e4b7ff"],equalPrice:["mystic","equity","#c7b1ff","#8bf2c9"],
  heavenlyWard:["divine","sanctuary","#ffe398","#daf1ff"],divineDomain:["divine","domain","#f5d88c","#fff3be"],
  lifeRewind:["mystic","rewind","#b7baff","#dcefff"],causalInversion:["mystic","inversion","#bfa3ff","#8df0db"],
  divineGift:["divine","blessing","#fff0b5","#c9fff0"],timeStop:["divine","timefreeze","#ffeab1","#b6dfff"],
  celestialEdict:["divine","edict","#ffe1a2","#fefefe"],heavenSeal:["divine","seal","#ffda99","#bfd8ff"],
  bloodDebt:["mystic","bloodmoon","#ff9ab0","#dda8ff"],parasitePact:["mystic","parasite","#9beac4","#c8a8ff"],
  voidReality:["mystic","eclipse","#a3a9e6","#bfa9ff"],scapegoatFate:["mystic","scapegoat","#db9dff","#ffd1c8"]
};
const evolution={
  heavenfire:["heavenfire","#ffa962","#fff1a5"],stormNetwork:["stormweb","#fff0a7","#a0dfff"],
  swordDomain:["swordring","#bcd4ff","#f5f8ff"],plagueTide:["plague","#99e9ab","#d7ffb0"],
  crimsonMoon:["bloodmoon","#ff8099","#ffc3ce"],singularity:["eclipse","#9ea4fa","#d2b0ff"],
  chaosCrown:["crown","#e2a9ff","#ffd7ad"],immortalAegis:["sanctuary","#a2d6ff","#ffeb9c"],
  phantomLegion:["phantoms","#b3c8ff","#e6ddff"],heavenNet:["heavennet","#deb9ff","#ffe7b5"],
  bloodWeb:["bloodweb","#f29abb","#d5b4ff"],starfallCataclysm:["starfall","#ffab78","#ffe0a0"]
};
const synergy={
  thermalShock:["duality","#ffb97b","#b0ebff"],bloodConductor:["bloodbolt","#ff8eaa","#fff0aa"],
  arcCollector:["arc","#99d9ff","#e3f9ff"],explosiveBlades:["swords","#d1dcff","#ffa783"],
  toxicFlame:["toxicfire","#b9f18a","#ff9b64"],stormVolley:["arrows","#b7d4ff","#fff3a9"],
  soulFurnace:["furnace","#c6a7ff","#ffb7a7"],timeLoop:["time","#a6bfff","#f0f6ff"],
  frozenExecution:["iceblade","#9edfff","#ffe9ad"],crimsonFortress:["fortress","#ff9cae","#e6ccff"],
  plagueLightning:["plaguebolt","#c4f39c","#a6d8ff"],combustionChain:["pyre","#ffb06e","#ffd0a3"],
  echoBarrage:["arrows","#c1cfff","#f6faff"],glassBlood:["glass","#e8b1ff","#fa98ac"],
  gravityNova:["void","#c4a1ff","#ffa9df"],markedBounty:["mark","#dfc1ff","#ffe4a2"],
  elementalChaos:["elements","#ffb2a5","#b6dfff"],soulAegis:["ward","#c6a4ff","#a4efda"],
  criticalStorm:["critbolt","#ffe595","#aff0ff"],lastBreath:["resurrection","#a8f1dc","#fff1bf"],
  afterimageEcho:["phantoms","#b7caff","#ebe2ff"],gravityRune:["rune","#bb9fff","#f0ddff"],
  bloodSymbiosis:["bloodweb","#f69dbb","#ffd8cd"],nourishingPearls:["pearls","#a1efd9","#e5faff"],
  thunderStride:["stride","#fff0a1","#b4d5ff"],sealedSoul:["chains","#c9abff","#f6e5ff"],
  heavenfallBurn:["starfall","#ffaf70","#ffe9ab"],guardianRetaliation:["fortress","#a9f0cb","#cde8ff"]
};
const catalogue=Object.freeze(Object.fromEntries([
 ...Object.entries(divine).map(([id,[tier,motif,color,accent]])=>[id,Object.freeze({id,tier,motif,color,accent})]),
 ...Object.entries(evolution).map(([id,[motif,color,accent]])=>[id,Object.freeze({id,tier:"evolution",motif,color,accent})]),
 ...Object.entries(synergy).map(([id,[motif,color,accent]])=>[id,Object.freeze({id,tier:"synergy",motif,color,accent})])
]));
const LIMIT={low:4,balanced:7,full:11},PER_FRAME={low:2,balanced:4,full:7},OWNED={low:1,balanced:2,full:3};
const F={list:[],last:Object.create(null),activeId:Object.create(null),drawn:Object.create(null),emitted:0,rendered:0,dropped:0,suppressed:0,drawFrames:0,quality:"",reduced:false};
function clock(){return Number(state.t)||0;}
function quality(){let forced="";try{forced=new URLSearchParams(root.location?.search||"").get("visualQuality")||"";}catch{}
  if(["low","balanced","full"].includes(forced))return forced;
  const memory=Number(root.navigator?.deviceMemory)||0;
  return W<650||(memory&&memory<=2)?"low":W<980?"balanced":"full";
}
function reduced(){try{return!!root.matchMedia?.("(prefers-reduced-motion: reduce)").matches;}catch{return false;}}
function seed(id){let h=2166136261;for(let i=0;i<id.length;i++){h^=id.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function validPoint(p){return p&&Number.isFinite(p.x)&&Number.isFinite(p.y);}
function point(payload){
 if(validPoint(payload?.to))return{x:payload.to.x,y:payload.to.y};
 const e=payload?.enemy||payload?.target||payload?.targets?.[0]?.enemy||payload?.targets?.[0];
 return validPoint(e)?{x:e.x,y:e.y}:{x:player.x,y:player.y};
}
function valid(id,tier){
 const c=catalogue[id];if(!c||c.tier!==tier)return false;
 if(tier==="divine"||tier==="mystic")return typeof DIVINE_SKILLS!=="undefined"&&DIVINE_SKILLS[id]?.tier===tier;
 if(tier==="evolution")return typeof EVOLUTIONS!=="undefined"&&!!EVOLUTIONS[id];
 return typeof SYNERGIES!=="undefined"&&!!SYNERGIES[id];
}
function offer(id,kind,payload={}){
 const c=catalogue[id];if(!c||!state.running||state.gameOver||!state.mode||!valid(id,c.tier))return;
 const now=clock(),key=kind+":"+id,previous=F.last[key]??-100;
 const interval=kind==="unlock"?.28:kind==="trigger"?.16:.11;
 if(now-previous<interval){F.suppressed++;return;}F.last[key]=now;
 const q=quality(),pos=kind==="unlock"?{x:player.x,y:player.y}:point(payload);
 const life=kind==="unlock"?1.22:kind==="trigger"?.82:.65;
 while(F.list.length>=LIMIT[q]){F.list.shift();F.dropped++;}
 const targets=Array.isArray(payload.targets)?payload.targets.slice(0,q==="low"?3:q==="balanced"?5:8)
   .map(e=>e?.enemy||e).filter(validPoint).map(e=>({x:e.x,y:e.y,r:e.r||10})):[];
 F.list.push({id,c,kind,x:pos.x,y:pos.y,start:now,life,targets,seed:seed(id),consumed:!!payload.consumed,from:validPoint(payload.from)?{...payload.from}:null,to:validPoint(payload.to)?{...payload.to}:null});
 F.emitted++;
}
root.onSkillEvent("divine_trigger",p=>{const id=p?.id;if(id&&catalogue[id])offer(id,"trigger",p);});
root.onSkillEvent("divine_acquired",p=>{const id=p?.id;if(id&&catalogue[id])offer(id,"unlock",p);});
root.onSkillEvent("build_unlock",p=>{if(["evolution","synergy"].includes(p?.kind)&&p.item?.id)offer(p.item.id,"unlock",p);});
// Cosmetic impact comes only from the actual hit result and its source.
root.onSkillEvent("hit",p=>{
 const id=p?.meta?.source,c=catalogue[id];
 if(!c||!(p.damage>0)||!validPoint(p.enemy)||p.meta?.tags?.includes("DOT"))return;
 if(c.tier==="evolution"&&typeof hasEvolution==="function"&&!hasEvolution(id))return;
 if(c.tier==="synergy"&&typeof hasSynergy==="function"&&!hasSynergy(id))return;
 offer(id,"hit",p);
});
// Existing base-skill events may represent an evolved activation, but show it only
// when the authoritative evolution is unlocked and that source actually casts.
const evolvedSources={fire:"heavenfire",lightning:"stormNetwork",blackHole:"singularity",chaosOrb:"chaosCrown",barrier:"immortalAegis",afterimage:"phantomLegion",runeMine:"heavenNet",bloodLink:"bloodWeb",meteorSeal:"starfallCataclysm"};
root.onSkillEvent("periodic",p=>{
 const id=evolvedSources[p?.skillKey];if(!id||typeof hasEvolution!=="function"||!hasEvolution(id))return;
 offer(id,"trigger",{});
});
root.onSkillEvent("periodic_echo",p=>{
 const id=evolvedSources[p?.skillKey];if(!id||typeof hasEvolution!=="function"||!hasEvolution(id))return;
 offer(id,"trigger",{});
});
// Explicitly sourced Hợp Đạo impacts (not every base-skill cast) express their own signature.
const synergyImpactSources=new Set(["thermalShock","bloodConductor","arcCollector","explosiveBlades","toxicFlame","stormVolley","plagueLightning","heavenfallBurn","lastBreath","guardianRetaliation","thunderStride","bloodSymbiosis","nourishingPearls","afterimageEcho"]);
root.onSkillEvent("hit",p=>{
 const source=p?.meta?.source;if(!synergyImpactSources.has(source)||!(p?.damage>0)||!validPoint(p.enemy))return;
 if(typeof hasSynergy==="function"&&hasSynergy(source))offer(source,"hit",p);
});
function line(g,x1,y1,x2,y2,color,alpha,w=1.5){g.globalAlpha=alpha;g.strokeStyle=color;g.lineWidth=w;g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();}
function ring(g,r,color,alpha,w=1.8,start=0,end=TAU){g.globalAlpha=alpha;g.strokeStyle=color;g.lineWidth=w;g.beginPath();g.arc(0,0,Math.max(1,r),start,end);g.stroke();}
function poly(g,n,r,rotation,color,alpha,w=1.7){g.globalAlpha=alpha;g.strokeStyle=color;g.lineWidth=w;g.beginPath();
 for(let i=0;i<=n;i++){const a=rotation+TAU*i/n,x=Math.cos(a)*r,y=Math.sin(a)*r;if(i)g.lineTo(x,y);else g.moveTo(x,y);}g.stroke();}
function diamond(g,x,y,r,color,alpha,fill=false){g.globalAlpha=alpha;g.strokeStyle=color;g.fillStyle=color;g.lineWidth=1.3;g.beginPath();g.moveTo(x,y-r);g.lineTo(x+r*.72,y);g.lineTo(x,y+r);g.lineTo(x-r*.72,y);g.closePath();if(fill)g.fill();else g.stroke();}
function rays(g,n,r,turn,c,a,size=8){for(let i=0;i<n;i++){const t=turn+i*TAU/n,cs=Math.cos(t),sn=Math.sin(t);line(g,cs*r*.71,sn*r*.71,cs*(r+size),sn*(r+size),c,a,i%2?1.5:2.4);}}
function spokes(g,n,r,turn,c,a){for(let i=0;i<n;i++){const t=turn+i*TAU/n;line(g,Math.cos(t)*r*.2,Math.sin(t)*r*.2,Math.cos(t)*r,Math.sin(t)*r,c,a,i%2?1.3:2.2);}}
function beam(g,x1,y1,x2,y2,col,alpha,offset=0){
 const dx=x2-x1,dy=y2-y1;line(g,x1,y1,x1+dx*.33-dy*.09*offset,y1+dy*.33+dx*.09*offset,col,alpha,2.1);
 line(g,x1+dx*.33-dy*.09*offset,y1+dy*.33+dx*.09*offset,x1+dx*.64+dy*.06*offset,y1+dy*.64-dx*.06*offset,col,alpha*.88,1.8);
 line(g,x1+dx*.64+dy*.06*offset,y1+dy*.64-dx*.06*offset,x2,y2,col,alpha*.9,2.3);
}
function motif(g,fx,p,q,rm){
 const {c}=fx,fade=Math.pow(1-p,.82),time=rm?0:clock(),hash=fx.seed;
 const variant=hash%7+1,spin=(rm?0:time*.52)+((hash>>>9)%360)*Math.PI/180;
 const radius=(fx.kind==="unlock"?29:18)+p*(fx.kind==="unlock"?54:44),color=c.color,accent=c.accent;
 g.save();g.translate(fx.x,fx.y);g.lineCap="round";g.lineJoin="round";g.globalCompositeOperation="lighter";
 if(q==="full"&&!rm){g.shadowColor=color;g.shadowBlur=fx.kind==="unlock"?6:3;}
 // Each tier uses a stable silhouette: divine sun triangles, mystic crescent portals,
 // evolutions layered elemental glyphs, Hợp Đạo interlocking paired runes.
 if(c.tier==="divine"){poly(g,8,radius*.66,Math.PI/8,color,fade*.72,2.2);rays(g,8,radius*.72,spin*.28,accent,fade*.62,radius*.19);}
 if(c.tier==="mystic"){ring(g,radius*.74,color,fade*.7,2.5,.15+spin*.12,5.1+spin*.12);diamond(g,0,0,radius*.29,accent,fade*.62);}
 if(c.tier==="evolution"){poly(g,7,radius*.79,spin*.22,accent,fade*.7,2.3);ring(g,radius*.39,color,fade*.67,1.8);}
 if(c.tier==="synergy"){poly(g,5,radius*.7,spin*.21,color,fade*.72,1.7);poly(g,4,radius*.55,-spin*.32,accent,fade*.56,1.4);}
 const t=c.motif;
 if(["phoenix","resurrection","blessing"].includes(t)){spokes(g,7,radius,spin*.34,accent,fade*.78);ring(g,radius*.42,color,fade*.68,2.8);diamond(g,0,-radius*.26,radius*.2,accent,fade*.8,true);}
 else if(["skybolt","stormweb","plaguebolt","bloodbolt","critbolt","arc"].includes(t)){
   const count=q==="low"?3:6;for(let i=0;i<count;i++){const a=TAU*i/count+spin*.21,x=Math.cos(a)*radius*1.4,y=Math.sin(a)*radius*1.4;
     beam(g,0,0,x,y,i%2?accent:color,fade*.84,rm?0:Math.sin(time*3+i)*.8);}
 }
 else if(["sunwheel","domain","edict","heavenfire"].includes(t)){ring(g,radius*.4,accent,fade*.83,2.5);rays(g,t==="domain"?12:8,radius*.7,spin*.15,color,fade*.69,radius*.36);poly(g,12,radius*.94,spin*.14,accent,fade*.34,1.4);}
 else if(["judgment","balance","equity","inversion"].includes(t)){
   const offset=fx.consumed?-.42:.42;
   line(g,0,-radius*.73,0,radius*.67,accent,fade*.87,2.3);line(g,-radius*.52,-radius*.21+offset*9,radius*.52,-radius*.21-offset*9,color,fade*.88,2.1);
   for(const side of [-1,1]){const x=side*radius*.45,y=-radius*.15-side*offset*9;line(g,x,y,x,y+radius*.37,accent,fade*.65,1.1);diamond(g,x,y+radius*.38,radius*.16,color,fade*.72);}
 }
 else if(["portals","rewind","timefreeze","time"].includes(t)){
   for(let i=0;i<2;i++)ring(g,radius*(.53+i*.36),i?accent:color,fade*(.73-i*.13),2.5,spin+i*.9,spin+i*.9+4.5);
   const hand=(rm?0:time)*(t==="rewind"?-1:1)+(hash%13);spokes(g,t==="timefreeze"?12:4,radius*.56,hand,accent,fade*.63);
   if(t==="portals"){diamond(g,-radius*.53,0,radius*.28,color,fade*.7);diamond(g,radius*.53,0,radius*.28,accent,fade*.7);}
 }
 else if(["seal","mark","rune","heavennet","chains","bloodweb"].includes(t)){
   const n=t==="heavennet"?8:t==="bloodweb"?6:5;poly(g,n,radius*.81,spin*.22,color,fade*.76,2.2);
   poly(g,n===8?4:3,radius*.49,-spin*.25,accent,fade*.62);spokes(g,n,radius*.8,spin*.22,accent,fade*.47);
 }
 else if(["bloodmoon","furnace","bloodweb","crimsonfortress","glass"].includes(t)){
   ring(g,radius*.72,color,fade*.75,3,.3,4.8);ring(g,radius*.55,accent,fade*.44,2.2,2.6,6.1);diamond(g,0,0,radius*.27,accent,fade*.75,true);
 }
 else if(["eclipse","void","singularity"].includes(t)){
   g.globalCompositeOperation="source-over";ring(g,radius*.82,accent,fade*.75,3,.1,5.3);ring(g,radius*.6,color,fade*.8,2.1,2.4,7.6);
   g.globalAlpha=fade*.9;g.fillStyle="#070817";g.beginPath();g.arc(0,0,radius*.42,0,TAU);g.fill();rays(g,7,radius*.77,spin*.3,accent,fade*.53,radius*.24);
 }
 else if(["scapegoat","parasite","pact"].includes(t)){poly(g,5,radius*.72,spin*.14,color,fade*.69);for(let i=0;i<4;i++){const a=TAU*i/4+spin*.2;
   diamond(g,Math.cos(a)*radius*.79,Math.sin(a)*radius*.79,radius*.15,i%2?color:accent,fade*.67);}
   ring(g,radius*.3,accent,fade*.68,1.8);
 }
 else if(["starfall","pyre","toxicfire"].includes(t)){
   for(let i=0;i<(q==="low"?4:7);i++){const a=TAU*i/(q==="low"?4:7)+spin*.13;
     const x=Math.cos(a)*radius*(.65+i%2*.3),y=Math.sin(a)*radius*(.65+i%2*.3);
     diamond(g,x,y,radius*(.11+i%3*.04),i%2?accent:color,fade*.75,true);}
   ring(g,radius*.48,accent,fade*.72,3);
 }
 else if(["swordring","swords","iceblade","arrows","stride"].includes(t)){
   const blades=t==="arrows"?5:t==="swordring"?8:4;
   for(let i=0;i<(q==="low"?Math.min(4,blades):blades);i++){const a=spin*.2+TAU*i/blades,ux=Math.cos(a),uy=Math.sin(a);
     line(g,ux*radius*.28,uy*radius*.28,ux*radius,uy*radius,i%2?accent:color,fade*.8,2.5);diamond(g,ux*radius,uy*radius,radius*.13,accent,fade*.73,true);}
 }
 else if(["plague","plaguebolt","toxicfire","elements"].includes(t)){
   const count=q==="low"?4:8;for(let i=0;i<count;i++){const a=TAU*i/count+spin*.2,x=Math.cos(a)*radius*.75,y=Math.sin(a)*radius*.75;
     ring(g,radius*(.10+(i%3)*.05),i%2?accent:color,fade*.6,1.7,a,a+4.9);diamond(g,x,y,radius*.13,color,fade*.69,true);}
 }
 else if(["crown","elementalChaos","glass"].includes(t)){poly(g,7,radius*.8,spin*.25,color,fade*.77);rays(g,7,radius*.83,spin*.25,accent,fade*.75,radius*.3);}
 else if(["sanctuary","fortress","ward","heavennet"].includes(t)){poly(g,6,radius*.83,Math.PI/6,color,fade*.71,2.9);poly(g,6,radius*.52,spin*.15,accent,fade*.74,1.9);spokes(g,6,radius*.5,spin*.15,color,fade*.56);}
 else if(["phantoms","pearls"].includes(t)){const n=q==="low"?3:6;
   for(let i=0;i<n;i++){const a=spin*.25+i*TAU/n,r=radius*(.42+(i%2)*.36);diamond(g,Math.cos(a)*r,Math.sin(a)*r,radius*.16,i%2?color:accent,fade*.71,true);}}
 else{ring(g,radius*.76,color,fade*.79,2.7);poly(g,4+variant%4,radius*.44,spin*.29,accent,fade*.65);spokes(g,3+variant%4,radius*.83,spin*.28,color,fade*.54);}
 // ID-stable marks make shared motif families recognizably different.
 const notch=((hash>>>6)%13)*TAU/13;
 diamond(g,Math.cos(notch)*radius*.88,Math.sin(notch)*radius*.88,2+variant*.55,accent,fade*.75,true);
 if(fx.kind==="unlock"){ring(g,radius*1.2,accent,fade*.42,2.8);rays(g,q==="low"?5:11,radius*1.08,spin*.12,color,fade*.65,radius*.21);}
 if(fx.kind==="hit")ring(g,radius*.88,accent,fade*.38,1.9);
 // Localized legibility without a full-screen flash; only for actual rare acquisition.
 if(fx.kind==="unlock"&&q!=="low"&&typeof g.fillText==="function"){
   const item=c.tier==="divine"||c.tier==="mystic"?DIVINE_SKILLS[fx.id]:c.tier==="evolution"?EVOLUTIONS[fx.id]:SYNERGIES[fx.id];
   const text=(c.tier==="divine"?"THẦN KỸ":c.tier==="mystic"?"THẦN BÍ KỸ":c.tier==="evolution"?"SIÊU CẤP":"HỢP ĐẠO KỸ")+" · "+(item?.name||fx.id);
   g.shadowBlur=0;g.font="bold 11px sans-serif";g.textAlign="center";g.fillStyle=accent;g.globalAlpha=fade*.85;g.fillText(text,0,-Math.min(95,radius*1.36));
 }
 g.restore();
 if(fx.targets.length&&q!=="low"){g.save();g.strokeStyle=accent;g.lineWidth=1.8;g.globalAlpha=fade*.37;for(const t of fx.targets){
   g.beginPath();g.arc(t.x,t.y,t.r+7+p*16,0,TAU);g.stroke();}g.restore();}
 if(fx.from&&fx.to&&q!=="low"){g.save();g.globalCompositeOperation="lighter";beam(g,fx.from.x,fx.from.y,fx.to.x,fx.to.y,accent,fade*.58,rm?0:Math.sin(time*2));g.restore();}
 F.drawn[fx.id]=(F.drawn[fx.id]||0)+1;F.rendered++;
}
function persistent(g,now,q,rm){
 if(typeof getOwnedDivineSkillIds!=="function")return;
 const owned=getOwnedDivineSkillIds().filter(id=>catalogue[id]&&valid(id,catalogue[id].tier)).sort();
 if(!owned.length)return;
 const shown=owned.slice(0,OWNED[q]),cx=player.x,cy=player.y;
 g.save();g.globalCompositeOperation="lighter";for(let i=0;i<shown.length;i++){
   const id=shown[i],c=catalogue[id],h=seed(id),ang=(rm?0:now*.23)*(h%2?1:-1)+TAU*i/shown.length+(h%25)*.04;
   const r=player.r+22+i*9,x=cx+Math.cos(ang)*r,y=cy+Math.sin(ang)*r;
   g.globalAlpha=.16;g.strokeStyle=c.color;g.lineWidth=1;g.beginPath();g.arc(cx,cy,r,0,TAU);g.stroke();
   diamond(g,x,y,2.6,c.accent,.32,true);
 }
 g.restore();
}
function paint(g,now){
 if(!state.mode||!state.running||state.gameOver)return;
 const q=quality(),rm=reduced(),limit=PER_FRAME[q];F.quality=q;F.reduced=rm;
 // Expired bursts are removed even on constrained devices. Never let an endless
 // run accumulate invisible oldest events when frame budget is exhausted.
 F.list=F.list.filter(fx=>now-fx.start<=fx.life&&now>=fx.start);
 while(F.list.length>LIMIT[q]){F.list.shift();F.dropped++;}
 let drawn=0;
 for(let i=F.list.length-1;i>=0&&drawn<limit;i--){const fx=F.list[i];motif(g,fx,Math.min(1,(now-fx.start)/fx.life),q,rm);drawn++;}
 persistent(g,now,q,rm);F.drawFrames++;
}
const oldDraw=root.draw;
root.draw=function(){const result=oldDraw.apply(this,arguments);paint(ctx,clock());return result;};
const oldReset=root.resetSkillEngine;
if(typeof oldReset==="function")root.resetSkillEngine=function(){
 const result=oldReset.apply(this,arguments);
 F.list.length=0;F.last=Object.create(null);F.activeId=Object.create(null);return result;
};
root.getV025HighTierSignature=id=>catalogue[id]||null;
root.getV025HighTierSpectacleStatus=()=>{
 const q=quality();return{total:Object.keys(catalogue).length,divine:10,mystic:10,evolutions:12,synergies:28,
  quality:F.quality,reducedMotion:F.reduced,active:F.list.length,limit:LIMIT[q],frameLimit:PER_FRAME[q],
  ownedLimit:OWNED[q],emitted:F.emitted,rendered:F.rendered,dropped:F.dropped,suppressed:F.suppressed,drawFrames:F.drawFrames,drawnIds:{...F.drawn}};
};
})(typeof window!=="undefined"?window:globalThis);
