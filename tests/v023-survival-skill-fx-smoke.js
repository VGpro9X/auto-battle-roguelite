// V0.23 semantic Survival-only VFX test: live event callbacks, rendering, reset and budgets.
const fs=require("fs"),vm=require("vm"),assert=require("assert");
const read=p=>fs.readFileSync(p,"utf8");
const code=read("js/v023-survival-skill-fx.js"),html=read("index.html"),game=read("js/game.js"),pages=read(".github/workflows/pages.yml");
const ctx={strokes:0,saves:0,restores:0,save(){this.saves++},restore(){this.restores++},translate(){},clearRect(){},rotate(){},beginPath(){},arc(){},moveTo(){},lineTo(){},stroke(){this.strokes++},fill(){},closePath(){},fillRect(){},ellipse(){},setLineDash(){}};
const events={},scope={Math,Number,URLSearchParams,WeakMap,Object,Array,W:1280,H:720,ctx,
  settings:{particles:true},state:{t:1,running:true,paused:false,gameOver:false,mode:{id:"5"}},
  player:{x:120,y:100,r:16},skills:{fire:{tags:["FIRE","PERIODIC"]},frost:{tags:["ICE","CONTROL"]}},
  navigator:{deviceMemory:8},location:{search:"?visualQuality=full"},matchMedia(){return{matches:false}},
  onSkillEvent(type,fn){(events[type]||(events[type]=[])).push(fn)},draw(){scope.baseDraws++},drawProjectileVisual(){scope.projectileDraws++},resetSkillEngine(){scope.resetCalls++},
  baseDraws:0,projectileDraws:0,resetCalls:0
};scope.window=scope;
vm.runInNewContext(code,scope,{filename:"js/v023-survival-skill-fx.js"});
const dispatch=(name,payload)=>{assert(events[name]?.length,"no listener for "+name);for(const fn of events[name])fn(payload);};
assert.strictEqual(typeof scope.getV023SurvivalFxStatus,"function");
const enemy=(x,y)=>({x,y,r:12,maxHp:80,hp:65});
const target=enemy(260,180);
dispatch("attack",{target});
dispatch("hit",{enemy:target,damage:44,meta:{source:"normal",tags:["PROJECTILE","ATTACK"],crit:true}});
dispatch("periodic",{skillKey:"fire",level:1});
dispatch("periodic_echo",{skillKey:"fire",level:1});
dispatch("heal",{amount:12,meta:{source:"xpHeal"}});
dispatch("shield_gain",{amount:10});
dispatch("hit",{enemy:enemy(270,190),damage:20,meta:{source:"orbit",tags:["MELEE","CONTROL"]}});
dispatch("hit",{enemy:enemy(280,200),damage:16,meta:{source:"lightning",tags:["LIGHTNING","CHAIN"]}});
dispatch("hit",{enemy:enemy(300,200),damage:16,meta:{source:"frost",tags:["ICE","CONTROL"]}});
dispatch("hit",{enemy:enemy(300,240),damage:16,meta:{source:"fire",tags:["FIRE"]}});
dispatch("hit",{enemy:enemy(300,265),damage:16,meta:{source:"poison",tags:["POISON"]}});
dispatch("hit",{enemy:enemy(310,285),damage:16,meta:{source:"nova",tags:["AREA"]}});
const before=scope.getV023SurvivalFxStatus();assert(before.active>=10,"missing attack/cast/hit/support families");
scope.draw();let after=scope.getV023SurvivalFxStatus();
assert(after.rendered>=10&&ctx.strokes>40&&scope.baseDraws===1,"VFX did not animate over actual draw loop");
assert.strictEqual(after.quality,"full");
const beforeProjectile=scope.projectileDraws,oldStrokes=ctx.strokes;
scope.drawProjectileVisual(ctx,160,140,4,["FIRE"],1,{source:"fire",vx:200,vy:120});
assert(scope.projectileDraws===beforeProjectile+1&&ctx.strokes>oldStrokes,"projectile motion trail missing");
dispatch("hit",{enemy:target,damage:2,meta:{source:"poisonDot",tags:["POISON","DOT"]}});
assert.strictEqual(scope.getV023SurvivalFxStatus().spawned,before.spawned,"DOT should not flood active FX");
scope.location.search="?visualQuality=low";scope.state.t+=.2;
for(let i=0;i<150;i++)dispatch("hit",{enemy:enemy(20+i*3,200),damage:20,meta:{source:"normal",tags:["PROJECTILE"]}});
const lowBefore=scope.getV023SurvivalFxStatus();assert(lowBefore.active<=24&&lowBefore.dropped>0,"low-quality allocation cap failed");
const previousRender=lowBefore.rendered;scope.draw();
const lowAfter=scope.getV023SurvivalFxStatus();
assert(lowAfter.rendered-previousRender<=10,"low-quality frame draw budget exceeded");
scope.matchMedia=()=>({matches:true});scope.draw();assert.strictEqual(scope.getV023SurvivalFxStatus().reducedMotion,true);
scope.resetSkillEngine();assert.strictEqual(scope.getV023SurvivalFxStatus().active,0,"run reset must clear FX");assert.strictEqual(scope.resetCalls,1);
scope.state.running=false;dispatch("hit",{enemy:enemy(100,110),damage:10,meta:{tags:["FIRE"]}});assert.strictEqual(scope.getV023SurvivalFxStatus().active,0,"menu must not spawn combat FX");
assert(!/Math\.random\s*\(/.test(code),"FX may not consume gameplay randomness");
assert(!/\b(?:player|state)\.[a-zA-Z]*(?:hp|damage|cooldown|speed|xp|kills)\s*[-+*/]?=/.test(code),"FX must not write gameplay truth");
assert(html.includes("js/v023-survival-skill-fx.js?v=023-release-r1"),"runtime script not wired");
assert(game.includes("vx:projectile.vx,vy:projectile.vy"),"projectile direction not wired");
assert(pages.includes("V0.23 Survival skill impact FX gate"),"Pages smoke gate missing");
console.log("v023-survival-skill-fx-smoke: PASS · event choreography, projectile trails, DOT filter, mobile budgets, reduced-motion and reset");
