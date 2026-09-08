const TAG_LABELS={
  ATTACK:"TẤN CÔNG",PROJECTILE:"ĐẠN",CRITICAL:"CHÍ MẠNG",DAMAGE:"SÁT THƯƠNG",FIRE:"LỬA",ICE:"BĂNG",LIGHTNING:"SÉT",POISON:"ĐỘC",ELEMENTAL:"NGUYÊN TỐ",DOT:"SÁT THƯƠNG DUY TRÌ",SUMMON:"TRIỆU HỒI",DEFENSE:"PHÒNG THỦ",SHIELD:"KHIÊN",HEAL:"HỒI PHỤC",HP:"SINH LỰC",LOW_HP:"NGUY CẤP",CONTROL:"KHỐNG CHẾ",MOVEMENT:"DI CHUYỂN",AURA:"HÀO QUANG",AREA:"PHẠM VI",XP:"KINH NGHIỆM",SCALING:"TĂNG TIẾN",SOUL:"LINH HỒN",HIT:"ĐÁNH TRÚNG",KILL:"HẠ GỤC",MARK:"DẤU ẤN",CHAIN:"LIÊN CHUỖI",CHARGE:"TÍCH NĂNG",DAMAGE_TAKEN:"NHẬN SÁT THƯƠNG",TIME:"THỜI GIAN",PERIODIC:"ĐỊNH KỲ",RANDOM:"NGẪU NHIÊN",RULE:"QUY TẮC",RISK:"MẠO HIỂM",BLOOD:"HUYẾT",EXPLOSION:"BÙNG NỔ",MELEE:"CẬN CHIẾN",REGEN:"HỒI SINH",ELITE:"TINH ANH",DODGE:"NÉ TRÁNH",PIERCE:"XUYÊN THẤU",RICOCHET:"NẢY",REVIVE:"HỒI SINH"
};
function getTagLabel(tag){return TAG_LABELS[tag]||tag;}

const SYSTEM_LABELS={
  synergy:"HỢP ĐẠO KỸ",evolution:"SIÊU CẤP",divine:"THẦN KỸ",mystic:"THẦN BÍ KỸ",
  max:"TỐI ĐA",evolved:"ĐÃ SIÊU CẤP",starter:"KỸ NĂNG KHỞI ĐẦU",levelUp:"LÊN CẤP"
};
function getSystemLabel(key){return SYSTEM_LABELS[key]||key;}

const GAME_TEXT_REPLACEMENTS=[
  [/Crit Chance/gi,"Tỷ lệ chí mạng"],[/Critical Damage/gi,"Sát thương chí mạng"],[/Crit Damage/gi,"Sát thương chí mạng"],[/Crit/gi,"Chí mạng"],
  [/cooldown/gi,"hồi chiêu"],[/Fire/gi,"Lửa"],[/Ice/gi,"Băng"],[/Lightning/gi,"Sét"],[/Poison/gi,"Độc"],[/Shield/gi,"Khiên"],[/XP/gi,"kinh nghiệm"],
  [/multishot/gi,"đa đạn"],[/projectile/gi,"đạn"],[/chain/gi,"liên chuỗi"],[/Elite/gi,"Tinh anh"],[/MAX/g,"TỐI ĐA"],[/EVOLVED/g,"ĐÃ SIÊU CẤP"]
];
function localizeGameText(text){
  let value=String(text??"");
  for(const [pattern,replacement] of GAME_TEXT_REPLACEMENTS)value=value.replace(pattern,replacement);
  return value;
}

function formatTagLabels(tags=[]){return tags.map(getTagLabel);}
