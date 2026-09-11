const fs=require("fs");
const path=require("path");
const assert=require("assert");

const root=path.resolve(__dirname,"..");
const base=path.join(root,"assets/duel/fighters/base");
const manifest=JSON.parse(fs.readFileSync(path.join(base,"manifest.json"),"utf8"));
const requiredAnchors=["head","chest","leftHand","rightHand","feet","front","back","target"];

assert.ok(manifest.version>=4,"G2E manifest version missing");
const expected={ranged:{frames:6,minFps:14},cast:{frames:6,minFps:14},block:{frames:4,minFps:14}};
for(const [state,contract] of Object.entries(expected)){
  const animation=manifest.animations[state];
  assert.ok(animation,`missing ${state}`);
  assert.equal(animation.frames,contract.frames,`${state} frame count mismatch`);
  assert.equal(animation.columns,contract.frames,`${state} sheet columns mismatch`);
  assert.equal(animation.loop,false,`${state} must be one-shot`);
  assert.ok(animation.fps>=contract.minFps,`${state} fps too low`);
  assert.ok(fs.existsSync(path.join(base,animation.src)),`missing ${state} sheet`);
  assert.equal(animation.anchors.length,animation.frames,`${state} per-frame anchors missing`);
  for(const [index,anchors] of animation.anchors.entries()){
    for(const name of requiredAnchors)assert.ok(Array.isArray(anchors[name])&&anchors[name].length===2,`${state} frame ${index} missing ${name}`);
  }
}

assert.ok(manifest.animations.ranged.anchors.some(frame=>frame.rightHand[0]>220),"ranged release pose lacks forward hand extension");
assert.ok(manifest.animations.cast.anchors.some(frame=>frame.leftHand[1]<115&&frame.rightHand[1]<115),"cast never raises both hands into heavy-cast silhouette");
assert.ok(manifest.animations.block.anchors.some(frame=>frame.rightHand[0]<180),"block never closes guard toward chest");

console.log("V0.18 G2E ranged/cast/block coverage: PASS");