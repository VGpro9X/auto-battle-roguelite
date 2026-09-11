const fs=require("fs");
const path=require("path");
const assert=require("assert");

const root=path.resolve(__dirname,"..");
const base=path.join(root,"assets/duel/fighters/base");
const manifest=JSON.parse(fs.readFileSync(path.join(base,"manifest.json"),"utf8"));
const states=["idle","walk","run","dash","melee","ranged","cast","hit","block","knockback","knockdown","recover","ko"];
const anchors=["head","chest","leftHand","rightHand","feet","front","back","target"];

assert.ok(manifest.version>=5,"G2F manifest version missing");
assert.deepEqual(Object.keys(manifest.animations).sort(),states.slice().sort(),"fighter semantic state coverage must be exactly 13/13");
for(const state of states){
  const animation=manifest.animations[state];
  assert.ok(animation?.src,`${state} asset source missing`);
  assert.ok(fs.existsSync(path.join(base,animation.src)),`${state} asset file missing`);
  assert.ok(animation.frames>=4,`${state} frame count too small`);
  assert.equal(animation.columns,animation.frames,`${state} horizontal sheet contract mismatch`);
  assert.equal(animation.anchors.length,animation.frames,`${state} per-frame anchor coverage mismatch`);
  for(const [index,frame] of animation.anchors.entries()){
    for(const anchor of anchors){
      assert.ok(Array.isArray(frame[anchor])&&frame[anchor].length===2,`${state} frame ${index} missing ${anchor}`);
      assert.ok(frame[anchor].every(Number.isFinite),`${state} frame ${index} invalid ${anchor}`);
    }
  }
}
for(const state of ["dash","melee","ranged","cast","hit","block","knockback","knockdown","recover","ko"]){
  assert.equal(manifest.animations[state].loop,false,`${state} must not loop`);
}
assert.equal(manifest.animations.idle.loop,true,"idle must loop");
assert.equal(manifest.animations.walk.loop,true,"walk must loop");
assert.equal(manifest.animations.run.loop,true,"run must loop");

const animationSource=fs.readFileSync(path.join(root,"js/duel-animation.js"),"utf8");
for(const state of states)assert.ok(animationSource.includes(`\"${state}\"`),`semantic resolver missing ${state}`);

console.log("V0.18 G2F full 13/13 fighter state coverage: PASS");