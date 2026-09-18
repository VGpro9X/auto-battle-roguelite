(()=>{
'use strict';
const root=typeof window!=='undefined'?window:globalThis;
if(typeof root.onSkillEvent!=='function'||typeof root.draw!=='function')return;

const IDS=[
  'bribery','immortalBreath','heavenlyPunishment','fateExchange',
  'heavenlyMandate','divineJudgment','spatialSwap','equalPrice',
  'heavenlyWard','divineDomain','lifeRewind','causalInversion',
  'divineGift','timeStop','celestialEdict','heavenSeal',
  'bloodDebt','parasitePact','voidReality','scapegoatFate'
];
const DIVINE=new Set(['immortalBreath','heavenlyPunishment','heavenlyMandate','divineJudgment','heavenlyWard','divineDomain','divineGift','timeStop','celestialEdict','heavenSeal']);
const LIMITS={full:36,balanced:24,low:12};
const OWNED_LIMITS={full:6,balanced:4,low:2};
const TARGET_LIMITS={full:8,balanced:5,low:3};
const runtime={bursts:[],dropped:0,draws:0,lastTriggerAt:{}};

function quality(){
  let q='auto';
  try{const p=new URLSearchParams(root.location?.search||'');q=(p.get('visualQuality')||root.DUEL_RENDERER_V3_QUALITY||'auto').toLowerCase();}catch{}
  if(q==='full'||q==='balanced'||q==='low')return q;
  const legacy=typeof root.getDuelVisualQuality==='function'?root.getDuelVisualQuality():null;
  return legacy?.id==='constrained'?'low':'balanced';
}
function reducedMotion(){
  try{return Boolean(root.matchMedia?.('(prefers-reduced-motion: reduce)').matches);}catch{return false;}
}
function hash(id){let h=2166136261;for(let i=0;i<id.length;i++){h^=id.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function signature(id){
  if(!IDS.includes(id))return null;
  const h=hash(id),tier=DIVINE.has(id)?'divine':'mystic';
  return{id,tier,points:5+h%5,rays:3+((h>>>3)%6),satellites:2+((h>>>7)%4),spin:(h&1)?1:-1,phase:((h>>>11)%628)/100,pulse:1+((h>>>17)%18)/100};
}
function tierOf(id){return DIVINE.has(id)?'divine':'mystic';}
function tone(id){return tierOf(id)==='divine'?{main:'#ffe08a',soft:'#fff4c8',deep:'#b88735'}:{main:'#c99cff',soft:'#e6d8ff',deep:'#7145a8'};}
function pointFrom(payload={}){
  const e=payload.enemy||payload.target||payload.targets?.[0]?.enemy||payload.targets?.[0];
  if(e&&Number.isFinite(e.x)&&Number.isFinite(e.y))return{x:e.x,y:e.y};
  if(payload.to&&Number.isFinite(payload.to.x)&&Number.isFinite(payload.to.y))return{x:payload.to.x,y:payload.to.y};
  return{x:Number(root.player?.x)||0,y:Number(root.player?.y)||0};
}
function push(id,payload={},life=.82){
  if(!IDS.includes(id))return;
  const now=Number(root.state?.t)||0,last=runtime.lastTriggerAt[id]??-Infinity;
  if(now-last<.06)return;
  runtime.lastTriggerAt[id]=now;
  const q=quality(),limit=LIMITS[q],p=pointFrom(payload);
  if(runtime.bursts.length>=limit){runtime.bursts.shift();runtime.dropped++;}
  runtime.bursts.push({id,start:now,life,x:p.x,y:p.y,targets:Array.isArray(payload.targets)?payload.targets.slice(0,TARGET_LIMITS[q]):null,signature:signature(id)});
}

function polygon(g,cx,cy,r,sides,rotation){
  g.beginPath();for(let i=0;i<sides;i++){const a=rotation+i*Math.PI*2/sides,x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r;i?g.lineTo(x,y):g.moveTo(x,y);}g.closePath();
}
function drawBurst(g,fx,now){
  const age=now-fx.start;if(age<0||age>fx.life)return;
  const p=Math.max(0,Math.min(1,age/fx.life)),fade=1-p,s=fx.signature,t=tone(fx.id),rm=reducedMotion(),rot=rm?s.phase:s.phase+now*.9*s.spin;
  g.save();g.translate(fx.x,fx.y);g.globalCompositeOperation='lighter';
  g.strokeStyle=t.main;g.lineWidth=s.tier==='divine'?2.6:2.3;g.globalAlpha=.76*fade;polygon(g,0,0,18+p*32,s.points,rot);g.stroke();
  g.strokeStyle=t.soft;g.lineWidth=1.35;g.globalAlpha=.45*fade;polygon(g,0,0,11+p*20,Math.max(4,s.points-1),-rot*.7);g.stroke();
  const rayCount=quality()==='low'?Math.min(4,s.rays):s.rays;
  g.strokeStyle=t.deep;g.globalAlpha=.48*fade;for(let i=0;i<rayCount;i++){const a=rot+i*Math.PI*2/rayCount,r1=22+p*18,r2=r1+10+8*fade;g.beginPath();g.moveTo(Math.cos(a)*r1,Math.sin(a)*r1);g.lineTo(Math.cos(a)*r2,Math.sin(a)*r2);g.stroke();}
  const sats=quality()==='low'?Math.min(2,s.satellites):s.satellites;g.fillStyle=t.soft;g.globalAlpha=.7*fade;for(let i=0;i<sats;i++){const a=-rot+i*Math.PI*2/sats,r=13+p*36;g.beginPath();g.arc(Math.cos(a)*r,Math.sin(a)*r,1.8+fade*1.8,0,Math.PI*2);g.fill();}
  g.restore();
  if(fx.targets?.length){g.save();g.strokeStyle=t.main;g.lineWidth=1.6;g.globalAlpha=.34*fade;for(const entry of fx.targets){const e=entry?.enemy||entry;if(!e||!Number.isFinite(e.x)||!Number.isFinite(e.y))continue;g.beginPath();g.arc(e.x,e.y,(e.r||8)+5+p*12,0,Math.PI*2);g.stroke();}g.restore();}
  runtime.draws++;
}
function drawOwnedConstellation(g,now){
  if(typeof root.getOwnedDivineSkillIds!=='function')return;
  const owned=root.getOwnedDivineSkillIds().filter(id=>IDS.includes(id)).sort();if(!owned.length)return;
  const q=quality(),shown=owned.slice(0,OWNED_LIMITS[q]),rm=reducedMotion(),cx=Number(root.player?.x)||0,cy=Number(root.player?.y)||0;
  g.save();g.globalCompositeOperation='lighter';
  for(let i=0;i<shown.length;i++){
    const id=shown[i],s=signature(id),t=tone(id),a=(rm?0:now*.24*s.spin)+i*Math.PI*2/shown.length+s.phase,r=28+i%2*7;
    g.strokeStyle=t.main;g.lineWidth=1.1;g.globalAlpha=.10+(i%2)*.03;g.beginPath();g.arc(cx,cy,r,0,Math.PI*2);g.stroke();
    g.fillStyle=t.soft;g.globalAlpha=.32;g.beginPath();g.arc(cx+Math.cos(a)*r,cy+Math.sin(a)*r,2.1,0,Math.PI*2);g.fill();
  }
  g.restore();
}

root.onSkillEvent('divine_trigger',payload=>push(payload?.id,payload));
root.onSkillEvent('divine_acquired',payload=>push(payload?.id,payload,1.15));
const baseDraw=root.draw;
root.draw=function(){
  const result=baseDraw.apply(this,arguments),g=root.ctx,now=Number(root.state?.t)||0;
  if(!g)return result;
  drawOwnedConstellation(g,now);
  for(const fx of runtime.bursts)drawBurst(g,fx,now);
  runtime.bursts=runtime.bursts.filter(fx=>now-fx.start<fx.life);
  return result;
};

root.SURVIVAL_HIGH_TIER_IDS_V020=IDS.slice();
root.getSurvivalHighTierSignatureV020=signature;
root.getSurvivalHighTierVfxStatusV020=()=>({quality:quality(),reducedMotion:reducedMotion(),limit:LIMITS[quality()],ownedLimit:OWNED_LIMITS[quality()],active:runtime.bursts.length,dropped:runtime.dropped,draws:runtime.draws,divine:IDS.filter(id=>DIVINE.has(id)).length,mystic:IDS.filter(id=>!DIVINE.has(id)).length});
})();
