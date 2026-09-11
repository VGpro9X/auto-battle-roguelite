(()=>{
  const root=typeof window!=="undefined"?window:globalThis;
  const manifestCache=new Map();
  const imageCache=new Map();

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
    const resolved=asUrl(url);
    if(manifestCache.has(resolved))return manifestCache.get(resolved);
    const request=(typeof fetch==="function"
      ? fetch(resolved,{cache:"force-cache"}).then(response=>{
          if(!response.ok)throw new Error(`Duel visual manifest HTTP ${response.status}: ${resolved}`);
          return response.json();
        }).then(data=>validateManifest(data,resolved))
      : Promise.reject(new Error("fetch unavailable for Duel visual manifest")))
      .catch(error=>{manifestCache.delete(resolved);throw error;});
    manifestCache.set(resolved,request);
    return request;
  }

  function loadDuelVisualImage(path,manifestUrl){
    const resolved=asUrl(path,manifestUrl);
    if(imageCache.has(resolved))return imageCache.get(resolved);
    const request=new Promise((resolve,reject)=>{
      if(typeof Image==="undefined"){reject(new Error("Image unavailable for Duel visual asset"));return;}
      const image=new Image();
      image.decoding="async";
      image.onload=()=>resolve(image);
      image.onerror=()=>reject(new Error(`Failed to load Duel visual asset: ${resolved}`));
      image.src=resolved;
    }).catch(error=>{imageCache.delete(resolved);throw error;});
    imageCache.set(resolved,request);
    return request;
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

  function clearDuelVisualAssetCaches(){manifestCache.clear();imageCache.clear();}

  root.loadDuelVisualManifest=loadDuelVisualManifest;
  root.loadDuelVisualImage=loadDuelVisualImage;
  root.preloadDuelFighterVisual=preloadDuelFighterVisual;
  root.resolveDuelVisualAsset=resolveDuelVisualAsset;
  root.getDuelVisualAnimation=animationFor;
  root.clearDuelVisualAssetCaches=clearDuelVisualAssetCaches;
})();