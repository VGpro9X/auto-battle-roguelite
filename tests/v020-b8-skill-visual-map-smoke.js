const fs=require('fs'),vm=require('vm');
function assert(v,m){if(!v)throw new Error(m);}
const mapper=fs.readFileSync('js/duel-skill-visual-map-v3.js','utf8');
const vfx=fs.readFileSync('js/duel-vfx-v3.js','utf8');
const sync=fs.readFileSync('js/duel-ui-sync.js','utf8');
const allowed=new Set(['physical','projectile','fire','frost','lightning','poison','blood','defense','heal','control','summon','area','chain','time','soul']);
const root={
 DUEL_SKILL_KEYS:['fire','frost','barrier','echoShot','blackHole','orbit'],
 getDuelSkill:id=>({key:id,name:id,tags:{fire:['FIRE','PROJECTILE'],frost:['ICE','CONTROL'],barrier:['SHIELD','DEFENSE'],echoShot:['TIME','PROJECTILE'],blackHole:['CONTROL','AREA'],orbit:['SUMMON']}[id]||[]}),
 DUEL_SYNERGY_CATALOG:{thermalShock:{requires:{skills:['fire','frost']}},timeOrbit:{requires:{skills:['echoShot','orbit']}}},
 getDuelSynergy:id=>({id,name:id}),
 DUEL_EVOLUTION_CATALOG:{heavenfire:{base:'fire',requires:{tags:{FIRE:3,EXPLOSION:1}}},singularity:{base:'blackHole',requires:{tags:{CONTROL:3,AREA:2}}}},
 getDuelEvolution:id=>({id,name:id})
};root.globalThis=root;
vm.createContext(root);vm.runInContext(mapper,root);
const map=root.DUEL_VISUAL_MAP_V3;
assert(map.counts.skills===6&&map.counts.synergies===2&&map.counts.evolutions===2,'mock catalog counts incorrect');
for(const group of ['skills','synergies','evolutions'])for(const [id,p] of Object.entries(map[group])){assert(allowed.has(p.primary),`${group}.${id} invalid primary ${p.primary}`);if(p.secondary)assert(allowed.has(p.secondary),`${group}.${id} invalid secondary ${p.secondary}`);assert(p.families.length>0,`${group}.${id} has no families`);}
assert(map.skills.fire.primary==='fire','fire mapping changed');
assert(map.skills.barrier.primary==='defense','barrier mapping changed');
assert(map.skills.echoShot.primary==='time','echoShot mapping changed');
assert(map.skills.blackHole.primary==='control','blackHole mapping changed');
assert(map.synergies.thermalShock.families.includes('fire')&&map.synergies.thermalShock.families.includes('frost'),'synergy ingredient inheritance missing');
assert(map.evolutions.heavenfire.primary==='fire','evolution base/tag inheritance missing');
assert(vfx.includes('root.getDuelVisualProfileForEventV3(event)'),'V3 VFX does not consult B8 map');
assert(sync.includes("js/duel-skill-visual-map-v3.js?v=020-b8"),'B8 visual map not attached to bootstrap');
assert(sync.includes('window.__V020_RENDERER_V3_BOOTSTRAP__=prior.then'),'Duel bootstrap promise not extended for B8 map');
for(const forbidden of ['dealDamage(','spawnDuelProjectile(','fighter.hp-=','target.hp-='])assert(!mapper.includes(forbidden),'visual map must not own simulation: '+forbidden);
console.log('v020-b8-skill-visual-map-smoke: ok');
