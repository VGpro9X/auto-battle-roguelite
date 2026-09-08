const CODEX_GROUPS=[
  {id:"attack",label:"Tấn công & Đạn",match:tags=>tags.some(t=>["ATTACK","PROJECTILE","CRITICAL","DAMAGE"].includes(t))},
  {id:"element",label:"Nguyên tố",match:tags=>tags.some(t=>["FIRE","ICE","LIGHTNING","POISON","ELEMENTAL","DOT"].includes(t))},
  {id:"summon",label:"Triệu hồi",match:tags=>tags.includes("SUMMON")},
  {id:"defense",label:"Phòng thủ & Hồi phục",match:tags=>tags.some(t=>["DEFENSE","SHIELD","HEAL","HP","LOW_HP"].includes(t))},
  {id:"control",label:"Điều khiển & Di chuyển",match:tags=>tags.some(t=>["CONTROL","MOVEMENT","AURA","AREA"].includes(t))},
  {id:"growth",label:"XP & Tăng trưởng",match:tags=>tags.some(t=>["XP","SCALING","SOUL"].includes(t))},
  {id:"trigger",label:"Trigger & Chuỗi",match:tags=>tags.some(t=>["HIT","KILL","MARK","CHAIN","CHARGE","DAMAGE_TAKEN"].includes(t))},
  {id:"rule",label:"Thời gian & Luật",match:tags=>tags.some(t=>["TIME","PERIODIC","RANDOM","RULE","RISK"].includes(t))}
];

const CODEX_PRIMARY_OVERRIDES={
  fire:"element",lightning:"element",frost:"element",poison:"element",burn:"element",chaosOrb:"element",elementalMastery:"element",
  fireWisp:"summon",stormTotem:"summon",orbit:"summon",summonMastery:"summon",
  barrier:"defense",bloodShield:"defense",shieldPulse:"defense",vampiricTouch:"defense",secondWind:"defense",
  blackHole:"control",knock:"control",speed:"control",phantomStep:"control",lastStand:"control",areaMastery:"control",
  wisdom:"growth",magnet:"growth",xpStorm:"growth",xpHeal:"growth",soulHarvest:"growth",greed:"growth",
  deathMark:"trigger",bountyMark:"trigger",markSpread:"trigger",corpseBurst:"trigger",execution:"trigger",chainMastery:"trigger",
  timeEcho:"rule",overclock:"rule",luckyStar:"rule",sacrifice:"rule",glassCannon:"rule"
};

const codexState={
  active:false,
  rendered:false,
  filter:"all",
  selected:null,
  visibleCanvases:new Set(),
  observer:null,
  raf:0,
  lastTime:0
};

function getSkillPrimaryGroup(key,skill){
  if(CODEX_PRIMARY_OVERRIDES[key])return CODEX_PRIMARY_OVERRIDES[key];
  const tags=skill?.tags||[];
  const precedence=["summon","element","defense","growth","control","trigger","rule","attack"];
  for(const groupId of precedence){
    const group=CODEX_GROUPS.find(g=>g.id===groupId);
    if(group?.match(tags))return groupId;
  }
  return"attack";
}

function codexEntry(kind,key,data,group=null){return{kind,key,data,group};}

function getCodexBaseEntries(){
  return Object.entries(skills).map(([key,skill])=>codexEntry("skill",key,skill,getSkillPrimaryGroup(key,skill)));
}

function getCodexSynergyEntries(){return Object.entries(SYNERGIES).map(([key,item])=>codexEntry("synergy",key,item,"synergy"));}
function getCodexEvolutionEntries(){return Object.entries(EVOLUTIONS).map(([key,item])=>codexEntry("evolution",key,item,"evolution"));}

function getCodexEntryId(entry){return`${entry.kind}:${entry.key}`;}

function formatCodexRequirements(item,kind){
  const req=item?.requires||{};
  const pieces=[];
  if(kind==="evolution"&&item.base){pieces.push(`Base: ${skills[item.base]?.name||item.base} MAX`);}
  for(const key of req.skills||[])pieces.push(skills[key]?.name||key);
  for(const [key,level] of Object.entries(req.levels||{}))pieces.push(`${skills[key]?.name||key} Lv.${level}`);
  for(const [tag,count] of Object.entries(req.tags||{}))pieces.push(`${tag} ×${count}`);
  return pieces;
}

function getCodexRelated(entry){
  if(entry.kind==="synergy")return(entry.data.requires?.skills||[]).map(key=>skills[key]?.name||key);
  if(entry.kind==="evolution"){
    const list=[skills[entry.data.base]?.name||entry.data.base];
    return list.concat(formatCodexRequirements(entry.data,"evolution").slice(1));
  }
  const related=[];
  for(const synergy of Object.values(SYNERGIES))if(synergy.requires?.skills?.includes(entry.key))related.push(`Synergy: ${synergy.name}`);
  const evo=Object.values(EVOLUTIONS).find(e=>e.base===entry.key);
  if(evo)related.push(`Evolution: ${evo.name}`);
  return related.slice(0,6);
}

function codexTypeLabel(entry){
  if(entry.kind==="synergy")return"SYNERGY";
  if(entry.kind==="evolution")return"EVOLUTION";
  return CODEX_GROUPS.find(g=>g.id===entry.group)?.label||"KỸ NĂNG";
}

function renderCodexTabs(){
  const tabs=document.getElementById("codexTabs");
  if(!tabs)return;
  const all=[
    {id:"all",label:"Tất cả"},
    {id:"synergy",label:`Synergy ${Object.keys(SYNERGIES).length}`},
    {id:"evolution",label:`Evolution ${Object.keys(EVOLUTIONS).length}`},
    ...CODEX_GROUPS.map(group=>({id:group.id,label:group.label}))
  ];
  tabs.innerHTML=all.map(tab=>`<button class="codexTab${codexState.filter===tab.id?" active":""}" data-codex-filter="${tab.id}">${tab.label}</button>`).join("");
  for(const button of tabs.querySelectorAll("[data-codex-filter]"))button.addEventListener("click",()=>{
    codexState.filter=button.dataset.codexFilter;
    renderSkillCodexCatalog();
    renderCodexTabs();
  });
}

function makeCodexCard(entry){
  const button=document.createElement("button");
  button.className=`codexSkillCard ${entry.kind}`;
  button.dataset.codexId=getCodexEntryId(entry);
  button.innerHTML=`
    <canvas class="codexPreview" width="144" height="92" aria-hidden="true"></canvas>
    <div class="codexCardMeta">
      <span class="codexCardType">${codexTypeLabel(entry)}</span>
      <b>${entry.data.icon?`${entry.data.icon} `:""}${entry.data.name}</b>
    </div>
  `;
  button.addEventListener("mouseenter",()=>selectCodexEntry(entry,false));
  button.addEventListener("focus",()=>selectCodexEntry(entry,false));
  button.addEventListener("click",()=>selectCodexEntry(entry,true));
  const canvas=button.querySelector("canvas");
  canvas.__codexEntry=entry;
  return button;
}

function createCodexSection(title,entries,accent=""){
  if(!entries.length)return null;
  const section=document.createElement("section");
  section.className=`codexSection ${accent}`;
  section.innerHTML=`<div class="codexSectionHeader"><div><span>${accent==="synergy"?"ƯU TIÊN":accent==="evolution"?"POWER SPIKE":"NHÓM KỸ NĂNG"}</span><h3>${title}</h3></div><small>${entries.length} mục</small></div><div class="codexGrid"></div>`;
  const grid=section.querySelector(".codexGrid");
  for(const entry of entries)grid.appendChild(makeCodexCard(entry));
  return section;
}

function renderSkillCodexCatalog(){
  const catalog=document.getElementById("codexCatalog");
  if(!catalog)return;
  catalog.innerHTML="";
  codexState.visibleCanvases.clear();
  if(codexState.observer)codexState.observer.disconnect();

  const filter=codexState.filter;
  const synergies=getCodexSynergyEntries();
  const evolutions=getCodexEvolutionEntries();
  const base=getCodexBaseEntries();

  if(filter==="all"||filter==="synergy"){
    const section=createCodexSection("Synergy",synergies,"synergy");
    if(section)catalog.appendChild(section);
  }
  if(filter==="all"||filter==="evolution"){
    const section=createCodexSection("Evolution",evolutions,"evolution");
    if(section)catalog.appendChild(section);
  }
  for(const group of CODEX_GROUPS){
    if(filter!=="all"&&filter!==group.id)continue;
    const entries=base.filter(entry=>entry.group===group.id);
    const section=createCodexSection(group.label,entries,group.id);
    if(section)catalog.appendChild(section);
  }

  const cards=[...catalog.querySelectorAll(".codexSkillCard")];
  document.getElementById("codexCount").textContent=`${cards.length} mục đang hiển thị`;
  observeCodexCanvases();

  const selectedId=codexState.selected?getCodexEntryId(codexState.selected):"";
  const selectedStillVisible=cards.some(card=>card.dataset.codexId===selectedId);
  if(!codexState.selected||!selectedStillVisible){
    const first=cards[0];
    if(first){
      const id=first.dataset.codexId;
      const [kind,...rest]=id.split(":");
      const key=rest.join(":");
      const entry=kind==="skill"?getCodexBaseEntries().find(e=>e.key===key):kind==="synergy"?getCodexSynergyEntries().find(e=>e.key===key):getCodexEvolutionEntries().find(e=>e.key===key);
      if(entry)selectCodexEntry(entry,false);
    }
  }else{
    updateCodexSelectionClasses();
  }
}

function observeCodexCanvases(){
  const root=document.getElementById("codexCatalogScroll");
  const canvases=[...document.querySelectorAll(".codexPreview")];
  if(typeof IntersectionObserver==="undefined"){
    for(const canvas of canvases)codexState.visibleCanvases.add(canvas);
    return;
  }
  codexState.observer=new IntersectionObserver(entries=>{
    for(const entry of entries){
      if(entry.isIntersecting)codexState.visibleCanvases.add(entry.target);
      else codexState.visibleCanvases.delete(entry.target);
    }
  },{root,rootMargin:"80px"});
  for(const canvas of canvases)codexState.observer.observe(canvas);
}

function selectCodexEntry(entry,locked=false){
  codexState.selected=entry;
  renderCodexDetail(entry);
  updateCodexSelectionClasses();
}

function updateCodexSelectionClasses(){
  const selected=codexState.selected?getCodexEntryId(codexState.selected):"";
  for(const card of document.querySelectorAll(".codexSkillCard"))card.classList.toggle("selected",card.dataset.codexId===selected);
}

function renderCodexDetail(entry){
  const root=document.getElementById("codexDetailContent");
  if(!root||!entry)return;
  const tags=entry.kind==="skill"?(entry.data.tags||[]):[];
  const requirements=entry.kind==="skill"?[]:formatCodexRequirements(entry.data,entry.kind);
  const related=getCodexRelated(entry);
  let desc="";
  if(entry.kind==="skill"){
    try{desc=entry.data.desc(Math.max(1,entry.data.max||1));}catch{desc="";}
  }else desc=entry.data.desc||"";

  root.innerHTML=`
    <div class="codexDetailEyebrow">${codexTypeLabel(entry)}</div>
    <h3>${entry.data.icon?`${entry.data.icon} `:""}${entry.data.name}</h3>
    ${entry.kind==="skill"?`<div class="codexDetailLevel">Cấp tối đa ${entry.data.max}</div>`:""}
    ${tags.length?`<div class="codexDetailTags">${tags.map(tag=>`<span class="tagChip">${tag}</span>`).join("")}</div>`:""}
    <p>${desc}</p>
    ${requirements.length?`<div class="codexInfoBlock"><b>Điều kiện</b><div>${requirements.map(item=>`<span>${item}</span>`).join("")}</div></div>`:""}
    ${related.length?`<div class="codexInfoBlock"><b>Liên kết</b><div>${related.map(item=>`<span>${item}</span>`).join("")}</div></div>`:""}
    <small class="codexDetailNote">Preview dùng cùng visual primitive với trận đấu. VFX sẽ tiếp tục được nâng cấp ở Visual Pass.</small>
  `;
  const detailCanvas=document.getElementById("codexDetailCanvas");
  if(detailCanvas)detailCanvas.__codexEntry=entry;
}

function renderSkillCodex(){
  if(!document.getElementById("skillCodexMenu"))return;
  renderCodexTabs();
  renderSkillCodexCatalog();
  codexState.rendered=true;
}

function setSkillCodexActive(active){
  codexState.active=Boolean(active);
  if(codexState.active&&!codexState.rendered)renderSkillCodex();
  if(codexState.active&&!codexState.raf)codexState.raf=requestAnimationFrame(animateSkillCodex);
}

function animateSkillCodex(now){
  codexState.raf=0;
  if(!codexState.active)return;
  const time=now/1000;
  for(const canvas of codexState.visibleCanvases){
    if(!canvas.isConnected||!canvas.__codexEntry)continue;
    const g=canvas.getContext("2d");
    const entry=canvas.__codexEntry;
    drawCodexPreview(g,entry.kind,entry.key,entry.data,time,canvas.width,canvas.height);
  }
  const detail=document.getElementById("codexDetailCanvas");
  if(detail?.__codexEntry){
    const entry=detail.__codexEntry;
    drawCodexPreview(detail.getContext("2d"),entry.kind,entry.key,entry.data,time,detail.width,detail.height);
  }
  codexState.raf=requestAnimationFrame(animateSkillCodex);
}
