const fs=require("fs");
const path=require("path");
const assert=require("assert");
const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const html=read("index.html");
const bridge=read("css/v017-duel.css");
const shared=read("css/v020-ui-hud.css");
const duel=read("css/v020-duel-ui.css");
const duelUi=read("js/duel-ui-v020.js");

assert.match(bridge,/v020-ui-hud\.css\?v=020-b10a/,'B10A shared shell import missing');
assert.match(bridge,/v020-duel-ui\.css\?v=020-b10b/,'B10B Duel UI import missing');
for(const id of ["mainMenu","modeMenu","skillCodexMenu","settingsMenu","howToMenu","pauseMenu","levelModal","resultModal","gameUi","buildTracker"]){
  assert.ok(html.includes(`id="${id}"`),`B10C required public surface missing: ${id}`);
}
for(const marker of ["duelLobbyMenu","duelPreMatchMenu","duelSkillModal","duelResultMenu","duelCombatRoot"]){
  assert.ok(duelUi.includes(marker),`B10C Duel surface missing: ${marker}`);
}
for(const selector of [".heroCard",".modeCard",".stats",".choice",".codexCard",".codexDetail",".resultCard",".buildTracker"]){
  assert.ok(shared.includes(selector),`B10C shared V3 surface missing: ${selector}`);
}
for(const selector of [".duelLobbyCard",".duelVersusPanel",".duelCombatHud",".duelHealthBar",".duelRoundCenter"]){
  assert.ok(duel.includes(selector),`B10C Duel V3 surface missing: ${selector}`);
}
assert.match(shared,/@media\s*\(max-width:700px\)/,'B10C shared mobile closure missing');
assert.match(shared,/@media\s*\(prefers-reduced-motion:reduce\)/,'B10C shared reduced-motion closure missing');
assert.match(duel,/@media\(max-width:760px\)/,'B10C Duel mobile closure missing');
assert.match(duel,/@media\(prefers-reduced-motion:reduce\)/,'B10C Duel reduced-motion closure missing');
assert.match(html,/<title>Auto Battle Roguelite V0\.(?:19|20|21|22|23|24)<\/title>/,'Public label must be V0.19 candidate, V0.20 release or V0.21 release');
for(const forbidden of ["updateDuelRound","damageDealt","grantDuelRare","addDuelSkillRank","state\.hp","state\.xp"]){
  assert.ok(!shared.includes(forbidden),`B10A CSS must remain presentation-only: ${forbidden}`);
  assert.ok(!duel.includes(forbidden),`B10B CSS must remain presentation-only: ${forbidden}`);
}
console.log("v020-b10c-ui-closure-smoke: ok");
