(()=>{
  const root=typeof window!=="undefined"?window:globalThis;
  let duelSession=null;
  const roman=["","I","II","III"];

  function addOverlayId(id){if(typeof overlayIds!=="undefined"&&!overlayIds.includes(id))overlayIds.push(id);}
  function byId(id){return document.getElementById(id);}
  function setText(id,value){const el=byId(id);if(el)el.textContent=value;}
  function duelV20Icon(kind,key,item,size="sm"){return typeof root.getV020IconMarkup==="function"?root.getV020IconMarkup(kind,key,item,{size,title:item?.name||key}):`<span class="legacyIcon" aria-hidden="true">${item?.icon||"◆"}</span>`;}

  function ensureDuelDom(){
    const wrap=byId("gameWrap");if(!wrap||byId("duelLobbyMenu"))return;
    const lobby=document.createElement("div");lobby.id="duelLobbyMenu";lobby.className="screenOverlay menuScreen";
    lobby.innerHTML=`<div class="menuCard wideCard duelLobbyCard"><div class="screenHeader"><div><div class="eyebrow">V0.24 · ĐẤU TRƯỜNG 1V1</div><h2>Đấu Trường 1v1</h2></div><button id="duelLobbyBack" class="backButton">← Quay lại</button></div><div class="duelIntroGrid"><div class="duelIntroHero"><div class="duelVsMark">1 VS 1</div><h3>64 đấu sĩ · 1 nhà vô địch</h3><p>Nhân vật tự chiến đấu hoàn toàn. Bạn xây dựng bộ kỹ năng và quan sát AI thích nghi với build.</p></div><div class="duelRuleList"><div><b>64 → 32 → 16 → 8 → 4 → 2</b><small>Loại trực tiếp</small></div><div><b>Best-of-3</b><small>Thắng 2 round để đi tiếp</small></div><div><b>2 kỹ năng khởi đầu</b><small>Hoàn toàn tự do</small></div><div><b>Rank I / II / III</b><small>Rank III = TỐI ĐA</small></div><div><b>Toàn hệ kỹ năng</b><small>Hợp Đạo/Siêu Cấp tự mở · Rare theo vòng</small></div></div></div><div class="duelCombatRules"><b>LUẬT COMBAT</b><span>Đòn thường cận chiến: 12 sát thương · tầm 78px · hồi chiêu 0,78 giây. Tốc độ cơ bản: 118px/giây.</span><span>Round 60 giây. 45–60 giây: HUYẾT CHIẾN. Từ 60 giây: TỬ CHIẾN cho tới K.O.</span></div><div class="resultButtons"><button id="duelStartTournament" class="primary large">BẮT ĐẦU GIẢI 64 NGƯỜI</button></div></div>`;
    const pre=document.createElement("div");pre.id="duelPreMatchMenu";pre.className="screenOverlay menuScreen";
    pre.innerHTML=`<div class="menuCard wideCard duelPreCard"><div class="screenHeader"><div><div id="duelPreEyebrow" class="eyebrow">TOP 64</div><h2>Đối thủ tiếp theo</h2></div><button id="duelPreExit" class="backButton">Rời giải</button></div><div class="duelVersusPanel"><section><span class="duelSideLabel">BẠN</span><h3>BẠN</h3><div id="duelPlayerStyle" class="duelStyle"></div><div id="duelPlayerBuild" class="duelBuildList"></div></section><div class="duelBigVs">VS</div><section class="opponent"><span class="duelSideLabel">ĐỐI THỦ</span><h3 id="duelOpponentName"></h3><div id="duelOpponentStyle" class="duelStyle"></div><div id="duelOpponentBuild" class="duelBuildList"></div></section></div><div class="resultButtons"><button id="duelBeginMatch" class="primary large">BẮT ĐẦU BEST-OF-3</button></div></div>`;
    const pick=document.createElement("div");pick.id="duelSkillModal";pick.className="screenOverlay";
    pick.innerHTML=`<div class="modalCard duelSkillCard"><div id="duelPickEyebrow" class="eyebrow">KHỞI ĐẦU</div><h2 id="duelPickTitle">Chọn kỹ năng Đấu Trường</h2><p id="duelPickDesc"></p><div id="duelChoices" class="choices duelChoices"></div><button id="duelReroll" class="secondary duelReroll">↻ XOAY LẠI · 1 LẦN</button></div>`;
    const result=document.createElement("div");result.id="duelResultMenu";result.className="screenOverlay menuScreen";
    result.innerHTML=`<div class="menuCard mediumCard duelResultCard"><div id="duelResultBadge" class="resultBadge">KẾT QUẢ</div><h2 id="duelResultTitle"></h2><p id="duelResultSubtitle"></p><div id="duelResultStats" class="duelResultStats"></div><div id="duelFinalBuild" class="duelBuildList finalBuild"></div><div class="resultButtons"><button id="duelRetryTournament" class="primary">GIẢI MỚI</button><button id="duelResultMain" class="secondary">MENU CHÍNH</button></div></div>`;
    const combat=document.createElement("div");combat.id="duelCombatRoot";combat.className="duelCombatRoot hidden";
    combat.innerHTML=`<canvas id="duelCanvas" class="duelCanvas"></canvas><div class="duelCombatHud"><div class="duelHudTop"><div id="duelStageHud" class="duelStageHud">TOP 64</div><div id="duelPhaseHud" class="duelPhaseHud">ROUND 1</div><button id="duelAbortButton" class="duelAbortButton">RỜI GIẢI</button></div><div class="duelHealthRow"><div class="duelFighterHud left"><b id="duelPlayerNameHud">BẠN</b><div class="duelHealthBar"><i id="duelPlayerHpBar"></i><em id="duelPlayerShieldBar"></em></div><small id="duelPlayerHpText"></small></div><div class="duelRoundCenter"><div id="duelRoundScore">0 · 0</div><strong id="duelRoundTimer">60</strong></div><div class="duelFighterHud right"><b id="duelOpponentNameHud">ĐỐI THỦ</b><div class="duelHealthBar"><i id="duelOpponentHpBar"></i><em id="duelOpponentShieldBar"></em></div><small id="duelOpponentHpText"></small></div></div><div id="duelCombatBuilds" class="duelCombatBuilds"></div></div>`;
    wrap.append(lobby,pre,pick,result,combat);["duelLobbyMenu","duelPreMatchMenu","duelSkillModal","duelResultMenu"].forEach(addOverlayId);
    const modeGrid=document.querySelector("#modeMenu .modeGrid");
    if(modeGrid&&!byId("duelModeCard")){const button=document.createElement("button");button.id="duelModeCard";button.className="modeCard duelModeCard";button.innerHTML=`<span class="modeTime">1v1</span><span class="modeUnit">ĐẤU TRƯỜNG</span><strong>64 người · Best-of-3</strong><small>AI tự chiến đấu · xây build qua từng vòng</small>`;modeGrid.appendChild(button);button.addEventListener("click",openDuelLobby);}
    byId("duelLobbyBack")?.addEventListener("click",()=>showScreen("modeMenu"));
    byId("duelStartTournament")?.addEventListener("click",startDuelTournament);
    byId("duelBeginMatch")?.addEventListener("click",startCurrentDuelMatch);
    byId("duelPreExit")?.addEventListener("click",exitDuelToMenu);
    byId("duelAbortButton")?.addEventListener("click",exitDuelToMenu);
    byId("duelRetryTournament")?.addEventListener("click",startDuelTournament);
    byId("duelResultMain")?.addEventListener("click",exitDuelToMenu);
  }

  function openDuelLobby(){stopDuelLoop();setDuelCombatVisible(false);if(typeof state!=="undefined"){state.running=false;state.paused=true;state.gameOver=false;}if(typeof setGameUiVisible==="function")setGameUiVisible(false);showScreen("duelLobbyMenu");}
  function exitDuelToMenu(){stopDuelLoop();setDuelCombatVisible(false);duelSession=null;root.duelSession=null;if(typeof state!=="undefined"){state.running=false;state.paused=true;state.gameOver=false;}if(typeof setGameUiVisible==="function")setGameUiVisible(false);showScreen("mainMenu");}
  function startDuelTournament(){stopDuelLoop();setDuelCombatVisible(false);const tournament=createDuelTournament(Math.random);duelSession={tournament,starterPick:0,currentMatch:null,renderer:null,raf:0,lastFrame:0,settleAt:0,handlingMatchEnd:false};root.duelSession=duelSession;showDuelSkillSelection(true);}

  function buildHtml(build,{limit=8,empty="Chưa có kỹ năng",owner=null}={}){
    const entries=listDuelBuild(build),links=[];
    const skillHtml=entries.length?entries.slice(0,limit).map(({meta,rank})=>`<div class="duelBuildChip"><span>${duelV20Icon("skill",meta.key,meta,"sm")}</span><b>${meta.name}</b><small>${rank>=3?"TỐI ĐA":`Rank ${roman[rank]}`}</small></div>`).join(""):"";
    if(typeof listDuelSynergies==="function")for(const{meta}of listDuelSynergies(build,{includeLocked:false,implementedOnly:true}))links.push(`<div class="duelBuildChip duelLinkChip"><span>${duelV20Icon("synergy",meta.id||meta.key||meta.name,meta,"sm")}</span><b>${meta.name}</b><small>HỢP ĐẠO</small></div>`);
    if(typeof listDuelEvolutions==="function")for(const{meta}of listDuelEvolutions(build,{includeLocked:false,implementedOnly:true}))links.push(`<div class="duelBuildChip duelEvolutionChip"><span>${duelV20Icon("evolution",meta.id||meta.key||meta.name,meta,"sm")}</span><b>${meta.name}</b><small>SIÊU CẤP</small></div>`);
    if(owner&&typeof listDuelRares==="function")for(const meta of listDuelRares(owner))links.push(`<div class="duelBuildChip duelRareChip ${meta.tier}"><span>${duelV20Icon("rare",meta.id||meta.key||meta.name,meta,"sm")}</span><b>${meta.name}</b><small>${getDuelRareTierLabel(meta)}</small></div>`);
    return skillHtml+links.slice(0,12).join("")||`<div class="duelBuildEmpty">${empty}</div>`;
  }

  function showDuelSkillSelection(starter=false){
    if(!duelSession)return;const tournament=duelSession.tournament,player=getDuelTournamentPlayer(tournament);if(!player)return;
    let rerollUsed=false;const modal=byId("duelSkillModal"),container=byId("duelChoices"),reroll=byId("duelReroll");
    setText("duelPickEyebrow",starter?`KHỞI ĐẦU · LƯỢT ${duelSession.starterPick+1}/2`:`THẮNG TRẬN · NÂNG BUILD`);
    setText("duelPickTitle",starter?"Chọn kỹ năng khởi đầu":"Chọn một kỹ năng trước trận tiếp theo");
    const rareChance=!starter&&typeof getDuelRareOfferChance==="function"?Math.round(getDuelRareOfferChance(tournament.rewardCount)*100):0;
    setText("duelPickDesc",starter?"Ba lựa chọn hoàn toàn tự do. Không có Rare ở hai lượt khởi đầu.":`Kỹ năng có thể tăng tới Rank III. Hợp Đạo/Siêu Cấp tự mở khi đủ điều kiện. Cơ hội Rare: ${rareChance}%. XOAY LẠI roll mới cả 3 card và Rare.`);
    function renderChoices(){
      const picks=starter
        ?getDuelChoices(player.build,{starter:true,count:3,rng:Math.random}).map(key=>({kind:"skill",key}))
        :(typeof getDuelRewardChoices==="function"
          ?getDuelRewardChoices(player,{count:3,rewardIndex:tournament.rewardCount,rng:Math.random})
          :getDuelChoices(player.build,{starter:false,count:3,rng:Math.random}).map(key=>({kind:"skill",key})));
      container.innerHTML="";
      for(const choice of picks){
        if(choice.kind==="rare"){
          const meta=getDuelRare(choice.key);if(!meta)continue;const button=document.createElement("button");button.className=`choice duelChoice duelRareChoice ${meta.tier}`;button.innerHTML=`<div class="icon">${duelV20Icon("rare",meta.id||choice.key,meta,"xl")}</div><h3>${meta.name}</h3><div class="lvl">${getDuelRareTierLabel(meta)} · DUY NHẤT</div><div class="tags"><span class="tagChip">RULE</span><span class="tagChip">KHÔNG CẤP</span></div><div class="desc">${meta.desc}</div>`;button.addEventListener("click",()=>{if(!grantDuelRare(player,choice.key))return;showDuelPreMatch();});container.appendChild(button);continue;
        }
        const key=choice.key,meta=getDuelSkill(key),current=getDuelSkillRank(player.build,key),next=current+1;
        const evoHints=typeof getDuelEvolutionChoiceHints==="function"?getDuelEvolutionChoiceHints(player.build,key):[];
        const hintHtml=evoHints.length?`<div class="duelEvolutionHint">✦ MỞ SIÊU CẤP: ${evoHints.map(item=>`${duelV20Icon("evolution",item.id||item.base||item.name,item,"xs")} ${item.name}`).join(" · ")}</div>`:"";
        const button=document.createElement("button");button.className="choice duelChoice"+(next>=3?" maxNext":"");button.innerHTML=`<div class="icon">${duelV20Icon("skill",key,meta,"xl")}</div><h3>${meta.name}</h3><div class="lvl">Rank ${roman[next]} / III${next>=3?" · TỐI ĐA":""}</div><div class="tags">${meta.tags.slice(0,5).map(tag=>`<span class="tagChip">${typeof getTagLabel==="function"?getTagLabel(tag):tag}</span>`).join("")}</div><div class="desc">${meta.desc(next)}</div>${hintHtml}`;
        button.addEventListener("click",()=>{if(!addDuelSkillRank(player.build,key))return;if(!starter&&typeof applyDuelDivineGift==="function")applyDuelDivineGift(player,key,Math.random);if(starter){duelSession.starterPick++;if(duelSession.starterPick<2){showDuelSkillSelection(true);return;}}showDuelPreMatch();});container.appendChild(button);
      }
    }
    reroll.disabled=false;reroll.textContent="↻ XOAY LẠI · 1 LẦN";reroll.classList.remove("used");reroll.onclick=()=>{if(rerollUsed)return;rerollUsed=true;reroll.disabled=true;reroll.textContent="↻ ĐÃ DÙNG LƯỢT XOAY";reroll.classList.add("used");renderChoices();};renderChoices();hideAllOverlays();modal.classList.add("visible");
  }

  function showDuelPreMatch(){if(!duelSession)return;const t=duelSession.tournament,player=getDuelTournamentPlayer(t),opponent=getCurrentDuelOpponent(t);if(!opponent){showDuelResult(true);return;}const ps=getDuelOpponentSummary(player),os=getDuelOpponentSummary(opponent);setText("duelPreEyebrow",`${getDuelStageLabel(t.bracket.length)} · CÒN ${t.bracket.length} ĐẤU SĨ`);setText("duelPlayerStyle",`AI: ${ps.style} · cự ly ưu tiên ~${ps.preferredDistance}px`);setText("duelOpponentName",os.name);setText("duelOpponentStyle",`AI: ${os.style} · cự ly ưu tiên ~${os.preferredDistance}px`);byId("duelPlayerBuild").innerHTML=buildHtml(player.build,{owner:player});byId("duelOpponentBuild").innerHTML=buildHtml(opponent.build,{owner:opponent});showScreen("duelPreMatchMenu");}
  function setDuelCombatVisible(visible){byId("duelCombatRoot")?.classList.toggle("hidden",!visible);byId("game")?.classList.toggle("duelBaseHidden",visible);byId("version")?.classList.toggle("hidden",visible);}

  async function startCurrentDuelMatch(){
    if(!duelSession)return;const session=duelSession,t=session.tournament,player=getDuelTournamentPlayer(t),opponent=getCurrentDuelOpponent(t);if(!player||!opponent)return;const begin=byId("duelBeginMatch");if(begin){begin.disabled=true;begin.textContent="ĐANG CHUẨN BỊ...";}
    try{if(root.__V020_RENDERER_V3_BOOTSTRAP__)await root.__V020_RENDERER_V3_BOOTSTRAP__;}catch(error){console.warn("Renderer V3 bootstrap unavailable; continuing with released fallback.",error);}
    if(!duelSession||duelSession!==session){if(begin){begin.disabled=false;begin.textContent="BẮT ĐẦU BEST-OF-3";}return;}
    duelSession.currentMatch=createDuelMatch(player,opponent,{rng:Math.random});startDuelRound(duelSession.currentMatch);duelSession.handlingMatchEnd=false;duelSession.settleAt=0;hideAllOverlays();if(typeof setGameUiVisible==="function")setGameUiVisible(false);setDuelCombatVisible(true);const canvas=byId("duelCanvas");duelSession.renderer=createDuelRenderer(canvas);setText("duelPlayerNameHud",player.name);setText("duelOpponentNameHud",opponent.name);byId("duelCombatBuilds").innerHTML=`<div>${buildHtml(player.build,{limit:6,owner:player})}</div><div>${buildHtml(opponent.build,{limit:6,owner:opponent})}</div>`;duelSession.lastFrame=performance.now();duelSession.raf=requestAnimationFrame(duelFrame);if(begin){begin.disabled=false;begin.textContent="BẮT ĐẦU BEST-OF-3";}
  }

  function stopDuelLoop(){if(duelSession?.raf)cancelAnimationFrame(duelSession.raf);if(duelSession){duelSession.raf=0;duelSession.lastFrame=0;duelSession.settleAt=0;}}
  function updateDuelHud(){const match=duelSession?.currentMatch,round=match?.currentRound;if(!round)return;const p=round.fighters.player,o=round.fighters.opponent,pHp=Math.max(0,p.hp/p.maxHp*100),oHp=Math.max(0,o.hp/o.maxHp*100);byId("duelPlayerHpBar").style.width=`${pHp}%`;byId("duelOpponentHpBar").style.width=`${oHp}%`;byId("duelPlayerShieldBar").style.width=`${Math.min(100,p.shield/p.maxHp*100)}%`;byId("duelOpponentShieldBar").style.width=`${Math.min(100,o.shield/o.maxHp*100)}%`;setText("duelPlayerHpText",`${Math.ceil(p.hp)}/${Math.ceil(p.maxHp)}${p.shield>0?` +${Math.ceil(p.shield)}🛡`:""}`);setText("duelOpponentHpText",`${Math.ceil(o.hp)}/${Math.ceil(o.maxHp)}${o.shield>0?` +${Math.ceil(o.shield)}🛡`:""}`);setText("duelRoundScore",`${match.wins.player} · ${match.wins.opponent}`);setText("duelStageHud",`${getDuelStageLabel(duelSession.tournament.bracket.length)} · ROUND ${round.number}`);const phase=byId("duelPhaseHud");phase.textContent=round.phase==="NORMAL"?"BEST-OF-3":round.phase;phase.className=`duelPhaseHud ${round.phase.toLowerCase().replace(" ","-")}`;setText("duelRoundTimer",round.time<60?Math.max(0,Math.ceil(60-round.time)):"∞");}
  function duelFrame(now){if(!duelSession?.currentMatch)return;const match=duelSession.currentMatch,dt=Math.min(.033,Math.max(0,(now-duelSession.lastFrame)/1000));duelSession.lastFrame=now;const round=match.currentRound;if(round&&!round.ended&&!match.over)updateDuelRound(match,dt);const activeRound=match.currentRound;if(activeRound){duelSession.renderer.consume(drainDuelEvents(activeRound));duelSession.renderer.render(match,dt);updateDuelHud();}if(activeRound?.ended&&!match.over){if(!duelSession.settleAt)duelSession.settleAt=now+1050;if(now>=duelSession.settleAt){duelSession.settleAt=0;const outcome=settleDuelRound(match);if(outcome.status==="match_end"){handleDuelMatchEnd();return;}}}else if(match.over&&!duelSession.handlingMatchEnd){handleDuelMatchEnd();return;}duelSession.raf=requestAnimationFrame(duelFrame);}
  function handleDuelMatchEnd(){if(!duelSession||duelSession.handlingMatchEnd)return;duelSession.handlingMatchEnd=true;stopDuelLoop();const match=duelSession.currentMatch,playerWon=match.winner==="player",result=resolveDuelTournamentStage(duelSession.tournament,playerWon,{playerRoundWins:match.wins.player,opponentRoundWins:match.wins.opponent,rng:Math.random});setDuelCombatVisible(false);if(result.status==="champion"){showDuelResult(true);return;}if(result.status==="eliminated"){showDuelResult(false);return;}showDuelSkillSelection(false);}
  function showDuelResult(champion){if(!duelSession)return;const t=duelSession.tournament,player=getDuelTournamentPlayer(t);setText("duelResultBadge",champion?"NHÀ VÔ ĐỊCH":"BỊ LOẠI");setText("duelResultTitle",champion?"Bạn đã vô địch Đấu Trường!":"Giải đấu kết thúc");setText("duelResultSubtitle",champion?"Bạn đã vượt qua bracket 64 người và thắng trận chung kết best-of-3.":`Bạn ${getDuelPlacementText(t).toLowerCase()}.`);byId("duelResultStats").innerHTML=`<div><span>Match thắng</span><b>${t.matchWins}</b></div><div><span>Round thắng</span><b>${player.roundWins}</b></div><div><span>Round thua</span><b>${player.roundLosses}</b></div><div><span>Rare</span><b>${Array.isArray(player.rares)?player.rares.length:0}</b></div>`;byId("duelFinalBuild").innerHTML=buildHtml(player.build,{limit:20,owner:player});showScreen("duelResultMenu");}

  ensureDuelDom();root.openDuelLobby=openDuelLobby;
})();