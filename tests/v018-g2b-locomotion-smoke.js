const fs=require("fs");
const path=require("path");
const assert=require("assert");

const root=path.resolve(__dirname,"..");
const base=path.join(root,"assets/duel/fighters/base");
const manifest=JSON.parse(fs.readFileSync(path.join(base,"manifest.json"),"utf8"));
const requiredAnchors=["head","chest","leftHand","rightHand","feet","front","back","target"];

assert.equal(manifest.id,"v018-base-fighter");
assert.equal(manifest.version,2);
for(const state of ["idle","walk","run"]){
  const animation=manifest.animations[state];
  assert.ok(animation,`missing ${state} animation`);
  assert.equal(animation.frames,4,`${state} must have four proof-production frames`);
  assert.equal(animation.columns,4,`${state} sheet columns mismatch`);
  assert.ok(animation.fps>0,`${state} fps invalid`);
  assert.ok(fs.existsSync(path.join(base,animation.src)),`missing ${state} sheet ${animation.src}`);
  assert.equal(animation.anchors.length,animation.frames,`${state} per-frame anchor count mismatch`);
  for(const [index,anchors] of animation.anchors.entries()){
    for(const name of requiredAnchors)assert.ok(Array.isArray(anchors[name])&&anchors[name].length===2,`${state} frame ${index} missing ${name}`);
    assert.equal(anchors.feet[0],128,`${state} frame ${index} root x drifted`);
    assert.ok(anchors.feet[1]>=228&&anchors.feet[1]<=234,`${state} frame ${index} feet y outside locomotion tolerance`);
    assert.ok(anchors.front[0]>anchors.feet[0],`${state} frame ${index} front anchor must be forward in source orientation`);
    assert.ok(anchors.back[0]<anchors.feet[0],`${state} frame ${index} back anchor must be behind in source orientation`);
  }
}

assert.equal(manifest.animations.melee,undefined,"G2B must not claim melee coverage yet");
const renderer=fs.readFileSync(path.join(root,"js/duel-renderer-v2.js"),"utf8");
assert.match(renderer,/\(anchor\.x-feet\.x\)\*scale\*facing/,"anchor x must mirror with fighter facing");
assert.match(renderer,/ctx\.scale\(-1,1\)/,"sprite facing flip missing");

console.log("V0.18 G2B idle/walk/run locomotion anchors: PASS");