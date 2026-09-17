(()=>{
'use strict';
const root=typeof window!=='undefined'?window:globalThis;
if(typeof root.drawEnemySilhouetteV014!=='function'||typeof root.enemyArchetypeV014!=='function')return;
const fallback=root.drawEnemySilhouetteV014;
const familyByArchetype={runner:'beast',hunter:'fallen',anchor:'construct',elite:'abyssal'};
const sources={
  beast:'assets/v020/enemies/beast/beast-runner.svg',
  fallen:'assets/v020/enemies/fallen/fallen-hunter.svg',
  construct:'assets/v020/enemies/construct/construct-anchor.svg',
  abyssal:'assets/v020/enemies/abyssal/abyssal-elite.svg'
};
const images=new Map();
const failed=new Set();

function familyForEnemy(enemy){
  const archetype=root.enemyArchetypeV014(enemy);
  return familyByArchetype[archetype]||null;
}
function ensureImage(family){
  if(!family||images.has(family)||failed.has(family)||typeof Image==='undefined')return images.get(family)||null;
  const image=new Image();
  images.set(family,image);
  image.onerror=()=>{images.delete(family);failed.add(family);};
  image.src=sources[family];
  return image;
}
function isReady(image){return Boolean(image&&image.complete&&Number(image.naturalWidth||image.width)>0);}
function facingToPlayer(enemy){
  const dx=root.player.x-enemy.x,dy=root.player.y-enemy.y,m=Math.hypot(dx,dy)||1;
  return{x:dx/m,y:dy/m};
}
function drawStatusCompatibility(enemy,r,allied){
  if(allied){
    root.ctx.save();root.ctx.strokeStyle='rgba(182,255,229,.82)';root.ctx.lineWidth=2;root.ctx.beginPath();root.ctx.arc(0,0,r*1.05,0,Math.PI*2);root.ctx.stroke();root.ctx.restore();
  }
  if(typeof root.drawEnemyStatusVisual==='function')root.drawEnemyStatusVisual(root.ctx,0,0,r,enemy,root.state.t);
}
function drawV020Enemy(enemy,family,image){
  if(enemy.dead)return;
  const allied=typeof root.isEnemyAllied==='function'&&root.isEnemyAllied(enemy);
  const f=facingToPlayer(enemy),angle=Math.atan2(f.y,f.x)+Math.PI/2,r=enemy.r;
  const seed=Number(enemy._v14Seed||0),speed=family==='beast'?10:(family==='abyssal'?5.5:7),bob=Math.sin(root.state.t*speed+seed)*(family==='beast'?1.05:.55);
  const size=family==='abyssal'?r*3.05:(family==='construct'?r*2.82:r*2.72);
  root.ctx.save();
  root.ctx.translate(enemy.x,enemy.y+bob);
  root.ctx.save();root.ctx.globalAlpha=.28;root.ctx.fillStyle='#05070b';root.ctx.beginPath();root.ctx.ellipse(0,r*.76,r*.9,r*.32,0,0,Math.PI*2);root.ctx.fill();root.ctx.restore();
  root.ctx.rotate(angle);
  if(enemy.hit>0){root.ctx.globalAlpha=.95;root.ctx.filter='brightness(2.1) saturate(.45)';}
  else if(allied){root.ctx.globalAlpha=.92;root.ctx.filter='hue-rotate(115deg) saturate(.75) brightness(1.18)';}
  root.ctx.drawImage(image,-size/2,-size*.56,size,size);
  root.ctx.filter='none';root.ctx.globalAlpha=1;
  drawStatusCompatibility(enemy,r,allied);
  root.ctx.restore();
}

for(const family of Object.keys(sources))ensureImage(family);
root.enemyFamilyV020=familyForEnemy;
root.getEnemyFamilyV020Status=()=>({loaded:[...images.entries()].filter(([,img])=>isReady(img)).map(([id])=>id),failed:[...failed],mapping:{...familyByArchetype}});
root.drawEnemySilhouetteV014=function(enemy){
  const family=familyForEnemy(enemy),image=ensureImage(family);
  if(!family||!isReady(image)){fallback(enemy);return;}
  drawV020Enemy(enemy,family,image);
};
})();