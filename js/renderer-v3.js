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
    return { ok: errors.length === 0, errors };
  }

  function validateArenaManifest(manifest) {
    const errors = [];
    if (!manifest || typeof manifest !== 'object') return { ok: false, errors: ['arena manifest missing'] };
    if (manifest.logicalWidth !== 1000 || manifest.logicalHeight !== 560 || manifest.floorY !== 475 || manifest.leftBound !== 54 || manifest.rightBound !== 946) errors.push('arena gameplay geometry changed');
    const declared = Array.isArray(manifest.requiredLayers) ? manifest.requiredLayers : [];
    for (const layer of REQUIRED_ARENA_LAYERS) if (!declared.includes(layer)) errors.push('missing arena layer contract: ' + layer);
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
      arenaManifest: null
    };

    async function loadJson(url) {
      const response = await fetch(url, { cache: 'no-cache' });
      if (!response.ok) throw new Error('HTTP ' + response.status + ' for ' + url);
      return response.json();
    }

    async function initialize() {
      if (!state.enabled) {
        state.reason = 'disabled';
        return snapshot();
      }
      try {
        const root = await loadJson(opts.rootManifest || 'assets/v020/manifest.json');
        const fighter = await loadJson('assets/v020/' + root.fighter.manifest);
        const arena = await loadJson('assets/v020/' + root.arena.manifest);
        const fighterCheck = validateFighterManifest(fighter);
        const arenaCheck = validateArenaManifest(arena);
        const errors = fighterCheck.errors.concat(arenaCheck.errors);
        if (errors.length) throw new Error(errors.join('; '));
        state.fighterManifest = fighter;
        state.arenaManifest = arena;
        state.ready = true;
        state.reason = 'ready';
      } catch (error) {
        state.ready = false;
        state.reason = error && error.message ? error.message : 'initialization-failed';
      }
      return snapshot();
    }

    function snapshot() {
      return { enabled: state.enabled, ready: state.ready, quality: state.quality, reason: state.reason };
    }

    function resolveFighterState(semanticState) {
      const key = REQUIRED_STATES.includes(semanticState) ? semanticState : 'idle';
      const entry = state.fighterManifest && state.fighterManifest.states ? state.fighterManifest.states[key] : null;
      return entry ? { renderer: 'v3', state: key, entry } : { renderer: 'v2', state: key, entry: null };
    }

    function resolveArenaLayer(layerId) {
      const layers = state.arenaManifest && Array.isArray(state.arenaManifest.layers) ? state.arenaManifest.layers : [];
      const entry = layers.find((layer) => layer && layer.id === layerId);
      return entry ? { renderer: 'v3', layer: layerId, entry } : { renderer: 'v2', layer: layerId, entry: null };
    }

    function setQuality(value) {
      state.quality = normalizeQuality(value);
      return state.quality;
    }

    return { initialize, snapshot, setQuality, resolveFighterState, resolveArenaLayer, validateFighterManifest, validateArenaManifest };
  }

  global.AutoBattleRendererV3 = { create: createRendererV3, validateFighterManifest, validateArenaManifest, REQUIRED_STATES: REQUIRED_STATES.slice(), REQUIRED_ANCHORS: REQUIRED_ANCHORS.slice(), REQUIRED_ARENA_LAYERS: REQUIRED_ARENA_LAYERS.slice() };
})(typeof window !== 'undefined' ? window : globalThis);
