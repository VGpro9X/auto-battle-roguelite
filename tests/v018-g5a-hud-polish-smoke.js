const fs=require("fs");
const path=require("path");
const assert=require("assert");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const bridge=read("css/v017-duel.css");
const css=read("css/v018-graphics.css");
const runtimeCss=`${css}\n${bridge}`;
const ui=read("js/duel-ui.js");

assert.match(bridge,/^@import url\("\.\/v018-graphics\.css\?v=018-g5a"\);/,'V0.18 G5A stylesheet must load before legacy Duel rules');
assert.ok(css.length>3000,'G5A stylesheet should contain the production HUD layer');

for(const selector of [
  ".duelCombatRoot",
  ".duelCombatHud",
  ".duelHudTop",
  ".duelHealthRow",
  ".duelFighterHud",
  ".duelHealthBar",
  ".duelRoundCenter",
  ".duelCombatBuilds",
  ".duelAbortButton"
])assert.ok(css.includes(selector),`missing G5A selector ${selector}`);

assert.match(css,/env\(safe-area-inset-top\)/,'HUD must keep top safe-area support');
assert.match(css,/env\(safe-area-inset-right\)/,'HUD must keep right safe-area support');
assert.match(css,/env\(safe-area-inset-bottom\)/,'HUD must keep bottom safe-area support');
assert.match(css,/env\(safe-area-inset-left\)/,'HUD must keep left safe-area support');
assert.match(css,/@media \(max-width:760px\)/,'tablet/mobile HUD breakpoint missing');
assert.match(css,/@media \(max-width:480px\)/,'phone HUD breakpoint missing');
assert.match(css,/@media \(prefers-reduced-motion:reduce\)/,'reduced-motion presentation path missing');
assert.match(css,/\.duelCombatRoot::after[\s\S]*pointer-events:none/,'presentation vignette must not block combat controls');
assert.match(runtimeCss,/\.duelAbortButton\{[^}]*pointer-events:auto/,'abort control must remain interactive in the combined runtime CSS contract');
assert.doesNotMatch(css,/\.duelAbortButton\{[^}]*pointer-events:none/,'G5A must not disable the abort control');
assert.match(css,/\.duelHealthBar em[\s\S]*repeating-linear-gradient/,'shield must remain visually distinct from HP');
assert.match(css,/\.duelFighterHud\.left[\s\S]*duel-player|\.duelFighterHud\.left[\s\S]*96,165,250/,'player side identity styling missing');
assert.match(css,/\.duelFighterHud\.right[\s\S]*251,113,133/,'opponent side identity styling missing');

for(const id of [
  "duelCombatRoot","duelCanvas","duelStageHud","duelPhaseHud","duelAbortButton",
  "duelPlayerNameHud","duelPlayerHpBar","duelPlayerShieldBar","duelPlayerHpText",
  "duelRoundScore","duelRoundTimer",
  "duelOpponentNameHud","duelOpponentHpBar","duelOpponentShieldBar","duelOpponentHpText",
  "duelCombatBuilds"
])assert.ok(ui.includes(`id=\"${id}\"`),`G5A must preserve existing HUD DOM id ${id}`);

assert.doesNotMatch(css,/position\s*:\s*fixed[^}]*z-index\s*:\s*(?:[7-9]\d|\d{3,})/,'G5A CSS must not add a new full-screen layer above Duel controls');

console.log("V0.18 G5A Duel HUD polish smoke: PASS");
