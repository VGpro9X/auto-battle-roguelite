const fs=require("fs");
const path=require("path");
const assert=require("assert");

const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");
const renderer=read("js/duel-renderer-v2.js");
const fallback=read("js/duel-renderer.js");
const fixture=JSON.parse(read("tests/fixtures/v018-g6d-partial-fighter-manifest.json"));

assert.match(renderer,/const createVectorRenderer=root\.createDuelRenderer/,'Renderer V2 must capture the vector renderer before replacing the public factory');
assert.match(renderer,/const fallback=createVectorRenderer\(canvas\)/,'every V2 instance must own a live vector fallback');
assert.match(renderer,/if\(!ready\|\|!manifest\|\|!animationResolver\)return null/,'fighter visual resolution must fall back while assets are unavailable');
assert.match(renderer,/if\(!animation\?\.src\|\|!images\.get\(animation\.src\)\)return null/,'missing state/image must fall back instead of drawing broken art');
assert.match(renderer,/fallback\.render\(match,dt,\{skipFighterSides:covered,skipArena:customArena,preserveCanvas:true,transformOverride:tr\}\)/,'V2 must render uncovered fighters/world through vector fallback');
assert.match(renderer,/fighter fallback active/,'fighter preload failure must stay observable');
assert.match(renderer,/arena fallback active/,'arena preload failure must stay observable');
assert.match(renderer,/arenaReady,arenaError:/,'V2 status must expose arena fallback state');
assert.match(renderer,/ready,error:manifestError/,'V2 status must expose fighter fallback state');
assert.match(renderer,/if\(getDuelRendererMode\(\)==="vector"\)/,'configured renderer must support forced vector mode');
assert.match(renderer,/canvas\.dataset\.duelRenderer="vector"/,'forced vector mode must be observable on canvas');
assert.match(renderer,/using vector fallback/,'V2 initialization failure must hard-fallback to vector renderer');
assert.match(renderer,/canvas\.dataset\.duelRenderer="vector-fallback"/,'hard fallback mode must be observable on canvas');
assert.match(renderer,/requested==="vector"/,'duelRenderer=vector query contract missing');
assert.match(renderer,/root\.DUEL_RENDERER_V2_ENABLED===false/,'programmatic vector fallback switch missing');

assert.strictEqual(Object.keys(fixture.animations).length,1,'G6D fixture must intentionally cover only one fighter state');
assert.ok(fixture.animations.idle,'G6D partial fixture must cover idle so per-state fallback can be exercised');
assert.match(fixture.animations.idle.src,/assets\/duel\/fighters\/base\/idle\.svg$/,'G6D fixture must use a real production asset for its one covered state');

// Fallback renderer must remain self-contained and must not import/require V2 assets to render.
assert.match(fallback,/function createDuelRenderer\(canvas\)/,'vector fallback factory missing');
assert.match(fallback,/function drawFighter\(fighter,tr,round\)/,'vector fallback fighter renderer missing');
assert.match(fallback,/function drawProjectiles\(round,tr\)/,'vector fallback projectile renderer missing');
assert.match(fallback,/function drawEffects\(tr\)/,'vector fallback effect renderer missing');

for(const forbidden of ["updateDuelRound=function","settleDuelRound=function","resolveDuelTournamentStage=function"]){
  assert.ok(!renderer.includes(forbidden),`renderer fallback must not replace simulation truth: ${forbidden}`);
}

console.log("V0.18 G6D vector/partial-asset fallback contract smoke: PASS");
