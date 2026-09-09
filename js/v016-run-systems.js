// V0.16 run-system polish: one reroll per choice screen + cross-platform icon fallbacks.
// UI/presentation only. Rare probability itself is defined in divine-skills.js.

(()=>{
  // Modern Symbols and Pictographs Extended-A emoji are still missing on some
  // Windows/Android font stacks. Replace known gameplay icons with stable symbols,
  // then fall back any remaining U+1FA70..U+1FAFF glyph to ◆.
  const iconFallbacks=new Map([
    ["🪡","➤"], // Xuyên Phá
    ["🪙","●"], // Tham Lam
    ["🪢","⛓"], // Trói Hồn
    ["🪃","↩"], // Hồi Phong Nhận
    ["🪵","▣"], // Hộ Pháp Mộc Nhân
    ["🪞","◇"], // Hàn Kính
    ["🪽","✦"]  // Hồi Quang / wing-like identity
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

  function normalizeIconCollection(collection){
    if(!collection)return;
    for(const item of Object.values(collection))if(item?.icon)item.icon=compatibleIcon(item.icon);
  }

  normalizeIconCollection(typeof skills!=="undefined"?skills:null);
  normalizeIconCollection(typeof SYNERGIES!=="undefined"?SYNERGIES:null);
  normalizeIconCollection(typeof EVOLUTIONS!=="undefined"?EVOLUTIONS:null);
  normalizeIconCollection(typeof DIVINE_SKILLS!=="undefined"?DIVINE_SKILLS:null);

  // One reroll for every individual starter/level-up choice screen.
  const levelModal=document.getElementById("levelModal");
  const choices=document.getElementById("choices");
  if(typeof showLevelUp!=="function"||!levelModal||!choices)return;

  const rerollButton=document.createElement("button");
  rerollButton.id="rerollChoicesButton";
  rerollButton.type="button";
  rerollButton.className="secondary";
  rerollButton.style.width="100%";
  rerollButton.style.marginTop="12px";
  rerollButton.style.minHeight="44px";
  rerollButton.textContent="↻ XOAY LẠI · 1 LẦN";
  choices.insertAdjacentElement("afterend",rerollButton);

  let rerollUsed=false;
  let currentStarter=false;
  const baseShowLevelUp=showLevelUp;

  function formatChance(){
    if(typeof getDivineOfferChance!=="function")return"0";
    const value=getDivineOfferChance()*100;
    return Number(value.toFixed(2)).toString().replace(".",",");
  }

  function syncRerollUi(){
    rerollButton.disabled=rerollUsed;
    rerollButton.style.opacity=rerollUsed?".48":"1";
    rerollButton.style.cursor=rerollUsed?"default":"pointer";
    rerollButton.textContent=rerollUsed?"↻ ĐÃ DÙNG LƯỢT XOAY":"↻ XOAY LẠI · 1 LẦN";

    const description=document.getElementById("skillPickDescription");
    if(!description)return;
    if(currentStarter){
      description.textContent+=` · Bạn có 1 lần XOAY LẠI cho lượt chọn này.`;
    }else{
      description.textContent+=` · Cơ hội xuất hiện Thần Kỹ/Thần Bí Kỹ ở cấp ${player.level}: ${formatChance()}%. XOAY LẠI sẽ roll mới cả 3 lựa chọn và cơ hội rare.`;
    }
  }

  showLevelUp=function(isStarter=false){
    currentStarter=Boolean(isStarter);
    rerollUsed=false;
    const result=baseShowLevelUp(isStarter);
    if(levelModal.classList.contains("visible"))syncRerollUi();
    return result;
  };

  rerollButton.addEventListener("click",()=>{
    if(rerollUsed||!state.running||state.gameOver||!levelModal.classList.contains("visible"))return;
    rerollUsed=true;
    // Call the original renderer directly so this remains the same choice screen
    // and cannot refresh the one-reroll allowance.
    baseShowLevelUp(currentStarter);
    if(levelModal.classList.contains("visible"))syncRerollUi();
  });

  // Keep the exact public probability rule discoverable outside the level-up modal.
  const howTo=document.querySelector("#howToMenu .howToList");
  if(howTo&&!document.getElementById("v016RareHowTo")){
    const rare=document.createElement("p");
    rare.id="v016RareHowTo";
    rare.innerHTML=`<b>9.</b> Thần Kỹ/Thần Bí Kỹ không còn giới hạn 1 kỹ năng mỗi lượt chơi. Từ cấp 8, mỗi lần mở lựa chọn có 1% cơ hội xuất hiện một rare chưa sở hữu; mỗi cấp sau tăng 0,35 điểm %, tối đa 12%.`;
    const reroll=document.createElement("p");
    reroll.innerHTML=`<b>10.</b> Mỗi màn lựa chọn kỹ năng có đúng 1 lần XOAY LẠI. Lượt xoay không cộng dồn và thực hiện lại cả ba lựa chọn lẫn roll Thần Kỹ/Thần Bí Kỹ.`;
    howTo.append(rare,reroll);
  }
})();
