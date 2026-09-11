const fs=require("fs");
const path=require("path");
const assert=require("assert");

const root=path.resolve(__dirname,"..");
const base=path.join(root,"assets/duel/fighters/base");
const manifest=JSON.parse(fs.readFileSync(path.join(base,"manifest.json"),"utf8"));
const requiredAnchors=["head","chest","leftHand","rightHand","feet","front","back","target"];

assert.ok(manifest.version>=3,"G2C manifest version missing");
const expected={dash:{frames:4,loop:false},melee:{frames:6,loop:false},hit:{frames:4,loop:false}};
for(const [state,contract] of Object.entries(expected)){
  const animation=manifest.animations[state];
  assert.ok(animation,`missing ${state}`);
  assert.equal(animation.frames,contract.frames,`${state} frame count mismatch`);
  assert.equal(animation.columns,contract.frames,`${state} columns mismatch`);
  assert.equal(animation.loop,contract.loop,`${state} must be one-shot`);
  assert.ok(animation.fps>=14,`${state} fps too low for combat readability`);
  assert.ok(fs.existsSync(path.join(base,animation.src)),`missing ${state} sheet`);
  assert.equal(animation.anchors.length,animation.frames,`${state} anchors must be per-frame`);
  for(const [index,anchors] of animation.anchors.entries()){
    for(const name of requiredAnchors)assert.ok(Array.isArray(anchors[name])&&anchors[name].length===2,`${state} frame ${index} missing ${name}`);
    assert.ok(Number.isFinite(anchors.feet[0])&&Number.isFinite(anchors.feet[1]),`${state} frame ${index} invalid feet`);
    assert.ok(anchors.front[0]>anchors.back[0],`${state} frame ${index} front/back ordering invalid`);
  }
}

assert.ok(manifest.animations.melee.anchors.some(frame=>frame.rightHand[0]>210),"melee extension never reaches forward impact pose");
assert.ok(manifest.animations.hit.anchors.some(frame=>frame.feet[0]!==128),"hit metadata should compensate rotated reaction frames");

console.log("V0.18 G2C dash/melee/hit combat motion: PASS");