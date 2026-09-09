// V0.16 run-system layer: icon compatibility, reroll, and rare-system expansion.

(()=>{
  const iconFallbacks=new Map([
    ["🪡","➤"],["🪙","●"],["🪢","⛓"],["🪃","↩"],["🪵","▣"],["🪞","◇"],["🪽","✦"]
  ]);
  function compatibleIcon(icon){
    if(typeof icon!=="string")return icon;
    let output="";
    for(const char of icon){
      if(iconFallbacks.has(char)){output+=iconFallbacks.get(char);continue;}
      const cp=char.codePointAt(0);
      output+=cp>=0x1FA70&&cp<=0x1FAFF?"◆":char;
    }
    return output;
  }
  function normalizeIconCollection(collection){if(collection)for(const item of Object.values(collection))if(item?.icon)item.icon=compatibleIcon(item.icon);}
  normalizeIconCollection(typeof skills!=="undefined"?skills:null);
  normalizeIconCollection(typeof SYNERGIES!=="undefined"?SYNERGIES:null);
  normalizeIconCollection(typeof EVOLUTIONS!=="undefined"?EVOLUTIONS:null);
  normalizeIconCollection(typeof DIVINE_SKILLS!=="undefined"?DIVINE_SKILLS:null);

  const levelModal=document.getElementById("levelModal");
  const choices=document.getElementById("choices");
  if(typeof showLevelUp!=="function"||!levelModal||!choices)return;
  const rerollButton=document.createElement("button");
  rerollButton.id="rerollChoicesButton";rerollButton.type="button";rerollButton.className="secondary";
  rerollButton.style.width="100%";rerollButton.style.marginTop="12px";rerollButton.style.minHeight="44px";
  rerollButton.textContent="↻ XOAY LẠI · 1 LẦN";
  choices.insertAdjacentElement("afterend",rerollButton);
  let rerollUsed=false,currentStarter=false;
  const baseShowLevelUp=showLevelUp;
  function formatChance(){const value=typeof getDivineOfferChance==="function"?getDivineOfferChance()*100:0;return Number(value.toFixed(2)).toString().replace(".",",");}
  function syncRerollUi(){
    rerollButton.disabled=rerollUsed;rerollButton.style.opacity=rerollUsed?".48":"1";rerollButton.style.cursor=rerollUsed?"default":"pointer";
    rerollButton.textContent=rerollUsed?"↻ ĐÃ DÙNG LƯỢT XOAY":"↻ XOAY LẠI · 1 LẦN";
    const description=document.getElementById("skillPickDescription");if(!description)return;
    if(currentStarter)description.textContent+=` · Bạn có 1 lần XOAY LẠI cho lượt chọn này.`;
    else description.textContent+=` · Cơ hội xuất hiện Thần Kỹ/Thần Bí Kỹ ở cấp ${player.level}: ${formatChance()}%. XOAY LẠI sẽ roll mới cả 3 lựa chọn và cơ hội rare.`;
  }
  showLevelUp=function(isStarter=false){currentStarter=Boolean(isStarter);rerollUsed=false;const result=baseShowLevelUp(isStarter);if(levelModal.classList.contains("visible"))syncRerollUi();return result;};
  rerollButton.addEventListener("click",()=>{if(rerollUsed||!state.running||state.gameOver||!levelModal.classList.contains("visible"))return;rerollUsed=true;baseShowLevelUp(currentStarter);if(levelModal.classList.contains("visible"))syncRerollUi();});
  const howTo=document.querySelector("#howToMenu .howToList");
  if(howTo&&!document.getElementById("v016RareHowTo")){
    const rare=document.createElement("p");rare.id="v016RareHowTo";rare.innerHTML=`<b>9.</b> Thần Kỹ/Thần Bí Kỹ không còn giới hạn 1 kỹ năng mỗi lượt chơi. Từ cấp 8, mỗi lần mở lựa chọn có 1% cơ hội xuất hiện một rare chưa sở hữu; mỗi cấp sau tăng 0,35 điểm %, tối đa 12%.`;
    const reroll=document.createElement("p");reroll.innerHTML=`<b>10.</b> Mỗi màn lựa chọn kỹ năng có đúng 1 lần XOAY LẠI. Lượt xoay không cộng dồn và thực hiện lại cả ba lựa chọn lẫn roll Thần Kỹ/Thần Bí Kỹ.`;howTo.append(rare,reroll);
  }
})();

// Rare Batch R1 — Thiên Mệnh, Phán Quyết, Hoán Vị, Đồng Giá.
(()=>{
  const ruleMeta=(source,tags=[])=>({source,tags:["RULE",...tags],allowProcs:false});
  function exactRuleDamage(enemy,amount,source,tags=[]){if(!enemy||enemy.dead||amount<=0)return 0;const meta=ruleMeta(source,tags);const multiplier=Math.max(1e-9,getOutgoingDamageMultiplier(enemy,meta));const before=Math.max(0,enemy.hp);hitEnemy(enemy,amount/multiplier,0,meta);return Math.min(before,amount);}

  DIVINE_SKILLS.heavenlyMandate={id:"heavenlyMandate",tier:"divine",name:"Thiên Mệnh",icon:"✦📜",desc:"Cứ mỗi 30 giây, toàn bộ Kỹ Năng định kỳ cơ bản bạn đang sở hữu lập tức được kích hoạt thêm đúng 1 lần. Lần kích hoạt thưởng không đặt lại bộ đếm thời gian bình thường; kỹ năng không có mục tiêu hợp lệ sẽ bỏ qua lần đó.",cooldown:30,preview:"heavenlyMandate",execute:()=>{for(const [key,skill] of Object.entries(skills)){const level=skillLevel(key);if(level<=0||!skill?.periodic||typeof skill.periodic.execute!=="function")continue;const fired=skill.periodic.execute(level)!==false;if(fired)emitSkillEvent("periodic",{skillKey:key,level,source:"heavenlyMandate"});}return true;}};
  DIVINE_SKILLS.divineJudgment={id:"divineJudgment",tier:"divine",name:"Phán Quyết",icon:"⚖✦",desc:"Mỗi 60 kẻ địch bị hạ, tiêu diệt ngay kẻ địch thường có HP hiện tại cao nhất. Nếu lúc đó chỉ còn Tinh Anh, Tinh Anh có HP hiện tại cao nhất chịu sát thương bằng đúng 20% HP tối đa của nó.",preview:"divineJudgment"};
  DIVINE_SKILLS.spatialSwap={id:"spatialSwap",tier:"mystic",name:"Hoán Vị",icon:"↔◇",desc:"Cứ mỗi 12 giây, nếu có ít nhất 3 kẻ địch trong 90px quanh bạn và có một kẻ địch ở khoảng 180–320px, lập tức đổi vị trí với kẻ xa nhất đủ điều kiện. Sau khi đổi vị trí, bạn không nhận sát thương tiếp xúc trong 0.6 giây.",cooldown:12,preview:"spatialSwap",execute:()=>{const hostiles=state.enemies.filter(isEnemyHostile);if(hostiles.filter(enemy=>Math.hypot(enemy.x-player.x,enemy.y-player.y)<=90).length<3)return false;const distant=hostiles.map(enemy=>({enemy,d:Math.hypot(enemy.x-player.x,enemy.y-player.y)})).filter(entry=>entry.d>=180&&entry.d<=320).sort((a,b)=>b.d-a.d);const target=distant[0]?.enemy;if(!target)return false;const px=player.x,py=player.y;player.x=target.x;player.y=target.y;target.x=px;target.y=py;player.spatialSwapImmuneUntil=state.t+.6;emitSkillEvent("divine_trigger",{id:"spatialSwap",enemy:target,from:{x:px,y:py},to:{x:player.x,y:player.y}});return true;}};
  DIVINE_SKILLS.equalPrice={id:"equalPrice",tier:"mystic",name:"Đồng Giá",icon:"◆⚖",desc:"Khi HP đang đầy, mỗi tinh thể XP chỉ cho bạn 70% lượng XP lẽ ra nhận sau mọi hệ số kinh nghiệm; 30% còn lại được đổi thành khiên theo tỷ lệ 2 khiên cho mỗi 1 XP đã đổi. Khi HP không đầy, tinh thể XP hoạt động bình thường. Không có giới hạn khiên ẩn.",preview:"equalPrice"};

  onSkillEvent("kill",()=>{if(!hasDivineSkill("divineJudgment"))return;skillRuntime.counters.divineJudgment=(skillRuntime.counters.divineJudgment||0)+1;while(skillRuntime.counters.divineJudgment>=60){skillRuntime.counters.divineJudgment-=60;const hostiles=state.enemies.filter(isEnemyHostile);const normals=hostiles.filter(enemy=>!enemy.elite).sort((a,b)=>b.hp-a.hp);if(normals.length){const target=normals[0];exactRuleDamage(target,Math.max(1,target.hp+.0001),"divineJudgment",["KILL"]);emitSkillEvent("divine_trigger",{id:"divineJudgment",enemy:target,executed:true});continue;}const elites=hostiles.filter(enemy=>enemy.elite).sort((a,b)=>b.hp-a.hp);if(elites.length){const target=elites[0];exactRuleDamage(target,target.maxHp*.20,"divineJudgment",["DAMAGE"]);emitSkillEvent("divine_trigger",{id:"divineJudgment",enemy:target,executed:false});}}});
  const baseDamagePlayerR1=damagePlayer;damagePlayer=function(amount,meta={}){if(hasDivineSkill("spatialSwap")&&meta?.type==="contact"&&(player.spatialSwapImmuneUntil||0)>state.t)return 0;return baseDamagePlayerR1(amount,meta);};
  const baseGainXpR1=gainXp;gainXp=function(amount){if(!hasDivineSkill("equalPrice")||player.hp<player.maxHp-1e-9)return baseGainXpR1(amount);const finalAmount=amount*player.xpMultiplier;const shieldGain=finalAmount*.30*2;const result=baseGainXpR1(amount*.70);if(shieldGain>0)addShield(shieldGain);return result;};
})();

// Rare Batch R2 — Thiên Hộ, Thần Vực, Nghịch Lưu, Đảo Nhân Quả.
(()=>{
  const runtime=state.v016RareR2={domainUntil:0,history:[],causalArmed:false};
  DIVINE_SKILLS.heavenlyWard={id:"heavenlyWard",tier:"divine",name:"Thiên Hộ",icon:"🛡☀",desc:"Mỗi khi khiên của bạn bị phá, nhận 1.5 giây bất tử. Thiên Hộ có hồi chiêu 12 giây tính từ lần kích hoạt thành công.",preview:"heavenlyWard"};
  DIVINE_SKILLS.divineDomain={id:"divineDomain",tier:"divine",name:"Thần Vực",icon:"◎☀",desc:"Cứ mỗi 24 giây, mở Thần Vực bán kính 140 quanh bạn trong 5 giây. Kẻ địch trong Thần Vực di chuyển chậm 40%, gây ít hơn 40% sát thương tiếp xúc và nhận thêm 20% sát thương từ bạn.",cooldown:24,preview:"divineDomain",execute:()=>{runtime.domainUntil=state.t+5;return true;}};
  DIVINE_SKILLS.lifeRewind={id:"lifeRewind",tier:"mystic",name:"Nghịch Lưu",icon:"⏪♥",desc:"Cứ mỗi 25 giây, nhìn lại trạng thái của bạn 5 giây trước. Nếu tổng HP + khiên khi đó cao hơn hiện tại, khôi phục HP và khiên về các giá trị đã ghi lại; HP không vượt HP tối đa hiện tại. Nếu trạng thái cũ không tốt hơn thì không có gì xảy ra.",cooldown:25,preview:"lifeRewind",execute:()=>{const targetTime=state.t-5;let snapshot=null;for(const entry of runtime.history){if(entry.t<=targetTime)snapshot=entry;else break;}if(!snapshot)return false;if(snapshot.hp+snapshot.shield>player.hp+player.shield+1e-9){player.hp=Math.min(player.maxHp,snapshot.hp);player.shield=snapshot.shield;emitSkillEvent("divine_trigger",{id:"lifeRewind",snapshot});}return true;}};
  DIVINE_SKILLS.causalInversion={id:"causalInversion",tier:"mystic",name:"Đảo Nhân Quả",icon:"↻☯",desc:"Cứ mỗi 15 giây tích một lần Đảo Nhân Quả. Đòn sát thương tiếp theo lẽ ra bạn phải nhận sau giảm sát thương sẽ bị triệt tiêu và thay vào đó hồi HP bằng đúng lượng sát thương đó. Đòn bị đảo không làm mất khiên. Chỉ tích tối đa 1 lần.",cooldown:15,preview:"causalInversion",execute:()=>{if(runtime.causalArmed)return false;runtime.causalArmed=true;emitSkillEvent("divine_trigger",{id:"causalInversion",armed:true});return true;}};
  onSkillEvent("shield_broken",()=>{if(!hasDivineSkill("heavenlyWard"))return;const readyAt=skillRuntime.cooldowns.heavenlyWard||0;if(state.t<readyAt)return;skillRuntime.cooldowns.heavenlyWard=state.t+12;player.invulnerableUntil=Math.max(player.invulnerableUntil||0,state.t+1.5);emitSkillEvent("divine_trigger",{id:"heavenlyWard"});});
  const baseOutgoingR2=getOutgoingDamageMultiplier;getOutgoingDamageMultiplier=function(enemy,meta={}){let multiplier=baseOutgoingR2(enemy,meta);if(hasDivineSkill("divineDomain")&&state.t<runtime.domainUntil&&enemy&&isEnemyHostile(enemy)&&Math.hypot(enemy.x-player.x,enemy.y-player.y)<=140)multiplier*=1.20;return multiplier;};
  const baseDamagePlayerR2=damagePlayer;damagePlayer=function(amount,meta={}){if(runtime.causalArmed&&hasDivineSkill("causalInversion")){if((player.invulnerableUntil||0)>state.t)return baseDamagePlayerR2(amount,meta);if(meta?.type==="contact"&&(player.spatialSwapImmuneUntil||0)>state.t)return baseDamagePlayerR2(amount,meta);if(Math.random()<player.dodgeChance){emitSkillEvent("dodge",{amount,meta});return 0;}const inverted=Math.max(0,amount*getIncomingDamageMultiplier(meta));runtime.causalArmed=false;if(inverted>0)healPlayer(inverted,{source:"causalInversion"});emitSkillEvent("divine_trigger",{id:"causalInversion",amount:inverted,consumed:true});return 0;}let adjusted=amount;const source=meta?.source;if(hasDivineSkill("divineDomain")&&state.t<runtime.domainUntil&&meta?.type==="contact"&&source&&isEnemyHostile(source)&&Math.hypot(source.x-player.x,source.y-player.y)<=140)adjusted*=.60;return baseDamagePlayerR2(adjusted,meta);};
  const baseUpdateR2=update;update=function(dt){const slowed=[];if(hasDivineSkill("divineDomain")&&state.t<runtime.domainUntil){for(const enemy of state.enemies){if(!isEnemyHostile(enemy)||Math.hypot(enemy.x-player.x,enemy.y-player.y)>140)continue;slowed.push([enemy,enemy.speed]);enemy.speed*=.60;}}const result=baseUpdateR2(dt);for(const [enemy,speed] of slowed)enemy.speed=speed;if(state.running&&!state.gameOver){runtime.history.push({t:state.t,hp:player.hp,shield:player.shield});const cutoff=state.t-6.2;while(runtime.history.length&&runtime.history[0].t<cutoff)runtime.history.shift();}return result;};
  const baseResetR2=resetSkillEngine;resetSkillEngine=function(){const result=baseResetR2();runtime.domainUntil=0;runtime.history.length=0;runtime.causalArmed=false;return result;};
})();
