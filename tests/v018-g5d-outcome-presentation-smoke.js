const fs=require("fs");
const path=require("path");
const assert=require("assert");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const engine=read("js/duel-engine.js");
const renderer=read("js/duel-renderer.js");
const rendererV2=read("js/duel-renderer-v2.js");
const vfx=read("js/duel-vfx-v2.js");
const polish=read("js/duel-ui-polish.js");
const ui=read("js/duel-ui.js");
const css=read("css/v018-ui.css");
const bridge=read("css/v017-duel.css");

// G5D must present existing simulation truth, never invent match/round outcomes.
assert.match(engine,/emitDuelEvent\(round,"round_start",\{round:round\.number\}\)/,'round_start semantic event must remain engine-owned');
assert.match(engine,/emitDuelEvent\(round,"ko",\{side:target\.side,source:meta\.source\|\|"attack",x:target\.x,y:target\.y\}\)/,'KO presentation must use the engine KO event');
assert.match(engine,/emitDuelEvent\(round,"round_end",\{\.\.\.round\.result\}\)/,'round_end presentation must use the engine result object');
assert.match(engine,/round\.result=\{winner:"draw",reason:"DOUBLE_KO"\}/,'double-KO truth must stay in the engine');
assert.match(engine,/round\.result=\{winner:"player",reason:"KO"\}/,'player round-win truth must stay in the engine');
assert.match(engine,/round\.result=\{winner:"opponent",reason:"KO"\}/,'opponent round-win truth must stay in the engine');

// Vector/fallback renderer owns the presentation banner for semantic outcome events.
assert.match(renderer,/event\.type==="round_start"/,'round-start presentation lifetime missing');
assert.match(renderer,/event\.type==="round_end"/,'round-end presentation lifetime missing');
assert.match(renderer,/event\.type==="ko"/,'KO presentation lifetime missing');
assert.match(renderer,/function drawOutcomeEvent\(e,alpha\)/,'outcome presentation renderer missing');
for(const label of ["ROUND ","K.O.","ĐỐI THỦ GỤC","BẠN GỤC","HÒA · ĐẤU LẠI","BẠN THẮNG ROUND","ĐỐI THỦ THẮNG ROUND"]){
  assert.ok(renderer.includes(label),`missing G5D outcome label: ${label}`);
}
assert.match(renderer,/e\.winner==="draw"/,'round-end banner must read winner from semantic event');
assert.match(renderer,/e\.winner==="player"/,'round-end banner must distinguish the semantic player winner');
assert.match(renderer,/e\.side==="opponent"/,'KO banner must read defeated side from semantic event');

// Renderer V2 must continue forwarding these unowned semantic events to fallback presentation.
assert.match(rendererV2,/legacy=vfx\?list\.filter\(event=>!vfx\.ownsEvent\(event\)\):list;fallback\.consume\(legacy\)/,'Renderer V2 must preserve fallback event ownership');
assert.match(vfx,/const OWNED_TYPES=new Set\(\["hit","attack_melee","projectile_spawn","cast","status","heal","shield_gain","area","orbit_hit"\]\)/,'VFX owned-type contract changed unexpectedly');
for(const forbiddenOwned of ["round_start","round_end","ko"]){
  const ownedLine=vfx.match(/const OWNED_TYPES=new Set\(\[[^\]]+\]\)/)?.[0]||"";
  assert.ok(!ownedLine.includes(`"${forbiddenOwned}"`),`${forbiddenOwned} must remain available to G5D fallback presentation`);
}

// Tournament result card is a presentation-only mirror of the already-resolved UI result.
assert.match(ui,/duelResultBadge"\)\.textContent=champion\?"NHÀ VÔ ĐỊCH":"BỊ LOẠI"/,'result badge must remain driven by the existing champion boolean');
assert.match(polish,/label==="NHÀ VÔ ĐỊCH"/,'champion class must mirror the existing result badge');
assert.match(polish,/label==="BỊ LOẠI"/,'eliminated class must mirror the existing result badge');
assert.match(polish,/MutationObserver\(sync\)/,'result presentation must follow badge updates without replacing result logic');
for(const forbidden of ["resolveDuelTournamentStage","settleDuelRound","updateDuelRound","match.winner","round.result"]){
  assert.ok(!polish.includes(forbidden),`presentation helper must not calculate Duel outcomes: ${forbidden}`);
}

for(const selector of [
  ".duelResultCard",
  ".duelResultCard.champion",
  ".duelResultCard.eliminated",
  ".duelResultStats",
  ".duelResultCard .finalBuild",
  ".duelResultCard .resultButtons"
])assert.ok(css.includes(selector),`missing G5D result selector ${selector}`);
assert.match(css,/@media \(max-width:580px\)[\s\S]*\.duelResultStats\{grid-template-columns:1fr 1fr/,'G5D result stats must adapt to mobile');
assert.match(bridge,/v018-ui\.css\?v=018-g5d/,'public Duel stylesheet must bust cache for G5D');
assert.match(renderer,/duel-ui-polish\.js\?v=018-g5d/,'G5D result helper must be included in the public Renderer bootstrap');

console.log("V0.18 G5D outcome/result presentation smoke: PASS");
