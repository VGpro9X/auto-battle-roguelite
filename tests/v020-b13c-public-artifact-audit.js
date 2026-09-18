const fs=require("fs"),path=require("path"),assert=require("assert");
const root=path.resolve(__dirname,"..");
const roots=["css","js","assets"];
const files=["index.html"];
function walk(rel){
  for(const entry of fs.readdirSync(path.join(root,rel),{withFileTypes:true})){
    const next=path.posix.join(rel,entry.name);
    if(entry.isDirectory())walk(next); else files.push(next);
  }
}
for(const dir of roots)walk(dir);
let total=0,max={path:"",size:0};
for(const rel of files){
  const stat=fs.statSync(path.join(root,rel));
  total+=stat.size;
  if(stat.size>max.size)max={path:rel,size:stat.size};
}
assert(total<1.5*1024*1024,"public artifact budget exceeded 1.5 MiB: "+total);
assert(max.size<128*1024,"single public asset unexpectedly large: "+max.path+" "+max.size);

const html=fs.readFileSync(path.join(root,"index.html"),"utf8");
const refs=[...html.matchAll(/(?:src|href)=["']([^"'#?]+)(?:\?[^"']*)?["']/g)].map(m=>m[1]).filter(x=>!/^https?:|^data:/.test(x));
for(const ref of refs)assert(fs.existsSync(path.join(root,ref)),"public HTML reference missing: "+ref);
for(const source of ["index.html","js/duel-renderer.js","js/v020-enemy-presentation.js"]){
  const text=fs.readFileSync(path.join(root,source),"utf8");
  const jsRefs=[...text.matchAll(/(?:["'`])(js\/[A-Za-z0-9._/-]+\.js)(?:\?[^"'\`]*)?(?:["'`])/g)].map(m=>m[1]);
  for(const ref of jsRefs)assert(fs.existsSync(path.join(root,ref)),source+" references missing runtime script "+ref);
}
assert(/Auto Battle Roguelite V0\.(?:19|20)/.test(html),"public label must be V0.19 candidate or V0.20 release");
assert(!files.some(x=>x.startsWith("tests/")||x.startsWith(".github/")),"test/workflow files leaked into public roots");
console.log("v020-b13c-public-artifact-audit: ok · files="+files.length+" bytes="+total+" max="+max.path+":"+max.size);