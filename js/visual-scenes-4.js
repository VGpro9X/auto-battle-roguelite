// V0.12 distinct base-skill visual scenes.

SKILL_SCENE_DRAWERS["echoShot"]=function(g,time,w,h,profile){
  const c=profile.tone,cx=w*.29,cy=h*.54,ex=w*.74,ey=h*.54,phase=(time*.75)%1;
v12Actor(g,cx,cy);v12Enemy(g,ex,ey);const q=(time*.5)%1;v12Projectile(g,cx+(ex-cx)*q,cy-6,3,"#eef2ff",time,11);v12Projectile(g,cx+(ex-cx)*((q+.22)%1),cy+8,3,c,time,11);g.globalAlpha=.22;v12Line(g,cx,cy+8,ex,ey+8,c,1.5,.4);g.globalAlpha=1;
};

SKILL_SCENE_DRAWERS["pointBlank"]=function(g,time,w,h,profile){
  const c=profile.tone,cx=w*.29,cy=h*.54,ex=w*.74,ey=h*.54,phase=(time*.75)%1;
v12Actor(g,w*.43,cy);v12Enemy(g,w*.57,cy,10);const pulse=.5+.5*Math.sin(time*5);v12Ring(g,w*.43,cy,24,c,.25+.35*pulse,3);v12Star(g,w*.57,cy,10,c,time,.65);
};

SKILL_SCENE_DRAWERS["areaMastery"]=function(g,time,w,h,profile){
  const c=profile.tone,cx=w*.29,cy=h*.54,ex=w*.74,ey=h*.54,phase=(time*.75)%1;
v12Actor(g,w*.5,cy);drawAreaPulse(g,w*.5,cy,30,time,c,0);drawAreaPulse(g,w*.5,cy,48,time,c,.35);drawAreaPulse(g,w*.5,cy,62,time,c,.7);
};

SKILL_SCENE_DRAWERS["summonMastery"]=function(g,time,w,h,profile){
  const c=profile.tone,cx=w*.29,cy=h*.54,ex=w*.74,ey=h*.54,phase=(time*.75)%1;
v12Actor(g,w*.5,cy);for(let i=0;i<4;i++){const a=time+i*Math.PI/2;const x=w*.5+Math.cos(a)*30,y=cy+Math.sin(a)*21;drawGlowDot(g,x,y,5,c,.55);v12Star(g,x,y,5,"#fff",-a,.65);}
};

SKILL_SCENE_DRAWERS["elementalMastery"]=function(g,time,w,h,profile){
  const c=profile.tone,cx=w*.29,cy=h*.54,ex=w*.74,ey=h*.54,phase=(time*.75)%1;
const cols=[VFX_COLORS.fire,VFX_COLORS.ice,VFX_COLORS.lightning,VFX_COLORS.poison];v12Actor(g,w*.5,cy);for(let i=0;i<4;i++){const a=time*.8+i*Math.PI/2;drawGlowDot(g,w*.5+Math.cos(a)*28,cy+Math.sin(a)*19,5,cols[i],.8);}
};

SKILL_SCENE_DRAWERS["markSpread"]=function(g,time,w,h,profile){
  const c=profile.tone,cx=w*.29,cy=h*.54,ex=w*.74,ey=h*.54,phase=(time*.75)%1;
const pts=[[w*.48,h*.38],[w*.72,h*.5],[w*.55,h*.72]];for(const pt of pts){v12Enemy(g,...pt,8);v12Ring(g,pt[0],pt[1],13,c,.55,1.5);}drawLightningArc(g,pts[0][0],pts[0][1],pts[1][0],pts[1][1],time,4,.28);drawLightningArc(g,pts[1][0],pts[1][1],pts[2][0],pts[2][1],time+.3,4,.28);
};

SKILL_SCENE_DRAWERS["shieldPulse"]=function(g,time,w,h,profile){
  const c=profile.tone,cx=w*.29,cy=h*.54,ex=w*.74,ey=h*.54,phase=(time*.75)%1;
v12Actor(g,w*.5,cy);drawShieldVisual(g,w*.5,cy,24,time,1);drawAreaPulse(g,w*.5,cy,45,time,c,.2);
};

SKILL_SCENE_DRAWERS["xpHeal"]=function(g,time,w,h,profile){
  const c=profile.tone,cx=w*.29,cy=h*.54,ex=w*.74,ey=h*.54,phase=(time*.75)%1;
v12Actor(g,cx,cy);for(let i=0;i<5;i++){const q=(time*.5+i*.16)%1;const sx=w*.75+Math.cos(i)*14,sy=h*.3+i*8;v12Facet(g,sx+(cx-sx)*q,sy+(cy-sy)*q,3,VFX_COLORS.xp,time+i);}v12Heart(g,cx,cy-23,.25,"#78e0ac",.85);
};

SKILL_SCENE_DRAWERS["levelBurst"]=function(g,time,w,h,profile){
  const c=profile.tone,cx=w*.29,cy=h*.54,ex=w*.74,ey=h*.54,phase=(time*.75)%1;
v12Actor(g,w*.5,cy);g.fillStyle="#fff";g.font=`bold ${Math.max(11,h*.16)}px sans-serif`;g.fillText("↑",w*.5-5,cy-27);drawAreaPulse(g,w*.5,cy,48,time,c,.15);for(let i=0;i<6;i++){const a=i*Math.PI/3;v12Line(g,w*.5+Math.cos(a)*14,cy+Math.sin(a)*10,w*.5+Math.cos(a)*34,cy+Math.sin(a)*25,c,2,.55);}
};

SKILL_SCENE_DRAWERS["sacrifice"]=function(g,time,w,h,profile){
  const c=profile.tone,cx=w*.29,cy=h*.54,ex=w*.74,ey=h*.54,phase=(time*.75)%1;
v12Actor(g,w*.5,cy);v12Heart(g,w*.5,cy-24,.36,c,.75);const p=.5+.5*Math.sin(time*4);drawAreaPulse(g,w*.5,cy,48,time,c,.35);v12Line(g,w*.5-18,cy+18,w*.5+18,cy-18,c,3,.3+.35*p);
};

SKILL_SCENE_DRAWERS["bountyMark"]=function(g,time,w,h,profile){
  const c=profile.tone,cx=w*.29,cy=h*.54,ex=w*.74,ey=h*.54,phase=(time*.75)%1;
v12Enemy(g,w*.58,cy,10);v12Ring(g,w*.58,cy,17,c,.7,2);for(let i=0;i<4;i++){const a=i*Math.PI/2+time*.5;drawGlowDot(g,w*.58+Math.cos(a)*25,cy+Math.sin(a)*17,3,c,.7);}g.font=`bold ${Math.max(10,h*.13)}px sans-serif`;g.fillStyle=c;g.fillText("+KN",w*.22,h*.38);
};

SKILL_SCENE_DRAWERS["velocity"]=function(g,time,w,h,profile){
  const c=profile.tone,cx=w*.29,cy=h*.54,ex=w*.74,ey=h*.54,phase=(time*.75)%1;
v12Actor(g,w*.2,cy);const q=(time*.85)%1;v12Projectile(g,w*.2+w*.66*q,cy,3,c,time,34);for(let i=0;i<4;i++)v12Line(g,w*.15,cy-12+i*8,w*.48,cy-12+i*8,c,1.5,.18+i*.05);v12Enemy(g,w*.84,cy,8);
};

SKILL_SCENE_DRAWERS["blackHole"]=function(g,time,w,h,profile){
  const c=profile.tone,cx=w*.29,cy=h*.54,ex=w*.74,ey=h*.54,phase=(time*.75)%1;
drawGlowDot(g,w*.5,cy,7,"#2b1c48",1);for(let i=0;i<5;i++){const a=-time*1.5+i*1.25,r=12+i*4;g.save();g.strokeStyle=i%2?"#8d72db":"#b69aff";g.globalAlpha=.65;g.beginPath();g.arc(w*.5,cy,r,a,a+Math.PI*1.3);g.stroke();g.restore();}for(let i=0;i<3;i++){const a=time+i*2.1;v12Enemy(g,w*.5+Math.cos(a)*(28-5*Math.sin(time)),cy+Math.sin(a)*(18-4*Math.sin(time)),7);}
};

SKILL_SCENE_DRAWERS["chainMastery"]=function(g,time,w,h,profile){
  const c=profile.tone,cx=w*.29,cy=h*.54,ex=w*.74,ey=h*.54,phase=(time*.75)%1;
const pts=[[w*.35,h*.36],[w*.6,h*.48],[w*.78,h*.7],[w*.48,h*.75]];for(const pt of pts)v12Enemy(g,...pt,7);for(let i=0;i<pts.length-1;i++){drawLightningArc(g,pts[i][0],pts[i][1],pts[i+1][0],pts[i+1][1],time+i*.2,5,.72);}
};

SKILL_SCENE_DRAWERS["luckyStar"]=function(g,time,w,h,profile){
  const c=profile.tone,cx=w*.29,cy=h*.54,ex=w*.74,ey=h*.54,phase=(time*.75)%1;
const cols=["#ffe98b",VFX_COLORS.shield,"#7ee0a5",VFX_COLORS.fire];for(let i=0;i<4;i++){const a=time+i*Math.PI/2;v12Star(g,w*.5+Math.cos(a)*28,cy+Math.sin(a)*18,6,cols[i],-a,.75);}v12Actor(g,w*.5,cy);
};

SKILL_SCENE_DRAWERS["secondWind"]=function(g,time,w,h,profile){
  const c=profile.tone,cx=w*.29,cy=h*.54,ex=w*.74,ey=h*.54,phase=(time*.75)%1;
v12Actor(g,w*.5,cy);for(let i=0;i<5;i++){const a=-Math.PI*.8+i*Math.PI*.4;v12Line(g,w*.5,cy+4,w*.5+Math.cos(a)*28,cy+Math.sin(a)*22,c,3,.45);}v12Ring(g,w*.5,cy,26,c,.45+.25*Math.sin(time*4),2);g.fillStyle=c;g.font=`bold ${Math.max(12,h*.16)}px sans-serif`;g.fillText("↻",w*.5-7,cy-20);
};
