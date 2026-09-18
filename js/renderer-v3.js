(function (global) {
  'use strict';

  const REQUIRED_STATES = ['idle','walk','run','dash','melee','ranged','cast','hit','block','knockback','knockdown','recover','ko'];
  const REQUIRED_ANCHORS = ['head','chest','leftHand','rightHand','feet','front','back','target'];
  const REQUIRED_ARENA_LAYERS = ['sky','far','mid','ambient','floor','foreground'];
  const QUALITY = new Set(['full','balanced','low']);

  function normalizeQuality(value) {
    const q = String(value || '').toLowerCase();
    return QUALITY.has(q) ? q : 'balanced';
  }

  function validateAnchorFrame(frame, width, height) {
    const errors = [];
    if (!frame || typeof frame !== 'object') return { ok: false, errors: ['anchor frame missing'] };
    const hasBounds=Number.isFinite(width)&&width>0&&Number.isFinite(height)&&height>0;
    for (const name of REQUIRED_ANCHORS) {
      const point = frame[name];
      if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.y)) {
        errors.push('invalid anchor: ' + name);
        continue;
      }
      if (hasBounds && (point.x < 0 || point.x > width || point.y < 0 || point.y > height)) errors.push('anchor out of bounds: ' + name);
    }
    return { ok: errors.length === 0, errors };
  }

  function mirrorAnchorFrame(frame, width) {
    if (!frame || typeof frame !== 'object' || !Number.isFinite(width)) return {};
    const mirrored={};
    for (const [name,point] of Object.entries(frame)) {
      mirrored[name]=point&&Number.isFinite(point.x)&&Number.isFinite(point.y)
        ? {x:width-point.x,y:point.y}
        : point;
    }
    return mirrored;
  }

  function validateFighterStateEntry(stateId, entry) {
    const errors = [];
    if (!REQUIRED_STATES.includes(stateId)) errors.push('unknown state: ' + stateId);
    if (!entry || typeof entry !== 'object') return { ok: false, errors: errors.concat(['state entry missing']) };
    if (entry.status !== 'production') errors.push('state not production');
    if (typeof entry.src !== 'string' || !entry.src.trim()) errors.push('state src missing');
    if (!Number.isInteger(entry.frameCount) || entry.frameCount <= 0) errors.push('invalid frameCount');
    if (!Number.isFinite(entry.fps) || entry.fps <= 0) errors.push('invalid fps');
    if (typeof entry.loop !== 'boolean') errors.push('loop flag missing');
    if (!Array.isArray(entry.anchors) || entry.anchors.length !== entry.frameCount) errors.push('anchor frame count mismatch');
    else entry.anchors.forEach((frame,index)=>{const check=validateAnchorFrame(frame);for(const error of check.errors)errors.push('frame '+index+': '+error);});
    return { ok: errors.length === 0, errors };
  }

  function validateFighterManifest(manifest) {
    const errors = [];
    if (!manifest || typeof manifest !== 'object') return { ok: false, errors: ['fighter manifest missing'] };
    if (manifest.id !== 'ash-wanderer') errors.push('unexpected fighter id');
    if (!Number.isFinite(manifest.frameWidth) || !Number.isFinite(manifest.frameHeight)) errors.push('invalid frame dimensions');
    if (!Number.isFinite(manifest.displayWorldWidth)) errors.push('invalid displayWorldWidth');
    const declaredStates = Array.isArray(manifest.requiredStates) ? manifest.requiredStates : [];
    const declaredAnchors = Array.isArray(manifest.requiredAnchors) ? manifest.requiredAnchors : [];
    for (const state of REQUIRED_STATES) if (!declaredStates.includes(state)) errors.push('missing required state contract: ' + state);
    for (const anchor of REQUIRED_ANCHORS) if (!declaredAnchors.includes(anchor)) errors.push('missing required anchor contract: ' + anchor);
    if (manifest.states && typeof manifest.states === 'object') {
      for (const [stateId,entry] of Object.entries(manifest.states)) {
        if (!entry) continue;
        if (entry.status === 'production') {
          const check = validateFighterStateEntry(stateId,entry);
          for (const error of check.errors) errors.push(stateId + ': ' + error);
        }
      }
    }
    return { ok: errors.length === 0, errors };
  }

  function validateArenaLayerEntry(layerId, entry) {
    const errors = [];
    if (!REQUIRED_ARENA_LAYERS.includes(layerId)) errors.push('unknown arena layer: ' + layerId);
    if (!entry || typeof entry !== 'object') return { ok:false, errors:errors.concat(['arena layer entry missing']) };
    if (entry.status !== 'production') errors.push('arena layer not production');
    if (typeof entry.src !== 'string' || !entry.src.trim()) errors.push('arena layer src missing');
    if (!Number.isFinite(entry.parallax) || entry.parallax <= 0) errors.push('invalid arena layer parallax');
    if (!Number.isFinite(entry.width) || entry.width <= 0 || !Number.isFinite(entry.height) || entry.height <= 0) errors.push('invalid arena layer dimensions');
    if (!Number.isFinite(entry.opacity) || entry.opacity < 0 || entry.opacity > 1) errors.push('invalid arena layer opacity');
    if (typeof entry.foreground !== 'boolean') errors.push('arena foreground flag missing');
    if (layerId === 'foreground' && entry.foreground !== true) errors.push('foreground layer must be foreground');
    if (layerId !== 'foreground' && entry.foreground !== false) errors.push(layerId + ' must not be foreground');
    return {ok:errors.length===0,errors};
  }

  function validateArenaManifest(manifest) {
    const errors = [];
    if (!manifest || typeof manifest !== 'object') return { ok: false, errors: ['arena manifest missing'] };
    if (manifest.logicalWidth !== 1000 || manifest.logicalHeight !== 560 || manifest.floorY !== 475 || manifest.leftBound !== 54 || manifest.rightBound !== 946) errors.push('arena gameplay geometry changed');
    const declared = Array.isArray(manifest.requiredLayers) ? manifest.requiredLayers : [];
    for (const layer of REQUIRED_ARENA_LAYERS) if (!declared.includes(layer)) errors.push('missing arena layer contract: ' + layer);
    const layers = Array.isArray(manifest.layers) ? manifest.layers : [];
    if (manifest.status === 'production') {
      for (const layerId of REQUIRED_ARENA_LAYERS) {
        const entry = layers.find(layer=>layer&&layer.id===layerId);
        const check = validateArenaLayerEntry(layerId,entry);
        for (const error of check.errors) errors.push(layerId + ': ' + error);
      }
      const uniqueIds = new Set(layers.map(layer=>layer&&layer.id).filter(Boolean));
      if (uniqueIds.size !== layers.length) errors.push('duplicate arena layer id');
    }
    return { ok: errors.length === 0, errors };
  }

  function createRendererV3(options) {
    const opts = options || {};
    const state = {
      enabled: opts.enabled !== false,
      quality: normalizeQuality(opts.quality),
      ready: false,
      reason: 'not-initialized',
      fighterManifest: null,
      arenaManifest: null,
      arenaReady: false,
      supplementalLoaded: false
    };

    async function loadJson(url) {
      const response = await fetch(url, { cache: 'no-cache' });
      if (!response.ok) throw new Error('HTTP ' + response.status + ' for ' + url);
      return response.json();
    }

    async function mergeAshWandererSupplement(fighter) {
      if (!fighter || fighter.id !== 'ash-wanderer') return fighter;
      const url = opts.fighterSupplement || 'assets/v020/fighters/ash-wanderer/b3-final-states.json';
      try {
        const extra = await loadJson(url);
        if (extra && extra.states && typeof extra.states === 'object') {
          fighter.states = Object.assign({}, fighter.states || {}, extra.states);
          state.supplementalLoaded = true;
        }
      } catch (_) {
        state.supplementalLoaded = false;
      }
      return fighter;
    }

    async function initialize() {
      if (!state.enabled) {
        state.reason = 'disabled';
        return snapshot();
      }
      try {
        const root = await loadJson(opts.rootManifest || 'assets/v020/manifest.json');
        const fighter = await loadJson('assets/v020/' + root.fighter.manifest);
        await mergeAshWandererSupplement(fighter);
        const arena = await loadJson('assets/v020/' + root.arena.manifest);
        const fighterCheck = validateFighterManifest(fighter);
        const arenaCheck = validateArenaManifest(arena);
        const errors = fighterCheck.errors.concat(arenaCheck.errors);
        if (errors.length) throw new Error(errors.join('; '));
        state.fighterManifest = fighter;
        state.arenaManifest = arena;
        state.arenaReady = arena.status === 'production' && arenaCheck.ok;
        state.ready = true;
        state.reason = 'ready';
      } catch (error) {
        state.ready = false;
        state.arenaReady = false;
        state.reason = error && error.message ? error.message : 'initialization-failed';
      }
      return snapshot();
    }

    function snapshot() {
      return { enabled: state.enabled, ready: state.ready, arenaReady:state.arenaReady, quality: state.quality, reason: state.reason, supplementalLoaded: state.supplementalLoaded };
    }

    function resolveFighterState(semanticState) {
      const key = REQUIRED_STATES.includes(semanticState) ? semanticState : 'idle';
      const entry = state.fighterManifest && state.fighterManifest.states ? state.fighterManifest.states[key] : null;
      const check = entry ? validateFighterStateEntry(key,entry) : { ok:false, errors:['state missing'] };
      return check.ok ? { renderer: 'v3', state: key, entry } : { renderer: 'v2', state: key, entry: null, reason: check.errors.join('; ') };
    }

    function resolveArena() {
      if (!state.ready || !state.arenaReady || !state.arenaManifest) return {renderer:'v2',entry:null,reason:'arena incomplete'};
      const check=validateArenaManifest(state.arenaManifest);
      if(!check.ok)return{renderer:'v2',entry:null,reason:check.errors.join('; ')};
      return{renderer:'v3',entry:state.arenaManifest,layers:REQUIRED_ARENA_LAYERS.map(id=>state.arenaManifest.layers.find(layer=>layer.id===id))};
    }

    function resolveArenaLayer(layerId) {
      const arena=resolveArena();
      if(arena.renderer!=='v3')return{renderer:'v2',layer:layerId,entry:null,reason:arena.reason};
      const entry=arena.layers.find(layer=>layer&&layer.id===layerId);
      return entry ? { renderer: 'v3', layer: layerId, entry } : { renderer: 'v2', layer: layerId, entry: null, reason:'arena complete-set violation' };
    }

    function setQuality(value) {
      state.quality = normalizeQuality(value);
      return state.quality;
    }

    return { initialize, snapshot, setQuality, resolveFighterState, resolveArena, resolveArenaLayer, validateFighterManifest, validateArenaManifest, validateArenaLayerEntry, validateFighterStateEntry };
  }

  global.AutoBattleRendererV3 = { create: createRendererV3, validateAnchorFrame, mirrorAnchorFrame, validateFighterManifest, validateArenaManifest, validateArenaLayerEntry, validateFighterStateEntry, REQUIRED_STATES: REQUIRED_STATES.slice(), REQUIRED_ANCHORS: REQUIRED_ANCHORS.slice(), REQUIRED_ARENA_LAYERS: REQUIRED_ARENA_LAYERS.slice() };
})(typeof window !== 'undefined' ? window : globalThis);