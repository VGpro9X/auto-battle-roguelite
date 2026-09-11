const fs=require("fs");
const path=require("path");
const assert=require("assert");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const bridge=read("css/v017-duel.css");
const css=read("css/v018-ui.css");
const ui=read("js/duel-ui.js");
const rares=read("js/duel-rares.js");

assert.match(bridge,/^@import url\("\.\/v018-graphics\.css\?v=018-g5b"\);\n@import url\("\.\/v018-ui\.css\?v=018-g5c"\);/,'G5C reward stylesheet must load after the shared graphics layer');

for(const selector of [
  ".duelSkillCard",
  ".duelChoices",
  ".duelChoice",
  ".duelChoice.maxNext",
  ".duelEvolutionHint",
  ".duelRareChoice",
  ".duelRareChoice.divine",
  ".duelRareChoice.mystic",
  ".duelReroll",
  ".duelReroll.used"
])assert.ok(css.includes(selector),`missing G5C selector ${selector}`);

assert.match(css,/\.duelChoices\{[\s\S]*grid-template-columns:repeat\(3,minmax\(0,1fr\)\)/,'desktop reward choices must remain a readable three-card row');
assert.match(css,/@media \(max-width:820px\)[\s\S]*\.duelChoices\{grid-template-columns:1fr/,'reward choices must stack on constrained/mobile widths');
assert.match(css,/\.duelChoice\.maxNext[\s\S]*250,204,21/,'Rank III / TỐI ĐA choice needs distinct presentation');
assert.match(css,/\.duelEvolutionHint[\s\S]*250,204,21/,'Siêu Cấp unlock hint needs distinct presentation');
assert.match(css,/\.duelRareChoice\.divine[\s\S]*250,204,21/,'Thần Kỹ card presentation missing');
assert.match(css,/\.duelRareChoice\.mystic[\s\S]*192,132,252/,'Thần Bí Kỹ card presentation missing');
assert.match(css,/\.duelReroll\.used,\.duelReroll:disabled[\s\S]*cursor:not-allowed/,'used reroll state must remain visibly disabled');
assert.match(css,/@media \(prefers-reduced-motion:reduce\)/,'G5C must preserve reduced-motion behavior');

// Preserve the existing reward truth and one-reroll contract from Duel UI.
assert.match(ui,/button\.className=`choice duelChoice duelRareChoice \$\{meta\.tier\}`/,'Rare reward cards must keep their existing tier hook');
assert.match(ui,/button\.className="choice duelChoice"\+\(next>=3\?" maxNext":""\)/,'Rank III choice must keep maxNext hook');
assert.match(ui,/class=\\"duelEvolutionHint\\">✦ MỞ SIÊU CẤP:/,'Siêu Cấp immediate-unlock hint must remain exact-choice driven');
assert.match(ui,/reroll\.disabled=false;reroll\.textContent="↻ XOAY LẠI · 1 LẦN"/,'reroll must start available once');
assert.match(ui,/reroll\.onclick=\(\)=>\{if\(rerollUsed\)return;rerollUsed=true;reroll\.disabled=true;/,'reroll must remain one-use per choice screen');
assert.match(ui,/reroll\.textContent="↻ ĐÃ DÙNG LƯỢT XOAY";reroll\.classList\.add\("used"\);renderChoices\(\);/,'used reroll must rerender choices exactly once');
assert.match(rares,/mystic[\s\S]*divine|divine[\s\S]*mystic/,'released Rare tiers must still expose mystic/divine truth');

for(const forbidden of ["getDuelRewardChoices","rollDuelRareOffer","grantDuelRare","addDuelSkillRank","applyDuelDivineGift"]){
  assert.ok(!css.includes(forbidden),`G5C CSS must not encode reward mechanics: ${forbidden}`);
}

console.log("V0.18 G5C reward/build-card presentation smoke: PASS");
