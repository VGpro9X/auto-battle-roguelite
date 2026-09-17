const fs=require('fs');
function assert(v,m){if(!v)throw new Error(m);}
const runtime=fs.readFileSync('js/v020-enemy-presentation.js','utf8');
const bootstrap=fs.readFileSync('js/duel-ui-sync.js','utf8');
const combat=fs.readFileSync('js/combat.js','utf8');
const spec=fs.readFileSync('V020_B4_ENEMY_VISUAL_SPEC.md','utf8');
const assets={
  beast:'assets/v020/enemies/beast/beast-runner.svg',
  fallen:'assets/v020/enemies/fallen/fallen-hunter.svg',
  construct:'assets/v020/enemies/construct/construct-anchor.svg',
  abyssal:'assets/v020/enemies/abyssal/abyssal-elite.svg'
};
for(const [family,path] of Object.entries(assets)){
  assert(fs.existsSync(path),family+' runtime asset missing');
  const svg=fs.readFileSync(path,'utf8');
  assert(svg.includes('width="128"')&&svg.includes('height="128"'),family+' runtime asset dimensions changed');
  assert(!/<text\b/i.test(svg),family+' runtime asset contains poster/UI text');
  assert(runtime.includes(path),family+' asset is not wired into runtime');
}
assert(runtime.includes("runner:'beast'"),'runner → Beast mapping missing');
assert(runtime.includes("hunter:'fallen'"),'hunter → Fallen mapping missing');
assert(runtime.includes("anchor:'construct'"),'anchor → Construct mapping missing');
assert(runtime.includes("elite:'abyssal'"),'elite → Abyssal mapping missing');
assert(!runtime.includes("wraith:"),'unused Wraith role must not be invented');
assert(runtime.includes('fallback(enemy)'),'V0.14 enemy fallback missing');
assert(runtime.includes('drawEnemyStatusVisual'),'status compatibility path missing');
assert(bootstrap.includes('v020-enemy-presentation.js?v=020-b4-runtime1'),'B4 bootstrap missing/cache key changed');
for(const forbidden of ['enemy.speed=','enemy.hp=','enemy.dmg=','enemy.r=','enemy.elite='])assert(!runtime.includes(forbidden),'presentation layer mutates gameplay: '+forbidden);
assert(combat.includes('const elite=Math.random()<difficulty.eliteChance'),'simulation elite truth moved or changed unexpectedly');
assert(combat.includes('speed:(elite?34:48)*rand(.85,1.15)*difficulty.speedScale'),'simulation speed model changed unexpectedly');
assert(spec.includes('`Wraith`')&&spec.includes('not produced as a runtime enemy'),'B4 spec must document unused Wraith decision');
console.log('v020-b4-enemy-family-runtime-smoke: ok');