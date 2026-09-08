// V0.12 distinct base-skill visual scenes.

SKILL_SCENE_DRAWERS["deathMark"]=function(g,time,w,h,profile){
  const c=profile.tone,cx=w*.29,cy=h*.54,ex=w*.74,ey=h*.54,phase=(time*.75)%1;
v12Enemy(g,w*.58,cy,10);v12Ring(g,w*.58,cy,18,c,.75,2);v12Line(g,w*.58-12,cy,w*.58+12,cy,c,2,.8);v12Line(g,w*.58,cy-12,w*.58,cy+12,c,2,.8);
};

SKILL_SCENE_DRAWERS["soulHarvest"]=function(g,time,w,h,profile){
  const c=profile.tone,cx=w*.29,cy=h*.54,ex=w*.74,ey=h*.54,phase=(time*.75)%1;
v12Enemy(g,ex,ey,9);v12Actor(g,cx,cy);for(let i=0;i<4;i++){const q=(time*.38+i*.21)%1;const sx=ex+Math.sin(i*2)*10,sy=ey-10-i*2;drawGlowDot(g,sx+(cx-sx)*q,sy+(cy-sy)*q,3,c,1-q*.25);}
};

SKILL_SCENE_DRAWERS["corpseBurst"]=function(g,time,w,h,profile){
  const c=profile.tone,cx=w*.29,cy=h*.54,ex=w*.74,ey=h*.54,phase=(time*.75)%1;
v12Enemy(g,ex,ey,9);const p=(time*.65)%1;if(p>.5){drawAreaPulse(g,ex,ey,34,time,c,.2);for(let i=0;i<6;i++){const a=i*Math.PI/3+time;v12Line(g,ex,ey,ex+Math.cos(a)*25,ey+Math.sin(a)*18,c,2,.6);}}
};

SKILL_SCENE_DRAWERS["xpStorm"]=function(g,time,w,h,profile){
  const c=profile.tone,cx=w*.29,cy=h*.54,ex=w*.74,ey=h*.54,phase=(time*.75)%1;
v12Actor(g,w*.5,cy);for(let i=0;i<9;i++){const a=time*.8+i*.7,r=16+(i%3)*9;v12Facet(g,w*.5+Math.cos(a)*r,cy+Math.sin(a)*r*.65,3,c,a);}
};

SKILL_SCENE_DRAWERS["chaosOrb"]=function(g,time,w,h,profile){
  const c=profile.tone,cx=w*.29,cy=h*.54,ex=w*.74,ey=h*.54,phase=(time*.75)%1;
v12Actor(g,cx,cy);const cols=[VFX_COLORS.fire,VFX_COLORS.ice,VFX_COLORS.lightning,VFX_COLORS.poison,VFX_COLORS.soul];for(let i=0;i<5;i++){const a=time*1.2+i*Math.PI*2/5;drawGlowDot(g,w*.58+Math.cos(a)*22,cy+Math.sin(a)*16,3.5,cols[i],.85);}v12Enemy(g,ex,ey,8);
};

SKILL_SCENE_DRAWERS["fireWisp"]=function(g,time,w,h,profile){
  const c=profile.tone,cx=w*.29,cy=h*.54,ex=w*.74,ey=h*.54,phase=(time*.75)%1;
v12Actor(g,cx,cy);for(let i=0;i<2;i++){const a=time*1.5+i*Math.PI;drawGlowDot(g,cx+Math.cos(a)*22,cy+Math.sin(a)*16,5,c,.85);}const q=(time*.55)%1;v12Projectile(g,cx+(ex-cx)*q,cy-12,3,c,time,8);v12Enemy(g,ex,ey,8);
};

SKILL_SCENE_DRAWERS["stormTotem"]=function(g,time,w,h,profile){
  const c=profile.tone,cx=w*.29,cy=h*.54,ex=w*.74,ey=h*.54,phase=(time*.75)%1;
g.fillStyle="#7f8aa3";g.fillRect(w*.3,cy-16,10,32);v12Star(g,w*.35,cy-22,8,c,time,.9);for(let i=0;i<3;i++){const x=w*.58+i*22,y=cy+(i-1)*13;v12Enemy(g,x,y,7);drawLightningArc(g,w*.35,cy-18,x,y,time+i*.2,5,.75);}
};

SKILL_SCENE_DRAWERS["overclock"]=function(g,time,w,h,profile){
  const c=profile.tone,cx=w*.29,cy=h*.54,ex=w*.74,ey=h*.54,phase=(time*.75)%1;
v12Actor(g,w*.5,cy);v12Ring(g,w*.5,cy,24,c,.65,2);for(let i=0;i<4;i++){const a=-time*3+i*Math.PI/2;v12Arrow(g,w*.5+Math.cos(a)*18,cy+Math.sin(a)*14,a,10,c,.7);}g.fillStyle="#ff7288";g.fillRect(w*.35,h*.75,w*.3,4);
};

SKILL_SCENE_DRAWERS["precision"]=function(g,time,w,h,profile){
  const c=profile.tone,cx=w*.29,cy=h*.54,ex=w*.74,ey=h*.54,phase=(time*.75)%1;
v12Enemy(g,ex,ey,10);for(let r=8;r<=24;r+=8)v12Ring(g,ex,ey,r,c,.35+r*.012,1.5);v12Line(g,ex-28,ey,ex+28,ey,c,1.5,.55);v12Line(g,ex,ey-28,ex,ey+28,c,1.5,.55);const q=(time*.5)%1;v12Projectile(g,cx+(ex-cx)*q,cy,2.6,"#f5f8ff",time,16);
};

SKILL_SCENE_DRAWERS["giantSlayer"]=function(g,time,w,h,profile){
  const c=profile.tone,cx=w*.29,cy=h*.54,ex=w*.74,ey=h*.54,phase=(time*.75)%1;
v12Actor(g,cx,cy,8);v12Enemy(g,ex,ey,17,true);const q=(time*.5)%1;v12Projectile(g,cx+(ex-cx)*q,cy,4.5,c,time,16);v12Arrow(g,w*.55,cy-24,0,25,c,.65);
};

SKILL_SCENE_DRAWERS["vampiricTouch"]=function(g,time,w,h,profile){
  const c=profile.tone,cx=w*.29,cy=h*.54,ex=w*.74,ey=h*.54,phase=(time*.75)%1;
v12Actor(g,cx,cy);v12Enemy(g,ex,ey);const q=(time*.45)%1;v12Line(g,cx,cy,ex,ey,c,2,.28);drawGlowDot(g,ex+(cx-ex)*q,ey,3.5,c,.8);v12Heart(g,cx,cy-20,.25,c,.7);
};

SKILL_SCENE_DRAWERS["bloodShield"]=function(g,time,w,h,profile){
  const c=profile.tone,cx=w*.29,cy=h*.54,ex=w*.74,ey=h*.54,phase=(time*.75)%1;
v12Actor(g,w*.5,cy);drawShieldVisual(g,w*.5,cy,25,time,1);for(let i=0;i<4;i++){const a=time+i*1.57;drawGlowDot(g,w*.5+Math.cos(a)*28,cy+Math.sin(a)*19,3,c,.65);}
};

SKILL_SCENE_DRAWERS["frostbite"]=function(g,time,w,h,profile){
  const c=profile.tone,cx=w*.29,cy=h*.54,ex=w*.74,ey=h*.54,phase=(time*.75)%1;
v12Enemy(g,ex,ey,10);for(let i=0;i<5;i++){const a=i*1.26;g.save();g.translate(ex+Math.cos(a)*17,ey+Math.sin(a)*13);g.rotate(a);g.fillStyle=c;g.beginPath();g.moveTo(0,-7);g.lineTo(3,4);g.lineTo(-3,4);g.closePath();g.fill();g.restore();}v12Ring(g,ex,ey,20,c,.55,2);
};

SKILL_SCENE_DRAWERS["shatter"]=function(g,time,w,h,profile){
  const c=profile.tone,cx=w*.29,cy=h*.54,ex=w*.74,ey=h*.54,phase=(time*.75)%1;
v12Enemy(g,ex,ey,9);for(let i=0;i<7;i++){const a=i*.9+time*.2;const r=10+((time*.6+i*.11)%1)*24;v12Facet(g,ex+Math.cos(a)*r,ey+Math.sin(a)*r*.7,4,c,a);}
};

SKILL_SCENE_DRAWERS["conductiveVenom"]=function(g,time,w,h,profile){
  const c=profile.tone,cx=w*.29,cy=h*.54,ex=w*.74,ey=h*.54,phase=(time*.75)%1;
v12Enemy(g,w*.62,cy,9);for(let i=0;i<4;i++){const a=time+i*1.4;drawGlowDot(g,w*.62+Math.cos(a)*14,cy+Math.sin(a)*10,2.5,VFX_COLORS.poison,.65);}drawLightningArc(g,w*.62,cy,w*.82,cy-12,time,5,.85);v12Enemy(g,w*.82,cy-12,7);
};

SKILL_SCENE_DRAWERS["combustion"]=function(g,time,w,h,profile){
  const c=profile.tone,cx=w*.29,cy=h*.54,ex=w*.74,ey=h*.54,phase=(time*.75)%1;
v12Enemy(g,ex,ey,9);g.save();g.fillStyle=c;g.globalAlpha=.55+.25*Math.sin(time*8);g.beginPath();g.arc(ex,ey,15,0,Math.PI*2);g.fill();g.restore();drawAreaPulse(g,ex,ey,35,time,c,.35);
};
