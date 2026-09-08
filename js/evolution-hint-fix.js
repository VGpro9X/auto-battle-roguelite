// V0.10 hotfix: only show evolution hints when the offered skill
// actually advances the evolution, and make tracker progress explicit.

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
      parts.push({type:"level",key,current,required,ok,label:`${skills[key]?.name||key} ${current}/${required}`});
    }
  }

  if(evolution.requires?.tags){
    for(const [tag,required] of Object.entries(evolution.requires.tags)){
      total++;
      let current=getTagCount(tag);
      if(candidateIsNew&&(skills[candidateKey]?.tags||[]).includes(tag))current++;
      const ok=current>=required;
      if(ok)met++;
      parts.push({type:"tag",tag,current,required,ok,label:`${tag} ${current}/${required}`});
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

  const baseImproved=baseAfter>baseBefore;
  const ready=baseAfter>=baseMax&&after.met===after.total;

  return{
    baseKey,baseBefore,baseAfter,baseMax,
    before,after,changes,baseImproved,ready,
    contributes:baseImproved||changes.length>0
  };
}

function formatEvolutionCandidateEffect(effect){
  if(effect.baseImproved){
    return `${skills[effect.baseKey].name} ${effect.baseBefore}/${effect.baseMax}→${effect.baseAfter}/${effect.baseMax}`;
  }

  const change=effect.changes[0];
  if(!change)return"";

  const before=change.before;
  const after=change.after;
  if(after.type==="tag")return `${after.tag} ${before.current}/${after.required}→${after.current}/${after.required}`;
  if(after.type==="level")return `${skills[after.key]?.name||after.key} ${before.current}/${after.required}→${after.current}/${after.required}`;
  return skills[after.key]?.name||after.key||"";
}

getSkillRelationHints=function(key){
  const hints=[];

  if(typeof SYNERGIES!=="undefined"){
    for(const synergy of Object.values(SYNERGIES)){
      if(hasSynergy(synergy.id))continue;
      if(!synergy.requires?.skills?.includes(key))continue;

      const progress=getRequirementProgress(synergy.requires,key);
      if(progress.met===progress.total){
        hints.push({type:"complete",text:`MỞ SYNERGY → ${synergy.name}`});
      }else if(progress.total-progress.met<=1){
        hints.push({type:"near",text:`KẾT HỢP → ${synergy.name}`});
      }
    }
  }

  if(typeof EVOLUTIONS!=="undefined"){
    for(const evolution of Object.values(EVOLUTIONS)){
      if(hasEvolution(evolution.id))continue;
      if(skillLevel(evolution.base)<=0&&evolution.base!==key)continue;

      const effect=getEvolutionCandidateEffect(evolution,key);
      if(!effect.contributes)continue;

      if(effect.ready){
        hints.push({type:"evolution",text:`TIẾN HÓA → ${evolution.name}`});
        continue;
      }

      // Do not advertise a distant evolution on the first few levels of its
      // base skill unless this pick also fixes another concrete requirement.
      if(key===evolution.base&&effect.baseAfter<Math.ceil(effect.baseMax*.5)&&effect.changes.length===0)continue;

      const contribution=formatEvolutionCandidateEffect(effect);
      hints.push({
        type:"evolution-near",
        text:`HỖ TRỢ EVOLVE → ${evolution.name}${contribution?` · ${contribution}`:""}`
      });
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
        results.push({
          kind:"evolution",
          item:evolution,
          progress,
          baseLevel,
          baseMax,
          priority:1+levelRatio
        });
      }
    }
  }

  return results.sort((a,b)=>b.priority-a.priority).slice(0,limit);
};

refreshBuildTracker=function(){
  const content=document.getElementById("buildTrackerContent");
  if(!content)return;

  const lines=[];

  for(const synergy of Object.values(SYNERGIES)){
    if(!hasSynergy(synergy.id))continue;
    lines.push(`<div class="buildLine unlocked"><span class="buildIcon">${synergy.icon}</span><div><b>${synergy.name}</b><small>SYNERGY · ${synergy.desc}</small></div></div>`);
  }

  for(const evolution of Object.values(EVOLUTIONS)){
    if(!hasEvolution(evolution.id))continue;
    lines.push(`<div class="buildLine evolution"><span class="buildIcon">${evolution.icon}</span><div><b>${evolution.name}</b><small>EVOLUTION · ${evolution.desc}</small></div></div>`);
  }

  const near=getNearBuildUnlocks(Math.max(0,4-lines.length));

  for(const entry of near){
    if(entry.kind==="evolution"){
      const baseName=skills[entry.item.base]?.name||entry.item.base;
      const requirements=entry.progress.parts.map(part=>{
        if(part.type==="tag")return `${part.tag} ${part.current}/${part.required}`;
        if(part.type==="level")return `${skills[part.key]?.name||part.key} ${part.current}/${part.required}`;
        if(part.type==="skill")return `${skills[part.key]?.name||part.key} ${part.ok?"✓":"✗"}`;
        return part.label;
      }).join(" · ");

      lines.push(`<div class="buildLine near evolution"><span class="buildIcon">${entry.item.icon}</span><div><b>${entry.item.name}</b><small>EVOLVE GẦN · ${baseName} ${entry.baseLevel}/${entry.baseMax}${requirements?` · ${requirements}`:""}</small></div></div>`);
    }else{
      const missing=entry.progress.missing.map(part=>part.label).join(" + ")||"Sẵn sàng";
      lines.push(`<div class="buildLine near"><span class="buildIcon">${entry.item.icon}</span><div><b>${entry.item.name}</b><small>COMBO GẦN · thiếu ${missing}</small></div></div>`);
    }
  }

  content.innerHTML=lines.length
    ?lines.slice(0,5).join("")
    :`<div class="buildEmpty">Chưa có combo. Chọn các skill có tag hoặc gợi ý liên kết trùng nhau để hình thành synergy.</div>`;
};

refreshBuildTracker();
