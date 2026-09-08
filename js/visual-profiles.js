// V0.12 visual identity layer. No image assets: all previews and gameplay accents are Canvas-drawn.

const SKILL_VISUAL_PROFILES={
  rapid:{scene:"rapid",tone:"#b9e7ff"},power:{scene:"power",tone:"#ffad6b"},vitality:{scene:"vitality",tone:"#ff7e95"},speed:{scene:"speed",tone:"#9ee8ff"},
  fire:{scene:"fire",tone:VFX_COLORS.fire},knock:{scene:"knock",tone:"#d8e5ff"},orbit:{scene:"orbit",tone:"#d7dfff"},heal:{scene:"heal",tone:"#7fe0a2"},armor:{scene:"armor",tone:"#aeb8cc"},magnet:{scene:"magnet",tone:VFX_COLORS.xp},
  multishot:{scene:"multishot",tone:"#e8efff"},pierce:{scene:"pierce",tone:"#d2e6ff"},crit:{scene:"crit",tone:"#ffd36f"},lightning:{scene:"lightning",tone:VFX_COLORS.lightning},nova:{scene:"nova",tone:"#d7a2ff"},frost:{scene:"frost",tone:VFX_COLORS.ice},blood:{scene:"blood",tone:VFX_COLORS.blood},wisdom:{scene:"wisdom",tone:"#91b8ff"},
  ricochet:{scene:"ricochet",tone:"#c4dcff"},explosive:{scene:"explosive",tone:"#ff8a65"},poison:{scene:"poison",tone:VFX_COLORS.poison},burn:{scene:"burn",tone:"#ff8f53"},execution:{scene:"execution",tone:"#f2d36d"},berserk:{scene:"berserk",tone:"#ff596e"},glassCannon:{scene:"glassCannon",tone:"#d6caff"},greed:{scene:"greed",tone:"#ffd86a"},
  timeEcho:{scene:"timeEcho",tone:"#b9c6ff"},retaliate:{scene:"retaliate",tone:"#ff9d8f"},thorns:{scene:"thorns",tone:"#9fd39b"},barrier:{scene:"barrier",tone:VFX_COLORS.shield},lastStand:{scene:"lastStand",tone:"#ffcf67"},phantomStep:{scene:"phantomStep",tone:"#b8b5ff"},deathMark:{scene:"deathMark",tone:VFX_COLORS.mark},soulHarvest:{scene:"soulHarvest",tone:VFX_COLORS.soul},
  corpseBurst:{scene:"corpseBurst",tone:"#d66c7a"},xpStorm:{scene:"xpStorm",tone:VFX_COLORS.xp},chaosOrb:{scene:"chaosOrb",tone:"#c987ff"},fireWisp:{scene:"fireWisp",tone:VFX_COLORS.fire},stormTotem:{scene:"stormTotem",tone:VFX_COLORS.lightning},overclock:{scene:"overclock",tone:"#92a9ff"},precision:{scene:"precision",tone:"#8db4ff"},giantSlayer:{scene:"giantSlayer",tone:"#ffcc78"},
  vampiricTouch:{scene:"vampiricTouch",tone:VFX_COLORS.blood},bloodShield:{scene:"bloodShield",tone:"#e86d91"},frostbite:{scene:"frostbite",tone:"#84dfff"},shatter:{scene:"shatter",tone:"#b8ecff"},conductiveVenom:{scene:"conductiveVenom",tone:"#a9e86e"},combustion:{scene:"combustion",tone:"#ff7f4f"},echoShot:{scene:"echoShot",tone:"#bfc9ff"},pointBlank:{scene:"pointBlank",tone:"#ffb784"},
  areaMastery:{scene:"areaMastery",tone:"#c8a1ff"},summonMastery:{scene:"summonMastery",tone:"#c9d3ff"},elementalMastery:{scene:"elementalMastery",tone:"#d6a5ff"},markSpread:{scene:"markSpread",tone:VFX_COLORS.mark},shieldPulse:{scene:"shieldPulse",tone:VFX_COLORS.shield},xpHeal:{scene:"xpHeal",tone:"#72d7b5"},levelBurst:{scene:"levelBurst",tone:"#c8a5ff"},sacrifice:{scene:"sacrifice",tone:"#e94f68"},
  bountyMark:{scene:"bountyMark",tone:"#f0ca67"},velocity:{scene:"velocity",tone:"#99d9ff"},blackHole:{scene:"blackHole",tone:VFX_COLORS.void},chainMastery:{scene:"chainMastery",tone:"#f2e881"},luckyStar:{scene:"luckyStar",tone:"#ffe889"},secondWind:{scene:"secondWind",tone:"#f7f1c1"}
};

function v12PreviewFrame(g,w,h){
  g.clearRect(0,0,w,h);
  const grad=g.createRadialGradient(w*.5,h*.44,2,w*.5,h*.44,Math.max(w,h)*.7);
  grad.addColorStop(0,"rgba(72,86,128,.22)");grad.addColorStop(1,"rgba(8,10,16,0)");
  g.fillStyle=grad;g.fillRect(0,0,w,h);
}
function v12Line(g,x1,y1,x2,y2,color,width=2,alpha=1){g.save();g.strokeStyle=color;g.lineWidth=width;g.globalAlpha=alpha;g.beginPath();g.moveTo(x1,y1);g.lineTo(x2,y2);g.stroke();g.restore();}
function v12Ring(g,x,y,r,color,alpha=.7,width=2){g.save();g.strokeStyle=color;g.lineWidth=width;g.globalAlpha=alpha;g.beginPath();g.arc(x,y,r,0,Math.PI*2);g.stroke();g.restore();}
function v12Star(g,x,y,r,color,rot=0,alpha=1){g.save();g.translate(x,y);g.rotate(rot);g.fillStyle=color;g.globalAlpha=alpha;g.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2===0?r:r*.42;const px=Math.cos(a)*rr,py=Math.sin(a)*rr;i?g.lineTo(px,py):g.moveTo(px,py);}g.closePath();g.fill();g.restore();}
function v12Arrow(g,x,y,angle,len,color,alpha=1){g.save();g.translate(x,y);g.rotate(angle);g.strokeStyle=color;g.fillStyle=color;g.globalAlpha=alpha;g.lineWidth=2;g.beginPath();g.moveTo(-len*.5,0);g.lineTo(len*.5,0);g.stroke();g.beginPath();g.moveTo(len*.5,0);g.lineTo(len*.28,-4);g.lineTo(len*.28,4);g.closePath();g.fill();g.restore();}
function v12Heart(g,x,y,s,color,alpha=1){g.save();g.translate(x,y);g.scale(s,s);g.fillStyle=color;g.globalAlpha=alpha;g.beginPath();g.moveTo(0,4);g.bezierCurveTo(-9,-3,-8,-10,-3,-10);g.bezierCurveTo(0,-10,2,-8,3,-6);g.bezierCurveTo(5,-9,8,-10,11,-8);g.bezierCurveTo(16,-4,12,2,0,10);g.closePath();g.fill();g.restore();}
function v12Enemy(g,x,y,r=9,elite=false){drawPreviewEnemy(g,x,y,r);if(elite)v12Ring(g,x,y,r+4,"#c68af0",.8,2);}
function v12Actor(g,x,y,r=10){drawPreviewActor(g,x,y,r);}
function v12Projectile(g,x,y,r,color,time,trail=0){
  if(trail>0){g.save();const gr=g.createLinearGradient(x-trail,y,x,y);gr.addColorStop(0,"rgba(255,255,255,0)");gr.addColorStop(1,color);g.strokeStyle=gr;g.globalAlpha=.6;g.lineWidth=Math.max(1,r*1.3);g.beginPath();g.moveTo(x-trail,y);g.lineTo(x,y);g.stroke();g.restore();}
  drawGlowDot(g,x,y,r,color,1);
}
function v12Facet(g,x,y,r,color,rotation=0){g.save();g.translate(x,y);g.rotate(rotation);g.fillStyle=color;g.beginPath();g.moveTo(0,-r);g.lineTo(r*.8,0);g.lineTo(0,r);g.lineTo(-r*.8,0);g.closePath();g.fill();g.restore();}

const SKILL_SCENE_DRAWERS={};

function drawSkillVisualProfile(g,key,time,w,h){
  const p=SKILL_VISUAL_PROFILES[key]||SKILL_VISUAL_PROFILES.rapid;
  const drawScene=SKILL_SCENE_DRAWERS[p.scene]||SKILL_SCENE_DRAWERS.rapid;
  v12PreviewFrame(g,w,h);
  if(drawScene)drawScene(g,time,w,h,p);
}
