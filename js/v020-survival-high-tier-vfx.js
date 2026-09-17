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
const ID_SET=new Set(IDS);
const QUALITY_LIMITS={full:36,balanced:24,low:12};
const DIVINE_TONE='#ffe08a',MYSTIC_TONE='#c99cff';
const runtime=root.state.v020HighTierVfx={bursts:[],triggerCounts:{},dropped:0};

function quality(){
  let requested='';
  try{requested=new URLSearchParams(root.location?.search||'').get('visualQuality')||'';}catch{}
  requested=String(requested).toLowerCase();
  return Object.prototype.hasOwnProperty.call(QUALITY_LIMITS,requested)?requested:'balanced';
}
function reducedMotion(){
  try{return Boolean(root.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches);}catch{return false;}
}
function tierFor(id){return root.DIVINE_SKILLS?.[id]?.tier==='mystic'?'mystic':'divine';}
function hash(id){let h=2166136261;for(let i=0;i<id.length;i++){h^=id.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;}
function signature(id){
  if(!ID_SET.has(id))return null;
  const h=hash(id),tier=tierFor(id);
  return Object.freeze({
    id,tier,
    sides:4+(h%5),
    rays:tier==='mystic'?3+(h%5):5+(h%6),
    satellites:2+((h>>>4)%5),
    spin:(h&1)?1:-1,
    phase:((h>>>8)%628)/100,
    pulse:1+((h>>>14)%18)/100,
    tone:tier==='mystic'?MYSTIC_TONE:DIVINE_TONE
  });
}
function point(payload){
  const e=payload?.enemy||payload?.targets?.[0]?.enemy;
  if(e&&Number.isFinite(e.x)&&Number.isFinite(e.y))return{x:e.x,y:e.y};
  return{x:root.player?.x||0,y:root.player?.y||0};
}
function push(id,payload={}){
  const sig=signature(id);if(!sig)return false;
  const limit=QUALITY_LIMITS[quality()];
  if(runtime.bursts.length>=limit){runtime.bursts.shift();runtime.dropped++;}
  const p=point(payload);
  runtime.bursts.push({id,sig,start:root.state.t,x:p.x,y:p.y,life:sig.tier==='mystic'?.82:.72});
  runtime.triggerCounts[id]=(runtime.triggerCounts[id]||0)+1;
  return true;
}
root.onSkillEvent('divine_trigger',payload=>{if(payload?.id)push(payload.id,payload);});
root.onSkillEvent('divine_acquired',payload=>{if(payload?.id)push(payload.id,payload);});

function polygon(g,x,y,r,sides,angle){
  g.beginPath();for(let i=0;i<sides;i++){const a=angle+i*Math.PI*2/sides,px=x+Math.cos(a)*r,py=y+Math.sin(a)*r;i?g.lineTo(px,py):g.moveTo(px,py);}g.closePath();
}
function drawBurst(fx){
  const age=root.state.t-fx.start;if(age<0||age>fx.life)return false;
  const p=Math.max(0,Math.min(1,age/fx.life)),fade=1-p,s=fx.sig,rm=reducedMotion();
  const detail=quality()==='low'?.72:quality()==='full'?1.08:1;
  const angle=s.phase+(rm?0:p*Math.PI*2*s.spin);
  const r=(18+p*38)*s.pulse*detail;
  root.ctx.save();
  root.ctx.translate(fx.x,fx.y);
  root.ctx.strokeStyle=s.tone;root.ctx.lineWidth=s.tier==='mystic'?2.2:2.6;root.ctx.globalAlpha=.78*fade;
  polygon(root.ctx,0,0,r,s.sides,angle);root.ctx.stroke();
  root.ctx.globalAlpha=.34*fade;polygon(root.ctx,0,0,r*.62,Math.max(3,s.sides-1),-angle*.55);root.ctx.stroke();
  const rayCount=quality()==='low'?Math.min(3,s.rays):s.rays;
  root.ctx.globalAlpha=.52*fade;
  for(let i=0;i<rayCount;i++){const a=angle+i*Math.PI*2/rayCount;root.ctx.beginPath();root.ctx.moveTo(Math.cos(a)*r*.72,Math.sin(a)*r*.72);root.ctx.lineTo(Math.cos(a)*r*1.18,Math.sin(a)*r*1.18);root.ctx.stroke();}
  const satCount=quality()==='low'?Math.min(2,s.satellites):s.satellites;
  root.ctx.fillStyle=s.tone;root.ctx.globalAlpha=.72*fade;
  for(let i=0;i<satCount;i++){const a=-angle+i*Math.PI*2/satCount,rr=r*(.78+.08*Math.sin(i+s.phase));root.ctx.beginPath();root.ctx.arc(Math.cos(a)*rr,Math.sin(a)*rr,2.2*detail,0,Math.PI*2);root.ctx.fill();}
  if(s.tier==='mystic'){
    root.ctx.setLineDash([4,5]);root.ctx.globalAlpha=.30*fade;root.ctx.beginPath();root.ctx.arc(0,0,r*1.34,0,Math.PI*2);root.ctx.stroke();root.ctx.setLineDash([]);
  }else{
    root.ctx.globalAlpha=.18*fade;root.ctx.beginPath();root.ctx.arc(0,0,r*1.28,0,Math.PI*2);root.ctx.stroke();
  }
  root.ctx.restore();
  return true;
}
function drawOwnedTierHalo(){
  if(!root.state.running||root.state.gameOver||!root.skillRuntime?.divineSkills?.size)return;
  let divine=0,mystic=0;for(const id of root.skillRuntime.divineSkills){tierFor(id)==='mystic'?mystic++:divine++;}
  const x=root.player.x,y=root.player.y,r=(root.player.r||10)+22,rm=reducedMotion(),t=rm?0:root.state.t;
  root.ctx.save();root.ctx.lineWidth=1.3;
  if(divine){root.ctx.strokeStyle=DIVINE_TONE;root.ctx.globalAlpha=Math.min(.34,.12+divine*.018);root.ctx.setLineDash([2,6]);root.ctx.lineDashOffset=-t*12;root.ctx.beginPath();root.ctx.arc(x,y,r+Math.min(12,divine),0,Math.PI*2);root.ctx.stroke();}
  if(mystic){root.ctx.strokeStyle=MYSTIC_TONE;root.ctx.globalAlpha=Math.min(.36,.13+mystic*.02);root.ctx.setLineDash([7,5]);root.ctx.lineDashOffset=t*9;root.ctx.beginPath();root.ctx.arc(x,y,r+8+Math.min(12,mystic),0,Math.PI*2);root.ctx.stroke();}
  root.ctx.setLineDash([]);root.ctx.restore();
}

const baseDraw=root.draw;
root.draw=function(){
  const result=baseDraw();
  if(root.state.running&&!root.state.gameOver){
    drawOwnedTierHalo();
    for(const fx of runtime.bursts)drawBurst(fx);
    runtime.bursts=runtime.bursts.filter(fx=>root.state.t-fx.start<fx.life);
  }
  return result;
};

root.getSurvivalHighTierSignatureV020=signature;
root.getSurvivalHighTierVfxStatusV020=()=>({
  ids:[...IDS],quality:quality(),limit:QUALITY_LIMITS[quality()],reducedMotion:reducedMotion(),
  active:runtime.bursts.length,dropped:runtime.dropped,triggerCounts:{...runtime.triggerCounts},
  divine:IDS.filter(id=>tierFor(id)==='divine'),mystic:IDS.filter(id=>tierFor(id)==='mystic')
});
})();