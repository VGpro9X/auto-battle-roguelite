// V0.16 Batch A4 — Lôi Trường, Hồn Đăng, Phá Giáp, Thời Vực.
// Completes the V0.16 base-skill expansion from 64 to 80 skills.

(()=>{
  const runtime=state.v016A4={
    fields:[],
    soulKills:0,
    flames:[],
    timeFieldUntil:0,
    transient:[]
  };

  const fmt=value=>Number(value.toFixed(2)).toString();
  const hostileList=()=>state.enemies.filter(enemy=>typeof isEnemyHostile==="function"?isEnemyHostile(enemy):!enemy.dead);

  const staticCooldown=level=>8-.7*(level-1);
  const staticRadius=level=>72+8*(level-1);
  const staticDamage=level=>5+3*(level-1);
  const lanternNeed=level=>14-level;
  const lanternDamage=level=>24+8*(level-1);
  const armorPerStack=level=>.02+.005*(level-1);
  const armorMaxStacks=level=>3+level;
  const timeDuration=level=>3+.5*(level-1);
  const timeAcceleration=level=>.35+.10*(level-1);

  function createStaticField(level){
    runtime.fields.push({
      x:player.x,y:player.y,level,
      born:state.t,
      nextTick:state.t+.5,
      until:state.t+3,
      pulse:0
    });
    runtime.transient.push({type:"staticSpawn",x:player.x,y:player.y,start:state.t,life:.35});
    return true;
  }

  function spawnSoulFlame(level){
    if(runtime.flames.length>=3)return false;
    runtime.flames.push({
      x:player.x,y:player.y,r:6,level,
      born:state.t,until:state.t+6,
      speed:175,
      phase:Math.random()*Math.PI*2,
      dead:false
    });
    runtime.transient.push({type:"soulSpawn",x:player.x,y:player.y,start:state.t,life:.38});
    return true;
  }

  function activateTimeField(level){
    runtime.timeFieldUntil=state.t+timeDuration(level);
    runtime.transient.push({type:"timeOn",x:player.x,y:player.y,start:state.t,life:.45});
    return true;
  }

  skills.staticField={
    name:"Lôi Trường",icon:"⚡⭕",max:5,tags:["LIGHTNING","AREA","PERIODIC"],
    desc:level=>`Cứ mỗi ${fmt(staticCooldown(level))} giây, tạo một Lôi Trường đứng yên tại vị trí hiện tại trong 3 giây với bán kính ${staticRadius(level)}. Cứ mỗi 0.5 giây, kẻ địch bên trong nhận ${staticDamage(level)} sát thương Sét. Lôi Trường phát đúng 6 nhịp và các nhịp không kích hoạt hiệu ứng đòn đánh thường.`,
    apply:()=>{},
    periodic:{cooldown:staticCooldown,execute:createStaticField}
  };

  skills.soulLantern={
    name:"Hồn Đăng",icon:"🏮👻",max:5,tags:["SOUL","KILL","SUMMON","CHARGE"],
    desc:level=>`Cứ mỗi ${lanternNeed(level)} kẻ địch bị hạ, triệu hồi 1 hồn hỏa trong 6 giây. Hồn hỏa truy đuổi kẻ địch gần nhất và phát nổ khi chạm mục tiêu, gây ${lanternDamage(level)} sát thương vùng trong bán kính 48. Tối đa 3 hồn hỏa cùng lúc; tiến độ đủ mạng khi đang đầy sẽ được giữ lại cho đến khi có chỗ trống.`,
    apply:()=>{}
  };

  skills.armorBreak={
    name:"Phá Giáp",icon:"🔨",max:5,tags:["ATTACK","HIT","MARK","DAMAGE"],
    desc:level=>`Đòn đánh thường trúng mục tiêu đặt 1 tầng Phá Giáp trong 4 giây. Mỗi tầng khiến mục tiêu nhận thêm ${(armorPerStack(level)*100).toFixed(1).replace('.0','')}% sát thương từ bạn, tối đa ${armorMaxStacks(level)} tầng. Đánh thường trúng lại sẽ thêm tầng nếu chưa tối đa và làm mới thời gian 4 giây của toàn bộ tầng.`,
    apply:()=>{}
  };

  skills.timeField={
    name:"Thời Vực",icon:"⌛⭕",max:5,tags:["TIME","PERIODIC","RULE"],
    desc:level=>`Cứ mỗi 14 giây, bước vào Thời Vực trong ${fmt(timeDuration(level))} giây. Khi Thời Vực hoạt động, bộ đếm thời gian của mọi Kỹ Năng cơ bản dạng định kỳ bạn đang sở hữu trôi nhanh hơn ${Math.round(timeAcceleration(level)*100)}%. Hiệu ứng chỉ tăng tốc bộ đếm, không trực tiếp nhân đôi lần kích hoạt.`,
    apply:()=>{},
    periodic:{cooldown:()=>14,execute:activateTimeField}
  };

  onSkillEvent("skill_selected",payload=>{
    if(payload?.key==="timeField"&&skillRuntime.timers.timeField===undefined){
      skillRuntime.timers.timeField=14*player.periodicCooldownMultiplier;
    }
  });

  onSkillEvent("kill",()=>{
    const level=skillLevel("soulLantern");
    if(!level)return;
    runtime.soulKills++;
  });

  onSkillEvent("hit",payload=>{
    const level=skillLevel("armorBreak");
    const enemy=payload?.enemy;
    if(!level||!enemy||enemy.dead||payload.meta?.source!=="normal")return;
    const maxStacks=armorMaxStacks(level);
    const current=(enemy.armorBreakUntil||0)>state.t?(enemy.armorBreakStacks||0):0;
    enemy.armorBreakStacks=Math.min(maxStacks,current+1);
    enemy.armorBreakUntil=state.t+4;
    enemy.armorBreakLevel=level;
    runtime.transient.push({type:"armorCrack",enemy,x:enemy.x,y:enemy.y,start:state.t,life:.2});
  });

  const baseOutgoingA4=getOutgoingDamageMultiplier;
  getOutgoingDamageMultiplier=function(enemy,meta={}){
    let multiplier=baseOutgoingA4(enemy,meta);
    if(enemy&&(enemy.armorBreakUntil||0)>state.t&&(enemy.armorBreakStacks||0)>0){
      const level=enemy.armorBreakLevel||skillLevel("armorBreak")||1;
      multiplier*=1+enemy.armorBreakStacks*armorPerStack(level);
    }
    return multiplier;
  };

  function tickStaticField(field){
    const damage=staticDamage(field.level);
    const radius=staticRadius(field.level);
    damageAreaAt(field.x,field.y,radius,damage,{source:"staticField",tags:["LIGHTNING","AREA","PERIODIC"],allowProcs:false});
    field.pulse++;
    runtime.transient.push({type:"staticPulse",x:field.x,y:field.y,radius,start:state.t,life:.32});
  }

  function updateFields(){
    for(const field of runtime.fields){
      while(field.pulse<6&&state.t+1e-9>=field.nextTick&&field.nextTick<=field.until+1e-9){
        tickStaticField(field);
        field.nextTick+=.5;
      }
    }
    runtime.fields=runtime.fields.filter(field=>field.pulse<6&&state.t<field.until+.51);
  }

  function findNearestHostileFrom(x,y){
    let best=null,bestD=Infinity;
    for(const enemy of hostileList()){
      const d=Math.hypot(enemy.x-x,enemy.y-y);
      if(d<bestD){bestD=d;best=enemy;}
    }
    return best;
  }

  function detonateSoulFlame(flame,target){
    if(flame.dead)return;
    flame.dead=true;
    const x=target&&!target.dead?target.x:flame.x;
    const y=target&&!target.dead?target.y:flame.y;
    damageAreaAt(x,y,48,lanternDamage(flame.level),{source:"soulLantern",tags:["SOUL","KILL","SUMMON","AREA"],allowProcs:false});
    runtime.transient.push({type:"soulBurst",x,y,start:state.t,life:.45});
  }

  function updateSoulFlames(dt){
    const level=skillLevel("soulLantern");
    if(level){
      const need=lanternNeed(level);
      while(runtime.soulKills>=need&&runtime.flames.length<3){
        runtime.soulKills-=need;
        spawnSoulFlame(level);
      }
    }else runtime.soulKills=0;

    for(const flame of runtime.flames){
      if(flame.dead)continue;
      if(state.t>=flame.until){flame.dead=true;continue;}
      const target=findNearestHostileFrom(flame.x,flame.y);
      if(!target){
        const a=state.t*1.8+flame.phase;
        const tx=player.x+Math.cos(a)*34,ty=player.y+Math.sin(a)*24;
        const dx=tx-flame.x,dy=ty-flame.y,d=Math.hypot(dx,dy)||1;
        flame.x+=dx/d*flame.speed*.55*dt;flame.y+=dy/d*flame.speed*.55*dt;
        continue;
      }
      const dx=target.x-flame.x,dy=target.y-flame.y,d=Math.hypot(dx,dy)||1;
      if(d<=target.r+flame.r+3){detonateSoulFlame(flame,target);continue;}
      const step=Math.min(d,flame.speed*dt);
      flame.x+=dx/d*step;flame.y+=dy/d*step;
      if(Math.hypot(target.x-flame.x,target.y-flame.y)<=target.r+flame.r+3)detonateSoulFlame(flame,target);
    }
    runtime.flames=runtime.flames.filter(flame=>!flame.dead&&state.t<flame.until);
  }

  function updateTimeAcceleration(dt){
    const level=skillLevel("timeField");
    if(!level||state.t>=runtime.timeFieldUntil)return;
    const extra=timeAcceleration(level)*dt;
    for(const [key,skill] of Object.entries(skills)){
      if(skillLevel(key)<=0||!skill?.periodic)continue;
      if(typeof skillRuntime.timers[key]!=="number")continue;
      skillRuntime.timers[key]-=extra;
    }
  }

  function resetA4(){
    runtime.fields.length=0;
    runtime.soulKills=0;
    runtime.flames.length=0;
    runtime.timeFieldUntil=0;
    runtime.transient.length=0;
    for(const enemy of state.enemies){
      delete enemy.armorBreakStacks;
      delete enemy.armorBreakUntil;
      delete enemy.armorBreakLevel;
    }
  }

  const baseResetA4=resetSkillEngine;
  resetSkillEngine=function(){
    const result=baseResetA4();
    resetA4();
    return result;
  };

  const baseUpdateA4=update;
  update=function(dt){
    const result=baseUpdateA4(dt);
    if(!state.running||state.paused||state.gameOver)return result;
    updateFields();
    updateSoulFlames(dt);
    updateTimeAcceleration(dt);
    runtime.transient=runtime.transient.filter(fx=>state.t-fx.start<fx.life);
    return result;
  };

  function drawStaticFields(){
    for(const field of runtime.fields){
      const radius=staticRadius(field.level);
      const age=state.t-field.born;
      ctx.save();ctx.translate(field.x,field.y);
      ctx.strokeStyle="#8ccfff";ctx.lineWidth=1.8;ctx.globalAlpha=.26+.12*Math.sin(state.t*9);
      ctx.beginPath();ctx.arc(0,0,radius,0,Math.PI*2);ctx.stroke();
      for(let i=0;i<8;i++){
        const a=i*Math.PI/4+age*.16;
        const r=radius*(.66+.12*Math.sin(state.t*6+i));
        ctx.fillStyle="#c9ebff";ctx.globalAlpha=.35+.25*Math.sin(state.t*8+i);
        ctx.beginPath();ctx.arc(Math.cos(a)*r,Math.sin(a)*r,2,0,Math.PI*2);ctx.fill();
      }
      ctx.restore();
    }
  }

  function drawSoulFlames(){
    for(const flame of runtime.flames){
      const pulse=.65+.25*Math.sin(state.t*8+flame.phase);
      ctx.save();ctx.translate(flame.x,flame.y);
      ctx.fillStyle="#73e2cf";ctx.globalAlpha=.18;ctx.beginPath();ctx.arc(0,0,11,0,Math.PI*2);ctx.fill();
      ctx.fillStyle="#c8fff0";ctx.globalAlpha=pulse;ctx.beginPath();ctx.moveTo(0,-8);ctx.quadraticCurveTo(7,-1,2,7);ctx.quadraticCurveTo(-6,4,-3,-2);ctx.closePath();ctx.fill();
      ctx.restore();
    }
  }

  function drawArmorBreak(){
    for(const enemy of state.enemies){
      if(enemy.dead||(enemy.armorBreakUntil||0)<=state.t||!(enemy.armorBreakStacks>0))continue;
      const stacks=enemy.armorBreakStacks;
      const max=armorMaxStacks(enemy.armorBreakLevel||1);
      ctx.save();ctx.translate(enemy.x,enemy.y);
      for(let i=0;i<max;i++){
        const a=-Math.PI/2+i*Math.PI*2/max;
        ctx.strokeStyle=i<stacks?"#ffc28b":"#65594f";ctx.lineWidth=i<stacks?2:1;ctx.globalAlpha=i<stacks?.8:.24;
        ctx.beginPath();ctx.arc(Math.cos(a)*(enemy.r+8),Math.sin(a)*(enemy.r+8),2.4,0,Math.PI*2);ctx.stroke();
      }
      ctx.restore();
    }
  }

  function drawTimeField(){
    const level=skillLevel("timeField");
    if(!level||state.t>=runtime.timeFieldUntil)return;
    const duration=timeDuration(level);
    const remaining=clamp((runtime.timeFieldUntil-state.t)/duration,0,1);
    ctx.save();ctx.translate(player.x,player.y);
    ctx.strokeStyle="#d9c8ff";ctx.lineWidth=2;ctx.globalAlpha=.45+.18*Math.sin(state.t*11);
    ctx.beginPath();ctx.arc(0,0,47,0,Math.PI*2);ctx.stroke();
    for(let i=0;i<12;i++){
      const a=-Math.PI/2+i*Math.PI/6+state.t*(1.8+timeAcceleration(level));
      const inner=40,outer=i%3===0?48:45;
      ctx.strokeStyle="#efe5ff";ctx.lineWidth=i%3===0?2:1;ctx.globalAlpha=.45*remaining+.2;
      ctx.beginPath();ctx.moveTo(Math.cos(a)*inner,Math.sin(a)*inner);ctx.lineTo(Math.cos(a)*outer,Math.sin(a)*outer);ctx.stroke();
    }
    ctx.restore();
  }

  function drawTransient(){
    for(const fx of runtime.transient){
      const p=clamp((state.t-fx.start)/fx.life,0,1),fade=1-p;
      ctx.save();
      if(fx.type==="staticPulse"){
        ctx.strokeStyle="#b9e4ff";ctx.lineWidth=2.2;ctx.globalAlpha=.7*fade;ctx.beginPath();ctx.arc(fx.x,fx.y,8+p*fx.radius,0,Math.PI*2);ctx.stroke();
      }else if(fx.type==="soulBurst"){
        ctx.fillStyle="#7de4d3";ctx.globalAlpha=.18*fade;ctx.beginPath();ctx.arc(fx.x,fx.y,12+p*36,0,Math.PI*2);ctx.fill();
        ctx.strokeStyle="#c8fff0";ctx.lineWidth=2;ctx.globalAlpha=.65*fade;ctx.beginPath();ctx.arc(fx.x,fx.y,6+p*42,0,Math.PI*2);ctx.stroke();
      }else if(fx.type==="armorCrack"){
        const x=fx.enemy&&!fx.enemy.dead?fx.enemy.x:fx.x,y=fx.enemy&&!fx.enemy.dead?fx.enemy.y:fx.y;
        ctx.strokeStyle="#ffd0a0";ctx.lineWidth=1.7;ctx.globalAlpha=.62*fade;
        ctx.beginPath();ctx.moveTo(x-6,y-9);ctx.lineTo(x,y-2);ctx.lineTo(x-4,y+5);ctx.moveTo(x+6,y-8);ctx.lineTo(x+1,y-1);ctx.lineTo(x+5,y+6);ctx.stroke();
      }else{
        const color=fx.type==="timeOn"?"#d9c8ff":fx.type==="soulSpawn"?"#8ee9d8":"#9bd8ff";
        ctx.strokeStyle=color;ctx.lineWidth=1.8;ctx.globalAlpha=.6*fade;ctx.beginPath();ctx.arc(fx.x,fx.y,7+p*22,0,Math.PI*2);ctx.stroke();
      }
      ctx.restore();
    }
  }

  const baseDrawA4=draw;
  draw=function(){
    baseDrawA4();
    if(!state.running&&!state.gameOver)return;
    drawStaticFields();
    drawSoulFlames();
    drawArmorBreak();
    drawTimeField();
    drawTransient();
  };

  if(typeof SKILL_VISUAL_PROFILES!=="undefined"&&typeof SKILL_SCENE_DRAWERS!=="undefined"){
    SKILL_VISUAL_PROFILES.staticField={scene:"v016StaticField",tone:"#8ccfff"};
    SKILL_VISUAL_PROFILES.soulLantern={scene:"v016SoulLantern",tone:"#73e2cf"};
    SKILL_VISUAL_PROFILES.armorBreak={scene:"v016ArmorBreak",tone:"#ffc28b"};
    SKILL_VISUAL_PROFILES.timeField={scene:"v016TimeField",tone:"#d9c8ff"};

    SKILL_SCENE_DRAWERS.v016StaticField=(g,time,w,h)=>{
      const cx=w*.47,cy=h*.57,r=42;v12Actor(g,w*.22,h*.6,9);v12Ring(g,cx,cy,r,"#8ccfff",.55,2);
      for(let i=0;i<6;i++){const a=i*Math.PI/3+time*.2;drawGlowDot(g,cx+Math.cos(a)*r*.68,cy+Math.sin(a)*r*.68,2.5,"#c9ebff",.7+.2*Math.sin(time*7+i));}
      v12Enemy(g,w*.7,h*.55,8);v12Enemy(g,w*.52,h*.38,8);
    };

    SKILL_SCENE_DRAWERS.v016SoulLantern=(g,time,w,h)=>{
      const ax=w*.25,ay=h*.6;v12Actor(g,ax,ay,9);const ex=w*.82,ey=h*.5;v12Enemy(g,ex,ey,8);
      const t=(time*.35)%1,x=ax+(ex-ax)*t,y=ay+(ey-ay)*t;
      drawGlowDot(g,x,y,7,"#73e2cf",.35);drawGlowDot(g,x,y,3,"#c8fff0",.9);
    };

    SKILL_SCENE_DRAWERS.v016ArmorBreak=(g,time,w,h)=>{
      const ex=w*.66,ey=h*.52;v12Actor(g,w*.25,h*.6,9);v12Enemy(g,ex,ey,10);
      const stacks=1+Math.floor((time*.9)%4);
      for(let i=0;i<4;i++){const a=-Math.PI/2+i*Math.PI/2;drawGlowDot(g,ex+Math.cos(a)*21,ey+Math.sin(a)*21,2.5,i<stacks?"#ffc28b":"#65594f",i<stacks?.9:.25);}
      v12Line(g,w*.34,h*.58,ex-8,ey,"#ffd0a0",2,.55);
    };

    SKILL_SCENE_DRAWERS.v016TimeField=(g,time,w,h)=>{
      const cx=w*.5,cy=h*.56;v12Actor(g,cx,cy,10);v12Ring(g,cx,cy,38,"#d9c8ff",.6,2);
      for(let i=0;i<12;i++){const a=i*Math.PI/6+time*2.2;v12Line(g,cx+Math.cos(a)*31,cy+Math.sin(a)*31,cx+Math.cos(a)*(i%3===0?39:36),cy+Math.sin(a)*(i%3===0?39:36),"#efe5ff",i%3===0?2:1,.6);}
    };
  }
})();