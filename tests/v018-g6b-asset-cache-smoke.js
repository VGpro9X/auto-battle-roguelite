const fs=require("fs");
const path=require("path");
const vm=require("vm");
const assert=require("assert");

const root=path.resolve(__dirname,"..");
const source=fs.readFileSync(path.join(root,"js/duel-visual-assets.js"),"utf8");
const renderer=fs.readFileSync(path.join(root,"js/duel-renderer-v2.js"),"utf8");

let fetchCount=0,imageLoadCount=0;
class FakeImage{
  constructor(){this.decoding="";this.naturalWidth=256;this.naturalHeight=128;this.width=256;this.height=128;this.onload=null;this.onerror=null;this._src="";}
  set src(value){this._src=value;imageLoadCount++;queueMicrotask(()=>this.onload&&this.onload());}
  get src(){return this._src;}
}
const sandbox={
  URL,Promise,queueMicrotask,Image:FakeImage,globalThis:null,
  fetch:async url=>{fetchCount++;return{ok:true,status:200,json:async()=>({id:"test-manifest",animations:{idle:{src:"idle.png"},walk:{src:"walk.png"}}})};}
};
sandbox.globalThis=sandbox;
vm.createContext(sandbox);
vm.runInContext(source,sandbox,{filename:"duel-visual-assets.js"});

(async()=>{
  const manifestUrl="http://localhost/assets/manifest.json";
  const mp1=sandbox.loadDuelVisualManifest(manifestUrl),mp2=sandbox.loadDuelVisualManifest(manifestUrl);
  assert.strictEqual(mp1,mp2,'duplicate manifest requests must reuse the same promise');
  const manifest=await mp1;
  assert.strictEqual(fetchCount,1,'manifest cache must prevent duplicate fetches');
  assert.strictEqual(manifest.id,"test-manifest");

  const ip1=sandbox.loadDuelVisualImage("idle.png",manifestUrl),ip2=sandbox.loadDuelVisualImage("idle.png",manifestUrl);
  assert.strictEqual(ip1,ip2,'duplicate image requests must reuse the same promise');
  const idle=await ip1;
  assert.strictEqual(imageLoadCount,1,'image cache must prevent duplicate Image loads');
  assert.strictEqual(idle.src,"http://localhost/assets/idle.png");

  await sandbox.loadDuelVisualImage("walk.png",manifestUrl);
  await sandbox.loadDuelVisualImage("cast.png",manifestUrl);
  await sandbox.loadDuelVisualImage("idle.png",manifestUrl); // touch idle so walk becomes oldest
  let status=sandbox.getDuelVisualAssetCacheStatus();
  assert.strictEqual(status.manifestEntries,1);
  assert.strictEqual(status.imageEntries,3);
  assert.strictEqual(status.pendingImages,0);
  assert.strictEqual(status.settledImages,3);
  assert.strictEqual(status.decodedBytesEstimate,3*256*128*4);

  const pruned=sandbox.pruneDuelVisualAssetCaches({maxImages:2,maxManifests:1});
  assert.strictEqual(pruned.removedImages,1);
  assert.strictEqual(pruned.removedManifests,0);
  status=pruned.status;
  assert.strictEqual(status.imageEntries,2);
  assert.ok(status.images.some(item=>item.url.endsWith('/idle.png')),'recently touched idle asset should survive LRU prune');
  assert.ok(!status.images.some(item=>item.url.endsWith('/walk.png')),'oldest settled asset should be pruned first');

  const beforeReload=imageLoadCount;
  await sandbox.loadDuelVisualImage("walk.png",manifestUrl);
  assert.strictEqual(imageLoadCount,beforeReload+1,'a pruned lookup may reload cleanly on future demand');

  sandbox.clearDuelVisualAssetCaches();
  status=sandbox.getDuelVisualAssetCacheStatus();
  assert.strictEqual(status.manifestEntries,0);
  assert.strictEqual(status.imageEntries,0);
  assert.strictEqual(status.decodedBytesEstimate,0);

  assert.match(source,/record\.settled&&!keep\.has\(url\)/,'prune must never evict pending loads');
  assert.ok(!source.includes('src=""'),'cache cleanup must not invalidate Image objects already held by renderers');
  assert.match(renderer,/const images=new Map\(\),arenaImages=new Map\(\)/,'Renderer V2 must retain active image references independently of loader lookup cache');
  assert.match(renderer,/images\.set\(src,await loadDuelVisualImage/,'fighter renderer should hold loaded Image references');
  assert.match(renderer,/arenaImages\.set\(src,await loadDuelVisualImage/,'arena renderer should hold loaded Image references');

  for(const forbidden of ["updateDuelRound","duelDealDamage","settleDuelRound","resolveDuelTournamentStage"]){
    assert.ok(!source.includes(forbidden),`asset cache lifecycle must not encode gameplay truth: ${forbidden}`);
  }

  console.log("V0.18 G6B asset cache lifecycle smoke: PASS");
})().catch(error=>{console.error(error);process.exitCode=1;});
