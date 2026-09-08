const GAME_VERSION="V0.12";
const canvas=document.getElementById("game");
const ctx=canvas.getContext("2d");
let W=innerWidth;
let H=innerHeight;
let dpr=Math.min(devicePixelRatio||1,2);

function resize(){
  W=innerWidth;
  H=innerHeight;
  canvas.width=W*dpr;
  canvas.height=H*dpr;
  canvas.style.width=W+"px";
  canvas.style.height=H+"px";
  ctx.setTransform(dpr,0,0,dpr,0,0);
}
addEventListener("resize",resize);
resize();

const rand=(a,b)=>a+Math.random()*(b-a);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);

function getXpNeed(level){
  const early=[0,5,7,10,14,19,25,32,40,50];
  if(level<early.length) return early[level];
  return Math.floor(50*Math.pow(1.17,level-9));
}

const state={
  t:0,
  running:false,
  paused:true,
  gameOver:false,
  kills:0,
  eliteKills:0,
  enemies:[],
  projectiles:[],
  gems:[],
  particles:[],
  spawnTimer:0,
  mode:null,
  starterSelectionsRemaining:0,
  currentScreen:"mainMenu",
  settingsReturnScreen:"mainMenu",
  result:null
};

function createInitialPlayer(){
  return{
    x:W/2,y:H/2,r:16,
    hp:100,maxHp:100,shield:0,
    speed:105,damage:14,damageMultiplier:1,
    attackRange:185,attackCd:.6,attackTimer:0,
    level:1,xp:0,xpNeed:getXpNeed(1),
    armor:0,regen:0,magnet:70,orbitAngle:0,
    moveX:1,moveY:0,
    extraProjectiles:0,projectilePierce:0,projectileRicochet:0,
    critChance:0,critMultiplier:1.75,
    dodgeChance:0,
    xpMultiplier:1,
    periodicCooldownMultiplier:1,
    areaMultiplier:1,
    areaDamageMultiplier:1,
    summonDamageMultiplier:1,
    elementalDamageMultiplier:1,
    chainDamageMultiplier:1,
    eliteDamageMultiplier:1,
    chilledDamageMultiplier:1,
    projectileSpeedMultiplier:1,
    healOnHitChance:0,
    healOnHitAmount:0,
    shieldOnKill:0,
    reviveCharges:0,
    explosionChance:0,
    poisonChance:0,
    burnChance:0
  };
}

const player=createInitialPlayer();
