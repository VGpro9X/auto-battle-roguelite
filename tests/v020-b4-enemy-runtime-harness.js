const fs=require('fs'),vm=require('vm');
function assert(v,m){if(!v)throw new Error(m);}
const source=fs.readFileSync('js/v020-enemy-presentation.js','utf8');
const calls=[];
class FakeImage{
  constructor(){this.complete=false;this.naturalWidth=0;this.width=0;}
  set src(value){this._src=value;this.complete=true;this.naturalWidth=128;this.width=128;if(this.onload)this.onload();}
  get src(){return this._src;}
}
const ctx={save(){calls.push('save')},restore(){calls.push('restore')},translate(){},rotate(){},beginPath(){},ellipse(){},fill(){},arc(){},stroke(){},drawImage(img){calls.push('draw:'+img.src)},filter:'none',globalAlpha:1,fillStyle:'',strokeStyle:'',lineWidth:1};
let fallbackCalls=0,statusCalls=0;
const root={
  ctx,state:{t:2},player:{x:100,y:100},Image:FakeImage,
  drawEnemySilhouetteV014(){fallbackCalls++},
  enemyArchetypeV014(enemy){return enemy.archetype},
  isEnemyAllied(enemy){return Boolean(enemy.allied)},
  drawEnemyStatusVisual(){statusCalls++}
};
root.window=root;root.globalThis=root;
const context=vm.createContext(root);context.Image=FakeImage;
vm.runInContext(source,context);

const expected={runner:'beast',hunter:'fallen',anchor:'construct',elite:'abyssal'};
for(const [archetype,family] of Object.entries(expected)){
  const enemy={x:20,y:30,r:archetype==='elite'?18:12,speed:48,hp:10,dmg:8,elite:archetype==='elite',dead:false,hit:0,archetype};
  const before=JSON.stringify(enemy);
  assert(context.enemyFamilyV020(enemy)===family,'wrong family mapping for '+archetype);
  context.drawEnemySilhouetteV014(enemy);
  assert(JSON.stringify(enemy)===before,'presentation mutated gameplay enemy for '+archetype);
}
assert(fallbackCalls===0,'ready V0.20 assets unexpectedly used V0.14 fallback');
assert(calls.filter(x=>x.startsWith('draw:')).length===4,'not all four families rendered');
assert(statusCalls===4,'status compatibility overlay missing');

const allied={x:0,y:0,r:12,speed:48,hp:10,dmg:8,elite:false,dead:false,hit:0,allied:true,archetype:'hunter'};
context.drawEnemySilhouetteV014(allied);
assert(statusCalls===5,'allied enemy lost status overlay');

const hit={x:0,y:0,r:12,speed:48,hp:10,dmg:8,elite:false,dead:false,hit:.05,archetype:'runner'};
context.drawEnemySilhouetteV014(hit);
assert(statusCalls===6,'hit enemy lost status overlay');

const status=context.getEnemyFamilyV020Status();
assert(status.loaded.length===4,'four family assets not preloaded');
assert(status.mapping.runner==='beast'&&status.mapping.elite==='abyssal','runtime mapping status invalid');

const missingRoot={ctx,state:{t:0},player:{x:0,y:0},drawEnemySilhouetteV014(){missingRoot.fallback=(missingRoot.fallback||0)+1},enemyArchetypeV014(){return 'runner'}};
missingRoot.window=missingRoot;missingRoot.globalThis=missingRoot;
const missingContext=vm.createContext(missingRoot);
vm.runInContext(source,missingContext);
missingContext.drawEnemySilhouetteV014({x:0,y:0,r:12,speed:48,hp:1,dmg:1,elite:false,dead:false,hit:0});
assert(missingRoot.fallback===1,'Image-unavailable path must fall back to V0.14');
console.log('v020-b4-enemy-runtime-harness: ok');
