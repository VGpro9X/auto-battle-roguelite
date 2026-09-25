const fs=require("fs");
const vm=require("vm");
const assert=require("assert");
const read=file=>fs.readFileSync(file,"utf8");

const icons=read("js/v020-icons.js");
const html=read("index.html");
const ui=read("js/ui.js");
const codex=read("js/skill-codex.js");
const duel=read("js/duel-ui-v020.js");
const css=read("css/v020-ui-hud.css");

assert(html.includes('js/v020-icons.js?v=020-b11a'),"B11A icon runtime is not wired into public shell");
assert(html.indexOf('js/v020-icons.js?v=020-b11a')<html.indexOf('js/ui.js'),"B11A icon runtime must load before Survival UI");
assert.match(html,/<title>Auto Battle Roguelite V0\.(?:19|20|21)<\/title>/,"public label must be V0.19 candidate, V0.20 release or V0.21 release");

const context={};
context.globalThis=context;
vm.createContext(context);
vm.runInContext(icons,context,{filename:"js/v020-icons.js"});
assert.strictEqual(typeof context.getV020IconMarkup,"function","icon markup helper missing");
assert.strictEqual(typeof context.getV020IconDescriptor,"function","icon descriptor helper missing");
assert(Array.isArray(context.V020_ICON_FAMILIES),"icon family registry missing");
assert(context.V020_ICON_FAMILIES.length>=15,"semantic icon family coverage too small");

const fixtures=[
  ["skill","fire",{name:"Hỏa Cầu",tags:["FIRE","PROJECTILE"]},"fire","base"],
  ["skill","frost",{name:"Hàn Khí",tags:["ICE","CONTROL"]},"frost","base"],
  ["skill","lightning",{name:"Lôi Kích",tags:["LIGHTNING"]},"lightning","base"],
  ["synergy","thunderStride",{name:"Phong Lôi Bộ",tags:["LIGHTNING","MOVEMENT"]},"lightning","synergy"],
  ["evolution","heavenNet",{name:"Thiên La Địa Võng",tags:["AREA","CONTROL"]},"control","evolution"],
  ["rare","rare-probe",{name:"Rare Probe",tier:"rare",tags:["SOUL"]},"soul","rare"],
  ["divine","immortalBreath",{name:"Bất Tử Nhất Tức",tier:"divine"},"heal","divine"],
  ["mystic","fateExchange",{name:"Đổi Mệnh",tier:"mystic",tags:["MARK"]},"mark","mystic"]
];
for(const [kind,id,item,family,tier] of fixtures){
  const descriptor=context.getV020IconDescriptor(kind,id,item);
  assert.strictEqual(descriptor.family,family,id+" semantic family mismatch");
  assert.strictEqual(descriptor.tier,tier,id+" tier frame mismatch");
  const a=context.getV020IconMarkup(kind,id,item,{size:"lg"});
  const b=context.getV020IconMarkup(kind,id,item,{size:"lg"});
  assert.strictEqual(a,b,id+" icon output must be deterministic");
  assert(a.includes("<svg")&&a.includes("v20Icon--"+family)&&a.includes("v20Icon--"+tier),id+" SVG markup missing semantic classes");
  assert(!/[😀-🙏]/u.test(a),id+" runtime icon unexpectedly depends on pictographic emoji");
}

assert(ui.includes("uiV20Icon("),"Survival UI icon bridge missing");
assert(codex.includes("codexV20Icon("),"Codex icon bridge missing");
assert(duel.includes("duelV20Icon("),"Duel icon bridge missing");
for(const token of [".v20Icon--fire",".v20Icon--frost",".v20Icon--lightning",".v20Icon--divine",".v20Icon--mystic"]){
  assert(css.includes(token),"B11A icon styling missing "+token);
}
for(const forbidden of ["player.","state.","hitEnemy(","damagePlayer(","grantDivineSkill(","addDuelSkillRank("]){
  assert(!icons.includes(forbidden),"icon runtime must remain presentation-only: "+forbidden);
}

console.log("v020-b11-icon-runtime-smoke: ok · deterministic SVG icons · Survival/Codex/Duel bridges wired");