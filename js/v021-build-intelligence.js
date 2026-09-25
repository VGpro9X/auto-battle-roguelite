// V0.21 — Build Intelligence & Choice Clarity
// Presentation/readability only: no combat, probability, acquisition, AI or balance truth changes.
(()=>{
  const root=typeof window!=="undefined"?window:globalThis;

  function v021OwnedSkillKeys(){
    return typeof getOwnedSkillKeys==="function"?getOwnedSkillKeys():Object.keys(typeof owned!=="undefined"?owned:{}).filter(key=>(owned[key]||0)>0);
  }

  function v021LabelTag(tag){
    if(typeof getTagLabel==="function")return getTagLabel(tag);
    return String(tag||"").replaceAll("_"," ");
  }

  function v021BuildSnapshot(){
    const keys=v021OwnedSkillKeys();
    const tagCounts={};
    let maxed=0;
    for(const key of keys){
      const skill=typeof skills!=="undefined"?skills[key]:null;
      if(!skill)continue;
      if(typeof skillLevel==="function"&&skillLevel(key)>=skill.max)maxed++;
      for(const tag of new Set(skill.tags||[]))tagCounts[tag]=(tagCounts[tag]||0)+1;
    }

    const synergies=typeof SYNERGIES!=="undefined"&&typeof hasSynergy==="function"
      ?Object.values(SYNERGIES).filter(item=>hasSynergy(item.id)).length:0;
    const evolutions=typeof EVOLUTIONS!=="undefined"&&typeof hasEvolution==="function"
      ?Object.values(EVOLUTIONS).filter(item=>hasEvolution(item.id)).length:0;

    let divine=0,mystic=0;
    if(typeof DIVINE_SKILLS!=="undefined"&&typeof getOwnedDivineSkillIds==="function"){
      for(const id of getOwnedDivineSkillIds()){
        const tier=DIVINE_SKILLS[id]?.tier;
        if(tier==="mystic")mystic++;else divine++;
      }
    }

    const topTags=Object.entries(tagCounts)
      .sort((a,b)=>b[1]-a[1]||v021LabelTag(a[0]).localeCompare(v021LabelTag(b[0]),"vi"))
      .slice(0,3)
      .map(([tag,count])=>({tag,label:v021LabelTag(tag),count}));

    return{skills:keys.length,maxed,synergies,evolutions,divine,mystic,tagCounts,topTags};
  }

  function v021NearUnlocks(){
    if(typeof getNearBuildUnlocks!=="function")return[];
    return getNearBuildUnlocks(3).map(entry=>{
      const progress=entry.progress||{met:0,total:0,missing:[]};
      const missing=(progress.missing||[]).map(item=>item.label).join(" + ")||"Sẵn sàng";
      let extra="";
      if(entry.kind==="evolution"&&entry.item?.base&&typeof skillLevel==="function"&&typeof skills!=="undefined"&&skills[entry.item.base]){
        extra=` · ${skills[entry.item.base].name} ${skillLevel(entry.item.base)}/${skills[entry.item.base].max}`;
      }
      return{kind:entry.kind,name:entry.item?.name||"Liên kết",met:progress.met||0,total:progress.total||0,missing,extra};
    });
  }

  function v021SummaryMarkup(snapshot){
    const rareTotal=snapshot.divine+snapshot.mystic;
    const tags=snapshot.topTags.length
      ?snapshot.topTags.map(item=>`<span class="v021TagPill">${item.label}<b>${item.count}</b></span>`).join("")
      :`<span class="v021TagEmpty">Chưa hình thành hướng thuộc tính</span>`;
    return `<section class="v021BuildSummary" aria-label="Tóm tắt bộ kỹ năng">
      <div class="v021BuildStats">
        <span><b>${snapshot.skills}</b>Kỹ Năng</span>
        <span><b>${snapshot.synergies}</b>Hợp Đạo</span>
        <span><b>${snapshot.evolutions}</b>Siêu Cấp</span>
        <span><b>${rareTotal}</b>Rare</span>
      </div>
      <div class="v021BuildTags"><small>THUỘC TÍNH NỔI BẬT</small><div>${tags}</div></div>
    </section>`;
  }

  function v021ProgressMarkup(){
    const near=v021NearUnlocks();
    if(!near.length)return `<section class="v021BuildProgress"><div class="v021ProgressEmpty">Chưa có liên kết gần hoàn thành. Tiếp tục mở rộng bộ kỹ năng để tạo lộ trình Hợp Đạo/Siêu Cấp.</div></section>`;
    return `<section class="v021BuildProgress" aria-label="Tiến độ liên kết gần nhất">${near.map(entry=>{
      const type=entry.kind==="evolution"?"SIÊU CẤP":"HỢP ĐẠO";
      const ratio=entry.total>0?`${entry.met}/${entry.total}`:"—";
      return `<div class="v021ProgressLine ${entry.kind}"><div><span>${type}</span><b>${entry.name}</b></div><strong>${ratio}</strong><small>Thiếu ${entry.missing}${entry.extra}</small></div>`;
    }).join("")}</section>`;
  }

  function v021EnhanceBuildTracker(){
    const content=document.getElementById("buildTrackerContent");
    if(!content)return;
    content.querySelectorAll(".v021BuildSummary,.v021BuildProgress").forEach(node=>node.remove());
    const snapshot=v021BuildSnapshot();
    content.insertAdjacentHTML("afterbegin",v021SummaryMarkup(snapshot)+v021ProgressMarkup());
  }

  if(typeof refreshBuildTracker==="function"){
    const baseRefreshBuildTracker=refreshBuildTracker;
    refreshBuildTracker=function(){
      const result=baseRefreshBuildTracker.apply(this,arguments);
      v021EnhanceBuildTracker();
      return result;
    };
  }

  function v021FindSkillByName(name){
    if(typeof skills==="undefined")return null;
    for(const [key,item] of Object.entries(skills))if(item?.name===name)return{key,item};
    return null;
  }

  function v021FindRareByName(name){
    if(typeof DIVINE_SKILLS==="undefined")return null;
    for(const [key,item] of Object.entries(DIVINE_SKILLS))if(item?.name===name)return{key,item};
    return null;
  }

  function v021ChoiceBadge(card,name,snapshot){
    const skillEntry=v021FindSkillByName(name);
    if(skillEntry){
      const current=typeof skillLevel==="function"?skillLevel(skillEntry.key):0;
      const next=current+1;
      const immediateSynergy=Boolean(card.querySelector(".relationHint.complete"));
      const immediateEvolution=Boolean(card.querySelector(".relationHint.evolution:not(.evolution-near)"));
      const shared=(skillEntry.item.tags||[]).filter(tag=>(snapshot.tagCounts[tag]||0)>0).length;
      let primary=current>0?`NÂNG CẤP ${current}→${next}`:"KỸ NĂNG MỚI";
      let tone=current>0?"upgrade":"new";
      if(next>=skillEntry.item.max){primary="SẮP TỐI ĐA";tone="max";}
      if(immediateSynergy){primary="MỞ HỢP ĐẠO";tone="unlock";}
      if(immediateEvolution){primary="MỞ SIÊU CẤP";tone="evolution";}
      return{primary,tone,secondary:shared>0?`${shared} thuộc tính đã có`:"Mở hướng mới"};
    }

    const rareEntry=v021FindRareByName(name);
    if(rareEntry){
      const mystic=rareEntry.item?.tier==="mystic";
      return{primary:mystic?"THẦN BÍ KỸ":"THẦN KỸ",tone:mystic?"mystic":"divine",secondary:"Luật hiếm · chọn một lần"};
    }
    return null;
  }

  function v021ChoiceContextMarkup(snapshot){
    const tagText=snapshot.topTags.length?snapshot.topTags.map(item=>`${item.label} ${item.count}`).join(" · "):"chưa có thuộc tính nổi bật";
    const rareText=snapshot.divine+snapshot.mystic?` · Rare ${snapshot.divine+snapshot.mystic}`:"";
    return `<div class="v021ChoiceContextMain"><span>BỘ HIỆN TẠI</span><b>${snapshot.skills} Kỹ Năng · ${snapshot.synergies} Hợp Đạo · ${snapshot.evolutions} Siêu Cấp${rareText}</b></div><div class="v021ChoiceContextTags">${tagText}</div>`;
  }

  function v021AnnotateChoices(){
    const choices=document.getElementById("choices");
    if(!choices)return;
    const snapshot=v021BuildSnapshot();
    const modal=document.getElementById("levelModal");
    let context=document.getElementById("v021ChoiceContext");
    if(!context&&modal){
      context=document.createElement("div");
      context.id="v021ChoiceContext";
      context.className="v021ChoiceContext";
      choices.insertAdjacentElement("beforebegin",context);
    }
    if(context)context.innerHTML=v021ChoiceContextMarkup(snapshot);

    for(const card of choices.querySelectorAll(".choice")){
      card.querySelectorAll(":scope > .v021ChoiceMeta").forEach(node=>node.remove());
      const name=card.querySelector("h3")?.textContent?.trim();
      if(!name)continue;
      const badge=v021ChoiceBadge(card,name,snapshot);
      if(!badge)continue;
      const meta=document.createElement("div");
      meta.className="v021ChoiceMeta";
      meta.innerHTML=`<span class="v021ChoiceBadge ${badge.tone}">${badge.primary}</span><small>${badge.secondary}</small>`;
      card.prepend(meta);
    }
  }

  const choices=document.getElementById("choices");
  if(choices&&typeof MutationObserver!=="undefined"){
    const observer=new MutationObserver(()=>queueMicrotask(v021AnnotateChoices));
    observer.observe(choices,{childList:true});
  }

  if(typeof onSkillEvent==="function")onSkillEvent("skill_selected",()=>queueMicrotask(()=>{v021EnhanceBuildTracker();v021AnnotateChoices();}));

  root.getV021BuildSnapshot=v021BuildSnapshot;
  root.refreshV021BuildIntelligence=()=>{v021EnhanceBuildTracker();v021AnnotateChoices();};
  queueMicrotask(root.refreshV021BuildIntelligence);
})();
