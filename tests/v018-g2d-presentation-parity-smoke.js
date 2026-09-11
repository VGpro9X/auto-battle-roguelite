const fs=require("fs");
const path=require("path");
const assert=require("assert");

const root=path.resolve(__dirname,"..");
const source=fs.readFileSync(path.join(root,"js/duel-renderer-v2.js"),"utf8");

assert.match(source,/function drawAssetShadow\(/,"V2 asset fighters must keep floor shadow");
assert.match(source,/function drawSideIdentity\(/,"V2 must differentiate player and opponent visually");
assert.match(source,/fighter\.side==="player"\?"#38bdf8":"#fb7185"/,"side identity accents must be deterministic");
assert.match(source,/function drawAssetAttachments\(/,"V2 attachment pass missing");
assert.match(source,/fighter\.shield>0/,"shield attachment missing");
assert.match(source,/getDuelSkillRank\(fighter\.build,"frost"\)/,"frost attachment missing");
assert.match(source,/getDuelSkillRank\(fighter\.build,"orbit"\)/,"orbit attachment missing");
assert.match(source,/const chest=getAnchor\(fighter,"chest"\),feet=getAnchor\(fighter,"feet"\)/,"attachments must follow V2 anchors");
assert.match(source,/drawAssetFighter\(round\.fighters\.player,pVisual,tr\);drawAssetAttachments\(round\.fighters\.player,round,tr\)/,"player attachment ordering missing");
assert.match(source,/drawAssetFighter\(round\.fighters\.opponent,oVisual,tr\);drawAssetAttachments\(round\.fighters\.opponent,round,tr\)/,"opponent attachment ordering missing");

console.log("V0.18 G2D V2 presentation parity: PASS");