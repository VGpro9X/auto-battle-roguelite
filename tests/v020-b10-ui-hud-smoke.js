const fs=require('fs');
const assert=require('assert');
const css=fs.readFileSync('css/v020-ui-hud.css','utf8');
const duelCss=fs.readFileSync('css/v017-duel.css','utf8');
const spec=fs.readFileSync('V020_B10_UI_HUD_SPEC.md','utf8');

assert.ok(duelCss.includes('v020-ui-hud.css?v=020-b10a'),'B10A stylesheet is not wired through the global Duel stylesheet');
for(const token of [
  '#gameWrap .menuCard','#gameWrap .heroCard','#gameWrap .modeCard','#gameWrap .gameUi .panel',
  '#gameWrap .stats','#gameWrap #skillBar','#gameWrap .buildTracker','#gameWrap .unlockToast',
  '#gameWrap .choice','#gameWrap .codexCard','#gameWrap .codexSkillCard','#gameWrap .codexDetail',
  '#gameWrap .resultCard','#gameWrap .duelLobbyCard','#gameWrap .duelCombatHud'
])assert.ok(css.includes(token),`missing B10A presentation surface: ${token}`);
assert.ok(css.includes('@media(max-width:700px)'),'mobile B10A composition gate missing');
assert.ok(css.includes('@media(max-height:520px) and (orientation:landscape)'),'landscape B10A composition gate missing');
assert.ok(css.includes('@media(prefers-reduced-motion:reduce)'),'reduced-motion B10A gate missing');
for(const forbidden of ['state.','state[','hp-=','xp+=','addSkill','updateDuelRound','createDuelMatch','Math.random'])assert.ok(!css.includes(forbidden),`presentation stylesheet must not own simulation truth: ${forbidden}`);
assert.ok(spec.includes('V0.19')&&spec.includes('B10B')&&spec.includes('B10C'),'B10 handoff/release discipline missing');
console.log('v020-b10-ui-hud-smoke: ok');
