// V0.12 distinct base-skill visual scenes.

SKILL_SCENE_DRAWERS["blood"]=function(g,time,w,h,profile){
  const c=profile.tone,cx=w*.29,cy=h*.54,ex=w*.74,ey=h*.54,phase=(time*.75)%1;
v12Actor(g,cx,cy);v12Enemy(g,ex,ey);const q=(time*.5)%1;v12Heart(g,ex+(cx-ex)*q,ey+(cy-ey)*q,.38,c,.8);v12Line(g,ex,ey,cx,cy,c,2,.25);
};

SKILL_SCENE_DRAWERS["wisdom"]=function(g,time,w,h,profile){
  const c=profile.tone,cx=w*.29,cy=h*.54,ex=w*.74,ey=h*.54,phase=(time*.75)%1;
v12Actor(g,w*.5,cy);for(let i=0;i<5;i++){const a=time*.5+i*1.25;const r=22+i*3;v12Facet(g,w*.5+Math.cos(a)*r,cy+Math.sin(a)*r*.6,3,VFX_COLORS.xp,a);}v12Star(g,w*.5,cy-25,7,c,time*.3,.7);
};

SKILL_SCENE_DRAWERS["ricochet"]=function(g,time,w,h,profile){
  const c=profile.tone,cx=w*.29,cy=h*.54,ex=w*.74,ey=h*.54,phase=(time*.75)%1;
v12Actor(g,w*.18,cy);const pts=[[w*.48,h*.34],[w*.72,h*.54],[w*.53,h*.73]];for(const pt of pts)v12Enemy(g,...pt,7);const chain=[[w*.18,cy],...pts];for(let i=0;i<chain.length-1;i++)v12Line(g,chain[i][0],chain[i][1],chain[i+1][0],chain[i+1][1],c,2,.45);const seg=((time*.6)%(chain.length-1));const si=Math.floor(seg),sq=seg-si;const a=chain[si],b=chain[si+1];v12Projectile(g,a[0]+(b[0]-a[0])*sq,a[1]+(b[1]-a[1])*sq,3,c,time,8);
};

SKILL_SCENE_DRAWERS["explosive"]=function(g,time,w,h,profile){
  const c=profile.tone,cx=w*.29,cy=h*.54,ex=w*.74,ey=h*.54,phase=(time*.75)%1;
v12Actor(g,cx,cy);v12Enemy(g,ex,ey);const q=(time*.52)%1;v12Projectile(g,cx+(ex-cx)*q,cy,4,c,time,12);if(q>.72){drawAreaPulse(g,ex,ey,34,time,c,.28);for(let i=0;i<5;i++){const a=i*1.26+time;v12Line(g,ex,ey,ex+Math.cos(a)*24,ey+Math.sin(a)*18,c,2,.55);}}
};

SKILL_SCENE_DRAWERS["poison"]=function(g,time,w,h,profile){
  const c=profile.tone,cx=w*.29,cy=h*.54,ex=w*.74,ey=h*.54,phase=(time*.75)%1;
v12Enemy(g,w*.58,cy,10);for(let i=0;i<7;i++){const a=time*.7+i*.9;drawGlowDot(g,w*.58+Math.cos(a)*18,cy+Math.sin(a*1.3)*12,2.6,c,.7);}v12Line(g,w*.47,cy-12,w*.68,cy+12,c,1,.25);
};

SKILL_SCENE_DRAWERS["burn"]=function(g,time,w,h,profile){
  const c=profile.tone,cx=w*.29,cy=h*.54,ex=w*.74,ey=h*.54,phase=(time*.75)%1;
v12Enemy(g,w*.58,cy,10);for(let i=0;i<5;i++){const a=i*.7;const flick=(Math.sin(time*8+i)*.5+.5);g.save();g.fillStyle=c;g.globalAlpha=.45+.45*flick;g.beginPath();g.moveTo(w*.58+(i-2)*5,cy+8);g.quadraticCurveTo(w*.58+(i-2)*5-5,cy-4-flick*8,w*.58+(i-2)*5,cy-18-flick*5);g.quadraticCurveTo(w*.58+(i-2)*5+5,cy-4,w*.58+(i-2)*5,cy+8);g.fill();g.restore();}
};

SKILL_SCENE_DRAWERS["execution"]=function(g,time,w,h,profile){
  const c=profile.tone,cx=w*.29,cy=h*.54,ex=w*.74,ey=h*.54,phase=(time*.75)%1;
v12Enemy(g,ex,ey,10);v12Line(g,ex-18,ey-18,ex+18,ey+18,c,3,.7);v12Line(g,ex+18,ey-18,ex-18,ey+18,c,3,.7);v12Ring(g,ex,ey,18,c,.5,2);g.fillStyle=c;g.font=`bold ${Math.max(10,h*.12)}px sans-serif`;g.globalAlpha=.85;g.fillText("<25%",w*.23,h*.56);
};

SKILL_SCENE_DRAWERS["berserk"]=function(g,time,w,h,profile){
  const c=profile.tone,cx=w*.29,cy=h*.54,ex=w*.74,ey=h*.54,phase=(time*.75)%1;
v12Actor(g,w*.5,cy,11);for(let i=0;i<6;i++){const a=i*Math.PI/3+time*.4;v12Line(g,w*.5+Math.cos(a)*16,cy+Math.sin(a)*12,w*.5+Math.cos(a)*32,cy+Math.sin(a)*24,c,3,.55);}v12Ring(g,w*.5,cy,22+Math.sin(time*6)*3,c,.55,3);
};

SKILL_SCENE_DRAWERS["glassCannon"]=function(g,time,w,h,profile){
  const c=profile.tone,cx=w*.29,cy=h*.54,ex=w*.74,ey=h*.54,phase=(time*.75)%1;
v12Actor(g,cx,cy);v12Enemy(g,ex,ey);for(let i=0;i<5;i++){const a=i*1.25+time*.2;v12Line(g,cx+Math.cos(a)*16,cy+Math.sin(a)*12,cx+Math.cos(a)*27,cy+Math.sin(a)*20,"#bcaeff",1.5,.5);}const q=(time*.55)%1;v12Projectile(g,cx+(ex-cx)*q,cy,5,"#efe9ff",time,18);
};

SKILL_SCENE_DRAWERS["greed"]=function(g,time,w,h,profile){
  const c=profile.tone,cx=w*.29,cy=h*.54,ex=w*.74,ey=h*.54,phase=(time*.75)%1;
v12Actor(g,w*.4,cy);for(let i=0;i<5;i++){const a=time*.7+i*1.25;drawGlowDot(g,w*.4+Math.cos(a)*24,cy+Math.sin(a)*15,3,c,.75);}v12Enemy(g,w*.72,cy,13,true);g.fillStyle=c;g.font=`bold ${Math.max(11,h*.14)}px sans-serif`;g.fillText("+KN",w*.58,h*.3);
};

SKILL_SCENE_DRAWERS["timeEcho"]=function(g,time,w,h,profile){
  const c=profile.tone,cx=w*.29,cy=h*.54,ex=w*.74,ey=h*.54,phase=(time*.75)%1;
v12Actor(g,w*.36,cy);g.globalAlpha=.18;v12Actor(g,w*.52,cy,10);g.globalAlpha=1;const q=(time*.5)%1;v12Projectile(g,w*.36+w*.42*q,cy,3,c,time,10);v12Projectile(g,w*.36+w*.42*((q+.22)%1),cy-10,2.5,"#8ea7ff",time,8);v12Ring(g,w*.36,cy,24,c,.35,2);
};

SKILL_SCENE_DRAWERS["retaliate"]=function(g,time,w,h,profile){
  const c=profile.tone,cx=w*.29,cy=h*.54,ex=w*.74,ey=h*.54,phase=(time*.75)%1;
v12Actor(g,w*.5,cy);v12Enemy(g,w*.3,cy,9);v12Arrow(g,w*.38,cy,0,18,"#cf6f6f",.65);v12Arrow(g,w*.42,cy+16,Math.PI,20,c,.85);drawAreaPulse(g,w*.5,cy,30,time,c,.15);
};

SKILL_SCENE_DRAWERS["thorns"]=function(g,time,w,h,profile){
  const c=profile.tone,cx=w*.29,cy=h*.54,ex=w*.74,ey=h*.54,phase=(time*.75)%1;
v12Actor(g,w*.5,cy);for(let i=0;i<8;i++){const a=i*Math.PI/4+time*.08;g.save();g.translate(w*.5+Math.cos(a)*22,cy+Math.sin(a)*17);g.rotate(a);g.fillStyle=c;g.beginPath();g.moveTo(0,0);g.lineTo(10,-3);g.lineTo(10,3);g.closePath();g.fill();g.restore();}
};

SKILL_SCENE_DRAWERS["barrier"]=function(g,time,w,h,profile){
  const c=profile.tone,cx=w*.29,cy=h*.54,ex=w*.74,ey=h*.54,phase=(time*.75)%1;
v12Actor(g,w*.5,cy);drawShieldVisual(g,w*.5,cy,25,time,1.4);drawShieldVisual(g,w*.5,cy,32,time+.5,.45);
};

SKILL_SCENE_DRAWERS["lastStand"]=function(g,time,w,h,profile){
  const c=profile.tone,cx=w*.29,cy=h*.54,ex=w*.74,ey=h*.54,phase=(time*.75)%1;
v12Actor(g,w*.5,cy);v12Ring(g,w*.5,cy,24,c,.5+.25*Math.sin(time*5),3);g.fillStyle="#ff6f6f";g.fillRect(w*.31,h*.26,w*.38,5);g.fillStyle=c;g.fillRect(w*.31,h*.26,w*.38*.24,5);g.font=`bold ${Math.max(11,h*.13)}px sans-serif`;g.fillText("NGUY CẤP",w*.36,h*.8);
};

SKILL_SCENE_DRAWERS["phantomStep"]=function(g,time,w,h,profile){
  const c=profile.tone,cx=w*.29,cy=h*.54,ex=w*.74,ey=h*.54,phase=(time*.75)%1;
for(let i=0;i<4;i++){const q=(phase+i*.13)%1;g.globalAlpha=.12+i*.12;v12Actor(g,w*.22+w*.56*q,cy+Math.sin(q*Math.PI*2)*8,9);}g.globalAlpha=1;v12Star(g,w*.78,cy,7,c,time,.65);
};
