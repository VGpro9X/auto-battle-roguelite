(()=>{
  const root=typeof window!=="undefined"?window:globalThis;
  let duelSession=null;

  function addOverlayId(id){if(typeof overlayIds!=="undefined"&&!overlayIds.includes(id))overlayIds.push(id);}

  function ensureDuelDom(){
    const wrap=document.getElementById("gameWrap");if(!wrap||document.getElementById("duelLobbyMenu"))return;

    const lobby=document.createElement("div");lobby.id="duelLobbyMenu";lobby.className="screenOverlay menuScreen";
    lobby.innerHTML=`<div class="menuCard wideCard duelLobbyCard">
      <div class="screenHeader"><div><div class="eyebrow">V0.17 · CHẾ ĐỘ ĐANG PHÁT TRIỂN</div><h2>Đấu Trường 1v1</h2></div><button id="duelLobbyBack" class="backButton">← Quay lại</button></div>
      <div class="duelIntroGrid">
        <div class="duelIntroHero"><div class="duelVsMark">1 VS 1</div><h3>64 đấu sĩ · 1 nhà vô địch</h3><p>Nhân vật tự chiến đấu hoàn toàn. Bạn chỉ xây dựng bộ kỹ năng và quan sát AI thích nghi với build.</p></div>
        <div class="duelRuleList">
          <div><b>64 → 32 → 16 → 8 → 4 → 2</b><small>Loại trực tiếp</small></div>
          <div><b>Best-of-3</b><small>Thắng 2 round để đi tiếp</small></div>
          <div><b>2 kỹ năng khởi đầu</b><small>Hoàn toàn tự do · không ép offensive</small></div>
          <div><b>Rank I / II / III</b><small>Rank III = TỐI ĐA</small></div>
          <div><b>80 Kỹ Năng + liên kết</b><small>Hợp Đạo/Siêu Cấp tự mở khi đủ điều kiện</small></div>
        </div>
      </div>
      <div class="duelCombatRules"><b>LUẬT COMBAT PROTOTYPE</b><span>Đòn thường cận chiến: 12 sát thương · tầm 78px · hồi chiêu 0,78 giây. Tốc độ di chuyển cơ bản: 118px/giây.</span><span>Dash AI: 92px + 7px mỗi Rank Thân Pháp/Ảnh Bộ, tối đa +42px; hồi chiêu 4,2 giây − 0,12 giây mỗi Rank đó, tối thiểu 2,8 giây. Dash không có bất tử.</span><span>Round 60 giây. Từ 45–60 giây: HUYẾT CHIẾN tăng sát thương từ ×1,00 → ×1,75 và giảm hồi máu/khiên mới từ ×1,00 → ×0,50. Từ 60 giây: TỬ CHIẾN = sát thương ×2, hồi máu 0, khiên mới 0 cho tới khi có K.O.</span></div><p class="finePrint">Đồ họa hiện là renderer vector thử nghiệm. Combat, AI và skill được tách khỏi renderer để có thể thay bằng sprite/animation chất lượng cao sau này.</p>
      <div class="resultButtons"><button id="duelStartTournament" class="primary large">BẮT ĐẦU GIẢI 64 NGƯỜI</button></div>
    </div>`;

    const pre=document.createElement("div");pre.id="duelPreMatchMenu";pre.className="screenOverlay menuScreen";
    pre.innerHTML=`<div class="menuCard wideCard duelPreCard">
      <div class="screenHeader"><div><div id="duelPreEyebrow" class="eyebrow">TOP 64</div><h2>Đối thủ tiếp theo</h2></div><button id="duelPreExit" class="backButton">Rời giải</button></div>
      <div class="duelVersusPanel">
        <section><span class="duelSideLabel">BẠN</span><h3>BẠN</h3><div id="duelPlayerStyle" class="duelStyle"></div><div id="duelPlayerBuild" class="duelBuildList"></div></section>
        <div class="duelBigVs">VS</div>
        <section class="opponent"><span class="duelSideLabel">ĐỐI THỦ</span><h3 id="duelOpponentName"></h3><div id="duelOpponentStyle" class="duelStyle"></div><div id="duelOpponentBuild" class="duelBuildList"></div></section>
      </div>
      <div class="resultButtons"><button id="duelBeginMatch" class="primary large">BẮT ĐẦU BEST-OF-3</button></div>
    </div>`;

    const pick=document.createElement("div");pick.id="duelSkillModal";pick.className="screenOverlay";
    pick.innerHTML=`<div class="modalCard duelSkillCard"><div id="duelPickEyebrow" class="eyebrow">KHỞI ĐẦU</div><h2 id="duelPickTitle">Chọn kỹ năng Đấu Trường</h2><p id="duelPickDesc"></p><div id="duelChoices" class="choices duelChoices"></div><button id="duelReroll" class="secondary duelReroll">↻ XOAY LẠI · 1 LẦN</button></div>`;

    const result=document.createElement("div");result.id="duelResultMenu";result.className="screenOverlay menuScreen";
    result.innerHTML=`<div class="menuCard mediumCard duelResultCard"><div id="duelResultBadge" class="resultBadge">KẾT QUẢ</div><h2 id="duelResultTitle"></h2><p id="duelResultSubtitle"></p><div id="duelResultStats" class="duelResultStats"></div><div id="duelFinalBuild" class="duelBuildList finalBuild"></div><div class="resultButtons"><button id="duelRetryTournament" class="primary">GIẢI MỚI</button><button id="duelResultMain" class="secondary">MENU CHÍNH</button></div></div>`;

    const combat=document.createElement("div");combat.id="duelCombatRoot";combat.className="duelCombatRoot hidden";
    combat.innerHTML=`<canvas id="duelCanvas" class="duelCanvas"></canvas>
      <div class="duelCombatHud">
        <div class="duelHudTop"><div id="duelStageHud" class="duelStageHud">TOP 64</div><div id="duelPhaseHud" class="duelPhaseHud">ROUND 1</div><button id="duelAbortButton" class="duelAbortButton">RỜI GIẢI</button></div>
        <div class="duelHealthRow">
          <div class="duelFighterHud left"><b id="duelPlayerNameHud">BẠN</b><div class="duelHealthBar"><i id="duelPlayerHpBar"></i><em id="duelPlayerShieldBar"></em></div><small id="duelPlayerHpText"></small></div>
          <div class="duelRoundCenter"><div id="duelRoundScore">0 · 0</div><strong id="duelRoundTimer">60</strong></div>
          <div class="duelFighterHud right"><b id="duelOpponentNameHud">ĐỐI THỦ</b><div class="duelHealthBar"><i id="duelOpponentHpBar"></i><em id="duelOpponentShieldBar"></em></div><small id="duelOpponentHpText"></small></div>
        </div>
        <div id="duelCombatBuilds" class="duelCombatBuilds"></div>
      </div>`;

    wrap.append(lobby,pre,pick,result,combat);
    ["duelLobbyMenu","duelPreMatchMenu","duelSkillModal","duelResultMenu"].forEach(addOverlayId);

    const modeGrid=document.querySelector("#modeMenu .modeGrid");
    if(modeGrid&&!document.getElementById("duelModeCard")){
      const button=document.createElement("button");button.id="duelModeCard";button.className="modeCard duelModeCard";
      button.innerHTML=`<span class="modeTime">1v1</span><span class="modeUnit">ĐẤU TRƯỜNG</span><strong>64 người · Best-of-3</strong><small>Góc nhìn ngang · AI tự chiến đấu · xây build qua từng vòng</small>`;
      modeGrid.appendChild(button);button.addEventListener("click",openDuelLobby);
    }

    document.getElementById("duelLobbyBack").addEventListener("click",()=>showScreen("modeMenu"));
    document.getElementById("duelStartTournament").addEventListener("click",startDuelTournament);
    document.getElementById("duelBeginMatch").addEventListener("click",startCurrentDuelMatch);
    document.getElementById("duelPreExit").addEventListener("click",exitDuelToMenu);
    document.getElementById("duelAbortButton").addEventListener("click",exitDuelToMenu);
    document.getElementById("duelRetryTournament").addEventListener("click",startDuelTournament);
    document.getElementById("duelResultMain").addEventListener("click",exitDuelToMenu);
  }

  function openDuelLobby(){
    stopDuelLoop();setDuelCombatVisible(false);
    if(typeof state!=="undefined"){state.running=false;state.paused=true;state.gameOver=false;}
    if(typeof setGameUiVisible==="function")setGameUiVisible(false);
    showScreen("duelLobbyMenu");
  }

  function exitDuelToMenu(){
    stopDuelLoop();setDuelCombatVisible(false);duelSession=null;root.duelSession=null;
    if(typeof state!=="undefined"){state.running=false;state.paused=true;state.gameOver=false;}
    if(typeof setGameUiVisible==="function")setGameUiVisible(false);
    showScreen("mainMenu");
  }

  function startDuelTournament(){
    stopDuelLoop();setDuelCombatVisible(false);
    const tournament=createDuelTournament(Math.random);
    duelSession={tournament,starterPick:0,currentMatch:null,renderer:null,raf:0,lastFrame:0,settleAt:0,handlingMatchEnd:false};
    root.duelSession=duelSession;
    showDuelSkillSelection(true);
  }

  function buildHtml(build,{limit=8,empty="Chưa có kỹ năng"}={}){
    const entries=listDuelBuild(build);
    if(!entries.length)return`<div class="duelBuildEmpty">${empty}</div>`;
    const skillHtml=entries.slice(0,limit).map(({meta,rank})=>`<div class="duelBuildChip"><span>${meta.icon}</span><b>${meta.name}</b><small>${rank>=3?"TỐI ĐA":`Rank ${["","I","II","III"][rank]}`}</small></div>`).join("");
    const links=[];
    if(typeof listDuelSynergies==="function")for(const{meta}of listDuelSynergies(build,{includeLocked:false,implementedOnly:true}))links.push(`<div class="duelBuildChip duelLinkChip"><span>${meta.icon}</span><b>${meta.name}</b><small>HỢP ĐẠO</small></div>`);
    if(typeof listDuelEvolutions==="function")for(const{meta}of listDuelEvolutions(build,{includeLocked:false,implementedOnly:true}))links.push(`<div class="duelBuildChip duelEvolutionChip"><span>${meta.icon}</span><b>${meta.name}</b><small>SIÊU CẤP</small></div>`);
    return skillHtml+links.slice(0,8).join("");
  }

  function showDuelSkillSelection(starter=false){
    if(!duelSession)return;
    const player=getDuelTournamentPlayer(duelSession.tournament);if(!player)return;
    let rerollUsed=false;
    const modal=document.getElementById("duelSkillModal"),container=document.getElementById("duelChoices"),reroll=document.getElementById("duelReroll");
    document.getElementById("duelPickEyebrow").textContent=starter?`KHỞI ĐẦU · LƯỢT ${duelSession.starterPick+1}/2`:`THẮNG TRẬN · NÂNG BUILD`;
    document.getElementById("duelPickTitle").textContent=starter?"Chọn kỹ năng khởi đầu":"Chọn một kỹ năng trước trận tiếp theo";
    document.getElementById("duelPickDesc").textContent=starter?"Ba lựa chọn hoàn toàn tự do. Không có nhóm kỹ năng bắt buộc.":"Kỹ năng đã sở hữu có thể xuất hiện lại để tăng Rank. Rank III là TỐI ĐA; Hợp Đạo và Siêu Cấp tự mở khi đủ điều kiện.";

    function renderChoices(){
      const picks=getDuelChoices(player.build,{starter,count:3,rng:Math.random});container.innerHTML="";
      for(const key of picks){
        const meta=getDuelSkill(key),current=getDuelSkillRank(player.build,key),next=current+1;
        const evoHints=typeof getDuelEvolutionChoiceHints==="function"?getDuelEvolutionChoiceHints(player.build,key):[];
        const hintHtml=evoHints.length?`<div class="duelEvolutionHint">✦ MỞ SIÊU CẤP: ${evoHints.map(item=>`${item.icon} ${item.name}`).join(" · ")}</div>`:"";
        const button=document.createElement("button");button.className="choice duelChoice"+(next>=3?" maxNext":"");
        button.innerHTML=`<div class="icon">${meta.icon}</div><h3>${meta.name}</h3><div class="lvl">Rank ${["","I","II","III"][next]} / III${next>=3?" · TỐI ĐA":""}</div><div class="tags">${meta.tags.slice(0,5).map(tag=>`<span class="tagChip">${typeof getTagLabel==="function"?getTagLabel(tag):tag}</span>`).join("")}</div><div class="desc">${meta.desc(next)}</div>${hintHtml}`;
        button.addEventListener("click",()=>{
          if(!addDuelSkillRank(player.build,key))return;
          if(starter){duelSession.starterPick++;if(duelSession.starterPick<2){showDuelSkillSelection(true);return;}}
          showDuelPreMatch();
        });
        container.appendChild(button);
      }
    }
    reroll.disabled=false;reroll.textContent="↻ XOAY LẠI · 1 LẦN";reroll.classList.remove("used");
    reroll.onclick=()=>{if(rerollUsed)return;rerollUsed=true;reroll.disabled=true;reroll.textContent="↻ ĐÃ DÙNG LƯỢT XOAY";reroll.classList.add("used");renderChoices();};
    renderChoices();hideAllOverlays();modal.classList.add("visible");
  }

  function showDuelPreMatch(){
    if(!duelSession)return;
    const t=duelSession.tournament,player=getDuelTournamentPlayer(t),opponent=getCurrentDuelOpponent(t);
    if(!opponent){showDuelResult(true);return;}
    const ps=getDuelOpponentSummary(player),os=getDuelOpponentSummary(opponent);
    document.getElementById("duelPreEyebrow").textContent=`${getDuelStageLabel(t.bracket.length)} · CÒN ${t.bracket.length} ĐẤU SĨ`;
    document.getElementById("duelPlayerStyle").textContent=`AI: ${ps.style} · cự ly ưu tiên ~${ps.preferredDistance}px`;
    document.getElementById("duelOpponentName").textContent=os.name;
    document.getElementById("duelOpponentStyle").textContent=`AI: ${os.style} · cự ly ưu tiên ~${os.preferredDistance}px`;
    document.getElementById("duelPlayerBuild").innerHTML=buildHtml(player.build);
    document.getElementById("duelOpponentBuild").innerHTML=buildHtml(opponent.build);
    showScreen("duelPreMatchMenu");
  }

  function setDuelCombatVisible(visible){
    const rootEl=document.getElementById("duelCombatRoot");if(rootEl)rootEl.classList.toggle("hidden",!visible);
    const baseCanvas=document.getElementById("game");if(baseCanvas)baseCanvas.classList.toggle("duelBaseHidden",visible);
    const version=document.getElementById("version");if(version)version.classList.toggle("hidden",visible);
  }

  function startCurrentDuelMatch(){
    if(!duelSession)return;
    const t=duelSession.tournament,player=getDuelTournamentPlayer(t),opponent=getCurrentDuelOpponent(t);if(!player||!opponent)return;
    duelSession.currentMatch=createDuelMatch(player,opponent,{rng:Math.random});startDuelRound(duelSession.currentMatch);
    duelSession.handlingMatchEnd=false;duelSession.settleAt=0;
    hideAllOverlays();if(typeof setGameUiVisible==="function")setGameUiVisible(false);setDuelCombatVisible(true);
    const canvas=document.getElementById("duelCanvas");duelSession.renderer=createDuelRenderer(canvas);
    document.getElementById("duelPlayerNameHud").textContent=player.name;
    document.getElementById("duelOpponentNameHud").textContent=opponent.name;
    document.getElementById("duelCombatBuilds").innerHTML=`<div>${buildHtml(player.build,{limit:6})}</div><div>${buildHtml(opponent.build,{limit:6})}</div>`;
    duelSession.lastFrame=performance.now();duelSession.raf=requestAnimationFrame(duelFrame);
  }

  function stopDuelLoop(){
    if(duelSession?.raf)cancelAnimationFrame(duelSession.raf);
    if(duelSession){duelSession.raf=0;duelSession.lastFrame=0;duelSession.settleAt=0;}
  }

  function updateDuelHud(){
    const match=duelSession?.currentMatch,round=match?.currentRound;if(!round)return;
    const p=round.fighters.player,o=round.fighters.opponent;
    const pHp=Math.max(0,p.hp/p.maxHp*100),oHp=Math.max(0,o.hp/o.maxHp*100);
    document.getElementById("duelPlayerHpBar").style.width=`${pHp}%`;document.getElementById("duelOpponentHpBar").style.width=`${oHp}%`;
    document.getElementById("duelPlayerShieldBar").style.width=`${Math.min(100,p.shield/p.maxHp*100)}%`;document.getElementById("duelOpponentShieldBar").style.width=`${Math.min(100,o.shield/o.maxHp*100)}%`;
    document.getElementById("duelPlayerHpText").textContent=`${Math.ceil(p.hp)}/${Math.ceil(p.maxHp)}${p.shield>0?` +${Math.ceil(p.shield)}🛡`:""}`;
    document.getElementById("duelOpponentHpText").textContent=`${Math.ceil(o.hp)}/${Math.ceil(o.maxHp)}${o.shield>0?` +${Math.ceil(o.shield)}🛡`:""}`;
    document.getElementById("duelRoundScore").textContent=`${match.wins.player} · ${match.wins.opponent}`;
    document.getElementById("duelStageHud").textContent=`${getDuelStageLabel(duelSession.tournament.bracket.length)} · ROUND ${round.number}`;
    const phase=document.getElementById("duelPhaseHud");phase.textContent=round.phase==="NORMAL"?`BEST-OF-3`:round.phase;phase.className=`duelPhaseHud ${round.phase.toLowerCase().replace(" ","-")}`;
    document.getElementById("duelRoundTimer").textContent=round.time<60?Math.max(0,Math.ceil(60-round.time)):"∞";
  }

  function duelFrame(now){
    if(!duelSession?.currentMatch)return;
    const match=duelSession.currentMatch,dt=Math.min(.033,Math.max(0,(now-duelSession.lastFrame)/1000));duelSession.lastFrame=now;
    const round=match.currentRound;
    if(round&&!round.ended&&!match.over)updateDuelRound(match,dt);
    const activeRound=match.currentRound;
    if(activeRound){duelSession.renderer.consume(drainDuelEvents(activeRound));duelSession.renderer.render(match,dt);updateDuelHud();}

    if(activeRound?.ended&&!match.over){
      if(!duelSession.settleAt)duelSession.settleAt=now+1050;
      if(now>=duelSession.settleAt){
        duelSession.settleAt=0;
        const outcome=settleDuelRound(match);
        if(outcome.status==="match_end"){handleDuelMatchEnd();return;}
      }
    }else if(match.over&&!duelSession.handlingMatchEnd){handleDuelMatchEnd();return;}

    duelSession.raf=requestAnimationFrame(duelFrame);
  }

  function handleDuelMatchEnd(){
    if(!duelSession||duelSession.handlingMatchEnd)return;duelSession.handlingMatchEnd=true;stopDuelLoop();
    const match=duelSession.currentMatch,playerWon=match.winner==="player";
    const result=resolveDuelTournamentStage(duelSession.tournament,playerWon,{playerRoundWins:match.wins.player,opponentRoundWins:match.wins.opponent,rng:Math.random});
    setDuelCombatVisible(false);
    if(result.status==="champion"){showDuelResult(true);return;}
    if(result.status==="eliminated"){showDuelResult(false);return;}
    showDuelSkillSelection(false);
  }

  function showDuelResult(champion){
    if(!duelSession)return;
    const t=duelSession.tournament,player=getDuelTournamentPlayer(t);
    document.getElementById("duelResultBadge").textContent=champion?"NHÀ VÔ ĐỊCH":"BỊ LOẠI";
    document.getElementById("duelResultTitle").textContent=champion?"Bạn đã vô địch Đấu Trường!":"Giải đấu kết thúc";
    document.getElementById("duelResultSubtitle").textContent=champion?"Bạn đã vượt qua bracket 64 người và thắng trận chung kết best-of-3.":`Bạn ${getDuelPlacementText(t).toLowerCase()}.`;
    document.getElementById("duelResultStats").innerHTML=`<div><span>Match thắng</span><b>${t.matchWins}</b></div><div><span>Round thắng</span><b>${player.roundWins}</b></div><div><span>Round thua</span><b>${player.roundLosses}</b></div><div><span>Build</span><b>${listDuelBuild(player.build).length} kỹ năng</b></div>`;
    document.getElementById("duelFinalBuild").innerHTML=buildHtml(player.build,{limit:20});
    showScreen("duelResultMenu");
  }

  ensureDuelDom();
  root.openDuelLobby=openDuelLobby;
})();