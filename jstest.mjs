import fs from "fs";
const html=fs.readFileSync("site/index.html","utf8");
const src=html.split("<script>")[1].split("</script>")[0];
const fnSrc=src.split("// ---------- tabs")[0].replace("const $=id=>document.getElementById(id);","");
const m=new Function(fnSrc+";return {runCircuit,canon,sha256};")();
const demos=fs.readdirSync("site/batches").map(f=>JSON.parse(fs.readFileSync("site/batches/"+f)));
for(const d of demos){const r=await m.runCircuit(d.measured,d.required);console.log(d.batch,r.out.join(""),r.engine)}
let bad=0;for(let t=0;t<3000;t++){const M=[0,1,2,3].map(()=>Math.floor(Math.random()*256)),R=[0,1,2,3].map(()=>Math.floor(Math.random()*256));const {out}=await m.runCircuit(M,R);const e=M.map((x,i)=>+(x>=R[i]));e.push(+e.every(Boolean));if(out.join()!==e.join())bad++}
console.log("random mismatches",bad);
