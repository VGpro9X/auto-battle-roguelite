// V0.12 distinct base-skill visual scenes.

SKILL_SCENE_DRAWERS["rapid"]=function(g,time,w,h,profile){
  const c=profile.tone,cx=w*.29,cy=h*.54,ex=w*.74,ey=h*.54,phase=(time*.75)%1;
v12Actor(g,cx,cy);v12Enemy(g,ex,ey);
      for(let i=0;i<5;i++){const q=(time*1.25+i*.19)%1;v12Projectile(g,cx+(ex-cx)*q,cy+(i-2)*2.2,2.2,c,time,9);}
};

SKILL_SCENE_DRAWERS["power"]=function(g,time,w,h,profile){
  const c=profile.tone,cx=w*.29,cy=h*.54,ex=w*.74,ey=h*.54,phase=(time*.75)%1;
v12Actor(g,cx,cy);v12Enemy(g,ex,ey,10);const q=(time*.55)%1;v12Projectile(g,cx+(ex-cx)*q,cy,6,c,time,18);if(q>.78){drawAreaPulse(g,ex,ey,28,time,c,.22);v12Star(g,ex,ey,13,"#fff",time,.85);}
};

SKILL_SCENE_DRAWERS["vitality"]=function(g,time,w,h,profile){
  const c=profile.tone,cx=w*.29,cy=h*.54,ex=w*.74,ey=h*.54,phase=(time*.75)%1;
v12Actor(g,w*.5,h*.56,11);for(let i=0;i<3;i++){const a=time*.8+i*2.1;v12Heart(g,w*.5+Math.cos(a)*26,h*.52+Math.sin(a)*15,.55,c,.7);}drawAreaPulse(g,w*.5,h*.56,30,time,c,.15);
};

SKILL_SCENE_DRAWERS["speed"]=function(g,time,w,h,profile){
  const c=profile.tone,cx=w*.29,cy=h*.54,ex=w*.74,ey=h*.54,phase=(time*.75)%1;
for(let i=0;i<4;i++){const q=(phase+i*.18)%1;g.globalAlpha=.16+i*.08;v12Actor(g,w*.18+(w*.64)*q,cy,9);}g.globalAlpha=1;v12Actor(g,w*.18+w*.64*phase,cy,10);for(let i=0;i<3;i++)v12Line(g,w*.12,cy-10+i*10,w*.42,cy-10+i*10,c,2,.35);
};

SKILL_SCENE_DRAWERS["fire"]=function(g,time,w,h,profile){
  const c=profile.tone,cx=w*.29,cy=h*.54,ex=w*.74,ey=h*.54,phase=(time*.75)%1;
v12Actor(g,cx,cy);v12Enemy(g,ex,ey);const q=(time*.48)%1;drawProjectileVisual(g,cx+(ex-cx)*q,cy-5*Math.sin(q*Math.PI),5,["FIRE"],time,{source:"fire"});if(q>.8)drawAreaPulse(g,ex,ey,26,time,VFX_COLORS.fire,.1);
};

SKILL_SCENE_DRAWERS["knock"]=function(g,time,w,h,profile){
  const c=profile.tone,cx=w*.29,cy=h*.54,ex=w*.74,ey=h*.54,phase=(time*.75)%1;
v12Actor(g,cx,cy);for(let i=0;i<3;i++){const a=-.35+i*.35;const d=42+22*((time*.7)%1);v12Enemy(g,cx+Math.cos(a)*d,cy+Math.sin(a)*d,8);v12Arrow(g,cx+Math.cos(a)*28,cy+Math.sin(a)*28,a,18,c,.7);}drawAreaPulse(g,cx,cy,44,time,c,0);
};

SKILL_SCENE_DRAWERS["orbit"]=function(g,time,w,h,profile){
  const c=profile.tone,cx=w*.29,cy=h*.54,ex=w*.74,ey=h*.54,phase=(time*.75)%1;
v12Actor(g,w*.5,cy);for(let i=0;i<3;i++){const a=time*1.8+i*Math.PI*2/3;drawOrbitBladeVisual(g,w*.5+Math.cos(a)*26,cy+Math.sin(a)*20,a+Math.PI/2,false,time);}
};

SKILL_SCENE_DRAWERS["heal"]=function(g,time,w,h,profile){
  const c=profile.tone,cx=w*.29,cy=h*.54,ex=w*.74,ey=h*.54,phase=(time*.75)%1;
v12Actor(g,w*.5,cy);for(let i=0;i<4;i++){const q=(time*.45+i*.2)%1;v12Heart(g,w*.5+Math.sin(i*2.1)*26*(1-q),cy+24*(1-q),.3,c,1-q);}v12Ring(g,w*.5,cy,20+Math.sin(time*3)*2,c,.5,2);
};

SKILL_SCENE_DRAWERS["armor"]=function(g,time,w,h,profile){
  const c=profile.tone,cx=w*.29,cy=h*.54,ex=w*.74,ey=h*.54,phase=(time*.75)%1;
v12Actor(g,w*.5,cy);for(let i=0;i<6;i++){const a=i*Math.PI/3+time*.12;v12Facet(g,w*.5+Math.cos(a)*24,cy+Math.sin(a)*20,6,c,a);}v12Ring(g,w*.5,cy,28,c,.42,3);
};

SKILL_SCENE_DRAWERS["magnet"]=function(g,time,w,h,profile){
  const c=profile.tone,cx=w*.29,cy=h*.54,ex=w*.74,ey=h*.54,phase=(time*.75)%1;
v12Actor(g,cx,cy);for(let i=0;i<6;i++){const q=(time*.5+i*.13)%1;const sx=w*.78+Math.cos(i*1.7)*15,sy=h*.25+i*8;v12Facet(g,sx+(cx-sx)*q,sy+(cy-sy)*q,4,VFX_COLORS.xp,time+i);}v12Ring(g,cx,cy,26,c,.35,1.5);
};

SKILL_SCENE_DRAWERS["multishot"]=function(g,time,w,h,profile){
  const c=profile.tone,cx=w*.29,cy=h*.54,ex=w*.74,ey=h*.54,phase=(time*.75)%1;
v12Actor(g,cx,cy);for(let j=0;j<3;j++)v12Enemy(g,ex,ey+(j-1)*22,7);for(let i=0;i<3;i++){const q=(time*.58)%1;const ty=ey+(i-1)*22;v12Projectile(g,cx+(ex-cx)*q,cy+(ty-cy)*q,3,c,time,12);}
};

SKILL_SCENE_DRAWERS["pierce"]=function(g,time,w,h,profile){
  const c=profile.tone,cx=w*.29,cy=h*.54,ex=w*.74,ey=h*.54,phase=(time*.75)%1;
v12Actor(g,w*.18,cy);for(let i=0;i<3;i++)v12Enemy(g,w*.48+i*w*.17,cy,8);const q=(time*.55)%1;v12Projectile(g,w*.18+w*.68*q,cy,3.2,c,time,26);v12Line(g,w*.18,cy,w*.88,cy,c,1,.25);
};

SKILL_SCENE_DRAWERS["crit"]=function(g,time,w,h,profile){
  const c=profile.tone,cx=w*.29,cy=h*.54,ex=w*.74,ey=h*.54,phase=(time*.75)%1;
v12Actor(g,cx,cy);v12Enemy(g,ex,ey);const q=(time*.45)%1;v12Projectile(g,cx+(ex-cx)*q,cy,3,c,time,10);if(q>.78){v12Star(g,ex,ey,15,c,time*1.8,.95);v12Ring(g,ex,ey,17,c,.45,2);}
};

SKILL_SCENE_DRAWERS["lightning"]=function(g,time,w,h,profile){
  const c=profile.tone,cx=w*.29,cy=h*.54,ex=w*.74,ey=h*.54,phase=(time*.75)%1;
v12Actor(g,cx,cy);const pts=[[w*.58,h*.36],[w*.72,h*.54],[w*.62,h*.74]];for(const pt of pts)v12Enemy(g,...pt,7);drawLightningArc(g,cx,cy,pts[0][0],pts[0][1],time,6,.85);drawLightningArc(g,pts[0][0],pts[0][1],pts[1][0],pts[1][1],time+.2,5,.8);drawLightningArc(g,pts[1][0],pts[1][1],pts[2][0],pts[2][1],time+.4,5,.75);
};

SKILL_SCENE_DRAWERS["nova"]=function(g,time,w,h,profile){
  const c=profile.tone,cx=w*.29,cy=h*.54,ex=w*.74,ey=h*.54,phase=(time*.75)%1;
v12Actor(g,w*.5,cy);for(let i=0;i<5;i++){const a=i*Math.PI*2/5;v12Enemy(g,w*.5+Math.cos(a)*34,cy+Math.sin(a)*23,7);}drawAreaPulse(g,w*.5,cy,42,time,c,0);drawAreaPulse(g,w*.5,cy,42,time,c,.5);
};

SKILL_SCENE_DRAWERS["frost"]=function(g,time,w,h,profile){
  const c=profile.tone,cx=w*.29,cy=h*.54,ex=w*.74,ey=h*.54,phase=(time*.75)%1;
v12Actor(g,w*.5,cy);for(let i=0;i<6;i++){const a=i*Math.PI/3;const x=w*.5+Math.cos(a)*32,y=cy+Math.sin(a)*22;v12Facet(g,x,y,5,c,a+time*.2);}v12Ring(g,w*.5,cy,36+Math.sin(time*2)*2,c,.45,2);
};
