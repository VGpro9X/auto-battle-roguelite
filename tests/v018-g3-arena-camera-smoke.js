const fs=require("fs");
const path=require("path");
const vm=require("vm");
const assert=require("assert");

const root=path.resolve(__dirname,"..");
const arenaBase=path.join(root,"assets/duel/arenas/ashen-sanctum");
const manifest=JSON.parse(fs.readFileSync(path.join(arenaBase,"manifest.json"),"utf8"));
assert.equal(manifest.id,"ashen-sanctum");
assert.equal(manifest.logicalWidth,1000);
assert.equal(manifest.logicalHeight,560);
assert.equal(manifest.floorY,475);
assert.equal(manifest.leftBound,54);
assert.equal(manifest.rightBound,946);
assert.ok(Array.isArray(manifest.layers)&&manifest.layers.length>=6,"arena must expose multi-layer presentation");
for(const layer of manifest.layers){assert.ok(layer.src,`layer ${layer.id} missing src`);assert.ok(fs.existsSync(path.join(arenaBase,layer.src)),`missing arena layer ${layer.src}`);assert.ok(Number.isFinite(layer.parallax),`layer ${layer.id} missing parallax`);}
assert.ok(manifest.layers.some(layer=>layer.parallax<.5),"arena needs distant parallax");
assert.ok(manifest.layers.some(layer=>layer.foreground===true),"arena needs foreground readability layer");

const cameraSource=fs.readFileSync(path.join(root,"js/duel-camera.js"),"utf8");
const sandbox={globalThis:{},Math};sandbox.globalThis=sandbox;vm.createContext(sandbox);vm.runInContext(cameraSource,sandbox);
assert.equal(typeof sandbox.createDuelCamera,"function","camera factory missing");
const camera=sandbox.createDuelCamera();
const arena={width:1000,height:560,floorY:475,leftBound:54,rightBound:946};
const match={arena,currentRound:{number:1,time:10,fighters:{player:{x:220},opponent:{x:780}}}};
let tr=camera.update(match,1/60,1440,900);
assert.ok(tr.scale>0&&tr.zoom>=1&&tr.zoom<=1.24,"desktop camera zoom outside contract");
assert.ok(tr.x(220)>-1&&tr.x(780)<1441,"desktop camera lost a fighter");
match.currentRound.fighters.player.x=54;match.currentRound.fighters.opponent.x=180;tr=camera.update(match,.5,390,844);
assert.ok(tr.zoom<=1.10,"mobile camera must reduce zoom intensity");
assert.ok(tr.centerX>=0&&tr.centerX<=1000,"camera hard bounds invalid");
camera.consume([{type:"hit",critical:true,amount:90},{type:"phase_change",phase:"TỬ CHIẾN"}]);
tr=camera.update(match,1/60,390,844);
const state=camera.getState();
assert.ok(state.shakePower>0,"impact shake not triggered");
assert.ok(state.zoomKick>0,"impact zoom not triggered");

const vectorSource=fs.readFileSync(path.join(root,"js/duel-renderer.js"),"utf8");
assert.match(vectorSource,/transformOverride/,"vector fallback cannot share V2 camera transform");
assert.match(vectorSource,/preserveCanvas/,"vector fallback cannot preserve V2 arena layers");
assert.match(vectorSource,/skipArena/,"vector fallback cannot defer arena to V2");
assert.match(vectorSource,/canvas\.width!==nextWidth/,"canvas resize must not clear layered rendering each frame");
assert.match(vectorSource,/duel-camera\.js/,"camera bootstrap missing");

const v2Source=fs.readFileSync(path.join(root,"js/duel-renderer-v2.js"),"utf8");
assert.match(v2Source,/ashen-sanctum\/manifest\.json/,"arena manifest not wired into Renderer V2");
assert.match(v2Source,/layerTransform/,"parallax layer transform missing");
assert.match(v2Source,/transformOverride:tr/,"combat render does not share presentation camera");
assert.match(v2Source,/drawPhasePresentation/,"HUYẾT CHIẾN\/TỬ CHIẾN presentation missing");
assert.match(v2Source,/camera\?\.consume/,"combat events do not feed impact camera");

console.log("V0.18 G3 arena/camera presentation smoke: PASS");