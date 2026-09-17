const fs=require('fs'),vm=require('vm');
function assert(v,m){if(!v)throw new Error(m);}
const source=fs.readFileSync('js/duel-vfx-v3.js','utf8');
const bridge=fs.readFileSync('js/duel-renderer-v3-bridge.js','utf8');
const html=fs.readFileSync('index.html','utf8');
const sandbox={globalThis:{}};sandbox.globalThis.globalThis=sandbox.globalThis;vm.createContext(sandbox);vm.runInContext(source,sandbox);
const root=sandbox.globalThis;
const expected=['physical','projectile','fire','frost','lightning','poison','blood','defense','heal','control','summon','area','chain','time','soul'];
assert(JSON.stringify(Array.from(root.DUEL_VFX_V3_FAMILIES))===JSON.stringify(expected),'15-family V3 vocabulary changed');
const vfx=root.createDuelVfxV3({quality:'balanced',reducedMotion:false});
const samples=[
 {type:'hit',source:'normal',amount:10},
 {type:'projectile_spawn',source:'arrow'},
 {type:'hit',source:'fire'},
 {type:'status',status:'frost'},
 {type:'hit',source:'lightning'},
 {type:'status',status:'poison'},
 {type:'hit',source:'bloodDebt'},
 {type:'shield_gain',source:'barrier'},
 {type:'heal',source:'regen'},
 {type:'dodge',source:'evasion'},
 {type:'orbit_hit',source:'orbit'},
 {type:'area',source:'explosion'},
 {type:'hit',source:'chainLightning'},
 {type:'cast',source:'timeEcho'},
 {type:'ko',source:'death'}
];
const families=samples.map(e=>vfx.familyForEvent(e));
for(const family of expected)assert(families.includes(family),'missing semantic family '+family);
vfx.consume(samples);assert(vfx.getStatus().active===samples.length,'sample events not consumed');
for(let i=0;i<100;i++)vfx.consume([{type:'hit',source:'normal',amount:1}]);
let status=vfx.getStatus();assert(status.active<=72&&status.limit===72&&status.dropped>0,'balanced transient budget failed');
vfx.update(2);assert(vfx.getStatus().active===0,'VFX lifecycle did not expire');
assert(bridge.includes("const owned=list.filter(event=>coreVfx.ownsEvent(event)),legacy=list.filter(event=>!coreVfx.ownsEvent(event))"),'bridge event ownership split missing');
assert(bridge.includes('fallback.consume(legacy)'),'V2 fallback does not receive legacy-only base events');
assert(bridge.includes('fallback.tierVfx?.consume?.(owned)'),'tier overlays do not retain V3-owned events');
assert(bridge.includes('fallback.camera?.consume?.(owned)'),'camera does not retain V3-owned events');
assert(bridge.includes('coreVfx?.render?.(ctx,tr,match,getAnchor)'),'V3 core VFX render pass missing');
assert(html.includes("'js/renderer-v3.js?v=020-b7','js/duel-vfx-v3.js?v=020-b7','js/duel-renderer-v3-bridge.js?v=020-b7'"),'B7 bootstrap load order invalid');
for(const forbidden of ['duelDealDamage(','spawnDuelProjectile(','target.hp-=','target.x=','round.phase ='])assert(!source.includes(forbidden),'V3 VFX must not own simulation truth: '+forbidden);
console.log('v020-b7-core-vfx-runtime-smoke: ok');
