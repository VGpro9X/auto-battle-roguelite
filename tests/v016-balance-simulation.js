const assert=require('assert');

// Deterministic Mulberry32 so CI sees the exact same statistical sample every run.
function mulberry32(seed){
  return function(){
    let t=seed+=0x6D2B79F5;
    t=Math.imul(t^t>>>15,t|1);
    t^=t+Math.imul(t^t>>>7,t|61);
    return((t^t>>>14)>>>0)/4294967296;
  };
}

function chance(level){
  if(level<8)return 0;
  return Math.min(.12,.01+(level-8)*.0035);
}

const rng=mulberry32(0x0162026);
const samples=200000;
for(const level of [7,8,20,30,40,60]){
  const expected=chance(level);
  let hits=0;
  for(let i=0;i<samples;i++)if(rng()<expected)hits++;
  const observed=hits/samples;
  const sigma=Math.sqrt(Math.max(1e-12,expected*(1-expected)/samples));
  const tolerance=Math.max(.0006,5*sigma);
  assert.ok(Math.abs(observed-expected)<=tolerance,`Lv${level}: observed ${(observed*100).toFixed(3)}% differs from expected ${(expected*100).toFixed(3)}% by more than ${(tolerance*100).toFixed(3)}%`);
}

// Uniform 20-way Endless starting rare selection. This tests the exact floor(r*20)
// contract over a large deterministic sample, not just the interval endpoints.
const startRng=mulberry32(0xE0D1E55);
const counts=Array(20).fill(0);
const startSamples=400000;
for(let i=0;i<startSamples;i++)counts[Math.floor(startRng()*20)]++;
const expectedEach=startSamples/20;
const maxRelativeError=Math.max(...counts.map(count=>Math.abs(count-expectedEach)/expectedEach));
assert.ok(maxRelativeError<.025,`Endless 20-way uniform sample drifted too far: max relative error ${(maxRelativeError*100).toFixed(2)}%`);

// Multi-rare run pressure model: one rare attempt at each level 8..60. This does not
// impose a target count; it guards only that the public curve naturally permits
// multiple acquisitions rather than behaving like a one-rare cap.
const runRng=mulberry32(0xB16B00B5);
const runs=100000;
let zero=0,one=0,multiple=0,total=0;
for(let run=0;run<runs;run++){
  let acquired=0;
  for(let level=8;level<=60;level++)if(runRng()<chance(level))acquired++;
  total+=acquired;
  if(acquired===0)zero++;
  else if(acquired===1)one++;
  else multiple++;
}
assert.ok(multiple>one&&multiple>zero,'Level-scaled curve should naturally produce multiple rare successes in most long simulated runs');
assert.ok(total/runs>3,'Long-run simulation should average more than three rare successes before duplicate/pool exhaustion');

console.log(`V0.16 balance simulation: PASS · avg rare successes Lv8-60 ${(total/runs).toFixed(2)} · Endless max slot drift ${(maxRelativeError*100).toFixed(2)}%`);
