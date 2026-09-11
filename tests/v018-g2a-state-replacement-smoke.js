const fs=require("fs");
const path=require("path");
const assert=require("assert");

const root=path.resolve(__dirname,"..");
const manifest=JSON.parse(fs.readFileSync(path.join(root,"assets/duel/fighters/base/manifest.json"),"utf8"));
const vectorSource=fs.readFileSync(path.join(root,"js/duel-renderer.js"),"utf8");
const v2Source=fs.readFileSync(path.join(root,"js/duel-renderer-v2.js"),"utf8");
const assetSource=fs.readFileSync(path.join(root,"js/duel-visual-assets.js"),"utf8");

assert.ok(manifest.animations.idle,"idle coverage missing");
assert.equal(manifest.animations.recover,undefined,"state fallback test requires recover to remain uncovered here");
assert.match(assetSource,/manifest\.animations\[state\]\|\|null/,"missing-state loader must return null");
assert.match(vectorSource,/skipFighterSides/,"vector renderer must support per-side omission");
assert.match(vectorSource,/!skip\.has\("player"\)/,"player vector omission missing");
assert.match(vectorSource,/!skip\.has\("opponent"\)/,"opponent vector omission missing");
assert.match(v2Source,/resolveVisual\(/,"V2 exact-state coverage resolver missing");
assert.match(v2Source,/covered\.push\("player"\)/,"V2 player clean replacement missing");
assert.match(v2Source,/covered\.push\("opponent"\)/,"V2 opponent clean replacement missing");
assert.match(v2Source,/fallback\.render\(match,dt,\{skipFighterSides:covered\}\)/,"V2 must suppress vector only for covered states");
assert.match(v2Source,/lastFrames\.delete\("player"\)/,"stale player asset anchor cleanup missing");
assert.match(v2Source,/lastFrames\.delete\("opponent"\)/,"stale opponent asset anchor cleanup missing");

console.log("V0.18 G2A state-by-state clean replacement smoke: PASS");