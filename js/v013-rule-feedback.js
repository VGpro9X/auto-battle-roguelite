// V0.13 checkpoint 3: unmistakable Thần Kỹ / Thần Bí Kỹ gameplay feedback.
if(!state.ruleDetailVfx)state.ruleDetailVfx=[];

function pushRuleDetailV013(type,data={}){
  state.ruleDetailVfx.push({type,start:state.t,life:data.life||.6,...data});
}

const baseConvertEnemyToAllyV013=convertEnemyToAlly;
convertEnemyToAlly=function(enemy,duration=5){
  const converted=baseConvertEnemyToAllyV013(enemy,duration);
  if(converted){
    enemy._v13AlliedStartedAt=state.t;
    enemy._v13AlliedDuration=Math.max(duration,(enemy.alliedUntil||state.t)-state.t);
    enemy._v13WasAllied=true;
    enemy._v13ReversionShown=false;
    pushRuleDetailV013("briberyStart",{x:enemy.x,y:enemy.y,r:enemy.r||10,life:.75});
  }
  return converted;
};

onSkillEvent("divine_trigger",payload=>{
  if(payload.id==="fateExchange"&&payload.enemy){
    pushRuleDetailV013("fateExchange",{x1:player.x,y1:player.y,x2:payload.enemy.x,y2:payload.enemy.y,life:.9});
  }else if(payload.id==="heavenlyPunishment"&&payload.targets?.length){
    pushRuleDetailV013("heavenlyBolts",{targets:payload.targets.map(e=>({x:e.x,y:e.y,r:e.r||10})),life:.48});
  }else if(payload.id==="immortalBreath"){
    state._immortalBreathCueUntilV013=Math.max(state._immortalBreathCueUntilV013||0,player.invulnerableUntil||state.t+4);
    pushRuleDetailV013("immortalBurst",{x:player.x,y:player.y,life:.9});
  }
});

function drawBribedEnemyCueV013(enemy){
  if(!isEnemyAllied(enemy))return;
  const remaining=Math.max(0,(enemy.alliedUntil||state.t)-state.t);
  const duration=Math.max(.01,enemy._v13AlliedDuration||5);
  const ratio=clamp(remaining/duration,0,1);
  const rr=enemy.r+9;
  ctx.save();
  ctx.strokeStyle="#73d6b2";ctx.lineWidth=2.6;ctx.globalAlpha=.9;
  ctx.beginPath();ctx.arc(enemy.x,enemy.y,rr,-Math.PI/2,-Math.PI/2+Math.PI*2*ratio);ctx.stroke();

  ctx.fillStyle="#8ff1cf";ctx.globalAlpha=.95;
  ctx.beginPath();ctx.moveTo(enemy.x,enemy.y-enemy.r-15);ctx.lineTo(enemy.x-5,enemy.y-enemy.r-7);ctx.lineTo(enemy.x+5,enemy.y-enemy.r-7);ctx.closePath();ctx.fill();

  if((enemy.allyAttackTimer||0)>.58){
    const[target,d]=getNearestHostileFromEnemy(enemy,260);
    if(target&&d<=230){
      ctx.strokeStyle="#9ff7d8";ctx.lineWidth=2;ctx.globalAlpha=clamp((enemy.allyAttackTimer-.58)/.14,0,1)*.75;
      ctx.beginPath();ctx.moveTo(enemy.x,enemy.y);ctx.lineTo(target.x,target.y);ctx.stroke();
      ctx.fillStyle="#9ff7d8";ctx.beginPath();ctx.arc(target.x,target.y,3.2,0,Math.PI*2);ctx.fill();
    }
  }
  ctx.restore();
}

function detectBriberyReversionsV013(){
  for(const enemy of state.enemies){
    if(!enemy._v13WasAllied||enemy._v13ReversionShown||enemy.dead)continue;
    if(isEnemyAllied(enemy))continue;
    enemy._v13ReversionShown=true;
    pushRuleDetailV013("briberyEnd",{x:enemy.x,y:enemy.y,r:enemy.r||10,life:.65});
  }
}

function drawImmortalWindowV013(){
  const until=state._immortalBreathCueUntilV013||0;
  if(until<=state.t)return;
  const total=4;
  const remain=clamp((until-state.t)/total,0,1);
  const rr=player.r+16;
  ctx.save();ctx.strokeStyle="#ffe889";ctx.lineWidth=3;ctx.globalAlpha=.92;
  ctx.beginPath();ctx.arc(player.x,player.y,rr,-Math.PI/2,-Math.PI/2+Math.PI*2*remain);ctx.stroke();
  ctx.globalAlpha=.12;ctx.fillStyle="#ffe889";ctx.beginPath();ctx.arc(player.x,player.y,rr-3,0,Math.PI*2);ctx.fill();ctx.restore();
}

function drawRuleDetailV013(){
  for(const fx of state.ruleDetailVfx){
    const age=state.t-fx.start;if(age<0||age>fx.life)continue;
    const p=clamp(age/fx.life,0,1),fade=1-p;
    ctx.save();
    if(fx.type==="briberyStart"){
      ctx.strokeStyle="#73d6b2";ctx.lineWidth=3;ctx.globalAlpha=fade*.9;
      ctx.beginPath();ctx.arc(fx.x,fx.y,(fx.r||10)+5+p*28,0,Math.PI*2);ctx.stroke();
      ctx.fillStyle="#73d6b2";ctx.globalAlpha=fade*.12;ctx.beginPath();ctx.arc(fx.x,fx.y,(fx.r||10)+p*18,0,Math.PI*2);ctx.fill();
      for(let i=0;i<4;i++){
        const a=i*Math.PI/2+age*3.5,rr=(fx.r||10)+9+p*18;
        ctx.globalAlpha=fade*.75;ctx.beginPath();ctx.arc(fx.x+Math.cos(a)*rr,fx.y+Math.sin(a)*rr,2.2,0,Math.PI*2);ctx.fill();
      }
    }else if(fx.type==="briberyEnd"){
      const radius=(fx.r||10)+6+p*24;
      ctx.strokeStyle="#cf6f6f";ctx.lineWidth=2.3;ctx.globalAlpha=fade*.85;ctx.setLineDash([5,4]);
      ctx.beginPath();ctx.arc(fx.x,fx.y,radius,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
      ctx.strokeStyle="#73d6b2";ctx.globalAlpha=fade*.45;ctx.beginPath();ctx.arc(fx.x,fx.y,Math.max(3,radius*(1-p)),0,Math.PI*2);ctx.stroke();
    }else if(fx.type==="fateExchange"){
      const mx=(fx.x1+fx.x2)/2,my=(fx.y1+fx.y2)/2;
      ctx.lineWidth=2.2;ctx.globalAlpha=fade*.82;
      const phase=age*10;
      for(let i=0;i<2;i++){
        ctx.strokeStyle=i?"#78caff":"#b58cff";
        ctx.beginPath();ctx.moveTo(fx.x1,fx.y1);
        ctx.quadraticCurveTo(mx+Math.cos(phase+i*Math.PI)*28,my+Math.sin(phase+i*Math.PI)*22,fx.x2,fx.y2);ctx.stroke();
      }
      ctx.fillStyle="#fff";ctx.globalAlpha=fade*.8;ctx.beginPath();ctx.arc(mx,my,3+p*4,0,Math.PI*2);ctx.fill();
    }else if(fx.type==="heavenlyBolts"){
      for(let i=0;i<fx.targets.length;i++){
        const t=fx.targets[i];
        drawLightningArc(ctx,t.x,Math.max(0,t.y-180),t.x,t.y,state.t*3+i*.4,7,fade*.95);
        ctx.strokeStyle="#fff58a";ctx.lineWidth=2;ctx.globalAlpha=fade*.75;ctx.beginPath();ctx.arc(t.x,t.y,(t.r||10)+p*22,0,Math.PI*2);ctx.stroke();
      }
    }else if(fx.type==="immortalBurst"){
      ctx.strokeStyle="#ffe889";ctx.lineWidth=3;ctx.globalAlpha=fade*.9;
      for(let i=0;i<2;i++){ctx.beginPath();ctx.arc(fx.x,fx.y,player.r+12+p*(28+i*18),0,Math.PI*2);ctx.stroke();}
      ctx.fillStyle="#ffe889";ctx.globalAlpha=fade*.09;ctx.beginPath();ctx.arc(fx.x,fx.y,player.r+20+p*18,0,Math.PI*2);ctx.fill();
    }
    ctx.restore();
  }
  state.ruleDetailVfx=state.ruleDetailVfx.filter(fx=>state.t-fx.start<fx.life);
}

const baseResetSkillEngineRulesV013=resetSkillEngine;
resetSkillEngine=function(){
  const result=baseResetSkillEngineRulesV013();
  state.ruleDetailVfx=[];state._immortalBreathCueUntilV013=0;
  return result;
};

const baseDrawRulesV013=draw;
draw=function(){
  baseDrawRulesV013();
  if(!state.running&&!state.gameOver)return;
  detectBriberyReversionsV013();
  for(const enemy of state.enemies)drawBribedEnemyCueV013(enemy);
  drawImmortalWindowV013();
  drawRuleDetailV013();
};
