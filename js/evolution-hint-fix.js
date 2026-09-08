// V0.12.1 clarity hotfix:
// - level-up cards only show a relation hint when THIS pick immediately unlocks
//   a Hợp Đạo Kỹ or Siêu Cấp;
// - detailed missing requirements stay in the left build tracker.

function getEvolutionRequirementSnapshot(evolution,candidateKey=null){
  const parts=[];
  let met=0;
  let total=0;
  const candidateIsNew=Boolean(candidateKey&&skillLevel(candidateKey)<=0);

  if(evolution.requires?.skills){
    for(const key of evolution.requires.skills){
      total++;
      const current=(skillLevel(key)>0||key===candidateKey)?1:0;
      const required=1;
      const ok=current>=required;
      if(ok)met++;
      parts.push({type:"skill",key,current,required,ok,label:skills[key]?.name||key});
    }
  }

  if(evolution.requires?.levels){
    for(const [key,required] of Object.entries(evolution.requires.levels)){
      total++;
      const current=skillLevel(key)+(key===candidateKey?1:0);
      const ok=current>=required;
      if(ok)met++;
      parts.push({type:"level",key,current,required,ok,label:skills[key]?.name||key});
    }
  }

  if(evolution.requires?.tags){
    for(const [tag,required] of Object.entries(evolution.requires.tags)){
      total++;
      let current=getTagCount(tag);
      if(candidateIsNew&&(skills[candidateKey]?.tags||[]).includes(tag))current++;
      const ok=current>=required;
      if(ok)met++;
      parts.push({type:"tag",tag,current,required,ok,label:typeof getTagLabel==="function"?getTagLabel(tag):tag});
    }
  }

  return{met,total,parts,missing:parts.filter(part=>!part.ok)};
}

function getEvolutionCandidateEffect(evolution,key){
  const baseKey=evolution.base;
  const baseBefore=skillLevel(baseKey);
  const baseAfter=baseBefore+(key===baseKey?1:0);
  const baseMax=skills[baseKey].max;
  const before=getEvolutionRequirementSnapshot(evolution);
  const after=getEvolutionRequirementSnapshot(evolution,key);

  const changes=[];
  for(let i=0;i<after.parts.length;i++){
    const previous=before.parts[i];
    const next=after.parts[i];
    if(previous&&next&&next.current>previous.current)changes.push({before:previous,after:next});
  }

  return{
    baseKey,baseBefore,baseAfter,baseMax,before,after,changes,
    baseImproved:baseAfter>baseBefore,
    ready:baseAfter>=baseMax&&after.met===after.total
  };
}

// Level-up cards are intentionally quiet. A colored hint means the offered
// skill is the FINAL piece and choosing it produces the unlock immediately.
getSkillRelationHints=function(key){
  const hints=[];

  if(typeof SYNERGIES!=="undefined"){
    for(const synergy of Object.values(SYNERGIES)){
      if(hasSynergy(synergy.id))continue;
      if(!synergy.requires?.skills?.includes(key))continue;
      const progress=getRequirementProgress(synergy.requires,key);
      if(progress.met===progress.total){
        hints.push({type:"complete",text:`CHỌN → MỞ HỢP ĐẠO KỸ: ${synergy.name}`});
      }
    }
  }

  if(typeof EVOLUTIONS!=="undefined"){
    for(const evolution of Object.values(EVOLUTIONS)){
      if(hasEvolution(evolution.id))continue;
      if(skillLevel(evolution.base)<=0&&evolution.base!==key)continue;
      const effect=getEvolutionCandidateEffect(evolution,key);
      if(effect.ready){
        hints.push({type:"evolution",text:`CHỌN → ĐẠT SIÊU CẤP: ${evolution.name}`});
      }
    }
  }

  return hints.slice(0,2);
};

getNearBuildUnlocks=function(limit=4){
  const results=[];

  if(typeof SYNERGIES!=="undefined"){
    for(const synergy of Object.values(SYNERGIES)){
      if(hasSynergy(synergy.id))continue;
      const progress=getRequirementProgress(synergy.requires);
      const missing=progress.total-progress.met;
      if(progress.met>0&&missing<=1){
        results.push({kind:"synergy",item:synergy,progress,priority:progress.met/progress.total});
      }
    }
  }

  if(typeof EVOLUTIONS!=="undefined"){
    for(const evolution of Object.values(EVOLUTIONS)){
      if(hasEvolution(evolution.id)||skillLevel(evolution.base)<=0)continue;
      const progress=getEvolutionRequirementSnapshot(evolution);
      const baseLevel=skillLevel(evolution.base);
      const baseMax=skills[evolution.base].max;
      const levelRatio=baseLevel/baseMax;
      const missing=progress.total-progress.met;
      if(levelRatio>=.5&&missing<=2){
        results.push({kind:"evolution",item:evolution,progress,baseLevel,baseMax,priority:1+levelRatio});
      }
    }
  }

  return results.sort((a,b)=>b.priority-a.priority).slice(0,limit);
};

function formatTrackerRequirement(part,item){
  if(part.type==="skill")return skills[part.key]?.name||part.key;
  if(part.type==="level"){
    const required=item?.requires?.levels?.[part.key]??part.required??1;
    const current=skillLevel(part.key);
    return `${skills[part.key]?.name||part.key} ${current}/${required}`;
  }
  if(part.type==="tag"){
    const required=item?.requires?.tags?.[part.tag]??part.required??1;
    const current=part.current??getTagCount(part.tag);
    const label=typeof getTagLabel==="function"?getTagLabel(part.tag):part.tag;
    return `${label} ${current}/${required}`;
  }
  return part.label||"";
}

refreshBuildTracker=function(){
  const content=document.getElementById("buildTrackerContent");
  if(!content)return;
  const lines=[];

  for(const synergy of Object.values(SYNERGIES)){
    if(!hasSynergy(synergy.id))continue;
    const desc=typeof localizeGameText==="function"?localizeGameText(synergy.desc):synergy.desc;
    lines.push(`<div class="buildLine unlocked"><span class="buildIcon">${synergy.icon}</span><div><b>${synergy.name}</b><small>HỢP ĐẠO KỸ · ${desc}</small></div></div>`);
  }

  for(const evolution of Object.values(EVOLUTIONS)){
    if(!hasEvolution(evolution.id))continue;
    const desc=typeof localizeGameText==="function"?localizeGameText(evolution.desc):evolution.desc;
    lines.push(`<div class="buildLine evolution"><span class="buildIcon">${evolution.icon}</span><div><b>${evolution.name}</b><small>SIÊU CẤP · ${desc}</small></div></div>`);
  }

  const near=getNearBuildUnlocks(Math.max(0,4-lines.length));
  for(const entry of near){
    if(entry.kind==="evolution"){
      const missing=[];
      const baseName=skills[entry.item.base]?.name||entry.item.base;
      if(entry.baseLevel<entry.baseMax)missing.push(`${baseName} ${entry.baseLevel}/${entry.baseMax}`);
      for(const part of entry.progress.missing)missing.push(formatTrackerRequirement(part,entry.item));
      lines.push(`<div class="buildLine near evolution"><span class="buildIcon">${entry.item.icon}</span><div><b>${entry.item.name}</b><small>GẦN SIÊU CẤP · CÒN THIẾU: ${missing.join(" · ")||"Sẵn sàng"}</small></div></div>`);
    }else{
      const missing=entry.progress.missing.map(part=>formatTrackerRequirement(part,entry.item));
      lines.push(`<div class="buildLine near"><span class="buildIcon">${entry.item.icon}</span><div><b>${entry.item.name}</b><small>GẦN HỢP ĐẠO · CÒN THIẾU: ${missing.join(" · ")||"Sẵn sàng"}</small></div></div>`);
    }
  }

  content.innerHTML=lines.length
    ?lines.slice(0,5).join("")
    :`<div class="buildEmpty">Chưa có liên kết gần hoàn thành. Tiếp tục xây dựng bộ kỹ năng để mở Hợp Đạo Kỹ và Siêu Cấp.</div>`;
};

refreshBuildTracker();
