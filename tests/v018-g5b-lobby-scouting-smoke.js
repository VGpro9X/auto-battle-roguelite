const fs=require("fs");
const path=require("path");
const assert=require("assert");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const css=read("css/v018-graphics.css");
const bridge=read("css/v017-duel.css");
const ui=read("js/duel-ui.js");

assert.match(bridge,/^@import url\("\.\/v018-graphics\.css\?v=018-g5b"\);/,'G5B cache key must expose the lobby/scouting presentation');

for(const selector of [
  ".duelModeCard",
  ".duelLobbyCard",
  ".duelPreCard",
  ".duelIntroHero",
  ".duelRuleList>div",
  ".duelVersusPanel",
  ".duelVersusPanel>section",
  ".duelSideLabel",
  ".duelBigVs",
  ".duelStyle"
])assert.ok(css.includes(selector),`missing G5B presentation selector ${selector}`);

assert.match(css,/\.duelModeCard:hover,\.duelModeCard:focus-visible/,'Duel mode card needs keyboard/mouse presentation feedback');
assert.match(css,/\.duelModeCard::before[\s\S]*pointer-events:none/,'mode-card decoration must not block entry interaction');
assert.match(css,/\.duelLobbyCard::before,\.duelPreCard::before[\s\S]*pointer-events:none/,'lobby/scouting decoration must be non-interactive');
assert.match(css,/\.duelVersusPanel>section::after[\s\S]*pointer-events:none/,'side accent decoration must not block scouting content');
assert.match(css,/\.duelVersusPanel>section\.opponent[\s\S]*251,113,133/,'opponent scouting panel must retain red side identity');
assert.match(css,/\.duelVersusPanel>section[\s\S]*96,165,250/,'player scouting panel must retain blue side identity');
assert.match(css,/\.duelBigVs\{[\s\S]*clip-path:polygon\(50% 0,100% 50%,50% 100%,0 50%\)/,'VS separator should use an upright diamond presentation');
assert.doesNotMatch(css,/\.duelBigVs\{[^}]*transform:rotate/,'VS text must not rotate with the separator');
assert.match(css,/@media \(max-width:760px\)[\s\S]*\.duelVersusPanel\{grid-template-columns:1fr/,'scouting layout must collapse to one column on mobile');
assert.match(css,/@media \(max-width:480px\)[\s\S]*\.duelLobbyCard \.primary\.large,\.duelPreCard \.primary\.large\{width:100%/,'phone primary actions must remain easy to tap');
assert.match(css,/@media \(prefers-reduced-motion:reduce\)[\s\S]*\.duelModeCard:hover,\.duelModeCard:focus-visible\{transform:none/,'reduced-motion must disable mode-card lift');

for(const marker of [
  "duelModeCard",
  "duelLobbyMenu",
  "duelLobbyCard",
  "duelIntroGrid",
  "duelIntroHero",
  "duelPreMatchMenu",
  "duelPreCard",
  "duelVersusPanel",
  "duelBigVs",
  "duelSideLabel",
  "duelBuildList"
])assert.ok(ui.includes(marker),`existing Duel UI markup/state hook missing: ${marker}`);

// G5B is presentation-only: do not introduce gameplay-state keywords into CSS.
for(const forbidden of ["damageDealt","updateDuelRound","advanceDuelTournament","duelRewardOptions","rerollUsed"]){
  assert.ok(!css.includes(forbidden),`G5B CSS must not encode gameplay truth: ${forbidden}`);
}

console.log("V0.18 G5B lobby/scouting presentation smoke: PASS");
