const fs=require("fs");
const path=require("path");
const vm=require("vm");
const assert=require("assert");

const root=path.resolve(__dirname,"..");
const manifestPath=path.join(root,"assets/duel/fighters/base/manifest.json");
const manifest=JSON.parse(fs.readFileSync(manifestPath,"utf8"));
const requiredAnchors=["head","chest","leftHand","rightHand","feet","front","back","target"];

assert.equal(manifest.id,"v018-proof-fighter");
assert.ok(manifest.animations&&manifest.animations.idle,"proof idle animation missing");
const idle=manifest.animations.idle;
assert.ok(idle.src,"proof idle src missing");
assert.ok(fs.existsSync(path.join(path.dirname(manifestPath),idle.src)),`missing proof asset ${idle.src}`);
assert.ok(Array.isArray(idle.anchors)&&idle.anchors.length>=1,"per-frame anchors missing");
for(const name of requiredAnchors)assert.ok(idle.anchors[0][name],`missing anchor ${name}`);

for(const file of ["js/duel-visual-assets.js","js/duel-animation.js","js/duel-renderer-v2.js","js/duel-renderer.js"]){
  assert.ok(fs.existsSync(path.join(root,file)),`missing G1 module ${file}`);
}

const animationSource=fs.readFileSync(path.join(root,"js/duel-animation.js"),"utf8");
const sandbox={globalThis:{}};sandbox.globalThis=sandbox;vm.createContext(sandbox);vm.runInContext(animationSource,sandbox);
assert.equal(sandbox.resolveDuelAnimationFrame({frames:4,fps:10,loop:true},.35),3);
assert.equal(sandbox.resolveDuelAnimationFrame({frames:4,fps:10,loop:false},9),3);
const resolved=sandbox.resolveDuelFrameAnchors(idle,0);
for(const name of requiredAnchors)assert.ok(Number.isFinite(resolved[name].x)&&Number.isFinite(resolved[name].y),`invalid anchor ${name}`);

const rendererSource=fs.readFileSync(path.join(root,"js/duel-renderer-v2.js"),"utf8");
assert.match(rendererSource,/createDuelVectorRenderer/);
assert.match(rendererSource,/vector-fallback/);
assert.match(rendererSource,/DUEL_RENDERER_V2_ENABLED/);
const bootstrapSource=fs.readFileSync(path.join(root,"js/duel-renderer.js"),"utf8");
assert.match(bootstrapSource,/duel-visual-assets\.js/);
assert.match(bootstrapSource,/duel-animation\.js/);
assert.match(bootstrapSource,/duel-renderer-v2\.js/);

console.log("V0.18 G1 asset/animation/Renderer V2 smoke: PASS");