import {ethers} from "ethers"; import fs from "fs";
const html=fs.readFileSync("site/index.html","utf8");const src=html.split("<script>")[1].split("</script>")[0].split("// ---------- tabs")[0].replace("const $=id=>document.getElementById(id);","");
const m=new Function(src+";return {encEval,decBytes,rpc,simulate,hexToBytes,pack};")();
const p=new ethers.JsonRpcProvider("https://rpc.xlayer.tech",196,{staticNetwork:true});
const I=new ethers.Interface(["function circuitInfo(uint256) view returns (uint32,uint32,uint32,uint32)","function netlist(uint256) view returns (bytes)"]);
const cpu="0xed3d6856b9187c25d5f51e2f85291d4362bcc61d"; // arcade chips, circuit 1 (94 NAND)
const c=new ethers.Contract(cpu,I,p);const [nIn,nOut,nState,g]=await c.circuitInfo(1);const nl=await c.netlist(1);
console.log({nIn,nOut,nState,g,len:(nl.length-2)/2});
let bad=0;for(let t=0;t<20;t++){const bits=Array.from({length:Number(nIn)},()=>Math.random()<.5?1:0);
 const res=await m.rpc("eth_call",[{to:cpu,data:m.encEval(1,m.pack(bits))},"latest"]);const ob=m.decBytes(res);
 const chain=[];for(let i=0;i<Number(nOut);i++)chain.push((ob[i>>3]>>(i&7))&1);
 const loc=m.simulate(m.hexToBytes(nl),Number(nIn),Number(nOut),bits); if(chain.join()!==loc.join())bad++}
console.log("chain vs local mismatches",bad);
