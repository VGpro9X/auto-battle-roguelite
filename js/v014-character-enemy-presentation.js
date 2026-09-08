// V0.14 — Character & Enemy Presentation
// Presentation-only layer. It observes movement/combat state but does not change V0.8 movement or combat stats.

if(!state.presentationV014){
  state.presentationV014={
    playerFacingX:1,
    playerFacingY:0,
    playerMoveAmount:0,
    playerStepPhase:0,
    playerAttackUntil:0,
    playerAttackStrength:0
  };
}

function resetPresentationV014(){
  state.presentationV014.playerFacingX=1;
  state.presentationV014.playerFacingY=0;
  state.presentationV014.playerMoveAmount=0;
  state.presentationV014.playerStepPhase=0;
  state.presentationV014.playerAttackUntil=0;
  state.presentationV014.playerAttackStrength=0;
}

function normalizeFacingV014(x,y,fallbackX=1,fallbackY=0){
  const m=Math.hypot(x,y);
  if(m<.0001)return{x:fallbackX,y:fallbackY};
  return{x:x/m,y:y/m};
}

function enemyArchetypeV014(enemy){
  if(enemy._v14Seed===undefined)enemy._v14Seed=((enemy.x*13.17+enemy.y*7.31+enemy.speed*5.03)%97+97)%97;
  if(enemy.elite)return "elite";
  if(enemy._v14Archetype)return enemy._v14Archetype;
  const difficulty=typeof getDifficultyProfile==="function"?getDifficultyProfile():{speedScale:1};
  const expected=Math.max(1,48*(difficulty.speedScale||1));
  const ratio=enemy.speed/expected;
  enemy._v14Archetype=ratio>=1.055?"runner":(ratio<=.945?"anchor":"hunter");
  return enemy._v14Archetype;
}

function playerPresentationColorV014(){
  if((player.invulnerableUntil||0)>state.t)return{body:"#fff0a6",accent:"#d6b85f",core:"#fff8ce"};
  if(player.shield>0)return{body:"#dbe8ff",accent:"#78b8ef",core:"#f4f8ff"};
  return{body:"#dbe5ff",accent:"#7f91c3",core:"#f5f7ff"};
}

onSkillEvent("attack",payload=>{
  const target=payload?.target;
  if(target){
    const f=normalizeFacingV014(target.x-player.x,target.y-player.y,state.presentationV014.playerFacingX,state.presentationV014.playerFacingY);
    state.presentationV014.playerFacingX=f.x;
    state.presentationV014.playerFacingY=f.y;
  }
  state.presentationV014.playerAttackUntil=state.t+.18;
  state.presentationV014.playerAttackStrength=1;
});

const baseUpdatePresentationV014=update;
update=function(dt){
  const beforeX=player.x,beforeY=player.y;
  const result=baseUpdatePresentationV014(dt);
  const dx=player.x-beforeX,dy=player.y-beforeY;
  const moved=Math.hypot(dx,dy);
  const targetMove=state.running&&!state.paused&&!state.gameOver?clamp(moved/Math.max(.001,dt*Math.max(1,player.speed||105)),0,1):0;
  state.presentationV014.playerMoveAmount+=(targetMove-state.presentationV014.playerMoveAmount)*Math.min(1,dt*9);
  if(moved>.02){
    const f=normalizeFacingV014(dx,dy,state.presentationV014.playerFacingX,state.presentationV014.playerFacingY);
    if(state.t>=state.presentationV014.playerAttackUntil){
      state.presentationV014.playerFacingX=f.x;
      state.presentationV014.playerFacingY=f.y;
    }
    state.presentationV014.playerStepPhase+=moved*.11;
  }
  state.presentationV014.playerAttackStrength=Math.max(0,state.presentationV014.playerAttackStrength-dt*7);
  return result;
};

const baseResetSkillEnginePresentationV014=resetSkillEngine;
resetSkillEngine=function(){
  const result=baseResetSkillEnginePresentationV014();
  resetPresentationV014();
  return result;
};

function drawPlayerSilhouetteV014(){
  if(!state.running&&!state.gameOver)return;
  const p=state.presentationV014;
  const facing=normalizeFacingV014(p.playerFacingX,p.playerFacingY,1,0);
  const angle=Math.atan2(facing.y,facing.x)+Math.PI/2;
  const move=p.playerMoveAmount;
  const bob=Math.sin(p.playerStepPhase)*1.3*move;
  const attack=state.t<p.playerAttackUntil?clamp((p.playerAttackUntil-state.t)/.18,0,1):0;
  const colors=playerPresentationColorV014();

  ctx.save();
  ctx.translate(player.x,player.y+bob);
  ctx.rotate(angle);

  // Dark inner plate turns the old prototype circle into a thin intentional underglow.
  ctx.fillStyle="#151820";ctx.globalAlpha=.94;ctx.beginPath();ctx.arc(0,0,player.r*.88,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;

  // Ground shadow keeps the actor readable without adding another full status ring.
  ctx.save();ctx.rotate(-angle);ctx.globalAlpha=.26;ctx.fillStyle="#05070b";ctx.beginPath();ctx.ellipse(0,player.r*.72,player.r*.82,player.r*.34,0,0,Math.PI*2);ctx.fill();ctx.restore();

  // Cloak / body silhouette.
  ctx.fillStyle=colors.body;
  ctx.beginPath();
  ctx.moveTo(0,-player.r*.9);
  ctx.quadraticCurveTo(player.r*.72,-player.r*.28,player.r*.58,player.r*.62);
  ctx.lineTo(player.r*.22,player.r*.92);
  ctx.lineTo(0,player.r*.7);
  ctx.lineTo(-player.r*.22,player.r*.92);
  ctx.lineTo(-player.r*.58,player.r*.62);
  ctx.quadraticCurveTo(-player.r*.72,-player.r*.28,0,-player.r*.9);
  ctx.closePath();ctx.fill();

  // Directional shoulder plates.
  ctx.fillStyle=colors.accent;ctx.globalAlpha=.96;
  ctx.beginPath();ctx.moveTo(-player.r*.7,-player.r*.2);ctx.lineTo(-player.r*.2,-player.r*.48);ctx.lineTo(-player.r*.14,player.r*.22);ctx.lineTo(-player.r*.58,player.r*.35);ctx.closePath();ctx.fill();
  ctx.beginPath();ctx.moveTo(player.r*.7,-player.r*.2);ctx.lineTo(player.r*.2,-player.r*.48);ctx.lineTo(player.r*.14,player.r*.22);ctx.lineTo(player.r*.58,player.r*.35);ctx.closePath();ctx.fill();

  // Head / hood, offset forward to make facing readable.
  ctx.globalAlpha=1;ctx.fillStyle="#e9efff";
  ctx.beginPath();ctx.arc(0,-player.r*.54,player.r*.31,0,Math.PI*2);ctx.fill();
  ctx.fillStyle="#6678a5";ctx.beginPath();ctx.arc(0,-player.r*.48,player.r*.19,0,Math.PI*2);ctx.fill();
  ctx.fillStyle=colors.core;ctx.beginPath();ctx.arc(0,-player.r*.55,2.7,0,Math.PI*2);ctx.fill();

  // Weapon/attack arm. It extends briefly on every actual normal attack.
  const reach=player.r*(.62+attack*.62+p.playerAttackStrength*.12);
  ctx.strokeStyle="#f1f4ff";ctx.lineWidth=2.4;ctx.lineCap="round";ctx.globalAlpha=.92;
  ctx.beginPath();ctx.moveTo(player.r*.28,-player.r*.12);ctx.lineTo(player.r*.52,-reach);ctx.stroke();
  ctx.strokeStyle=colors.accent;ctx.lineWidth=3.4;ctx.globalAlpha=.72;
  ctx.beginPath();ctx.moveTo(player.r*.48,-reach*.7);ctx.lineTo(player.r*.52,-reach);ctx.stroke();

  // Small alternating foot cues communicate movement while preserving the exact movement path.
  if(move>.06){
    const stride=Math.sin(p.playerStepPhase)*3.2*move;
    ctx.strokeStyle="#9cabc9";ctx.lineWidth=2;ctx.globalAlpha=.7;
    ctx.beginPath();ctx.moveTo(-5,player.r*.58);ctx.lineTo(-5-stride,player.r*.88);ctx.stroke();
    ctx.beginPath();ctx.moveTo(5,player.r*.58);ctx.lineTo(5+stride,player.r*.88);ctx.stroke();
  }
  ctx.restore();
}

function enemyPaletteV014(enemy,allied){
  if(enemy.hit>0)return{body:"#ffffff",accent:"#e6ecff",core:"#ffffff",eye:"#272a32"};
  if(allied)return{body:"#78d9b6",accent:"#b1f4d8",core:"#e4fff5",eye:"#16493b"};
  if(enemy.elite)return{body:"#a85dba",accent:"#e29cf0",core:"#ffd7ff",eye:"#2a1630"};
  const type=enemyArchetypeV014(enemy);
  if(type==="runner")return{body:"#d76f75",accent:"#ffaaa6",core:"#ffd0c8",eye:"#38191c"};
  if(type==="anchor")return{body:"#bb6269",accent:"#e18b8c",core:"#ffc5bd",eye:"#32181b"};
  return{body:"#ca696f",accent:"#ed9291",core:"#ffd0c8",eye:"#35181b"};
}

function drawEnemyRunnerV014(enemy,palette,pulse){
  const r=enemy.r;
  ctx.fillStyle=palette.body;
  ctx.beginPath();ctx.moveTo(0,-r*1.02);ctx.lineTo(r*.62,-r*.18);ctx.lineTo(r*.34,r*.74);ctx.lineTo(0,r*.48);ctx.lineTo(-r*.34,r*.74);ctx.lineTo(-r*.62,-r*.18);ctx.closePath();ctx.fill();
  ctx.fillStyle=palette.accent;ctx.globalAlpha=.86;
  ctx.beginPath();ctx.moveTo(-r*.58,-r*.08);ctx.lineTo(-r*.98,r*.2+pulse*2);ctx.lineTo(-r*.36,r*.32);ctx.closePath();ctx.fill();
  ctx.beginPath();ctx.moveTo(r*.58,-r*.08);ctx.lineTo(r*.98,r*.2+pulse*2);ctx.lineTo(r*.36,r*.32);ctx.closePath();ctx.fill();
}

function drawEnemyHunterV014(enemy,palette,pulse){
  const r=enemy.r;
  ctx.fillStyle=palette.body;
  ctx.beginPath();
  ctx.moveTo(0,-r);ctx.lineTo(r*.72,-r*.38);ctx.lineTo(r*.64,r*.45);ctx.lineTo(0,r*.88);ctx.lineTo(-r*.64,r*.45);ctx.lineTo(-r*.72,-r*.38);ctx.closePath();ctx.fill();
  ctx.fillStyle=palette.accent;ctx.globalAlpha=.78;
  ctx.beginPath();ctx.moveTo(-r*.72,-r*.26);ctx.lineTo(-r*.96,-r*.04-pulse);ctx.lineTo(-r*.62,r*.08);ctx.closePath();ctx.fill();
  ctx.beginPath();ctx.moveTo(r*.72,-r*.26);ctx.lineTo(r*.96,-r*.04-pulse);ctx.lineTo(r*.62,r*.08);ctx.closePath();ctx.fill();
}

function drawEnemyAnchorV014(enemy,palette,pulse){
  const r=enemy.r;
  ctx.fillStyle=palette.body;
  ctx.beginPath();ctx.moveTo(0,-r*.9);ctx.lineTo(r*.82,-r*.42);ctx.lineTo(r*.78,r*.52);ctx.lineTo(r*.36,r*.84);ctx.lineTo(-r*.36,r*.84);ctx.lineTo(-r*.78,r*.52);ctx.lineTo(-r*.82,-r*.42);ctx.closePath();ctx.fill();
  ctx.fillStyle=palette.accent;ctx.globalAlpha=.8;
  ctx.fillRect(-r*.92,-r*.1,r*.34,r*.64+pulse*1.5);
  ctx.fillRect(r*.58,-r*.1,r*.34,r*.64+pulse*1.5);
}

function drawEnemyEliteV014(enemy,palette,pulse){
  const r=enemy.r;
  ctx.fillStyle=palette.body;
  ctx.beginPath();
  for(let i=0;i<8;i++){
    const a=-Math.PI/2+i*Math.PI/4;
    const rr=i%2===0?r:r*.78;
    const x=Math.cos(a)*rr,y=Math.sin(a)*rr;
    i?ctx.lineTo(x,y):ctx.moveTo(x,y);
  }
  ctx.closePath();ctx.fill();
  ctx.strokeStyle=palette.accent;ctx.lineWidth=2.2;ctx.globalAlpha=.92;
  ctx.beginPath();ctx.moveTo(-r*.62,-r*.55);ctx.lineTo(-r*.24,-r*1.02-pulse);ctx.lineTo(0,-r*.7);ctx.lineTo(r*.24,-r*1.02-pulse);ctx.lineTo(r*.62,-r*.55);ctx.stroke();
  ctx.globalAlpha=.42;ctx.beginPath();ctx.arc(0,0,r*.72+Math.sin(state.t*5+enemy._v14Seed)*1.2,0,Math.PI*2);ctx.stroke();
}

function drawEnemyFaceV014(enemy,palette,attackCue){
  const r=enemy.r;
  ctx.globalAlpha=1;ctx.fillStyle=palette.core;
  ctx.beginPath();ctx.arc(0,-r*.34,r*(enemy.elite?.25:.22),0,Math.PI*2);ctx.fill();
  ctx.fillStyle=palette.eye;
  const eyeSpread=r*.1,eyeY=-r*.37;
  ctx.beginPath();ctx.arc(-eyeSpread,eyeY,1.65,0,Math.PI*2);ctx.arc(eyeSpread,eyeY,1.65,0,Math.PI*2);ctx.fill();
  if(attackCue>.05){
    ctx.strokeStyle=palette.core;ctx.lineWidth=1.6;ctx.globalAlpha=.4+.5*attackCue;
    ctx.beginPath();ctx.moveTo(-r*.2,-r*.08);ctx.lineTo(0,-r*(.28+.16*attackCue));ctx.lineTo(r*.2,-r*.08);ctx.stroke();
  }
}

function drawEnemySilhouetteV014(enemy){
  if(enemy.dead)return;
  const allied=typeof isEnemyAllied==="function"&&isEnemyAllied(enemy);
  const type=enemyArchetypeV014(enemy);
  const palette=enemyPaletteV014(enemy,allied);
  const dx=player.x-enemy.x,dy=player.y-enemy.y;
  const facing=normalizeFacingV014(dx,dy,0,1);
  const angle=Math.atan2(facing.y,facing.x)+Math.PI/2;
  const distance=Math.hypot(dx,dy);
  const contactRange=player.r+enemy.r+9;
  const attackCue=!allied?clamp(1-(distance-contactRange)/18,0,1):clamp(((enemy.allyAttackTimer||0)-.55)/.17,0,1);
  const seed=enemy._v14Seed||0;
  const gait=Math.sin(state.t*(type==="runner"?10:(type==="elite"?5.5:7))+seed)*1.2;
  const bob=gait*(type==="runner"?.8:.45);
  const lunge=attackCue*(2.5+Math.sin(state.t*18+seed)*1.2);

  ctx.save();ctx.translate(enemy.x+facing.x*lunge,enemy.y+facing.y*lunge+bob);ctx.rotate(angle);
  ctx.fillStyle="#151820";ctx.globalAlpha=.93;ctx.beginPath();ctx.arc(0,0,enemy.r*.88,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
  ctx.save();ctx.rotate(-angle);ctx.globalAlpha=.22;ctx.fillStyle="#05070b";ctx.beginPath();ctx.ellipse(0,enemy.r*.72,enemy.r*.75,enemy.r*.28,0,0,Math.PI*2);ctx.fill();ctx.restore();

  const pulse=Math.max(0,gait);
  if(type==="runner")drawEnemyRunnerV014(enemy,palette,pulse);
  else if(type==="anchor")drawEnemyAnchorV014(enemy,palette,pulse);
  else if(type==="elite")drawEnemyEliteV014(enemy,palette,pulse);
  else drawEnemyHunterV014(enemy,palette,pulse);
  drawEnemyFaceV014(enemy,palette,attackCue);

  if(allied){
    ctx.strokeStyle="#b6ffe5";ctx.lineWidth=1.6;ctx.globalAlpha=.65;ctx.beginPath();ctx.arc(0,0,enemy.r*.66,0,Math.PI*2);ctx.stroke();
  }
  ctx.restore();
}

function drawPresentationV014(){
  if(!state.running&&!state.gameOver)return;
  for(const enemy of state.enemies)drawEnemySilhouetteV014(enemy);
  drawPlayerSilhouetteV014();
}

const baseDrawPresentationV014=draw;
draw=function(){
  baseDrawPresentationV014();
  drawPresentationV014();
};
