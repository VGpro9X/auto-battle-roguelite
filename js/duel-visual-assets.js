(()=>{
  const root=typeof window!=="undefined"?window:globalThis;
  const manifestCache=new Map();
  const imageCache=new Map();
  let touchSerial=0;

  function touch(record){record.touched=++touchSerial;return record;}
  function asUrl(path,base){
    try{return new URL(path,base||(typeof document!=="undefined"?document.baseURI:"http://localhost/")).href;}
    catch(_){return path;}
  }

  function validateManifest(manifest,url){
    if(!manifest||typeof manifest!=="object")throw new Error(`Invalid Duel visual manifest: ${url}`);
    if(!manifest.id)throw new Error(`Duel visual manifest missing id: ${url}`);
    manifest.__url=url;
    return manifest;
  }

  function loadDuelVisualManifest(url){
    const resolved=asUrl(url),cached=manifestCache.get(resolved);
    if(cached){touch(cached);return cached.promise;}
    const record={url:resolved,kind:"manifest",touched:0,settled:false,promise:null};touch(record);
    record.promise=(typeof fetch==="function"
      ? fetch(resolved,{cache:"force-cache"}).then(response=>{
          if(!response.ok)throw new Error(`Duel visual manifest HTTP ${response.status}: ${resolved}`);
          return response.json();
        }).then(data=>validateManifest(data,resolved))
      : Promise.reject(new Error("fetch unavailable for Duel visual manifest")))
      .then(value=>{record.settled=true;return value;})
      .catch(error=>{if(manifestCache.get(resolved)===record)manifestCache.delete(resolved);throw error;});
    manifestCache.set(resolved,record);
    return record.promise;
  }

  function loadDuelVisualImage(path,manifestUrl){
    const resolved=asUrl(path,manifestUrl),cached=imageCache.get(resolved);
    if(cached){touch(cached);return cached.promise;}
    const record={url:resolved,kind:"image",touched:0,settled:false,width:0,height:0,decodedBytesEstimate:0,promise:null};touch(record);
    record.promise=new Promise((resolve,reject)=>{
      if(typeof Image==="undefined"){reject(new Error("Image unavailable for Duel visual asset"));return;}
      const image=new Image();
      image.decoding="async";
      image.onload=()=>resolve(image);
      image.onerror=()=>reject(new Error(`Failed to load Duel visual asset: ${resolved}`));
      image.src=resolved;
    }).then(image=>{
      record.settled=true;
      record.width=Math.max(0,Number(image?.naturalWidth||image?.width||0));
      record.height=Math.max(0,Number(image?.naturalHeight||image?.height||0));
      record.decodedBytesEstimate=record.width*record.height*4;
      return image;
    }).catch(error=>{if(imageCache.get(resolved)===record)imageCache.delete(resolved);throw error;});
    imageCache.set(resolved,record);
    return record.promise;
  }

  function animationFor(manifest,state){
    if(!manifest?.animations)return null;
    return manifest.animations[state]||null;
  }

  async function preloadDuelFighterVisual(url){
    const manifest=await loadDuelVisualManifest(url);
    const sources=[...new Set(Object.values(manifest.animations||{}).map(item=>item?.src).filter(Boolean))];
    await Promise.all(sources.map(src=>loadDuelVisualImage(src,manifest.__url)));
    return manifest;
  }

  async function resolveDuelVisualAsset(manifest,state){
    const animation=animationFor(manifest,state);
    if(!animation?.src)return null;
    const image=await loadDuelVisualImage(animation.src,manifest.__url);
    return{manifest,animation,image};
  }

  function cacheStatus(){
    const manifests=[...manifestCache.values()],images=[...imageCache.values()];
    return{
      manifestEntries:manifests.length,
      imageEntries:images.length,
      settledManifests:manifests.filter(record=>record.settled).length,
      settledImages:images.filter(record=>record.settled).length,
      pendingManifests:manifests.filter(record=>!record.settled).length,
      pendingImages:images.filter(record=>!record.settled).length,
      decodedBytesEstimate:images.reduce((sum,record)=>sum+Number(record.decodedBytesEstimate||0),0),
      manifests:manifests.map(record=>({url:record.url,settled:record.settled,touched:record.touched})),
      images:images.map(record=>({url:record.url,settled:record.settled,touched:record.touched,width:record.width,height:record.height,decodedBytesEstimate:record.decodedBytesEstimate}))
    };
  }

  function pruneMap(cache,maxEntries,keepUrls){
    const limit=Math.max(0,Number.isFinite(Number(maxEntries))?Math.floor(Number(maxEntries)):cache.size);
    if(cache.size<=limit)return 0;
    const keep=new Set((keepUrls||[]).map(String));
    const candidates=[...cache.entries()]
      .filter(([url,record])=>record.settled&&!keep.has(url))
      .sort((a,b)=>a[1].touched-b[1].touched);
    let removed=0;
    for(const [url] of candidates){if(cache.size<=limit)break;cache.delete(url);removed++;}
    return removed;
  }

  function pruneDuelVisualAssetCaches({maxImages=64,maxManifests=16,keepImageUrls=[],keepManifestUrls=[]}={}){
    const removedImages=pruneMap(imageCache,maxImages,keepImageUrls);
    const removedManifests=pruneMap(manifestCache,maxManifests,keepManifestUrls);
    return{removedImages,removedManifests,status:cacheStatus()};
  }

  function clearDuelVisualAssetCaches(){manifestCache.clear();imageCache.clear();}

  root.loadDuelVisualManifest=loadDuelVisualManifest;
  root.loadDuelVisualImage=loadDuelVisualImage;
  root.preloadDuelFighterVisual=preloadDuelFighterVisual;
  root.resolveDuelVisualAsset=resolveDuelVisualAsset;
  root.getDuelVisualAnimation=animationFor;
  root.getDuelVisualAssetCacheStatus=cacheStatus;
  root.pruneDuelVisualAssetCaches=pruneDuelVisualAssetCaches;
  root.clearDuelVisualAssetCaches=clearDuelVisualAssetCaches;
})();
